// Measures what a trained point is worth in Elo, for each of the career player's eight bars (LEVEL_FIT.attr in
// src/career/levelFit.js). Two copies of the same player (a roster archetype, no trait, at a level drawn between its
// peak and 1000 Elo below it) play best-of-three matches; one has 10 points more in the bar. The share of matches it
// wins, put through Elo's formula, is the Elo that 10 points are worth. This is not a fit to real data but the game
// measuring itself, so that a simulated match gives a trained player the odds his training earns on court.
//   node tools/fit-attributes.js [matches per worker per bar, default 24]
const fs=require('fs'),path=require('path'),cp=require('child_process'),ROOT=path.join(__dirname,'..');
const{loadSim}=require(path.join(ROOT,'tests','load'));
const ATTRS=['serve','power','speed','spin','control','accuracy','touch','stamina'],PTS=10;
function play(API,attr,n,seed){
  const{Match,MatchFormat,ROSTER,CareerProfile,rng}=API;let hi=0;
  for(let k=0;k<n;k++){rng.s=seed+k*7919;const A=ROSTER[(seed+k)%ROSTER.length],E=CareerProfile.peak(A)-((seed+k)*.6180339887%1)*1000,o={name:'X',cc:'XXX',rank:100};
    const a=CareerProfile.make(A,E,{...o,id:2001,short:'Trained',train:{[attr]:PTS}}),b=CareerProfile.make(A,E,{...o,id:2002,short:'Plain'});
    const swap=k%2===1,m=new Match({a:swap?b:a,b:swap?a:b,format:MatchFormat.get('bo3')});let t=0;
    while(!(m.stage==='over'&&m.result)&&t<120*60*400){m.tick();t++;m.events.length=0;}
    if(m.result&&m.result.winner.st.short==='Trained')hi++;}
  return hi;
}
if(process.argv[2]==='--worker'){const API=loadSim(['Match','MatchFormat','ROSTER','CareerProfile','rng']);process.on('message',t=>process.send({id:t.id,hi:play(API,t.attr,t.n,t.seed)}));return;}
const PER=+(process.argv[2]||24),W=Math.min(14,require('os').cpus().length);
const pool=[...Array(W)].map(()=>cp.fork(__filename,['--worker']));let next=0;const wait=new Map();
pool.forEach(w=>w.on('message',r=>{wait.get(r.id)(r.hi);wait.delete(r.id);}));
const run=(attr,n,seed)=>new Promise(res=>{const id=next++;wait.set(id,res);pool[id%W].send({id,attr,n,seed});});
const elo=p=>400*Math.log10(p/(1-p));
(async()=>{
  const out={},t0=Date.now();
  for(const attr of ATTRS){const r=await Promise.all(pool.map((_,i)=>run(attr,PER,30000+i*977)));const hi=r.reduce((a,b)=>a+b,0),n=PER*W,p=Math.min(.99,Math.max(.01,hi/n)),se=Math.sqrt(p*(1-p)/n);
    const e=elo(p)/PTS,lo=elo(Math.max(.01,p-1.96*se))/PTS,up=elo(Math.min(.99,p+1.96*se))/PTS;
    out[attr]={won:+(p*100).toFixed(1),n,eloPerPoint:+e.toFixed(1),lo:+lo.toFixed(1),hi:+up.toFixed(1)};
    console.log(`${attr.padEnd(9)} +${PTS} points won ${(p*100).toFixed(1)}% of ${n} → ${e.toFixed(1)} Elo a point [${lo.toFixed(1)}, ${up.toFixed(1)}] (${((Date.now()-t0)/1000).toFixed(0)}s)`);}
  const date=new Date().toISOString().slice(0,10),p=path.join(ROOT,'src','career','levelFit.js'),s=fs.readFileSync(p,'utf8');
  // a bar whose interval takes in nothing at all is worth nothing for the odds: its measured value is kept, at 0 when below
  // the measured value and its 95% interval are kept too, for the training screen to say what a point does
  const attr=Object.fromEntries(ATTRS.map(k=>[k,Math.max(0,out[k].eloPerPoint)])),raw=Object.fromEntries(ATTRS.map(k=>[k,[out[k].eloPerPoint,out[k].lo,out[k].hi]]));
  const line=`// attr: Elo a trained point is worth, measured by tools/fit-attributes.js (${date}); attrRaw: [measured, 95% low, high]; see docs/career\nLEVEL_FIT.attr=${JSON.stringify(attr)};LEVEL_FIT.attrRaw=${JSON.stringify(raw)};\n`;
  fs.writeFileSync(p,s.replace(/\/\/ attr:[^\n]*\nLEVEL_FIT\.attr=.*\n/,'')+line);
  fs.writeFileSync(path.join(ROOT,'data','career','attribute-fit.json'),JSON.stringify({date,points:PTS,attributes:out},null,1));
  console.log('written LEVEL_FIT.attr to src/career/levelFit.js');pool.forEach(w=>w.kill());
})();
