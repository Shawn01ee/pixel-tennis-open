// WorldRanking — points and places on the real ATP ranking of 16 November 2026 (CareerData.RANK_POINTS)
// Everyone else in the career's world holds the points of his place on that list; the person's own points place him
// one behind everyone holding as many points or more.
class WorldRanking{
  static get SIZE(){return CAREER_DATA.RANK_POINTS.length;}
  static points(r){const P=CAREER_DATA.RANK_POINTS;return r>=1&&r<=P.length?P[r-1]:0;}
  // the place a total would have: one behind everyone holding as many or more; SIZE + 1 below the whole list, null
  // with no points at all
  static rankOf(pts){if(!(pts>0))return null;const P=CAREER_DATA.RANK_POINTS;let lo=0,hi=P.length;while(lo<hi){const m=(lo+hi)>>1;if(P[m]>=pts)lo=m+1;else hi=m;}return lo+1;}
  static label(r){return r==null?'Unranked':r>WorldRanking.SIZE?`${WorldRanking.SIZE}+`:`${r}`;}
}
