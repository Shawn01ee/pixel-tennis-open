// SoundSystem — turns match events into sound: the ball and strings, the crowd and the voices (the players' feet are
// silent, as the game's maker asked)
// Starts on the first click (browsers only allow sound after a gesture); M mutes and unmutes.
class SoundSystem{
  constructor(){this.A=new AudioEngine();this.sfx=new TennisSfx(this.A);this.crowd=new CrowdAudio(this.A);this.voice=new Announcer();this.on=false;}
  get live(){return this.on&&this.A.ready;}
  start(){this.voice.prime();if(this.on)return;this.A.start();this.crowd.init();this.on=true;this.voice.on=true;this.A.setMuted(false);}
  toggle(){this.voice.prime();if(!this.A.ready){this.start();return this.on;}this.on=!this.on;this.A.setMuted(!this.on);this.A.resume();this.voice.on=this.on;if(!this.on)this.voice.stop();return this.on;}
  // pan: −1 (left of screen) .. 1 (right)
  event(e,pan){
    if(!this.live)return;const S=this.sfx,C=this.crowd;
    switch(e.type){
      case'hit':S.hit(clamp((e.v-10)/42,0,1),e.spin||0,e.kind==='serve'?'serve':e.stroke||e.kind,pan);break;
      case'bounce':S.bounce(e.v,pan,1,e.surf);break;
      // a loose ball's bounces after the point, a ball bounced before a serve or fed by a ball kid: quieter than a rally's,
      // and the last little hops silent, so a ball coming to rest does not rattle (design)
      case'thud':if(e.v>=1)S.bounce(e.v,pan,.3);break;
      case'net':S.net(e.mesh,e.v,pan);break;
      case'serveWait':S.chime();break;
      case'crowd':if(C[e.kind])C[e.kind](e.power);break;
      case'say':if(e.who==='ump')this.voice.say(e.text);break;
      case'call':{const c=CALLS[e.text];if(c)this.voice.say(c.say,'line');break;}
    }
  }
  update(dt,mood){if(this.live)this.crowd.update(dt,mood);}
}
