// Locomotion — how a person moves, as a character controller: a sprint curve, braking, cutting, arrival and turning
// The push a runner can make falls as speed rises (force–velocity), so from rest v(t) = vmax·(1 − e^(−t/τ)).
// Slowing down and changing direction use separate, harder limits: a planted foot brakes better than it pushes.
// Kinematic and exact, like a game character controller; there are no rigid bodies to tune or to tunnel.
class Locomotion{
  // vmax m/s top speed · tau s sprint time constant (push at rest = vmax/τ) · brake m/s² · cut m/s² sideways · turn rad/s
  constructor(vmax,tau,brake,cut=brake*.85,turnRate=8){this.vmax=vmax;this.tau=tau;this.brake=brake;this.cut=cut;this.turnRate=turnRate;this.a0=vmax/tau;}
  // a tour player: top speed 5.5–6.5 m/s; an explosive first step out of the split step (13–17 m/s²) that fades with speed
  static forProfile(st){const vmax=st.v*.9;return new Locomotion(vmax,vmax/(st.a*1.2),st.a,st.a*.9,8);}
  // walkers: ball kids, players between points. Cached by speed.
  static walker(v){
    let L=Locomotion.CACHE.get(v);
    if(!L){L=v<2?new Locomotion(v,.32,3.2,3,7):new Locomotion(v,.42,6,5,8);Locomotion.CACHE.set(v,L);}
    return L;
  }
  // time to cover d metres from rest at full effort, exactly as step() moves: the sprint curve while the push
  // is above its floor, then a steady push up to top speed, then cruising
  timeTo(d){
    if(d<.02)return 0;const v=this.vmax,T=this.tau,F=Locomotion.FLOOR;
    const t1=-T*Math.log(F),d1=v*(t1-T*(1-F));
    if(d<=d1){let t=d/v+T;for(let i=0;i<6;i++){const e=Math.exp(-t/T);t-=(v*(t-T*(1-e))-d)/(v*(1-e));}return Math.max(0,t);}
    const a2=F*this.a0,v1=v*(1-F),t2=(v-v1)/a2,d2=v1*t2+.5*a2*t2*t2;
    if(d<=d1+d2)return t1+(Math.sqrt(v1*v1+2*a2*(d-d1))-v1)/a2;
    return t1+t2+(d-d1-d2)/v;
  }
  // one step toward (gx,gz) for anything with x, z, vx, vz; arrive slows to a stop on the goal. Returns the distance left.
  step(b,gx,gz,dt,{arrive=true,slide=1,vmax=this.vmax}={}){
    const dx=gx-b.x,dz=gz-b.z,d=hyp(dx,dz);
    let want=vmax;if(arrive)want=Math.min(want,Math.sqrt(2*this.brake*slide*.9*Math.max(0,d-.02)));
    const ux=d>1e-4?dx/d:0,uz=d>1e-4?dz/d:0;
    let ax=ux*want-b.vx,az=uz*want-b.vz;const sp=hyp(b.vx,b.vz);
    if(sp>.05){
      // along the run: push (weaker as speed rises) or brake; across it: the cutting limit
      const hx=b.vx/sp,hz=b.vz/sp;let ap=ax*hx+az*hz,qx=ax-ap*hx,qz=az-ap*hz;
      const lp=(ap>0?this.a0*Math.max(Locomotion.FLOOR,1-sp/this.vmax):this.brake*slide)*dt;ap=clamp(ap,-lp,lp);
      const lq=this.cut*slide*dt,q=hyp(qx,qz);if(q>lq){qx*=lq/q;qz*=lq/q;}
      ax=ap*hx+qx;az=ap*hz+qz;
    }else{const l=this.a0*dt,am=hyp(ax,az);if(am>l){ax*=l/am;az*=l/am;}}
    b.vx+=ax;b.vz+=az;b.x+=b.vx*dt;b.z+=b.vz*dt;
    return d;
  }
  // coast to a stop with nowhere to go
  settle(b,dt){const sp=hyp(b.vx,b.vz);if(sp<.05){b.vx=b.vz=0;return;}const k=Math.max(0,sp-this.brake*dt)/sp;b.vx*=k;b.vz*=k;b.x+=b.vx*dt;b.z+=b.vz*dt;}
}
Locomotion.CACHE=new Map();
// the push never falls below this share of the first step's, so a runner does reach top speed
Locomotion.FLOOR=.12;
