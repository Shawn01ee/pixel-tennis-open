// Self-play training: the players play each other over and over, learning which tactics win points.
// Writes what they learned to src/players/learned.js, which the game starts from, and keeps a record of how much
// the learning is worth in training/history.json (drawn by tools/report.js into training/README.md).
//   node tools/train.js [rounds=6] [evalSets=6] [curve]   train (continues from the current learned.js), then measure:
//                                                         every player with what it has learned against a twin that
//                                                         has learned nothing. "curve" measures after every round.
//   node tools/train.js eval [sets=40]                    measure only, print per player
const fs=require('fs'),path=require('path'),{loadSim}=require('../tests/load.js');
const{Match,ROSTER,MatchFormat,Tactics}=loadSim(['Match','ROSTER','MatchFormat','Tactics']);
const play=cfg=>{const m=new Match(cfg);let n=0;while(!(m.stage==='over'&&m.result)&&n<120*60*90){m.tick();n++;m.events.length=0;}return m;};
const F=MatchFormat.get('short'),ROOT=path.join(__dirname,'..'),HIST=path.join(ROOT,'training','history.json');
const clone=(p,o)=>Object.assign(Object.create(Object.getPrototypeOf(p)),p,o);
// match-play settings while measuring, whatever training uses
const PLAY={BETA:Tactics.BETA,ALPHA:Tactics.ALPHA};
// share of points each player wins against an untrained twin of itself, serving first in half the sets
function measure(q,N,log=false){
  const keep={BETA:Tactics.BETA,ALPHA:Tactics.ALPHA};Object.assign(Tactics,PLAY);
  const players={};let tw=0,tp=0,sw=0,sn=0;
  for(const p of ROSTER){
    const twin=clone(p,{noLearn:true,tkey:'_',id:99}),me=clone(p,{noLearn:false});let w=0,pts=0,won=0;
    for(let i=0;i<N;i++){const first=i%2===0,m=play({a:first?me:twin,b:first?twin:me,format:F,tactics:new Tactics(JSON.parse(JSON.stringify(q)))}),k=first?0:1;
      if(m.result.winner===m.players[k])w++;won+=m.players[k].ms.pts;pts+=m.players[0].ms.pts+m.players[1].ms.pts;}
    tw+=won;tp+=pts;sw+=w;sn+=N;players[p.short]=Math.round(won/pts*1000)/10;
    if(log)console.log(`${p.short.padEnd(10)} trained vs untrained twin: ${w}/${N} sets, ${(won/pts*100).toFixed(1)}% of ${pts} points`);
  }
  Object.assign(Tactics,keep);
  return{overall:Math.round(tw/tp*1000)/10,sets:Math.round(sw/sn*1000)/10,evalPoints:tp,players};
}
if(process.argv[2]==='eval'){
  const r=measure(new Tactics().q,+(process.argv[3]||40),true);
  console.log(`all players: ${r.overall}% of ${r.evalPoints} points, ${r.sets}% of sets (50% = learned nothing useful)`);
}else{
  const rounds=+(process.argv[2]||6),evalN=+(process.argv[3]||6),curve=process.argv.includes('curve');
  let hist=[];try{hist=JSON.parse(fs.readFileSync(HIST,'utf8'));}catch(e){}
  const T=new Tactics(),last=hist[hist.length-1]||{round:0,points:0};let round=last.round,points=last.points;
  const record=()=>{const r=measure(T.q,evalN);hist.push({date:new Date().toISOString().slice(0,10),round,points,...r});console.log(`round ${round}: ${points} points played · trained players win ${r.overall}% of points and ${r.sets}% of sets against untrained twins`);};
  if(!hist.length)record();                      // before any training: 50% by construction, measured
  // training explores more and averages over more points than match play does
  Tactics.BETA=1.5;Tactics.ALPHA=.03;
  for(let r=0;r<rounds;r++){
    for(let i=0;i<ROSTER.length;i++)for(let j=0;j<ROSTER.length;j++){if(i===j)continue;const m=play({a:ROSTER[i],b:ROSTER[j],format:F,tactics:T});points+=m.stats.points;}
    round++;if(curve||r===rounds-1)record();
  }
  const q=JSON.parse(JSON.stringify(T.q,(k,v)=>typeof v==='number'?Math.round(v*1000)/1000:v));
  fs.writeFileSync(path.join(ROOT,'src','players','learned.js'),`// learned — tactic values from self-play; written by tools/train.js, do not edit by hand\nconst LEARNED=${JSON.stringify(q)};\n`);
  fs.mkdirSync(path.dirname(HIST),{recursive:true});fs.writeFileSync(HIST,JSON.stringify(hist,null,1)+'\n');
  console.log(`${rounds} rounds; saved src/players/learned.js and training/history.json`);
  require('./report.js');
}
