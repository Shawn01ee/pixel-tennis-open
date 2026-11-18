// Measures the game's ball sounds, real recordings (src/audio/hitSamples.js, bounceSamples.js), as they are, and sets
// them against the line-calling patent's descriptions: a hit ~1 kHz while the ball is on the strings → one cycle at
// 250 Hz → ~1 kHz again; a bounce ~1 kHz → 250 Hz; every ball sound reaching its level within a millisecond. Nothing
// is tuned here.
// Writes data/sound-check.json, and the sounds as .wav files to the folder given (optional).
//   node tools/sound-check.js [wav folder]
const fs=require('fs'),vm=require('vm'),path=require('path'),ROOT=path.join(__dirname,'..'),SRC=path.join(ROOT,'src');
const ctx=vm.createContext({Math,console,Float32Array,Float64Array,Uint8Array,Object,Array,JSON});
vm.runInContext(['core/constants.js','core/MathUtil.js','audio/SoundData.js','audio/ImpactVoice.js','audio/hitSamples.js','audio/bounceSamples.js','audio/shoeHardStep.js','audio/shoeHardStop.js','audio/shoeClayStep.js','audio/shoeClayStop.js','audio/shoeGrassStep.js','audio/shoeGrassStop.js','audio/TennisSfx.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n')
  +'\n;this.API={SOUND,ImpactVoice,TennisSfx,HIT_SAMPLES,BOUNCE_SAMPLES,SHOE_HARD_STEP,SHOE_HARD_STOP,SHOE_CLAY_STEP,SHOE_CLAY_STOP,SHOE_GRASS_STEP,SHOE_GRASS_STOP};',ctx);
const{SOUND,ImpactVoice,TennisSfx,HIT_SAMPLES,BOUNCE_SAMPLES,SHOE_HARD_STEP,SHOE_HARD_STOP,SHOE_CLAY_STEP,SHOE_CLAY_STOP,SHOE_GRASS_STEP,SHOE_GRASS_STOP}=ctx.API,RATE=48000,voice=new ImpactVoice(RATE),WAV=process.argv[2];
const render=(S,D)=>voice.render(S,D.gain);
// the strongest frequency (Hz) in a stretch of the sound, from a zero-padded DFT, between 100 Hz and 4 kHz
function peakHz(x,a,b,R=RATE){const s=x.slice(Math.round(a*R),Math.round(b*R)),m=s.reduce((q,v)=>q+v,0)/s.length;let best=0,bf=0;
  for(let f=100;f<=4000;f+=10){let re=0,im=0;for(let i=0;i<s.length;i++){const w=2*Math.PI*f*i/R;re+=(s[i]-m)*Math.cos(w);im-=(s[i]-m)*Math.sin(w);}const p=re*re+im*im;if(p>best){best=p;bf=f;}}
  return bf;}
const peak=(x,a=0,b=x.length/RATE)=>{let m=0;for(let i=Math.round(a*RATE);i<Math.min(x.length,Math.round(b*RATE));i++)m=Math.max(m,Math.abs(x[i]));return m;};
const onsetMs=(x,R=RATE)=>{let m=0;for(const v of x)m=Math.max(m,Math.abs(v));const h=m/2,q=m/20;let i0=0;while(Math.abs(x[i0])<q)i0++;for(let i=i0;i<x.length;i++)if(Math.abs(x[i])>=h)return(i-i0)/R*1000;return Infinity;};
const rmsDb=x=>10*Math.log10(x.reduce((q,v)=>q+v*v,0)/x.length);
// spectral centroid over the whole sound (Hz), from a 4096-point DFT of its first 4096 samples, zero-padded
function centroid(x){const n=4096,s=new Float64Array(n);s.set(x.slice(0,n));let num=0,den=0;
  for(let k=1;k<n/2;k++){let re=0,im=0;for(let i=0;i<Math.min(n,x.length);i++){const w=2*Math.PI*k*i/n;re+=s[i]*Math.cos(w);im-=s[i]*Math.sin(w);}const m=Math.hypot(re,im);num+=k*RATE/n*m;den+=m;}
  return num/den;}
