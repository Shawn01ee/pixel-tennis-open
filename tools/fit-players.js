// Fits each player's numbers in the game to his real statistics in the Match Charting Project.
//   node tools/fit-players.js [rounds, default 8] [sets per measurement, default 12]
// Reads data/mcp-players.json (made from the Match Charting Project, CC BY-NC-SA 4.0). Writes src/players/fitted.js
// (the fitted numbers, the same licence) and data/fit-report.json (each player's statistics in the game next to his
// real ones). How it works:
//   1. A "tour average" opponent is fitted first, playing a copy of itself until it serves, returns and chooses its
//      shots like the average charted hard-court match since 2010.
//   2. Each player then plays one-set matches against it, and after every round each of his numbers is moved toward
//      the value that would give his real statistic: serve speed by aces, first- and second-serve accuracy by first
//      serves in and double faults, and how often he serve-volleys, comes in, drops, slices and lobs by how often he
//      really does. Winners and errors are matched as a ratio to the tour: the game's points end in winners more often
//      than real ones (a property of movement and reach, not of any one player), so a player who really hits 1.3 times
//      the tour's winners per shot is fitted to hit 1.3 times the game tour's. Shot power is the lever for winners and
//      the error scale for errors, and the return error scale for return points won. Risk-taking is not fitted but read off directly: Tennis Abstract's aggression score,
//      (winners + errors) per shot, against the tour's, with the tour at 0.5.
//   Each round's step shrinks (Robbins–Monro), so the noise of a round's sample settles instead of throwing it about.
// The players run in parallel, one process each.
const fs=require('fs'),path=require('path'),cp=require('child_process'),ROOT=path.join(__dirname,'..');
const{loadSim}=require(path.join(ROOT,'tests','load'));
// ── one measurement: px plays pr in one-set matches; px's statistics as counts ──
function measure(API,px,pr,sets,seed){
  const{Match,MatchFormat,PlayerProfile,rng}=API,mk=o=>Object.assign(Object.create(PlayerProfile.prototype),o);
  const A=mk(px),B=mk(pr),c={sv1:0,in1:0,won1:0,sv2:0,won2:0,ace:0,df:0,ret:0,retWon:0,snv:0,net:0,shots:0,drop:0,slice:0,lob:0,win:0,err:0,pts:0};
  for(let k=0;k<sets;k++){
    rng.s=seed+k*7919;const m=new Match({a:A,b:B,format:MatchFormat.get('one')});let n=0,atNet=false,snv=false,servedBy=-1;
    while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&n<150*60*60){
      m.tick();n++;const P=m.players[0];
      if(m.live&&P.rush)atNet=true;
      for(const e of m.events){
        if(e.type==='hit'&&e.kind==='serve'){servedBy=e.who;snv=e.who===0&&P.rush;}
        else if(e.type==='hit'&&e.who===0){
          {c.shots++;if(e.kind==='drop')c.drop++;else if(e.kind==='slice')c.slice++;else if(e.kind==='lob')c.lob++;}
        }else if(e.type==='scored'){
          c.pts++;if(atNet)c.net++;if(snv)c.snv++;atNet=false;snv=false;const h=m.how;
          if(h&&h.by===0){if(h.kind==='winner')c.win++;else if((h.kind==='error'||h.kind==='net')&&!(servedBy===1&&m.rallyLen===2))c.err++;}
        }
      }
      m.events.length=0;
    }
    const a=m.players[0].ms,b=m.players[1].ms;
    c.sv1+=a.sv1;c.in1+=a.sv1in;c.won1+=a.won1;c.sv2+=a.sv2;c.won2+=a.won2;c.ace+=a.aces;c.df+=a.df;c.ret+=b.sv1;c.retWon+=b.sv1-b.won1-b.won2;
  }
  return c;
}
const rates=c=>({ace:c.ace/c.sv1,df:c.df/c.sv1,firstIn:c.in1/c.sv1,firstWon:c.won1/Math.max(1,c.in1),secondWon:c.won2/Math.max(1,c.sv2),
  returnWon:c.retWon/Math.max(1,c.ret),snv:c.snv/c.sv1,net:c.net/c.pts,drop:c.drop/c.shots,slice:c.slice/c.shots,lob:c.lob/c.shots,
  winners:c.win/c.shots,errors:c.err/c.shots,points:c.pts});
