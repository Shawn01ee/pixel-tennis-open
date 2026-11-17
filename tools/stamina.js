// Plays best-of-five matches headless and checks the fatigue model against Grand Slam data, set by set.
//   node tools/stamina.js [matches, default 120]
// Writes docs/stamina/run.json and the charts docs/stamina/{energy,serve}-{light,dark}.svg. What it measures:
//   calibration  the running work and stroke cost of an average five-set match (Stamina.LEGS and Stamina.ARM)
//   by set       first-serve speed, first serves in, errors per point, distance per point and rally pace in the
//                matches that went five sets, for the winners and the losers
//   so what      the same seeds played again with every fatigue effect switched off: what fatigue changes
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'docs','stamina');
const{loadSim}=require(path.join(ROOT,'tests','load'));
const{Match,ROSTER,MatchFormat,Stamina,rng}=loadSim(['Match','ROSTER','MatchFormat','Stamina','rng']);
const N=+(process.argv[2])||120,EFFECT=JSON.parse(JSON.stringify(Stamina.EFFECT));
if(process.argv[2]==='--doc'){const run=JSON.parse(fs.readFileSync(path.join(OUT,'run.json'),'utf8'));run.control=control();fs.writeFileSync(path.join(OUT,'run.json'),JSON.stringify(run,null,1)+'\n');writeDoc(run);console.log('control:',JSON.stringify(run.control));process.exit(0);}
const effects=on=>{for(const k in EFFECT)for(const j in EFFECT[k])Stamina.EFFECT[k][j]=on?EFFECT[k][j]:0;};
// one match, with everything measured per set
function play(a,b,seed,trace){
  rng.s=seed;const m=new Match({a,b,format:MatchFormat.get('bo5')});let n=0;
  const P=m.players,sets=[],cur=()=>P.map(p=>({sv:[],arm:[],kind:[],sv1:p.ms.sv1,in1:p.ms.sv1in,ue:p.ms.ue,pts:p.ms.pts,dist:p.sta.dist,gaps:[]}));
  let S=cur(),lastHit=null,pts=-1;
  const close=()=>{const tot=P[0].ms.pts+P[1].ms.pts-S[0].pts-S[1].pts;
    sets.push(S.map((x,i)=>({sv:x.sv,arm:x.arm,kind:x.kind,sv1:P[i].ms.sv1-x.sv1,in1:P[i].ms.sv1in-x.in1,ue:P[i].ms.ue-x.ue,pts:tot,dist:P[i].sta.dist-x.dist,gaps:x.gaps})));S=cur();};
  while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&n<150*60*600){
    m.tick();n++;
    for(const e of m.events)if(e.type==='hit'){
      // each first serve: its speed, the server's arm store (as the effect reads it) and the type of serve
      if(e.kind==='serve'){if(m.serveLabel==='1st'){const x=S[e.who];x.sv.push(e.v*3.6);x.arm.push(Math.min(1.5,P[e.who].sta.arm));x.kind.push(m.serveKind);}lastHit=m.t;}
      else{if(lastHit!=null)S[0].gaps.push(m.t-lastHit);lastHit=m.t;}
    }
    m.events.length=0;
    if(m.score&&m.score.done.length>sets.length)close();
    if(trace&&m.score){const p=P[0].ms.pts+P[1].ms.pts;if(p!==pts){pts=p;trace(m,p);}}
  }
  return{m,sets,w:m.result?m.result.w:0};
}
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:NaN,pairs=[];
// each player against an identical copy of himself: skill is equal, so whatever separates them late in a match is
// what the match has taken out of them, and about three matches in eight go the full five sets
for(let k=0;k<N;k++){const a=ROSTER[k%ROSTER.length];pairs.push([a,a,2000+k]);}
// ── fatigue on ──
effects(true);const on=pairs.map(([a,b,s])=>play(a,b,s));
const five=on.filter(r=>r.sets.length===5);
// calibration: the running work and stroke cost at the end of a five-setter, per player, with the 95% margin of the
// mean in % (taken over matches, since the two players of one match are not independent)
const work=[],cost=[];for(const r of five){const p=r.m.players;work.push((p[0].sta.work+p[1].sta.work)/2);cost.push((p[0].sta.cost+p[1].sta.cost)/2);}
const m95=a=>{const u=mean(a),sd=Math.sqrt(a.reduce((s,v)=>s+(v-u)**2,0)/Math.max(1,a.length-1));return+(196*sd/Math.sqrt(a.length)/u).toFixed(1);};
const calibration={fiveSetters:five.length,of:N,work:Math.round(mean(work)),cost:Math.round(mean(cost)),workMargin:m95(work),costMargin:m95(cost),LEGS:Stamina.LEGS,ARM:Stamina.ARM};
if(process.argv[3]==='calibrate'){console.log(JSON.stringify(calibration));process.exit(0);}
// by set, over the five-setters: everyone, the winners, the losers
function bySet(rows,who){
  return[0,1,2,3,4].map(s=>{const pick=r=>who==='all'?[0,1]:who==='w'?[r.w]:[1-r.w];
    const sv=[],in1=[0,0],ue=[0,0],dist=[0,0],gaps=[];
    for(const r of rows){const st=r.sets[s];for(const i of pick(r)){sv.push(...st[i].sv);in1[0]+=st[i].in1;in1[1]+=st[i].sv1;ue[0]+=st[i].ue;ue[1]+=st[i].pts;dist[0]+=st[i].dist;dist[1]+=st[i].pts;}gaps.push(...st[0].gaps);}
    return{serve:+mean(sv).toFixed(1),firstIn:+(in1[0]/in1[1]*100).toFixed(1),errPerPoint:+(ue[0]/ue[1]).toFixed(3),mPerPoint:+(dist[0]/dist[1]).toFixed(1),pace:+mean(gaps.filter(g=>g<3)).toFixed(3)};});
}
const sets={all:bySet(five,'all'),winners:bySet(five,'w'),losers:bySet(five,'l')};
// first serves, set 1 against set 5: the change overall, the change within each serve type (at the set-1 mix of types,
// so overall minus within is what the change of mix does), and what the arm store predicts (e: EFFECT.serveV.arm in
// force). 95% intervals from resampling the matches
function serveTrace(rows,e){
  const one=rs=>{
    const g=[0,4].map(s=>{const by={};let n=0,arm=0;for(const r of rs)for(const i of[0,1]){const st=r.sets[s][i];st.sv.forEach((v,j)=>{(by[st.kind[j]]=by[st.kind[j]]||[]).push(v);arm+=st.arm[j];n++;});}return{by,n,arm:arm/n};});
    let a=0,b=0;for(const k in g[0].by)if(g[1].by[k]){const w=g[0].by[k].length;a+=w*mean(g[1].by[k]);b+=w*mean(g[0].by[k]);}
    const all=s=>[].concat(...Object.values(g[s].by));
    return{overall:(mean(all(1))/mean(all(0))-1)*100,within:(a/b-1)*100,arm1:g[0].arm,arm5:g[1].arm,g};
  };
  // how much more the match losers' serve changes than the winners' (Martin 2019: losers −2.4%, winners +0.2%)
  const gap=rs=>{const ch=lose=>{const a=[[],[]];for(const r of rs){const i=lose?1-r.w:r.w;a[0].push(...r.sets[0][i].sv);a[1].push(...r.sets[4][i].sv);}return(mean(a[1])/mean(a[0])-1)*100;};return ch(true)-ch(false);};
  const est=one(rows),boot={overall:[],within:[],gap:[]};let seed=12345;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
  for(let k=0;k<400;k++){const rs=rows.map(()=>rows[Math.floor(rnd()*rows.length)]),q=one(rs);boot.overall.push(q.overall);boot.within.push(q.within);boot.gap.push(gap(rs));}
  const ci=a=>{a.sort((p,q)=>p-q);return[+a[Math.floor(.025*a.length)].toFixed(2),+a[Math.ceil(.975*a.length)-1].toFixed(2)];};
  const kinds=[...new Set([...Object.keys(est.g[0].by),...Object.keys(est.g[1].by)])];
  return{matches:rows.length,overall:+est.overall.toFixed(2),overallCI:ci(boot.overall),within:+est.within.toFixed(2),withinCI:ci(boot.within),gap:+gap(rows).toFixed(2),gapCI:ci(boot.gap),
    arm1:+est.arm1.toFixed(3),arm5:+est.arm5.toFixed(3),expected:+(((1-e*est.arm5)/(1-e*est.arm1)-1)*100).toFixed(2),
    mix:kinds.map(k=>({kind:k,set1:+((est.g[0].by[k]||[]).length/est.g[0].n*100).toFixed(1),set5:+((est.g[1].by[k]||[]).length/est.g[1].n*100).toFixed(1)}))};
}
const trace={on:serveTrace(five,EFFECT.serveV.arm)};
// ── the same seeds, fatigue off: what it changes ──
effects(false);const off=pairs.map(([a,b,s])=>play(a,b,s));effects(true);
trace.off=serveTrace(off.filter(r=>r.sets.length===5),0);
// in each fifth set, did the player who had run further in sets 1–4 win it?
function fifth(rows){let n=0,won=0;for(const r of rows){if(r.sets.length<5)continue;const d=[0,1].map(i=>r.sets.slice(0,4).reduce((s,st)=>s+st[i].dist,0));n++;if(r.w===(d[0]>d[1]?0:1))won++;}return{fiveSetters:n,ranMoreWonFifth:+(won/Math.max(1,n)*100).toFixed(1)};}
const late=(rows,who)=>{const b=bySet(rows.filter(r=>r.sets.length===5),who);return{serve:+((b[4].serve/b[0].serve-1)*100).toFixed(2),firstIn:+(b[4].firstIn-b[0].firstIn).toFixed(1),err:+((b[4].errPerPoint/b[0].errPerPoint-1)*100).toFixed(1),pace:+((b[4].pace/b[0].pace-1)*100).toFixed(1)};};
const sowhat={};for(const[k,rows]of[['on',on],['off',off]])sowhat[k]={...fifth(rows),all:late(rows,'all'),winners:late(rows,'w'),losers:late(rows,'l')};
// endurance: each player against a copy of himself one SD fitter (Stamina.SD); the fitter copy is player 0
const fitter=p=>Object.assign(Object.create(Object.getPrototypeOf(p)),p,{end:1+Stamina.SD});
const endu=pairs.slice(0,Math.ceil(N/2)).map(([a,,s])=>play(fitter(a),a,s+50000));
{let n5=0,w5=0,w=0,gap=[];for(const r of endu){if(r.w===0)w++;if(r.sets.length===5){n5++;if(r.w===0)w5++;}const P=r.m.players;gap.push(P[1].sta.energy-P[0].sta.energy);}
 sowhat.endurance={matches:endu.length,fitterWon:+(w/endu.length*100).toFixed(1),fiveSetters:n5,fitterWonFifth:+(w5/Math.max(1,n5)*100).toFixed(1),energyGapAtEnd:+(mean(gap)*-100).toFixed(1)};}
