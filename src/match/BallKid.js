// BallKid — a ball kid with a home position
class BallKid extends Agent{
  // how far in front of the feet the hand reaches the court when the kid bends to pick up (FigureRig's pick pose, 0.34 m),
  // and how long the bend down and the rise back up take (design)
  static REACH=.34;static BEND=.28;static RISE=.24;
  constructor(x,z,i){super(x,z,{hx:x,hz:z,h:1.42,kid:i});this.rest();}
  rest(){this.pose='crouch';this.look='ball';this.busy=false;this.yaw=Math.abs(this.hz)>9?(this.hz>0?PI:0):-PI/2;}
}
