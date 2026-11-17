// HumanControl — what the person at the screen has chosen: shot, target, serve, auto
// what the person at the screen wants from their player. Movement and timing stay automatic.
// preview: a serve target being slid into the box on a touch screen, drawn but not yet served to
// holding: the shot or serve button held down on a touch screen, played when it is let go
const SLOWMO=.25;
class HumanControl{
  constructor(idx=-1){this.idx=idx;this.auto=false;this.shot=null;this.shotAt=null;this.target=null;this.preview=null;this.holding=null;this.zone=null;this.serveType=null;this.decide=null;this.serveWait=null;this.challenge=null;}
  is(P){return!!P&&P.idx===this.idx;}
  manual(P){return this.is(P)&&!this.auto;}
  clear(){this.shot=null;this.target=null;this.preview=null;this.zone=null;this.serveType=null;}
  // the game slows while the player's shot is coming and no target has been picked
  get timeScale(){return this.decide&&!this.auto&&!this.target?SLOWMO:1;}
}
