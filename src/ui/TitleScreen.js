// TitleScreen — the first thing on screen: the logo over the stadium, waiting for a key or a tap
// The tap that leaves it is also what lets the browser start sound (and speech, on iPad).
class TitleScreen{
  constructor(game){
    this.g=game;$('title').onclick=()=>this.start();
    $('tPress').textContent=matchMedia('(pointer:coarse)').matches?'TAP TO START':'PRESS ENTER';
  }
  open(){$('title').hidden=false;}
  get on(){return!$('title').hidden;}
  start(){if(!this.on)return;this.g.sound.start();this.g.sfx('chime');$('title').hidden=true;this.g.mainMenu.open();}
}
