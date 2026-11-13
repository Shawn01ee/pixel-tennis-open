// NetView — the net mesh and tape, wobbling when struck
// the net: dithered mesh and a white tape, wobbling where the ball strikes it
class NetView{
  constructor(root,amb){
    const NS=this.NS=48;this.shake=new Float32Array(NS+1);this.v=new Float32Array(NS+1);
    {const p=new Float32Array((NS+1)*2*3),ix=[];for(let i=0;i<NS;i++){const a=i*2;ix.push(a,a+1,a+3,a,a+3,a+2);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setIndex(ix);
      const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{amb},
        vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:'uniform vec3 amb;void main(){vec2 p=floor(gl_FragCoord.xy);if(mod(p.x+p.y,2.)>.5)discard;gl_FragColor=vec4(vec3(.16,.17,.22)*amb*1.2,1.);}'});
      this.mesh=new THREE.Mesh(g,m);this.mesh.frustumCulled=false;this.mesh.renderOrder=4;root.add(this.mesh);}
    {const p=new Float32Array((NS+1)*4*3),col=[],nor=[],ix=[];for(let i=0;i<=NS;i++)for(let k=0;k<4;k++){col.push(.96,.95,.92);nor.push(0,k<2?1:.3,k%2?1:-1);}
      for(let i=0;i<NS;i++){const a=i*4;for(const[u,v]of[[0,1],[1,3],[3,2],[2,0]])ix.push(a+u,a+v,a+4+v,a+u,a+4+v,a+4+u);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(ix);
      this.tape=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));this.tape.frustumCulled=false;this.tape.castShadow=true;root.add(this.tape);}
    this.rebuild();
  }
  hit(x,amp){const c=(x+CT.POST)/(2*CT.POST)*this.NS;for(let i=0;i<=this.NS;i++)this.v[i]+=amp*Math.exp(-(((i-c)/5)**2));}
  update(dt){let moved=false;for(let i=0;i<=this.NS;i++){if(Math.abs(this.v[i])>.001||Math.abs(this.shake[i])>.001){const a=-this.shake[i]*340-this.v[i]*9;this.v[i]+=a*dt;this.shake[i]+=this.v[i]*dt;moved=true;}}if(moved)this.rebuild();}
  rebuild(){
    const P=this.mesh.geometry.attributes.position.array,T=this.tape.geometry.attributes.position.array;
    for(let i=0;i<=this.NS;i++){const x=-CT.POST+2*CT.POST*i/this.NS,h=Court.netHeight(x),dz=this.shake[i]*.5,y=h+this.shake[i]*.25;
      const a=i*6;P[a]=x;P[a+1]=y;P[a+2]=dz;P[a+3]=x;P[a+4]=.06;P[a+5]=dz*.15;
      const t=i*12,hw=.03,bot=y-.07;
      T[t]=x;T[t+1]=y;T[t+2]=dz-hw;T[t+3]=x;T[t+4]=y;T[t+5]=dz+hw;T[t+6]=x;T[t+7]=bot;T[t+8]=dz-hw;T[t+9]=x;T[t+10]=bot;T[t+11]=dz+hw;}
    this.mesh.geometry.attributes.position.needsUpdate=true;this.tape.geometry.attributes.position.needsUpdate=true;
  }
}
