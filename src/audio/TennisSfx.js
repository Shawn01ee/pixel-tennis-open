// TennisSfx — the sounds of the game itself: strings, bounces, the net, shoes on a hard court, the menu's notes.
// The racket hit and the bounce are real recordings (hitSamples.js, bounceSamples.js; where they come from:
// SoundData.js), and so are the players' shoes, a different one on each court. The net rings at made-up frequencies
// (ImpactVoice, design); the menu's notes are built from oscillators (design).
class TennisSfx{
  constructor(A){this.A=A;this.v=null;}
  get voice(){return this.v||(this.v=new ImpactVoice(this.A.ac.sampleRate));}
  play(S,D,pan){this.A.play(this.voice.render(S,D.gain),pan,D.wet);}
  // into the mesh: a dull whack; off the tape: a tick and a shiver
  static netSound(mesh,v){
    const D=SOUND.net.design,g=clamp(v/25,.2,1);
    return mesh?{lp:D.lp,modes:[{f:D.meshHz,a:.6*g,t0:0,tau:D.meshTau}],noise:[{t0:0,a:g,f:D.meshNoise,q:.7,tau:D.meshTau}]}
      :{lp:D.lp,modes:D.tapeHz.map((f,i)=>({f,a:.3*g,t0:.002,tau:D.tapeTau*(1+i)})),noise:[{t0:0,a:.8*g,f:D.tapeNoise,q:1,tau:.002}]};
  }
  // a recorded sound, decoded once
  buf(S,i){const c=this.bufs||(this.bufs=new Map()),k=S.clips[i];if(!c.has(k))c.set(k,this.A.decode(k.data,S.rate));return c.get(k);}
  // a racket hit: the recorded hit (the hardest of them, if there are several, for the hardest shots); pace sets its
  // level and spin takes a little off it (Paté: flat louder than spun; the sizes design)
  static hitClip(power,spin=0){
    const D=SOUND.hit.design,p=clamp(power,0,1),s=clamp(Math.abs(spin),0,1),n=HIT_SAMPLES.clips.length;
    return{i:Math.min(n-1,Math.floor(p*n)),gain:D.gain*lerp(D.level[0],1,p)*(1-D.spinQuiet*s)};
  }
  hit(power,spin=0,stroke='fh',pan=0){const h=TennisSfx.hitClip(power,spin),D=SOUND.hit.design;this.A.playBuffer(this.buf(HIT_SAMPLES,h.i),pan,D.wet,h.gain,D.rate,D.filter);}
  // a bounce: one of the recorded bounces, softest to hardest by how fast the ball comes down, its level by the same
  // (design); a ball dropped dead (soft) at half
  static bounceClip(v,soft=1){
    const D=SOUND.bounce.design,g=clamp((v-1)/12,.08,1)*soft,n=BOUNCE_SAMPLES.clips.length;
    return{i:Math.min(n-1,Math.floor(g*n)),gain:D.gain*g};
  }
  bounce(v,pan=0,soft=1){const b=TennisSfx.bounceClip(v,soft);this.A.playBuffer(this.buf(BOUNCE_SAMPLES,b.i),pan,SOUND.bounce.design.wet,b.gain);}
  net(mesh,v,pan=0){const D=SOUND.net.design;this.play(TennisSfx.netSound(mesh,v),{gain:mesh?D.meshGain:D.tapeGain,wet:D.wet},pan);}
  // a player's shoes as he stops or cuts hard: a squeak on a hard court, a slide on clay, a brush of grass (a, 0–1: how
  // hard the stop)
  shoe(court,a=1,pan=0){
    const S={hard:SQUEAK_SAMPLES,clay:SLIDE_SAMPLES,grass:GRASS_SAMPLES}[court]||SQUEAK_SAMPLES,Z=SOUND.shoe,D=Z[court]||Z.hard;
    const i=Math.floor(Math.random()*S.clips.length),rate=1+(Math.random()-.5)*Z.vary;
    this.A.playBuffer(this.buf(S,i),pan,D.wet,D.gain*lerp(Z.level[0],Z.level[1],clamp(a,0,1)),rate,D.filter||null);
  }
  // two tones that say "your turn"
  chime(){const A=this.A,t=A.now,o=A.out(0,.15,.6);A.tone(o,t,{f:880,peak:.07,rel:.22});A.tone(o,t+.14,{f:660,peak:.07,rel:.3});}
  click(){const A=this.A,t=A.now,o=A.out(0,.05,.2);A.tone(o,t,{f:1200,f2:900,peak:.05,rel:.04});}
}
