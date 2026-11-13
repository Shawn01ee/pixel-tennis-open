// Particles — dust, sparks and confetti
// sparks, dust and confetti as one point cloud
class Particles{
  constructor(root,n=420){
    this.N=n;this.p=new Float32Array(n*3);this.c=new Float32Array(n*3);this.v=[];this.i=0;
    for(let i=0;i<n;i++){this.v.push({l:0,x:0,y:-50,z:0,vx:0,vy:0,vz:0,fl:false});this.p[i*3+1]=-50;}
    this.g=new THREE.BufferGeometry();this.g.setAttribute('position',new THREE.BufferAttribute(this.p,3));this.g.setAttribute('color',new THREE.BufferAttribute(this.c,3));
    this.pts=new THREE.Points(this.g,new THREE.PointsMaterial({size:2,sizeAttenuation:false,vertexColors:true,depthWrite:false,transparent:true}));this.pts.frustumCulled=false;this.pts.renderOrder=7;root.add(this.pts);
  }
  spark(x,y,z,vx,vy,vz,l,c,fl=false){const p=this.v[this.i];Object.assign(p,{x,y,z,vx,vy,vz,l,fl});const q=hexc(c);this.c.set(q,this.i*3);this.i=(this.i+1)%this.N;}
  dust(x,z,n,col,v=1){for(let i=0;i<n;i++)this.spark(x+N(.09),.1,z+N(.09),N(.7*v),.5+R()*1.2*v,N(.7*v),.3+R()*.4,col[i%col.length]);}
  confetti(n){const cols=[0xf4d44a,0x7bb8ea,0xf4f3ec,0xf0664a,0x4a8ed4];for(let i=0;i<n;i++)this.spark(N(6),9+R()*3,N(10),N(.6),-.4-R()*.6,N(.6),4+R()*3,cols[i%cols.length],true);}
  update(dt){const p=this.p;for(let i=0;i<this.N;i++){const q=this.v[i];if(q.l<=0){p[i*3+1]=-50;continue;}q.l-=dt;if(!q.fl)q.vy-=3*dt;else{q.vx+=Math.sin(q.l*5+i)*dt*.8;}
    q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;if(q.y<.04){q.y=.04;q.vy=0;q.vx*=.8;q.vz*=.8;}p[i*3]=q.x;p[i*3+1]=q.y;p[i*3+2]=q.z;}
    this.g.attributes.position.needsUpdate=true;this.g.attributes.color.needsUpdate=true;}
}
