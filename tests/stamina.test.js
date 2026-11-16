// Stamina: each constant against the measurement it comes from (docs/stamina/README.md), and a set played through.
// Run: node tests/stamina.test.js
const{loadSim}=require('./load');
const{Stamina,Locomotion,Match,ROSTER,MatchFormat}=loadSim(['Stamina','Locomotion','Match','ROSTER','MatchFormat']);
let failed=0;const check=(ok,msg)=>{console.log((ok?'PASS  ':'FAIL  ')+msg);if(!ok)failed++;};
const near=(a,b,t)=>Math.abs(a-b)<=t,pc=x=>(x*100).toFixed(1)+'%';

// the cost of running (di Prampero 2005): 3.6 J/kg per metre on the flat, far more speeding up
const flat=Stamina.power(5,0);
check(near(flat,18,.01),`running at 5 m/s on the flat costs 3.6 J/kg/m: ${flat.toFixed(2)} W/kg`);
check(Stamina.power(5,4)>4*flat,`accelerating at 4 m/s² costs over four times as much: ${Stamina.power(5,4).toFixed(1)} W/kg`);
check(Stamina.power(5,-2)<.6*flat,`easing off at 2 m/s² costs less, as running downhill does: ${Stamina.power(5,-2).toFixed(1)} W/kg`);
check(Stamina.power(0,10)===0,'standing still costs nothing here');

// the critical power model's constants
check(near(Stamina.CP,17.2,.05),`CP ${Stamina.CP.toFixed(2)} W/kg = VT2 49.4 mL/kg/min × 20.9 J/mL (Baiget 2015)`);
check(near(Stamina.CP/(58.0*20.9/60),.85,.02),`CP is ${pc(Stamina.CP/(58.0*20.9/60))} of VO2max, inside 70–90% (Jones & Vanhatalo 2017)`);
check(near(Stamina.WP,1181,1),`W′ ${Stamina.WP.toFixed(0)} J/kg = D′ 328 m × 3.6 J/kg/m (Jones & Vanhatalo 2017)`);

// fresh: no effect at all
const s0=new Stamina();
check(['speed','accel','serveV','pace','serveErr','err','walk'].every(k=>s0[k]===1)&&s0.energy===1,'a fresh player is exactly as rated');

// breath: filled above CP only, given back in two phases between points (Chorley 2022)
const a=new Stamina();for(let i=0;i<120;i++)a.run(4,0,0,1/120);
check(a.breath===0,'running at 4 m/s on the flat (14.4 W/kg, below CP) does not touch the breath');
for(let i=0;i<600;i++)a.run(6,3,0,1/120);
const b0=a.breath,f0=a.bf,s0b=a.bs;a.rest(25);const back=1-a.breath/b0,want=1-(f0*Math.exp(-25/21.5)+s0b*Math.exp(-25/388))/b0;
check(b0>0&&near(back,want,1e-9),`25 s between points gives back ${pc(back)} of the breath (fast part τ 21.5 s, slow part τ 388 s, Chorley 2022)`);
// the slow share grows with depth: a short effort from fresh comes back fast; at exhaustion it is Chorley's half
const fr=new Stamina();fr.run(6,3,0,1/120);const deep=new Stamina();deep.bf=.5;deep.bs=.45;const d0=deep.bs;deep.run(6,3,0,1/120);
check(fr.bs/(fr.bf+fr.bs)<.001&&near((deep.bs-d0)/((deep.bf-.5)+(deep.bs-d0)),.4933*.95,1e-6),`slow share of a new deficit: ${pc(fr.bs/(fr.bf+fr.bs))} when fresh, ${pc((deep.bs-d0)/((deep.bf-.5)+(deep.bs-d0)))} at 95% spent`);
const l0=a.legs,r0=a.arm;a.rest(120);check(a.legs===l0&&a.arm===r0,'rest gives back breath only: the measured match-long declines already include the changeovers');

