// Stamina: the running cost model, the three stores, what they do to a player, and that a match wears players down
// within the ranges measured in real long matches. Run: node tests/stamina.test.js
const{loadSim}=require('./load');
const{Stamina,Locomotion,Match,ROSTER,MatchFormat,Tournament}=loadSim(['Stamina','Locomotion','Match','ROSTER','MatchFormat','Tournament']);
let failed=0;const check=(ok,msg)=>{console.log((ok?'PASS  ':'FAIL  ')+msg);if(!ok)failed++;};
const near=(a,b,t)=>Math.abs(a-b)<=t;

// the cost of running (di Prampero 2005): 3.6 J/kg per metre on the flat, more speeding up, less slowing down
const flat=Stamina.power(5,0);
check(near(flat,18,.01),`running at 5 m/s on the flat costs 3.6 J/kg/m: ${flat.toFixed(2)} W/kg`);
check(Stamina.power(5,4)>2*flat,`accelerating at 4 m/s² costs more than twice as much: ${Stamina.power(5,4).toFixed(1)} W/kg`);
check(Stamina.power(5,-2)<.6*flat,`easing off at 2 m/s² costs less, as running downhill does: ${Stamina.power(5,-2).toFixed(1)} W/kg`);
check(near(Stamina.power(5,-4),flat,.15*flat)&&Stamina.power(5,-4)<Stamina.power(5,4)/3,`braking hard at 4 m/s² costs about what running on the flat does (the muscles take the load): ${Stamina.power(5,-4).toFixed(1)} W/kg`);
check(Stamina.power(0,10)===0,'standing still costs nothing here');

// fresh: no effect at all
const avg={end:1},fit={end:1.2},s0=new Stamina(avg);
check(s0.speed===1&&s0.accel===1&&s0.err===1&&s0.pace===1&&s0.serveV===1&&s0.serveErr===1&&s0.energy===1,'a fresh player is exactly as rated');

// the same work tires a fitter player less, and his breath comes back sooner
const a=new Stamina(avg),b=new Stamina(fit);
for(let i=0;i<1200;i++){a.run(6,3,0,1/120);b.run(6,3,0,1/120);}
check(b.legs<a.legs&&b.breath<a.breath,`ten seconds flat out: legs ${a.legs.toFixed(3)} vs ${b.legs.toFixed(3)}, breath ${a.breath.toFixed(2)} vs ${b.breath.toFixed(2)} (endurance 1 vs 1.2)`);
const b0=a.breath;a.rest(25);
check(near(a.breath/b0,Math.exp(-25/Stamina.TAU_B),1e-9),`25 s between points gives back ${Math.round((1-a.breath/b0)*100)}% of the breath`);
const l0=a.legs;a.rest(25);check(a.legs===l0,'standing between points does not rest the legs');a.rest(90,true);check(a.legs<l0,'sitting at a changeover does, a little');

// at the end of a long match (both long-term stores at 0.8) the declines sit inside the measured ranges
const t=new Stamina(avg);t.legs=.8;t.arm=.8;
check(t.speed>=.97&&t.speed<=.985,`top speed −${((1-t.speed)*100).toFixed(1)}% (sprints +2.3…3.1% slower, Girard 2014)`);
check(t.accel>=.92&&t.accel<=.95,`first step and braking −${((1-t.accel)*100).toFixed(1)}% (strength −9%, leg stiffness −6.5…9%, Girard 2006/2014)`);
check(t.serveV>=.963&&t.serveV<=.995,`serve speed −${((1-t.serveV)*100).toFixed(1)}% (−0.5% Maquirriain 2016 … −3.7% Martin 2016)`);
check(t.serveErr<=1.08,`serve error ×${t.serveErr.toFixed(2)} (first serves in 63.1% → 62.3%, Maquirriain 2016)`);
check(t.err>=1.15&&t.err<=1.4,`groundstroke error ×${t.err.toFixed(2)} (forehand proficiency 75% → 65%, Pereira 2016)`);
check(t.pace>=.96&&t.pace<1,`groundstroke pace −${((1-t.pace)*100).toFixed(1)}% (Hornery 2007)`);

// a tired runner takes longer to get there
const L=Locomotion.forProfile(ROSTER[0]),t0=L.timeTo(6);L.scale(t.speed,t.accel);const t1=L.timeTo(6);L.scale(1,1);
check(t1>t0&&L.timeTo(6)===t0,`six metres: ${t0.toFixed(3)} s fresh, ${t1.toFixed(3)} s tired, back to ${L.timeTo(6).toFixed(3)} s`);

// a whole set: both players tire, the stats add up
const m=new Match({a:ROSTER[1],b:ROSTER[2],format:MatchFormat.get('one')});let n=0;
while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&n<150*60*120){m.tick();n++;m.events.length=0;}
for(const P of m.players){const S=P.sta,np=m.players[0].ms.pts+m.players[1].ms.pts;
  check(S.legs>0&&S.arm>0&&S.energy<1&&S.energy>.3,`${P.short} after one set (${np} points): energy ${Math.round(S.energy*100)}%, ${Math.round(S.dist)} m, ${(S.dist/np).toFixed(1)} m a point`);
  check(S.dist/np>6&&S.dist/np<16,`${P.short}: distance per point near the Grand Slam figure (9.6 m, 95% CI 7.6–12.2, Pluim 2023)`);}

// a tournament carries a little of one match into the next
const T=new Tournament(ROSTER[0],MatchFormat.get('short'),'pro');T.tired[ROSTER[0].id]=.05;const cfg=T.config();
check(cfg.carry[0]===.05&&new Match(cfg).players[0].sta.legs===.05,'the next round starts with what was carried over');

console.log(failed?`\n${failed} stamina check(s) failed`:'\nall stamina checks passed');
process.exitCode=failed?1:0;
