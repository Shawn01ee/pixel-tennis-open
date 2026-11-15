// Stamina — how tired a player is, and what it costs them: speed, first step, accuracy, pace and serve
// Three stores, because the research finds three different things going on (docs/stamina/README.md):
//   legs  long-term, filled by running. Over a three-hour match the legs lose about 9% of their strength and
//         stiffness and sprints slow by 2–3% (Girard 2006, 2014; Gescheit 2015): top speed and first step fall.
//   arm   long-term, filled by strokes, the serve most. Serve speed falls by up to 4% in long matches in the lab
//         (Martin 2016, Hornery 2007) but barely at all in Wimbledon five-setters (Maquirriain 2016), so the
//         serve loses little; groundstroke pace and accuracy lose more (Hornery 2007, Pereira 2016).
//   breath short-term, filled by hard running above what the body can keep up (a W′ balance, as in Skiba 2012),
//         emptied again between points: the late shots of a long rally and the point after it are the loose ones
//         (accuracy falls 69% at the point of exhaustion, Davey 2002).
// Running cost is the metabolic power of accelerated running (di Prampero 2005, Osgnach 2010): running while
// speeding up costs what running uphill would, at the slope a forward acceleration a is equivalent to, a/g.
class Stamina{
  // CP W/kg: critical metabolic power, what can be held without running into the breath store (about 85% of a
  // tour player's aerobic maximum). WP J/kg: the breath store above it. LEGS J/kg, ARM strokes: the long-term
  // capacity of an average-endurance player, calibrated so a 260-point five-setter ends near 0.8 in both (see
  // docs/stamina). TAU_B s: the breath comes back with this time constant (phosphocreatine resynthesis, ~30–45 s).
  static CP=16;static WP=600;static LEGS=48000;static ARM=940;static TAU_B=40;
  // seated at a changeover the long-term stores come back a little: about half a percent a minute
  static SEAT=1/12000;
  // what each store costs at full (1): the declines measured at the end of a long match
  static EFFECT={
    speed:{legs:.03,breath:.06},        // top speed: repeated-sprint time +2.3% mid-match, +3.1% after (Girard 2014)
    accel:{legs:.08,breath:.10},        // first step, braking, cutting: strength −9%, leg stiffness −6.5…9% (Girard 2006, 2014)
    serveV:{arm:.025},                  // serve speed: −0.5% (Maquirriain 2016) to −3.7% (Martin 2016)
    serveErr:{arm:.08},                 // first serves in 63.1% → 62.3%, double faults unchanged (Maquirriain 2016)
    pace:{arm:.03,breath:.03},          // groundstroke speed falls (Hornery 2007)
    err:{legs:.10,arm:.15,breath:.35},  // forehand proficiency 75.2% → 65.5% from set 1 to set 2 (Pereira 2016); −69% at exhaustion (Davey 2002)
  };
  constructor(st,carry=0){this.end=st.end??1;this.legs=carry;this.arm=carry;this.breath=0;this.dist=0;this.work=0;}
  // metabolic power of running at speed v (m/s) with forward acceleration a (m/s²), in W/kg: the energy cost
  // per metre on the equivalent slope (Minetti's polynomial, 3.6 J/kg/m on the flat) times the equivalent mass
  static power(v,a){
    const es=clamp(a/9.81,-.45,.45),em=Math.sqrt(1+es*es),ec=((((155.4*es-30.4)*es-43.3)*es+46.3)*es+19.5)*es+3.6;
    return Math.max(0,ec*em*v);
  }
  // a step of running in play: speed v, acceleration along the run at and across it an (m/s²)
  run(v,at,an,dt){
    const P=Stamina.power(v,at+.5*Math.abs(an)),e=this.end;
    this.dist+=v*dt;this.work+=P*dt;
    this.legs+=P*dt/(Stamina.LEGS*e);
    if(P>Stamina.CP)this.breath=Math.min(1.2,this.breath+(P-Stamina.CP)*dt/(Stamina.WP*e));
    else this.breath*=Math.exp(-dt*e/Stamina.TAU_B);
  }
  // a stroke: a groundstroke or volley is 1, the serve 2.5 (the most demanding stroke on the shoulder)
  stroke(k=1){this.arm+=k/(Stamina.ARM*this.end);}
  // rest of so many seconds of real time: between points (25 s), at a changeover (90 s), between sets (120 s).
  // The breath comes back quicker the fitter the player; the long-term stores only while seated
  rest(sec,seated=false){
    this.breath*=Math.exp(-sec*this.end/Stamina.TAU_B);
    if(seated){const r=sec*Stamina.SEAT*this.end;this.legs=Math.max(0,this.legs-r);this.arm=Math.max(0,this.arm-r);}
  }
  k(name){const E=Stamina.EFFECT[name];return(E.legs||0)*this.legs+(E.arm||0)*this.arm+(E.breath||0)*Math.min(1,this.breath);}
  get speed(){return 1-this.k('speed');}
  get accel(){return 1-this.k('accel');}
  get serveV(){return 1-this.k('serveV');}
  get serveErr(){return 1+this.k('serveErr');}
  get pace(){return 1-this.k('pace');}
  get err(){return 1+this.k('err');}
  // tired feet stop pattering; tired players walk back slower between points
  get footwork(){return clamp(1-.5*this.legs-.3*this.breath,.3,1);}
  get walk(){return clamp(1-.2*this.legs,.75,1);}
  // what is left, for the scoreboard: 1 fresh, 0 spent
  get energy(){return clamp(1-(.55*this.legs+.3*this.arm+.25*Math.min(1,this.breath)),0,1);}
  // carried into the next round: most of it is gone after a night's sleep (Girard 2014: all markers back within
  // 24 h), a little stays after a long one (Gescheit 2015: sprint and jump still down on the following days)
  get carry(){return clamp(.1*(this.legs+this.arm)/2,0,.15);}
}
