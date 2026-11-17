// Fits LEVEL_FIT.kappa: how much a player's Elo changes the way he plays (src/career/levelFit.js).
// Two players with the same way of playing (the same roster archetype, no signature trait, rated 0–1000 Elo below
// the archetype's peak, which spans the career's ranking from No. 14 to No. 500), one rated 200 Elo below
// the other, play best-of-three matches. Elo says the stronger wins 76.0% of them (1/(1+10^(−200/400)), Tennis
// Abstract's figure for a 200-point gap); kappa is moved until the game does the same. The target is fixed before
// any match is played. Afterwards gaps of 100 and 400 points are measured against Elo's 64.0% and 90.9% and
// reported as they come out.
//   node tools/fit-levels.js [rounds, default 8] [matches per worker per round, default 12]
const fs=require('fs'),path=require('path'),cp=require('child_process'),ROOT=path.join(__dirname,'..');
const{loadSim}=require(path.join(ROOT,'tests','load'));
function play(API,kappa,gap,n,seed){
  const{Match,MatchFormat,ROSTER,CareerProfile,LEVEL_FIT,rng}=API;LEVEL_FIT.kappa=kappa;let hi=0;
  for(let k=0;k<n;k++){rng.s=seed+k*7919;const A=ROSTER[(seed+k)%ROSTER.length],u=((seed+k)*.6180339887%1)*1000,E1=CareerProfile.peak(A)-u,E2=E1-gap;
    const look={name:'X',short:'X',cc:'XXX',rank:100},a=CareerProfile.make(A,E1,{...look,id:2001,short:'Strong'}),b=CareerProfile.make(A,E2,{...look,id:2002,short:'Weak'});
    const swap=k%2===1,m=new Match({a:swap?b:a,b:swap?a:b,format:MatchFormat.get('bo3')});let t=0;
    while(!(m.stage==='over'&&m.result)&&t<120*60*400){m.tick();t++;m.events.length=0;}
    if(m.result&&m.result.winner.st.short==='Strong')hi++;}
  return hi;
}
if(process.argv[2]==='--worker'){
  const API=loadSim(['Match','MatchFormat','ROSTER','CareerProfile','LEVEL_FIT','rng']);
  process.on('message',t=>process.send({id:t.id,hi:play(API,t.kappa,t.gap,t.n,t.seed)}));
  return;
}
const ROUNDS=+(process.argv[2]||8),PER=+(process.argv[3]||12),W=Math.min(14,require('os').cpus().length);
const pool=[...Array(W)].map(()=>cp.fork(__filename,['--worker']));let next=0;const wait=new Map();
pool.forEach(w=>w.on('message',r=>{wait.get(r.id)(r.hi);wait.delete(r.id);}));
const run=(kappa,gap,n,seed)=>new Promise(res=>{const id=next++;wait.set(id,res);pool[id%W].send({id,kappa,gap,n,seed});});
const elo=d=>1/(1+Math.pow(10,-d/400)),logit=p=>Math.log(p/(1-p)),cl=p=>Math.min(.98,Math.max(.02,p));
async function measure(kappa,gap,per,seed){const r=await Promise.all(pool.map((_,i)=>run(kappa,gap,per,seed+i*1000)));const hi=r.reduce((a,b)=>a+b,0),n=per*W;return{p:hi/n,n};}
(async()=>{
  const T=elo(200);let kappa=+(process.env.K0||1),t0=Date.now();const log=[];
  for(let it=0;it<ROUNDS;it++){
    const g=await measure(kappa,200,PER,10000+it*50000),G=1/Math.sqrt(1+it);
    console.log(`round ${it+1}: kappa ${kappa.toFixed(3)} → stronger won ${(g.p*100).toFixed(1)}% of ${g.n} (target ${(T*100).toFixed(1)}%) [${((Date.now()-t0)/1000).toFixed(0)}s]`);
    log.push({round:it+1,kappa:+kappa.toFixed(4),won:+(g.p*100).toFixed(1),n:g.n});
    // in log-odds the advantage grows about in proportion to kappa: scale it by the ratio, damped
    kappa*=Math.pow(Math.max(.25,Math.min(4,logit(T)/logit(cl(g.p)))),.9*G);
  }
  const check={};for(const gap of[100,200,400]){const g=await measure(kappa,gap,PER*2,900000+gap);check[gap]={game:+(g.p*100).toFixed(1),elo:+(elo(gap)*100).toFixed(1),n:g.n,
    margin:+(196*Math.sqrt(g.p*(1-g.p)/g.n)).toFixed(1)};console.log(`gap ${gap}: game ${check[gap].game}% ± ${check[gap].margin} of ${g.n} · Elo ${check[gap].elo}%`);}
  const date=new Date().toISOString().slice(0,10);
  fs.writeFileSync(path.join(ROOT,'src','career','levelFit.js'),
`// levelFit — how a player's level reaches the match: written by tools/fit-levels.js (${date})
// kappa: a player rated E Elo plays with errors and placement spread multiplied by exp(kappa·(Ea − E)/400) next to
// the roster player whose way of playing he shares (rated Ea, his peak). Fitted so that two such players, 200 Elo
// apart, win best-of-three matches against each other as often as Elo says (76%). See docs/career.
const LEVEL_FIT={kappa:${kappa.toFixed(4)},fitted:'${date}'};
`);
  fs.writeFileSync(path.join(ROOT,'data','career','level-fit.json'),JSON.stringify({date,target:{gap:200,won:+(T*100).toFixed(1)},rounds:log,kappa:+kappa.toFixed(4),check},null,1));
  console.log(`kappa ${kappa.toFixed(4)} written to src/career/levelFit.js and data/career/level-fit.json`);pool.forEach(w=>w.kill());
})();
