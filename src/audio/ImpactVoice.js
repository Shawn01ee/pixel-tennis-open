// ImpactVoice — renders a struck object the way it really rings: a sum of decaying vibration modes (each a sine at a
// measured frequency) and a burst of filtered noise for the moment of impact, softened by a gentle low-pass. No square
// waves and no bit crushing: both were tried and made a harsh crackle.
// A sound: {modes:[{f, a, t0, tau, tau2, a2, cycles}], noise:[{t0, a, f, q, tau}], lp (Hz)}. A mode starts at t0
// (s) with amplitude a, dying with time constant tau, and an optional second, slower part a2/tau2 (the ring); with
// cycles it is a single smooth pulse of that many cycles instead. Returns raw samples.
class ImpactVoice{
  constructor(rate){this.rate=rate;}
  render(S,gain=1){
    const r=this.rate,ends=[...(S.modes||[]).map(m=>m.t0+(m.cycles?m.cycles/m.f:7*Math.max(m.tau,m.tau2||0))),...(S.noise||[]).map(n=>n.t0+7*n.tau)];
    const N=Math.ceil((Math.max(...ends)+.005)*r),o=new Float64Array(N),att=.0002;
    for(const m of S.modes||[]){const i0=Math.round(m.t0*r),w=TAU*m.f/r,len=m.cycles?Math.round(m.cycles/m.f*r):N-i0;
      for(let j=0;j<len&&i0+j<N;j++){const t=j/r,e=m.cycles?Math.sin(PI*j/len)**2:(1-Math.exp(-t/att))*(m.a*Math.exp(-t/m.tau)+(m.a2||0)*Math.exp(-t/(m.tau2||1)))/m.a;
        o[i0+j]+=m.a*e*Math.sin(w*j);}}
    // noise through a two-pole band-pass (RBJ cookbook), dying exponentially; a fixed seed, so a sound is the same each time
    let seed=12345;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x3fffffff-1;};
    for(const n of S.noise||[]){const i0=Math.round(n.t0*r),w0=TAU*n.f/r,al=Math.sin(w0)/(2*n.q),a0=1+al,b0=al/a0,b2=-al/a0,a1=-2*Math.cos(w0)/a0,a2=(1-al)/a0;
      let x1=0,x2=0,y1=0,y2=0;for(let j=0;i0+j<N&&j<7*n.tau*r;j++){const x=rnd()*Math.exp(-j/r/n.tau),y=b0*x+b2*x2-a1*y1-a2*y2;x2=x1;x1=x;y2=y1;y1=y;o[i0+j]+=n.a*y;}}
    // a first-order low-pass takes the edge off the top
    const k=S.lp?1-Math.exp(-TAU*S.lp/r):1,out=new Float32Array(N);let y=0;
    for(let i=0;i<N;i++){y+=k*(o[i]-y);out[i]=y*gain;}
    return out;
  }
}
