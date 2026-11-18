// Grunts: every player has a voice whose pitch lies inside the range of men's tennis grunts measured on tour
// (data/grunt-f0.json); the thirteen each sound different; Nadal's is his own; SoundData agrees with the data.
const fs=require('fs'),vm=require('vm'),path=require('path'),ROOT=path.join(__dirname,'..');
const ctx=vm.createContext({Math});vm.runInContext(['core/constants.js','core/MathUtil.js','audio/SoundData.js','audio/ImpactVoice.js','audio/hitSamples.js','audio/bounceSamples.js','audio/gruntSamples.js','audio/TennisSfx.js'].map(f=>fs.readFileSync(path.join(ROOT,'src',f),'utf8')).join('\n')+';this.API={SOUND,GRUNT_SAMPLES,TennisSfx};',ctx);
const{SOUND,GRUNT_SAMPLES:GS,TennisSfx:T}=ctx.API,G=SOUND.grunt,D=JSON.parse(fs.readFileSync(path.join(ROOT,'data','grunt-f0.json'),'utf8'));
let fail=0;const check=(ok,msg)=>{console.log((ok?'ok   ':'FAIL ')+msg);if(!ok)fail++;};
const pitch=v=>GS.clips.find(c=>c.key===v.key).f0*2**(v.semi/12),R=G.range;
check(R[0]===D.gruntF0.min&&R[1]===D.gruntF0.max&&G.between===D.spreadSemitones.sd&&G.within===D.withinPlayerSdSemitones.median,
  `SoundData's range ${R.join('–')} Hz, spread ${G.between} and ${G.within} semitones are the data's (${D.gruntF0.min}–${D.gruntF0.max}, ${D.spreadSemitones.sd}, ${D.withinPlayerSdSemitones.median})`);
const stars=[...Array(13).keys()].map(id=>({id,v:T.gruntVoice(id)}));
// a recorded grunt measured 1 Hz over the top of the range is allowed that hertz (the pitch tracker's rounding)
const out=stars.filter(s=>pitch(s.v)<R[0]-1||pitch(s.v)>R[1]+1);
check(!out.length,`the thirteen grunt between ${Math.round(Math.min(...stars.map(s=>pitch(s.v))))} and ${Math.round(Math.max(...stars.map(s=>pitch(s.v))))} Hz${out.length?'; outside: '+out.map(s=>s.id).join(', '):''}`);
const keys=new Set(stars.map(s=>s.v.key+'/'+s.v.semi));check(keys.size===13,`the thirteen voices are all different (${keys.size})`);
check(stars[1].v.key==='nadal'&&stars.filter(s=>s.v.key==='nadal').length===1,'Nadal alone has the grunt in two parts');
const gen=[];for(let id=900;id<1400;id++)gen.push(pitch(T.gruntVoice(id)));
check(gen.every(f=>f>=R[0]-1&&f<=R[1]+1),`500 other players' grunts between ${Math.round(Math.min(...gen))} and ${Math.round(Math.max(...gen))} Hz`);
const used=new Set();for(let id=900;id<1400;id++)used.add(T.gruntVoice(id).key);check(!used.has('nadal')&&used.size===GS.clips.length-1,`other players use the ${used.size} other recordings, never Nadal's`);
// in a match: the person presses the shot a fifth of a second before contact (Perfect), and the shot brings a grunt
// in his own voice; the computer's shots and the person's other shots none
{const{loadSim}=require('./load');const{Match,MatchFormat,ROSTER,rng}=loadSim(['Match','MatchFormat','ROSTER','rng']);rng.s=77;
  const m=new Match({a:ROSTER[1],b:ROSTER[0],human:0,format:MatchFormat.get('tb'),surface:'clay'}),C=m.control,base=m.contact.bind(m);let mine=0,k=0;
  m.contact=P=>{if(C.is(P)){mine++;if(k++%2===0){C.shot=C.shot||'drive';C.shotAt=m.t-.2;}else{C.shot=null;C.shotAt=null;}}return base(P);};
  const grunts=[],perfect=()=>m.players[0].ms.perfect;let t=0;
  while(!(m.stage==='over'&&m.result)&&t<60*60*20){m.tick();t++;for(const e of m.events)if(e.type==='grunt')grunts.push(e);m.events.length=0;}
  check(grunts.length>0&&grunts.length===perfect()&&grunts.every(e=>e.voice===ROSTER[1].id&&e.who===0),
    `a tiebreak as Nadal: ${mine} of his shots, ${perfect()} Perfect, ${grunts.length} grunts, all in his voice`);}
console.log(fail?`${fail} grunt check(s) failed`:'all grunt checks passed');process.exit(fail?1:0);
