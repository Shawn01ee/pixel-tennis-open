// Renders the game's ball sounds on the chip (outside the browser) and measures them against what the sources say real
// ones are like (src/audio/SoundData.js): every ball sound reaches its level within a millisecond; a racket hit goes
// ~1 kHz → one cycle at 250 Hz → ~1 kHz again ("upshifting twang"), a bounce ~1 kHz → 250 Hz ("downshifting thump");
// a flat hit is louder and darker than a spun one; the ring is quieter than the crack. Nothing is tuned here — the
// sounds are written from the sources and this reports whether they came out as written.
// Writes data/sound-check.json, and the sounds as .wav files to the folder given (optional).
//   node tools/sound-check.js [wav folder]
const fs=require('fs'),vm=require('vm'),path=require('path'),ROOT=path.join(__dirname,'..'),SRC=path.join(ROOT,'src');
const ctx=vm.createContext({Math,console,Float32Array,Uint8Array,Object,Array,JSON});
vm.runInContext(['core/constants.js','core/MathUtil.js','audio/SoundData.js','audio/ChipVoice.js','audio/TennisSfx.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n')
  +'\n;this.API={SOUND,ChipVoice,TennisSfx};',ctx);
const{SOUND,ChipVoice,TennisSfx}=ctx.API,RATE=48000,chip=new ChipVoice(RATE),WAV=process.argv[2];
const render=(notes,D)=>chip.render(notes,D.gain);
// the strongest frequency (Hz) in a stretch of the sound, from a zero-padded DFT, between 100 Hz and 4 kHz
function peakHz(x,a,b){const s=x.slice(Math.round(a*RATE),Math.round(b*RATE)),m=s.reduce((q,v)=>q+v,0)/s.length;let best=0,bf=0;
  for(let f=100;f<=4000;f+=10){let re=0,im=0;for(let i=0;i<s.length;i++){const w=2*Math.PI*f*i/RATE;re+=(s[i]-m)*Math.cos(w);im-=(s[i]-m)*Math.sin(w);}const p=re*re+im*im;if(p>best){best=p;bf=f;}}
  return bf;}
const peak=(x,a=0,b=x.length/RATE)=>{let m=0;for(let i=Math.round(a*RATE);i<Math.min(x.length,Math.round(b*RATE));i++)m=Math.max(m,Math.abs(x[i]));return m;};
const onsetMs=x=>{const h=peak(x)/2;for(let i=0;i<x.length;i++)if(Math.abs(x[i])>=h)return i/RATE*1000;return Infinity;};
const rmsDb=x=>10*Math.log10(x.reduce((q,v)=>q+v*v,0)/x.length);
// spectral centroid over the whole sound (Hz), from a 4096-point DFT of its first 4096 samples, zero-padded
function centroid(x){const n=4096,s=new Float64Array(n);s.set(x.slice(0,n));let num=0,den=0;
  for(let k=1;k<n/2;k++){let re=0,im=0;for(let i=0;i<Math.min(n,x.length);i++){const w=2*Math.PI*k*i/n;re+=s[i]*Math.cos(w);im-=s[i]*Math.sin(w);}const m=Math.hypot(re,im);num+=k*RATE/n*m;den+=m;}
  return num/den;}
const lenMs=x=>{const t=peak(x)/100;let last=0;for(let i=0;i<x.length;i++)if(Math.abs(x[i])>=t)last=i;return last/RATE*1000;};
function wav(name,x){if(!WAV)return;const n=x.length,b=Buffer.alloc(44+n*2);b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);
  b.writeUInt32LE(RATE,24);b.writeUInt32LE(RATE*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++)b.writeInt16LE(Math.max(-32767,Math.min(32767,Math.round(x[i]*.5*32767))),44+i*2);fs.writeFileSync(path.join(WAV,name+'.wav'),b);}
const H=SOUND.hit,B=SOUND.bounce,c=H.contactMs/1000,lo=H.loCycles/H.loHz,ring=H.design.ringCycles/H.hiHz,near=(f,t)=>f>=t/1.4&&f<=t*1.4,out={rate:RATE};
// hits: a hard flat drive, the same with heavy spin, a soft one
const hits={flat:TennisSfx.hitNotes(1,0),spun:TennisSfx.hitNotes(1,1),soft:TennisSfx.hitNotes(.2,.3)},X={};
for(const k in hits){X[k]=render(hits[k],H.design);wav('hit-'+k,X[k]);}
const x=X.flat,parts=[peakHz(x,0,c),peakHz(x,c,c+lo),peakHz(x,c+lo,c+lo+ring)];
out.hit={onsetMs:+onsetMs(x).toFixed(2),parts:{contact:parts[0],dip:parts[1],ring:parts[2]},
  upshift:near(parts[0],H.hiHz)&&near(parts[1],H.loHz)&&near(parts[2],H.hiHz),
  ringVsCrackDb:+(20*Math.log10(peak(x,c+lo,c+lo+ring)/peak(x,0,c))).toFixed(1),lengthMs:+lenMs(x).toFixed(1),
  flat:{db:+rmsDb(X.flat).toFixed(1),centroid:Math.round(centroid(X.flat))},spun:{db:+rmsDb(X.spun).toFixed(1),centroid:Math.round(centroid(X.spun))}};
out.hit.flatLouderDarker=out.hit.flat.db>out.hit.spun.db&&out.hit.flat.centroid<out.hit.spun.centroid;
// a bounce at 8 m/s down the court's normal (a groundstroke landing deep)
const bo=render(TennisSfx.bounceNotes(8),B.design),bh=B.hiCycles/B.hiHz,bp=[peakHz(bo,0,bh),peakHz(bo,bh,bh+B.design.loCycles/B.loHz)];wav('bounce',bo);
out.bounce={onsetMs:+onsetMs(bo).toFixed(2),parts:{first:bp[0],thump:bp[1]},downshift:near(bp[0],B.hiHz)&&near(bp[1],B.loHz),lengthMs:+lenMs(bo).toFixed(1)};
out.onsetOk=out.hit.onsetMs<SOUND.onsetMs.v&&out.bounce.onsetMs<SOUND.onsetMs.v;
fs.writeFileSync(path.join(ROOT,'data','sound-check.json'),JSON.stringify(out,null,1));
const yes=b=>b?'yes':'**NO**';
console.log(`hit: onset ${out.hit.onsetMs} ms; ${parts.join(' → ')} Hz (upshift ${yes(out.hit.upshift)}); ring ${out.hit.ringVsCrackDb} dB under the crack; ${out.hit.lengthMs} ms long`);
console.log(`     flat ${out.hit.flat.db} dB, centroid ${out.hit.flat.centroid} Hz; spun ${out.hit.spun.db} dB, ${out.hit.spun.centroid} Hz (flat louder and darker ${yes(out.hit.flatLouderDarker)})`);
console.log(`bounce: onset ${out.bounce.onsetMs} ms; ${bp.join(' → ')} Hz (downshift ${yes(out.bounce.downshift)}); ${out.bounce.lengthMs} ms long`);
console.log('written data/sound-check.json');
