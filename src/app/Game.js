// Game — owns the renderer, stadium and match; runs the frame loop
class Game{
  constructor(){
    let R;try{R=new Renderer($('view'));}catch(err){$('nogl').hidden=false;throw err;}
    this.R=R;{const h=new Date().getHours();R.phaseKey=h>=7&&h<17?'day':h>=17&&h<20?'twilight':'night';R.L=LightPhase.snapshot(R.phaseKey);}
    this.stadium=new Stadium(R.root,R.mats);R.addLamps(this.stadium.lamps);
    this.halos=new Halos(this.stadium.halos);R.root.add(this.halos.m);
    this.B=new Parts(R.mats.lit);R.root.add(this.B.group);
    this.net=new NetView(R.root,R.amb);this.fx=new Particles(R.root);this.ballView=new BallView(R.root);
    this.cam=new CameraRig(R);this.sound=new SoundSystem();
    this.board=new Scoreboard();this.stats=new StatsPanel();this.labels=new WorldLabels();this.replay=new ReplayInset();this.prompt=new DecisionPrompt();
    this.dock=new ControlDock(this);this.menu=new SettingsMenu(this);this.setup=new SetupScreen(this);this.results=new ResultScreen(this);
    this.speed=1;this.ts=1;this.paused=false;this.tc=0;this.acc=0;this.last=performance.now();this.lastHud=0;
    this.led={until:0,msgs:null,hot:false};this.crowd={clap:0,up:0};this.look={x:0,z:0};this.perf={a:0,n:0,p:0};this.screenKey='';this.gaits=new WeakMap();this.bodies=new Map();this.alpha=1;
    this.demo();
    this.input=new Input(this);
    $('resume').onclick=()=>this.togglePause();
    addEventListener('resize',()=>this.resize());this.resize();
    window.__PTO=this;
    requestAnimationFrame(t=>this.frame(t));
  }
  // ──────── matches ────────
  // two computer players behind the setup screen, on a loop
  demo(){const a=Math.floor(R()*ROSTER.length);let b=Math.floor(R()*ROSTER.length);if(b===a)b=(a+3)%ROSTER.length;
    this.startMatch({a:ROSTER[a],b:ROSTER[b],human:-1,format:MatchFormat.get('short'),loop:true});this.cam.setMode(CameraRig.STADIUM);}
  play(a,b,fmt,phase){
    this.sound.start();
    this.last_={a:ROSTER[a],b:ROSTER[b],human:0,format:MatchFormat.get(fmt),walkOn:true};this.setPhase(phase);
    this.startMatch(this.last_);this.setup.close();this.results.close();this.cam.setMode(CameraRig.FOLLOW);this.cam.k=0;this.speed=1;
    this.say('Players walk out. Space toggles Auto.');
  }
  rematch(){if(this.last_){this.startMatch(this.last_);this.results.close();this.cam.setMode(CameraRig.FOLLOW);}}
  openSetup(){this.results.close();if(this.paused)this.togglePause();this.demo();this.setup.open();}
  startMatch(cfg){
    for(const b of this.bodies.values()){this.R.root.remove(b.mesh);b.dispose();}this.bodies.clear();
    this.match=new Match(cfg);this.acc=0;this.resultAt=0;this.resultShown=false;this.board.key='';this.screenKey='';
    $('line').textContent='';$('elc').hidden=true;
  }
  // ──────── commands from the dock, keys and clicks ────────
  shot(k){const m=this.match;if(m.human){m.setShot(k);this.dock.update(m);}}
  serve(k){const m=this.match;if(m.human){m.setServe(k);this.dock.update(m);}}
  zone(k){const m=this.match;if(m.human&&this.dock.serving(m)){m.setZone(k);this.dock.update(m);}}
  click(cx,cy){const m=this.match;if(!m.human)return;const p=this.R.pick(cx,cy);
    if(m.aimAt(p.x,p.z)){if(this.sound.live)this.sound.sfx.click();this.dock.update(m);}
    else if(m.stage==='play')this.say(m.cue&&m.cue.who===m.human.idx?'Aim inside the service box.':'Aim at the far side of the net.');}
  toggleAuto(){const m=this.match;if(!m.human)return;m.setAuto(!m.control.auto);this.say(m.control.auto?'Auto on: your player picks every shot.':'Auto off: you pick the shot and the spot.');this.dock.update(m);}
  toggleFast(){this.speed=this.speed===3?1:3;this.dock.update(this.match);}
  togglePause(){this.paused=!this.paused;$('pause').hidden=!this.paused;}
  toggleSound(){this.sound.toggle();this.menu.update();this.say(this.sound.on?'Sound on.':'Sound off.');}
  setCam(i){this.cam.setMode(i);this.menu.update();}
  setPhase(k,snap=false){this.R.phaseKey=k;if(snap)this.R.L=LightPhase.snapshot(k);this.menu.update();}
  say(t){$('line').textContent=t;}
  ledFlash(msgs,secs,hot=false){this.led={msgs,until:this.tc+secs,hot};}
  viewEnd(){const m=this.match;return(m.human||m.A).s;}
  // what the camera frames: the person's player, the ball (or whoever holds it), where it will land, the opponent
  focus(){const m=this.match,H=m.human||m.A,O=m.other(H),b=m.ball;
    return{end:H.s,me:{x:H.x,z:H.z},opp:{x:O.x,z:O.z},ball:b&&b.mode!=='held'?{x:b.x,y:b.y,z:b.z}:null,bounce:m.live&&m.tr.hasB&&m.recv===H?{x:m.tr.fbx,z:m.tr.fbz}:null};}
  // a figure drawn between the last two ticks, so motion stays smooth in slow motion and on any refresh rate
  view(a){const al=this.alpha,v=Object.create(a);v.x=lerp(a.ox,a.x,al);v.z=lerp(a.oz,a.z,al);v.y=lerp(a.oy,a.y,al);v.yaw=lerpAngle(a.oyaw,a.yaw,al);return v;}
  // one continuous body mesh per person, dressed in their outfit
  bodyOf(a,c){let b=this.bodies.get(a);if(!b){b=new BodyMesh(c,this.R.mats.lit);this.R.root.add(b.mesh);this.bodies.set(a,b);}return b;}
  gaitOf(a){let g=this.gaits.get(a);if(!g){g=new Gait();this.gaits.set(a,g);}return g;}

