// BodyMesh — one continuous, anatomical body for a figure, rebuilt every frame around its skeleton
// The torso, legs, arms and head are tubes: rings of vertices laid along the joints the rig solved. A ring is not a
// plain ellipse: it can bulge to the front, the back or the sides, so the body gets its landmarks — glutes, a
// narrow waist, pectorals, the widest point at the armpits, a trapezius sloping to a short neck; quadriceps,
// kneecaps, calves and thin ankles; deltoids, biceps and forearms; a head shaped crown to chin with a nose, ears and
// a jaw. Clothes are colours on the same surface with hard edges: a short-sleeved shirt, shorts or a skirt, socks, hair.
class BodyMesh{
  // a ring: [place along the chain (1.5 = halfway down the second link), half-width, half-depth, colour,
  //          bulge toward +v, bulge toward −v, bulge at the sides]. For the torso and head +v is the front;
  //          for legs and arms, which run downward, +v is the back.
  // torso chain: crotch, hip, waist, chest, shoulders (where the arms hang), neck base, neck top
  static TORSO={
    m:[[0,.09,.08,'shorts'],[.5,.148,.104,'shorts',0,.14],[1,.152,.1,'shorts',0,.08],[1.3,.146,.097,'shorts'],[1.33,.15,.1,'shirt'],
       [2,.132,.09,'shirt'],[2.5,.148,.1,'shirt',.05],[3,.164,.108,'shirt',.12],[3.5,.172,.104,'shirt',.07],[3.85,.158,.094,'shirt'],
       [4.3,.108,.074,'shirt'],[4.6,.068,.06,'shirt'],[4.65,.06,.056,'skin'],[5,.056,.054,'skin'],[6,.052,.052,'skin']],
    f:[[0,.09,.08,'shorts'],[.5,.156,.11,'shorts',0,.16],[1,.162,.104,'shorts',0,.1],[1.3,.142,.096,'shorts'],[1.33,.146,.099,'shirt'],
       [2,.118,.086,'shirt'],[2.5,.132,.098,'shirt',.06],[3,.146,.112,'shirt',.16],[3.5,.15,.098,'shirt',.05],[3.85,.14,.088,'shirt'],
       [4.3,.096,.068,'shirt'],[4.6,.06,.055,'shirt'],[4.65,.052,.05,'skin'],[5,.049,.047,'skin'],[6,.046,.046,'skin']]};
  // leg chain: hip, knee, ankle
  static LEG=[[0,.084,.088,'shortsLeg'],[.25,.082,.086,'shortsLeg'],[.46,.08,.083,'shortsLeg'],[.47,.072,.075,'legSkin',.02,.07],[.72,.064,.067,'legSkin',0,.06],
    [.92,.054,.055,'legSkin'],[1,.05,.051,'legSkin',0,.08],[1.12,.051,.055,'legSkin',.08],[1.32,.053,.06,'legSkin',.2],[1.52,.047,.052,'legSkin',.1],
    [1.75,.037,.038,'legSkin'],[1.77,.04,.041,'sock'],[2,.036,.037,'sock']];
  // arm chain: shoulder, elbow, wrist
  static ARM=[[0,.046,.05,'sleeve'],[.14,.056,.058,'sleeve',0,0,.03],[.42,.056,.058,'sleeve'],[.43,.046,.048,'arm'],[.66,.045,.05,'arm',0,.08],
    [.95,.038,.04,'arm'],[1.05,.038,.04,'arm'],[1.28,.044,.042,'arm'],[1.6,.037,.034,'arm'],[2,.029,.026,'arm']];
  // head, chin to crown: rings at HEAD_Y (× scale, from the head's centre); the face sits forward of the skull by HEAD_F
  static HEAD=[[0,.034,.04,'skin',.1],[1,.066,.074,'skin',.06],[2,.083,.093,'skin',.04],[3,.092,.1,'skin',.14,0,.05],[4,.095,.103,'brow',0,0,.07],
    [5,.094,.104,'hair'],[6,.08,.09,'hair'],[7,.046,.052,'hair'],[8,.012,.014,'hair']];
  static HEAD_Y=[-.112,-.088,-.055,-.022,.012,.05,.088,.112,.122];
  static HEAD_F=[.03,.022,.012,.006,0,-.004,-.008,-.01,-.012];
  static SKIRT=[[0,.15,.108],[.5,.19,.155],[1,.235,.2]];
  static N={torso:14,leg:10,arm:8,head:12,skirt:12};
  constructor(c,mat){
    this.c=c;this.female=!!(c.long||c.skirt);
    const col=k=>({shorts:c.shorts,shirt:c.shirt,sleeve:c.sleeve??c.shirt,skin:c.skin,arm:c.arm??c.skin,legSkin:c.leg??c.skin,shortsLeg:c.leg??c.shorts,
      sock:c.sock??c.leg??c.skin,hair:c.cap??c.hair??c.skin,brow:c.skin})[k];
    this.tubes=[];this.count=0;
    this.add('torso',this.female?BodyMesh.TORSO.f:BodyMesh.TORSO.m,BodyMesh.N.torso,col,true,true);
    for(let i=0;i<2;i++)this.add('leg',BodyMesh.LEG,BodyMesh.N.leg,col,false,true);
    for(let i=0;i<2;i++)this.add('arm',BodyMesh.ARM,BodyMesh.N.arm,col,false,true);
    if(c.skirt){const sk=BodyMesh.SKIRT.map(r=>[...r,'shorts']);this.add('skirt',sk,BodyMesh.N.skirt,col,false,false);this.add('skirt',sk,BodyMesh.N.skirt,col,false,false,true);}
    this.add('head',BodyMesh.HEAD,BodyMesh.N.head,col,true,true);
    this.build(mat);
  }
  // a tube: rings × segments, optional fans to close either end; inside-out for the inner face of a skirt
  add(kind,prof,n,col,cap0,cap1,flip=false){
    const v0=this.count,rings=prof.length;
    this.tubes.push({kind,prof,n,v0,rings,cap0,cap1,flip,cols:prof.map(r=>col(r[3]))});this.count=v0+rings*n+(cap0?1:0)+(cap1?1:0);
  }
  build(mat){
    const V=this.count,pos=new Float32Array(V*3),nor=new Float32Array(V*3),col=new Float32Array(V*3),idx=[],c=this.c;
    const setC=(v,hex)=>{col[v*3]=(hex>>16&255)/255;col[v*3+1]=(hex>>8&255)/255;col[v*3+2]=(hex&255)/255;};
    for(const t of this.tubes){
      const n=t.n;
      for(let i=0;i<t.rings-1;i++)for(let j=0;j<n;j++){const a=t.v0+i*n+j,b=t.v0+i*n+(j+1)%n,cc=t.v0+(i+1)*n+(j+1)%n,d=t.v0+(i+1)*n+j;
        if(t.flip)idx.push(a,cc,b,a,d,cc);else idx.push(a,b,cc,a,cc,d);}
      for(let i=0;i<t.rings;i++)for(let j=0;j<n;j++){
        let k=t.cols[i];
        // the hairline: hair over the crown and the back of the head; the face and ears bare; long hair falls lower
        if(t.kind==='head'){const fw=Math.sin(j/n*TAU),tag=t.prof[i][3],hair=c.cap??c.hair;
          let hairy=false;
          if(hair!=null){if(tag==='hair')hairy=c.cap!=null||i>=6||fw<.62;else if(tag==='brow')hairy=c.cap!=null||fw<-.3;else hairy=c.long&&fw<-.35&&i>=1;}
          k=hairy?hair:c.skin;}
        setC(t.v0+i*n+j,k);}
      let e=t.v0+t.rings*n;
      if(t.cap0){t.c0=e;setC(e,t.cols[0]);for(let j=0;j<n;j++)idx.push(e,t.v0+(j+1)%n,t.v0+j);e++;}
      if(t.cap1){t.c1=e;setC(e,t.kind==='head'?(c.cap??c.hair??c.skin):t.cols[t.rings-1]);const l=t.v0+(t.rings-1)*n;for(let j=0;j<n;j++)idx.push(e,l+j,l+(j+1)%n);}
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('normal',new THREE.BufferAttribute(nor,3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('pat',new THREE.Float32BufferAttribute(new Array(V).fill(-1),1));g.setAttribute('cut',new THREE.Float32BufferAttribute(new Array(V*3).fill(0),3));
    g.setIndex(idx);this.pos=pos;this.nor=nor;this.g=g;
    this.mesh=new THREE.Mesh(g,mat);this.mesh.frustumCulled=false;this.mesh.castShadow=true;this.mesh.receiveShadow=true;
  }
  dispose(){this.g.dispose();}
  // a point and direction along a chain of joints at place p
  static along(pts,p){
    const i=Math.min(pts.length-2,Math.floor(p)),f=p-i,a=pts[i],b=pts[i+1],u=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l];};
    const c=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];let d=u([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);
    // near a joint the ring turns halfway toward the next link, so a bent knee or elbow stays round
    let q=null,w=0;
    if(i>0&&f<.15){const pr=pts[i-1];q=u([a[0]-pr[0],a[1]-pr[1],a[2]-pr[2]]);w=.5*(1-f/.15);}
    else if(i<pts.length-2&&f>.85){const nx=pts[i+2];q=u([nx[0]-b[0],nx[1]-b[1],nx[2]-b[2]]);w=.5*(f-.85)/.15;}
    if(q)d=u([lerp(d[0],q[0],w),lerp(d[1],q[1],w),lerp(d[2],q[2],w)]);
    return[c,d];
  }
  // lay one tube's rings along its chain; side is the hint for which way a ring's width faces
  lay(t,pts,side,k,sideAt,shift){
    const P=this.pos,Nn=this.nor,n=t.n;
    for(let i=0;i<t.rings;i++){
      const pr=t.prof[i],[c0,d]=BodyMesh.along(pts,pr[0]),s=sideAt?sideAt(pr[0]):side,c=shift?shift(i,c0):c0;
      const sd=s[0]*d[0]+s[1]*d[1]+s[2]*d[2];let ux=s[0]-d[0]*sd,uy=s[1]-d[1]*sd,uz=s[2]-d[2]*sd,ul=Math.hypot(ux,uy,uz);
      if(ul<.25){ux=d[1];uy=-d[0];uz=0;ul=Math.hypot(ux,uy)||1;}ux/=ul;uy/=ul;uz/=ul;
      const vx=d[1]*uz-d[2]*uy,vy=d[2]*ux-d[0]*uz,vz=d[0]*uy-d[1]*ux,rx=pr[1]*k,rz=pr[2]*k,bf=pr[4]||0,bb=pr[5]||0,bs=pr[6]||0;
      for(let j=0;j<n;j++){
        const a=j/n*TAU,co=Math.cos(a),si=Math.sin(a),o=(t.v0+i*n+j)*3;
        // the bulges: a smooth swelling toward +v, −v, or both sides
        const m=1+bf*Math.max(0,si)**2+bb*Math.max(0,-si)**2+bs*co**8;
        P[o]=c[0]+(ux*co*rx+vx*si*rz)*m;P[o+1]=c[1]+(uy*co*rx+vy*si*rz)*m;P[o+2]=c[2]+(uz*co*rx+vz*si*rz)*m;
        let nx=ux*co/rx+vx*si/rz,ny=uy*co/rx+vy*si/rz,nz=uz*co/rx+vz*si/rz;const nl=Math.hypot(nx,ny,nz)||1;if(t.flip){nx=-nx;ny=-ny;nz=-nz;}
        Nn[o]=nx/nl;Nn[o+1]=ny/nl;Nn[o+2]=nz/nl;}
      if(i===0&&t.c0!==undefined){const o=t.c0*3;P[o]=c[0];P[o+1]=c[1];P[o+2]=c[2];Nn[o]=-d[0];Nn[o+1]=-d[1];Nn[o+2]=-d[2];}
      if(i===t.rings-1&&t.c1!==undefined){const o=t.c1*3;P[o]=c[0];P[o+1]=c[1];P[o+2]=c[2];Nn[o]=d[0];Nn[o+1]=d[1];Nn[o+2]=d[2];}
    }
  }
  // sk: {k, P pelvis, C chest top, N neck base, H head centre, pr pelvis right, cr chest right, hd head forward,
  //      legs:[[hip,knee,ankle]×2], arms:[[shoulder,elbow,wrist]×2]}
  update(sk){
    const k=sk.k,P=sk.P,C=sk.C,Nk=sk.N,H=sk.H,mix=(a,b,f)=>[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];
    const torso=[[P[0],P[1]-.09*k,P[2]],P,mix(P,C,.42),mix(P,C,.72),mix(P,C,.92),Nk,mix(Nk,H,.5)];
    // the torso twists from the pelvis to the shoulders
    const twist=p=>{const f=clamp(p/4,0,1),x=lerp(sk.pr[0],sk.cr[0],f),z=lerp(sk.pr[2],sk.cr[2],f),l=Math.hypot(x,z)||1;return[x/l,0,z/l];};
    // the head: an upright chain from chin to crown, the face set forward along the way it looks
    const hx=sk.hd[0],hz=sk.hd[2],head=BodyMesh.HEAD_Y.map(y=>[H[0],H[1]+y*k,H[2]]),hr=[-hz,0,hx];
    const face=(i,c)=>[c[0]+hx*BodyMesh.HEAD_F[i]*k,c[1],c[2]+hz*BodyMesh.HEAD_F[i]*k];
    let leg=0,arm=0;
    for(const t of this.tubes){
      if(t.kind==='torso')this.lay(t,torso,null,k,twist);
      else if(t.kind==='leg')this.lay(t,sk.legs[leg++],sk.pr,k);
      else if(t.kind==='arm')this.lay(t,sk.arms[arm++],sk.cr,k);
      else if(t.kind==='skirt')this.lay(t,[mix(P,C,.3),[P[0],P[1]-.22*k,P[2]]],sk.pr,k);
      else this.lay(t,head,hr,k,null,face);
    }
    this.g.attributes.position.needsUpdate=true;this.g.attributes.normal.needsUpdate=true;
  }
}
