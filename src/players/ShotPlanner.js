// ShotPlanner — reads the ball, picks where to meet it, and chooses the shot
// how far from the ball each stroke is played: r to the side, f in front
const SWING={fh:{r:.93,f:.42},bh:{r:.58,f:.52},slice:{r:.62,f:.5},volley:{r:.76,f:.62},smash:{r:.24,f:.26},serve:{r:.14,f:.34}};
// reads the precomputed path of the ball, picks where and how to meet it, and what to do with it
class ShotPlanner{
  constructor(match){this.m=match;}
  want(P){const C=this.m.control;return C.is(P)?C.shot:null;}
  makePlan(P){
    const m=this.m,tr=m.tr,now=m.t,i0=Math.max(0,Math.round((now-tr.t0)/DT)),s=P.s,st=P.st,hand=st.hand;
    const Fz=-s,Rx=-Fz; // right vector for someone facing Fz
    let best=null,bs=-1e9,near=null,nd=1e9;
    if(tr.hasB&&P.mode==='play'){
      const mm=m.isServe?Court.signedBox(tr.fbx,tr.fbz,sgn(-m.serveX)):Court.signedIn(tr.fbx,tr.fbz);
      const volleyable=(P.rush||Math.abs(P.z)<7.2)&&!m.isServe;
      if(mm<-.12+N(.05)&&!volleyable){P.plan=null;P.swing=null;P.gx=P.x;P.gz=P.z;P.leaving=true;return null;}
    }
    const allowV=!m.isServe&&(P.rush||Math.abs(P.z)<7.8);
    for(let i=i0+6;i<tr.n;i+=3){
      const x=tr.x[i],y=tr.y[i],z=tr.z[i],bc=tr.bc[i],t=tr.t0+i*DT;
      if(z*s<1.0)continue;if(bc>=2)break;
      let kind=null;
      if(bc===1){if(y>=.3&&y<=1.95)kind='ground';else if(y>2.1&&y<3.0)kind='smash';}
      else if(allowV){if(y>=.35&&y<2.1)kind='volley';else if(y>=2.1&&y<3.0)kind='smash';}
      if(!kind)continue;
      const l=(x-P.x)*Rx*hand;
      let wing=kind==='smash'?'smash':kind==='volley'?(l>-.2?'fh':'bh'):(l>-.55?'fh':'bh');
      const dt=t-now;
      const reach=w=>{const sw=kind==='smash'?SWING.smash:kind==='volley'?SWING.volley:SWING[w],hs=kind==='smash'?hand:(w==='fh'?hand:-hand),
        rx=clamp(x-Rx*hs*sw.r,-CT.FX+.3,CT.FX-.3),rz=z-Fz*sw.f,d=hyp(rx-P.x,rz-P.z),back=d>.05?Math.max(0,-(P.vx*(rx-P.x)+P.vz*(rz-P.z))/d)/P.loco.brake:0;
        return{hs,rx,rz,d,margin:dt-(P.timeTo(d)+.03+back+(m.isServe?.06:0))};};
      let q=reach(wing);
      // with time in hand, a player steps around the backhand to hit a forehand
      if(kind==='ground'&&wing==='bh'&&!m.isServe){const w=this.want(P),dr=w==='drive'||w==='flat',rr=dr?2.8:.55+st.aggr*.75;
        if(l>-rr){const f=reach('fh');if(f.margin>(dr?.02:.22)){wing='fh';q=f;}}}
      const{hs,rx,rz,d,margin}=q;
      if(rz*s<.5)continue;
      if(d<nd+dt*.1&&margin>-.9){nd=d;near={i,x,y,z,t,kind,wing,hs,rx,rz,margin,bc};}
      if(margin<0)continue;
      let sc;
      if(kind==='ground'){sc=2-Math.abs(y-.95)*1.1-Math.max(0,Math.abs(z)-(12.3+st.deep*.9))*.7+Math.min(margin,.5)*1.4-dt*(.12+st.aggr*.3);if(y<.45)sc-=.8;}
      else if(kind==='volley')sc=(P.rush?3.5:1.6)-Math.abs(y-1.1)*.6-dt*.2;
      else sc=3.2-dt*.2;
      if(sc>bs){bs=sc;best={i,x,y,z,t,kind,wing,hs,rx,rz,margin,bc};}
    }
    const p=best||near;
    if(!p){P.plan=null;P.swing=null;return null;}
    p.stretch=clamp((.3-p.margin)/.6,0,1);
    p.shot=this.chooseShot(P,p);
    P.plan=p;P.gx=p.rx;P.gz=p.rz;P.swing=this.swingFor(P,p);
    return p;
  }
  swingFor(P,p){
    const type=p.kind==='smash'?'smash':p.kind==='volley'?'volley':(p.shot.sw||p.wing);
    return{type,tc:p.t,end:type==='volley'?.3:.62,hs:p.hs,F:-P.s,C:{x:p.x,y:p.y,z:p.z},rx:p.rx,rz:p.rz,two:p.wing==='bh'&&type==='bh'};
  }
  // tactic, target, pace, spin and net clearance for a planned contact
  chooseShot(P,c){
    const m=this.m,O=m.other(P),st=P.st,dep=Math.abs(c.z),lat=c.x,side=Math.abs(lat)>.8?sgn(lat):sgn(O.x||1)*-1;
    const oppNet=Math.abs(O.z)<7.4||O.rush,oppDeep=Math.abs(O.z)>12.3,openX=-sgn(O.x||(R()-.5));
    const mg=lerp(1.05,.52,st.aggr),P0=st.power,SW=CT.SW;
    const T=(x,d)=>({x:clamp(x,-SW+.25,SW-.25),d:clamp(d,1.2,CT.L-.35)});
    const pick=(sit,l)=>m.tactics.pick(P,sit,l),w=this.want(P);
    let tac;
    if(w&&(c.kind==='ground'||(c.kind==='volley'&&(w==='lob'||w==='drop'))))tac=w;
    else if(c.kind==='smash')tac='smash';
    else if(c.kind==='volley')tac=oppDeep&&c.y<1.0&&R()<.3+st.drop*.4?'dropvolley':'volley';
    else if(c.stretch>.55)tac=pick('stretch',[['slice',1.2+st.slice*2],['lob',.25+st.lob*1.1],['safe',2]]);
    else if(oppNet)tac=pick('pass',[['passline',2],['passcross',2],['lob',.5+st.lob*1.6]]);
    else if(dep<9.2&&c.y>.62)tac=pick('short',[['approach',.5+st.net*4],['drop',oppDeep?st.drop*2.2:.1],['angle',1],['line',1.2],['cross',1]]);
    else if(m.isServe)tac=pick('return'+m.serveNo,[['safe',2.2],['cross',1.4],['line',.5],['slice',c.wing==='bh'?st.slice*1.2:0],['lob',st.lob*.12]]);
    else tac=pick(c.wing==='fh'?'rallyfh':'rallybh',[['cross',3],['line',1+(Math.abs(lat)>2?1:0)],['angle',Math.abs(lat)>2.4?.9:.2],['slice',c.wing==='bh'?st.slice*1.6:.05],['drop',oppDeep?st.drop*.55:.02]]);
    let t,v,rpm=st.spin,clear=.11+(1-st.aggr)*.24,sw=null,risk=1,maxEl=.75;
    switch(tac){
      case'safe':     t=T(-side*1.6,CT.L-1.9);v=26*P0;rpm=st.spin*.9;clear=.75;risk=.9;break;
      case'cross':    t=T(-side*(SW-mg),CT.L-mg-.35);v=33*P0;break;
      case'line':     t=T(side*(SW-mg-.1),CT.L-mg-.35);v=33*P0;risk=1.2;break;
      case'angle':    t=T(-side*(SW-.6),5.9+R()*1.2);v=25*P0;rpm=st.spin*1.25;risk=1.2;break;
      case'slice':    t=T(-side*(SW-mg-.3),CT.L-mg-.7);v=24*P0;rpm=-2300;clear=.32;sw='slice';break;
      case'drop':     t=T(openX*(1.2+R()*1.6),1.9+R()*1.3);v=11.5;rpm=-2800;clear=.2;sw='slice';risk=1.25;break;
      case'drive':    t=T(openX*(SW-mg-.2),CT.L-mg-.5);v=37*P0;rpm=st.spin*.85;clear=.16;risk=c.wing==='fh'?.72:.95;break;
      case'flat':     t=T(openX*(SW-mg-.15),CT.L-mg-.4);v=41*P0;rpm=st.spin*.3;clear=.09;risk=c.wing==='fh'?1.15:1.3;maxEl=.5;break;
      case'lob':      t=T(openX*2.2,CT.L-1.3);v=20;rpm=c.stretch>.5?900:Math.max(2200,st.spin);clear=1.6;maxEl=1.05;risk=.95;break;
      case'passline': t=T(side*(SW-.65),CT.L-1.6);v=35*P0;risk=1.25;break;
      case'passcross':t=T(-side*(SW-.55),7.2);v=31*P0;rpm=st.spin*1.15;risk=1.2;break;
      case'approach': t=T(side*(SW-1.1),CT.L-1.0);v=32*P0;rpm=st.spin*.7;risk=1.05;break;
      case'volley':   t=T(openX*(SW-.8),c.y>1.1?CT.L-2.2:7.5);v=c.y>1.1?27*P0:20;rpm=-1200;clear=.12;risk=1.05;break;
      case'dropvolley':t=T(openX*2.2,2.6);v=9.5;rpm=-1800;clear=.14;risk=1.15;break;
      case'smash':    t=T(openX*(SW-.9),CT.L-2.6);v=42*P0;rpm=400;clear=.2;risk=.95;break;
      default:t=T(0,9);v=26;
    }
    return{tac,t,v,rpm,clear,sw,risk,maxEl};
  }
}
