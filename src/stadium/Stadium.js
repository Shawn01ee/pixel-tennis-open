// Stadium — builds the bowl, roof, courtside furniture, plaza and floating slab
class Stadium{
  // the bowl is built outward from a rounded rectangle just behind the courtside boards
  static A=CT.FX+.35; static B=CT.FZ+.35; static R0=.6;
  static LOWER={n:7,d:.85,y0:1.3,rise:.44}; static UPPER={off:6.75,n:6,d:.8,y0:5.4,rise:.5};
  static BACK=11.55; static WALL=11.85; static PLAZA=15; static KEEP_ROWS=4;
  constructor(root,mats){
    this.root=root;this.mats=mats;this.lamps=[];this.halos=[];this.ring=Stadium.ringBase();
    const G=new Geo(),GL=new Geo(),CR=new Geo();
    this.buildGround(G);this.buildBowl(G,GL,CR);this.buildRoof(G,GL);this.buildCourtside(G,GL);this.buildPlaza(G);
    this.court=new CourtSurface();this.court.paint();this.buildCourt();
    this.led=new LedBoards();this.buildBoards();
    this.screens=[new BigScreen(),new BigScreen()];this.buildScreens(G);
    const st=new THREE.Mesh(G.build(),mats.lit);st.castShadow=true;st.receiveShadow=true;root.add(st);
    root.add(new THREE.Mesh(GL.build(),mats.glow));
    this.crowdMat=Shading.enhance(new THREE.MeshLambertMaterial({vertexColors:true}),false,CrowdMotion.shader);
    const cm=new THREE.Mesh(CR.build(),this.crowdMat);cm.receiveShadow=true;root.add(cm);
    this.crowdCount=CR.p.length/270;
  }
  // points round the base rectangle with their outward normals; arcs at the corners
  static ringBase(){
    const pts=[],A=Stadium.A,B=Stadium.B,r=Stadium.R0,ax=A-r,bz=B-r;
    const seg=(x0,z0,x1,z1,nx,nz)=>{const L=hyp(x1-x0,z1-z0),n=Math.max(1,Math.round(L/.5));for(let i=0;i<n;i++){const t=i/n;pts.push({x:lerp(x0,x1,t),z:lerp(z0,z1,t),nx,nz,straight:true,i});}};
    const arc=(cx,cz,a0)=>{for(let i=0;i<8;i++){const a=a0+i/8*PI/2;pts.push({x:cx+Math.cos(a)*r,z:cz+Math.sin(a)*r,nx:Math.cos(a),nz:Math.sin(a),straight:false,i});}};
    seg(A,-bz,A,bz,1,0);arc(ax,bz,0);seg(ax,B,-ax,B,0,1);arc(-ax,bz,PI/2);seg(-A,bz,-A,-bz,-1,0);arc(-ax,-bz,PI);seg(-ax,-B,ax,-B,0,-1);arc(ax,-bz,1.5*PI);
    return pts;
  }
  // each piece of the ring: its two ends, a mean normal for the cut-away, and what it is
  *segments(){
    const P=this.ring,n=P.length;
    for(let i=0;i<n;i++){const p=P[i],q=P[(i+1)%n],mx=p.nx+q.nx,mz=p.nz+q.nz,l=hyp(mx,mz)||1;
      const tunnel=p.straight&&p.nz===-1&&Math.abs((p.x+q.x)/2-TUNNEL.x)<.95;
      yield{p,q,nx:mx/l,nz:mz/l,aisle:p.straight&&p.i%10===5,tunnel};}
  }
  static at(p,d,y){return[p.x+p.nx*d,y,p.z+p.nz*d];}
  // a flat band between two offsets, facing up (or down)
  band(G,s,d0,d1,y0,y1,col,dir=1){const a=Stadium.at;G.face(a(s.p,d0,y0),a(s.q,d0,y0),a(s.q,d1,y1),a(s.p,d1,y1),[0,dir,0],col);}
  // a wall at one offset, facing in toward the court (dir -1) or out (dir 1)
  wall(G,s,d,y0,y1,col,dir=-1){const a=Stadium.at;G.face(a(s.p,d,y0),a(s.q,d,y0),a(s.q,d,y1),a(s.p,d,y1),[s.nx*dir,0,s.nz*dir],col);}

