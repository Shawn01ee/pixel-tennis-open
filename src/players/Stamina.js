// Stamina — how tired a player is, and what it costs them. Every number below comes from a measurement, and
// docs/stamina/README.md shows where each one comes from and how it was turned into the game's value.
// Three stores, because tennis fatigue shows up on three different time scales:
//   legs    match-long, filled by running in play: the strength and stiffness the legs lose over a long match
//   arm     match-long, filled by strokes: the racket arm's output, seen in serve speed
//   breath  seconds to minutes, filled by running harder than the body can keep up (the W′ of the critical
//           power model), emptied again between points: what a long rally takes out of a player
// legs and arm are 1 at the end of an average five-set match; breath is 1 at exhaustion (W′ spent).
class Stamina{
  // critical power, W/kg: the second ventilatory threshold of competitive tennis players, 49.4 mL/kg/min (84% of a
  // VO2max of 58.0; Baiget 2015) at 20.9 J per mL of oxygen. CP sits at 70–90% of VO2max (Jones & Vanhatalo 2017)
  static CP=49.4*20.9/60;
  // W′, J/kg: D′ of 328 m above critical speed (Jones & Vanhatalo 2017, Table 1) at 3.6 J/kg per metre of running
  static WP=328*3.6;
  // W′ comes back in two phases: a fast one (τ 21.5 s) and a slow one (τ 388 s), half each after exhaustion
  // (Chorley 2022). After a partial depletion the slow phase does not show (Lievens 2024), and ordinary singles play
  // keeps blood lactate at 1–2 mmol/L (Armstrong 2023) with 97% of play below VT2 (Baiget 2015): short efforts come
  // back fast. So the slow share of what is spent grows with how deep the player already is, from none when fresh
  // to Chorley's half at exhaustion
  static FAST={tau:21.5};static SLOW={share:.4933,tau:388};
  // the work (J/kg of running, sum of stroke costs) of an average five-set match in this game, so that legs and arm
  // read 1 when one ends; measured by tools/stamina.js
  static LEGS=58800;static ARM=1120;
  // a stroke costs the arm in proportion to the racket's kinetic energy, so to the square of the ball's speed; a
  // 30 m/s (108 km/h) groundstroke is 1
  static V_REF=30;
  // endurance: aerobic fitness, which sets both how fast W′ comes back and how hard ordinary play is for a player
  // (Caen 2021; Lievens 2024; Baiget 2015). One standard deviation of tennis players' VO2max is 4.6 of 58.0 mL/kg/min
  // (Baiget 2015): a player one SD fitter fills the long-term stores 7.9% slower and gets his breath back 7.9% faster
  static SD=4.6/58.0;
  // the share each store takes off at 1 (see docs/stamina for the source of each)
  static EFFECT={
    speed:   {legs:.031,breath:.095},   // sprint +3.1% slower after a match (Girard 2014); change of direction +10.6% slower when spent (Bilić 2023)
    accel:   {legs:.080,breath:.095},   // strength and leg stiffness −6.5…−9% (Girard 2006, 2014; Poignard 2023); Bilić 2023 again
    serveV:  {arm:.0143},               // first-serve speed set 1 → 5 in Grand Slam five-setters (Martin 2019, Cui 2020, Maquirriain 2016)
    pace:    {arm:.0143},               // the same share off groundstrokes: no match data of its own
    serveErr:{breath:.30},              // serve accuracy −30% (Davey 2002) and −33% (Bilić 2023) when spent
    err:     {breath:1.0},              // groundstroke accuracy −69% at exhaustion (Davey 2002): twice the spread
    walk:    {legs:.105},               // time between points 20.9 s in set 1, 23.1 s in set 5 (Carboch 2018)
  };
  constructor(st={}){this.end=st.end??1;this.legs=0;this.arm=0;this.bf=0;this.bs=0;this.dist=0;this.work=0;this.cost=0;}
  get breath(){return Math.min(1,this.bf+this.bs);}
  // metabolic power of running at speed v (m/s) with forward acceleration a (m/s²), W/kg: the energy cost per metre
  // on the slope the acceleration is equivalent to, a/g (Minetti's polynomial, 3.6 J/kg/m on the flat), times the
  // equivalent mass (di Prampero 2005; Osgnach 2010)
  static power(v,a){
    const es=clamp(a/9.81,-.45,.45),em=Math.sqrt(1+es*es),ec=((((155.4*es-30.4)*es-43.3)*es+46.3)*es+19.5)*es+3.6;
    return Math.max(0,ec*em*v);
  }
  // a step of running in play: speed v, acceleration along the run at and across it an (m/s²)
  run(v,at,an,dt){
    const P=Stamina.power(v,at+.5*Math.abs(an));
    this.dist+=v*dt;this.work+=P*dt;this.legs+=P*dt/(Stamina.LEGS*this.end);
    if(P>Stamina.CP){const B=this.bf+this.bs;if(B<1){const d=(P-Stamina.CP)*dt/Stamina.WP,slow=Stamina.SLOW.share*B;this.bf+=d*(1-slow);this.bs+=d*slow;}}
    // below CP, W′ comes back the slower the closer the effort is to CP (Skiba 2012; Chorley 2023)
    else this.recover(dt*(Stamina.CP-P)/Stamina.CP);
  }
  recover(t){const e=this.end;this.bf*=Math.exp(-t*e/Stamina.FAST.tau);this.bs*=Math.exp(-t*e/Stamina.SLOW.tau);}
  // a stroke that sends the ball off at v m/s; k: the share of it the arm feels (a perfectly timed, clean strike: half)
  stroke(v,k=1){const c=(v/Stamina.V_REF)**2*k;this.cost+=c;this.arm+=c/(Stamina.ARM*this.end);}
  // rest, in real seconds: between points (25 s), at a changeover (90 s), between sets (120 s). Only the breath comes
  // back: the long-match declines the legs and arm stand for were measured with the changeovers already in them
  rest(sec){this.recover(sec);}
  // what a store costs: in proportion, up to half as much again beyond an average five-setter
  k(name){const E=Stamina.EFFECT[name];return(E.legs||0)*Math.min(1.5,this.legs)+(E.arm||0)*Math.min(1.5,this.arm)+(E.breath||0)*this.breath;}
  get speed(){return 1-this.k('speed');}
  get accel(){return 1-this.k('accel');}
  get serveV(){return 1-this.k('serveV');}
  get pace(){return 1-this.k('pace');}
  get serveErr(){return 1+this.k('serveErr');}
  get err(){return 1+this.k('err');}
  get walk(){return 1-this.k('walk');}
  // for the scoreboard: half the gauge is the match-long reserve (legs and arm alike), half is breath. At the end of
  // an average five-setter, with breath recovered, it reads 50%
  get energy(){return clamp(1-.25*Math.min(2,this.legs)-.25*Math.min(2,this.arm)-.5*this.breath,0,1);}
}
