// Geo — static geometry builder: boxes, cones, blobs, quads with cut-away data
// static geometry accumulator: coloured boxes, cones, prisms → one mesh.
// Each vertex also carries a cut record (outward x, outward z, row height) and a crowd record (phase, excitement, angle).
class Geo{
  constructor(){this.p=[];this.n=[];this.c=[];this.t=[];this.k=[];this.e=[];this.pat=0;this.cut=Geo.NOCUT;this.ex=Geo.NOEX;}
  tri(a,b,c,col){
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    const C=hexc(col),K=this.cut,E=this.ex;
    for(const v of[a,b,c]){this.p.push(v[0],v[1],v[2]);this.n.push(nx,ny,nz);this.c.push(C[0],C[1],C[2]);this.t.push(this.pat);this.k.push(K[0],K[1],K[2]);this.e.push(E[0],E[1],E[2]);}
  }
  quad(a,b,c,d,col){this.tri(a,b,c,col);this.tri(a,c,d,col);}
  // a quad wound so that its face points along want
  face(a,b,c,d,want,col){
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
    if(nx*want[0]+ny*want[1]+nz*want[2]<0)this.quad(a,d,c,b,col);else this.quad(a,b,c,d,col);
  }
  // centre x/z, bottom y; o.top colours the top face, o.ry turns about y, o.side colours ±x faces
  box(x,y,z,sx,sy,sz,col,o={}){
    const hx=sx/2,hz=sz/2,r=o.ry||0,cr=Math.cos(r),sr=Math.sin(r);
    const P=(a,b,c)=>[x+a*cr+c*sr,y+b,z-a*sr+c*cr];
    const y0=0,y1=sy,A=P(-hx,y0,-hz),B=P(hx,y0,-hz),C=P(hx,y0,hz),D=P(-hx,y0,hz),E=P(-hx,y1,-hz),F=P(hx,y1,-hz),G2=P(hx,y1,hz),H=P(-hx,y1,hz);
    const s=o.side??col;
    this.quad(H,G2,F,E,o.top??col);
    this.quad(D,C,G2,H,col);this.quad(B,A,E,F,col);
    this.quad(C,B,F,G2,s);this.quad(A,D,H,E,s);
    if(!o.noBottom)this.quad(A,B,C,D,o.under??col);
    return this;
  }
  cone(x,y,z,r,h,n,cols,r2=0){
    for(let i=0;i<n;i++){const a=i/n*TAU+.39,b=(i+1)/n*TAU+.39,c=cols[i%cols.length];
      const A=[x+Math.sin(a)*r,y,z+Math.cos(a)*r],B=[x+Math.sin(b)*r,y,z+Math.cos(b)*r];
      if(r2<=0)this.tri(A,B,[x,y+h,z],c);
      else this.quad(A,B,[x+Math.sin(b)*r2,y+h,z+Math.cos(b)*r2],[x+Math.sin(a)*r2,y+h,z+Math.cos(a)*r2],c);}
    return this;
  }
  // a lumpy low-poly ball of foliage
  blob(x,y,z,rx,ry,rz,cols,d=1,seed=0){
    const g=new THREE.IcosahedronGeometry(1,d),q=g.attributes.position,J=[];
    for(let i=0;i<q.count;i++){const a=q.getX(i),b=q.getY(i),c=q.getZ(i),k=1+(hash2(a*13+seed,b*17+c*7)-.5)*.34;J.push([x+a*rx*k,y+b*ry*k,z+c*rz*k]);}
    for(let i=0;i<q.count;i+=3){const my=(J[i][1]+J[i+1][1]+J[i+2][1])/3,t=clamp((my-(y-ry))/(2*ry),0,.99),c=cols[Math.min(cols.length-1,Math.floor(t*cols.length+hash2(i,seed)*.9))];this.tri(J[i],J[i+1],J[i+2],c);}
    g.dispose();return this;
  }
  build(){const g=new THREE.BufferGeometry(),F=(a,n)=>new THREE.Float32BufferAttribute(a,n);
    g.setAttribute('position',F(this.p,3));g.setAttribute('normal',F(this.n,3));g.setAttribute('color',F(this.c,3));g.setAttribute('pat',F(this.t,1));
    g.setAttribute('cut',F(this.k,3));g.setAttribute('crowd',F(this.e,3));
    return g;}
}
Geo.NOCUT=[0,0,-1];Geo.NOEX=[0,0,0];
