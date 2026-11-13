// Gait — footfalls for one figure, so feet never slide and never get left behind
// One clock drives both legs, half a cycle apart. Each leg spends the first part of its cycle planted (stance) and the
// rest swinging to where the body will be halfway through its next stance. A planted foot is locked to the ground.
// Cadence and stride follow speed: a walk is ~2.5 steps/s with the stances overlapping, a sprint ~4.4 steps/s with
// both feet briefly in the air. Side-on movement shuffles with quicker, shorter steps. Standing still, a foot that
// strays steps back under the body. A split step is a small hop that lands wide, timed to the opponent's hit.
class Gait{
  static HOP=.3;   // seconds in the air for a split step
  constructor(){this.feet=[Gait.foot(),Gait.foot()];this.ready=false;this.cycle=0;this.bob=0;this.arm=0;this.lift=0;this.moving=false;this.hopT=-1;}
  static foot(){return{x:0,z:0,y:0,fx:0,fz:0,u:1,armed:true,st:0};}
  static cadence(v){return clamp(1.9+v*.45,1.9,4.6);}
  // start a split step unless one is under way
  hop(){if(this.hopT<0)this.hopT=0;}
  // a: the drawn figure {x,z,yaw,vx,vz}; dt: simulated seconds since the last update; k: body scale; width: half stance
  update(a,dt,k=1,width=.13){
    const fx=Math.sin(a.yaw),fz=Math.cos(a.yaw),rx=-fz,rz=fx,vx=a.vx||0,vz=a.vz||0,v=hyp(vx,vz),F=this.feet;
    const home=(i,w=width*k)=>{const s=i?1:-1;return[a.x+rx*s*w,a.z+rz*s*w];};
    // a foot further away than a leg can reach (a teleport) is put back under the body;
    // with the clock paused no step can be taken, so the feet simply stay under the body
    if(!this.ready||F.some(f=>hyp(f.x-a.x,f.z-a.z)>(dt<=0?.5:f.u>=1?1.25:1.8)*k)){F.forEach((f,i)=>{[f.x,f.z]=home(i);f.u=1;f.y=0;});this.ready=true;}
    if(dt<=0)return this;
    const moving=v>.2,ux=moving?vx/v:0,uz=moving?vz/v:0,side=moving?Math.abs(ux*rx+uz*rz):0,run=clamp((v-1.6)/3,0,1);
    // hopping: both feet leave the ground together and come down wide
    let air=0;
    if(this.hopT>=0){this.hopT+=dt;const q=this.hopT/Gait.HOP;
      if(q<1)air=Math.sin(PI*q);
      this.lift=q<1?air*.06*k:-Math.sin(PI*Math.min(1,(q-1)/.6))*.04*k;
      if(q>=1.6){this.hopT=-1;this.lift=0;}
    }else this.lift=0;
    if(moving){
      // stance is cut short at speed so a planted foot never trails further than the leg reaches: a sprinter's 0.13 s contact
      const cad=Gait.cadence(v)*(v<3.5?lerp(1,1.35,side):1),T=2/cad,beta=Math.min(lerp(.62,.36,run),.72*k/(v*T)),half=v*beta*T/2,frac=x=>x-Math.floor(x);
      // setting off: the foot that is further back steps first
      if(!this.moving){const back=i=>(F[i].x-a.x)*ux+(F[i].z-a.z)*uz,first=back(0)<=back(1)?0:1;this.cycle=Math.floor(this.cycle)+frac(beta-first*.5+1);F[first].armed=true;F[first^1].armed=false;}
      this.cycle+=dt/T;
      const h=lerp(.05,.22,run)*clamp(v/.8,.4,1)*k,dur=(1-beta)*T;
      for(let i=0;i<2;i++){const f=F[i],o=F[i^1],p=frac(this.cycle+i*.5);
        if(f.u>=1){
          f.y=air*.03*k;f.st+=dt;if(p<beta||f.st>=.5*beta*T)f.armed=true;
          // its turn on the clock — or it has been left too far behind (a burst of speed, a turn) and steps at once
          const[hx,hz]=home(i),off=hyp(f.x-hx,f.z-hz),far=off>.62*k||(off>Math.max(.5*k,half+.12*k)&&(run>.3||o.u>=1||o.u>.4));
          const turn=p>=beta&&f.armed;
          if(turn||far){f.fx=f.x;f.fz=f.z;f.u=0;f.armed=false;f.st=0;
            // an early step resets the rhythm to this foot, so the other still follows half a cycle later
            if(!turn){this.cycle+=frac(beta-p+1);o.armed=o.u>=1&&frac(this.cycle+(i^1)*.5)<beta;}}
        }
        if(f.u<1){
          f.u=Math.min(1,f.u+dt/dur);const[hx,hz]=home(i),e=lerp(sstep(0,1,f.u),f.u*(2-f.u),run),lead=(1-f.u)*dur*v*.5+half;
          f.x=lerp(f.fx,hx+ux*lead,e);f.z=lerp(f.fz,hz+uz*lead,e);
          // (at a run the foot leaves the ground fast and floats in to land; at a walk it eases both ways)
          // the heel kicks up early in the swing, the foot reaches forward low before it lands
          f.y=f.u<1?Math.sin(PI*Math.pow(f.u,.8))*h:0;
        }
      }
      const st=frac(this.cycle*2);this.bob=Math.sin(PI*st)*lerp(.018,.05,run);
    }else{
      // standing: a foot in the air comes down under the body; one that has strayed steps back
      const wide=this.hopT>=0&&air>0;
      for(let i=0;i<2;i++){const f=F[i];
        if(wide){const[hx,hz]=home(i,Math.max(width,.24)*k),g=Math.min(1,dt*14);f.x+=(hx-f.x)*g;f.z+=(hz-f.z)*g;f.y=air*.05*k;f.u=.5;f.fx=f.x;f.fz=f.z;continue;}
        if(f.u<1){f.u=Math.min(1,f.u+dt/.16);const[hx,hz]=home(i),e=sstep(0,1,f.u);f.x=lerp(f.fx,hx,e);f.z=lerp(f.fz,hz,e);f.y=f.u<1?Math.sin(PI*f.u)*.06*k:0;}
        else f.y=0;}
      if(!wide&&F[0].u>=1&&F[1].u>=1){let worst=-1,err=.17*k;
        for(let i=0;i<2;i++){const[hx,hz]=home(i),e=hyp(F[i].x-hx,F[i].z-hz);if(e>err){err=e;worst=i;}}
        if(worst>=0){const f=F[worst];f.fx=f.x;f.fz=f.z;f.u=0;}}
      this.bob=0;
    }
    this.moving=moving;this.arm=this.cycle*TAU;
    return this;
  }
  // the most a planted foot has moved since the last call: zero by construction, measured by the tests
  static drift(prev,now){let d=0;for(let i=0;i<2;i++)if(prev[i].u>=1&&now[i].u>=1)d=Math.max(d,hyp(prev[i].x-now[i].x,prev[i].z-now[i].z));return d;}
}
