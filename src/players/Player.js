// Player — a player on court: running, braking, facing the net
// a player on court. s: which end (+1 is the +z half); st: the profile
class Player extends Agent{
  constructor(profile,idx){
    super(0,0,{h:profile.h});
    this.st=profile;this.loco=Locomotion.forProfile(profile);this.idx=idx;this.short=profile.short;this.s=1;this.vx=0;this.vz=0;this.gx=0;this.gz=0;
    this.swing=null;this.plan=null;this.planAt=0;this.home={x:0,z:0};this.rush=false;this.leaving=false;
    this.cheer=0;this.sulk=0;this.split=0;this.ritual=0;this.ritualT=0;this.lastStep=0;this.ms=Player.freshStats();
  }
  static freshStats(){return{aces:0,df:0,win:0,ue:0,sv1:0,sv1in:0,won1:0,sv2:0,won2:0,fast:0,pts:0,bpW:0,bpT:0};}
  get facing(){return this.s>0?PI:0;}
  resetRally(){this.plan=null;this.planAt=0;this.gx=this.x;this.gz=this.z;this.rush=false;this.leaving=false;}
  // time to cover d metres from rest at full effort
  timeTo(d){return this.loco.timeTo(d);}
  // run toward (gx,gz) through the player's locomotion; clay lets the feet slide, which softens braking and cutting
  run(dt,m){
    const surf=m.surface,L=this.loco,before=hyp(this.vx,this.vz),pvx=this.vx,pvz=this.vz;
    const d=L.step(this,this.gx,this.gz,dt,{slide:surf.slide?.72:1});
    const x0=-CT.FX+.25,x1=CT.FX-.25,z0=this.s>0?.45:-CT.FZ+.25,z1=this.s>0?CT.FZ-.25:-.45;
    if(this.x<x0||this.x>x1){this.x=clamp(this.x,x0,x1);this.vx=0;}
    if(this.z<z0||this.z>z1){this.z=clamp(this.z,z0,z1);this.vz=0;}
    const spd=hyp(this.vx,this.vz);this.spd=spd;this.phase+=spd/2*dt*TAU;
    const sprint=spd>3.6&&d>2.5&&(!this.plan||this.plan.t-m.t>.45);
    this.yaw=turn(this.yaw,sprint?Math.atan2(this.vx,this.vz):this.facing,L.turnRate*dt);
    // a hard stop or cut squeaks the shoes on a hard court; on clay the feet slide
    const acc=hyp(this.vx-pvx,this.vz-pvz)/dt;this.squeakT=(this.squeakT||0)-dt;
    if(acc>L.brake*.7&&before>1.4&&this.squeakT<=0){this.squeakT=.35;m.ev(surf.slide?'slide':'squeak',{x:this.x,z:this.z,v:before,a:acc/L.brake});}
    if(spd>1.6){this.lastStep+=spd*dt;if(this.lastStep>.85){this.lastStep=0;m.ev('step',{x:this.x,z:this.z,v:spd,slide:surf.slide&&before-spd>L.brake*.6*dt});}}
  }
}
