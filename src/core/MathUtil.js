// MathUtil — small numeric helpers as static methods; short aliases keep the maths readable
class MathUtil{
  static clamp(v,a,b){return v<a?a:v>b?b:v;}
  static lerp(a,b,t){return a+(b-a)*t;}
  static sgn(v){return v<0?-1:1;}
  static sstep(a,b,x){const t=MathUtil.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
  static hash2(x,z){const s=Math.sin(x*12.9898+z*78.233)*43758.5453;return s-Math.floor(s);}
  static hex(c){return'#'+c.toString(16).padStart(6,'0');}
  // rotate angle a toward b by at most k radians
  static lerpAngle(a,b,t){let d=(b-a)%TAU;if(d>PI)d-=TAU;if(d<-PI)d+=TAU;return a+d*t;}
  static turn(a,b,k){let d=(b-a+PI)%TAU;if(d<0)d+=TAU;d-=PI;return a+MathUtil.clamp(d,-k,k);}
}
const{clamp,lerp,sgn,sstep,hash2,turn,lerpAngle}=MathUtil,hyp=Math.hypot,hexs=MathUtil.hex;
