// CameraRig — the views: Court and Stadium (isometric diorama), Behind (perspective, over the shoulder), Follow (the court, leaning toward your player)
// The isometric views are orthographic, 30° down, turned in quarter steps on the diagonal and pixel-snapped.
// Court, Follow and Behind turn with the person's player so their end stays nearest, the umpire across the net.
// focus: {end, me:{x,z}, ball:{x,y,z}|null, bounce:{x,z}|null, opp:{x,z}}
class CameraRig{
  static MODES=['Court','Behind','Follow','Stadium'];
  static COURT=0;static BEHIND=1;static FOLLOW=2;static STADIUM=3;
  constructor(R){this.R=R;this.mode=CameraRig.COURT;this.k=0;this.az=PI/4;this.azFrom=PI/4;this.azTo=PI/4;this.turnT=1;this.el=30*PI/180;this.mul=1;this.ppm=10;
    this.cx=0;this.cy=0;this.cz=0;this.bx=0;this.started=false;}
  setMode(m){this.mode=m;this.mul=1;}
  turn(d){if(this.mode!==CameraRig.BEHIND)this.k+=d;}
  // camera on the +x side of the end it watches, so the umpire's chair on −x sits across the court
  goal(end){
    if(this.mode===CameraRig.STADIUM)return PI/4+this.k*PI/2;
    if(this.mode===CameraRig.BEHIND)return end>0?0:PI;
    return(end>0?PI/4:3*PI/4)+this.k*PI/2;
  }
  // screen-right and ground-forward (toward the camera) axes for an azimuth
  static axes(az){return{rx:Math.cos(az),rz:-Math.sin(az),fx:Math.sin(az),fz:Math.cos(az)};}
  fit(f){
    const RW=this.R.RW,RH=this.R.RH,portrait=RW<RH,C=Math.min(RW/(portrait?27:43),RH/(portrait?30:27));
    if(this.mode===CameraRig.STADIUM)return{ppm:Math.min(RW/80,RH/(portrait?64:56))*this.mul,x:0,y:2,z:0};
    if(this.mode===CameraRig.COURT)return{ppm:C*this.mul,x:0,y:.8,z:0};
    // Follow: the whole court, a little closer, leaning gently toward the person's player. It depends only on where
    // that player stands — never on the ball or the server — so it holds still through the serve and the rally.
    return{ppm:C*1.12*this.mul,x:f.me.x*.25,y:.8,z:f.me.z*.18};
  }
  update(dt,f,snap=false){
    const g=this.goal(f.end);
    let d=(g-this.azTo)%TAU;if(d>PI)d-=TAU;if(d<-PI)d+=TAU;
    if(Math.abs(d)>1e-3){this.azFrom=this.az;this.azTo=this.azTo+d;this.turnT=0;}
    if(snap)this.turnT=1;else if(this.turnT<1)this.turnT=Math.min(1,this.turnT+dt/.9);
    this.az=lerp(this.azFrom,this.azTo,sstep(0,1,this.turnT));
    const k=snap||!this.started?1:Math.min(1,dt*(this.mode===CameraRig.FOLLOW?2.6:5));this.started=true;
    FX.camD.value.set(Math.sin(this.az),Math.cos(this.az));
    if(this.mode===CameraRig.BEHIND)return this.behind(f,k);
    const t=this.fit(f);
    this.ppm+=(t.ppm-this.ppm)*k;this.cx+=(t.x-this.cx)*k;this.cy+=(t.y-this.cy)*k;this.cz+=(t.z-this.cz)*k;
    const az=this.az,ce=Math.cos(this.el),se=Math.sin(this.el),dx=Math.sin(az)*ce,dz=Math.cos(az)*ce;
    // snap the look-at point to whole render pixels in the view plane
    const rx=Math.cos(az),rz=-Math.sin(az),ux=-Math.sin(az)*se,uy=ce,uz=-Math.cos(az)*se;
    const a=this.cx*rx+this.cz*rz,b=this.cx*ux+this.cy*uy+this.cz*uz,sa=Math.round(a*this.ppm)/this.ppm,sb=Math.round(b*this.ppm)/this.ppm;
    const tx=sa*rx+sb*ux,ty=sb*uy,tz=sa*rz+sb*uz,cam=this.R.ortho;
    cam.position.set(tx+dx*140,ty+se*140,tz+dz*140);cam.up.set(0,1,0);cam.lookAt(tx,ty,tz);
    const hw=this.R.RW/2/this.ppm,hh=this.R.RH/2/this.ppm;cam.left=-hw;cam.right=hw;cam.top=hh;cam.bottom=-hh;cam.updateProjectionMatrix();cam.updateMatrixWorld();
    this.R.use(cam);
  }
  // high behind the person's baseline, looking down the court; drifts a little with the player across it
  behind(f,k){
    const R=this.R,cam=R.persp,aspect=R.RW/R.RH,A=CameraRig.axes(this.az),back=CT.L+12,h=7.5;
    this.bx+=((f.me.x*A.rx+f.me.z*A.rz)*.3-this.bx)*k*.5;
    cam.position.set(A.fx*back+A.rx*this.bx,h,A.fz*back+A.rz*this.bx);cam.up.set(0,1,0);cam.lookAt(-A.fx*3+A.rx*this.bx*.4,0,-A.fz*3+A.rz*this.bx*.4);
    // wide enough for the doubles court at the near baseline, whatever the screen's shape
    cam.fov=clamp(Math.max(50,2*Math.atan(Math.tan(26*PI/180)/aspect)*180/PI)/this.mul,30,88);cam.aspect=aspect;cam.updateProjectionMatrix();cam.updateMatrixWorld();
    this.ppm=R.RH/(2*hyp(back+3,h)*Math.tan(cam.fov*PI/360));
    R.use(cam);
  }
}
