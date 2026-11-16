// Fits ShotPlanner.DIR so the game's rally shots go where real ones do, by thirds of the court as the Match Charting
// Project codes them: 59.2% cross-court (including inside-out), 26.5% down the middle, 14.2% down the line (including
// inside-in), over 1.38 million shots on hard courts since 2010. Writes the result into src/players/ShotPlanner.js.
//   node tools/fit-directions.js [rounds, default 6] [sets per round, default 14]
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..');
const{loadSim}=require(path.join(ROOT,'tests','load'));
const API=loadSim(['Match','ROSTER','MatchFormat','rng','CT','ShotPlanner']),{Match,ROSTER,MatchFormat,rng,CT,ShotPlanner}=API;
const REAL={cross:.592,middle:.265,line:.142};
// a rally shot's direction: the middle third of the court, else across from where it is hit, else along the line
const count={cross:0,middle:0,line:0},orig=Match.prototype.contact;
Match.prototype.contact=function(P){const p=P.plan;if(p&&p.shot&&!this.isServe){const tx=p.shot.t.x;
  count[Math.abs(tx)<CT.SW/3?'middle':Math.sign(tx)===-Math.sign(P.x||1e-9)?'cross':'line']++;}return orig.call(this,P);};
function measure(sets,seed){for(const k in count)count[k]=0;
  for(let k=0;k<sets;k++){rng.s=seed+k;const a=ROSTER[k%ROSTER.length],b=ROSTER[(k*5+3)%ROSTER.length],m=new Match({a,b,format:MatchFormat.get('one')});let n=0;
    while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&n<150*60*60){m.tick();n++;m.events.length=0;}}
  const t=count.cross+count.middle+count.line;return{cross:count.cross/t,middle:count.middle/t,line:count.line/t,n:t};}
const R=+(process.argv[2]||6),S=+(process.argv[3]||14),f=x=>(x*100).toFixed(1);
for(let it=0;it<R;it++){
  const g=measure(S,7000+it*100),G=1/Math.sqrt(1+it);
  console.log(`round ${it+1}: cross ${f(g.cross)} middle ${f(g.middle)} line ${f(g.line)} (${g.n} shots) · middle ×${ShotPlanner.DIR.middle.toFixed(2)} line ×${ShotPlanner.DIR.line.toFixed(2)}`);
  ShotPlanner.DIR.middle*=Math.pow(REAL.middle/g.middle,.9*G);ShotPlanner.DIR.line*=Math.pow(REAL.line/g.line,.9*G);
}
const g=measure(S*2,9000);
console.log(`final: cross ${f(g.cross)} middle ${f(g.middle)} line ${f(g.line)} (${g.n} shots) · real ${f(REAL.cross)} / ${f(REAL.middle)} / ${f(REAL.line)}`);
const p=path.join(ROOT,'src','players','ShotPlanner.js'),s=fs.readFileSync(p,'utf8');
fs.writeFileSync(p,s.replace(/static DIR=\{middle:[0-9.]+,line:[0-9.]+\};/,`static DIR={middle:${ShotPlanner.DIR.middle.toFixed(3)},line:${ShotPlanner.DIR.line.toFixed(3)}};`));
console.log('written into src/players/ShotPlanner.js');
