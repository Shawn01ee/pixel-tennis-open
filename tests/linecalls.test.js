// Line calls against Mather (2008, Proc R Soc B 275:1645): with the line judges' and players' measured errors
// (Match.LINE), how often a judge gets a ball within 100 mm of the line wrong (the paper's model: 8.2%), and how many
// of the challenges a player makes — when what he saw disagrees with the call — are upheld (on tour: 39.3%). Balls
// spread evenly within 100 mm of the line, at the baseline/service line and side/centre lines in the proportion of the
// paper's challenges (628 to 752).  Run: node tests/linecalls.test.js
const path=require('path');const{loadSim}=require(path.join(__dirname,'load'));
const{Match,rng,N}=loadSim(['Match','rng','N']);rng.s=20260518;const J=Match.LINE;let fails=0;
const check=(ok,what)=>{console.log((ok?'PASS ':'FAIL ')+what);if(!ok)fails++;};
let calls=0,wrong=0,chal=0,upheld=0;
for(let i=0;i<200000;i++){const m=(rng.next()*2-1)*J.near,line=rng.next()<628/1380?'long':'wide';
  const out=m+N(J.judge[line])<0;calls++;if((m<0)!==out)wrong++;
  const seen=m+N(J.player[line]);if(out?seen>=0:seen<0){chal++;if((m<0)!==out)upheld++;}}
const w=100*wrong/calls,u=100*upheld/chal;
check(Math.abs(w-8.2)<2.5,`line judges wrong on ${w.toFixed(1)}% of balls within 100 mm (Mather's model: 8.2%)`);
check(Math.abs(u-39.3)<6,`${u.toFixed(1)}% of challenges upheld (on tour: 39.3%; Mather's model: 39.6%)`);
console.log(fails?`\n${fails} FAILED`:'\nall line-call checks passed');process.exitCode=fails?1:0;
