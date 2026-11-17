// How points are played, against the real figures: where rally balls go, how often players hit overheads and come to
// the net, how points end, how far players run and how long rallies last.
//   node tools/rally-check.js [one-set matches, default 24] [out.json]
// The real figures are the Match Charting Project's (hard courts since 2010, data/mcp-players.json and the shot
// direction and shot type tables) and published tracking: 4.57 m between a player's shots and 6.46–10.7 m a point
// (Armstrong 2024; Cui 2020), 1.21 s between shots (Carboch 2018). Directions are counted by the Match Charting
// Project's own rule (tools/directions.js).
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..');
const{loadSim}=require(path.join(ROOT,'tests','load'));
const{Match,ROSTER,MatchFormat,rng,CT}=loadSim(['Match','ROSTER','MatchFormat','rng','CT']);
const{direction,REAL:DIRS}=require('./directions');
const REAL={...DIRS,overhead:.93,volley:2.66,net:11.9,winnerShare:31.6,cycle:4.57,cycleOver45:51,distance:'6.46–10.7',gap:1.21,rally:4.43};
const N=+(process.argv[2]||24),out=process.argv[3];
const c={dir:{cross:0,middle:0,line:0},shots:0,overhead:0,volley:0,pts:0,netPts:0,win:0,err:0,dist:0,cycle:[],gaps:[],rallyShots:0};
const orig=Match.prototype.contact;
Match.prototype.contact=function(P){const d=direction(P,P.plan,this.isServe,CT);if(d)c.dir[d]++;return orig.call(this,P);};
for(let k=0;k<N;k++){
  rng.s=4100+k;const a=ROSTER[k%ROSTER.length],b=ROSTER[(k*5+3)%ROSTER.length],m=new Match({a,b,format:MatchFormat.get('one')});let n=0;
  const P=m.players,prev=P.map(p=>[p.x,p.z]),cyc=[0,0],hit=[false,false],net=[false,false];let lastHit=null,shotsInPoint=0;
  while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&n<150*60*60){
    m.tick();n++;
    P.forEach((p,i)=>{const d=Math.hypot(p.x-prev[i][0],p.z-prev[i][1]);prev[i]=[p.x,p.z];if(m.live&&p.mode==='play'){c.dist+=d;cyc[i]+=d;}if(m.live&&p.rush)net[i]=true;});
    for(const e of m.events){
      if(e.type==='hit'){shotsInPoint++;if(e.kind!=='serve'){c.shots++;if(e.kind==='smash')c.overhead++;if(['volley','putaway','dropvolley'].includes(e.kind))c.volley++;
          if(hit[e.who])c.cycle.push(cyc[e.who]);if(lastHit!=null)c.gaps.push(m.t-lastHit);}
        hit[e.who]=true;cyc[e.who]=0;lastHit=m.t;}
      else if(e.type==='scored'){c.pts++;c.netPts+=(net[0]?1:0)+(net[1]?1:0);const h=m.how;if(h&&h.kind==='winner')c.win++;else if(h&&(h.kind==='error'||h.kind==='net'))c.err++;
        c.rallyShots+=shotsInPoint;shotsInPoint=0;hit[0]=hit[1]=false;net[0]=net[1]=false;lastHit=null;}
    }
    m.events.length=0;
  }
}
const pc=(a,b)=>+(a/b*100).toFixed(1),t=c.dir.cross+c.dir.middle+c.dir.line,mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const game={cross:pc(c.dir.cross,t),middle:pc(c.dir.middle,t),line:pc(c.dir.line,t),overhead:pc(c.overhead,c.shots),volley:pc(c.volley,c.shots),net:pc(c.netPts,c.pts*2),
  winnerShare:pc(c.win,c.win+c.err),cycle:+mean(c.cycle).toFixed(2),cycleOver45:pc(c.cycle.filter(x=>x>4.5).length,c.cycle.length),distance:+(c.dist/c.pts/2).toFixed(1),
  gap:+mean(c.gaps.filter(g=>g<3)).toFixed(3),rally:+(c.rallyShots/c.pts).toFixed(2),points:c.pts};
const res={game,real:REAL};
if(out)fs.writeFileSync(out,JSON.stringify(res,null,1)+'\n');
for(const k in REAL)console.log(k.padEnd(12),String(game[k]).padStart(8),' real',REAL[k]);
