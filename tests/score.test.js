// Scoring to the Grand Slam rules: 7-point tiebreaks at 6–6, a 10-point tiebreak in the deciding set, and the
// tiebreak mode (the whole match one tiebreak, to 7 like a set's).  Run: node tests/score.test.js
const{loadSim}=require('./load');
const{Score,MatchFormat}=loadSim(['Score','MatchFormat']);
let fails=0;const check=(ok,msg)=>{console.log(`${ok?'PASS':'FAIL'}  ${msg}`);if(!ok)fails++;};
const A={short:'Ann'},B={short:'Bea'};
const game=(s,w)=>{let ev;for(let i=0;i<4;i++)ev=s.point(w);return ev;};
// both players hold to 6–6 in the current set
const toSixAll=s=>{for(let i=0;i<6;i++){game(s,s.server);game(s,s.server);}};
// a tiebreak won by w, reaching n points to m (the loser's points), alternating until the loser's count is in
const tiebreak=(s,w,n,m)=>{let ev;for(let i=0;i<m;i++){s.point(1-w);ev=s.point(w);}for(let i=m;i<n;i++)ev=s.point(w);return ev;};
{const s=new Score(A,B,0,MatchFormat.get('one'));toSixAll(s);
  check(s.mode==='tb'&&s.tbTarget===10,'1 set: at 6–6 the tiebreak is played to 10 (the deciding set)');
  const ev=tiebreak(s,0,10,8);check(ev.type==='match'&&s.line(0)==='7–6(8)',`1 set: won 7–6 on a 10–8 tiebreak, written ${s.line(0)}`);}
{const s=new Score(A,B,0,MatchFormat.get('bo3'));toSixAll(s);
  check(s.tbTarget===7,'best of 3: a first-set tiebreak is played to 7');
  let ev=tiebreak(s,0,7,5);check(ev.type==='set'&&!s.over,'best of 3: 7–5 in the tiebreak wins the first set, not the match');
  toSixAll(s);ev=tiebreak(s,1,7,4);check(s.sets[0]===1&&s.sets[1]===1,'one set all');
  toSixAll(s);check(s.tbTarget===10,'best of 3: the third-set tiebreak is played to 10');
  ev=tiebreak(s,0,7,0);check(!s.over,'best of 3: 7–0 does not win the third-set tiebreak');
  for(let i=0;i<3;i++)ev=s.point(0);check(ev.type==='match'&&s.line(0)==='7–6(5) 6–7(4) 7–6(0)',`best of 3: 10–0 wins it, written ${s.line(0)}`);}
{const s=new Score(A,B,0,MatchFormat.get('bo5'));let won=0;
  for(let k=0;k<4;k++){toSixAll(s);check(s.tbTarget===7,`best of 5: the tiebreak in set ${k+1} is played to 7`);tiebreak(s,k%2,7,3);}
  check(!s.over&&s.sets[0]===2&&s.sets[1]===2,'best of 5: two sets all, not over');
  toSixAll(s);check(s.tbTarget===10,'best of 5: the fifth-set tiebreak is played to 10');const ev=tiebreak(s,1,10,7);
  check(ev.type==='match'&&s.winner===1,`best of 5: won in the fifth, written ${s.line(1)}`);}
{const s=new Score(A,B,0,MatchFormat.get('tb'));
  check(s.mode==='tb'&&s.tbTarget===7,'tiebreak mode: the match is one tiebreak to 7, as at 6–6 in a set');
  let ev;for(let i=0;i<6;i++){s.point(0);ev=s.point(1);}ev=s.point(0);check(!s.over&&s.pts[0]===7&&s.pts[1]===6,'tiebreak mode: 7–6 is not enough, it is won by two');
  s.point(1);s.point(0);ev=s.point(0);check(ev.type==='match'&&s.winner===0&&s.line(0)==='9–7',`tiebreak mode: 9–7 wins it, written ${s.line(0)}`);}
{const s=new Score(A,B,0,MatchFormat.get('tb'));let ev;for(let i=0;i<7;i++)ev=s.point(1);check(ev.type==='match'&&s.winner===1&&s.line(1)==='7–0','tiebreak mode: 7–0 wins it');}
console.log(fails?`\n${fails} FAILED`:'\nall scoring checks passed');process.exitCode=fails?1:0;
