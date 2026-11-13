// Trajectory — a precomputed flight the players read to plan their shots
// a precomputed path of the ball, with bounce counts, for players to read
class Trajectory{
  constructor(n=900){this.N=n;this.x=new Float32Array(n);this.y=new Float32Array(n);this.z=new Float32Array(n);this.bc=new Int8Array(n);
    this.n=0;this.t0=0;this.fbx=0;this.fbz=0;this.hasB=false;this.c=new Ball();}
  compute(b,t0,physics,useNet){
    const c=this.c.copy(b);c.bc=0;c.net4=false;this.t0=t0;this.hasB=false;let i=0;
    for(;i<this.N;i++){
      this.x[i]=c.x;this.y[i]=c.y;this.z[i]=c.z;this.bc[i]=c.bc;
      const ev=physics.step(c,DT,useNet);
      if(ev&HIT.BOUNCE&&!this.hasB){this.hasB=true;this.fbx=c.lbx;this.fbz=c.lbz;}
      if(c.bc>=2||c.rolling){i++;break;}
    }
    this.n=i;return this;
  }
}
