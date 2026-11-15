// Cross-validation of the tactics learning: do tactics learned against some players still win against players the
// learner has never met?  node tools/analysis/learning-cv.js [folds=4] [rounds=3] [sets=2]
// The thirteen players are dealt into k folds. For each fold, the players outside it learn from scratch by playing only
// each other (the training set); then each of them, with and without what it learned, plays
//   in-sample  three opponents it trained against, and
//   held-out   every player of the fold (the test set: never seen in training),
// both opponents playing untrained, so only the learner's decisions differ. The advantage is the extra share of
// points the trained player wins over its untrained twin. Writes training/analysis/learning-cv.json.
const fs=require('fs'),path=require('path'),{loadSim}=require(path.join(__dirname,'..','..','tests','load.js'));
const{Match,ROSTER,MatchFormat,Tactics}=loadSim(['Match','ROSTER','MatchFormat','Tactics']);
const Rng=require('./Rng.js');
const K=+(process.argv[2]||4),ROUNDS=+(process.argv[3]||3),SETS=+(process.argv[4]||2),F=MatchFormat.get('short'),rng=new Rng(20261115);
const PLAY={BETA:Tactics.BETA,ALPHA:Tactics.ALPHA};
const clone=(p,o)=>Object.assign(Object.create(Object.getPrototypeOf(p)),p,o);
const play=cfg=>{const m=new Match(cfg);let n=0;while(!(m.stage==='over'&&m.result)&&n<120*60*90){m.tick();n++;m.events.length=0;}return m;};
// points won by `me` against `opp` over SETS short sets, serving first in half of them
function points(me,opp,q){let w=0,t=0;for(let s=0;s<SETS;s++){const first=s%2===0,m=play({a:first?me:opp,b:first?opp:me,format:F,tactics:new Tactics(JSON.parse(JSON.stringify(q)))}),k=first?0:1;
  w+=m.players[k].ms.pts;t+=m.players[0].ms.pts+m.players[1].ms.pts;}return{w,t};}
const order=rng.shuffle([...ROSTER.keys()]),folds=Array.from({length:K},(_,f)=>order.filter((_,i)=>i%K===f)),res=[],t0=Date.now();
for(let f=0;f<K;f++){
  const H=folds[f],T=order.filter(i=>!H.includes(i)),Tq=new Tactics({});
  Object.assign(Tactics,{BETA:1.5,ALPHA:.03});
  for(let r=0;r<ROUNDS;r++)for(const i of T)for(const j of T)if(i!==j)play({a:ROSTER[i],b:ROSTER[j],format:F,tactics:Tq});
  Object.assign(Tactics,PLAY);
  const acc={in:{tw:0,tt:0,uw:0,ut:0},out:{tw:0,tt:0,uw:0,ut:0}};
  for(const i of T){
    const me=clone(ROSTER[i],{noLearn:false}),twin=clone(ROSTER[i],{noLearn:true,tkey:'_',id:99});
    const inOpp=rng.shuffle(T.filter(j=>j!==i)).slice(0,3);
    for(const[set,opps]of[['in',inOpp],['out',H]])for(const j of opps){
      const o=clone(ROSTER[j],{noLearn:true,tkey:'__',id:98}),a=points(me,o,Tq.q),b=points(twin,o,Tq.q),A=acc[set];
      A.tw+=a.w;A.tt+=a.t;A.uw+=b.w;A.ut+=b.t;}
  }
  const adv=A=>(A.tw/A.tt-A.uw/A.ut)*100;
  res.push({fold:f+1,test:H.map(i=>ROSTER[i].short),train:T.map(i=>ROSTER[i].short),inSample:{advantage:+adv(acc.in).toFixed(2),...acc.in},heldOut:{advantage:+adv(acc.out).toFixed(2),...acc.out}});
  console.log(`fold ${f+1}/${K} (test: ${H.map(i=>ROSTER[i].short).join(', ')}): in-sample +${adv(acc.in).toFixed(1)} pts, held-out +${adv(acc.out).toFixed(1)} pts · ${((Date.now()-t0)/60000).toFixed(1)} min`);
}
const out=path.join(__dirname,'..','..','training','analysis');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'learning-cv.json'),JSON.stringify({date:new Date().toISOString().slice(0,10),folds:K,rounds:ROUNDS,sets:SETS,results:res},null,1)+'\n');
console.log('wrote training/analysis/learning-cv.json');