// endurance: one SD of aerobic fitness (Baiget 2015) fills the stores 7.9% slower and gives breath back 7.9% faster
const avg=new Stamina(),fit=new Stamina({end:1+Stamina.SD});for(const z of[avg,fit]){for(let i=0;i<600;i++)z.run(6,3,0,1/120);z.stroke(40);}
check(near(avg.legs/fit.legs,1+Stamina.SD,1e-9)&&near(avg.arm/fit.arm,1+Stamina.SD,1e-9),`a player one SD fitter (VO2max 4.6 of 58.0 mL/kg/min) fills legs and arm ${pc(Stamina.SD)} slower`);
const fb=fit.breath,ab=avg.breath;fit.rest(25);avg.rest(25);check(fit.breath/fb<avg.breath/ab,`and gets more of his breath back in 25 s: ${pc(1-fit.breath/fb)} against ${pc(1-avg.breath/ab)}`);
const B=ROSTER.filter(p=>p.end>1).map(p=>p.short).sort().join(', ');check(B==='Alcaraz, Borg, Djokovic',`fitter than average: ${B} (the three with an ATP-published five-set record of note)`);
check(ROSTER.find(p=>p.short==='Borg').ratings.stamina===90&&ROSTER.find(p=>p.short==='Nadal').ratings.stamina===75,'card: Stamina 90 one SD up, 75 for the field');
// perfect timing: the clean strike fatigue does not reach, at half the cost to the arm
const T=Match.TIMING;check(T.perfect.fat===0&&T.perfect.arm===.5&&T.good.fat===.5&&T.late.fat===1,'perfect timing: no fatigue in the shot and half the arm cost; good: half the fatigue');
const h=new Stamina();h.stroke(30,.5);check(h.cost===.5,'a perfectly timed 108 km/h stroke costs the arm 0.5');
// a stroke costs the arm in proportion to the square of the ball's speed
const c=new Stamina();c.stroke(30);const c1=c.cost;c.stroke(60);
check(c1===1&&c.cost===5,`a 108 km/h stroke costs 1, a 216 km/h serve 4 more (kinetic energy ∝ v²)`);

// at the end of an average five-set match (legs and arm at 1) the declines are the measured ones
const t=new Stamina();t.legs=1;t.arm=1;
check(near(1-t.speed,.031,1e-9),`top speed −${pc(1-t.speed)} (sprint +3.1% slower after a match, Girard 2014)`);
check(near(1-t.accel,.080,1e-9),`first step and braking −${pc(1-t.accel)} (mean of −9, −9, −7.7, −6.5%: Girard 2006, 2014; Poignard 2023)`);
check(near(1-t.serveV,.0143,1e-9),`first-serve speed −${pc(1-t.serveV)} (Grand Slam five-setters, set 1 → 5: Martin 2019, Cui 2020, Maquirriain 2016)`);
check(t.serveErr===1,'first serves in unchanged (59.5→61.1%, 62→64%, 63.1→62.3% in the same three datasets)');
check(t.err===1,'groundstroke errors unchanged by the long-term stores (no change in error ratios across sets, Cui 2020)');
check(near(1-t.walk,.105,1e-9),`walking back −${pc(1-t.walk)} (time between points 20.91 s in set 1, 23.11 s in set 5, Carboch 2018)`);

// at exhaustion (breath at 1)
const x=new Stamina();x.bf=.5;x.bs=.5;
check(near(x.err,2,1e-9),`groundstroke spread ×${x.err.toFixed(2)} (accuracy −69% at exhaustion, Davey 2002)`);
check(near(x.serveErr,1.3,1e-9),`serve spread ×${x.serveErr.toFixed(2)} (serve accuracy −30%, Davey 2002; −33%, Bilić 2023)`);
check(near(1-x.speed,.095,1e-9),`speed −${pc(1-x.speed)} (change of direction 11.75 → 12.99 s, Bilić 2023)`);
// the Gaussian conversion behind ×2: a target hit with probability p0 at spread σ, 69% less often at spread kσ
for(const p0 of[.3,.5,.6]){const k=Math.sqrt(Math.log(1-p0)/Math.log(1-p0*.31));check(k>1.85&&k<2.15,`  hit rate ${p0} → ${(p0*.31).toFixed(3)} needs ×${k.toFixed(2)} spread`);}

// a tired runner takes longer to get there
const L=Locomotion.forProfile(ROSTER[0]),t0=L.timeTo(6);L.scale(t.speed,t.accel);const t1=L.timeTo(6);L.scale(1,1);
check(t1>t0&&L.timeTo(6)===t0,`six metres: ${t0.toFixed(3)} s fresh, ${t1.toFixed(3)} s at the end of a five-setter, back to ${L.timeTo(6).toFixed(3)} s`);

// a whole set: both players tire, and run about what tour players run
const m=new Match({a:ROSTER[1],b:ROSTER[2],format:MatchFormat.get('one')});let n=0;
while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&n<150*60*120){m.tick();n++;m.events.length=0;}
const np=m.players[0].ms.pts+m.players[1].ms.pts;
for(const P of m.players){const S=P.sta;
  check(S.legs>0&&S.arm>0&&S.energy<1&&S.energy>.5,`${P.short} after one set (${np} points): energy ${Math.round(S.energy*100)}%, legs ${S.legs.toFixed(2)}, arm ${S.arm.toFixed(2)}`);
  // real players run 6.46 m (Hawk-Eye, Armstrong 2024) to 10.7 m (official statistics, Cui 2020) a point; the game's run
  // more (docs/stamina, Limits), and this keeps it within half as much again as the higher figure
  check(S.dist/np>5.77&&S.dist/np<1.5*10.7,`${P.short}: ${(S.dist/np).toFixed(1)} m a point (real: 6.46–10.7 m)`);}

console.log(failed?`\n${failed} stamina check(s) failed`:'\nall stamina checks passed');
process.exitCode=failed?1:0;
