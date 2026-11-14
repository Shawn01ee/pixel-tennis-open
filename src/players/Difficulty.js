// Difficulty — how well the opponent uses what the computer players have learned
// Rookie plays on instinct alone: none of the learned tactics, and looser strokes. Pro plays the tactics learned in
// self-play and goes on learning during the match. Legend plays them with a steadier, more accurate hand.
class Difficulty{
  static ALL=[
    {key:'rookie',name:'Rookie',desc:'Plays on instinct: no learned tactics, more loose shots.',err:1.3,acc:1.2,noLearn:true},
    {key:'pro',   name:'Pro',   desc:'Plays the tactics learned in self-play, and keeps learning from you.',err:1,acc:1,noLearn:false},
    {key:'legend',name:'Legend',desc:'Learned tactics with a steadier, sharper hand.',err:.82,acc:.82,noLearn:false},
  ];
  static get(key){return Difficulty.ALL.find(d=>d.key===key)||Difficulty.ALL[1];}
  // the opponent's profile at a level: the same player, with the level's hand and head
  static apply(p,key){const d=Difficulty.get(key);return Object.assign(Object.create(Object.getPrototypeOf(p)),p,{err:p.err*d.err,acc:(p.acc??1)*d.acc,noLearn:d.noLearn,level:d.key});}
}
