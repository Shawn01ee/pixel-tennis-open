// BallPhysics — integrates a ball through air, bounces it, and catches it in the net
class BallPhysics{
  constructor(surface=SURFACES.hard){this.surface=surface;this.a=[0,0,0];}
  // one step, split finer near the net so the tape is never tunnelled; returns HIT bits
  step(b,dt=DT,useNet=true){
    const n=(useNet&&Math.abs(b.z)<1.6&&Math.abs(b.vz)>0)?6:1;let ev=0;
    for(let i=0;i<n;i++)ev|=this.stepOnce(b,dt/n,useNet);
    return ev;
  }
  // midpoint integration of drag, Magnus lift and gravity
  stepOnce(b,dt,useNet){
    const a=this.a;let ev=0;
    Aero.accel(b,b.vx,b.vy,b.vz,a);
    const hx=b.vx+a[0]*dt/2,hy=b.vy+a[1]*dt/2,hz=b.vz+a[2]*dt/2;
    Aero.accel(b,hx,hy,hz,a);
    const px=b.x,py=b.y,pz=b.z,ovx=b.vx,ovy=b.vy,ovz=b.vz;
    b.x+=hx*dt;b.y+=hy*dt;b.z+=hz*dt;
    b.vx+=a[0]*dt;b.vy+=a[1]*dt;b.vz+=a[2]*dt;
    if(useNet&&Math.abs(b.x)<CT.POST&&!b.net4)ev|=this.net(b,pz);
    if(b.y<BALL.R&&b.vy<0){
      if(b.vy>-.45){b.y=BALL.R;b.vy=0;b.rolling=true;}
      else{
        // the ball met the court part-way through this step: go back to that instant, bounce there, then fly out the
        // rest of the step — so the mark it leaves is where it truly landed, not up to a step's travel beyond
        const f=py>BALL.R?clamp((py-BALL.R)/(py-b.y),0,1):0,rem=dt*(1-f);
        b.x=px+(b.x-px)*f;b.z=pz+(b.z-pz)*f;b.y=BALL.R;
        b.vx=ovx+(b.vx-ovx)*f;b.vy=ovy+(b.vy-ovy)*f;b.vz=ovz+(b.vz-ovz)*f;
        this.bounce(b);b.bc++;ev|=HIT.BOUNCE;
        if(rem>0){Aero.accel(b,b.vx,b.vy,b.vz,a);b.x+=(b.vx+a[0]*rem/2)*rem;b.y+=(b.vy+a[1]*rem/2)*rem;b.z+=(b.vz+a[2]*rem/2)*rem;b.vx+=a[0]*rem;b.vy+=a[1]*rem;b.vz+=a[2]*rem;
          if(b.y<BALL.R){b.y=BALL.R;if(b.vy<0)b.vy=0;}}
      }
    }
    if(b.rolling){const f=Math.exp(-this.surface.roll*dt);b.vx*=f;b.vz*=f;b.y=BALL.R;b.vy=0;}
    const dec=Math.exp(-dt/14);b.wx*=dec;b.wy*=dec;b.wz*=dec;
    return ev;
  }
  // friction impulse at the contact patch: the ball slides, then grips if the impulse is enough to stop the slip
  bounce(b){
    const s=this.surface,vn=-b.vy,e=s.restitution(vn,b.x,b.z);
    b.lbx=b.x;b.lbz=b.z;b.lvx=b.vx;b.lvz=b.vz;
    b.vy=e*vn;
    const ux=b.vx+b.wz*BALL.R,uz=b.vz-b.wx*BALL.R,um=Math.hypot(ux,uz);
    if(um>1e-4){
      const J=Math.min(s.mu*(1+e)*vn,.4*um),jx=-ux/um*J,jz=-uz/um*J,al=2/3;
      b.vx+=jx;b.vz+=jz;b.wx+=-jz/(al*BALL.R);b.wz+=jx/(al*BALL.R);
    }
    b.y=BALL.R;
  }
  // the mesh stops the ball dead; the tape is a stiff, lossy cylinder
  net(b,pz){
    const crossed=pz*b.z<=0||Math.abs(b.z)<BALL.R+TAPE_R;if(!crossed)return 0;
    const hc=Court.netHeight(b.x)-.012,dy=b.y-hc,dz=b.z,d=Math.sqrt(dy*dy+dz*dz),rr=BALL.R+TAPE_R;
    if(b.y<hc-BALL.R*.45){
      if(Math.abs(b.z)>=BALL.R+.01)return 0;
      b.z=(pz<0?-1:1)*(BALL.R+.012);b.vz*=-.08;b.vx*=.4;b.vy*=.35;b.wx*=.2;b.wy*=.2;b.wz*=.2;
      b.net4=true;b.net|=HIT.MESH;return HIT.MESH;
    }
    if(d<rr&&d>1e-5){
      const ny=dy/d,nz=dz/d,vn=b.vy*ny+b.vz*nz;let ev=0;
      if(vn<0){const k=1.3*vn;b.vy-=k*ny;b.vz-=k*nz;b.vx*=.88;b.wx*=.5;b.wz*=.5;b.net|=HIT.TAPE;ev=HIT.TAPE;}
      b.y=hc+ny*(rr+1e-3);b.z=nz*(rr+1e-3);
      return ev;
    }
    return 0;
  }
}
