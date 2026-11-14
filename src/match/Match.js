// Match — one match: the director coroutines, rallies, line calls, changeovers
class Match{
  // the returner: split-step reaction after the serve is struck, and how wide of centre they stand
  // returning serve: reaction time, where the returner stands, how much harder a return is to control than a
  // rally ball (first serve; a second serve counts half) and how much of a full swing it gets
  static RETURN={react:.14,jitter:.05,x:2.9,deep:.1,err:5.5,pace:.6};
  // how wild serves are overall; set so first serves land about 63% of the time (tools/balance.js)
  static SERVE_ERR=1.4;
  // when the person presses the shot key, measured in seconds before contact: committing as the ball arrives is
  // rewarded, committing long before is neutral, leaving it to the last instant is a mishit
  static TIMING={late:{text:'Late',err:1.2,v:.97},perfect:{text:'Perfect',err:.65,v:1.04},good:{text:'Good',err:.85,v:1.02},early:{text:'',err:1,v:1}};
  static timing(d){const T=Match.TIMING;return d<.05?T.late:d<=.35?T.perfect:d<=.7?T.good:T.early;}
  // cfg: a, b (profiles), human (0, or -1 for two computer players), format, surface, walkOn, loop
  constructor(cfg){
    this.cfg=Object.assign({human:-1,format:MatchFormat.ALL[0],surface:'hard',walkOn:false,loop:false},cfg);
    this.t=0;this.events=[];this.tasks=[];
    this.physics=new BallPhysics(SURFACES[this.cfg.surface]);this.solver=new ShotSolver(this.physics);this.tr=new Trajectory();
    this.control=new HumanControl(this.cfg.human);this.planner=new ShotPlanner(this);this.tactics=this.cfg.tactics||new Tactics();
    this.players=[new Player(this.cfg.a,0),new Player(this.cfg.b,1)];
    this.ump=new Umpire();this.kids=KID_POS.map(([x,z],i)=>new BallKid(x,z,i));this.movers=[...this.players,...this.kids,this.ump];
    this.ball=null;this.loose=[];this.live=false;this.hitter=null;this.recv=null;this.isServe=false;this.serveNo=1;this.serveX=1;
    this.rallyLen=0;this.lastTac='';this.kmh=0;this.serveLabel='';this.bubble=null;this.cue=null;this.status='';this.stage='walkon';
    this.mood=new CrowdMood(this);this.how=null;this.wave=-99;this.score=null;this.big=null;this.result=null;this.longest=0;this.matchNo=0;
    this.stats={shots:0,rallies:0,rallyShots:0,whiff:0,lets:0,points:0,cords:0,tac:{}};
    this.spawn(this.director());
  }
  get surface(){return this.physics.surface;}
  get A(){return this.players[0];} get B(){return this.players[1];}
  get human(){return this.control.idx>=0?this.players[this.control.idx]:null;}
  get timeScale(){return this.control.timeScale;}
  other(P){return P===this.A?this.B:this.A;}
  ev(type,o={}){if(this.events.length<400)this.events.push(Object.assign({type},o));}
  say(text,who='ump',s=2.6){this.bubble={text,who,until:this.t+s};this.ev('say',{text,who});}
  note(text){this.ev('note',{text});}
  spawn(g){this.tasks.push(g);}

