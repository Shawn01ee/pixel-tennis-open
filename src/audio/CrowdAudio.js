// CrowdAudio — fifteen thousand people as filtered noise: the murmur, applause as many single claps,
// cheers and roars through vowel formants with whistles on top, an "ooh", a gasp, a groan
class CrowdAudio{
  constructor(A){this.A=A;this.bed=null;this.clapRate=0;this.clapHold=0;this.acc=0;}
  init(){
    if(this.bed||!this.A.ready)return;const A=this.A,ac=A.ac;
    const s=ac.createBufferSource();s.buffer=A.pink;s.loop=true;
    const f1=ac.createBiquadFilter();f1.type='bandpass';f1.frequency.value=420;f1.Q.value=.8;
    const f2=ac.createBiquadFilter();f2.type='bandpass';f2.frequency.value=1150;f2.Q.value=1.2;
    this.bed=ac.createGain();this.bed.gain.value=0;const mix=ac.createGain();
    s.connect(f1).connect(mix);s.connect(f2).connect(mix);mix.connect(this.bed);this.bed.connect(A.dry);const w=ac.createGain();w.gain.value=.5;this.bed.connect(w).connect(A.send);s.start();
  }
  // the murmur follows the mood; claps are scheduled a few at a time while applause lasts
  update(dt,mood){
    if(!this.bed)return;const A=this.A,t=A.now;
    this.bed.gain.setTargetAtTime(.012+mood.level*.07,t,.25);
    if(this.clapHold>0)this.clapHold-=dt;else this.clapRate*=Math.exp(-dt*1.3);
    if(this.clapRate<4)return;
    this.acc+=this.clapRate*dt;const n=Math.min(40,Math.floor(this.acc));this.acc-=n;
    for(let i=0;i<n;i++){const o=A.out((Math.random()*2-1)*.9,.55,.2);A.burst(o,t+Math.random()*dt,{f:900+Math.random()*1900,q:1.4+Math.random(),peak:.025+Math.random()*.04,att:.001,rel:.012+Math.random()*.02});}
  }
  applause(p){this.clapRate=Math.max(this.clapRate,40+p*900);this.clapHold=Math.max(this.clapHold,.4+p*2.2);}
  // noise through three vowel formants, swelling and fading; f: [F1,F2,F3] at the start and end
  vowel(p,{dur=2,att=.15,from=[700,1200,2600],to=from,peak=.3,pan=0}){
    const A=this.A,ac=A.ac,t=A.now,o=A.out(pan,.6,dur+.5),s=ac.createBufferSource(),g=ac.createGain();
    s.buffer=A.pink;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak*p,t+att);g.gain.setTargetAtTime(0,t+att+dur*.25,dur*.3);
    [.9,.55,.25].forEach((k,i)=>{const f=ac.createBiquadFilter(),fg=ac.createGain();f.type='bandpass';f.Q.value=4+i*2;f.frequency.setValueAtTime(from[i],t);f.frequency.linearRampToValueAtTime(to[i],t+dur*.7);fg.gain.value=k;s.connect(f).connect(fg).connect(g);});
    g.connect(o);s.start(t,Math.random()*3,dur+.4);
  }
  cheer(p){this.vowel(p,{dur:1.6+p*1.6,from:[680,1150,2500],to:[740,1250,2700],peak:.35});this.applause(p*.8);if(p>.5)this.whistles(Math.round(p*3));}
  roar(p){this.vowel(p,{dur:3.2,att:.25,from:[650,1100,2450],to:[760,1300,2800],peak:.5});this.vowel(p*.7,{dur:3,att:.3,from:[500,900,2200],peak:.3});this.applause(1);this.whistles(6);}
  ooh(p){this.vowel(p,{dur:1.1,att:.28,from:[310,820,2250],to:[360,900,2300],peak:.32});}
  groan(p){this.vowel(p,{dur:1.2,att:.12,from:[720,1250,2500],to:[480,900,2300],peak:.26});}
  gasp(p){const A=this.A,o=A.out(0,.4,.6);A.burst(o,A.now,{f:2200,q:1.2,peak:.1*p,att:.04,rel:.25,pink:true});}
  // a few fans whistling through their fingers
  whistles(n){const A=this.A;for(let i=0;i<n;i++){const t=A.now+Math.random()*.9,o=A.out((Math.random()*2-1)*.8,.5,1.6),f=1900+Math.random()*1300;
    A.tone(o,t,{f,f2:f*(Math.random()<.5?1.25:.8),peak:.025,att:.04,rel:.35+Math.random()*.4});}}
}
