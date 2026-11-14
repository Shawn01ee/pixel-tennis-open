// RacketImpact — what a swing can do to a ball
// A ball leaves the strings at  v = e·v_in + (1+e)·V_n,  where e is the racket's apparent coefficient of restitution
// (about 0.35 at the sweet spot), v_in the speed of the incoming ball and V_n the racket-head speed straight through
// it. Brushing up or under the ball for spin takes its share of the swing: V_n² + V_t² = V², with V_t ≈ ωr.
// So pace comes easier off a fast ball than a dead one, heavy spin costs speed, and a stretched player — no time, no
// balance, off the sweet spot — cannot hit hard at all.
class RacketImpact{
  static E=.35;
  // racket-head speed at contact (m/s) for a player of power 1.0
  static HEAD={fh:28,bh:26,slice:21,volley:12,smash:36};
  static headSpeed(st,type,stretch=0){return(RacketImpact.HEAD[type]||26)*st.power*(1-.45*stretch);}
  // the fastest this player can send this ball with this much spin
  // spinIn: the incoming ball's topspin (rpm). Topspin against topspin means reversing the ball's rotation, which
  // takes more of the swing; a slice goes with the rotation and takes less
  static maxSpeed(st,type,vin,rpm=0,stretch=0,spinIn=0){
    const V=RacketImpact.headSpeed(st,type,stretch),vt=Math.max(0,Math.abs(rpm)+(rpm>=0?.25:-.25)*spinIn)*RPM*BALL.R*.8,vn=Math.sqrt(Math.max(V*V-vt*vt,V*V*.12)),e=RacketImpact.E*(1-.3*stretch);
    return e*vin+(1+e)*vn;
  }
}
