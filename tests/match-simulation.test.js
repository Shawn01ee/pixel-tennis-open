// Plays whole matches headless: computer vs computer, a scripted "human" using the manual controls, and Auto.
// Run: node tests/match-simulation.test.js
const{loadSim}=require('./load');
const{Match,ROSTER,MatchFormat}=loadSim(['Match','ROSTER','MatchFormat']);
let failed=0;
function run(label,cfg,bot,auto=false){
  const m=new Match(cfg);if(auto)m.setAuto(true);let steps=0,serveWaits=0,decides=0,aims=0,picks=0,last=null;
  while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&steps<150*60*120){
    const C=m.control;
    if(bot){
      if(C.serveWait&&!C.target&&!C.zone){serveWaits++;const b=m.cue.box,x=(b.x0+b.x1)/2+(Math.random()-.5)*3,z=(b.z0+b.z1)/2+(Math.random()-.5)*4;
        if(!(Math.random()<.5&&m.aimAt(x,z)))m.setZone(['wide','body','t'][steps%3]);else aims++;
        if(Math.random()<.5)m.setServe(['flat','slice','kick'][steps%3]);}
      if(C.decide&&C.decide!==last){last=C.decide;decides++;C._react=m.t+.15+Math.random()*.25;}
      if(C.decide&&C._react&&m.t>=C._react&&!C.target){C._react=0;const H=m.human;
        if(Math.random()<.7){m.setShot(['drive','flat','slice','lob','drop'][Math.floor(Math.random()*5)]);picks++;}
        if(m.aimAt((Math.random()*2-1)*3.6,-H.s*(2+Math.random()*9.5)))aims++;}
    }
    m.tick();steps++;m.events.length=0;
  }
  const P=m.players,ok=m.stage==='over'&&!!m.result;if(!ok)failed++;
  const st=p=>`${p.short.padEnd(9)} pts ${String(p.ms.pts).padStart(3)}  aces ${p.ms.aces}  df ${p.ms.df}  1st% ${p.ms.sv1?Math.round(p.ms.sv1in/p.ms.sv1*100):'-'}  winners ${p.ms.win}  errors ${p.ms.ue}  bp ${p.ms.bpW}/${p.ms.bpT}  fastest ${p.ms.fast}`;
  console.log(`\n[${label}] ${ok?'finished':'DID NOT FINISH'} in ${(m.t/60).toFixed(1)} sim-min · ${m.result?m.result.winner.short+' d. '+m.result.loser.short+' '+m.result.line:''}`);
  console.log('  '+st(P[0]));console.log('  '+st(P[1]));
  console.log(`  rallies ${m.stats.rallies} · avg ${(m.stats.rallyShots/Math.max(1,m.stats.rallies)).toFixed(1)} shots · longest ${m.longest} · lets ${m.stats.lets} · net cords ${m.stats.cords}`);
  if(bot)console.log(`  human: serve waits ${serveWaits} · shot windows ${decides} · targets ${aims} · shot picks ${picks}`);
}
const F=MatchFormat.get;
run('computer vs computer · short set',{a:ROSTER[0],b:ROSTER[1],format:F('short')});
run('computer vs computer · best of three',{a:ROSTER[2],b:ROSTER[6],format:F('bo3')});
run('human (scripted), manual · full set · walk-on',{a:ROSTER[4],b:ROSTER[3],human:0,format:F('set'),walkOn:true},true);
run('human in Auto · short set',{a:ROSTER[5],b:ROSTER[7],human:0,format:F('short')},false,true);
console.log(failed?`\nFAIL: ${failed} match(es) did not finish`:'\nPASS: every match finished');
process.exitCode=failed?1:0;
