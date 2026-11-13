// CrowdMood — what fifteen thousand people feel and do, point by point
// Tennis crowds follow etiquette: quiet while the server prepares, silent during the rally, then a reaction sized to
// the point — polite applause for an error, a cheer for a winner or an ace, a roar and a standing ovation for a long
// rally or a break, set or match point, an "ooh" for a ball that just catches the line or the tape, a groan for a
// double fault. The home player gets more of everything. It emits 'crowd' events for the sound and keeps levels the
// stands animate from: clap, stand, arms (raised in a roar) and level (the murmur between points).
class CrowdMood{
  static HOME='AUS';
  constructor(match){
    this.m=match;this.clap=0;this.stand=0;this.arms=0;this.level=.45;this.tension=0;this.hush=false;
    this.clapGoal=0;this.standGoal=0;this.armsGoal=0;this.levelGoal=.45;this.hold=0;
  }
  // how much more the crowd cares when this player wins it
  bias(P){return P&&P.st.cc===CrowdMood.HOME?1.25:1;}
  emit(kind,power,o={}){this.m.ev('crowd',Object.assign({kind,power:clamp(power,0,1)},o));}
  // a burst: levels jump, then hold for a while before easing back
  react(clap,stand,arms,hold){this.clapGoal=Math.max(this.clapGoal,clamp(clap,0,1));this.standGoal=Math.max(this.standGoal,stand);this.armsGoal=Math.max(this.armsGoal,arms);this.hold=Math.max(this.hold,hold);this.hush=false;}
  walkOn(){this.emit('applause',.8);this.emit('cheer',.5);this.react(.8,.2,.2,6);this.levelGoal=.7;}
  serveReady(){this.hush=true;this.levelGoal=.04;this.tension=0;}
  serveStruck(){this.levelGoal=.02;}
  // every shot in a long rally screws the tension up
  shot(n,stretch){this.tension=clamp((n-4)/12,0,1);if(stretch>.7&&n>3&&R()<.5)this.emit('gasp',.3+this.tension*.4);}
  closeCall(m){this.emit('ooh',.45+Math.min(.35,(.045-Math.abs(m))*8)+this.tension*.2);}
  netCord(){this.emit('ooh',.6+this.tension*.3);}
  // how: {kind: ace|winner|error|net|df, by}, rally length, big point label if any
  point(W,L,how,n,big){
    const b=this.bias(W),t=this.tension,bp=big&&big.w===W.idx?big.label:null;
    let cheer=0,clap=.35+Math.min(.4,n*.04),stand=0,arms=0;
    if(how.kind==='ace'){cheer=.55;clap=.55;if(this.m.kmh>=205)this.emit('ooh',.5);}
    else if(how.kind==='winner'){cheer=.45+t*.4;clap=.5+t*.4;}
    else if(how.kind==='df'){this.emit('groan',.55*this.bias(L));clap=.2;}
    else if(how.kind==='net'||how.kind==='error'){if(n>=8)cheer=.25+t*.3;if(this.bias(L)>1)this.emit('groan',.45);}
    if(n>=12){cheer=Math.max(cheer,.8);clap=1;stand=.7;arms=.4;}
    if(bp){cheer=Math.max(cheer,bp==='Match point'?1:bp==='Set point'?.85:.75);clap=1;stand=Math.max(stand,bp==='Break point'?.5:.9);arms=Math.max(arms,.6);}
    cheer=Math.min(1,cheer*b);clap=Math.min(1,clap*b);
    if(cheer>.05)this.emit(bp||cheer>.75?'roar':'cheer',cheer,{who:W.idx});
    this.emit('applause',clap);
    this.react(clap,stand,arms*b,1.6+clap*2.2+stand*2);
    this.levelGoal=.35+cheer*.3;this.tension=0;
  }
  changeover(set){this.levelGoal=set?.75:.6;if(set){this.emit('applause',.7);this.react(.6,0,0,3);}}
  matchOver(W){this.emit('roar',1,{who:W.idx});this.emit('applause',1);this.react(1,1,1,9);this.levelGoal=.8;}
  // ease toward the goals; reactions hold, then fade
  tick(dt){
    if(this.hold>0)this.hold-=dt;else{this.clapGoal*=Math.exp(-dt*1.4);this.standGoal*=Math.exp(-dt*.9);this.armsGoal*=Math.exp(-dt*1.6);}
    const k=Math.min(1,dt*7),k2=Math.min(1,dt*2.2);
    this.clap+=(this.clapGoal-this.clap)*k;this.stand+=(this.standGoal-this.stand)*k2;this.arms+=(this.armsGoal-this.arms)*k;
    this.level+=(this.levelGoal-this.level)*Math.min(1,dt*(this.hush?1.6:.8));
    if(!this.hush&&this.hold<=0)this.levelGoal+=(.45-this.levelGoal)*Math.min(1,dt*.15);
  }
}
