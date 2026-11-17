// Game — owns the renderer, stadium and match; runs the frame loop
class Game{
  constructor(){
    let R;try{R=new Renderer($('view'));}catch(err){$('nogl').hidden=false;throw err;}
    this.R=R;{const h=new Date().getHours();R.phaseKey=h>=7&&h<17?'day':h>=17&&h<20?'twilight':'night';R.L=LightPhase.snapshot(R.phaseKey);}
    this.stadium=new Stadium(R.root,R.mats);R.addLamps(this.stadium.lamps);
    this.halos=new Halos(this.stadium.halos);R.root.add(this.halos.m);
    this.B=new Parts(R.mats.lit);R.root.add(this.B.group);
    this.net=new NetView(R.root,R.amb);this.fx=new Particles(R.root);this.ballView=new BallView(R.root);$('cerSkip').onclick=()=>this.endCeremony();
    this.cam=new CameraRig(R);this.sound=new SoundSystem();
    this.board=new Scoreboard();this.stats=new StatsPanel();this.labels=new WorldLabels();this.replay=new ReplayInset();this.prompt=new DecisionPrompt();$('prompt').onclick=()=>this.challenge();
    this.quick=Prefs.get('quick',Prefs.touch);
    this.dock=new ControlDock(this);this.touchShot=new TouchShot(this);this.menu=new SettingsMenu(this);this.setup=new SetupScreen(this);this.results=new ResultScreen(this);this.bracket=new BracketScreen(this);this.interview=new InterviewScreen(this);this.tour=null;
    this.title=new TitleScreen(this);this.howto=new HowToPlay(this);this.mainMenu=new MainMenu(this);this.flow=new CareerFlow(this);this.venue=null;this.vs=new VersusScreen(this);this.feTurn=0;
    this.speed=1;this.ts=1;this.paused=false;this.tc=0;this.acc=0;this.last=performance.now();this.lastHud=0;
    this.led={until:0,msgs:null,hot:false};this.crowd={clap:0,up:0};this.look={x:0,z:0};this.perf={a:0,n:0,p:0};this.screenKey='';this.gaits=new WeakMap();this.bodies=new Map();this.alpha=1;
    this.demo();this.title.open();
    this.input=new Input(this);
    $('resume').onclick=()=>this.togglePause();
    addEventListener('resize',()=>this.resize());this.resize();
    window.__PTO=this;
    requestAnimationFrame(t=>this.frame(t));
  }
  // the tournament's other matches, a few milliseconds of them each frame (more when the person asks to hurry);
  // the draw on screen follows them
  runTour(now){
    const g=this.tourRun;if(!g)return;const t=this.tour,v=t.version,end=performance.now()+(this.tourFast?40:4);
    while(performance.now()<end)if(g.next().done){this.tourRun=null;break;}
    if(!$('bracket').hidden&&(t.version!==v||!this.tourRun||now-(this.brAt||0)>500)){this.brAt=now;this.bracket.open();}
  }
  // ──────── the front end ────────
  // menu sounds, once sound is on (the title screen's key or tap turns it on)
  sfx(k){const S=this.sound;if(!S.live)return;if(k==='click')S.sfx.click();else if(k==='chime')S.sfx.chime();else if(k==='slam'){S.sfx.hit(1,0,'serve',0);S.event({type:'crowd',kind:'applause',power:.7},0);}}
  // is a front-end screen up? The HUD hides behind it and the stadium camera turns slowly, a quarter at a time
  get frontEnd(){return this.title.on||this.mainMenu.on||this.setup.on||this.vs.on||this.flow.on||!$('bracket').hidden;}
  exhibition(a,b,fmt,phase,level){this.vs.open(ROSTER[a],ROSTER[b],'EXHIBITION',`${MatchFormat.get(fmt).name} · ${PHASES[phase].name} · ${Difficulty.get(level).name}`,()=>this.play(a,b,fmt,phase,level));}
  // ──────── matches ────────
  // two computer players behind the setup screen, on a loop
  demo(){const a=Math.floor(R()*ROSTER.length);let b=Math.floor(R()*ROSTER.length);if(b===a)b=(a+3)%ROSTER.length;
    this.startMatch({a:ROSTER[a],b:ROSTER[b],human:-1,format:MatchFormat.get('short'),loop:true});this.cam.setMode(CameraRig.STADIUM);}
  play(a,b,fmt,phase,level='pro'){
    this.sound.start();$('title').hidden=true;this.mainMenu.close();
    this.last_={a:ROSTER[a],b:Difficulty.apply(ROSTER[b],level),human:0,format:MatchFormat.get(fmt),walkOn:true};this.setPhase(phase);
    this.startMatch(this.last_);this.setup.close();this.results.close();this.cam.setMode(CameraRig.FOLLOW);this.cam.k=0;this.speed=1;
    this.say(`Players walk out. ${Prefs.touch?'Tap Auto':'Space'} lets your player choose every shot.`);this.rotateHint();
  }
  // on a phone held upright, a reminder that the court is bigger sideways (once per match, gone after a few seconds)
  rotateHint(){const el=$('rot');clearTimeout(this.rotT);el.hidden=!(Prefs.touch&&innerHeight>innerWidth);if(!el.hidden)this.rotT=setTimeout(()=>el.hidden=true,6000);}
  // ──────── tournament ────────
  startTour(a,fmt,phase,level,field){this.sound.start();this.tour=new Tournament(ROSTER[a],MatchFormat.get(fmt),level,field||undefined);this.setPhase(phase);this.setup.close();this.results.close();this.bracket.open();}
  playTour(){const t=this.tour;if(!t||!t.mine)return;
    const round=['QUARTER-FINAL','SEMI-FINAL','FINAL'][t.round],sub=`${t.format.name} · ${PHASES[this.R.phaseKey].name} · ${Difficulty.get(t.level).name}`;
    this.vs.open(t.player(t.me),t.opponent,round,sub,()=>this.startTourMatch());}
  startTourMatch(){const t=this.tour;if(!t||!t.mine)return;this.sound.start();this.tourRun=t.run();this.tourFast=false;this.last_=t.config();this.startMatch(this.last_);this.results.close();this.cam.setMode(CameraRig.FOLLOW);this.cam.k=0;this.speed=1;
    this.say(`${t.name}: ${t.opponent.name}. ${Prefs.touch?'Tap Auto':'Space'} lets your player choose every shot.`);this.rotateHint();}
  // the person's match is finished: record it, play out the others, show the draw
  // (the interview comes first; the draw is settled behind it)
  continueTour(){const t=this.tour,m=this.match;if(!t||!m.result)return;this.results.close();
    // after the interview: the result goes in the draw. Still in: the rest of the round is finished (it was played
    // during the match) and the draw moves on. Out: the rest of the draw is played in the background, live on the draw
    const talk=()=>this.interview.open(m,t,fans=>{t.fans+=fans;t.record(m.result.winner===m.human,m);
      if(t.out){this.tourRun=t.run();this.tourFast=false;}else{this.tourRun=null;t.settle();}this.demo();this.bracket.open();});
    if(t.round===2)this.ceremony(talk);else talk();}
  // the trophy ceremony on court after a final the person played; Enter or the button skips to what comes next
  ceremony(done){
    const m=this.match;m.tasks.length=0;m.loose.length=0;m.ball=null;
    this.cerDone=done;this.cerCam=this.cam.mode;this.cam.setMode(CameraRig.FOLLOW);this.cam.stage={x:0,z:0,zoom:1.5};
    // facing where the camera will settle, not where it happens to be mid-turn
    m.spawn(m.ceremony(this.cam.azTo??this.cam.az));$('cerBar').hidden=false;$('line').textContent='';if(this.tour)this.tour.feted=true;
  }
  endCeremony(){
    if(!this.cerDone)return;const done=this.cerDone;this.cerDone=null;$('cerBar').hidden=true;this.cam.stage=null;this.cam.setMode(this.cerCam??CameraRig.FOLLOW);
    this.match.tasks.length=0;this.sound.voice.stop();done();
  }
  endTour(){this.tour=null;this.tourRun=null;this.openSetup();}
  rematch(){if(this.last_){this.startMatch(this.last_);this.results.close();this.cam.setMode(CameraRig.FOLLOW);}}
  // back to the front: the main menu over a match between two computer players
  // a career match left half-way is not recorded: the event waits on its screen for the match to be played again
  openSetup(){this.results.close();if(this.paused)this.togglePause();this.flow.active=false;this.venue=null;this.demo();this.mainMenu.open();}
  startMatch(cfg){
    for(const b of this.bodies.values()){this.R.root.remove(b.mesh);b.dispose();}this.bodies.clear();
    this.match=new Match(cfg);this.acc=0;this.resultAt=0;this.resultShown=false;this.board.key='';this.screenKey='';
    $('sbEv').textContent=this.venue||'PIXEL TENNIS OPEN';$('line').textContent='';$('elc').hidden=true;this.labels.clear();this.led={until:0,msgs:null,hot:false};this.sound.voice.stop();
  }
  // ──────── commands from the dock, keys and clicks ────────
  shot(k,force=false){const m=this.match;if(m.human){m.setShot(k,force);this.dock.update(m);}}
  serve(k,force=false){const m=this.match;if(m.human){m.setServe(k,force);this.dock.update(m);}}
  zone(k){const m=this.match;if(m.human&&this.dock.serving(m)){m.setZone(k);this.dock.update(m);}}
  // a target on the court (x, z in metres); tick: the click sound, left out while a thumb slides the target along
  aim(x,z,tick=true){const m=this.match;if(!m.human||!m.aimAt(x,z))return false;if(tick&&this.sound.live)this.sound.sfx.click();this.dock.update(m);return true;}
  click(cx,cy){const m=this.match;if(!m.human)return;const p=this.R.pick(cx,cy);
    if(!this.aim(p.x,p.z)&&m.stage==='play')this.say(m.cue&&m.cue.who===m.human.idx?'Aim inside the service box.':'Aim at the far side of the net.');}
  challenge(){const q=this.match.control.challenge;if(q)q.go=true;}
  toggleAuto(){const m=this.match;if(!m.human)return;m.setAuto(!m.control.auto);this.say(m.control.auto?'Auto on: your player picks every shot.':'Auto off: you pick the shot and the spot.');this.dock.update(m);}
  toggleFast(){this.speed=this.speed===3?1:3;this.dock.update(this.match);}
  toggleQuick(){this.quick=!this.quick;Prefs.set('quick',this.quick);this.menu.update();this.say(this.quick?'Quick between points: the walks between points play at double speed.':'Quick between points off.');}
  // between points of the person's match: nothing to decide and no ball in play, so the walks, the ball kids and the
  // changeovers can run at double speed when the person has asked for it
  get between(){const m=this.match,H=m.human,C=m.control;if(!H||m.stage!=='play'||m.live||C.serveWait||C.challenge)return false;return!(m.cue&&m.cue.who===H.idx&&!C.auto);}
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
    const m=this.match,goal=this.paused?0:(m.timeScale<1?m.timeScale:this.speed*(this.quick&&this.speed===1&&this.between?2:1));
    this.ts+=(goal-this.ts)*Math.min(1,dt*12);if(Math.abs(goal-this.ts)<.01)this.ts=goal;
    this.acc+=dt*this.ts;let n=0;while(this.acc>=DT&&n<60){m.tick();this.acc-=DT;n++;if(m.events.length>200)this.drain();}if(n===60)this.acc=0;
    this.alpha=clamp(this.acc/DT,0,1);
    this.watchPerf(now);this.runTour(now);
    {const fe=this.frontEnd;document.body.classList.toggle('fe-on',fe);if(fe&&this.cam.mode===CameraRig.STADIUM){this.feTurn+=dt;if(this.feTurn>7){this.feTurn=0;this.cam.turn(1);}}}
    this.drain();
    this.net.update(dt);this.fx.update(dt);
    this.cam.update(dt,this.focus());
    this.R.light(dt,this.tc,this.cam.ppm);
    this.halos.u.night.value=clamp(this.R.L.night+this.R.L.flood*.4,0,1);this.halos.u.ppm.value=this.cam.ppm;
    this.updateCrowd(dt);this.stadium.led.scroll(dt*(this.paused?0:1));this.updateLed();
    this.B.begin();this.drawPeople(dt*this.ts);this.drawMarkers();this.drawCeremony();this.B.commit();
    this.ballView.update(m,this.tc,this.cam.ppm,this.alpha,this.heldAt);
    this.stadium.court.letter(this.focus().end);this.courtHighlight(dt);this.stadium.court.flush();
    this.R.render();
    this.labels.update(m,this.R);this.replay.update(m.t);this.prompt.update(m);
    if(now-this.lastHud>90){this.lastHud=now;this.board.update(m);this.statRows=this.stats.update(m);this.dock.update(m);this.menu.update();this.updateScreens();}
    if(m.result&&m.human&&!this.resultShown&&m.t>this.resultAt){this.resultShown=true;this.results.open(m,this.stats.update(m));}
  }
  watchPerf(now){const p=this.perf;if(navigator.webdriver)return;p.a+=now-(p.p||now);p.p=now;if(++p.n===150){if(p.a/p.n>38&&this.R.perfStep<2){this.R.perfStep++;this.resize();}p.a=0;p.n=0;}}
  resize(){this.R.resize();this.cam.update(0,this.focus(),true);if(innerWidth>innerHeight)$('rot').hidden=true;}
  drain(){
    // the match that plays behind the menus is scenery: no calls, tags or umpire, on screen or in the speakers
    const m=this.match,S=this.sound,demo=!m.human;
    for(const e of m.events){
      if(demo&&(e.type==='say'||e.type==='call'||e.type==='tag'||e.type==='replay'||e.type==='note'))continue;
      // sounds sit left or right where they happen on screen
      if(S.live){let pan=0;if(e.x!==undefined){const[sx]=this.R.project(e.x,e.y||0,e.z);pan=clamp(sx/innerWidth*2-1,-1,1)*.8;}S.event(e,pan);}
      switch(e.type){
        case'bounce':if(Court.inEnclosure(e.x,e.z))this.fx.dust(e.x,e.z,4,[0x9aa1b3,0x7bb8ea]);break;
        case'hit':if(e.kind==='serve')for(let i=0;i<4;i++)this.fx.spark(e.x,e.y,e.z,N(.8),N(.8),N(.8),.14,0xfdf0a0);
          // a perfectly timed shot: a burst of light at the racket, and a short buzz on a phone that can
          if(e.timing==='Perfect'&&m.human&&e.who===m.human.idx){for(let i=0;i<10;i++)this.fx.spark(e.x,e.y,e.z,N(1.4),N(1.4)+.6,N(1.4),.2,0xf4d44a);try{navigator.vibrate&&navigator.vibrate(18);}catch(_){}}
          break;
        case'net':this.net.hit(e.x,e.mesh?.9:.5);break;
        case'note':$('line').textContent=e.text;break;
        case'tag':this.labels.tag(e,m);break;
        case'call':this.labels.call(e,m);break;
        case'replay':this.replay.show(e,m.t);break;
        case'ace':this.ledFlash(['ACE!',`${e.kmh} KM/H`,'ACE!'],3,true);break;
        case'bigPoint':this.ledFlash([e.label.toUpperCase(),e.label.toUpperCase()],5,true);break;
        case'trophy':{const c=m.cer;this.fx.confetti(300,c.D.x,c.D.z,.45);this.confettiUntil=m.t+4;this.ledFlash(['CHAMPION',e.name.toUpperCase(),this.venue||'PIXEL TENNIS OPEN'],12,true);break;}
        case'ceremonyEnd':this.endCeremony();break;
        case'matchOver':{const H=m.human;this.ledFlash(['GAME SET MATCH',e.winner.short.toUpperCase()],12,true);
          if(!H||e.winner===H)this.fx.confetti(220);this.resultAt=m.t+4.5;break;}
      }
    }
    m.events.length=0;
  }
  updateLed(){const m=this.match,L=this.stadium.led;
    if(this.led.msgs&&this.tc<this.led.until)L.draw(this.led.msgs,this.led.hot);
    else L.draw([`${m.A.short} V ${m.B.short}`,this.venue||'PIXEL TENNIS OPEN','SUMMER OF TENNIS']);}
  updateScreens(){
    const m=this.match,sc=m.score,big=m.stage==='play'&&m.big&&sc&&!sc.over?m.big:null;
    const cer=m.stage==='ceremony'&&m.cer,crowned=cer&&cer.trophy==='W';
    const key=sc?[sc.pts,sc.games,sc.sets,sc.server,sc.over,m.kmh,big&&big.label,m.stage,crowned].join():'pre';if(key===this.screenKey)return;this.screenKey=key;
    const s={title:!sc?'PIXEL TENNIS OPEN':crowned?'CHAMPION':cer?'CEREMONY':sc.over?'FINAL':sc.mode==='tb'?'TIEBREAK':`SET ${sc.setNo}`,hot:!!big,
      foot:cer?(crowned?m.result.winner.short.toUpperCase():'TROPHY'):big?big.label:sc&&sc.over?`${m.players[sc.winner].short} WINS`:m.kmh?`SERVE ${m.kmh} KM/H`:'PIXEL TENNIS OPEN',
      rows:m.players.map((P,i)=>({name:P.short,cc:P.st.cc,col:P.st.look.shirt,serve:sc&&sc.server===i&&!sc.over,
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
    const m=this.match,t=m.t-DT*(1-this.alpha),look=this.lookAtBall(),B=this.B;this.heldAt=null;this.props=[];
    const c=m.stage==='ceremony'?m.cer:null,holdOf=a=>{if(!c)return null;
      if(a===m.result.winner&&c.trophy==='W')return{kind:'lift',q:c.lift,what:'trophy'};if(a===m.result.loser&&c.plate==='L')return{kind:'plate',what:'plate'};
      for(const w of['trophy','plate'])if(c[w]==='kid'&&c.carry[w]===a)return{kind:'carry',what:w};return null;};
    const draw=(a,c,lk,extra)=>{const v=this.view(a),sit=a.pose==='sit',g=sit?null:this.gaitOf(a);
      // the split step: a hop as the opponent strikes the ball
      if(g&&a.split&&a.split!==g.splitSeen){g.splitSeen=a.split;if(!a.swing)g.hop();}
      const set=this.stanceOf(a,t);
      if(g)g.update(v,dtSim,a.h/1.8,a.pose==='ready'?.26:a.mode==='play'||a.swing?.2:.12,a.mode==='play'&&!set?a.patter||0:0,set);
      return FigureRig.draw(B,v,Object.assign({t,c,look:lk,gait:g,body:this.bodyOf(a,c)},extra));};
    for(const P of m.players){P._fit=P._fit||Outfits.player(P);const hold=!!m.ball&&m.ball.mode==='held'&&m.ball.holder===P;
      const hold2=holdOf(P),hands=draw(P,P._fit,(m.live||P.pose==='ritual')&&P.path.length===0?look:null,{drink:sit(P)&&Math.sin(t*.5+P.idx)>.8,holding:hold,hold:hold2});
      if(hold2&&hands)this.props.push({what:hold2.what,hands,yaw:P.yaw});
      // a ball waiting to be served sits in the server's free hand, not inside the body
      if(hold&&hands)this.heldAt=[hands[1][0],hands[1][1]+.045,hands[1][2]];}
    m.kids.forEach((k,i)=>{const h=holdOf(k),hands=draw(k,Outfits.KID[i%2],k.look==='ball'?look:(k.look&&k.look!=='ball'?k.look:null),{hold:h});if(h&&hands)this.props.push({what:h.what,hands,yaw:k.yaw});});
    draw(m.ump,Outfits.UMP,m.ump.y>1?look:null);
    function sit(P){return P.pose==='sit';}
  }
  // the ceremony's stage and table, and whatever prize someone is holding: between their hands
  drawCeremony(){
    const m=this.match,c=m.stage==='ceremony'?m.cer:null;if(!c)return;Prizes.stage(this.B,c);
    for(const p of this.props){const[a,b]=p.hands,x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,z=(a[2]+b[2])/2,fx=Math.sin(p.yaw),fz=Math.cos(p.yaw);
      if(p.what==='trophy')Prizes.trophy(this.B,x+fx*.02,y+.02,z+fz*.02,p.yaw,1.3);else Prizes.plate(this.B,x+fx*.03,y,z+fz*.03,fx,fz);}
    // the camera eases in on the stage, closer still as the trophy goes up
    if(m.t<(this.confettiUntil||0)&&R()<.05)this.fx.confetti(40,c.D.x,c.D.z,.4);
    const D=c.D;this.cam.stage={x:D.x-c.rx*.5,z:D.z-c.rz*.5,zoom:lerp(2.3,3.1,clamp(c.lift,0,1))};
  }
  drawMarkers(){
    const m=this.match,B=this.B,t=this.tc,C=m.control;
    // the server: a dashed ring lying flat on the court around the feet
    if(m.cue&&m.cue.tag){const P=m.players[m.cue.who],r=.6+Math.sin(t*6)*.03,c=m.cue.no===2?0xf0664a:C.is(P)?0x7bb8ea:0xf4d44a,n=18;
      for(let i=0;i<n;i+=2){const q=(i+.5)/n*TAU;B.box(P.x+Math.cos(q)*r,.035,P.z+Math.sin(q)*r,.17,.015,.06,-Math.atan2(Math.cos(q),-Math.sin(q)),c);}}
    // where the person is sending the ball: a pulsing cross on the spot, inside a dashed oval that most such shots
    // land in (two standard deviations — smaller for an accurate player, larger on the stretch). Both stay until
    // the ball has landed, so the shot can be judged against them.
    const T=C.target||C.preview;
    if(T){const sp=C.target?m.aimSpread():null;this.mark={x:T.x,z:T.z,hold:1.6,sp:sp||(this.mark&&this.mark.sp)||null};}
    else if(this.mark){const b=m.ball;if(!m.live||(b&&b.bc>0&&m.hitter===m.human))this.mark.hold=Math.min(this.mark.hold,.25);this.mark.hold-=1/60;if(this.mark.hold<=0)this.mark=null;}
    if(this.mark){const a=this.mark,p=.42+(T?Math.sin(t*8)*.09:0);
      // a yellow cross with a dark edge so it reads against the blue court
      for(const[x,z]of[[p,0],[-p,0],[0,p],[0,-p]]){B.box(a.x+x,.05,a.z+z,x?.5:.24,.03,z?.5:.24,0,0x1c1f2e);B.box(a.x+x,.07,a.z+z,x?.4:.14,.03,z?.4:.14,0,0xf4d44a);}
      B.box(a.x,.07,a.z,.14,.03,.14,0,0xf4f3ec);
      if(a.sp){const{across,along,dx,dz}=a.sp,A=along*2,W=across*2,n=clamp(Math.round((A+W)*4)*2,16,48);
        for(let i=0;i<n;i+=2){const q=i/n*TAU,u=Math.cos(q)*A,w=Math.sin(q)*W,tu=-Math.sin(q)*A,tw=Math.cos(q)*W;
          B.box(a.x+dx*u-dz*w,.05,a.z+dz*u+dx*w,.2,.03,.11,-Math.atan2(dz*tu+dx*tw,dx*tu-dz*tw),0xf4f3ec);}}}
    // over the person's own player, a small marker while the camera is wide
    const H=m.human;if(H&&this.cam.mode===CameraRig.STADIUM){const y=H.h+.55+Math.sin(t*4)*.05;B.box(H.x,y,H.z,.22,.1,.22,PI/4,0x7bb8ea);}
  }
  // where a stroke puts the feet (see Gait.update): a step in with the front foot, or for an open-stance forehand the
  // racket-side foot out to the side; a one-handed backhand steps further across
  stanceOf(a,t){
    const sw=a.swing;if(!sw||a.mode!=='play'||!a.st)return null;const ty=sw.type;if(ty==='serve'||ty==='smash')return null;
    const tau=t-sw.tc;if(tau<-.5||tau>.5)return null;
    const hs=sw.hs,fr=hs>0?0:1,set=[[0,0],[0,0]],F=a.st.form||{};
    if(ty==='volley')set[fr]=[.24,hs*.08];
    else if(ty==='fh'&&F.stance==='open'){set[fr^1]=[-.06,hs*.14];set[fr]=[.06,0];}
    else{const one=!!a.st.ohb&&ty!=='fh';set[fr]=[one?.34:.3,hs*(one?.16:.1)];set[fr^1]=[-.06,0];}
    return set;
  }
  courtHighlight(dt){
    const m=this.match,C=m.control,H=m.human,S=this.stadium;let a=0,box=null,col=[1,.93,.45];
    if(m.cue){box=m.cue.box;a=.6;if(H&&m.cue.who===H.idx&&!C.auto){col=[.48,.72,.92];a=.75;}}
    else if(H&&C.decide&&!C.auto&&!C.target){const s=-H.s;box={x0:-CT.SW,x1:CT.SW,z0:s<0?-CT.L:0,z1:s<0?0:CT.L};a=.5;col=[.48,.72,.92];}
    S.boxA.value+=(a-S.boxA.value)*Math.min(1,dt*9);if(box)S.boxU.value.set(box.x0,box.x1,box.z0,box.z1);S.boxC.value.setRGB(...col);
  }
}