const sum=(a,b)=>{const o={...a};for(const k in b)o[k]=(o[k]||0)+b[k];return o;};
if(process.argv[2]==='--worker'){
  const API=loadSim(['Match','MatchFormat','PlayerProfile','rng']);
  process.on('message',t=>process.send({id:t.id,c:measure(API,t.px,t.pr,t.sets,t.seed)}));
  return;
}
// ── the fit ──
const ROUNDS=+(process.argv[2]||8),SETS=+(process.argv[3]||12);
const T=JSON.parse(fs.readFileSync(path.join(ROOT,'data','mcp-players.json'),'utf8'));
const{ROSTER}=loadSim(['ROSTER']);
const KEYS=['s1','serr','serr2','rerr','err','power','aggr','sv','net','drop','slice','lob'];
const base=p=>{const o={};for(const k in p)if(typeof p[k]!=='function')o[k]=p[k];o.serr=o.serr??1;o.serr2=o.serr2??1;o.rerr=o.rerr??1;return o;};
// the tour-average opponent: the roster's mean of every number, no signature trait, no learned tactics
const NUM=['h','v','a','power','spin','err','aggr','net','drop','lob','slice','deep','s1','s2','sv','acc','bounces'];
const tour=base(ROSTER[4]);for(const k of NUM)tour[k]=ROSTER.reduce((s,p)=>s+(p[k]??1),0)/ROSTER.length;
Object.assign(tour,{name:'Tour Average',short:'Tour',trait:null,tkey:'__tour',noLearn:true,legend:false,rank:50,hand:1,ohb:false,serr:1,serr2:1,aggr:.5});
// risk-taking from the aggression score, (winners + errors) per shot, the tour's at 0.5
const AS=r=>r.winners+r.errors,aggrOf=s=>+Math.min(1,.5*AS(T.players[s])/AS(T.tour)).toFixed(3);
const N=Math.min(14,require('os').cpus().length),pool=[...Array(N)].map(()=>cp.fork(__filename,['--worker']));let next=0;const wait=new Map();
pool.forEach(w=>w.on('message',r=>{wait.get(r.id)(r.c);wait.delete(r.id);}));
const run=(px,pr,sets,seed)=>new Promise(res=>{const id=next++;wait.set(id,res);pool[id%N].send({id,px,pr,sets,seed});});
// move each number toward its target; damped, so the noise of one round does not throw it about
function step(p,g,t,rel=true,k=0){
  const G=1/Math.sqrt(1+k),r=(a,b,e,lo,hi)=>Math.min(hi,Math.max(lo,Math.pow(Math.max(a,1e-4)/Math.max(b,1e-4),e*G)));
  p.s1*=r(t.ace,g.ace,.08,.97,1.03);
  p.serr*=r(1-t.firstIn,1-g.firstIn,.7,.8,1.25);
  p.serr2*=r(t.df,g.df,.6,.75,1.33);
  if(rel){p.err*=r(t.errors,g.errors,.8,.8,1.25);p.power*=r(t.winners,g.winners,.5,.92,1.08);}
  // return: more return errors when he wins more return points than he really does (the tour too: 35.3%)
  p.rerr*=r(g.returnWon,t.returnWon,2.5,.8,1.25);
  // serve and volley: on first serves at the rate sv, on second serves at .45 sv (Match.serve)
  p.sv=Math.min(1,Math.max(0,t.snv/(g.firstIn+.45*(1-g.firstIn))));
  for(const k of['net','drop','slice','lob']){const f=g[k]>0?r(t[k],g[k],.9,.6,1.6):1.5;p[k]=Math.min(3,Math.max(0,(p[k]||.02)*f));}
}
(async()=>{
  const t0=Date.now(),log=s=>console.log(`[${((Date.now()-t0)/1000).toFixed(0)}s] ${s}`);
  // 1. the tour-average opponent against a copy of itself, spread over every worker
  for(let it=0;it<ROUNDS;it++){
    const parts=await Promise.all([...Array(N)].map((_,i)=>run(tour,tour,Math.ceil(SETS*2/N)+1,1e6+it*1000+i*31)));
    const g=rates(parts.reduce(sum));step(tour,g,T.tour,false,it);
    log(`tour ${it+1}: ace ${(g.ace*100).toFixed(1)} 1st ${(g.firstIn*100).toFixed(1)} df ${(g.df*100).toFixed(1)} err ${(g.errors*100).toFixed(1)} win ${(g.winners*100).toFixed(1)} net ${(g.net*100).toFixed(1)}`);
  }
  // the game tour's winners and errors per shot, measured at length: the scale the players' ratios are applied to
  const tg=rates((await Promise.all([...Array(N)].map((_,i)=>run(tour,tour,Math.ceil(SETS*4/N)+1,5e6+i*31)))).reduce(sum));
  log(`tour in the game: winners ${(tg.winners*100).toFixed(1)}% and errors ${(tg.errors*100).toFixed(1)}% of shots (real ${(T.tour.winners*100).toFixed(1)}%, ${(T.tour.errors*100).toFixed(1)}%)`);
  // 2. every player against it, all at once
  const fit={},report={};
  await Promise.all(ROSTER.map(async P=>{
    const p=base(P);p.aggr=aggrOf(P.short);const t={...T.players[P.short]};t.winners=tg.winners*t.winners/T.tour.winners;t.errors=tg.errors*t.errors/T.tour.errors;
    for(let it=0;it<ROUNDS;it++){const g=rates(await run(p,tour,SETS,2e6+it*1000+P.id*97));
      if(process.env.TRACE&&process.env.TRACE.split(',').includes(P.short))log(`${P.short} ${it+1}: ace ${(g.ace*100).toFixed(1)} 1st ${(g.firstIn*100).toFixed(1)} df ${(g.df*100).toFixed(1)} err ${(g.errors*100).toFixed(1)}/${(t.errors*100).toFixed(1)} win ${(g.winners*100).toFixed(1)}/${(t.winners*100).toFixed(1)} · s1 ${p.s1.toFixed(1)} serr ${p.serr.toFixed(2)} serr2 ${p.serr2.toFixed(2)} err ${p.err.toFixed(2)} aggr ${p.aggr.toFixed(2)}`);
      step(p,g,t,true,it);}
    const g=rates(await run(p,tour,SETS*3,9e6+P.id*97));
    const o={};for(const k of KEYS)o[k]=+(+p[k]).toFixed(k==='s1'?2:3);fit[P.short]=o;
    const real={},game={},R0=T.players[P.short];for(const k of['ace','df','firstIn','firstWon','secondWon','returnWon','snv','net','drop','slice','lob','winners','errors'])
      {real[k]=+(R0[k]*100).toFixed(1);game[k]=+(g[k]*100).toFixed(1);}
    // winners and errors against the tour, in the game and for real
    real.winnersVsTour=+(R0.winners/T.tour.winners).toFixed(2);game.winnersVsTour=+(g.winners/tg.winners).toFixed(2);
    real.errorsVsTour=+(R0.errors/T.tour.errors).toFixed(2);game.errorsVsTour=+(g.errors/tg.errors).toFixed(2);
    report[P.short]={real,game,before:Object.fromEntries(KEYS.map(k=>[k,P[k]??1])),after:o,points:g.points,charted:{matches:t.matches,points:t.points,surface:t.surface,years:t.years}};
    log(`${P.short} done`);
  }));
  pool.forEach(w=>w.kill());
  const order=ROSTER.map(p=>p.short);
  const head=`// fitted — each player's numbers fitted to his real statistics by tools/fit-players.js (${new Date().toISOString().slice(0,10)})
// Derived from the Tennis Abstract Match Charting Project (https://github.com/JeffSackmann/tennis_MatchChartingProject),
// licensed CC BY-NC-SA 4.0: these numbers are under the same licence, for non-commercial use with attribution.
// s1 first-serve speed (m/s), set by aces · serr, serr2 first- and second-serve error scale, by first serves in and double
// faults · rerr return error scale, by return points won · err error scale, by errors per shot · power, by winners per
// shot · aggr risk, from the aggression score ((winners + errors) per shot) · sv, net, drop, slice, lob: how often
// he serve-volleys, comes in, drops, slices and lobs, by how often he really does. See docs/players.
const FITTED={\n${order.map(k=>` ${JSON.stringify(k)}:${JSON.stringify(fit[k])},`).join('\n')}\n};\n`;
  fs.writeFileSync(path.join(ROOT,'src','players','fitted.js'),head);
  fs.writeFileSync(path.join(ROOT,'data','fit-report.json'),JSON.stringify({rounds:ROUNDS,sets:SETS,tourInGame:{winners:+(tg.winners*100).toFixed(1),errors:+(tg.errors*100).toFixed(1),returnWon:+(tg.returnWon*100).toFixed(1)},tour:Object.fromEntries(KEYS.concat(NUM).map(k=>[k,+(+tour[k]).toFixed(3)])),players:Object.fromEntries(order.map(k=>[k,report[k]]))},null,1)+'\n');
  console.log('\nplayer      '+['ace','df','firstIn','firstWon','secondWon','returnWon','snv','net','drop','slice','lob','winnersVsTour','errorsVsTour'].map(k=>k.slice(0,7).padStart(13)).join(''));
  for(const k of order){const r=report[k];console.log(k.padEnd(12)+['ace','df','firstIn','firstWon','secondWon','returnWon','snv','net','drop','slice','lob','winnersVsTour','errorsVsTour'].map(x=>`${r.game[x].toFixed(1)}/${r.real[x].toFixed(1)}`.padStart(13)).join(''));}
  log('written src/players/fitted.js and data/fit-report.json');
})();
