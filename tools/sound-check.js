// Measures the game's ball sounds against what the sources say real ones are like (src/audio/SoundData.js). The racket
// hits are real recordings (src/audio/hitSamples.js): they are measured as they are, and set against the line-calling
// patent's description of a hit (~1 kHz while the ball is on the strings → one cycle at 250 Hz → ~1 kHz again). The
// bounce is built from the patent (~1 kHz → 250 Hz) and checked against it. Every ball sound should reach its level
// within a millisecond. Nothing is tuned here.
// Writes data/sound-check.json, and the sounds as .wav files to the folder given (optional).
//   node tools/sound-check.js [wav folder]
const fs=require('fs'),vm=require('vm'),path=require('path'),ROOT=path.join(__dirname,'..'),SRC=path.join(ROOT,'src');
const ctx=vm.createContext({Math,console,Float32Array,Float64Array,Uint8Array,Object,Array,JSON});
vm.runInContext(['core/constants.js','core/MathUtil.js','audio/SoundData.js','audio/ImpactVoice.js','audio/hitSamples.js','audio/TennisSfx.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n')
  +'\n;this.API={SOUND,ImpactVoice,TennisSfx,HIT_SAMPLES};',ctx);
const{SOUND,ImpactVoice,TennisSfx,HIT_SAMPLES}=ctx.API,RATE=48000,voice=new ImpactVoice(RATE),WAV=process.argv[2];
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
// the recorded hits: each decoded as the game does, measured from the moment it starts (a twentieth of its peak)
const dec=b64=>{const b=Buffer.from(b64,'base64'),x=new Float64Array(b.length>>1);for(let i=0;i<x.length;i++)x[i]=b.readInt16LE(2*i)/32768;return x;},HR=HIT_SAMPLES.rate;
out.hits=HIT_SAMPLES.clips.map((c,k)=>{const x=dec(c.data);let m=0;for(const v of x)m=Math.max(m,Math.abs(v));let i0=0;while(Math.abs(x[i0])<m/20)i0++;const t0=i0/HR;
  if(WAV){const r=new Float32Array(x.length);r.set(x);wav('hit-'+k,r);}
  const parts=[peakHz(x,t0,t0+.004,HR),peakHz(x,t0+.004,t0+.008,HR),peakHz(x,t0+.008,t0+.028,HR)];
  return{peak:c.peak,centroid:c.centroid,dominant:c.dominant,fall20ms:c.fall20ms,fall40ms:c.fall40ms,onsetMs:+onsetMs(x,HR).toFixed(2),parts,patentLike:near(parts[0],1000)&&near(parts[1],250)&&near(parts[2],1000)};});
const D=SOUND.hit.design,hf=TennisSfx.hitClip(1,0),hs=TennisSfx.hitClip(1,1);
out.hit={flatLouder:hf.gain>hs.gain,flatGain:+hf.gain.toFixed(3),spunGain:+hs.gain.toFixed(3)};
// a bounce at 8 m/s down the court's normal (a groundstroke landing deep)
const bo=render(TennisSfx.bounceSound(8),B.design),bh=B.hiCycles/B.hiHz,bp=[peakHz(bo,0,bh),peakHz(bo,bh,bh+.02)];wav('bounce',bo);
out.bounce={onsetMs:+onsetMs(bo).toFixed(2),parts:{first:bp[0],thump:bp[1]},downshift:near(bp[0],B.hiHz)&&near(bp[1],B.loHz),lengthMs:+lenMs(bo).toFixed(1)};
out.onsetOk=out.hits.every(h=>h.onsetMs<SOUND.onsetMs.v)&&out.bounce.onsetMs<SOUND.onsetMs.v;
fs.writeFileSync(path.join(ROOT,'data','sound-check.json'),JSON.stringify(out,null,1));
const yes=b=>b?'yes':'**NO**';
for(const h of out.hits)console.log(`recorded hit: peak ${h.peak}, onset ${h.onsetMs} ms, centroid ${h.centroid} Hz, strongest ${h.dominant} Hz, -20 dB in ${h.fall20ms} ms, -40 dB in ${h.fall40ms} ms; ${h.parts.join(' → ')} Hz (as the patent hears a hit: ${yes(h.patentLike)})`);
console.log(`flat louder than spun: ${yes(out.hit.flatLouder)}`);
console.log(`bounce: onset ${out.bounce.onsetMs} ms; ${bp.join(' → ')} Hz (downshift ${yes(out.bounce.downshift)}); ${out.bounce.lengthMs} ms long`);
console.log('written data/sound-check.json');
