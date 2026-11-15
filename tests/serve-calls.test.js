// The serve calls follow the rules: a let is not a fault, a double fault takes two faults, and "네트" is only called
// for a serve that touches the net.  Run: node tests/serve-calls.test.js
const{loadSim}=require('./load');
const{Match,ROSTER,MatchFormat}=loadSim(['Match','ROSTER','MatchFormat']);
let fails=0;const check=(ok,msg)=>{console.log(`${ok?'PASS':'FAIL'}  ${msg}`);if(!ok)fails++;};
Match.LINE.miss=0;            // perfect line judges: no overturned calls to replay the point
let points=0,lets=0,letThenFault=0,dfs=0,netCalls=0,netOutsideServe=0,netThenLet=0,netThenFault=0,wrongNo=0,wrongDF=0,tapeNoCall=0;
for(let k=0;k<26;k++){
  const m=new Match({a:ROSTER[k%13],b:ROSTER[(k*5+3)%13],format:MatchFormat.get('short')});
  let faults=0,serve=null,seq=[];
  for(let n=0;!(m.stage==='over'&&m.result)&&n<120*60*90;n++){
    m.tick();
    for(const e of m.events){
      if(e.type==='hit'&&e.kind==='serve'){
        // a serve's number is 1 + the faults so far in the point: lets do not count
        if(m.serveNo!==1+faults)wrongNo++;
        serve={net:false,call:null};seq.push(serve);
      }else if(e.type==='net'&&serve&&m.isServe&&!e.mesh&&!serve.touched){serve.touched=true;}
      else if(e.type==='call'){
        if(e.text==='NET'){netCalls++;if(!m.isServe)netOutsideServe++;if(serve)serve.net=true;}
        else if(serve&&m.isServe){serve.call=e.text;
          if(e.text==='FAULT'){faults++;if(serve.net)netThenFault++;if(seq.some(s=>s.call==='LET'))letThenFault++;}
          if(e.text==='LET'){lets++;if(serve.net)netThenLet++;}}
      }else if(e.type==='tag'&&e.text==='더블 폴트'){dfs++;if(faults!==2)wrongDF++;}
      else if(e.type==='scored'){points++;for(const s of seq)if(s.touched&&!s.net)tapeNoCall++;faults=0;serve=null;seq=[];}
    }
    m.events.length=0;
  }
}
console.log(`  ${points} points · ${lets} lets (${letThenFault} followed by a fault in the same point) · ${dfs} double faults · ${netCalls} net calls (${netThenLet} then let, ${netThenFault} then fault)`);
check(lets>0&&netThenLet===lets,'every let is a serve that touched the net and was called 네트 first');
check(wrongNo===0,`after a let the same serve is played again: serve numbers count faults only (${wrongNo} wrong)`);
check(wrongDF===0&&dfs>0,`a double fault comes only after two faults in the point (${wrongDF} wrong of ${dfs})`);
check(netOutsideServe===0,`네트 is called only on serves, never in a rally (${netOutsideServe} wrong)`);
check(tapeNoCall===0,`every serve that clips the tape is called 네트 (${tapeNoCall} missed)`);
console.log(fails?`\n${fails} FAILED`:'\nall serve-call checks passed');process.exitCode=fails?1:0;