  tick(){
    for(const a of this.movers)a.keep();if(this.ball)this.ball.keep();
    this.t+=DT;
    for(let i=this.tasks.length-1;i>=0;i--){if(this.tasks[i].next().done)this.tasks.splice(i,1);}
    for(const k of this.kids)k.follow(DT);this.ump.follow(DT);
    for(const P of this.players){if(P.mode==='walk')P.follow(DT);else P.run(DT,this);if(P.swing&&this.t>P.swing.tc+P.swing.end)P.swing=null;}
    for(const b of this.loose){if(b.mode!=='free'||b.still)continue;
      const ev=this.physics.step(b,DT,true);if(ev&HIT.BOUNCE)this.ev('thud',{x:b.x,z:b.z,v:Math.abs(b.vy)});
      if(Math.abs(b.x)>CT.FX-.12){b.x=sgn(b.x)*(CT.FX-.12);b.vx*=-.25;b.vz*=.5;b.vy*=.5;this.ev('thud',{x:b.x,z:b.z,v:2});}
      if(Math.abs(b.z)>CT.FZ-.12){b.z=sgn(b.z)*(CT.FZ-.12);b.vz*=-.25;b.vx*=.5;b.vy*=.5;this.ev('thud',{x:b.x,z:b.z,v:2});}
      if(b.rolling&&Math.hypot(b.vx,b.vz)<.08)b.still=true;}
    this.mood.tick(DT);
    if(this.ball&&this.ball.mode==='held'){const h=this.ball.holder;this.ball.x=h.x;this.ball.z=h.z;this.ball.y=1.0;}
  }
  *wait(s){const e=this.t+s;while(this.t<e)yield;}
  *allOf(list){while(list.some(f=>f()))yield;}
  // walking routes avoid the net and use the players' tunnel
  route(a,x,z){
    const inside=q=>Math.abs(q.z)<CT.FZ&&Math.abs(q.x)<CT.FX+.2,to={x,z},p=[];
    const net=(u,v)=>{if(u.z*v.z<0){const xc=u.x+(v.x-u.x)*(-u.z/(v.z-u.z));if(Math.abs(xc)<7)p.push({x:u.x+v.x<0?-6.86:6.86,z:0});}};
    const gi={x:TUNNEL.x,z:-17.6},go={x:TUNNEL.x,z:-19.4};
    if(inside(a)&&inside(to))net(a,to);
    else if(!inside(a)&&inside(to)){p.push(go,gi);net(gi,to);}
    else if(inside(a)&&!inside(to)){net(a,gi);p.push(gi,go);}
    p.push(to);return p;
  }
  go(a,x,z,v=2.4){a.mode='walk';a.path=this.route(a,x,z);a.vmax=v;a.pose='stand';}
  *goW(a,x,z,v){this.go(a,x,z,v);while(a.path.length)yield;}

  // ──────── the person at the screen ────────
  // a click on the court: a serve target inside the right box, or a rally target on the far half
  aimAt(x,z){
    const H=this.human,C=this.control;if(!H||this.stage!=='play')return false;
    if(this.cue&&this.cue.who===H.idx){
      const sx=this.cue.side,zs=-H.s,inX=x*sx>-1.2&&Math.abs(x)<CT.SW+1.2,inZ=z*zs>-.5&&Math.abs(z)<CT.SVC+1.5;
      if(!inX||!inZ)return false;
      C.target={x:sx*clamp(Math.abs(x)*sgn(x*sx),.15,CT.SW-.12),z:zs*clamp(Math.abs(z),1.2,CT.SVC-.12)};C.zone=null;return true;
    }
    if(z*H.s>-.3)return false;   // own half
    C.target={x:clamp(x,-CT.SW+.15,CT.SW-.15),z:-H.s*clamp(Math.abs(z),1.0,CT.L-.15)};
    return true;
  }
  setShot(k){
    const C=this.control;C.shot=C.shot===k?null:k;C.shotAt=C.shot?this.t:null;
    const P=this.human;if(P&&P.plan&&P.swing&&C.decide){P.plan.shot=this.planner.chooseShot(P,P.plan);const sw=this.planner.swingFor(P,P.plan);P.swing.type=sw.type;P.swing.two=sw.two;}
  }
  setServe(k){const C=this.control;C.serveType=C.serveType===k?null:k;}
  setZone(k){const C=this.control;C.zone=k;C.target=null;}
  setAuto(on){this.control.auto=on;if(on)this.control.decide=null;}

