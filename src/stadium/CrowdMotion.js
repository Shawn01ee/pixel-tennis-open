// CrowdMotion — mexican waves, applause, standing ovations and raised arms, moved in the crowd's vertex shader
// crowd attribute: x phase (+2 marks the hands, hidden in the body until raised), y excitability, z angle round the bowl
class CrowdMotion{
  static U={uT:{value:0},uClap:{value:0},uUp:{value:0},uArms:{value:0},uWaveA:{value:0},uWaveK:{value:0}};
  static shader(s){
    Object.assign(s.uniforms,CrowdMotion.U);
    s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 crowd;uniform float uT,uClap,uUp,uArms,uWaveA,uWaveK;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n{float ex=crowd.y,arm=step(1.5,crowd.x),ph=fract(crowd.x);float clap=step(1.-uClap,ex)*abs(sin(uT*11.+ph*6.))*.05;float d=mod(crowd.z-uWaveA+PI,2.*PI)-PI;float wv=uWaveK*exp(-d*d*10.);\n transformed.y+=clap+(uUp*step(.4,ex)+wv)*.32+arm*(uArms*step(.3,ex)+wv)*(.44+.04*sin(uT*9.+ph*20.));}');
  }
}
