// Where a rally ball goes, by the rule of the Match Charting Project's ShotDirection table. tools/mcp_directions.py
// finds the rule by rebuilding that table from the raw shot codes (98.1% of player-match rows come out exactly equal).
//   counted        rally groundstrokes: forehands, backhands and backhand slices. Not the return, volleys, overheads,
//                  lobs, drop shots or forehand slices
//   where from     the third of his own court the ball came to; here, where he meets it
//   middle         to the middle third
//   line           from a side third, straight along the same side (down the line, and inside-in)
//   cross          everything else (cross-court, and inside-out), so any ball hit from the middle third
// The real table also leaves out forced errors. The game does not tell forced from unforced errors, so they stay in;
// in the real data, putting them back moves the line share by +0.5 points (tools/mcp_directions.py).
function direction(P,p,isServe,CT){
  if(isServe||!p||!p.shot||p.kind!=='ground')return null;
  const tac=p.shot.tac;if(tac==='lob'||tac==='drop')return null;
  if(p.shot.sw==='slice'&&p.wing==='fh')return null;
  const third=x=>Math.abs(x)<CT.SW/3?0:Math.sign(x),from=third(p.x),to=third(p.shot.t.x);
  if(to===0)return'middle';
  return from!==0&&from===to?'line':'cross';
}
// the real split, hard courts since 2010, 1,382,708 shots (tools/mcp_directions.py)
const REAL={cross:59.3,middle:26.5,line:14.2};
module.exports={direction,REAL};
