// TennisSfx — the sounds of the game itself: strings, bounces, the net, shoes on a hard court, the menu's notes.
// A racket hit is a real one, recorded (hitSamples.js). The bounce and the net ring at measured frequencies
// (ImpactVoice; what each is made of and where each number comes from: SoundData.js); the shoes and the menu are built
// from oscillators and filtered noise (design).
class TennisSfx{
  constructor(A){this.A=A;this.v=null;}
  get voice(){return this.v||(this.v=new ImpactVoice(this.A.ac.sampleRate));}
  play(S,D,pan){this.A.play(this.voice.render(S,D.gain),pan,D.wet);}
  // a bounce: a cycle or two at 1 kHz, then the ball's 250 Hz thump with its overtones dying away, by impact speed
  static bounceSound(v,soft=1){
    const B=SOUND.bounce,D=B.design,g=clamp((v-1)/12,.08,1)*soft,hi=B.hiCycles/B.hiHz;
    return{lp:D.lp,modes:[{f:B.hiHz,a:D.hi*g,t0:0,tau:hi/2},...D.overtones.map(([k,a,tau])=>({f:B.loHz*k,a:a*g,t0:hi,tau}))]};
  }
  // into the mesh: a dull whack; off the tape: a tick and a shiver
  static netSound(mesh,v){
    const D=SOUND.net.design,g=clamp(v/25,.2,1);
    return mesh?{lp:D.lp,modes:[{f:D.meshHz,a:.6*g,t0:0,tau:D.meshTau}],noise:[{t0:0,a:g,f:D.meshNoise,q:.7,tau:D.meshTau}]}
      :{lp:D.lp,modes:D.tapeHz.map((f,i)=>({f,a:.3*g,t0:.002,tau:D.tapeTau*(1+i)})),noise:[{t0:0,a:.8*g,f:D.tapeNoise,q:1,tau:.002}]};
  }
  // a racket hit: one of the recorded hits, softest to hardest by the shot's pace; pace sets its level and spin takes a
  // little off it (Paté: flat louder than spun; the sizes design)
  static hitClip(power,spin=0){
    const D=SOUND.hit.design,p=clamp(power,0,1),s=clamp(Math.abs(spin),0,1),n=HIT_SAMPLES.clips.length;
    return{i:Math.min(n-1,Math.floor(p*n)),gain:D.gain*lerp(D.level[0],1,p)*(1-D.spinQuiet*s)};
  }
  hit(power,spin=0,stroke='fh',pan=0){
    const h=TennisSfx.hitClip(power,spin),c=this.clips||(this.clips=[]);
    this.A.playBuffer(c[h.i]||(c[h.i]=this.A.decode(HIT_SAMPLES.clips[h.i].data,HIT_SAMPLES.rate)),pan,SOUND.hit.design.wet,h.gain);
  }
  bounce(v,pan=0,soft=1){this.play(TennisSfx.bounceSound(v,soft),SOUND.bounce.design,pan);}
  net(mesh,v,pan=0){const D=SOUND.net.design;this.play(TennisSfx.netSound(mesh,v),{gain:mesh?D.meshGain:D.tapeGain,wet:D.wet},pan);}
  // rubber on acrylic when a player stops or cuts hard: a short rising chirp with a wobble
  squeak(a=1,pan=0){
    const A=this.A,ac=A.ac,t=A.now,o=A.out(pan,.25,.4),d=.07+Math.random()*.08,f=2300+Math.random()*700,g=clamp(.03+a*.03,.03,.09);
    const s=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),eg=ac.createGain();
    s.type='sawtooth';s.frequency.setValueAtTime(f,t);s.frequency.linearRampToValueAtTime(f*1.35,t+d*.6);s.frequency.linearRampToValueAtTime(f*1.2,t+d);
    lfo.frequency.value=38+Math.random()*20;lg.gain.value=90;lfo.connect(lg).connect(s.frequency);
    const hp=ac.createBiquadFilter();hp.type='bandpass';hp.frequency.value=f*1.2;hp.Q.value=2;
    eg.gain.setValueAtTime(0,t);eg.gain.linearRampToValueAtTime(g,t+.01);eg.gain.setValueAtTime(g,t+d*.7);eg.gain.exponentialRampToValueAtTime(.0005,t+d);
    s.connect(hp).connect(eg).connect(o);s.start(t);lfo.start(t);s.stop(t+d+.05);lfo.stop(t+d+.05);
  }
  // feet sliding on clay
  slide(pan=0){const A=this.A,t=A.now,o=A.out(pan,.2,.5);A.burst(o,t,{type:'lowpass',f:1400,f2:350,q:.8,peak:.12,att:.02,rel:.28,pink:true});}
  // two tones that say "your turn"
  chime(){const A=this.A,t=A.now,o=A.out(0,.15,.6);A.tone(o,t,{f:880,peak:.07,rel:.22});A.tone(o,t+.14,{f:660,peak:.07,rel:.3});}
  click(){const A=this.A,t=A.now,o=A.out(0,.05,.2);A.tone(o,t,{f:1200,f2:900,peak:.05,rel:.04});}
}
