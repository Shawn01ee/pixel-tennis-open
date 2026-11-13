// Renderer — WebGL renderer, lights, low-resolution target and post pass
class Renderer{
  constructor(canvas){
    this.canvas=canvas;
    this.gl=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',stencil:false});
    this.phone=Math.min(innerWidth,innerHeight)<620;this.perfStep=0;this.RW=640;this.RH=360;this.px=2;
    const r=this.gl;r.setPixelRatio(1);r.shadowMap.enabled=true;r.shadowMap.type=THREE.BasicShadowMap;r.outputColorSpace=THREE.LinearSRGBColorSpace;r.toneMapping=THREE.NoToneMapping;
    this.scene=new THREE.Scene();this.root=new THREE.Group();this.scene.add(this.root);
    // the isometric views use the orthographic camera; Behind uses the perspective one
    this.ortho=new THREE.OrthographicCamera(-10,10,10,-10,1,300);this.persp=new THREE.PerspectiveCamera(50,1,.3,300);this.camera=this.ortho;
    this.amb={value:new THREE.Color(1,1,1)};
    this.mats={amb:this.amb,lit:Shading.enhance(new THREE.MeshLambertMaterial({vertexColors:true}),true),glow:Shading.cutOnly(new THREE.MeshBasicMaterial({vertexColors:true}),'glow')};
    this.hemi=new THREE.HemisphereLight(0xffffff,0x444444,1);this.scene.add(this.hemi);
    this.sun=new THREE.DirectionalLight(0xffffff,1);this.sun.castShadow=true;this.scene.add(this.sun,this.sun.target);
    {const q=this.sun.shadow,sz=this.phone?1536:2560;q.mapSize.set(sz,sz);const c=q.camera;c.left=-50;c.right=50;c.top=50;c.bottom=-50;c.near=1;c.far=240;q.bias=-.0007;q.normalBias=.035;}
    this.spots=[];
    // render to a small target, then outline, shade the sky, and snap every pixel to the palette
    const opt={minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:true,stencilBuffer:false};
    this.rt=new THREE.WebGLRenderTarget(this.RW,this.RH,opt);
    this.rt.depthTexture=new THREE.DepthTexture(this.RW,this.RH,THREE.UnsignedIntType);this.rt.depthTexture.minFilter=this.rt.depthTexture.magFilter=THREE.NearestFilter;
    this.post=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,vertexShader:POST_VS,fragmentShader:POST_FS,
      uniforms:{tCol:{value:this.rt.texture},tDep:{value:this.rt.depthTexture},tLUT:{value:Palette.buildLUT()},res:{value:new THREE.Vector2(this.RW,this.RH)},span:{value:299},thr:{value:.3},time:{value:0},night:{value:0},rain:{value:0},
        persp:{value:0},cnear:{value:.3},cfar:{value:300},skyT:{value:new THREE.Color()},skyB:{value:new THREE.Color()},skyH:{value:new THREE.Color()},cloudL:{value:new THREE.Color()},cloudD:{value:new THREE.Color()},aoK:{value:.9},moon:{value:new THREE.Vector2(.8,.84)}}});
    this.postScene=new THREE.Scene();this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.post));
    this.postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.phaseKey='night';this.L=LightPhase.snapshot('night');this.frameN=0;
  }
  addLamps(lamps){
    this.spots=lamps.map((l,i)=>{const s=new THREE.SpotLight(0xfdf0d0,0,0,.7,.4,0);s.position.set(l.x,l.y,l.z);s.target.position.set(l.tx,0,l.tz);this.scene.add(s,s.target);
      if(i===0||i===3){s.castShadow=true;s.shadow.mapSize.set(1024,1024);s.shadow.camera.near=4;s.shadow.camera.far=60;s.shadow.bias=-.0012;}return s;});
  }
  resize(){
    const cw=innerWidth,ch=innerHeight,dpr=devicePixelRatio||1,dw=cw*dpr,dh=ch*dpr,target=dw>dh?540:390;
    this.px=Math.max(1,Math.round(Math.min(dw,dh)/target))+this.perfStep;if(dpr<=1&&this.px<2)this.px=2;
    this.RW=Math.ceil(dw/this.px);this.RH=Math.ceil(dh/this.px);
    this.gl.setSize(this.RW,this.RH,false);this.canvas.style.width=(this.RW*this.px/dpr)+'px';this.canvas.style.height=(this.RH*this.px/dpr)+'px';
    this.rt.setSize(this.RW,this.RH);this.post.uniforms.res.value.set(this.RW,this.RH);
  }
  // ease the light toward the chosen session and push it into lights, materials and the sky
  light(dt,t,ppm){
    const goal=LightPhase.snapshot(this.phaseKey);this.L=LightPhase.mix(this.L,goal,Math.min(1,dt*1.8));const L=this.L,u=this.post.uniforms;
    this.sun.color.setRGB(...L.sun);this.sun.intensity=L.si*PI;const dl=Math.hypot(...L.dir);this.sun.position.set(L.dir[0]/dl*120,L.dir[1]/dl*120,L.dir[2]/dl*120);
    this.hemi.color.setRGB(...L.hs);this.hemi.groundColor.setRGB(...L.hg);this.hemi.intensity=L.hi*PI;
    for(const s of this.spots){s.intensity=L.flood*.55*PI;s.shadow.autoUpdate=L.flood>.02;}
    if(this.phone){this.gl.shadowMap.autoUpdate=false;this.gl.shadowMap.needsUpdate=(this.frameN++%2===0);}
    this.mats.glow.color.setRGB(...L.glow);this.amb.value.setRGB(...L.amb);
    u.skyT.value.setRGB(...L.t);u.skyH.value.setRGB(...L.h);u.skyB.value.setRGB(...L.b);u.cloudL.value.setRGB(...L.cl);u.cloudD.value.setRGB(...L.cd);
    u.night.value=L.night;u.time.value=t;u.thr.value=.2+.9/ppm;FX.cloud.value=1-L.night;FX.ctime.value=t;
  }
  render(){const r=this.gl;r.setRenderTarget(this.rt);r.setClearColor(0x000000,1);r.clear();r.render(this.scene,this.camera);r.setRenderTarget(null);r.render(this.postScene,this.postCam);}
  // screen position (CSS px) of a world point
  project(x,y,z){const v=new THREE.Vector3(x,y,z).project(this.camera);return[(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight,v.z];}
  // pick the camera to draw with and tell the post pass how to read its depth
  use(cam){this.camera=cam;const u=this.post.uniforms,p=cam.isPerspectiveCamera;u.persp.value=p?1:0;if(p){u.cnear.value=cam.near;u.cfar.value=cam.far;}}
  // a click on screen, onto the court plane: a ray through the near and far planes, for either camera
  pick(cx,cy){const nx=(cx/innerWidth)*2-1,ny=1-(cy/innerHeight)*2,a=new THREE.Vector3(nx,ny,-1).unproject(this.camera),b=new THREE.Vector3(nx,ny,1).unproject(this.camera);
    const dy=b.y-a.y,t=Math.abs(dy)>1e-6?-a.y/dy:0;return{x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t};}
}
