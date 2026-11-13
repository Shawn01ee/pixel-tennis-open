// BallKid — a ball kid with a home position
class BallKid extends Agent{
  constructor(x,z,i){super(x,z,{hx:x,hz:z,h:1.42,kid:i});this.rest();}
  rest(){this.pose='crouch';this.look='ball';this.busy=false;this.yaw=Math.abs(this.hz)>9?(this.hz>0?PI:0):-PI/2;}
}
