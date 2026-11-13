// TennisSfx — the sounds of the game itself: strings, bounces, the net, shoes on a hard court
class TennisSfx{
  constructor(A){this.A=A;}
  // a crack of broadband noise from the strings, the string bed ringing, and the frame's thump.
  // Pace makes it louder and brighter; slice is duller and softer; a serve or smash carries the most.
  hit(power,spin=0,stroke='fh',pan=0){
    const A=this.A,t=A.now,o=A.out(pan,.2,.3),p=clamp(power,0,1),slice=spin<-.25||stroke==='slice',big=stroke==='serve'||stroke==='smash';
    const k=(slice?.65:1)*(big?1.15:1);
    A.burst(o,t,{f:(slice?1700:2500)+p*1500,q:1.3,peak:(.28+p*.5)*k,rel:.03+p*.025});
    A.burst(o,t,{type:'highpass',f:5000,q:.7,peak:(.06+p*.12)*k,rel:.012});
    A.tone(o,t,{type:'triangle',f:560+p*300-(slice?90:0),f2:400,peak:(.12+p*.1)*k,rel:.07});
    A.tone(o,t,{f:180+p*50,f2:95,peak:.22*k,rel:.06});
  }
  // the ball on the court: a low hollow "thock" and a short scuff, by impact speed
  bounce(v,pan=0,soft=1){
    const A=this.A,t=A.now,o=A.out(pan,.25,.3),g=clamp((v-1)/12,.08,1)*soft;
    A.tone(o,t,{f:250+g*60,f2:125,peak:.3*g,rel:.07});
    A.burst(o,t,{type:'lowpass',f:1800,q:.7,peak:.12*g,rel:.03});
  }
  // into the mesh: a muffled thud and a rattle; off the tape: a tick and a shiver
  net(mesh,v,pan=0){
    const A=this.A,t=A.now,o=A.out(pan,.3,.5),g=clamp(v/25,.2,1);
    if(mesh){A.tone(o,t,{f:120,f2:70,peak:.3*g,rel:.12});A.burst(o,t,{f:380,q:3,peak:.18*g,att:.004,rel:.22});}
    else{A.burst(o,t,{type:'highpass',f:3200,q:1,peak:.2*g,rel:.015});A.tone(o,t,{type:'triangle',f:900,f2:600,peak:.08*g,rel:.06});A.burst(o,t+.01,{f:600,q:4,peak:.08*g,att:.003,rel:.16});}
  }
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