  // ──────── director ────────
  *director(){
    const A=this.A,B=this.B;A.s=1;B.s=-1;
    if(this.cfg.walkOn)yield* this.walkOn();
    else{A.x=.8;A.z=12.4;B.x=-.6;B.z=-12.2;A.yaw=A.facing;B.yaw=B.facing;}
    for(;;){
      this.matchNo++;this.score=new Score(A,B,R()<.5?0:1,this.cfg.format);
      for(const P of this.players)P.ms=Player.freshStats();this.longest=0;this.result=null;this.stage='play';
      this.ev('matchStart',{});
      this.say(`${this.score.srv.short} to serve. Play.`,'ump',2.4);
      while(!this.score.over)yield* this.point();
      yield* this.matchEnd();
      if(!this.cfg.loop)return;
      yield* this.wait(5);
      yield* this.swapEnds();
    }
  }
  *walkOn(){
    const A=this.A,B=this.B;this.stage='walkon';this.status='Players walk out';
    // the player bound for the far end is already well along the side of the court, so nobody waits for a long walk
    B.x=TUNNEL.x-.3;B.z=-CT.FZ+.6;A.x=TUNNEL.x+.3;A.z=-7.5;A.yaw=B.yaw=0;
    this.mood.walkOn();
    this.say('Please welcome the players.','ump',2.8);
    // a brisk walk, arms loose
    this.go(A,.8,A.s*12.4,2.4);this.go(B,-.6,B.s*12.2,2.2);
    yield* this.allOf([()=>A.path.length,()=>B.path.length]);
    A.yaw=A.facing;B.yaw=B.facing;this.status='';
    yield* this.wait(.6);
  }
  *point(){
    let no=1,w=-1;const sc=this.score;this.tactics.begin();
    this.big=sc.bigPoint();if(this.big)this.ev('bigPoint',this.big);
    for(;;){
      yield* this.ready(no);
      const r=yield* this.servePoint(no);
      this.live=false;this.cue=null;this.control.decide=null;
      {const q=sc.srv.idx;if(r.fault)this.ev('tag',{who:q,text:no===1?'Fault':'Double fault',strong:true});else if(r.replay)this.ev('tag',{who:q,text:'Let',strong:true});}
      if(this.ball){this.ball.mode='free';this.loose.push(this.ball);this.spawn(this.fetch(this.ball));this.ball=null;}
      for(const P of this.players)P.resetRally();
      if(r.replay){this.stats.lets++;yield* this.wait(1.2);continue;}
      if(r.fault){
        if(no===1){this.say(r.call||'Fault.');no=2;yield* this.wait(1.1);continue;}
        sc.srv.ms.df++;this.how={kind:'df',by:sc.srv.idx};this.say('Double fault.');this.note(`Double fault from ${sc.srv.short}.`);w=1-sc.server;yield* this.wait(1.0);break;
      }
      w=r.w;break;
    }
    this.stats.points++;this.tactics.reward(w,this.players);if(this.stats.points%8===0)this.tactics.save();
    const winner=sc.p[w],loser=sc.p[1-w],Sv=sc.srv;
    winner.ms.pts++;if(w===sc.server){if(no===1)Sv.ms.won1++;else Sv.ms.won2++;}
    if(no===2)Sv.ms.sv2++;
    if(this.big&&this.big.label==='Break point'){sc.rcv.ms.bpT++;if(w===this.big.w)sc.rcv.ms.bpW++;}
    const n=this.rallyLen||0,long=n>=5||sc.mode!=='game'||!!this.big;
    if(long){winner.cheer=this.t+1.1;loser.sulk=this.t+1.3;}
    this.longest=Math.max(this.longest,n);
    this.mood.point(winner,loser,this.how||{kind:'error',by:loser.idx},n,this.big);
    const bp=this.big,ev=sc.point(w);
    this.ev('scored',{w,result:ev.type,was:bp});
    yield* this.wait(.9);
    if(ev.call)this.say(ev.call,'ump',3.2);
    yield* this.wait(1.6);
    if(sc.over)return;
    if(ev.changeEnds&&ev.sit){yield* this.sit(true);this.mood.changeover(ev.setOver);if(R()<.45||ev.setOver)this.wave=this.t;yield* this.wait(ev.setOver?7:5);this.say('Time.','ump',1.6);yield* this.stand();}
    else if(ev.changeEnds)yield* this.swapEnds();
    else if(ev.setOver){yield* this.sit(false);this.mood.changeover(true);this.wave=this.t;yield* this.wait(6);this.say('Time.','ump',1.6);yield* this.stand();}
  }
  *ready(no){
    const sc=this.score,Sv=sc.srv,Rc=sc.rcv;
    const sx=(sc.deuceCourt?Sv.s:-Sv.s)*(.75+R()*.1);
    this.serveX=sx;
    const RT=Match.RETURN,rd=clamp(12.9+Rc.st.deep*.6-(no===2?.9:0)+(Sv.st.s1>55?.5:0)+RT.deep,11.6,14.5);
    this.go(Sv,sx,Sv.s*(CT.L+.12),2.6);
    this.go(Rc,-sgn(sx)*RT.x,Rc.s*rd,2.6);       // across the diagonal from the server
    yield* this.allOf([()=>Sv.path.length,()=>Rc.path.length]);
    Sv.yaw=Sv.facing;Rc.yaw=Rc.facing;Rc.pose='ready';Sv.pose='stand';
    yield* this.newBall(Sv);
  }
  freeKid(z){let best=null,bd=1e9;for(const k of this.kids){if(k.busy)continue;const d=Math.abs(k.hz-z)+(Math.abs(k.hz)<3?6:0);if(d<bd){bd=d;best=k;}}return best;}
  *fetch(b){
    let k=null;
    while(!k){yield* this.wait(.35);
      let bd=1e9;for(const q of this.kids){if(q.busy)continue;const d=hyp(q.x-b.x,q.z-b.z);if(d<bd){bd=d;k=q;}}
      if(!b.rolling&&Math.hypot(b.vx,b.vz)>4)k=null;}
    // ball kids sprint: out to the ball and straight back, so the court is clear before the next serve
    k.busy=true;yield* this.wait(.1);
    yield* this.goW(k,b.x,b.z,6.8);
    k.pose='pick';yield* this.wait(.2);
    const i=this.loose.indexOf(b);if(i>=0)this.loose.splice(i,1);
    k.pose='stand';
    yield* this.goW(k,k.hx,k.hz,6.4);
    k.rest();
  }
  // a one-bounce feed: gravity and the court's restitution, nothing else
  *newBall(Sv){
    let k=null;while(!k){k=this.freeKid(Sv.s*17);if(!k)yield;}
    k.busy=true;k.pose='stand';k.look=Sv;
    yield* this.wait(.35);
    const hx=k.x,hz=k.z,h1=1.05,h2=.95,T2=.42,e=clamp(this.surface.e-.02,.5,.9);
    const vy2=(h2-BALL.R+.5*G*T2*T2)/T2,vy1=vy2/e;
    const T1=(vy1-Math.sqrt(Math.max(.01,vy1*vy1-2*G*(h1-BALL.R))))/G;
    const u=vy1-G*T1,TT=T1+T2,tx=Sv.x,tz=Sv.z;
    const b=new Ball(hx,h1,hz);b.mode='scripted';this.ball=b;k.pose='throw';k.throwT=this.t;
    const t0=this.t;let bounced=false;
    while(this.t<t0+TT){
      const q=this.t-t0,f=q/TT;b.x=lerp(hx,tx,f);b.z=lerp(hz,tz,f);
      if(q<T1)b.y=h1-u*q-.5*G*q*q;else{if(!bounced){bounced=true;this.ev('thud',{x:b.x,z:b.z,v:3});}const p=q-T1;b.y=BALL.R+vy2*p-.5*G*p*p;}
      yield;
    }
    k.rest();
    b.mode='held';b.holder=Sv;
    yield* this.wait(.35);
  }
  serveBox(Sv){const sx=sgn(-this.serveX),zs=-Sv.s;return{x0:Math.min(0,sx*CT.SW),x1:Math.max(0,sx*CT.SW),z0:Math.min(0,zs*CT.SVC),z1:Math.max(0,zs*CT.SVC)};}
  // nobody serves while a ball kid is still on the move
  *kidsSettled(){const e=this.t+8;while(this.t<e&&this.kids.some(k=>k.busy))yield;}
  *servePoint(no){
    yield* this.kidsSettled();
    const sc=this.score,Sv=sc.srv,Rc=sc.rcv,b=this.ball,st=Sv.st,C=this.control;
    const F=-Sv.s;
    this.cue={who:Sv.idx,no,tag:true,side:sgn(-this.serveX),court:this.serveX*Sv.s>0?'deuce':'ad',box:this.serveBox(Sv)};
    this.how=null;this.mood.serveReady();
    Sv.pose='ritual';this.note(`${Sv.short} to serve${no===2?', second serve':''}.`);
    const n=Math.max(1,Math.round(st.bounces+N(.8)));
    for(let i=0;i<n;i++){       // bounce it: the real restitution of this court, then back to the hand
      const hx=Sv.x,hz=Sv.z+F*.42,T=2*Math.sqrt(2*.8/G)*.55;
      b.mode='scripted';Sv.ritual=this.t;Sv.ritualT=T;const t0=this.t;let hit=false;
      while(this.t<t0+T){const q=(this.t-t0)/T;b.x=hx;b.z=hz;b.y=lerp(1.0,BALL.R,1-Math.abs(2*q-1)**1.6);
        if(q>.5&&!hit){hit=true;this.ev('thud',{x:hx,z:hz,v:2.5});}yield;}
    }
    b.y=1.0;Sv.pose='stand';Sv.ritual=0;b.mode='held';
    // the person at the screen picks the serve; the server waits with the ball
    if(C.manual(Sv)&&!(C.target||C.zone)){
      C.serveWait={no,t0:this.t};this.status='Your serve';this.ev('serveWait',{no});
      const t0=this.t;while(C.manual(Sv)&&!(C.target||C.zone)&&this.t<t0+15)yield;
      C.serveWait=null;this.status='';
    }
    yield* this.wait(.3+R()*.25);
    // motion
    const tc=this.t+1.3,tossAt=tc-.62;
    const rx=Sv.x,rz=Sv.z+F*.30;           // the server leans in over the line
    const hgt=Sv.h*1.455+.02;
    const Cp={x:rx+st.hand*(F>0?-1:1)*.14,y:hgt,z:rz+F*.42};
    Sv.mode='walk';Sv.pose='serve';
    Sv.swing={type:'serve',tc,end:.65,hs:st.hand,F,C:Cp};
    b.mode='scripted';
    while(this.t<tossAt){const q=1-(tossAt-this.t)/.7;b.x=lerp(Sv.x,Cp.x,clamp(q,0,1));b.z=lerp(Sv.z+F*.42,Cp.z,clamp(q,0,1));b.y=lerp(1.0,1.72,clamp(q,0,1)**2);yield;}
    b.mode='free';
    const fall=tc-this.t,fit=new Ball(b.x,b.y,b.z);
    let vx=(Cp.x-b.x)/fall,vz=(Cp.z-b.z)/fall,vy=(Cp.y-b.y+.5*G*fall*fall)/fall;
    for(let k=0;k<3;k++){Object.assign(fit,{x:b.x,y:b.y,z:b.z,vx,vy,vz,wx:0,wy:0,wz:0,bc:0,rolling:false});
      const steps=Math.round(fall/DT);for(let i=0;i<steps;i++)this.physics.stepOnce(fit,DT,false);
      vy+=(Cp.y-fit.y)/fall;vx+=(Cp.x-fit.x)/fall;vz+=(Cp.z-fit.z)/fall;}
    b.vx=vx;b.vy=vy;b.vz=vz;b.wx=b.wy=b.wz=0;
    while(this.t<tc-DT/2){this.physics.stepOnce(b,DT,false);const q=(this.t-tossAt)/(tc-tossAt);Sv.z=lerp(Sv.s*(CT.L+.12),rz,sstep(.2,1,q));yield;}
    // contact
    const tgt=this.serveTarget(Sv,no),type=this.serveType(Sv,no),S=SERVES[type];
    const TS=Traits.of(Sv),pressure=!!this.big&&this.big.w!==Sv.idx;
    // side spin is counter-clockwise from above when positive: a right-hander's slice, curving to the server's left
    const rpm=S.rpm(st),side=S.side*st.hand,gyro=(S.gyro||0)*st.hand,v0=S.v(st)*(tgt.mod||1)*(TS.serveSpeed?TS.serveSpeed(no):1);
    const sol=this.solver.solve(b,tgt,{v:v0,rpm,side,gyro,clear:S.clear,maxEl:.5});
    // acc: how tightly this player places the ball. On serve it narrows the direction only, so first-serve
    // percentages stay human; off the ground it narrows direction and depth
    const es=(TS.serveErr?TS.serveErr(no,pressure):1)*Match.SERVE_ERR*S.err*st.err*(1+st.aggr*.2)*(C.is(Sv)&&C.target?.95:1),ac=st.acc??1;
    const v=sol.v*(1+N(.016*es)),el=sol.el+N(.0145*es)-.0045*es,az=sol.az+N(.018*es*ac);
    b.launch(v,el,az,rpm,side,gyro);
    if(C.is(Sv))C.clear();
    if(this.cue)this.cue.tag=false;
    this.kmh=Math.round(v*3.6);this.serveLabel=no===1?'1st':'2nd';this.serveKind=S.name;
    this.ev('hit',{x:b.x,y:b.y,z:b.z,v,kind:'serve',who:Sv.idx,spin:rpm/3000});this.mood.serveStruck();
    if(no===1)Sv.ms.sv1++;Sv.ms.fast=Math.max(Sv.ms.fast,this.kmh);this.ev('tag',{who:Sv.idx,text:`${this.kmh} km/h`});this.lastTac='serve';
    this.hitter=Sv;this.recv=Rc;this.isServe=true;this.serveNo=no;this.rallyLen=1;this.stats.shots++;
    this.live=true;this.tr.compute(b,this.t,this.physics,false);
    Sv.mode='play';Sv.vx=0;Sv.vz=F*2;Sv.gx=Sv.x*.2;Sv.gz=Sv.s*12.3;Sv.rush=R()<st.sv*(no===1?1:.45);
    if(Sv.rush){Sv.gz=Sv.s*5.6;Sv.gx=tgt.x*.25;}
    Sv.home={x:Sv.gx,z:Sv.gz};
    Rc.mode='play';Rc.vx=Rc.vz=0;Rc.gx=Rc.x;Rc.gz=Rc.z;Rc.home={x:0,z:Rc.s*(12.5+Rc.st.deep*.5)};Rc.rush=false;Rc.plan=null;Rc.split=this.t;
    Rc.planAt=this.t+Match.RETURN.react+(Traits.of(Rc).react||0)+R()*Match.RETURN.jitter;
    return yield* this.rally();
  }
  serveTarget(Sv,no){
    const side=sgn(-this.serveX),d=no===1?5.75:5.2,C=this.control;
    if(C.is(Sv)){
      const a=C.target;
      if(a&&a.z*Sv.s<0&&Math.abs(a.z)<=CT.SVC&&a.x*side>0&&Math.abs(a.x)<=CT.SW)return{x:a.x,y:0,z:a.z};
      if(C.zone)return{x:side*ZONES[C.zone],y:0,z:-Sv.s*d,mod:C.zone==='body'?.92:1};
    }
    const lat=ZONES[this.tactics.pick(Sv,'serve'+no+(side>0?'r':'l'),[['t',.42],['wide',.42],['body',.16]])];
    return{x:side*lat,y:0,z:-Sv.s*d,mod:lat===ZONES.body?.92:1};
  }
  serveType(Sv,no){
    const C=this.control;if(C.is(Sv)&&C.serveType)return C.serveType;
    if(no===2)return'kick';
    return!C.is(Sv)&&R()<.18+Sv.st.slice*.15?'slice':'flat';
  }
  *rally(){
    const b=this.ball;
    for(;;){
      for(const P of this.players)if(P.planAt&&this.t>=P.planAt&&P===this.recv){P.planAt=0;this.plan(P);}
      const r=this.recv;
      if(r.plan&&this.t>=r.plan.t-DT/2)this.contact(r);
      const ev=this.physics.step(b,DT,true);
      if(ev&(HIT.TAPE|HIT.MESH)){this.ev('net',{x:b.x,y:b.y,z:b.z,mesh:!!(ev&HIT.MESH),v:Math.abs(b.vz)});
        if(ev&HIT.TAPE)this.stats.cords++;
        if(this.recv){this.tr.compute(b,this.t,this.physics,true);this.recv.plan=null;this.recv.swing=null;this.recv.planAt=this.t+.12;}}
      if(ev&HIT.BOUNCE){this.cue=null;const o=this.judge(b);if(o)return o;}
      if(Math.abs(b.x)>CT.FX-.12||Math.abs(b.z)>CT.FZ-.12)return this.finishBy(b.bc===0?'long':'pass');
      if(b.rolling)return this.finishBy('dead');
      yield;
    }
  }
  plan(P){
    const p=this.planner.makePlan(P),C=this.control;
    if(C.is(P))C.decide=p&&this.live&&!C.auto?{t0:this.t,tc:p.t,kind:p.kind,wing:p.wing}:null;
  }
  won(H){H.ms.win++;this.how={kind:'winner',by:H.idx};this.ev('tag',{who:H.idx,text:'Winner',strong:true});
    const n=this.rallyLen,d=DESC[this.lastTac]||'';this.note(`${H.short} wins it ${d}${d?'. ':''}${n>2?n+' shots.':''}`.trim());}
  lost(H,net){H.ms.ue++;this.how={kind:net?'net':'error',by:H.idx};const t=NAME[this.lastTac]||'shot';this.note(`${H.short} ${net?'nets':'misses'} the ${t}.`);}
  ace(){const H=this.hitter;H.ms.aces++;this.how={kind:'ace',by:H.idx};this.ev('tag',{who:H.idx,text:'Ace',strong:true});this.ev('ace',{who:H.idx,kmh:this.kmh});this.note(`Ace. ${H.short}, ${this.kmh} km/h.`);}
  rec(){this.stats.rallies++;this.stats.rallyShots+=this.rallyLen;}
  finishBy(why){
    const b=this.ball,H=this.hitter,hi=H.idx;
    if(why==='long'){
      this.ev('call',{text:this.isServe?'FAULT':'OUT',x:clamp(b.x,-CT.FX,CT.FX),z:clamp(b.z,-CT.FZ,CT.FZ)});
      if(this.isServe)return{fault:true};
      this.lost(H);this.rec();return{w:1-hi};
    }
    if(b.bc>=1&&sgn(b.lbz)!==H.s){if(this.isServe)this.ace();else this.won(H);this.rec();return{w:hi};}
    this.lost(H);this.rec();return{w:1-hi};
  }
  // electronic line calling: every bounce is measured; the close ones are shown
  judge(b){
    const H=this.hitter,hi=H.idx;
    this.ev('bounce',{x:b.lbx,z:b.lbz,vx:b.lvx,vz:b.lvz,v:Math.abs(b.vy)});
    if(b.bc===1){
      if(sgn(b.lbz)===H.s){
        if(this.isServe)return{fault:true,call:'Net.'};this.rec();this.lost(H,true);return{w:1-hi};
      }
      if(b.net&HIT.TAPE){this.ev('tag',{who:hi,text:'Net cord',strong:true});this.mood.netCord();}
      const m=this.isServe?Court.signedBox(b.lbx,b.lbz,sgn(-this.serveX)):Court.signedIn(b.lbx,b.lbz);
      if(Math.abs(m)<.045)this.mood.closeCall(m);
      if(Math.abs(m)<.045)this.ev('replay',{x:b.lbx,z:b.lbz,m,vx:b.lvx,vz:b.lvz,serve:this.isServe,side:sgn(-this.serveX)});
      if(m<0){
        this.ev('call',{text:this.isServe?'FAULT':'OUT',x:b.lbx,z:b.lbz});
        if(this.isServe)return{fault:true};
        this.lost(H);this.rec();return{w:1-hi};
      }
      if(this.isServe){
        if(b.net){this.say('Let.','ump',1.4);this.ev('call',{text:'LET',x:b.lbx,z:b.lbz});return{replay:true};}
        if(this.serveNo===1)H.ms.sv1in++;
      }
      return null;
    }
    // two bounces: the ball was in and nobody got it
    if(this.isServe)this.ace();else this.won(H);
    this.rec();return{w:hi};
  }
  // the situation a shot is played in, as the players' traits see it
  shotContext(P,p,S){const b=this.ball;return{ret:this.isServe,server:!!this.score&&this.score.srv===P,n:this.rallyLen,wing:p.wing,tac:S.tac,stretch:p.stretch,pace:b?clamp((hyp(b.vx,b.vz)-14)/24,0,1):0,spinIn:b?b.topspin:0,big:this.big};}
  // how wild a planned shot is: the player's steadiness and the tactic's risk, made worse by a stretch, a fast
  // incoming ball, a low ball, a return of serve and swinging harder than the player's power allows
  shotError(P,p,S,v,aimed){
    const st=P.st,lowB=p.y<(this.surface.key==='grass'?.62:.42)?.55:0,T=Traits.of(P),c=this.shotContext(P,p,S);
    return st.err*S.risk*(1+1.25*p.stretch*p.stretch*(T.stretchK??1)+.5*c.pace*(T.paceK??1)+.25*clamp((c.spinIn-3200)/2600,0,1)+lowB+(this.isServe?Match.RETURN.err*(this.serveNo===1?1:.5):0)+(v/(38*st.power))**3*.35*(T.overhitK??1))*(aimed?.9:1)*(T.error?T.error(c):1);
  }
  // about where the person's aimed shot will land: the spread across and along its line (one standard deviation, m)
  // and the line's direction. Along the line it is close to three times wider: depth is harder than direction.
  aimSpread(){
    const H=this.human,C=this.control;if(!H||!H.plan||!H.plan.shot||!C.target)return null;
    const p=H.plan,S=p.shot,d=hyp(C.target.x-p.x,C.target.z-p.z)||1,across=d*.0165*this.shotError(H,p,S,S.v,true)*(H.st.acc??1);
    return{across,along:across*2.9,dx:(C.target.x-p.x)/d,dz:(C.target.z-p.z)/d};
  }
  contact(P){
    const p=P.plan,b=this.ball,st=P.st,C=this.control,human=C.is(P);P.plan=null;
    if(human)C.decide=null;
    const off=hyp(P.x-p.rx,P.z-p.rz),miss=hyp(b.x-p.x,b.y-p.y,b.z-p.z);
    if(off>.62||miss>.6){this.stats.whiff++;return;}
    P.swing.C={x:b.x,y:b.y,z:b.z};
    const S=p.shot,tgt={x:S.t.x,y:0,z:-P.s*S.t.d};let aimed=false;
    if(human&&C.target&&C.target.z*P.s<0){tgt.x=C.target.x;tgt.z=C.target.z;aimed=true;}
    const tq=human&&!C.auto&&C.shot&&C.shotAt!=null?Match.timing(this.t-C.shotAt):null;
    if(human){C.target=null;C.shot=null;C.shotAt=null;}
    const inc=hyp(b.vx,b.vz),pace=clamp((inc-14)/24,0,1),srv=this.isServe;
    // the shot wanted, held to what this swing can physically give this ball
    const T=Traits.of(P),cx=this.shotContext(P,p,S),rpm=S.rpm*(T.spin?T.spin(cx):1);
    const v0=Math.min((srv?S.v*Match.RETURN.pace:S.v)*(1-.24*p.stretch*(T.stretchK??1))*(T.speed?T.speed(cx):1)*(tq?tq.v:1),RacketImpact.maxSpeed(st,P.swing?P.swing.type:p.wing,b.speed,rpm,p.stretch,cx.spinIn));
    const side=S.side||0,sol=this.solver.solve(b,tgt,{v:v0,rpm,side,clear:S.clear,maxEl:S.maxEl});
    const e=this.shotError(P,p,S,sol.v,aimed)*(tq?tq.err:1);
    const ac=st.acc??1;
    const v=sol.v*(1+N(.02*e*lerp(1,ac,.6))),el=sol.el+N(.021*e*ac)-.0085*e*ac,az=sol.az+N(.0165*e*ac);
    b.vx=b.vy=b.vz=0;
    b.launch(v,el,az,rpm,side);
    this.ev('hit',{x:b.x,y:b.y,z:b.z,v,kind:S.tac,who:P.idx,aimed,timing:tq?tq.text:'',spinIn:Math.round(cx.spinIn),spin:rpm/3000,stroke:P.swing?P.swing.type:'fh'});
    const tac=S.tac;this.stats.tac[tac]=(this.stats.tac[tac]||0)+1;this.stats.shots++;this.lastTac=tac;
    if(TAG[tac]&&(human||!['drive','slice','volley','flat'].includes(tac)))this.ev('tag',{who:P.idx,text:TAG[tac]+(tq&&tq.text?' · '+tq.text:''),strong:tq===Match.TIMING.perfect});
    this.rallyLen++;this.hitter=P;this.isServe=false;this.mood.shot(this.rallyLen,p.stretch);
    const O=this.other(P);this.recv=O;O.plan=null;O.split=this.t;O.leaving=false;
    O.planAt=this.t+.15+R()*.06+(T.disguise?T.disguise(cx):0);
    this.tr.compute(b,this.t,this.physics,false);
    // recover: bisect the angle, or follow the approach in
    if(tac==='approach'||tac==='volley'||tac==='dropvolley'||tac==='smash')P.rush=true;
    if(tac==='lob'||tac==='safe'||(tac==='slice'&&p.stretch>.5))P.rush=false;
    const tx=this.tr.hasB?this.tr.fbx:0,sk=this.surface.key;
    P.home=P.rush?{x:tx*.38,z:P.s*5.0}:{x:tx*.27,z:P.s*(12.2+st.deep*.9+(sk==='clay'?.5:sk==='grass'?-.2:0))};
    P.gx=P.home.x;P.gz=P.home.z;
  }

