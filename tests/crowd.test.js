// The crowd follows tennis etiquette and reacts in proportion: quiet for the serve, a reaction after every point,
// cheers for aces and winners, groans for double faults, a roar for big points, louder for the home player.
// Run: node tests/crowd.test.js
const{loadSim}=require('./load');
const{Match,ROSTER,MatchFormat}=loadSim(['Match','ROSTER','MatchFormat']);
let fails=0;const check=(ok,msg)=>{console.log(`${ok?'PASS':'FAIL'}  ${msg}`);if(!ok)fails++;};
const home=ROSTER.find(p=>p.cc==='AUS'),
// the visitor is the home player's twin from elsewhere, so only the crowd's bias differs
away=Object.assign(Object.create(Object.getPrototypeOf(home)),home,{cc:'ESP',id:99,short:'Visitor'});
const m=new Match({a:home,b:away,format:MatchFormat.get('set')});
const kinds={},after={};let points=0,serves=0,quietServes=0,lastKind=null,dfGroans=0,dfs=0,bigRoars=0,bigWins=0,homeCheer=0,awayCheer=0,homeN=0,awayN=0,n=0;
while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&n<120*60*90){
  m.tick();n++;
  for(const e of m.events){
    if(e.type==='hit'&&e.kind==='serve'){serves++;if(m.mood.level<.12)quietServes++;}
    if(e.type==='crowd'){kinds[e.kind]=(kinds[e.kind]||0)+1;if((e.kind==='cheer'||e.kind==='roar')&&e.who!==undefined){if(e.who===0){homeCheer+=e.power;}else{awayCheer+=e.power;}}}
    if(e.type==='scored'){points++;if(e.w===0)homeN++;else awayN++;if(e.was&&e.was.w===e.w)bigWins++;}
  }
  // reactions follow the point they belong to within the same tick
  const sc=m.events.find(e=>e.type==='scored');
  if(sc){const cr=m.events.filter(e=>e.type==='crowd').map(e=>e.kind);if(m.how&&m.how.kind==='df'){dfs++;if(cr.includes('groan'))dfGroans++;}if(sc.was&&sc.was.w===sc.w&&cr.includes('roar'))bigRoars++;}
  m.events.length=0;
}
console.log('crowd reactions:',JSON.stringify(kinds),`over ${points} points`);
check(quietServes/serves>.95,`the crowd is quiet for ${quietServes}/${serves} serves`);
check((kinds.applause||0)>=points,`applause after every point (${kinds.applause||0} for ${points} points)`);
check((kinds.cheer||0)+(kinds.roar||0)>points*.2,`cheers or roars on ${((kinds.cheer||0)+(kinds.roar||0))} points`);
check(dfs===0||dfGroans===dfs,`a groan for every double fault (${dfGroans}/${dfs})`);
check(bigWins===0||bigRoars/bigWins>.9,`a roar when a big point is won (${bigRoars}/${bigWins})`);
check(homeCheer/Math.max(1,homeN)>awayCheer/Math.max(1,awayN),`the home player gets more cheering per point won (${(homeCheer/Math.max(1,homeN)).toFixed(2)} vs ${(awayCheer/Math.max(1,awayN)).toFixed(2)})`);
console.log(fails?`\n${fails} FAILED`:'\nall crowd checks passed');process.exitCode=fails?1:0;
