// Player — a player on court: running, braking, facing the net
// a player on court. s: which end (+1 is the +z half); st: the profile
class Player extends Agent{
  constructor(profile,idx){
    super(0,0,{h:profile.h});
    this.st=profile;this.loco=Locomotion.forProfile(profile);this.idx=idx;this.short=profile.short;this.s=1;this.vx=0;this.vz=0;this.gx=0;this.gz=0;
    this.swing=null;this.plan=null;this.planAt=0;this.home={x:0,z:0};this.rush=false;this.leaving=false;
    this.cheer=0;this.sulk=0;this.split=0;this.ritual=0;this.ritualT=0;this.lastStep=0;this.ms=Player.freshStats();
    this.sta=new Stamina(profile);
  }
  static freshStats(){return{aces:0,df:0,win:0,ue:0,sv1:0,sv1in:0,won1:0,sv2:0,won2:0,fast:0,pts:0,bpW:0,bpT:0,perfect:0};}
  get facing(){return this.s>0?PI:0;}
  resetRally(){this.plan=null;this.planAt=0;this.gx=this.x;this.gz=this.z;this.rush=false;this.leaving=false;}
  // time to cover d metres from rest at full effort
  timeTo(d){return this.loco.timeTo(d);}
  // run toward (gx,gz) through the player's locomotion; clay lets the feet slide, which softens braking and cutting
  run(dt,m){
    const surf=m.surface,L=this.loco,before=hyp(this.vx,this.vz),pvx=this.vx,pvz=this.vz,S=this.sta;
    L.scale(S.speed,S.accel);
    const d=L.step(this,this.gx,this.gz,dt,{slide:surf.slide?.72:1});
    const x0=-CT.FX+.25,x1=CT.FX-.25,z0=this.s>0?.45:-CT.FZ+.25,z1=this.s>0?CT.FZ-.25:-.45;
    if(this.x<x0||this.x>x1){this.x=clamp(this.x,x0,x1);this.vx=0;}
    if(this.z<z0||this.z>z1){this.z=clamp(this.z,z0,z1);this.vz=0;}
    const spd=hyp(this.vx,this.vz);this.spd=spd;this.phase+=spd/2*dt*TAU;
    // the work of it, while the ball is in play: acceleration along the run and across it
    if(m.live){const ax=(this.vx-pvx)/dt,az=(this.vz-pvz)/dt,hx=spd>.05?this.vx/spd:0,hz=spd>.05?this.vz/spd:0,at=ax*hx+az*hz;
      S.run(spd,at,hyp(ax-at*hx,az-at*hz),dt);}else S.rest(dt);
    const sprint=spd>3.6&&d>2.5&&(!this.plan||this.plan.t-m.t>.45);
    // footwork: sprinting, the body turns and runs; moving across at speed the hips open part-way for crossover
    // steps; slower, the player stays square to the net and side-steps
    const tc=this.plan?this.plan.t-m.t:-1;let want=this.facing;
    if(sprint)want=Math.atan2(this.vx,this.vz);
    else if(spd>3&&(tc<0||tc>.45)){const g=Math.atan2(this.vx,this.vz)-want;want+=clamp(Math.atan2(Math.sin(g),Math.cos(g)),-.6,.6)*clamp((spd-3)/1,0,1);}
    this.yaw=turn(this.yaw,want,L.turnRate*dt);
    // adjustment steps: short quick steps closing on the ball and while waiting for it, a lighter patter between
    // shots; the feet set for the last fifth of a second before contact
    this.patter=(tc>.2?(d<1.3?1:0):tc<0&&m.live&&!this.swing?.45:0)*S.accel;
    // a hard stop or cut squeaks the shoes on a hard court, brushes the grass on grass; on clay the feet slide
    const acc=hyp(this.vx-pvx,this.vz-pvz)/dt;this.squeakT=(this.squeakT||0)-dt;
    if(acc>L.brake*.7&&before>1.4&&this.squeakT<=0){this.squeakT=.35;m.ev(surf.slide?'slide':'squeak',{x:this.x,z:this.z,v:before,a:acc/L.brake,surf:surf.key});}
    if(spd>1.6){this.lastStep+=spd*dt;if(this.lastStep>.85){this.lastStep=0;m.ev('step',{x:this.x,z:this.z,v:spd,slide:surf.slide&&before-spd>L.brake*.6*dt});}}
  }
}
