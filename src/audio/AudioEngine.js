// AudioEngine — the Web Audio graph: a master bus with a limiter, a stadium reverb, shared noise, and placement
// Every sound is built from oscillators and filtered noise at the moment it plays; nothing is loaded.
class AudioEngine{
  constructor(){this.ac=null;this.ready=false;this.muted=false;}
  start(){
    if(this.ac){this.resume();return;}
    try{
      const ac=new(window.AudioContext||window.webkitAudioContext)();this.ac=ac;
      this.master=ac.createGain();this.master.gain.value=.85;
      const lim=ac.createDynamicsCompressor();lim.threshold.value=-12;lim.knee.value=6;lim.ratio.value=6;lim.attack.value=.002;lim.release.value=.2;
      this.master.connect(lim).connect(ac.destination);
      this.dry=ac.createGain();this.dry.connect(this.master);
      // a big open bowl: a couple of seconds of diffuse tail after early reflections off the stands
      this.verb=ac.createConvolver();this.verb.buffer=this.impulse(2.4,2.8);this.send=ac.createGain();this.send.gain.value=.32;this.send.connect(this.verb).connect(this.master);
      this.white=this.noise(2,false);this.pink=this.noise(6,true);
      this.ready=true;
    }catch(e){this.ac=null;}
  }
  resume(){if(this.ac&&this.ac.state==='suspended')this.ac.resume();}
  setMuted(m){this.muted=m;if(this.ready)this.master.gain.setTargetAtTime(m?0:.85,this.now,.05);}
  get now(){return this.ac.currentTime;}
  // stereo noise with an exponential tail and a few early reflections
  impulse(sec,decay){
    const ac=this.ac,n=Math.floor(ac.sampleRate*sec),b=ac.createBuffer(2,n,ac.sampleRate);
    for(let c=0;c<2;c++){const d=b.getChannelData(c);
      for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay)*.5;
      for(const ms of[17,31,46,63,88])d[Math.floor(ac.sampleRate*ms/1000)+c*37]+=.6*(Math.random()<.5?-1:1);}
    return b;
  }
  // white, or pink (−3 dB/octave, Paul Kellet's filter) for crowd textures
  noise(sec,pink){
    const ac=this.ac,n=Math.floor(ac.sampleRate*sec),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(let i=0;i<n;i++){const w=Math.random()*2-1;
      if(!pink){d[i]=w*.5;continue;}
      b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926;}
    return b;
  }
  // an output for one sound: placed left–right by pan (−1..1), with a share sent to the reverb
  out(pan=0,wet=.25,until=1){
    const ac=this.ac,g=ac.createGain(),p=ac.createStereoPanner?ac.createStereoPanner():null,w=ac.createGain();
    if(p){p.pan.value=clamp(pan,-1,1);g.connect(p).connect(this.dry);}else g.connect(this.dry);
    w.gain.value=wet;g.connect(w).connect(this.send);
    setTimeout(()=>{try{g.disconnect();w.disconnect();if(p)p.disconnect();}catch(e){}},until*1000+250);
    return g;
  }
  // a burst of noise through a filter, shaped by an attack and an exponential release
  burst(dest,t,{type='bandpass',f=1000,q=1,peak=.3,att=.002,rel=.05,pink=false,f2=null}){
    const ac=this.ac,s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();
    s.buffer=pink?this.pink:this.white;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+att+rel);fl.Q.value=q;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+att);g.gain.exponentialRampToValueAtTime(.0005,t+att+rel);
    s.connect(fl).connect(g).connect(dest);s.start(t,Math.random()*(s.buffer.duration-1),att+rel+.05);
  }
  // a pitched tone with a glide and an exponential release
  tone(dest,t,{type='sine',f=440,f2=null,peak=.2,att=.002,rel=.08}){
    const ac=this.ac,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+att+rel);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+att);g.gain.exponentialRampToValueAtTime(.0005,t+att+rel);
    o.connect(g).connect(dest);o.start(t);o.stop(t+att+rel+.05);
  }
}
