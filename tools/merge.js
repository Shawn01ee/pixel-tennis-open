// Fold what the players learned in someone's browser into the values the game ships with.
//   node tools/merge.js <exported file> [more files…] [--weight 0.5]
// In the game: View → Learning → Export saves pixel-tennis-open-learning.json — the difference between what the
// players know after that person's matches and what they shipped with. This adds that difference, scaled by the
// weight, to src/players/learned.js. Then rebuild (python3 build.py) and commit.
const fs=require('fs'),path=require('path'),{loadSim}=require('../tests/load.js');
const{Tactics,ROSTER}=loadSim(['Tactics','ROSTER']);
const args=process.argv.slice(2),wi=args.indexOf('--weight'),w=wi>=0?+args[wi+1]:.5,files=args.filter((a,i)=>wi<0||(i!==wi&&i!==wi+1));
if(!files.length||!(w>0&&w<=1)){console.error('usage: node tools/merge.js <exported file> [more files…] [--weight 0.5]   (weight between 0 and 1)');process.exit(1);}
const FILE=path.join(__dirname,'..','src','players','learned.js'),known=new Set(ROSTER.map(p=>p.short));
const q=JSON.parse(JSON.stringify(Tactics.base()));let total=0;
for(const f of files){
  let o;try{o=JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){console.error(`${f}: not a readable JSON file`);process.exit(1);}
  if(!o||o.game!=='pixel-tennis-open'||o.kind!=='tactics-delta'||typeof o.delta!=='object'){console.error(`${f}: not a Pixel Tennis Open learning export`);process.exit(1);}
  if(o.version!==3){console.error(`${f}: exported by a different version of the game (v${o.version}); its situations no longer match`);process.exit(1);}
  // only players the game has, and only numbers
  const d={};let n=0;for(const p in o.delta){if(!known.has(p))continue;d[p]=o.delta[p];for(const s in d[p])n+=Object.keys(d[p][s]).length;}
  Tactics.apply(q,d,w);total+=n;
  console.log(`${path.basename(f)}: ${o.points} points played on ${o.date}; ${n} values for ${Object.keys(d).join(', ')||'nobody'}`);
}
const out=JSON.parse(JSON.stringify(q,(k,v)=>typeof v==='number'?Math.round(v*1000)/1000:v));
fs.writeFileSync(FILE,`// learned — tactic values from self-play; written by tools/train.js, do not edit by hand\nconst LEARNED=${JSON.stringify(out)};\n`);
console.log(`merged ${total} values at weight ${w} into src/players/learned.js — now run: python3 build.py`);