const lenMs=x=>{const t=peak(x)/100;let last=0;for(let i=0;i<x.length;i++)if(Math.abs(x[i])>=t)last=i;return last/RATE*1000;};
function wav(name,x){if(!WAV)return;const n=x.length,b=Buffer.alloc(44+n*2);b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);
  b.writeUInt32LE(RATE,24);b.writeUInt32LE(RATE*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++)b.writeInt16LE(Math.max(-32767,Math.min(32767,Math.round(x[i]*.5*32767))),44+i*2);fs.writeFileSync(path.join(WAV,name+'.wav'),b);}
const B=SOUND.bounce,near=(f,t)=>f>=t/1.4&&f<=t*1.4,out={rate:RATE};
// the recorded sounds: each decoded as the game does, measured from the moment it starts (a twentieth of its peak), in
// stretches (ms) where the patent describes its parts
const dec=b64=>{const b=Buffer.from(b64,'base64'),x=new Float64Array(b.length>>1);for(let i=0;i<x.length;i++)x[i]=b.readInt16LE(2*i)/32768;return x;};
const measure=(S,name,cuts)=>S.clips.map((c,k)=>{const x=dec(c.data),HR=S.rate;let m=0;for(const v of x)m=Math.max(m,Math.abs(v));let i0=0;while(Math.abs(x[i0])<m/20)i0++;const t0=i0/HR;
  if(WAV){const r=new Float32Array(x.length);r.set(x);wav(name+'-'+k,r);}
  const parts=cuts.slice(1).map((b,j)=>peakHz(x,t0+cuts[j]/1000,t0+b/1000,HR));
  const{data,at,...rest}=c;return{...rest,onsetMs:+onsetMs(x,HR).toFixed(2),parts};});
out.hits=measure(HIT_SAMPLES,'hit',[0,4,8,28]).map(h=>({...h,patentLike:near(h.parts[0],1000)&&near(h.parts[1],250)&&near(h.parts[2],1000)}));
out.bounces=measure(BOUNCE_SAMPLES,'bounce',[0,2,22]).map(h=>({...h,patentLike:near(h.parts[0],B.hiHz)&&near(h.parts[1],B.loHz)}));
const D=SOUND.hit.design,hf=TennisSfx.hitClip(1,0),hs=TennisSfx.hitClip(1,1);
out.hit={flatLouder:hf.gain>hs.gain,flatGain:+hf.gain.toFixed(3),spunGain:+hs.gain.toFixed(3)};
out.onsetOk=[...out.hits,...out.bounces].every(h=>h.onsetMs<SOUND.onsetMs.v);
// the feet, each court's steps and stops: measured as they are (nothing in the sources to set them against)
out.feet=Object.fromEntries([['hard step',SHOE_HARD_STEP],['hard stop',SHOE_HARD_STOP],['clay step',SHOE_CLAY_STEP],['clay stop',SHOE_CLAY_STOP],['grass step',SHOE_GRASS_STEP],['grass stop',SHOE_GRASS_STOP]].map(([k,S])=>[k,S.clips.map(({data,at,...c})=>({...c,ms:Math.round(Buffer.from(data,'base64').length/2/S.rate*1000)}))]));
fs.writeFileSync(path.join(ROOT,'data','sound-check.json'),JSON.stringify(out,null,1));
const yes=b=>b?'yes':'**NO**';
for(const h of out.hits)console.log(`recorded hit: peak ${h.peak}, onset ${h.onsetMs} ms, centroid ${h.centroid} Hz, strongest ${h.dominant} Hz, -20 dB in ${h.fall20ms} ms, -40 dB in ${h.fall40ms} ms; ${h.parts.join(' → ')} Hz (as the patent hears a hit: ${yes(h.patentLike)})`);
console.log(`flat louder than spun: ${yes(out.hit.flatLouder)}`);
for(const h of out.bounces)console.log(`recorded bounce: peak ${h.peak}, onset ${h.onsetMs} ms, centroid ${h.centroid} Hz, strongest ${h.dominant} Hz, below 300 Hz ${h.low}%, -20 dB in ${h.fall20ms} ms; ${h.parts.join(' → ')} Hz (as the patent hears a bounce: ${yes(h.patentLike)})`);
for(const k in out.feet)for(const c of out.feet[k])console.log(`${k}: ${c.ms} ms, peak ${c.peak}, centroid ${c.centroid} Hz, strongest ${c.dominant} Hz, energy ${c.low}/${c.body}/${c.mid}/${c.high}%`);
console.log('written data/sound-check.json');