  // ──────── the loop ────────
  frame(now){
    requestAnimationFrame(t=>this.frame(t));
    const dt=clamp((now-this.last)/1000,0,.05);this.last=now;this.tc+=dt;
    const m=this.match,goal=this.paused?0:(m.timeScale<1?m.timeScale:this.speed);
    this.ts+=(goal-this.ts)*Math.min(1,dt*12);if(Math.abs(goal-this.ts)<.01)this.ts=goal;
    this.acc+=dt*this.ts;let n=0;while(this.acc>=DT&&n<60){m.tick();this.acc-=DT;n++;if(m.events.length>200)this.drain();}if(n===60)this.acc=0;
    this.alpha=clamp(this.acc/DT,0,1);
    this.watchPerf(now);
    this.drain();
    this.net.update(dt);this.fx.update(dt);
    this.cam.update(dt,this.focus());
    this.R.light(dt,this.tc,this.cam.ppm);
    this.halos.u.night.value=clamp(this.R.L.night+this.R.L.flood*.4,0,1);this.halos.u.ppm.value=this.cam.ppm;
    this.updateCrowd(dt);this.stadium.led.scroll(dt*(this.paused?0:1));this.updateLed();
    this.B.begin();this.drawPeople(dt*this.ts);this.drawMarkers();this.B.commit();
    this.ballView.update(m,this.tc,this.cam.ppm,this.alpha);
    this.stadium.court.letter(this.focus().end);this.courtHighlight(dt);this.stadium.court.flush();
    this.R.render();
    this.labels.update(m,this.R);this.replay.update(m.t);this.prompt.update(m);
    if(now-this.lastHud>90){this.lastHud=now;this.board.update(m);this.statRows=this.stats.update(m);this.dock.update(m);this.menu.update();this.updateScreens();}
    if(m.result&&m.human&&!this.resultShown&&m.t>this.resultAt){this.resultShown=true;this.results.open(m,this.stats.update(m));}
  }
  watchPerf(now){const p=this.perf;if(navigator.webdriver)return;p.a+=now-(p.p||now);p.p=now;if(++p.n===150){if(p.a/p.n>38&&this.R.perfStep<2){this.R.perfStep++;this.resize();}p.a=0;p.n=0;}}
  resize(){this.R.resize();this.cam.update(0,this.focus(),true);}
  drain(){
    const m=this.match,S=this.sound;
    for(const e of m.events){
      // sounds sit left or right where they happen on screen
      if(S.live){let pan=0;if(e.x!==undefined){const[sx]=this.R.project(e.x,e.y||0,e.z);pan=clamp(sx/innerWidth*2-1,-1,1)*.8;}S.event(e,pan);}
      switch(e.type){
        case'bounce':if(Court.inEnclosure(e.x,e.z))this.fx.dust(e.x,e.z,4,[0x9aa1b3,0x7bb8ea]);break;
        case'hit':if(e.kind==='serve')for(let i=0;i<4;i++)this.fx.spark(e.x,e.y,e.z,N(.8),N(.8),N(.8),.14,0xfdf0a0);break;
        case'net':this.net.hit(e.x,e.mesh?.9:.5);break;
        case'note':$('line').textContent=e.text;break;
        case'tag':this.labels.tag(e,m);break;
        case'call':this.labels.call(e,m);break;
        case'replay':this.replay.show(e,m.t);break;
        case'ace':this.ledFlash(['ACE!',`${e.kmh} KM/H`,'ACE!'],3,true);break;
        case'bigPoint':this.ledFlash([e.label.toUpperCase(),e.label.toUpperCase()],5,true);break;
        case'matchOver':{const H=m.human;this.ledFlash(['GAME SET MATCH',e.winner.short.toUpperCase()],12,true);
          if(!H||e.winner===H)this.fx.confetti(220);this.resultAt=m.t+4.5;break;}
      }
    }
    m.events.length=0;
  }
  updateLed(){const m=this.match,L=this.stadium.led;
    if(this.led.msgs&&this.tc<this.led.until)L.draw(this.led.msgs,this.led.hot);
    else L.draw([`${m.A.short} V ${m.B.short}`,'PIXEL TENNIS OPEN','SUMMER OF TENNIS']);}
  updateScreens(){
    const m=this.match,sc=m.score,big=m.stage==='play'&&m.big&&sc&&!sc.over?m.big:null;
    const key=sc?[sc.pts,sc.games,sc.sets,sc.server,sc.over,m.kmh,big&&big.label].join():'pre';if(key===this.screenKey)return;this.screenKey=key;
    const s={title:!sc?'CENTRE COURT':sc.over?'FINAL':sc.mode==='tb'?'TIEBREAK':`SET ${sc.setNo}`,hot:!!big,
      foot:big?big.label:sc&&sc.over?`${m.result.winner.short} WINS`:m.kmh?`SERVE ${m.kmh} KM/H`:'PIXEL TENNIS OPEN',
      rows:m.players.map((P,i)=>({name:P.short,col:P.st.look.shirt,serve:sc&&sc.server===i&&!sc.over,
        sets:sc?[...sc.done.map(d=>d.g[i]),...(sc.over?[]:[sc.games[i]])]:[],pt:sc?(sc.over?(sc.winner===i?'W':''):sc.label(i)):''}))};
    for(const scr of this.stadium.screens)scr.draw(s);
  }
  updateCrowd(dt){
    const m=this.match,U=CrowdMotion.U,c=this.crowd;U.uT.value=this.tc;
    // the stands move as the crowd's mood says: clapping, standing, arms up in a roar
    const md=m.mood;U.uClap.value=md.clap;U.uUp.value=md.stand;U.uArms.value=md.arms;
    this.sound.update(dt*this.ts,md);
    const w=m.t-m.wave;U.uWaveK.value=w>0&&w<9?sstep(0,.6,w)*(1-sstep(8,9,w)):0;U.uWaveA.value=-PI/2+w*1.25;
  }
  lookAtBall(){const b=this.match.ball;if(b){this.look.x=b.x;this.look.z=b.z;}return this.look;}
  drawPeople(dtSim){
    const m=this.match,t=m.t-DT*(1-this.alpha),look=this.lookAtBall(),B=this.B;
    const draw=(a,c,lk,extra)=>{const v=this.view(a),sit=a.pose==='sit',g=sit?null:this.gaitOf(a);
      // the split step: a hop as the opponent strikes the ball
      if(g&&a.split&&a.split!==g.splitSeen){g.splitSeen=a.split;if(!a.swing)g.hop();}
      if(g)g.update(v,dtSim,a.h/1.8,a.pose==='ready'?.26:a.mode==='play'||a.swing?.2:.12);
      FigureRig.draw(B,v,Object.assign({t,c,look:lk,gait:g,body:this.bodyOf(a,c)},extra));};
    for(const P of m.players){P._fit=P._fit||Outfits.player(P);draw(P,P._fit,(m.live||P.pose==='ritual')&&P.path.length===0?look:null,{drink:sit(P)&&Math.sin(t*.5+P.idx)>.8});}
    m.kids.forEach((k,i)=>draw(k,Outfits.KID[i%2],k.look==='ball'?look:(k.look&&k.look!=='ball'?k.look:null)));
    draw(m.ump,Outfits.UMP,m.ump.y>1?look:null);
    function sit(P){return P.pose==='sit';}
  }
  drawMarkers(){
    const m=this.match,B=this.B,t=this.tc,C=m.control;
    if(m.cue&&m.cue.tag){const P=m.players[m.cue.who],r=.72+Math.sin(t*7)*.05,c=m.cue.no===2?0xf0664a:C.is(P)?0x7bb8ea:0xf4d44a;
      for(const[a,b]of[[1,1],[1,-1],[-1,1],[-1,-1]]){B.box(P.x+a*r-a*.13,.06,P.z+b*r,.3,.04,.1,0,c);B.box(P.x+a*r,.06,P.z+b*r-b*.13,.1,.04,.3,0,c);}}
    if(C.target){const a=C.target,p=.3+Math.sin(t*8)*.07;for(const[x,z]of[[p,0],[-p,0],[0,p],[0,-p]])B.box(a.x+x,.06,a.z+z,x?.26:.1,.03,z?.26:.1,0,0x7bb8ea);B.box(a.x,.06,a.z,.1,.03,.1,0,0xf4f3ec);}
    // over the person's own player, a small marker while the camera is wide
    const H=m.human;if(H&&this.cam.mode===CameraRig.STADIUM){const y=H.h+.55+Math.sin(t*4)*.05;B.box(H.x,y,H.z,.22,.1,.22,PI/4,0x7bb8ea);}
  }
  courtHighlight(dt){
    const m=this.match,C=m.control,H=m.human,S=this.stadium;let a=0,box=null,col=[1,.93,.45];
    if(m.cue){box=m.cue.box;a=.6;if(H&&m.cue.who===H.idx&&!C.auto){col=[.48,.72,.92];a=.75;}}
    else if(H&&C.decide&&!C.auto&&!C.target){const s=-H.s;box={x0:-CT.SW,x1:CT.SW,z0:s<0?-CT.L:0,z1:s<0?0:CT.L};a=.5;col=[.48,.72,.92];}
    S.boxA.value+=(a-S.boxA.value)*Math.min(1,dt*9);if(box)S.boxU.value.set(box.x0,box.x1,box.z0,box.z1);S.boxC.value.setRGB(...col);
  }
}
