// EloModel — how likely one player is to beat another, from their Elo ratings, the way Tennis Abstract rates players
// A gap of d points gives the stronger player 1/(1+10^(−d/400)) of best-of-three matches: 64% at 100 points, 76% at
// 200, 85% at 300, 91% at 400 (Tennis Abstract's own figures for its ratings). A best-of-five match is played as the
// same chance of winning each set, over five sets.
class EloModel{
  static bo3(d){return 1/(1+Math.pow(10,-d/400));}
  // the chance of winning a set that gives a best-of-three chance p (p = s²(3 − 2s)), by bisection
  static setChance(p){let lo=0,hi=1;for(let i=0;i<40;i++){const s=(lo+hi)/2;if(s*s*(3-2*s)<p)lo=s;else hi=s;}return(lo+hi)/2;}
  // the chance of winning a match of `sets` sets to win (1, 2 or 3) with a rating gap d
  static win(d,sets=2){const p=EloModel.bo3(d);if(sets===2)return p;const s=EloModel.setChance(p);return sets===1?s:s*s*s*(10-15*s+6*s*s);}
  // the Elo a player of this ATP ranking has, on the line through the real list (CareerData.ELO_RANK)
  static atRank(r){const E=CAREER_DATA.ELO_RANK;return E.A-E.B*Math.log(Math.max(1,r));}
  // the ranking that an Elo rating sits at on the same line
  static rankAt(e){const E=CAREER_DATA.ELO_RANK;return Math.max(1,Math.round(Math.exp((E.A-e)/E.B)));}
}
