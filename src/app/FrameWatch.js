// FrameWatch — keeps the picture as sharp as the device can draw smoothly. Frame times are gathered in windows of 180
// frames (about three seconds); a frame over 250 ms (loading, building a stadium, a tab left in the background) is not
// counted, and each window is judged by its median, not its mean, so a single stall can no longer coarsen the picture
// for good. A window slower than 38 ms a frame (under about 26 fps) makes the pixels a step coarser, at most twice; two
// windows in a row faster than 20 ms make them a step finer again. The first three seconds are not judged.
class FrameWatch{
  static WINDOW=180;static SLOW=38;static FAST=20;static MAX=2;static WARM=3000;static STALL=250;
  constructor(onChange){this.on=onChange;this.step=0;this.reset(0);}
  reset(now){this.d=[];this.prev=0;this.since=now;this.fast=0;}
  tick(now){
    const F=FrameWatch,dt=this.prev?now-this.prev:0;this.prev=now;if(!this.since)this.since=now;
    if(now-this.since<F.WARM||dt<=0||dt>F.STALL)return;
    this.d.push(dt);if(this.d.length<F.WINDOW)return;
    const s=this.d.sort((a,b)=>a-b),med=s[s.length>>1];this.d=[];
    if(med>F.SLOW&&this.step<F.MAX){this.step++;this.fast=0;this.on(this.step);}
    else if(med<F.FAST&&this.step>0){if(++this.fast>=2){this.step--;this.fast=0;this.on(this.step);}}
    else this.fast=0;
  }
}