  // ──────── between points ────────
  *sit(swap){
    const a=this.A,b=this.B;
    a.plan=b.plan=null;a.swing=b.swing=null;
    const za=a.z<0?-CHAIR.z:CHAIR.z,zb=b.z<0?-CHAIR.z:CHAIR.z;
    this.go(a,CHAIR.x,za,1.7);this.go(b,CHAIR.x,zb,1.7);
    this.pendingSwap=swap;this.status='Changeover';
    yield* this.allOf([()=>a.path.length,()=>b.path.length]);
    a.pose='sit';b.pose='sit';a.yaw=b.yaw=PI/2;
  }
  *stand(){
    const a=this.A,b=this.B;if(this.pendingSwap){a.s*=-1;b.s*=-1;}
    a.pose=b.pose='stand';this.status='';
    this.go(a,0,a.s*12.5,2.2);this.go(b,0,b.s*12.5,2.2);
    yield* this.allOf([()=>a.path.length,()=>b.path.length]);
  }
  *swapEnds(){
    const a=this.A,b=this.B;a.mode=b.mode='walk';a.plan=b.plan=null;a.swing=b.swing=null;a.s*=-1;b.s*=-1;
    this.go(a,0,a.s*12.5,2.6);this.go(b,0,b.s*12.5,2.6);
    yield* this.allOf([()=>a.path.length,()=>b.path.length]);
  }
  *matchEnd(){
    const sc=this.score,W=sc.p[sc.winner],L=sc.p[1-sc.winner];
    this.live=false;this.stage='over';this.control.decide=null;
    this.mood.matchOver(W);this.wave=this.t+2;
    W.cheer=this.t+2.4;L.sulk=this.t+2;
    this.result={w:W.idx,winner:W,loser:L,line:sc.line(sc.winner),longest:this.longest};
    this.ev('matchOver',this.result);
    yield* this.wait(1.6);
    W.mode=L.mode='walk';W.plan=L.plan=null;W.swing=L.swing=null;
    this.go(W,.3,W.s*.75,1.8);this.go(L,-.3,L.s*.75,1.8);
    yield* this.allOf([()=>W.path.length,()=>L.path.length]);
    W.yaw=W.facing;L.yaw=L.facing;W.pose=L.pose='shake';
    yield* this.wait(1.6);
    W.pose=L.pose='stand';W.cheer=this.t+3;
    this.go(L,CHAIR.x,L.s*CHAIR.z,1.5);
    yield* this.goW(W,0,W.s*4,1.5);
    W.yaw=W.s>0?0:PI;
  }
}
