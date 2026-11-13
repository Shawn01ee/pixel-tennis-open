// Agent — anything that walks: players between points, ball kids, the umpire
// Paths are followed through Locomotion, so people speed up, slow down and turn instead of gliding.
class Agent{
  constructor(x,z,o={}){this.x=x;this.z=z;this.y=0;this.vx=0;this.vz=0;this.yaw=0;this.spd=0;this.phase=R()*6;this.pose='stand';this.path=[];this.vmax=2.4;this.look=null;this.h=1.75;this.mode='walk';Object.assign(this,o);this.keep();}
  // remember this tick's transform so the view can draw between ticks
  keep(){this.ox=this.x;this.oz=this.z;this.oy=this.y;this.oyaw=this.yaw;}
  follow(dt){
    const L=Locomotion.walker(this.vmax);
    if(!this.path.length){L.settle(this,dt);this.spd=hyp(this.vx,this.vz);return;}
    const p=this.path[0],last=this.path.length===1,d=L.step(this,p.x,p.z,dt,{arrive:last});
    const sp=hyp(this.vx,this.vz);
    if(last?d<.06&&sp<.3:d<.4){if(last){this.x=p.x;this.z=p.z;this.vx=this.vz=0;}this.path.shift();}
    if(sp>.15)this.yaw=turn(this.yaw,Math.atan2(this.vx,this.vz),L.turnRate*dt);
    this.spd=hyp(this.vx,this.vz);this.phase+=this.spd/1.5*dt*TAU/2;
  }
}
