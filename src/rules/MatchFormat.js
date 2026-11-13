// MatchFormat — match formats: games per set, sets to win
class MatchFormat{
  constructor(key,name,desc,games,sets){this.key=key;this.name=name;this.desc=desc;this.games=games;this.sets=sets;}
  static get(k){return MatchFormat.ALL.find(f=>f.key===k)||MatchFormat.ALL[0];}
}
MatchFormat.ALL=[
  new MatchFormat('short','Short set','One set to 4 games, tiebreak at 4–4',4,1),
  new MatchFormat('set','Full set','One set to 6 games, tiebreak at 6–6',6,1),
  new MatchFormat('bo3','Best of three','Two sets to win, 10-point final-set tiebreak',6,2),
];
