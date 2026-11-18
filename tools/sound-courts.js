// How the ball's sounds come out on each court: the average level of the hit and the bounce (their gains, from the
// game's own mapping in TennisSfx, court factor included), over one-set
// matches between the same two players. The hard court (the Pixel Tennis Open) is the reference the others are set to.
//   node tools/sound-courts.js [matches per court, default 4]
const fs=require('fs'),path=require('path'),vm=require('vm'),ROOT=path.join(__dirname,'..');
const{loadSim}=require(path.join(ROOT,'tests','load'));const{Match,MatchFormat,ROSTER,rng}=loadSim(['Match','MatchFormat','ROSTER','rng']);
const ctx=vm.createContext({Math});vm.runInContext(['core/MathUtil.js','audio/SoundData.js','audio/hitSamples.js','audio/bounceSamples.js','audio/TennisSfx.js'].map(f=>fs.readFileSync(path.join(ROOT,'src',f),'utf8')).join('\n')+';this.T=TennisSfx;',ctx);
const T=ctx.T,N=+(process.argv[2]||4),clamp=(v,a,b)=>v<a?a:v>b?b:v,db=x=>+(20*Math.log10(x)).toFixed(1),mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
for(const s of['hard','clay','grass']){const acc={hit:[],bounce:[],pts:0};
  for(let k=0;k<N;k++){rng.s=900+k;const m=new Match({a:ROSTER[0],b:ROSTER[1],format:MatchFormat.get('one'),surface:s});let t=0;
    while(!(m.stage==='over'&&m.result)&&t<120*60*60){m.tick();t++;
      for(const e of m.events){if(e.type==='hit')acc.hit.push(T.hitClip(clamp((e.v-10)/42,0,1),e.spin||0).gain);
        else if(e.type==='bounce')acc.bounce.push(T.bounceClip(e.v,1,e.surf).gain);else if(e.type==='scored')acc.pts++;}
      m.events.length=0;}}
  console.log(`${s.padEnd(6)} hit ${db(mean(acc.hit))} dB  bounce ${db(mean(acc.bounce))} dB  (${acc.pts} points)`);}
