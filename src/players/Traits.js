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
  returnWall:   {name:'Return wall',     text:'Reads the serve early, sends it back hard, and after that simply does not miss.',
    react:-.07,error:c=>c.ret?.4:.82,speed:c=>c.ret?1.12:1},
  heavyForehand:{name:'Heavy forehand',  text:'The forehand carries extra topspin and holds up under any pressure.',
    spin:c=>c.wing==='fh'&&!['slice','drop','lob'].includes(c.tac)?1.25:1,error:c=>c.wing==='fh'?.72:1},
  disguise:     {name:'Disguised drop',  text:'Every shot looks the same until it is hit: the drop and the angle are read too late to run down.',
    error:c=>['drop','dropvolley','angle','volley'].includes(c.tac)?.35:.95,disguise:c=>c.tac==='drop'?.5:c.tac==='angle'?.2:.015},
  firstStrike:  {name:'First strike',    text:'The first ball after his own serve is struck early, hard and clean.',
    error:c=>c.server&&c.n===2?.45:1,speed:c=>c.server&&c.n===2?1.1:1},
  cleanStrike:  {name:'Clean striker',   text:'Hits flat out without the errors that swinging that hard costs everyone else.',
    overhitK:0,error:c=>['drive','flat','cross','line'].includes(c.tac)?.88:1,speed:c=>['drive','flat','cross','line'].includes(c.tac)?1.06:1},
  octopus:      {name:'Octopus',         text:'At full stretch, far behind the baseline, the ball still comes back deep.',
    stretchK:.1,error:c=>c.stretch>.3?.7:.9},
  bigServe:     {name:'Serve cannon',    text:'A first serve that rarely misses its spot — and a second that wobbles on the big points.',
    serveErr:(no,pressure)=>no===1?.6:pressure?1.35:1,serveSpeed:no=>no===1?1.06:1},
  counterpunch: {name:'Counterpuncher',  text:'The harder the ball comes, the better it goes back: pace is borrowed, not feared.',
    paceK:0,stretchK:.2,error:c=>c.stretch>.2||c.pace>.3?.72:.92,speed:c=>1+.12*c.pace},
};
class Traits{
  static NONE={name:'',text:''};
  static of(P){return TRAITS[P.st.trait]||Traits.NONE;}
}
