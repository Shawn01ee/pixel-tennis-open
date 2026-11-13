// Boxes — one instanced mesh for every moving box: figures, rackets, markers
// one instanced draw for every moving box: figures, rackets, markers
class Boxes{
  constructor(cap,mat){
    this.cap=cap;const bg=new THREE.BoxGeometry(1,1,1),n=bg.attributes.position.count,F=(v,k)=>new THREE.Float32BufferAttribute(new Array(n*k).fill(v),k);
    bg.setAttribute('color',F(1,3));bg.setAttribute('pat',F(-1,1));bg.setAttribute('cut',F(0,3));
    this.m=new THREE.InstancedMesh(bg,mat,cap);
    this.m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);
    this.m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.m.frustumCulled=false;this.m.castShadow=true;this.m.receiveShadow=true;
    this.n=0;this.a=this.m.instanceMatrix.array;this.ca=this.m.instanceColor.array;
  }
  begin(){this.n=0;}
  col(c){const i=this.n*3,a=this.ca;a[i]=(c>>16&255)/255;a[i+1]=(c>>8&255)/255;a[i+2]=(c&255)/255;}
  // X,Y,Z unit axes times sizes
  raw(x,y,z,ax,ay,az,bx,by,bz,cx,cy,cz,c){
    if(this.n>=this.cap)return;const o=this.n*16,a=this.a;
    a[o]=ax;a[o+1]=ay;a[o+2]=az;a[o+3]=0;a[o+4]=bx;a[o+5]=by;a[o+6]=bz;a[o+7]=0;a[o+8]=cx;a[o+9]=cy;a[o+10]=cz;a[o+11]=0;a[o+12]=x;a[o+13]=y;a[o+14]=z;a[o+15]=1;
    this.col(c);this.n++;
  }
  box(x,y,z,sx,sy,sz,yaw,c){const cr=Math.cos(yaw),sr=Math.sin(yaw);this.raw(x,y,z,cr*sx,0,-sr*sx,0,sy,0,sr*sz,0,cr*sz,c);}
  // a limb from a to b; hx,hz is a hint for the flat face
  bone(ax,ay,az,bx,by,bz,w,d,c,hx=1,hy=0,hz=0){
    let yx=bx-ax,yy=by-ay,yz=bz-az;const L=Math.hypot(yx,yy,yz)||1e-4;yx/=L;yy/=L;yz/=L;
    let xx=yy*hz-yz*hy,xy=yz*hx-yx*hz,xz=yx*hy-yy*hx,l=Math.hypot(xx,xy,xz);
    if(l<1e-3){xx=1;xy=0;xz=0;l=1;}xx/=l;xy/=l;xz/=l;
    const zx=xy*yz-xz*yy,zy=xz*yx-xx*yz,zz=xx*yy-xy*yx;
    this.raw((ax+bx)/2,(ay+by)/2,(az+bz)/2,xx*w,xy*w,xz*w,yx*L,yy*L,yz*L,zx*d,zy*d,zz*d,c);
  }
  commit(){this.m.count=this.n;this.m.instanceMatrix.needsUpdate=true;this.m.instanceColor.needsUpdate=true;}
}
