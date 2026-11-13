// Shading — shader hooks: world patterns, cloud shadow, the stand cut-away
// shared shader state: world-space material patterns, drifting cloud shadow, and the cut-away of stands
const FX={cloud:{value:0},ctime:{value:0},camD:{value:new THREE.Vector2(0,1)},keep:{value:2.7},top:{value:13}};
const PAT_GLSL=`if(vPat>-.5){vec3 aN=abs(normalize(cross(dFdx(vW),dFdy(vW))));vec2 q=aN.y>.7?vW.xz:(aN.x>aN.z?vW.zy:vW.xy);float k=1.;float p=floor(vPat+.5);
 if(p<.5){k=1.+(h2(floor(q*9.))-.5)*.08;}
 else if(p<1.5){float r=floor(q.y/.17);vec2 b=vec2(q.x/.34+mod(r,2.)*.5,r);float fx=fract(b.x),fy=fract(q.y/.17);k=(fx<.09||fy<.16)?1.24:.86+h2(floor(b))*.3;}
 else if(p<2.5){float r=floor(q.x/.24),f=fract(q.x/.24);k=(f<.14?.68:.9+h2(vec2(r,1.))*.2)+(h2(floor(vec2(q.x*26.,q.y*3.)+r))-.5)*.1;}
 else if(p<3.5){float w=q.y/.46+sin(q.x*.8)*.45,l=floor(w),s=floor(q.x/(.8+mod(l,3.)*.34)+l*.37),f=fract(w);k=(f<.13?.62:.8+h2(vec2(l,s))*.42)+(h2(floor(q*6.))-.5)*.16;}
 else if(p<4.5){vec2 g=floor(q*6.);float h=h2(g),hh=h2(floor(q*2.3+.3));k=.74+hh*.3+(h>.64?.3:h<.24?-.22:0.);}
 else if(p<5.5){float r=floor(q.y/.21),f=fract(q.y/.21);vec2 b=vec2(q.x/.27+mod(r,2.)*.5,r);float fx=fract(b.x);k=f<.17?.62:(fx<.1?.78:.88+h2(floor(b))*.3);}
 else if(p<6.5){k=1.+(h2(floor(q*11.))-.5)*.06+(h2(floor(q*1.8))-.5)*.07;}
 else{vec2 b=q/vec2(.56,.4);b.x+=mod(floor(b.y),2.)*.5;vec2 f=fract(b);k=(f.x<.07||f.y<.09)?.72:.88+h2(floor(b))*.24;}
 diffuseColor.rgb*=k;}`;
const CLOUD_GLSL=`if(uCloud>.01){vec2 cq=vW.xz*.05+vec2(uCt*.018,uCt*.007);float cn=vn(cq)*.65+vn(cq*2.3+7.)*.35;if(cn>.56)reflectedLight.directDiffuse*=1.-.26*uCloud;}`;
// rows of a stand that faces the camera sink to uKeep, so the stands never hide the court
const CUT_GLSL=`if(vCut.z>.01){float dd=dot(vCut.xy,uCamD);if(vCut.z>mix(uTop+1.,uKeep,smoothstep(.1,.45,dd)))discard;}`;
class Shading{
  static cut(s){
    s.uniforms.uCamD=FX.camD;s.uniforms.uKeep=FX.keep;s.uniforms.uTop=FX.top;
    s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 cut;varying vec3 vCut;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCut=cut;');
    s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCut;uniform vec2 uCamD;uniform float uKeep,uTop;').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n'+CUT_GLSL);
  }
  // Lambert with world patterns, cloud shadow and the cut-away; extra(shader) may add more
  static enhance(m,pat,extra){
    m.onBeforeCompile=s=>{
      Shading.cut(s);
      s.uniforms.uCloud=FX.cloud;s.uniforms.uCt=FX.ctime;
      s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vW;'+(pat?'attribute float pat;varying float vPat;':''))
        .replace('#include <begin_vertex>','#include <begin_vertex>\n{vec4 wp=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nwp=instanceMatrix*wp;\n#endif\nvW=(modelMatrix*wp).xyz;}'+(pat?'vPat=pat;':''));
      s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vW;uniform float uCloud,uCt;'+(pat?'varying float vPat;':'')+'float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),u.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),u.x),u.y);}')
        .replace('#include <aomap_fragment>','#include <aomap_fragment>\n'+CLOUD_GLSL);
      if(pat)s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+PAT_GLSL);
      if(extra)extra(s);
    };
    m.customProgramCacheKey=()=>'fx'+(pat?1:0)+(extra?extra.name:'');
    return m;
  }
  // any built-in material that only needs the cut-away
  static cutOnly(m,key='c'){m.onBeforeCompile=s=>Shading.cut(s);m.customProgramCacheKey=()=>'cut'+key;return m;}
}
