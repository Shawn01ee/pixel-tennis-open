// FigureRig — people as boxes on two-bone IK, strokes on keyed paths
// keys: τ (s from contact), hand f/r/u (forward, toward hit side, up), racket direction f/r/u, shoulder coil
const KEYS={
 fh:[[-.62,.12,.42,1.08, .5,.45,.75, .2],[-.36,-.30,.58,1.42,-.45,.5,.72, 1.15],[-.15,-.55,.60,.86,-.72,.5,-.32, 1.0],
     [0,.28,.44,.97, .28,.94,.12, -.1],[.13,.56,.12,1.42, .42,-.5,.72,-.6],[.34,.22,-.42,1.58,-.55,-.72,.38,-.95],[.62,.12,-.1,1.15, .3,-.4,.8,-.2]],
 bh:[[-.62,.15,-.1,1.05, .55,.1,.8, .2],[-.36,-.38,.28,1.3,-.5,.45,.7, 1.2],[-.15,-.42,.42,.82,-.7,.55,-.3, 1.0],
     [0,.40,.28,.96, .34,.92,.12, -.05],[.13,.62,.0,1.4, .4,-.45,.78,-.5],[.34,.18,-.42,1.58,-.45,-.78,.4,-.85],[.62,.12,-.12,1.15,.3,-.4,.8,-.2]],
 slice:[[-.62,.15,.1,1.1, .5,.2,.8, .2],[-.38,-.34,.42,1.5,-.42,.52,.74, 1.1],[-.15,-.1,.45,1.28,.0,.8,.6, .8],
     [0,.34,.34,.98, .32,.9,.22, 0],[.16,.66,.28,.82, .72,.62,.06,-.3],[.4,.5,.6,1.0, .4,.7,.5,-.3],[.62,.15,.1,1.12,.5,.2,.8,0]],
 volley:[[-.3,.2,.35,1.2, .3,.4,.85, .2],[-.12,.15,.5,1.3, .1,.6,.8, .55],[0,.42,.36,1.12, .42,.82,.38,.1],[.14,.6,.28,1.02, .62,.72,.3,-.1],[.3,.25,.25,1.1, .4,.4,.8,0]],
 smash:[[-.6,.1,.42,1.25, .3,.2,.92, .3],[-.34,-.3,.42,1.62,-.5,.15,-.82, .9],[-.13,-.1,.34,1.95, .05,.05,-.99, .75],
     [0,.26,.14,2.2, .12,.02,.99, 0],[.16,.56,-.1,1.5, .85,-.2,-.45,-.5],[.42,.22,-.46,.98,-.1,-.6,-.78,-.8],[.62,.15,-.1,1.15,.3,-.3,.8,-.2]],
 serve:[[-1.3,.28,.2,1.02, .7,.05,.7, .3],[-.95,.02,.5,.76,-.25,.6,-.75, .55],[-.55,-.34,.4,1.32,-.62,.2,.75, 1.05],[-.3,-.26,.32,1.68,-.5,.1,-.86, 1.1],
     [-.1,-.02,.26,1.98, .08,.1,-.98, .7],[0,.26,.14,2.2, .12,.03,.99, 0],[.17,.58,-.1,1.5, .85,-.2,-.42,-.5],[.42,.24,-.46,.95,-.1,-.6,-.78,-.8],[.68,.15,-.1,1.15,.3,-.3,.8,-.2]],
};
// racket face through the stroke, τ → radians: topspin closes over the ball on the way up, a slice stays laid back
const FACE={
 fh:[[-.62,0],[-.36,-.25],[-.15,-.85],[0,-.14],[.13,-.6],[.34,-.3],[.62,0]],
 bh:[[-.62,0],[-.36,-.25],[-.15,-.8],[0,-.12],[.13,-.55],[.34,-.3],[.62,0]],
 slice:[[-.62,.2],[-.38,.75],[-.15,.7],[0,.42],[.16,.8],[.4,.5],[.62,.2]],
 volley:[[-.3,.2],[0,.3],[.3,.2]],
};
const TOSS=[[-1.3,.42,-.08,1.0],[-.9,.42,-.05,1.02],[-.64,.46,.0,1.72],[-.3,.42,.02,2.08],[-.1,.36,-.06,1.62],[.06,.26,-.2,1.25],[.3,.2,-.3,1.08],[.68,.15,-.25,1.0]];
const _k=[0,0,0,0,0,0,0];
// two-bone IK: returns the elbow/knee, pushed toward the pole vector
const _j=[0,0,0];
const SHOE=0xf4f3ec,RKT=0x1c1f2e;
// figures: boxes on two-bone IK, rackets on keyed paths
class FigureRig{
  static evalKeys(K,t,out=_k){
    const n=K.length;if(t<=K[0][0]){for(let i=0;i<7;i++)out[i]=K[0][i+1]??0;return out;}
    if(t>=K[n-1][0]){for(let i=0;i<7;i++)out[i]=K[n-1][i+1]??0;return out;}
    let j=0;while(K[j+1][0]<t)j++;const a=K[j],b=K[j+1],u=(t-a[0])/(b[0]-a[0]),s=u*u*(3-2*u),w=(u+s)/2;
    for(let i=0;i<7;i++)out[i]=lerp(a[i+1]??0,b[i+1]??0,w);return out;
  }
  static face(type,t){const K=FACE[type];if(!K)return 0;if(t<=K[0][0])return K[0][1];for(let i=1;i<K.length;i++)if(t<=K[i][0]){const a=K[i-1],b=K[i];return lerp(a[1],b[1],(t-a[0])/(b[0]-a[0]));}return K[K.length-1][1];}
  static ik(ax,ay,az,bx,by,bz,l1,l2,px,py,pz){
    let dx=bx-ax,dy=by-ay,dz=bz-az,d=Math.hypot(dx,dy,dz);const mx=l1+l2-1e-3;
    if(d>mx){const k=mx/d;bx=ax+dx*k;by=ay+dy*k;bz=az+dz*k;dx*=k;dy*=k;dz*=k;d=mx;}
    if(d<1e-4)d=1e-4;
    const ux=dx/d,uy=dy/d,uz=dz/d,a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));
    const dot=px*ux+py*uy+pz*uz;let qx=px-dot*ux,qy=py-dot*uy,qz=pz-dot*uz;const ql=Math.hypot(qx,qy,qz)||1;qx/=ql;qy/=ql;qz/=ql;
    _j[0]=ax+ux*a+qx*h;_j[1]=ay+uy*a+qy*h;_j[2]=az+uz*a+qz*h;
    return[bx,by,bz];
  }
  // two-bone IK: [joint, end] from a toward b, the joint pushed toward the pole
  static chain(a,b,l1,l2,pole){const e=FigureRig.ik(a[0],a[1],a[2],b[0],b[1],b[2],l1,l2,pole[0],pole[1],pole[2]);return[[_j[0],_j[1],_j[2]],[e[0],e[1],e[2]]];}
  // a tennis racket, 0.68 m: a taped grip with a butt cap, an open throat splitting into two beams, an oval head
  // 0.26 × 0.34 m with a 2.5 cm beam, and a pale string bed. The face points along the swing.
  // open: how far the hitting face is laid back (+, under the ball for a slice) or closed over the ball (−, topspin)
  static racket(B,hx,hy,hz,dx,dy,dz,fx,fz,col,open=0){
    const l=Math.hypot(dx,dy,dz)||1;dx/=l;dy/=l;dz/=l;
    const at=(s,w=0)=>[hx+dx*s+X[0]*w,hy+dy*s+X[1]*w,hz+dz*s+X[2]*w];
    // across the face, in its plane
    let X=[dy*fx,-dz*fz-dx*fx,dy*fz];{const q=Math.hypot(...X);X=q>1e-4?X.map(v=>v/q):[-fz,0,fx];}
    // the face normal: the hitting side looks the way the player faces; the strings lie in the plane of the handle
    let n=[dy*X[2]-dz*X[1],dz*X[0]-dx*X[2],dx*X[1]-dy*X[0]];if(n[0]*fx+n[2]*fz<0)n=n.map(v=>-v);
    if(open){let m=[dy*n[2]-dz*n[1],dz*n[0]-dx*n[2],dx*n[1]-dy*n[0]];if(m[1]<0)m=m.map(v=>-v);const co=Math.cos(open),si=Math.sin(open);
      n=n.map((v,i)=>v*co+m[i]*si);X=[n[1]*dz-n[2]*dy,n[2]*dx-n[0]*dz,n[0]*dy-n[1]*dx];}
    const g0=at(-.1),g1=at(.16),t=at(.31),c=at(.495);
    B.seg('limb',...g0,...g1,.052,.046,0x1c1f2e,fx,0,fz);B.ball(...g0,.058,.03,.058,0,0x2f3344);
    for(const w of[-1,1]){const a=at(.15),b=at(.33,w*.09);B.seg('box',...a,...b,.022,.026,col,n[0],n[1],n[2]);}
    B.seg('ring',...t,...at(.665),.27,.26,col,n[0],n[1],n[2]);
    B.seg('disc',...at(.325),...at(.65),.235,.006,0xc8cdd8,n[0],n[1],n[2]);
    return c;
  }
  static draw(B,a,o){
    // o: t, colours, ball; a: agent
    const k=a.h/1.8,t=o.t,sw=a.swing,c=o.c,spd=a.spd||0;
    let yaw=a.yaw,fx=Math.sin(yaw),fz=Math.cos(yaw);
    let rx=-fz,rz=fx;
    let px=a.x,pz=a.z,py=a.y||0,crouch=0,lean=0,sway=0,tw=0;
    let pose=a.pose||'stand';
    const inPlay=a.mode==='play';
    // turn into the stroke over its backswing instead of snapping square to the net
    if(sw){const tq=t-sw.tc,wy=sw.type==='serve'?1:sstep(-.6,-.28,tq)*(1-sstep(.45,.7,tq));yaw=lerpAngle(a.yaw,sw.F>0?0:PI,wy);fx=Math.sin(yaw);fz=Math.cos(yaw);rx=-fz;rz=fx;}
    const tau=sw?t-sw.tc:0;
    let Kc=null,S=null,H=null,dir=null;
    if(sw){
      const K=KEYS[sw.type],hs=sw.hs,Rx=rx*hs,Rz=rz*hs;Kc=FigureRig.evalKeys(K,tau,[0,0,0,0,0,0,0]);
      const k0=FigureRig.evalKeys(K,0,[0,0,0,0,0,0,0]);
      tw=Kc[6];
      if(sw.type==='serve'||sw.type==='smash'){
        const q=sw.type==='serve'?sstep(-.2,-.02,tau)*(1-sstep(.08,.34,tau)):sstep(-.22,-.03,tau)*(1-sstep(.08,.3,tau));py+=q*.22*k+(sw.type==='smash'?clamp(sw.C.y-2.55,0,.45)*q:0);
        crouch=sstep(-.55,-.28,tau)*(1-sstep(-.26,-.1,tau))*.2;lean=-.08*sstep(-.5,-.3,tau)*(1-sstep(-.1,0,tau))+.2*sstep(-.1,.2,tau)*(1-sstep(.3,.68,tau));
      }else{
        const lowc=clamp((1.0-sw.C.y)*.62,-.05,.34);crouch=(.1+Math.max(0,lowc))*(1-sstep(.15,.55,tau))*sstep(-.6,-.2,tau);lean=.1*sstep(-.2,.05,tau)*(1-sstep(.15,.6,tau));
        if(sw.rx!==undefined){const w=Math.exp(-(((tau/.17)**2)))*.22;px=lerp(px,sw.rx,w);pz=lerp(pz,sw.rz,w);}
      }
      const hy0=py;
      const kp=(f,r,u)=>[px+fx*f+Rx*r,hy0+u*(sw.type==='serve'||sw.type==='smash'?k*.98+.02:1)-crouch*.4,pz+fz*f+Rz*r];
      const hK=kp(Kc[0],Kc[1],Kc[2]),h0=kp(k0[0],k0[1],k0[2]);
      const d0=[fx*k0[3]+Rx*k0[4],k0[5],fz*k0[3]+Rz*k0[4]];const dk=[fx*Kc[3]+Rx*Kc[4],Kc[5],fz*Kc[3]+Rz*Kc[4]];
      const dl=Math.hypot(...d0);d0[0]/=dl;d0[1]/=dl;d0[2]/=dl;
      const w=Math.exp(-(((tau/.2)**2)));
      const s0=[h0[0]+d0[0]*.5,h0[1]+d0[1]*.5,h0[2]+d0[2]*.5];
      S=sw.C;H=[hK[0]+(S.x-s0[0])*w,hK[1]+(S.y-s0[1])*w,hK[2]+(S.z-s0[2])*w];dir=dk;
    }else if(pose==='sit'&&false){}
    const G_=o.gait,run=spd>.05,ph=G_?G_.arm:(a.phase||0);
    let bob=0;
    if(!sw){
      if(pose==='crouch'){crouch=.3;lean=.32;}
      else if(pose==='pick'){crouch=.42;lean=.62;}
      else if(pose==='ready'||(inPlay&&spd<1.4)){crouch=(pose==='ready'?.22:.15)+(a.split&&t-a.split<.22?.08*Math.sin((t-a.split)/.22*3.14):0);lean=pose==='ready'?.17:.12;}
      else if(pose==='read'){crouch=.3;lean=.5;}
      else if(pose==='pull'){lean=.32;crouch=.1;}
      else if(pose==='drag'){lean=.2;}
      if(run){bob=G_?G_.bob*.7:Math.abs(Math.sin(ph))*(spd>3?.05:.022);lean=Math.max(lean,clamp(spd*.028,0,.15));crouch=Math.max(crouch,clamp((spd-1.5)*.03,0,.12));}
      if(a.split&&t-a.split<.16&&!G_)py+=Math.sin((t-a.split)/.16*3.14)*.1;
      if(a.cheer&&t<a.cheer){py+=Math.abs(Math.sin((a.cheer-t)*7))*.05;}
      if(a.sulk&&t<a.sulk){lean=Math.max(lean,.3);}
    }
    const seated=pose==='sit';
    const hipY=seated?py+.49:(py+.86*k-crouch*.55+bob+(G_?G_.lift:0));
    const back=crouch*.12+Math.sin(Math.max(0,lean))*.6*k*.45,hx=px-fx*back,hz=pz-fz*back;
    const lx=hx+rx*sway,lz=hz+rz*sway;
    // chest with coil
    const cy=yaw-(sw?sw.hs:1)*tw,cfx=Math.sin(cy),cfz=Math.cos(cy),crx=-cfz,crz=cfx;
    // the pelvis turns with the stroke about half as far as the shoulders: the legs wind up over planted feet
    const pyw=yaw-(sw?sw.hs:1)*tw*.45,prx=-Math.cos(pyw),prz=Math.sin(pyw);
    const sp=.6*k,lf=seated?-.06:lean,cx=lx+fx*Math.sin(lf)*sp,cz=lz+fz*Math.sin(lf)*sp,chY=hipY+Math.cos(lf)*sp;
    const nk=sp+.035*k,nkx=lx+fx*Math.sin(lf)*nk,nkz=lz+fz*Math.sin(lf)*nk,nkY=hipY+Math.cos(lf)*nk;
    let hdx=fx,hdz=fz;
    if(o.look){const dx=o.look.x-nkx,dz=o.look.z-nkz,l=Math.hypot(dx,dz)||1;const ax=dx/l,az=dz/l;const dot=ax*fx+az*fz;const m=dot>-.2?1:.55;hdx=lerp(fx,ax,m);hdz=lerp(fz,az,m);const q=Math.hypot(hdx,hdz)||1;hdx/=q;hdz/=q;}
    const hY=nkY+.125*k,hYaw=Math.atan2(hdx,hdz);
    if(a.sulk&&t<a.sulk){}
    for(const q of[-1,1])B.box(nkx+hdx*.1*k-hdz*q*.038*k,hY+.01*k,nkz+hdz*.1*k+hdx*q*.038*k,.022*k,.026*k,.02,hYaw,0x1c1f2e);
    if(c.hair!=null&&c.long){const pv=Math.sin(ph*2)*.04*Math.min(spd,4),sw6=Math.min(spd,6)*.03;
      B.seg('limb',nkx-hdx*.11*k,hY+.06*k,nkz-hdz*.11*k,nkx-hdx*(.2+sw6)+hdz*pv,hY-.2+sw6,nkz-hdz*(.2+sw6)-hdx*pv,.075,.055,c.hair,hdz,0,-hdx);}
    if(c.cap!=null)B.box(nkx+hdx*.11*k,hY+.045*k,nkz+hdz*.11*k,.17*k,.02,.1*k,hYaw,c.cap);
    if(c.band!=null)B.put('limb',nkx,hY+.045*k,nkz,.212*k,.04*k,.228*k,hYaw,c.band);
    // legs
    const L1=.4*k,L2=.41*k,stance=(sw||pose==='ready'||inPlay)?.2:.12;
    const legs=[];
    for(const s of[-1,1]){
      const hp=[lx+prx*s*.09*k,hipY-.04,lz+prz*s*.09*k];let fX,fY,fZ;const q=ph+(s>0?0:Math.PI);
      if(seated){fX=lx+fx*.48+rx*s*.14;fZ=lz+fz*.48+rz*s*.14;fY=py+.03;}
      else if(pose==='climb'){const w=Math.sin(ph*1.2+(s>0?0:3.1))*.16;fX=lx+rx*s*.13-fx*.0;fZ=lz+rz*s*.13;fY=py+.25+w;}
      else if(G_){const F=G_.feet[s>0?1:0];fX=F.x;fZ=F.z;fY=py*(sw?.55:1)+.03+F.y;}
      else if(run){
        const dvx=inPlay?(a.vx/(spd||1)):fx,dvz=inPlay?(a.vz/(spd||1)):fz,A=spd>3?.5:Math.min(.32,spd*.15),lift=spd>3?.26:.13;
        fX=lx+rx*s*.1+dvx*Math.cos(q)*A;fZ=lz+rz*s*.1+dvz*Math.cos(q)*A;fY=py+.03+Math.max(0,Math.sin(q))*lift;
      }else{fX=lx+rx*s*stance*k+fx*s*.05;fZ=lz+rz*s*stance*k+fz*s*.05;fY=py*(sw?.55:1)+.03;}
      if(sw&&!run&&!G_){fX+=fx*(s===sw.hs?.0:-.0)+fx*(tau>0?s*.1:0);}
      const[kn,e]=FigureRig.chain(hp,[fX,fY+.03,fZ],L1,L2,[fx+rx*s*.15,.1,fz+rz*s*.15]);legs.push([hp,kn,e]);
      // a shoe: a white sole under the upper, heel to a rounded toe along the way the body faces
      const sh=c.shoe??SHOE,gu=G_?G_.feet[s>0?1:0].u:1,pit=gu<1?Math.sin(PI*gu)*.55:0,fy=yaw+s*.22,cp=Math.cos(pit);
      const fdx=Math.sin(fy)*cp,fdy=-Math.sin(pit),fdz=Math.cos(fy)*cp,hl=[e[0]-fdx*.07*k,e[1]-.03-fdy*.07*k,e[2]-fdz*.07*k],toe=[e[0]+fdx*.17*k,e[1]-.03+fdy*.17*k,e[2]+fdz*.17*k];
      B.seg('box',hl[0],hl[1]-.022,hl[2],toe[0],toe[1]-.022,toe[2],.098*k,.02,0xf4f3ec,0,1,0);B.seg('box',hl[0],hl[1],hl[2],toe[0]-fdx*.03,toe[1]-fdy*.03,toe[2]-fdz*.03,.09*k,.055,sh,0,1,0);B.ball(toe[0]-fdx*.03,toe[1]-.003,toe[2]-fdz*.03,.09*k,.055,.09*k,fy,sh);
    }
    // arms
    const shY=chY-.05*k,hnd=a.st?a.st.hand:1,U1=.3*k,U2=.3*k,W1=.095*k,W2=.08*k;
    const sh=s=>[cx+crx*s*.165*k,shY,cz+crz*s*.165*k];
    let handR=null,handL=null,rd=null;
    const hasRacket=!!a.st;
    const R0=sh(hnd),L0=sh(-hnd);
    let t1=null,t2=null,dirR=null;
    if(sw){
      t1=H;
      // which hands hold the racket: a two-handed backhand has the off hand above the playing hand on the grip;
      // a one-handed backhand or a slice is cradled at the throat on the way back, then the off arm goes back for balance
      const two=sw.type==='bh'&&!(a.st&&a.st.ohb),back=sw.hs!==hnd,Rx=rx*sw.hs,Rz=rz*sw.hs,dl=Math.hypot(...dir)||1;
      if(sw.type==='serve'){
        const T=FigureRig.evalKeys(TOSS,tau,[0,0,0,0,0,0,0]),Rx=rx*sw.hs,Rz=rz*sw.hs;t2=[px+fx*T[0]+Rx*T[1],py+T[2]*k-crouch*.3,pz+fz*T[0]+Rz*T[1]];
      }else if(two){t2=[H[0]+dir[0]/dl*.13,H[1]+dir[1]/dl*.13,H[2]+dir[2]/dl*.13];}
      else if(back&&(sw.type==='bh'||sw.type==='slice'||sw.type==='volley')){
        const rel=sstep(-.3,-.12,tau),thr=[H[0]+dir[0]/dl*.33,H[1]+dir[1]/dl*.33,H[2]+dir[2]/dl*.33],bal=[px-fx*.34-Rx*.3,py+(.95+.2*sstep(-.1,.3,tau))*k,pz-fz*.34-Rz*.3];
        t2=[lerp(thr[0],bal[0],rel),lerp(thr[1],bal[1],rel),lerp(thr[2],bal[2],rel)];}
      else if(sw.type==='smash'){const T=[.38,-.1,1.95];const Rx=rx*sw.hs,Rz=rz*sw.hs,f=1-sstep(-.1,.16,tau);t2=[px+fx*.3+Rx*-.15,py+lerp(1.05,1.95,f),pz+fz*.3+Rz*-.15];}
      else{
        // forehand: the off arm reaches out across the body with the turn, then folds in to the chest through the swing
        const out=sstep(-.6,-.38,tau)*(1-sstep(-.12,.12,tau)),tuck=[px+fx*.16-Rx*.14,py+1.12*k,pz+fz*.16-Rz*.14],pt=[px+fx*.3+Rx*.34,py+1.3*k,pz+fz*.3+Rz*.34];
        t2=[lerp(tuck[0],pt[0],out),lerp(tuck[1],pt[1],out),lerp(tuck[2],pt[2],out)];}
      if(Math.abs(tau)<.05){dirR=[S.x-H[0],S.y-H[1],S.z-H[2]];}else dirR=dir;
    }else if(pose==='sit'){
      t1=[R0[0]+fx*.24,hipY+.1,R0[2]+fz*.24];t2=[L0[0]+fx*.22,hipY+.1,L0[2]+fz*.22];
      if(o.drink&&hasRacket){t1=[R0[0]+fx*.18,shY+.22,R0[2]+fz*.18];}
    }else if(pose==='shake'){
      t1=[R0[0]+fx*.45,1.05*k,R0[2]+fz*.45];t1[1]+=Math.sin(t*14)*.03;t2=[L0[0],hipY-.05,L0[2]];
    }else if(pose==='ritual'){
      const f=a.ritual?clamp((t-a.ritual)/(a.ritualT||.5),0,1):0;t1=[R0[0]+fx*.12-rx*.12*hnd,hipY+.05,R0[2]+fz*.12-rz*.12*hnd];t2=[px+fx*.42,1.02-Math.sin(f*3.14)*.14,pz+fz*.42];dirR=[fx*.7,.3,fz*.7];
    }else if(pose==='crouch'||pose==='pick'){
      t1=[R0[0]+fx*.36,hipY-.16,R0[2]+fz*.36];t2=[L0[0]+fx*.36,hipY-.16,L0[2]+fz*.36];if(pose==='pick')t1=[px+fx*.34,.1,pz+fz*.34];
    }else if(pose==='throw'){const q=clamp((t-(a.throwT||0))/.4,0,1);t1=[R0[0]+fx*(lerp(-.3,.5,q)),lerp(1.3,.8,q),R0[2]+fz*lerp(-.3,.5,q)];t2=[L0[0]+fx*.1,hipY,L0[2]+fz*.1];}
    else if(pose==='pull'){t1=[R0[0]+fx*.4,1.05*k,R0[2]+fz*.4];t2=[L0[0]+fx*.4,1.05*k,L0[2]+fz*.4];}
    else if(pose==='drag'){t1=[R0[0]-fx*.34,.85*k,R0[2]-fz*.34];t2=[L0[0]-fx*.34,.85*k,L0[2]-fz*.34];}
    else if(pose==='climb'){const w=Math.sin(ph*1.2)*.16;t1=[R0[0]+fx*.24,shY+.1+w,R0[2]+fz*.24];t2=[L0[0]+fx*.24,shY+.1-w,L0[2]+fz*.24];}
    else if(pose==='read'){t1=[R0[0]+fx*.4,hipY-.1,R0[2]+fz*.4];t2=[L0[0]+fx*.1,hipY+.1,L0[2]+fz*.1];}
    else if(a.cheer&&t<a.cheer&&hasRacket){t1=[R0[0]+fx*.1,shY+.5,R0[2]+fz*.1];t2=[L0[0]+fx*.08,hipY+.02,L0[2]+fz*.08];dirR=[fx*.2,.95,fz*.2];}
    else if(inPlay&&hasRacket&&(pose==='ready'||spd<3.6||!run)){ // ready position, both hands forward
      const dd=.36;t1=[lx+fx*dd+rx*hnd*.13,hipY+.2,lz+fz*dd+rz*hnd*.13];t2=[lx+fx*dd+.0+fx*.14-rx*hnd*.03,hipY+.22,lz+fz*.5-rz*hnd*.03];dirR=[fx*.7-rx*hnd*.3,.4,fz*.7-rz*hnd*.3];
    }else if(pose==='ready'&&hasRacket){const dd=.36;t1=[lx+fx*dd+rx*hnd*.13,hipY+.2,lz+fz*dd+rz*hnd*.13];t2=[lx+fx*.5-rx*hnd*.03,hipY+.22,lz+fz*.5-rz*hnd*.03];dirR=[fx*.7-rx*hnd*.3,.4,fz*.7-rz*hnd*.3];}
    else{
      const sw2=run?Math.sin(ph)*(spd>3?.26:.14):0;
      t1=[R0[0]+fx*sw2+rx*hnd*.03,shY-.54*k+(spd>3?.2:0),R0[2]+fz*sw2+rz*hnd*.03];t2=[L0[0]-fx*sw2-rx*hnd*.03,shY-.54*k+(spd>3?.2:0),L0[2]-fz*sw2-rz*hnd*.03];
      if(hasRacket)dirR=[fx*.55,-.55,fz*.55];
    }
    const armC=c.arm??c.skin;
    R0[1]+=clamp((t1[1]-R0[1])*.12,0,.06*k);L0[1]+=clamp((t2[1]-L0[1])*.12,0,.06*k);
    const[elR,e1]=FigureRig.chain(R0,t1,U1,U2,[-fx*.4+rx*hnd*.7,-.65,-fz*.4+rz*hnd*.7]),[elL,e2]=FigureRig.chain(L0,t2,U1,U2,[-fx*.4-rx*hnd*.7,-.65,-fz*.4-rz*hnd*.7]);
    for(const[el,e]of[[elR,e1],[elL,e2]]){const dx=e[0]-el[0],dy=e[1]-el[1],dz=e[2]-el[2],l=Math.hypot(dx,dy,dz)||1;
      B.seg('ball',e[0]-dx/l*.01,e[1]-dy/l*.01,e[2]-dz/l*.01,e[0]+dx/l*.1*k,e[1]+dy/l*.1*k,e[2]+dz/l*.1*k,.065*k,.035*k,armC,crx,0,crz);}
    if(o.body)o.body.update({k,P:[lx,hipY,lz],C:[cx,chY,cz],N:[nkx,nkY,nkz],H:[nkx,hY,nkz],pr:[prx,0,prz],cr:[crx,0,crz],hd:[hdx,0,hdz],legs,arms:[[R0,elR,e1],[L0,elL,e2]]});
    if(hasRacket&&!seated&&!(pose==='shake')){
      const dd=(sw&&Math.abs(tau)<.04)?[S.x-e1[0],S.y-e1[1],S.z-e1[2]]:(dirR||dir||[fx,.2,fz]);
      a.rkt=FigureRig.racket(B,e1[0],e1[1],e1[2],dd[0],dd[1],dd[2],fx,fz,c.racket??RKT,sw?FigureRig.face(sw.type,tau):0);
    }
    if(pose==='pull'||pose==='drag'){}
    return[e1,e2];
  }
}
