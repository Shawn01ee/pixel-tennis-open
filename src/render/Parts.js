// Parts — instanced primitives for people: boxes, tapered limbs, faceted balls, trunks, domes, rings and discs
// Each shape is one instanced mesh, so the whole cast costs a handful of draw calls. Every unit shape spans −½..½
// on each axis (the dome is a sphere cut below its equator) so it can be stretched between two points like a bone.
class Instancer{
  constructor(geo,cap,mat){
    const n=geo.attributes.position.count,F=(v,k)=>new THREE.Float32BufferAttribute(new Array(n*k).fill(v),k);
    geo.setAttribute('color',F(1,3));geo.setAttribute('pat',F(-1,1));geo.setAttribute('cut',F(0,3));
    this.cap=cap;this.m=new THREE.InstancedMesh(geo,mat,cap);
    this.m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);
    this.m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.m.frustumCulled=false;this.m.castShadow=true;this.m.receiveShadow=true;this.m.count=0;
    this.n=0;this.a=this.m.instanceMatrix.array;this.ca=this.m.instanceColor.array;
  }
  begin(){this.n=0;}
  // centre x,y,z and three scaled axes (a right-handed frame keeps faces pointing outward)
  raw(x,y,z,ax,ay,az,bx,by,bz,cx,cy,cz,c){
    if(this.n>=this.cap)return;const o=this.n*16,a=this.a,i=this.n*3,ca=this.ca;
    a[o]=ax;a[o+1]=ay;a[o+2]=az;a[o+3]=0;a[o+4]=bx;a[o+5]=by;a[o+6]=bz;a[o+7]=0;a[o+8]=cx;a[o+9]=cy;a[o+10]=cz;a[o+11]=0;a[o+12]=x;a[o+13]=y;a[o+14]=z;a[o+15]=1;
    ca[i]=(c>>16&255)/255;ca[i+1]=(c>>8&255)/255;ca[i+2]=(c&255)/255;this.n++;
  }
  // upright, turned by yaw
  box(x,y,z,sx,sy,sz,yaw,c){const cr=Math.cos(yaw),sr=Math.sin(yaw);this.raw(x,y,z,cr*sx,0,-sr*sx,0,sy,0,sr*sz,0,cr*sz,c);}
  // stretched from a to b; the hint fixes which way the width faces
  bone(ax,ay,az,bx,by,bz,w,d,c,hx=1,hy=0,hz=0){
    let yx=bx-ax,yy=by-ay,yz=bz-az;const L=Math.hypot(yx,yy,yz)||1e-4;yx/=L;yy/=L;yz/=L;
    let xx=yy*hz-yz*hy,xy=yz*hx-yx*hz,xz=yx*hy-yy*hx,l=Math.hypot(xx,xy,xz);
    if(l<1e-3){xx=1;xy=0;xz=0;l=1;}xx/=l;xy/=l;xz/=l;
    const zx=xy*yz-xz*yy,zy=xz*yx-xx*yz,zz=xx*yy-xy*yx;
    this.raw((ax+bx)/2,(ay+by)/2,(az+bz)/2,xx*w,xy*w,xz*w,yx*L,yy*L,yz*L,zx*d,zy*d,zz*d,c);
  }
  commit(){this.m.count=this.n;this.m.instanceMatrix.needsUpdate=true;this.m.instanceColor.needsUpdate=true;}
}

class Parts{
  static SHAPES={
    box:()=>new THREE.BoxGeometry(1,1,1),
    limb:()=>new THREE.CylinderGeometry(.4,.5,1,8,1),          // the far end (+y) is narrower
    trunk:()=>new THREE.CylinderGeometry(.5,.35,1,8,1),        // shoulders (+y) wider than the waist
    ball:()=>new THREE.IcosahedronGeometry(.5,1),
    dome:()=>new THREE.SphereGeometry(.5,10,5,0,TAU,0,PI*.58),
    ring:()=>new THREE.TorusGeometry(.45,.05,6,20),
    disc:()=>new THREE.CylinderGeometry(.5,.5,1,14,1).rotateX(PI/2),
  };
  constructor(mat,cap=500){
    this.group=new THREE.Group();this.I={};
    // racket strings: every other pixel left open, so the court shows through the string bed
    const strings=Shading.enhance(new THREE.MeshLambertMaterial({vertexColors:true}),true,function strings(sh){
      sh.fragmentShader=sh.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(mod(floor(gl_FragCoord.x)+floor(gl_FragCoord.y),2.)<1.)discard;');});
    for(const k in Parts.SHAPES){this.I[k]=new Instancer(Parts.SHAPES[k](),cap,k==='disc'?strings:mat);this.group.add(this.I[k].m);}
  }
  begin(){for(const k in this.I)this.I[k].begin();}
  commit(){for(const k in this.I)this.I[k].commit();}
  // boxes, as before: markers and anything square
  box(x,y,z,sx,sy,sz,yaw,c){this.I.box.box(x,y,z,sx,sy,sz,yaw,c);}
  bone(ax,ay,az,bx,by,bz,w,d,c,hx,hy,hz){this.I.box.bone(ax,ay,az,bx,by,bz,w,d,c,hx,hy,hz);}
  // any shape stretched between two points
  seg(shape,ax,ay,az,bx,by,bz,w,d,c,hx,hy,hz){this.I[shape].bone(ax,ay,az,bx,by,bz,w,d,c,hx,hy,hz);}
  // a ball or other shape standing upright, turned by yaw
  ball(x,y,z,sx,sy,sz,yaw,c){this.I.ball.box(x,y,z,sx,sy,sz,yaw,c);}
  put(shape,x,y,z,sx,sy,sz,yaw,c){this.I[shape].box(x,y,z,sx,sy,sz,yaw,c);}
  // a shape in an explicit frame: right X, up Y, forward Z, each already scaled
  frame(shape,x,y,z,X,Y,Z,c){this.I[shape].raw(x,y,z,X[0],X[1],X[2],Y[0],Y[1],Y[2],Z[0],Z[1],Z[2],c);}
}
