// CareerFlow — the career mode's screens and matches, from the main menu and back: making a player, the hub, an
// event, its matches (played on court, or simulated by Elo), interviews after the big ones, the trophy ceremony
class CareerFlow{
  constructor(game){this.g=game;this.c=null;this.active=false;this.waiting=null;
    this.create=new CareerCreate(this);this.hub=new CareerHub(this);this.screen=new CareerEventScreen(this);}
  get on(){return this.create.on||this.hub.on||this.screen.on;}
  // from the main menu: the saved career, or a new one
  open(){this.c=this.c||Career.load();if(this.c)this.hub.open('week');else this.create.open();}
  start(me){this.c=Career.create(me);this.c.save();this.hub.open('week');}
  leave(){this.g.sfx('click');this.hub.close();this.screen.close();this.g.mainMenu.open();}
  erase(){Career.erase();this.c=null;this.hub.close();this.g.sfx('click');this.create.open();}
  rest(){this.c.rest();this.c.save();this.g.sfx('click');this.hub.open('week');}
  enter(ev){if(!this.c.enter(ev))return;this.c.save();this.g.sfx('chime');this.hub.close();this.showEvent();}
  showEvent(){this.hub.close();this.screen.open();}
  // the event screen's main button: play the next match, or once the event is over, back to the hub
  primary(){const E=this.c.event;if(!E)return;if(this.waiting){this.resume();return;}if(E.d.done||E.d.out){this.c.finishEvent();this.c.save();this.screen.close();this.g.sfx('click');this.hub.open('week');return;}this.play();}
  play(){
    const c=this.c,E=c.event,g=this.g,me=c.profile(),opp=c.profileOf(E.opponent);Portrait.cache.delete(900);
    const sub=`${E.ev.name} · ${MatchFormat.get(c.s.fmt).name} · ranked ${E.d.ranks[E.opponent]}`;
    this.screen.close();g.sfx('chime');
    g.vs.open(me,opp,CAREER_DATA.ROUND_NAMES[E.roundName].toUpperCase(),sub,()=>this.startMatch(me,opp));
  }
  startMatch(me,opp){
    const c=this.c,E=c.event,g=this.g;g.sound.start();this.active=true;const v=Venue.event(E.ev.name,E.ev.surface||'hard');if(v.phase)g.setPhase(v.phase);
    g.last_={a:me,b:opp,human:0,format:MatchFormat.get(c.s.fmt),walkOn:true,final:E.lastRound,venue:v};
    g.startMatch(g.last_);g.results.close();g.cam.setMode(CameraRig.FOLLOW);g.cam.k=0;g.speed=1;
    g.say(`${E.ev.name}, ${CAREER_DATA.ROUND_NAMES[E.roundName].toLowerCase()}: ${opp.name}. ${Prefs.touch?'Tap Auto':'Space'} lets your player choose every shot.`);g.rotateHint();
  }
  // out of a match half-way: it waits, as it stood, until the person takes it up again from the event
  suspend(){const g=this.g;if(!this.active)return;this.waiting={match:g.match,last:g.last_,venue:g.venue};this.active=false;g.demo();this.hub.open('week');}
  resume(){const w=this.waiting;if(!w)return;this.waiting=null;this.screen.close();this.hub.close();this.active=true;this.g.sound.start();this.g.resumeMatch(w);
    this.g.say('Back on court. The match goes on where it stood.');}
  simulate(){
    const c=this.c,E=c.event;if(!E||E.d.done||E.d.out)return;const p=EloModel.win(c.strength-E.elo(E.opponent),E.tier.sets);
    const won=R()<p;c.matchDone(won,'sim');c.save();this.g.sfx(won?'chime':'click');this.screen.open();
  }
  // the person's match is over and its result card closed: an interview after the matches that matter, the trophy
  // ceremony after a final won, then back to the event
  afterMatch(){
    const g=this.g,m=g.match,c=this.c,E=c.event;if(!m.result||!E)return;g.results.close();
    const won=m.result.winner===m.human,opp=E.opponent,big=E.lastRound||E.roundName==='SF'||(won&&opp[0]==='s')||['gs','m1000'].includes(E.ev.tier)&&E.d.round>=E.names.length-3;
    const done=()=>{this.active=false;c.record(m.human.ms,m.players[0].ms.pts+m.players[1].ms.pts,won);c.matchDone(won,m.result.line);c.save();g.demo();this.screen.open();};
    const t={round:E.lastRound?2:E.roundName==='SF'?1:0,label:CAREER_DATA.ROUND_NAMES[E.roundName].toLowerCase()};
    const talk=()=>big?g.interview.open(m,t,fans=>{c.s.fans+=fans;done();}):done();
    if(won&&E.lastRound)g.ceremony(talk);else talk();
  }
}
