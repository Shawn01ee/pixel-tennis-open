// Self-play training: the eight players play each other over and over, learning which tactics win points.
// Writes what they learned to src/players/learned.js, which the game starts from.
//   node tools/train.js [rounds=6]         train (continues from the current learned.js) and save
//   node tools/train.js eval [matches=40]  each player with what it has learned against an untrained twin
const fs=require('fs'),path=require('path'),{loadSim}=require('../tests/load.js');
const{Match,ROSTER,MatchFormat,Tactics}=loadSim(['Match','ROSTER','MatchFormat','Tactics']);
const play=cfg=>{const m=new Match(cfg);let n=0;while(!(m.stage==='over'&&m.result)&&n<120*60*90){m.tick();n++;m.events.length=0;}return m;};
const F=MatchFormat.get('short');
if(process.argv[2]==='eval'){
  const N=+(process.argv[3]||40),T=new Tactics();let tw=0,tp=0;
  for(const p of ROSTER){
    const twin=Object.assign(Object.create(Object.getPrototypeOf(p)),p,{noLearn:true,tkey:'_',id:99}),me=Object.assign(Object.create(Object.getPrototypeOf(p)),p,{noLearn:false});
    let w=0,pts=0,won=0;
    for(let i=0;i<N;i++){const first=i%2===0,m=play({a:first?me:twin,b:first?twin:me,format:F,tactics:new Tactics(JSON.parse(JSON.stringify(T.q)))}),k=first?0:1;
      if(m.result.winner===m.players[k])w++;won+=m.players[k].ms.pts;pts+=m.players[0].ms.pts+m.players[1].ms.pts;}
    tw+=won;tp+=pts;console.log(`${p.short.padEnd(10)} trained vs untrained twin: ${w}/${N} sets, ${(won/pts*100).toFixed(1)}% of ${pts} points`);
  }
  console.log(`all players: ${(tw/tp*100).toFixed(1)}% of ${tp} points (50% = learned nothing useful)`);
}else{
  const rounds=+(process.argv[2]||6),T=new Tactics();let pts=0;
  for(let r=0;r<rounds;r++)for(let i=0;i<ROSTER.length;i++)for(let j=0;j<ROSTER.length;j++){if(i===j)continue;const m=play({a:ROSTER[i],b:ROSTER[j],format:F,tactics:T});pts+=m.stats.points;}
  const q=JSON.parse(JSON.stringify(T.q,(k,v)=>typeof v==='number'?Math.round(v*1000)/1000:v));
  fs.writeFileSync(path.join(__dirname,'..','src','players','learned.js'),`// learned — tactic values from self-play; written by tools/train.js, do not edit by hand\nconst LEARNED=${JSON.stringify(q)};\n`);
  console.log(`${rounds} rounds, ${pts} points played; saved src/players/learned.js`);
  for(const k in q)console.log(k.padEnd(10),Object.entries(q[k]).map(([s,o])=>s+':'+Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([t,v])=>`${t} ${v>0?'+':''}${v.toFixed(2)}`).join(',')).join('  ').slice(0,230));
}
