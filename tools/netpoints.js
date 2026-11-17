// Net points, by the rule of the Match Charting Project's NetPoints table. tools/mcp_net.py finds the rule by
// rebuilding that table from the raw shot codes (96.3% of player-match rows come out exactly equal):
//   a player has a net point when, in the point, he
//     approaches          an approach shot (+), or he serves and follows it in (serve-and-volley)
//     plays at the net    a volley, half-volley or overhead not hit from the baseline, or any shot hit at the net (-)
//   except a shot that is a forced error and not an approach.
// In the game: an approach is the 'approach' tactic, or a serve its server follows in; a volley, put-away, drop volley
// or smash counts when it is hit from more than 2.5 m inside the baseline, and any shot hit from inside the service
// line counts as one at the net (where 'at the baseline' and 'at the net' end is design). The game does not tell
// forced errors from unforced ones, so none are left out: in the real data, leaving them in adds 2.8% net points.
const NET_SHOTS=new Set(['volley','putaway','dropvolley','smash']);
// a 'hit' event (kind: the tactic; z: where the ball was struck) that makes the point a net point for its hitter
function netShot(e,CT){
  const az=Math.abs(e.z);
  if(e.kind==='approach')return true;
  if(NET_SHOTS.has(e.kind)&&az<CT.L-2.5)return true;
  return e.kind!=='serve'&&az<CT.SVC;
}
// one point at a time: feed it the match's events after each tick; it reports each player's net point as the point ends
class NetPointCounter{
  constructor(CT){this.CT=CT;this.on=[false,false];}
  events(m,list,done){
    for(const e of list){
      if(e.type==='hit'){if(e.kind==='serve'){if(m.players[e.who].rush)this.on[e.who]=true;}else if(netShot(e,this.CT))this.on[e.who]=true;}
      else if(e.type==='scored'){done(this.on[0],this.on[1]);this.on=[false,false];}
    }
  }
}
module.exports={netShot,NetPointCounter};