// ── the energy chart: one five-setter between two players a step apart in rank ──
let series=null,match=null;
for(let seed=1;seed<80&&!series;seed++){
  const rows=[],marks=[];
  const r=play(ROSTER.find(p=>p.short==='Zverev'),ROSTER.find(p=>p.short==='Medvedev'),seed,(m,p)=>{rows.push({p,e:m.players.map(P=>+(P.sta.energy*100).toFixed(1))});if(m.score.done.length>marks.length)marks.push(p);});
  if(r.sets.length===5){series=rows;match={seed,line:r.m.result.line,winner:r.m.result.winner.short,sets:marks.slice(0,4),points:rows[rows.length-1].p,
    players:r.m.players.map(P=>({short:P.short,dist:Math.round(P.sta.dist),energy:Math.round(P.sta.energy*100),legs:+P.sta.legs.toFixed(2),arm:+P.sta.arm.toFixed(2)}))};}
}
// ── charts ──
const THEMES={light:{bg:'#fcfcfb',ink:'#0b0b0b',sub:'#52514e',grid:'#e4e3df',s:['#2a78d6','#eb6834']},dark:{bg:'#1a1a19',ink:'#f0efec',sub:'#c3c2b7',grid:'#383835',s:['#3987e5','#d95926']}};
const FONT='font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif"';
function energyChart(th){
  const W=760,H=400,L=52,Rm=150,T=92,B=48,pw=W-L-Rm,ph=H-T-B,last=series[series.length-1].p,X=p=>L+pw*p/last,Y=v=>T+ph*(1-v/100);let g='';
  for(let v=0;v<=100;v+=25)g+=`<line x1="${L}" x2="${L+pw}" y1="${Y(v)}" y2="${Y(v)}" stroke="${th.grid}"/><text x="${L-8}" y="${Y(v)+4}" text-anchor="end" font-size="12" fill="${th.sub}">${v}%</text>`;
  for(let p=0;p<=last;p+=50)g+=`<text x="${X(p)}" y="${T+ph+18}" text-anchor="middle" font-size="12" fill="${th.sub}">${p}</text>`;
  const edges=[0,...match.sets,last];edges.slice(1,-1).forEach(p=>g+=`<line x1="${X(p)}" x2="${X(p)}" y1="${T}" y2="${T+ph}" stroke="${th.grid}" stroke-dasharray="3 3"/>`);
  for(let i=0;i<5;i++)g+=`<text x="${(X(edges[i])+X(edges[i+1]))/2}" y="${T-6}" text-anchor="middle" font-size="12" fill="${th.sub}">Set ${i+1}</text>`;
  const P=match.players,lines=[0,1].map(i=>`<polyline points="${series.map(r=>`${X(r.p).toFixed(1)},${Y(r.e[i]).toFixed(1)}`).join(' ')}" fill="none" stroke="${th.s[i]}" stroke-width="2" stroke-linejoin="round"/>`).join('');
  const end=[0,1].map(i=>series[series.length-1].e[i]);let ys=end.map(v=>Y(v)+4);if(Math.abs(ys[0]-ys[1])<16){const mid=(ys[0]+ys[1])/2,s=ys[0]<ys[1]?-1:1;ys=[mid+8*s,mid-8*s];}
  const lab=[0,1].map(i=>`<circle cx="${X(last)}" cy="${Y(end[i])}" r="4" fill="${th.s[i]}" stroke="${th.bg}" stroke-width="2"/><text x="${X(last)+10}" y="${ys[i]}" font-size="13" fill="${th.ink}"><tspan font-weight="600">${P[i].short}</tspan> ${Math.round(end[i])}%</text>`).join('');
  const legend=P.map((q,i)=>`<line x1="${L+i*290}" x2="${L+i*290+18}" y1="58" y2="58" stroke="${th.s[i]}" stroke-width="2"/><text x="${L+i*290+24}" y="62" font-size="12" fill="${th.ink}">${q.short} · ran ${(q.dist/1000).toFixed(2)} km</text>`).join('');
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FONT} role="img" aria-label="Energy left after each point of a five-set match">
<rect width="${W}" height="${H}" fill="${th.bg}"/>
<text x="${L}" y="22" font-size="16" font-weight="600" fill="${th.ink}">How two players wear down over five sets</text>
<text x="${L}" y="40" font-size="12" fill="${th.sub}">Energy left after each point (half match-long reserve, half breath) · ${match.winner} won ${match.line}</text>
${legend}${g}${lines}${lab}
<text x="${L+pw/2}" y="${H-10}" text-anchor="middle" font-size="12" fill="${th.sub}">points played</text>
</svg>\n`;
}
// first-serve speed by set against set 1: the game's winners and losers, and the 2014 Grand Slam five-setters
// (Martin 2019: losers −1.2 m/s from set 1 to set 5, winners unchanged; sets 2–4 read from their Figure 2a)
const REAL={w:[51.1,50.8,50.8,50.8,51.2],l:[51.0,50.6,50.2,50.0,49.8]};
function serveChart(th){
  const W=760,H=380,L=56,Rm=190,T=76,B=48,pw=W-L-Rm,ph=H-T-B,rel=a=>a.map(v=>(v/a[0]-1)*100);
  const sr={gw:rel(sets.winners.map(s=>s.serve)),gl:rel(sets.losers.map(s=>s.serve)),rw:rel(REAL.w),rl:rel(REAL.l)};
  const all=[].concat(...Object.values(sr)),lo=Math.min(-3,Math.floor(Math.min(...all))),hi=Math.max(1,Math.ceil(Math.max(...all)));
  const X=i=>L+pw*i/4,Y=v=>T+ph*(hi-v)/(hi-lo);let g='';
  for(let v=lo;v<=hi;v++)g+=`<line x1="${L}" x2="${L+pw}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v===0?th.sub:th.grid}"/><text x="${L-8}" y="${Y(v)+4}" text-anchor="end" font-size="12" fill="${th.sub}">${v>0?'+':''}${v}%</text>`;
  for(let i=0;i<5;i++)g+=`<text x="${X(i)}" y="${T+ph+18}" text-anchor="middle" font-size="12" fill="${th.sub}">Set ${i+1}</text>`;
  const line=(a,c,dash)=>`<polyline points="${a.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="2" ${dash?'stroke-dasharray="6 4"':''} stroke-linejoin="round"/>`+a.map((v,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="4" fill="${dash?th.bg:c}" stroke="${c}" stroke-width="2"/>`).join('');
  const lab=[[sr.gw,'Game, winners'],[sr.gl,'Game, losers'],[sr.rw,'Grand Slams, winners'],[sr.rl,'Grand Slams, losers']].map(([a,t])=>({y:Y(a[4]),t,v:a[4]})).sort((p,q)=>p.y-q.y);
  for(let i=1;i<lab.length;i++)if(lab[i].y-lab[i-1].y<15)lab[i].y=lab[i-1].y+15;
  const labs=lab.map(q=>`<text x="${X(4)+12}" y="${q.y+4}" font-size="12" fill="${th.ink}">${q.t} <tspan fill="${th.sub}">${q.v>=0?'+':''}${q.v.toFixed(1)}%</tspan></text>`).join('');
  const legend=`<line x1="${L}" x2="${L+22}" y1="58" y2="58" stroke="${th.sub}" stroke-width="2"/><text x="${L+28}" y="62" font-size="12" fill="${th.ink}">this game (${five.length} five-setters)</text><line x1="${L+220}" x2="${L+242}" y1="58" y2="58" stroke="${th.sub}" stroke-width="2" stroke-dasharray="6 4"/><text x="${L+248}" y="62" font-size="12" fill="${th.ink}">2014 Grand Slams, 50 five-setters (Martin et al. 2019)</text>`;
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FONT} role="img" aria-label="First-serve speed by set relative to the first set, winners and losers, in the game and in Grand Slam five-set matches">
<rect width="${W}" height="${H}" fill="${th.bg}"/>
<text x="${L}" y="22" font-size="16" font-weight="600" fill="${th.ink}">First-serve speed over a five-setter</text>
<text x="${L}" y="40" font-size="12" fill="${th.sub}">Average first serve in each set, against the first set · blue: the match winner · orange: the loser</text>
${legend}${g}${line(sr.rw,th.s[0],true)}${line(sr.rl,th.s[1],true)}${line(sr.gw,th.s[0],false)}${line(sr.gl,th.s[1],false)}${labs}
</svg>\n`;
}
fs.mkdirSync(OUT,{recursive:true});
for(const k in THEMES){fs.writeFileSync(path.join(OUT,`energy-${k}.svg`),energyChart(THEMES[k]));fs.writeFileSync(path.join(OUT,`serve-${k}.svg`),serveChart(THEMES[k]));}
const run={matches:N,control:control(),calibration,sets,trace,sowhat,match,constants:{CP:+Stamina.CP.toFixed(2),WP:+Stamina.WP.toFixed(0),FAST:Stamina.FAST,SLOW:Stamina.SLOW,LEGS:Stamina.LEGS,ARM:Stamina.ARM,V_REF:Stamina.V_REF,EFFECT}};
fs.writeFileSync(path.join(OUT,'run.json'),JSON.stringify(run,null,1)+'\n');
writeDoc(run);
const t=(name,b)=>console.log(`${name.padEnd(8)} serve ${b.map(s=>s.serve).join(' ')} · 1st in ${b.map(s=>s.firstIn).join(' ')} · err/pt ${b.map(s=>s.errPerPoint).join(' ')} · m/pt ${b.map(s=>s.mPerPoint).join(' ')} · pace ${b.map(s=>s.pace).join(' ')}`);
console.log(`calibration: ${five.length} five-setters of ${N} · work ${calibration.work} J/kg (LEGS ${Stamina.LEGS}) · stroke cost ${calibration.cost} (ARM ${Stamina.ARM})`);
t('all',sets.all);t('winners',sets.winners);t('losers',sets.losers);
console.log('serve trace:',JSON.stringify(trace));
console.log('so what:',JSON.stringify(sowhat));
console.log(`chart: ${match.players.map(p=>`${p.short} ${p.energy}% left, ${p.dist} m`).join(' · ')} · ${match.winner} won ${match.line}`);

// a controlled check: the same seeds with the arm store held at 0 and at 1, everything else equal
function control(){
  const sv=arm=>{const v=[];for(let k=0;k<16;k++){rng.s=500+k;const a=ROSTER[k%ROSTER.length],m=new Match({a,b:a,format:MatchFormat.get('one')});let n=0;
    while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&n<150*60*60){for(const P of m.players)P.sta.arm=arm;m.tick();n++;
      for(const e of m.events)if(e.type==='hit'&&e.kind==='serve'&&m.serveLabel==='1st')v.push(e.v*3.6);m.events.length=0;}}return v.reduce((s,x)=>s+x,0)/v.length;};
  const a0=sv(0),a1=sv(1);return{serveFresh:+a0.toFixed(2),serveArm1:+a1.toFixed(2),change:+((a1/a0-1)*100).toFixed(2)};
}
// the serve-speed paragraph: the change over the match, then where it comes from, every statement from the run's numbers
function serveText(run,fmt){
  const T=run.trace&&run.trace.on,T0=run.trace&&run.trace.off,K=run.control,A=run.sets.all,REAL=-1.43;
  const sv=T?T.overall:(A[4].serve/A[0].serve-1)*100,ci=c=>`${fmt(c[0],2)} to ${fmt(c[1],2)}`,inCI=(x,c)=>x>=c[0]&&x<=c[1];
  let s=`- **Serve speed.** The game's first serves change by ${fmt(sv,2)} from set 1 to set 5${T?` (95% interval over the ${T.matches} five-setters: ${ci(T.overallCI)})`:''}. `+
    `The real five-setters show −0.5% to −2.4%, −1.43% combined, the figure the game is built on. The game's change is ${Math.abs(sv)<.5?'smaller than any of them':Math.abs(sv)>2.4?'larger than any of them':'inside their range'}`+
    `${T?`, and −1.43% is ${inCI(REAL,T.overallCI)?'inside':'outside'} the game's interval`:''}.`;
  if(T)s+=`\n  *Where the change comes from.* Within each type of serve, at the set-1 mix of types, first serves change by ${fmt(T.within,2)} (${ci(T.withinCI)})`+
    `${T0?`, and by ${fmt(T0.within,2)} (${ci(T0.withinCI)}) with fatigue off`:''}. The server's arm store averages ${T.arm1} at the first serves of set 1 and ${T.arm5} in set 5, `+
    `so the model expects ${fmt(T.expected,2)}, ${inCI(T.expected,T.withinCI)?'inside':'outside'} the within-type interval. The rest of the overall change, ${fmt(T.overall-T.within,2,' points')}, `+
    `is the change in the mix of serves (share of first serves, set 1 → set 5: ${T.mix.map(q=>`${q.kind} ${q.set1}% → ${q.set5}%`).join(', ')}).`;
  if(K)s+=` In a controlled check (the same matches with the arm store held at 0 and at 1, all else equal), first serves change by ${fmt(K.change,2)} at 1 (${K.serveFresh} → ${K.serveArm1} km/h).`;
  return s;
}
// the results section of docs/stamina/README.md, between its markers. Every statement is worked out from the numbers
// of the run: nothing is written in advance, and a difference is called one only when it is outside the run's margin
function writeDoc(run){
  const{sets:{all:A,winners:W,losers:L},sowhat:S,match,calibration:C,matches:N}=run,E=S.endurance,F=C.fiveSetters,K=run.control;
  const ch=(b,k,d=1)=>(b[4][k]/b[0][k]-1)*100,fmt=(x,d=1,u='%')=>{const r=+x.toFixed(d);return`${r>=0?'+':''}${r.toFixed(d)}${u}`;},pp=(b,k)=>b[4][k]-b[0][k],row=a=>`| ${a.join(' | ')} |`;
  const margin=n=>196*Math.sqrt(.25/Math.max(1,n));      // 95% margin of a share near one half, in points
  const vsHalf=(x,n)=>Math.abs(x-50)<=margin(n)?`within chance at this sample size (50% ± ${margin(n).toFixed(0)})`:x>50?`more often than chance (50% ± ${margin(n).toFixed(0)})`:`less often than chance (50% ± ${margin(n).toFixed(0)})`;
  // everyone's serve change from the unrounded speeds when the run has them, as in the paragraph below the table
  const T=run.trace,sv=T?T.on.overall:ch(A,'serve',2),svOff=T?T.off.overall:S.off.all.serve,svW=ch(W,'serve',2),svL=ch(L,'serve',2);
  const md=`<!-- RESULTS -->
## What it does in the game

Measured by \`node tools/stamina.js ${N}\`: ${N} best-of-five matches, each player against an identical copy of himself.
Skill is equal, so whatever separates the two late in a match is what the match took out of them. ${F} went five
sets. The same matches were then played again with every fatigue effect switched off. The numbers below are as
measured. Nothing was tuned after looking at them.

### Set 1 against set 5, next to real Grand Slam five-setters

${row(['','Set 1','Set 5','Change','Fatigue off','Real five-setters'])}
${row(['---','---','---','---','---','---'])}
${row(['First-serve speed, everyone',`${A[0].serve} km/h`,`${A[4].serve} km/h`,fmt(sv,2),fmt(svOff,2),'−1.2% (Martin 2019), −2.4% (Cui 2020), −0.5% (Maquirriain 2016)'])}
${row(['First-serve speed, match winners',`${W[0].serve} km/h`,`${W[4].serve} km/h`,fmt(svW,2),fmt(S.off.winners.serve,2),'+0.2% (Martin 2019)'])}
${row(['First-serve speed, match losers',`${L[0].serve} km/h`,`${L[4].serve} km/h`,fmt(svL,2),fmt(S.off.losers.serve,2),'−2.4% (Martin 2019)'])}
${row(['First serves in',`${A[0].firstIn}%`,`${A[4].firstIn}%`,fmt(pp(A,'firstIn'),1,' pts'),fmt(S.off.all.firstIn,1,' pts'),'+1.6, +2, −0.8 pts (Cui 2020; Martin 2019; Maquirriain 2016)'])}
${row(['Errors per point, everyone',A[0].errPerPoint,A[4].errPerPoint,fmt(ch(A,'errPerPoint')),fmt(S.off.all.err),'no significant change across sets (Cui 2020)'])}
${row(['Errors per point, winners / losers',`${W[0].errPerPoint} / ${L[0].errPerPoint}`,`${W[4].errPerPoint} / ${L[4].errPerPoint}`,`${fmt(ch(W,'errPerPoint'))} / ${fmt(ch(L,'errPerPoint'))}`,`${fmt(S.off.winners.err)} / ${fmt(S.off.losers.err)}`,'—'])}
${row(['Distance per point',`${A[0].mPerPoint} m`,`${A[4].mPerPoint} m`,fmt(ch(A,'mPerPoint')),'—','10.3 → 10.6 m (Cui 2020); no difference between sets (Armstrong 2024)'])}
${row(['Time between shots',`${A[0].pace} s`,`${A[4].pace} s`,fmt(ch(A,'pace')),fmt(S.off.all.pace),'1.19 → 1.23 s, +3.4% (Carboch 2018)'])}

<picture><source media="(prefers-color-scheme: dark)" srcset="serve-dark.svg"><img src="serve-light.svg" alt="First-serve speed by set against the first set, for match winners and losers, in the game and in the 2014 Grand Slam five-setters"></picture>

**What the numbers say:**
${serveText(run,fmt)}
  Real winners keep their speed and real losers lose it (Martin 2019). In the game the winners change by ${fmt(svW,2)} and the losers by ${fmt(svL,2)}${T&&T.on.gapCI?`. The losers' change minus the winners' is ${fmt(T.on.gap,2,' points')} (95% interval ${fmt(T.on.gapCI[0],2)} to ${fmt(T.on.gapCI[1],2,' points')}), so ${T.on.gapCI[1]<0?'the game\'s losers slow more, as the real ones do':T.on.gapCI[0]>0?'the game\'s winners slow more, the opposite of the real ones':'this sample cannot tell whether winners or losers slow more'}`:`, ${Math.abs(svL)>Math.abs(svW)?'the same order':'the opposite order'}`}.
- **First serves in** change by ${fmt(pp(A,'firstIn'),1,' points')} (${fmt(S.off.all.firstIn,1,' points')} with fatigue off). The real datasets move by −0.8 to +2 points.
- **Errors per point** change by ${fmt(ch(A,'errPerPoint'))} overall (${fmt(S.off.all.err)} with fatigue off). Real Grand Slam data show no significant change. The eventual winner's change is ${fmt(ch(W,'errPerPoint'))} and the loser's ${fmt(ch(L,'errPerPoint'))}; with fatigue off they are ${fmt(S.off.winners.err)} and ${fmt(S.off.losers.err)}.
- **Distance per point** changes by ${fmt(ch(A,'mPerPoint'))} and **time between shots** by ${fmt(ch(A,'pace'))} (${fmt(S.off.all.pace)} with fatigue off). Carboch & Sklenářik measured +3.4% for the time between shots. The game's distance per point, ${A.map(s=>s.mPerPoint).join(', ')} m in sets 1 to 5, is ${A.every(s=>s.mPerPoint>10.7)?'above the published range (6.46–10.7 m) in every set':A.every(s=>s.mPerPoint>=6.46&&s.mPerPoint<=10.7)?'inside the published range (6.46–10.7 m) in every set':'outside the published range (6.46–10.7 m) in some sets'}.
- **Who wins the fifth set.** The player who had run further in sets 1–4 won ${S.on.ranMoreWonFifth}% of ${F} fifth sets, ${vsHalf(S.on.ranMoreWonFifth,F)}. With fatigue off: ${S.off.ranMoreWonFifth}%.
- **A fitter player.** A copy one standard deviation fitter (Stamina 90) beat his average copy in ${E.fitterWon}% of ${E.matches} matches, ${vsHalf(E.fitterWon,E.matches)}, and in ${E.fitterWonFifth}% of the ${E.fiveSetters} that reached a fifth set, ${vsHalf(E.fitterWonFifth,E.fiveSetters)}. He ended with ${Math.abs(E.energyGapAtEnd)} points ${E.energyGapAtEnd>=0?'more':'less'} energy.

<picture><source media="(prefers-color-scheme: dark)" srcset="energy-dark.svg"><img src="energy-light.svg" alt="Energy left after each point of a five-set match"></picture>

One five-setter from the run, ${match.winner} winning ${match.line}: ${match.players.map(p=>`${p.short} ran ${(p.dist/1000).toFixed(2)} km`).join(', ')}. Each dip is a long rally. The line comes back between points as the breath does.

Calibration in this run: an average five-setter took ${C.work.toLocaleString('en')} J/kg of running and ${C.cost.toLocaleString('en')} of stroke cost. The game uses Stamina.LEGS ${C.LEGS.toLocaleString('en')} and ARM ${C.ARM.toLocaleString('en')}, set from an earlier run of the same measurement. This run differs from them by ${fmt((C.work/C.LEGS-1)*100)} and ${fmt((C.cost/C.ARM-1)*100)}${C.workMargin!=null?`, against a 95% margin of ±${C.workMargin}% and ±${C.costMargin}% on this run's averages: ${Math.abs(C.work/C.LEGS-1)*100<=C.workMargin&&Math.abs(C.cost/C.ARM-1)*100<=C.costMargin?'both inside it':'outside it, so the constants are due to be set again from this measurement'}`:''}.
<!-- /RESULTS -->`;
  const f=path.join(OUT,'README.md');if(fs.existsSync(f)){const t=fs.readFileSync(f,'utf8'),i=t.indexOf('<!-- RESULTS -->'),j=t.indexOf('<!-- /RESULTS -->');
    if(i>=0&&j>i)fs.writeFileSync(f,t.slice(0,i)+md+t.slice(j+'<!-- /RESULTS -->'.length));}
}
