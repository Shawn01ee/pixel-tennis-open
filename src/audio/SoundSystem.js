// SoundSystem — turns match events into sound: the ball and strings, shoes, the crowd and the voices
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
      case'bounce':S.bounce(e.v,pan);break;
      case'thud':S.bounce(e.v,pan,.5);break;
      case'net':S.net(e.mesh,e.v,pan);break;
      case'squeak':S.squeak(e.a,pan);break;
      case'slide':S.slide(pan);break;
      case'serveWait':S.chime();break;
      case'crowd':if(C[e.kind])C[e.kind](e.power);break;
      case'say':if(e.who==='ump')this.voice.say(e.text);break;
      case'call':this.voice.say(e.text.charAt(0)+e.text.slice(1).toLowerCase()+'!','line');break;
    }
  }
  update(dt,mood){if(this.live)this.crowd.update(dt,mood);}
}
