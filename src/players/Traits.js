// Traits — one signature per player, on top of the ratings
// A trait is not a number on the card: it changes how the match treats that player in one particular situation.
// Hooks (all optional), read by Match:
//   error(c)      multiplies the error of a groundstroke          c: {ret, server, n, wing, tac, stretch, pace, big}
//   stretchK      how much of the usual stretch penalty applies   paceK: same for a fast incoming ball
//   overhitK      same for swinging harder than the player's power allows
//   speed(c)      multiplies the pace of a shot                   spin(c): multiplies its spin
//   disguise(c)   seconds later the opponent reads this shot      react: seconds added to this player's read of a serve
//   serveErr(no,pressure), serveSpeed(no)                         pressure: a big point this server could lose
const TRAITS={
  returnWall:   {name:'Return wall',     text:'Reads the serve early and almost never misses a return.',
    react:-.05,error:c=>c.ret?.55:1},
  heavyForehand:{name:'Heavy forehand',  text:'The forehand carries extra topspin and holds up under any pressure.',
    spin:c=>c.wing==='fh'&&!['slice','drop','lob'].includes(c.tac)?1.15:1,error:c=>c.wing==='fh'?.88:1},
  disguise:     {name:'Disguised drop',  text:'The drop shot looks like a drive until it is too late to run.',
    error:c=>c.tac==='drop'||c.tac==='dropvolley'?.5:1,disguise:c=>c.tac==='drop'?.3:0},
  firstStrike:  {name:'First strike',    text:'The first ball after his own serve is struck early, hard and clean.',
    error:c=>c.server&&c.n===2?.7:1,speed:c=>c.server&&c.n===2?1.06:1},
  cleanStrike:  {name:'Clean striker',   text:'Hits flat out without the errors that swinging that hard costs everyone else.',
    overhitK:0,speed:c=>['drive','flat','cross','line'].includes(c.tac)?1.04:1},
  octopus:      {name:'Octopus',         text:'At full stretch, far behind the baseline, the ball still comes back deep.',
    stretchK:.35},
  bigServe:     {name:'Serve cannon',    text:'A first serve that rarely misses its spot — and a second that wobbles on the big points.',
    serveErr:(no,pressure)=>no===1?.88:pressure?1.35:1,serveSpeed:no=>no===1?1.02:1},
  counterpunch: {name:'Counterpuncher',  text:'The harder the ball comes, the better it goes back: pace is borrowed, not feared.',
    paceK:0,stretchK:.7,speed:c=>1+.06*c.pace},
};
class Traits{
  static NONE={name:'',text:''};
  static of(P){return TRAITS[P.st.trait]||Traits.NONE;}
}
