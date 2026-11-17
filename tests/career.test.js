// The career's rules: Elo odds, the ranking, the points table, the draws, points dropping off after 52 weeks, saving
const{loadSim}=require('./load.js');
const A=loadSim(['EloModel','WorldRanking','CAREER_DATA','CareerEvent','Calendar','Career','CareerProfile','CareerWorld','ROSTER','LEVEL_FIT']);
const{EloModel,WorldRanking,CAREER_DATA,CareerEvent,Calendar,Career,CareerProfile,ROSTER}=A;
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL:',m);}else console.log('ok:',m);};
const near=(a,b,e)=>Math.abs(a-b)<=e;
// Tennis Abstract's figures for best of three
ok(near(EloModel.bo3(100),.64,.005)&&near(EloModel.bo3(200),.76,.005)&&near(EloModel.bo3(300),.85,.005)&&near(EloModel.bo3(400),.91,.005),'Elo: 64/76/85/91% at 100/200/300/400 points');
ok(near(EloModel.win(0,3),.5,1e-6)&&EloModel.win(200,3)>EloModel.bo3(200)&&EloModel.win(200,1)<EloModel.bo3(200),'Elo: best of five favours the stronger more than best of three, one set less');
// the real ranking
ok(WorldRanking.points(1)===9320&&WorldRanking.points(100)===609&&WorldRanking.points(500)===87,'ranking: the points of 16 November 2026 at 1, 100 and 500');
let place=true;for(let r=1;r<=500;r++){const v=WorldRanking.points(r);let n=0;for(let k=1;k<=500;k++)if(WorldRanking.points(k)>=v)n++;if(WorldRanking.rankOf(v)!==n+1)place=false;}
ok(place&&WorldRanking.rankOf(0)==null&&WorldRanking.rankOf(1)===501,'ranking: a total sits one place behind everyone holding as many points or more');
// the points table (ATP, since 2024)
const P=CAREER_DATA.POINTS;ok(P.gs.W===2000&&P.gs.F===1300&&P.gs.QF===400&&P.m1000.W===1000&&P.a500.F===330&&P.a250.SF===100&&P.c125.W===125&&P.c75.QF===12,'points: the ATP table');
// draws
let draws=true,points=true;
for(const ev of Calendar.EVENTS){const d=CareerEvent.make(ev,2027,120,ev.id*17+3),keys=d.rounds[0].flatMap(m=>[m.a,m.b]);
  if(new Set(keys).size!==d.n||keys.length!==d.n||!keys.includes('me'))draws=false;
  // the top seed at the top of the draw, the second at the bottom
  const s1=Object.keys(d.seeds).find(k=>d.seeds[k]===1),s2=Object.keys(d.seeds).find(k=>d.seeds[k]===2);if(keys[0]!==s1||keys[d.n-1]!==s2)draws=false;}
ok(draws,'draws: every event full, no one twice, seeds 1 and 2 at the ends');
// an event played through: win every match → the title and its points; lose the first → the first round's points
{const c=Career.create({name:'T T',short:'T',cc:'AUS',hand:1,ohb:false,arch:'Sinner',look:{},face:{}});
  const ev=c.events.find(e=>c.canEnter(e).ok);c.enter(ev);let n=0;while(!c.event.d.done&&n<10){c.matchDone(true,'6–4 6–4');n++;}
  const r=c.event.result;ok(r.round==='W'&&r.pts===P[ev.tier].W&&n===CAREER_DATA.ROUNDS[c.event.d.n].length,`event: five wins take the ${ev.name} title and ${P[ev.tier].W} points`);
  c.finishEvent();ok(c.points===150+P[ev.tier].W&&c.s.titles.length===1,'event: the points go on the ranking, the title in the cabinet');
  const ev2=c.events.find(e=>c.canEnter(e).ok);c.enter(ev2);c.matchDone(false,'4–6 4–6');ok(c.event.result.round===CAREER_DATA.ROUNDS[c.event.d.n][0]&&c.event.d.champion!=null,'event: a first-round loss ends it, and the draw still finds its champion');c.finishEvent();
  // a year on, everything from before has dropped off
  const pts=c.points;c.s.w+=60;ok(c.points===0&&pts>0,'ranking: points count for 52 weeks only');
  const s=JSON.parse(JSON.stringify(c.s)),c2=new Career(s);ok(c2.points===c.points&&c2.level===c.level&&c2.s.titles.length===1,'saving: a career survives being written out and read back');}
// a player at the archetype's own peak plays with its numbers
{const a=ROSTER[0],p=CareerProfile.make(a,CareerProfile.peak(a),{name:'X',short:'X',id:2001});ok(near(p.err,a.err,1e-9)&&near(p.acc??1,a.acc??1,1e-9)&&p.trait===null,'level: at the archetype\'s peak, its own errors and accuracy, no trait');
  const q=CareerProfile.make(a,CareerProfile.peak(a)-400,{name:'Y',short:'Y',id:2002});ok(q.err>p.err&&q.overall<p.overall,'level: 400 Elo lower, more errors and a lower overall');}
// growth: always up, never past the ceiling
{const c=Career.create({name:'G G',short:'G',cc:'AUS',hand:1,ohb:false,arch:'Sinner',look:{},face:{}});let prev=c.level,up=true;for(let i=0;i<2000;i++){c.gain(1);if(c.level<prev)up=false;prev=c.level;}
  ok(up&&c.level<Career.START.ceiling,'growth: the level only rises, and stays under its ceiling');}
console.log(fail?`\n${fail} career check(s) failed`:'\nall career checks passed');process.exit(fail?1:0);
