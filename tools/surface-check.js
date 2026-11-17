// The three courts, against the real tour on each surface (data/mcp-surfaces.json, the Match Charting Project since
// 2010): aces, double faults, first serves in, points won behind the first and second serve, net play, winners and
// errors per shot (a missed return of serve is not counted as an error, as in tools/fit-players.js), rally length. One-set matches between the roster's players on each surface; the 95% interval of
// each game figure is a bootstrap over the matches. Nothing is fitted here: the courts are set from measurements of
// real courts (src/physics/Surface.js) and this reports how the game then plays on them. It also measures each
// court's bounce the way Cross (2003) measured real ones: a ball without spin at 30 m/s, 16° to the court.
// Writes data/surface-check.json.
//   node tools/surface-check.js [matches per worker per surface, default 6]
const fs=require('fs'),path=require('path'),cp=require('child_process'),ROOT=path.join(__dirname,'..');
const{loadSim}=require(path.join(ROOT,'tests','load'));
const SURF=['hard','clay','grass'];
function play(API,surface,n,seed){
  const{Match,ROSTER,MatchFormat,rng}=API,rows=[];
  for(let k=0;k<n;k++){rng.s=seed+k*7919;const a=ROSTER[(seed+k)%ROSTER.length],b=ROSTER[(seed+k*5+3)%ROSTER.length];if(a===b)continue;
    const m=new Match({a,b,format:MatchFormat.get('one'),surface});let t=0,inPt=0,net=[false,false];const r={pts:0,shots:0,rally:0,net:0,win:0,err:0};
    while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&t<150*60*60){m.tick();t++;
      for(const P of m.players)if(m.live&&P.rush)net[P.idx]=true;
      for(const e of m.events){if(e.type==='hit'){inPt++;if(e.kind!=='serve')r.shots++;}
        else if(e.type==='scored'){r.pts++;r.rally+=inPt;inPt=0;r.net+=(net[0]?1:0)+(net[1]?1:0);net=[false,false];const h=m.how;if(h&&h.kind==='winner')r.win++;else if(h&&(h.kind==='error'||h.kind==='net')&&m.rallyLen!==2)r.err++;}}
      m.events.length=0;}
    for(const P of m.players){const s=P.ms;for(const k of['aces','df','sv1','sv1in','won1','won2','sv2'])r[k]=(r[k]||0)+s[k];}
    rows.push(r);}
  return rows;
}
if(process.argv[2]==='--worker'){const API=loadSim(['Match','ROSTER','MatchFormat','rng']);process.on('message',t=>process.send({id:t.id,rows:play(API,t.surface,t.n,t.seed)}));return;}
// the bounce, measured as on a real court
function bounce(){
  const{Ball,BallPhysics,SURFACES,HIT,DT}=loadSim(['Ball','BallPhysics','SURFACES','HIT','DT']),out={};
  for(const k of SURF){const ph=new BallPhysics(SURFACES[k]),b=new Ball(0,.5,0),th=16*Math.PI/180;b.vx=0;b.vz=30*Math.cos(th);b.vy=-30*Math.sin(th);b.y=.04;
    let pre=null;for(let i=0;i<200;i++){const p={vh:b.vz,vy:-b.vy};if(ph.stepOnce(b,DT,false)&HIT.BOUNCE){pre=p;break;}}
    const cor=b.vy/pre.vy,cof=(pre.vh-b.vz)/(pre.vy+b.vy);out[k]={cor:+cor.toFixed(3),cof:+cof.toFixed(3),pace:+(100*(1-cof)).toFixed(0),drop:+SURFACES[k].drop().toFixed(3),speedKept:+(b.vz/pre.vh*100).toFixed(1)};}
  return out;
}
const PER=+(process.argv[2]||6),W=Math.min(14,require('os').cpus().length);
const pool=[...Array(W)].map(()=>cp.fork(__filename,['--worker']));let next=0;const wait=new Map();
pool.forEach(w=>w.on('message',r=>{wait.get(r.id)(r.rows);wait.delete(r.id);}));
const run=(surface,n,seed)=>new Promise(res=>{const id=next++;wait.set(id,res);pool[id%W].send({id,surface,n,seed});});
const STATS={ace:r=>[r.aces,r.sv1],df:r=>[r.df,r.sv1],firstIn:r=>[r.sv1in,r.sv1],firstWon:r=>[r.won1,r.sv1in],secondWon:r=>[r.won2,r.sv2],
  net:r=>[r.net,2*r.pts],winners:r=>[r.win,r.shots],errors:r=>[r.err,r.shots],rally:r=>[r.rally,r.pts]};
const ratio=(rows,f)=>{let a=0,b=0;for(const r of rows){const[x,y]=f(r);a+=x;b+=y;}return a/b;};
function interval(rows,f,g){const v=[];for(let i=0;i<400;i++){const s=[];for(let j=0;j<rows.length;j++)s.push(rows[Math.floor(g()*rows.length)]);v.push(ratio(s,f));}v.sort((a,b)=>a-b);return[v[10],v[389]];}
(async()=>{
  const real=JSON.parse(fs.readFileSync(path.join(ROOT,'data','mcp-surfaces.json'),'utf8')).surfaces,res={date:new Date().toISOString().slice(0,10),bounce:bounce(),surfaces:{}};
  let seedR=12345;const g=()=>{seedR=(seedR*1103515245+12345)&0x7fffffff;return seedR/0x7fffffff;};
  for(const s of SURF){const parts=await Promise.all(pool.map((_,i)=>run(s,PER,20000+i*101)));const rows=parts.flat(),o={matches:rows.length,points:rows.reduce((a,r)=>a+r.pts,0),stats:{}};
    for(const k in STATS){const v=ratio(rows,STATS[k]),[lo,hi]=interval(rows,STATS[k],g),R=real[s][k],pct=k!=='rally',f=x=>pct?+(x*100).toFixed(1):+x.toFixed(2);
      o.stats[k]={game:f(v),lo:f(lo),hi:f(hi),real:f(R),inside:R>=lo&&R<=hi};}
    res.surfaces[s]=o;console.log(s,o.matches,'matches',o.points,'points');
    for(const k in o.stats){const q=o.stats[k];console.log('  '+k.padEnd(10),String(q.game).padStart(6),`[${q.lo}–${q.hi}]`.padStart(16),' real',q.real,q.inside?'':'  ← outside');}}
  console.log('bounce at 30 m/s, 16°:',JSON.stringify(res.bounce));
  fs.writeFileSync(path.join(ROOT,'data','surface-check.json'),JSON.stringify(res,null,1)+'\n');pool.forEach(w=>w.kill());
})();