  buildGround(G){
    G.pat=6;G.cut=Geo.NOCUT;
    // under the stands is only ever seen where the stands nearest the camera are cut away: paving, like the plaza
    for(const s of this.segments()){this.band(G,s,-.45,Stadium.WALL,0,0,0xb8ae94);this.band(G,s,Stadium.WALL,Stadium.PLAZA,0,0,0xc8cdd8);}
    G.pat=0;
  }
  buildBowl(G,GL,CR){
    const L=Stadium.LOWER,U=Stadium.UPPER,shirts=[0xf4f3ec,0xf4f3ec,0xf4d44a,0xf0664a,0x7bb8ea,0x3166b4,0xd83c36,0x3f8a3c,0x1c1f2e,0xf89a78,0x9658a0,0xdff08e,0x4a8ed4,0xe08440],
      skins=[0xf2c8a0,0xd89c70,0xa8683f,0x6c402c,0xf5cc98],hair=[0x1c1f2e,0x4d2417,0x743719,0xdcae2c,0xc8cdd8,0x2e1510],hats=[0xf4f3ec,0xf4d44a,0xf4f3ec,0x7bb8ea,0xf0664a];
    const person=(s,d,y,t,occ)=>{
      if(R()>occ)return;
      const x=lerp(s.p.x+s.p.nx*d,s.q.x+s.q.nx*d,t),z=lerp(s.p.z+s.p.nz*d,s.q.z+s.q.nz*d,t),tx=s.q.x-s.p.x,tz=s.q.z-s.p.z,ry=Math.atan2(-tz,tx);
      CR.cut=[s.nx,s.nz,y];CR.ex=[R(),R(),Math.atan2(z,x)];
      const k=.92+R()*.14;CR.box(x,y,z,.36,.52*k,.3,rng.pick(shirts),{ry,noBottom:true});
      const hat=R()<.22;CR.box(x-s.nx*.02,y+.52*k,z-s.nz*.02,.2,.21,.2,rng.pick(skins),{ry,noBottom:true,top:hat?rng.pick(hats):rng.pick(hair)});
      // hands, tucked inside the body until a roar or the wave lifts them over the head
      const skin=rng.pick(skins);CR.ex=[2+CR.ex[0],CR.ex[1],CR.ex[2]];CR.box(x,y+.3*k,z,.3,.12,.1,skin,{ry,noBottom:true});
    };
    const seats=(s,d0,d1,y,occ)=>{const len=hyp(s.q.x-s.p.x,s.q.z-s.p.z)+(d0+d1)/2*hyp(s.q.nx-s.p.nx,s.q.nz-s.p.nz),n=Math.max(1,Math.round(len/.6));
      for(let k=0;k<n;k++)person(s,d0+(d1-d0)*.62,y,(k+.5)/n,occ);};
    for(const s of this.segments()){
      let yPrev=0;
      // lower tier: courtside rows, the first few kept when the stand faces the camera
      for(let i=0;i<L.n;i++){const d0=i*L.d,d1=d0+L.d,y=L.y0+i*L.rise;
        if(s.tunnel&&y<2.7){yPrev=y;continue;}
        G.cut=[s.nx,s.nz,y];G.pat=-1;
        this.wall(G,s,d0,yPrev,y,s.aisle?0x6f7589:i===0?0x101a3a:0x1a2c5c);
        this.band(G,s,d0,d1,y,y,s.aisle?0x9aa1b3:0x3166b4);
        if(!s.aisle&&!s.tunnel)seats(s,d0,d1,y,.9);
        yPrev=y;}
      // the back of the rows that stay when this side is cut away: a blue panel, like a low courtside stand
      { const keep=Stadium.KEEP_ROWS,dk=keep*L.d,yk=L.y0+(keep-1)*L.rise;G.cut=[s.nx,s.nz,2.0];G.pat=6;this.wall(G,s,dk,0,yk,s.aisle?0x1a2c5c:0x25468a,1);
        this.band(G,s,dk-.12,dk+.08,yk+.02,yk+.02,0x101a3a);G.pat=-1;}
      // concourse, then the fascia of the upper tier carrying the LED ribbon
      const yc=yPrev;G.cut=[s.nx,s.nz,yc+.01];G.pat=7;this.band(G,s,L.n*L.d,U.off,yc,yc,0x9aa1b3);G.pat=-1;
      G.cut=[s.nx,s.nz,U.y0];this.wall(G,s,U.off,yc,U.y0,0x101a3a);
      yPrev=U.y0;
      for(let j=0;j<U.n;j++){const d0=U.off+j*U.d,d1=d0+U.d,y=U.y0+j*U.rise;
        G.cut=[s.nx,s.nz,y];
        if(j>0)this.wall(G,s,d0,yPrev,y,s.aisle?0x6f7589:0x1a2c5c);
        this.band(G,s,d0,d1,y,y,s.aisle?0x9aa1b3:0x25468a);
        if(!s.aisle)seats(s,d0,d1,y,.86);
        yPrev=y;}
      // back wall and the outer facade
      const top=yPrev+1.5;G.cut=[s.nx,s.nz,top];
      this.wall(G,s,Stadium.BACK,yPrev,top,0xc8cdd8);this.band(G,s,Stadium.BACK,Stadium.WALL,top,top,0x9aa1b3);
      G.pat=6;this.wall(G,s,Stadium.WALL,0,top,s.p.i%4===0&&s.p.straight?0x4a8ed4:0xe4dcc4,1);G.pat=0;
      G.cut=Geo.NOCUT;
    }
    // the players' tunnel under the lower rows at the -z end
    { const x0=TUNNEL.x-.9,x1=TUNNEL.x+.9,z0=-Stadium.B,z1=-Stadium.B-3.6,h=2.62;G.cut=[0,-1,2.0];G.pat=-1;
      G.face([x0,0,z0],[x0,0,z1],[x0,h,z1],[x0,h,z0],[1,0,0],0x1c1f2e);G.face([x1,0,z0],[x1,0,z1],[x1,h,z1],[x1,h,z0],[-1,0,0],0x1c1f2e);
      G.face([x0,0,z1],[x1,0,z1],[x1,h,z1],[x0,h,z1],[0,0,1],0x0e0f1a);G.face([x0,h,z0],[x1,h,z0],[x1,h,z1],[x0,h,z1],[0,-1,0],0x1c1f2e);
      G.face([x0,h-.3,z0],[x1,h-.3,z0],[x1,h,z0],[x0,h,z0],[0,0,1],0xf4f3ec);
      GL.cut=[0,-1,2.0];GL.box(TUNNEL.x,h-.12,z0-.4,1.4,.06,.3,0xfdf0a0);GL.cut=Geo.NOCUT;G.cut=Geo.NOCUT;G.pat=0;}
  }
  buildRoof(G,GL){
    const d0=8.2,d1=12.25,y0=10.8,y1=11.15;
    for(const s of this.segments()){
      G.cut=[s.nx,s.nz,y0];G.pat=-1;
      this.band(G,s,d0,d1,y0+.32,y1+.3,0xc8cdd8);this.band(G,s,d0,d1,y0,y1,0x4a4f63,-1);
      this.wall(G,s,d0,y0,y0+.32,s.p.i%2?0xf4f3ec:0x4a8ed4);this.wall(G,s,d1,y1,y1+.3,0xf4f3ec,1);
      if(s.p.straight&&s.p.i%12===0){const[x,,z]=Stadium.at(s.p,Stadium.BACK+.15,0);G.box(x,9.3,z,.22,y1-9.2,.22,0x9aa1b3);}
      if(s.p.i%7===3){const[x,,z]=Stadium.at(s.p,d0+.3,0);GL.cut=[s.nx,s.nz,y0];GL.box(x,y0-.16,z,.4,.14,.4,0xfdf0a0);this.halos.push({x,y:y0-.3,z,r:1.6,c:0xfdf0a0,cut:[s.nx,s.nz,y0]});}
    }
    G.cut=GL.cut=Geo.NOCUT;
    // floodlight banks over the corners, aimed at the court
    for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*(Stadium.A-Stadium.R0+6.4),z=sz*(Stadium.B-Stadium.R0+6.4);
      this.lamps.push({x,y:y0-.4,z,tx:sx*2.2,tz:sz*5.5});this.halos.push({x,y:y0-.4,z,r:3.2,c:0xfdf0a0,cut:[sx*.7,sz*.7,y0]});}
  }
  buildCourtside(G,GL){
    const fx=CT.FX,fz=CT.FZ,navy=0x101a3a;
    // board housings: the faces carry the LED texture
    G.pat=-1;
    for(const s of[-1,1]){G.box(0,0,s*(fz+.14),2*fx+.3,1.0,.26,navy,{top:0x1a2c5c});G.box(s*(fx+.13),0,0,.24,.9,2*fz,navy,{top:0x1a2c5c});}
    // net hardware
    for(const s of[-1,1]){G.box(s*CT.POST,0,0,.09,1.07,.09,0x1c1f2e,{top:0x9aa1b3});G.box(s*CT.POST,.05,.12,.06,.16,.14,0x4a4f63);G.box(s*CT.STICK,0,0,.05,1.07,.05,0xf4f3ec);}
    G.box(0,0,0,.05,.03,.1,0xf4f3ec);
    // the umpire's chair
    { const X=UMP.x,Z=UMP.z,c=0xf4f3ec,c2=0x3166b4;
      for(const[a,b]of[[-.42,-.42],[.42,-.42],[-.42,.42],[.42,.42]])G.box(X+a,0,Z+b,.08,2.15,.08,c2,{side:0x25468a});
      for(const y of[.55,1.1,1.65])for(const s of[-1,1])G.box(X,y,Z+s*.42,.84,.05,.05,c);
      G.box(X,2.12,Z,1.0,.08,1.0,0x1a2c5c,{top:0x3166b4});G.box(X-.44,2.2,Z,.08,.66,.9,0x1a2c5c);
      for(const s of[-1,1])G.box(X,2.45,Z+s*.42,.84,.05,.05,c);
      for(let i=0;i<7;i++)G.box(X-.74,.25+i*.3,Z,.05,.04,.5,c);
      for(const s of[-1,1])G.box(X-.72,0,Z+s*.25,.05,2.2,.05,c2);
      G.box(X+.46,2.2,Z,.06,.78,.86,0xf4f3ec);G.box(X+.5,2.62,Z,.04,.2,.6,0x25468a);}
    // players' chairs, towel boxes and a drinks fridge on each side of the umpire
    for(const s of[-1,1]){const z=s*CHAIR.z,x=CHAIR.x;
      const chair=zc=>{G.box(x,.44,zc,.5,.06,.5,0xf4f3ec);G.box(x-.24,.44,zc,.05,.62,.5,0x3166b4);for(const[a,b]of[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]])G.box(x+a,0,zc+b,.05,.44,.05,0x4a4f63);};
      chair(z);chair(z+s*.75);
      G.box(x-.05,0,z+s*1.45,.5,.9,.5,0xf4f3ec,{top:0xe4dcc4});GL.box(x+.21,.12,z+s*1.45,.02,.66,.4,0x7bb8ea);
      G.box(x+.12,0,z-s*.72,.36,.42,.5,0x1a2c5c,{top:0xf4f3ec});
      G.box(x+.15,0,z+s*.4,.34,.28,.9,0x101a3a,{top:0x25468a});}
    // photographers' benches behind the boards
    for(const s of[-1,1])for(const x of[-6.5,6.5])G.box(x,0,s*(fz+.0),1.6,.32,.1,0x1c1f2e);
    G.pat=0;
  }
  buildPlaza(G){
    // trees and benches on the plaza, then the slab the whole place floats on
    const F=[0x1b4a2c,0x2a6a34,0x3f8a3c,0x5ea644,0x86c250];
    const tree=(x,z,h,r,seed)=>{G.pat=2;G.box(x,0,z,.3,h*.55,.3,0x4d2417);G.pat=4;for(let i=0;i<4;i++){const a=i*1.9+seed,o=i?r*.5:0;G.blob(x+Math.sin(a)*o,h*.72+(i?-.1:.26)*r,z+Math.cos(a)*o,r*(i?.72:.92),r*(i?.6:.78),r*(i?.72:.92),F,1,seed+i);}G.pat=0;};
    let k=0;for(const s of this.segments()){if(!s.p.straight||s.p.i%9!==4)continue;const[x,,z]=Stadium.at(s.p,(Stadium.WALL+Stadium.PLAZA)/2+.3,0);tree(x,z,3.2+hash2(k,3)*1.2,1.2+hash2(k,7)*.4,k*3+1);k++;}
    for(const s of this.segments()){if(!s.p.straight||s.p.i%9!==0)continue;const[x,,z]=Stadium.at(s.p,(Stadium.WALL+Stadium.PLAZA)/2,0);G.box(x,0,z,1.5,.42,.42,0xa04c22,{ry:Math.atan2(-(s.q.z-s.p.z),s.q.x-s.p.x),top:0xc8662c});}
    // the slab: a stone skirt, then a tapered underside
    G.pat=3;
    for(const s of this.segments()){
      this.wall(G,s,Stadium.PLAZA,-1.3,0,0x9aa1b3,1);
      const a=Stadium.at;G.face(a(s.p,Stadium.PLAZA,-1.3),a(s.q,Stadium.PLAZA,-1.3),a(s.q,Stadium.PLAZA-3,-4.6),a(s.p,Stadium.PLAZA-3,-4.6),[s.nx,-.6,s.nz],0x4a4f63);
      this.band(G,s,-1,Stadium.PLAZA-3,-4.6,-4.6,0x2f3344,-1);}
    G.pat=0;
  }
  buildCourt(){
    const g=new THREE.BufferGeometry(),fx=CT.FX,fz=CT.FZ;
    g.setAttribute('position',new THREE.Float32BufferAttribute([-fx,.015,-fz,fx,.015,-fz,fx,.015,fz,-fx,.015,fz],3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,1,1,1,0,0,0],2));g.setIndex([0,2,1,0,3,2]);
    const m=new THREE.MeshLambertMaterial({map:this.court.tex});
    this.lineU={value:new THREE.Color(0xf4f3ec)};this.boxU={value:new THREE.Vector4()};this.boxA={value:0};this.boxC={value:new THREE.Color(1,.93,.45)};
    const self=this;
    Shading.enhance(m,false,function court(s){s.uniforms.uLine=self.lineU;s.uniforms.uBox=self.boxU;s.uniforms.uBoxA=self.boxA;s.uniforms.uBoxC=self.boxC;
      s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vC;').replace('#include <begin_vertex>','#include <begin_vertex>\nvC=position.xz;');
      s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vC;uniform vec3 uLine,uBoxC;uniform vec4 uBox;uniform float uBoxA;').replace('#include <map_fragment>','#include <map_fragment>\n'+LINE_GLSL);});
    const me=new THREE.Mesh(g,m);me.receiveShadow=true;this.root.add(me);
  }
  // LED faces: courtside boards on the enclosure, and the ribbon on the upper fascia
  buildBoards(){
    const P=[],UV=[],K=[],fx=CT.FX,fz=CT.FZ,o=.015;
    const quad=(a,b,h0,h1,u0,u1,cut)=>{const v=[[a[0],h0,a[1],u0,0],[b[0],h0,b[1],u1,0],[b[0],h1,b[1],u1,1],[a[0],h0,a[1],u0,0],[b[0],h1,b[1],u1,1],[a[0],h1,a[1],u0,1]];
      for(const q of v){P.push(q[0],q[1],q[2]);UV.push(q[3],q[4]);K.push(...cut);}};
    const gi=TUNNEL.x-.95,ga=TUNNEL.x+.95,run=(ax,az,bx,bz,h,u)=>{const L=hyp(bx-ax,bz-az);quad([ax,az],[bx,bz],.08,h,u,u+L/32,Geo.NOCUT);return u+L/32;};
    let u=0;
    u=run(-fx,-fz+o,gi,-fz+o,.92,u);u=run(ga,-fz+o,fx,-fz+o,.92,u);u=run(fx,fz-o,-fx,fz-o,.92,u);u=run(fx-o,-fz,fx-o,fz,.82,u);u=run(-fx+o,fz,-fx+o,-fz,.82,u);
    const U=Stadium.UPPER,d=U.off-.02,y0=Stadium.LOWER.y0+(Stadium.LOWER.n-1)*Stadium.LOWER.rise+.2;let s=0;
    for(const sg of this.segments()){const a=Stadium.at(sg.p,d,0),b=Stadium.at(sg.q,d,0),L=hyp(b[0]-a[0],b[2]-a[2]);quad([a[0],a[2]],[b[0],b[2]],y0,y0+1.0,s/32,(s+L)/32,[sg.nx,sg.nz,U.y0]);s+=L;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setAttribute('cut',new THREE.Float32BufferAttribute(K,3));
    this.ledMat=Shading.cutOnly(new THREE.MeshBasicMaterial({map:this.led.tex}),'led');
    this.root.add(new THREE.Mesh(g,this.ledMat));
  }
  buildScreens(G){
    this.screenMat=[];
    this.screens.forEach((sc,i)=>{const s=i?1:-1,z=s*(Stadium.B+9.4),w=6.2,h=3.1,y=7.7;
      const g=new THREE.PlaneGeometry(w,h);g.setAttribute('cut',new THREE.Float32BufferAttribute(new Array(4).fill([0,s,10.2]).flat(),3));
      const m=Shading.cutOnly(new THREE.MeshBasicMaterial({map:sc.tex}),'scr'+i),me=new THREE.Mesh(g,m);
      me.position.set(0,y+h/2,z-s*.09);if(s>0)me.rotation.y=PI;this.root.add(me);this.screenMat.push(m);
      G.cut=[0,s,10.2];G.pat=-1;G.box(0,y-.15,z,w+.3,h+.3,.14,0x1c1f2e);G.box(0,y+h+.1,z+s*.4,.2,10.8-y-h,.2,0x4a4f63);G.cut=Geo.NOCUT;G.pat=0;});
  }
}
