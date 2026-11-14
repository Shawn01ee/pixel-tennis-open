// Does each signature trait matter? Every player against a twin without the trait.
//   node tools/traits.js [sets=30]
const{loadSim}=require('../tests/load.js');
const{Match,ROSTER,MatchFormat,Tactics,TRAITS}=loadSim(['Match','ROSTER','MatchFormat','Tactics','TRAITS']);
const N=+(process.argv[2]||30),clone=(p,o)=>Object.assign(Object.create(Object.getPrototypeOf(p)),p,o);
for(const p of ROSTER){let won=0,pts=0,sets=0;const plain=clone(p,{trait:null,noLearn:true,id:99}),me=clone(p,{noLearn:true});
  for(let i=0;i<N;i++){const first=i%2===0,m=new Match({a:first?me:plain,b:first?plain:me,format:MatchFormat.get('short'),tactics:new Tactics({})});let n=0;
    while(!(m.stage==='over'&&m.result)&&n<120*60*90){m.tick();n++;m.events.length=0;}
    const k=first?0:1;won+=m.players[k].ms.pts;pts+=m.players[0].ms.pts+m.players[1].ms.pts;if(m.result.winner===m.players[k])sets++;}
  console.log(`${p.short.padEnd(10)} ${TRAITS[p.trait].name.padEnd(16)} ${(won/pts*100).toFixed(1)}% of ${pts} points, ${sets}/${N} sets against the same player without it`);}
