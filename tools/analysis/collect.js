// Collect the shot data for the analysis: node tools/analysis/collect.js [rounds=2]
// Writes training/analysis/data.json (not committed: it is regenerated from the game in a few minutes).
const fs=require('fs'),path=require('path'),ShotDataset=require('./ShotDataset.js');
const rounds=+(process.argv[2]||2),t0=Date.now(),out=path.join(__dirname,'..','..','training','analysis');
const d=ShotDataset.collect(rounds,s=>console.log(s));
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'data.json'),JSON.stringify(d));
console.log(`${d.rows.length} shots from ${rounds} rounds in ${((Date.now()-t0)/1000).toFixed(0)} s → training/analysis/data.json`);
