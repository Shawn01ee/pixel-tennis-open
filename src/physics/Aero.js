// Aero — drag and Magnus lift on a spinning ball
// drag and lift for a spinning tennis ball (Štěpánek's fits): Cd and Cl depend on v/(ωr)
class Aero{
  static accel(b,vx,vy,vz,out){
    const v=Math.sqrt(vx*vx+vy*vy+vz*vz);let ax=0,ay=-G,az=0;
    if(v>.02){
      const wm=Math.sqrt(b.wx*b.wx+b.wy*b.wy+b.wz*b.wz),vs=wm*BALL.R,q=vs>.01?v/vs:1e3;
      const Cd=.508+1/Math.pow(22.053+4.196*Math.pow(q,2.5),.4),Cl=vs>.01?1/(2+q):0;
      const kd=KA*Cd*v;ax-=kd*vx;ay-=kd*vy;az-=kd*vz;
      if(vs>.01){const k=KA*Cl*v/wm;ax+=k*(b.wy*vz-b.wz*vy);ay+=k*(b.wz*vx-b.wx*vz);az+=k*(b.wx*vy-b.wy*vx);}
    }
    out[0]=ax;out[1]=ay;out[2]=az;return out;
  }
}
