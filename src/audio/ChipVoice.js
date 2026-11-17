// ChipVoice — plays a short score the way the NES's sound chip would: two square-wave "pulse" channels with four duty
// cycles and 16 volume steps, their pitch held to the chip's own timer grid; a noise channel from a 15-bit shift
// register clocked at one of 16 rates (or its short, metallic loop); the chip's non-linear mixer; the console's output
// filters (SOUND.chip). One liberty: notes and volume steps may change at any sample, where the real console steps its
// envelopes at fractions of a video frame — otherwise a ball on the strings for 4 ms could not be heard as such.
// A note: {ch:'p1'|'p2'|'noise', at, dur (s), vol (0–15), to (volume at the end, default vol)} and, for a pulse
// channel, f (Hz) and duty (0–3); for noise, per (0–15) and short (the 93-step loop). Returns raw samples.
class ChipVoice{
  constructor(rate){this.rate=rate;}
  // the pitch a pulse channel really plays nearest to f: CPU/(16(t+1)) for an 11-bit timer t (below 8 it is silent)
  static pulseHz(f){const K=SOUND.chip,t=clamp(Math.round(K.cpu/(16*f)-1),K.timer[0],K.timer[1]);return K.cpu/(16*(t+1));}
  render(notes,gain=1){
    const r=this.rate,K=SOUND.chip,end=Math.max(...notes.map(n=>n.at+n.dur)),N=Math.ceil((end+.012)*r);
    const L={p1:new Uint8Array(N),p2:new Uint8Array(N),noise:new Uint8Array(N)};
    for(const n of notes){
      const i0=Math.round(n.at*r),i1=Math.min(N,Math.round((n.at+n.dur)*r)),span=Math.max(1,i1-i0),v0=n.vol,v1=n.to??n.vol,out=L[n.ch];
      const vol=i=>clamp(Math.round(v0+(v1-v0)*(i-i0)/span),0,15);
      if(n.ch==='noise'){
        // the shift register starts at 1 (power-up); feedback is bit 0 XOR bit 1, or bit 6 in the short mode; the
        // channel sounds while bit 0 is clear
        const step=K.cpu/K.noise[n.per]/r,fb=n.short?6:1;let reg=1,acc=0;
        for(let i=i0;i<i1;i++){acc+=step;while(acc>=1){acc-=1;reg=(reg>>1)|(((reg^(reg>>fb))&1)<<14);}if(!(reg&1))out[i]=vol(i);}
      }else{
        const f=ChipVoice.pulseHz(n.f),seq=K.duty[n.duty??2];let ph=0;
        for(let i=i0;i<i1;i++){if(seq[Math.floor(ph*8)&7])out[i]=vol(i);ph+=f/r;ph-=Math.floor(ph);}
      }
    }
    // the mixer, then a first-order high-pass and low-pass as on the console's output
    const[pa,pb,pc]=K.pulseMix,[ta,,tn,tc]=K.tndMix,dt=1/r,rh=1/(TAU*K.highpass),rl=1/(TAU*K.lowpass),ah=rh/(rh+dt),al=dt/(rl+dt),o=new Float32Array(N);
    let xh=0,yh=0,yl=0;
    for(let i=0;i<N;i++){
      const p=L.p1[i]+L.p2[i],q=L.noise[i],x=(p?pa/(pb/p+pc):0)+(q?ta/(1/(q/tn)+tc):0);
      yh=ah*(yh+x-xh);xh=x;yl+=al*(yh-yl);o[i]=yl*gain;
    }
    return o;
  }
}
