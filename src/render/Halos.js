// Halos — night glows around the lights
// night glows: dithered additive sprites, culled with the stand they hang from
class Halos{
  constructor(list){
    const n=list.length,p=new Float32Array(n*3),c=new Float32Array(n*3),z=new Float32Array(n*2),k=new Float32Array(n*3);
    list.forEach((h,i)=>{p.set([h.x,h.y,h.z],i*3);c.set(hexc(h.c),i*3);z[i*2]=h.r;z[i*2+1]=h.pool?1:0;k.set(h.cut||Geo.NOCUT,i*3);});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('aCol',new THREE.BufferAttribute(c,3));g.setAttribute('aSz',new THREE.BufferAttribute(z,2));g.setAttribute('aCut',new THREE.BufferAttribute(k,3));
    this.u={ppm:{value:10},night:{value:0},uCamD:FX.camD,uKeep:FX.keep,uTop:FX.top};
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:this.u,
      vertexShader:'attribute vec3 aCol;attribute vec2 aSz;attribute vec3 aCut;uniform float ppm,uKeep,uTop;uniform vec2 uCamD;varying vec3 vC;varying float vP;void main(){vC=aCol;vP=aSz.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);float s=min(aSz.x*2.*ppm,200.);if(aCut.z>.01){float dd=dot(aCut.xy,uCamD);if(aCut.z>mix(uTop+1.,uKeep,smoothstep(.1,.45,dd)))s=0.;}gl_PointSize=s;}',
      fragmentShader:'uniform float night;varying vec3 vC;varying float vP;float B2(vec2 p){vec2 q=mod(p,2.);return q.x*.5+(q.y>.5?(q.x>.5?-.25:.75):.0);}float B(vec2 p){return (B2(floor(p/2.))+B2(p)*.25);}void main(){vec2 c=gl_PointCoord*2.-1.;c.y*=vP>.5?2.:1.;float r=length(c);if(r>1.)discard;float a=(1.-r);a=a*a*night*(vP>.5?.62:.85);if(a<B(floor(gl_FragCoord.xy))*.92+.05)discard;gl_FragColor=vec4(vC*.34,1.);}'});
    this.m=new THREE.Points(g,m);this.m.frustumCulled=false;this.m.renderOrder=8;
  }
}
