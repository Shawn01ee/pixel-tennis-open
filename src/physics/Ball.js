// Ball — a tennis ball: position, velocity, spin, bounce bookkeeping
class Ball{
  constructor(x=0,y=1,z=0){this.x=x;this.y=y;this.z=z;this.vx=0;this.vy=0;this.vz=0;this.wx=0;this.wy=0;this.wz=0;
    this.bc=0;this.net=0;this.net4=false;this.rolling=false;this.lbx=0;this.lbz=0;this.lvx=0;this.lvz=0;this.mode='free';this.still=false;}
  copy(b){for(const k of Ball.FIELDS)this[k]=b[k];return this;}
  // remember this tick's position so the view can draw between ticks
  keep(){this.ox=this.x;this.oy=this.y;this.oz=this.z;}
  get speed(){return Math.sqrt(this.vx*this.vx+this.vy*this.vy+this.vz*this.vz);}
  // topspin (rpm > 0) about the horizontal axis across the flight; side spin (rpm) about y
  setSpin(rpm,side=0){const h=Math.hypot(this.vx,this.vz)||1,w=rpm*RPM;this.wx=w*this.vz/h;this.wy=side*RPM;this.wz=-w*this.vx/h;}
  launch(v,el,az,rpm,side=0){const c=Math.cos(el);this.vx=v*c*Math.sin(az);this.vy=v*Math.sin(el);this.vz=v*c*Math.cos(az);
    this.setSpin(rpm,side);this.bc=0;this.net=0;this.net4=false;this.rolling=false;}
}
Ball.FIELDS=['x','y','z','vx','vy','vz','wx','wy','wz','bc','net','net4','rolling','lbx','lbz','lvx','lvz'];
