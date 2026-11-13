// CourtSurface — the blue hard court texture and the analytic line shader
// the playing surface: two blues, the event's name in the run-off; lines are drawn analytically in the shader
class CourtSurface{
  constructor(){
    this.W=512;this.H=1024;this.cv=document.createElement('canvas');this.cv.width=this.W;this.cv.height=this.H;this.g=this.cv.getContext('2d');
    this.tex=new THREE.CanvasTexture(this.cv);this.tex.minFilter=this.tex.magFilter=THREE.NearestFilter;this.tex.generateMipmaps=false;this.dirty=true;
  }
  u(x){return(x+CT.FX)/(2*CT.FX)*this.W;} v(z){return(z+CT.FZ)/(2*CT.FZ)*this.H;} get m(){return this.W/(2*CT.FX);}
  speck(x0,y0,w,h,cols,n){const g=this.g;for(let i=0;i<n;i++){g.fillStyle=hexs(cols[Math.floor(R()*cols.length)]);g.fillRect(x0+R()*w|0,y0+R()*h|0,1+(R()*2|0),1);}}
  paint(){
    const g=this.g,W=this.W,H=this.H;
    g.fillStyle=hexs(0x25468a);g.fillRect(0,0,W,H);this.speck(0,0,W,H,[0x1a2c5c,0x3166b4],15000);
    const x0=this.u(-CT.DW),x1=this.u(CT.DW),y0=this.v(-CT.L),y1=this.v(CT.L);
    g.fillStyle=hexs(0x3166b4);g.fillRect(x0,y0,x1-x0,y1-y0);this.speck(x0,y0,x1-x0,y1-y0,[0x25468a,0x4a8ed4],7000);
    for(const sx of[-1,1]){g.save();g.translate(this.u(sx*(CT.DW+1.9)),this.v(0));g.rotate(-sx*PI/2);PixelFont.center(g,'CENTRE COURT',0,-6,hexs(0x3166b4),3);g.restore();}
    // keep the bare court; the lettering behind the baselines is laid over it and can be turned
    this.base=document.createElement('canvas');this.base.width=W;this.base.height=H;this.base.getContext('2d').drawImage(this.cv,0,0);
    this.letter(1);
  }
  // the name behind both baselines reads the right way up from the camera, as it does for a broadcast:
  // both ends face the same way, the way of the end the camera sits behind (end: +1 or −1)
  letter(end){
    if(end===this.end)return;this.end=end;this.dirty=true;
    const g=this.g,name='PIXEL TENNIS OPEN',s=5,zc=(CT.L+CT.FZ)/2;g.drawImage(this.base,0,0);
    for(const z of[-zc,zc]){g.save();g.translate(this.u(0),this.v(z));if(end<0)g.rotate(PI);PixelFont.center(g,name,0,-s*2.5,hexs(0x4a8ed4),s);g.restore();}
    this.dirty=true;
  }
  flush(){if(this.dirty){this.tex.needsUpdate=true;this.dirty=false;}}
}
const LINE_GLSL=`
  { vec2 q=vC, f=fwidth(vC)*.62; float ax=abs(q.x), az=abs(q.y); bool on=false;
    float L=${CT.L.toFixed(3)},DW=${CT.DW.toFixed(3)},SW=${CT.SW.toFixed(3)},SV=${CT.SVC.toFixed(3)};
    #define HL(c,w,a0,a1) if(abs(az-(c))<max((w)*.5,f.y)&&ax<(a1)+f.x&&ax>=(a0))on=true;
    #define VL(c,w,b0,b1) if(abs(ax-(c))<max((w)*.5,f.x)&&az<(b1)+f.y&&az>=(b0))on=true;
    HL(L-.05,.10,0.,DW) VL(DW-.025,.05,0.,L) VL(SW-.025,.05,0.,L) HL(SV-.025,.05,0.,SW)
    VL(.0,.05,0.,SV) VL(.0,.05,L-.2,L)
    if(uBoxA>.01&&q.x>uBox.x&&q.x<uBox.y&&q.y>uBox.z&&q.y<uBox.w){vec2 sp=floor(gl_FragCoord.xy);if(mod(sp.x+sp.y,2.)<1.)diffuseColor.rgb=mix(diffuseColor.rgb,uBoxC,uBoxA);}
    if(on)diffuseColor.rgb=uLine; }`;
