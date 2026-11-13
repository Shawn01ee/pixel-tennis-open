// ShotSolver — finds the launch that lands a ball on a target and clears the net
// finds the launch speed, elevation and direction that land a ball on a target and clear the net
class ShotSolver{
  constructor(physics){this.ph=physics;this.f=new Ball();}
  // first landing point of a launch from P, and the height it cleared the net by
  flight(P,vx,vy,vz,rpm,side){
    const f=this.f;f.x=P.x;f.y=P.y;f.z=P.z;f.vx=vx;f.vy=vy;f.vz=vz;f.setSpin(rpm,side);f.bc=0;f.rolling=false;
    let clear=9,pz=f.z;
    for(let i=0;i<700;i++){
      this.ph.stepOnce(f,DT,false);
      if(pz*f.z<=0&&pz!==0)clear=f.y-BALL.R-Court.netHeight(f.x);
      pz=f.z;
      if(f.bc>0)return{x:f.lbx,z:f.lbz,clear};
    }
    return{x:f.x,z:f.z,clear};
  }
  // o: v (m/s), rpm, side, clear (m over the tape), maxEl (rad)
  solve(P,T,o){
    let v=o.v,az=Math.atan2(T.x-P.x,T.z-P.z);
    const R0=Math.hypot(T.x-P.x,T.z-P.z),rpm=o.rpm||0,side=o.side||0,need=o.clear??.12,top=o.maxEl??.75;
    let res=null;
    for(let at=0;at<16;at++){
      const dx=Math.sin(az),dz=Math.cos(az);
      const rng_=el=>{const c=Math.cos(el),s=Math.sin(el),r=this.flight(P,v*c*dx,v*s,v*c*dz,rpm,side);r.r=(r.x-P.x)*dx+(r.z-P.z)*dz;return r;};
      let lo=-.55,hi=top;const rlo=rng_(lo),rhi=rng_(hi);
      if(rhi.r<R0){v*=1.07;continue;}          // cannot reach: hit harder
      if(rlo.r>R0){v*=.93;continue;}           // cannot keep it short: hit softer
      let r=rhi,el=hi;
      for(let i=0;i<13;i++){el=(lo+hi)/2;r=rng_(el);if(r.r<R0)lo=el;else hi=el;}
      const lat=(r.x-P.x)*dz-(r.z-P.z)*dx;az-=Math.atan2(lat,R0);
      res={v,el,az,clear:r.clear,lx:r.x,lz:r.z};
      if(r.clear<need&&v>6){v*=.95;continue;}   // too flat over the tape: take pace off
      break;
    }
    return res||{v,el:.25,az,clear:0};
  }
}
