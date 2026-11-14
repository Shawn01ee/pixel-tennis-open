// Match statistics over many computer-vs-computer sets: do the numbers look like tennis?
//   node tools/balance.js [sets=56]
const{loadSim}=require('../tests/load.js');
const{Match,ROSTER,MatchFormat}=loadSim(['Match','ROSTER','MatchFormat']);
if(process.env.SE)Match.SERVE_ERR=+process.env.SE;if(process.env.RR)Match.RETURN.react=+process.env.RR;if(process.env.RX)Match.RETURN.x=+process.env.RX;
const N=+(process.argv[2]||56);let pts=0,aces=0,df=0,sv1=0,sv1in=0,win=0,ue=0,rs=0,rl=0,won1=0,hold=0,games=0;
for(let k=0;k<N;k++){const i=k%8,j=(i+1+(k>>3)%7)%8,m=new Match({a:ROSTER[i],b:ROSTER[j],format:MatchFormat.get('short')});let n=0;
  while(!(m.stage==='over'&&m.result)&&n<120*60*90){m.tick();n++;m.events.length=0;}
  for(const p of m.players){pts+=p.ms.pts;aces+=p.ms.aces;df+=p.ms.df;sv1+=p.ms.sv1;sv1in+=p.ms.sv1in;win+=p.ms.win;ue+=p.ms.ue;won1+=p.ms.won1;}
  rs+=m.stats.rallies;rl+=m.stats.rallyShots;}
const pc=(a,b)=>(a/b*100).toFixed(1)+'%';
console.log(`${N} sets, ${pts} points`);
console.log(`aces ${pc(aces,pts)} of points (tour: 7–10%) · double faults ${pc(df,pts)} (tour: 3–4%)`);
console.log(`first serves in ${pc(sv1in,sv1)} (tour: 60–65%) · points won on first serve ${pc(won1,sv1in)} (tour: 70–75%)`);
console.log(`rally length ${(rl/rs).toFixed(1)} shots (tour: 4–5) · winners ${pc(win,pts)} · unforced errors ${pc(ue,pts)}`);
