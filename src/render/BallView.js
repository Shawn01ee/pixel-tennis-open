// BallView — the ball, its shadow dot, trail, and spare balls
// the ball, a dot beneath it, a short trail, and the spare balls lying about
class BallView{
  constructor(root){
    this.m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xf4f06a}));this.m.castShadow=true;root.add(this.m);
    this.dot=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-PI/2),new THREE.MeshBasicMaterial({color:0x101218,transparent:true,opacity:.75,depthWrite:false}));this.dot.renderOrder=2;root.add(this.dot);
    this.TR=12;this.trP=new Float32Array(this.TR*3);this.trG=new THREE.BufferGeometry();this.trG.setAttribute('position',new THREE.BufferAttribute(this.trP,3));
    this.trail=new THREE.Points(this.trG,new THREE.PointsMaterial({size:1,sizeAttenuation:false,color:0xfdf0a0,depthWrite:false,transparent:true}));this.trail.frustumCulled=false;root.add(this.trail);
    this.loose=[];for(let i=0;i<8;i++){const m=new THREE.Mesh(this.m.geometry,this.m.material);m.visible=false;m.castShadow=true;root.add(m);this.loose.push(m);}
  }
  update(match,t,ppm,al=1){
    const size=Math.max(.09,2.7/ppm),b=match.ball,P=this.trP;
    // drawn between the last two ticks
    const bx=b&&b.ox!==undefined?lerp(b.ox,b.x,al):b&&b.x,by=b&&b.oy!==undefined?lerp(b.oy,b.y,al):b&&b.y,bz=b&&b.oz!==undefined?lerp(b.oz,b.z,al):b&&b.z;
    if(b&&b.y>-1){this.m.visible=true;this.m.position.set(bx,by,bz);this.m.scale.setScalar(size);this.m.rotation.set(t*9,t*7,0);
      this.dot.visible=by>.25;this.dot.position.set(bx,.03,bz);this.dot.scale.setScalar(size*.9);}else{this.m.visible=false;this.dot.visible=false;}
    for(let i=0;i<this.loose.length;i++){const q=match.loose[i],m=this.loose[i];if(q){m.visible=true;m.position.set(q.x,q.y,q.z);m.scale.setScalar(size*.9);}else m.visible=false;}
    const live=b&&Math.hypot(b.vx,b.vz)>9&&match.live;this.trail.visible=!!live;this.trail.material.size=match.isServe?2:1;this.trail.material.color.setHex(match.isServe?0xf4d44a:0xfdf0a0);
    if(live){for(let i=this.TR-1;i>0;i--){P[i*3]=P[(i-1)*3];P[i*3+1]=P[(i-1)*3+1];P[i*3+2]=P[(i-1)*3+2];}P[0]=bx;P[1]=by;P[2]=bz;this.trG.attributes.position.needsUpdate=true;}
    else if(b)for(let i=0;i<this.TR;i++){P[i*3]=b.x;P[i*3+1]=b.y;P[i*3+2]=b.z;}
  }
}
