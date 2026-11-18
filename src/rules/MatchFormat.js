// MatchFormat — match formats, played to the Grand Slam rules (as at the Australian Open):
// sets of six games won by two, a 7-point tiebreak at 6–6, and in the deciding set a 10-point tiebreak at 6–6.
// games: games to win a set · sets: sets to win the match · tb: tiebreak points · decider: tiebreak points in the
// deciding set · tbOnly: the whole match is one tiebreak (to decider points: 7, as at 6–6 in a set)
class MatchFormat{
  constructor(key,name,desc,games,sets,{tb=7,decider=10,tbOnly=false,menu=true}={}){Object.assign(this,{key,name,desc,games,sets,tb,decider,tbOnly,menu});}
  static get(k){return MatchFormat.ALL.find(f=>f.key===k)||MatchFormat.ALL[0];}
  // the formats a person can choose
  static get MENU(){return MatchFormat.ALL.filter(f=>f.menu);}
}
MatchFormat.ALL=[
  new MatchFormat('one','1 set','One set: first to 6 games by two; at 6–6 a 10-point tiebreak.',6,1),
  new MatchFormat('bo3','Best of 3 sets','Two sets to win; 7-point tiebreaks at 6–6, a 10-point tiebreak in the third.',6,2),
  new MatchFormat('bo5','Best of 5 sets','Three sets to win, as in Grand Slam men\'s singles: 7-point tiebreaks at 6–6, a 10-point tiebreak in the fifth.',6,3),
  new MatchFormat('tb','Tiebreak','One tiebreak, as at 6–6 in a set: first to 7, by two clear points.',0,1,{tbOnly:true,decider:7}),
  // for self-play and tests: a quick set to four games, 7-point tiebreak at 4–4
  new MatchFormat('short','Short set','One set to 4 games, tiebreak at 4–4',4,1,{decider:7,menu:false}),
];
