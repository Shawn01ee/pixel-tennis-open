// postShader — post pass: outlines, ambient occlusion, sky, dither, palette snap
const POST_VS=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const POST_FS=`precision highp float;varying vec2 vUv;
uniform sampler2D tCol,tDep,tLUT;uniform vec2 res;uniform float span,thr,time,night,rain,persp,cnear,cfar;uniform vec3 skyT,skyB,skyH,cloudL,cloudD;uniform vec2 moon;uniform float aoK;
// depth in metres: linear already for the orthographic views, unprojected for the perspective one
float D(vec2 o){float r=texture2D(tDep,vUv+o/res).r;if(persp>.5){float z=r*2.-1.;return 2.*cnear*cfar/(cfar+cnear-z*(cfar-cnear));}return r*span;}
float B(vec2 p){int x=int(mod(p.x,4.)),y=int(mod(p.y,4.));int i=x+y*4;
 float m[16];m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
 return m[i]/16.-.47;}
float H(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(H(i),H(i+vec2(1,0)),u.x),mix(H(i+vec2(0,1)),H(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){return vn(p)*.55+vn(p*2.1+3.)*.28+vn(p*4.3+7.)*.17;}
float ao1(vec2 o,float d){float a=D(o),b=D(-o);float c=d-(a+b)*.5;return c>.04&&c<.62?clamp((c-.04)/.3,0.,1.):0.;}
vec3 lut(vec3 c){c=clamp(c,0.,.999);vec3 q=floor(c*32.);return texture2D(tLUT,vec2((q.g*32.+q.r+.5)/1024.,(q.b+.5)/32.)).rgb;}
void main(){
 float d=D(vec2(0.)),far=step(.99995,texture2D(tDep,vUv).r);vec3 c=texture2D(tCol,vUv).rgb;
 vec2 px=floor(vUv*res);
 if(far>.5){
  float y=vUv.y;vec3 s=y>.45?mix(skyH,skyT,(y-.45)/.55):mix(skyB,skyH,y/.45);
  if(night>.3){float st=H(floor(px/1.)+floor(time*.0)),tw=H(px*.7+floor(time*1.3));if(y>.12&&st>.9965-.0015*tw)s=mix(s,vec3(.9,.93,1.),.9*night);
   vec2 q=(px-moon*res);float mr=res.y*.045;float m=length(q);if(m<mr&&length(q-vec2(mr*.42,mr*.2))>mr*.86)s=mix(s,vec3(.97,.95,.82),night);}
  vec2 cp=px/res.y*vec2(5.2,12.)+vec2(time*.012,0.);float f1=fbm(cp),f2=fbm(cp*1.9+vec2(time*.02,4.)),ed=.64+.03*sin(y*5.);
  float cov=smoothstep(.04,.34,abs(y-.42));cov=1.-cov*.32;
  if(f2>ed+.03/cov)s=mix(s,cloudD,.72);if(f1>ed/cov){s=f1>ed/cov+.055?mix(s,cloudL,.95):mix(s,cloudD,.86);}
  c=s;
 }
 float dl=D(vec2(-1.,0.)),dr=D(vec2(1.,0.)),du=D(vec2(0.,1.)),dd=D(vec2(0.,-1.));
 float ex=2.*d-dl-dr,ey=2.*d-du-dd,e=max(ex,ey),e2=max(-ex,-ey);
 if(e>thr)c*=mix(.42,.3,night);
 else if(far<.5&&e2>thr*1.2)c=min(c*1.16+.015,vec3(1.));
 if(far<.5){float ao=ao1(vec2(2.,0.),d)+ao1(vec2(0.,2.),d)+ao1(vec2(2.,2.),d)+ao1(vec2(2.,-2.),d)+ao1(vec2(5.,0.),d)+ao1(vec2(0.,5.),d)+ao1(vec2(4.,4.),d)+ao1(vec2(4.,-4.),d);c*=1.-min(ao/5.,.62)*aoK;}
 c+=B(px)*.042;
 gl_FragColor=vec4(lut(c),1.);
}`;
