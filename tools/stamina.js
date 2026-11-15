// Plays five-set matches headless and draws how the players tire: docs/stamina/energy-{light,dark}.svg and run.json
//   node tools/stamina.js [calibration matches, default 8] [player] [player]
// The chart follows one five-setter between two players far apart in endurance (Zverev 1.04, Sampras 0.86); the calibration plays matches
// between everyone and scales each player's long-term fatigue to an average-endurance player over 260 points.
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'docs','stamina');
const{loadSim}=require(path.join(ROOT,'tests','load'));
const{Match,ROSTER,MatchFormat,Stamina,rng}=loadSim(['Match','ROSTER','MatchFormat','Stamina','rng']);
const K=+(process.argv[2]||8);
function play(a,b,seed,onPoint){
  rng.s=seed;const m=new Match({a,b,format:MatchFormat.get('bo5')});let n=0,pts=-1;
  while(!(m.stage==='over'&&m.result&&m.tasks.length===0)&&n<150*60*600){
    m.tick();n++;m.events.length=0;
    if(onPoint&&m.score){const p=m.players[0].ms.pts+m.players[1].ms.pts;if(p!==pts){pts=p;onPoint(m,p);}}
  }
  return m;
}
// ── the match in the chart: a close pair a long way apart in endurance, the first seed that goes five sets ──
const who=n=>ROSTER.find(p=>p.short===n),fit=who(process.argv[3]||'Zverev'),weak=who(process.argv[4]||'Sampras');
let series=null,match=null;
for(let seed=1;seed<80&&!series;seed++){
  const rows=[],sets=[];
  const m=play(fit,weak,seed,(m,p)=>{rows.push({p,e:m.players.map(P=>+(P.sta.energy*100).toFixed(1)),legs:m.players.map(P=>+P.sta.legs.toFixed(3)),arm:m.players.map(P=>+P.sta.arm.toFixed(3)),breath:m.players.map(P=>+P.sta.breath.toFixed(3))});
    if(m.score.done.length>sets.length)sets.push(p);});
  if(m.score.done.length===5){series=rows;match={seed,line:m.result.line,winner:m.result.winner.short,sets:sets.slice(0,4),points:rows[rows.length-1].p,
    players:m.players.map(P=>({name:P.st.name,short:P.short,end:P.st.end??1,dist:Math.round(P.sta.dist),energy:Math.round(P.sta.energy*100),legs:+P.sta.legs.toFixed(2),arm:+P.sta.arm.toFixed(2)}))};}
}
// ── calibration: everyone against everyone, scaled to endurance 1 and 260 points ──
const cal=[];
for(let k=0;k<K;k++){
  const a=ROSTER[(k*5+1)%ROSTER.length],b=ROSTER[(k*5+3)%ROSTER.length],m=play(a,b,1000+k);
  const np=m.players[0].ms.pts+m.players[1].ms.pts;
  for(const P of m.players)cal.push({who:P.short,points:np,legs:P.sta.legs*(P.st.end??1)*260/np,arm:P.sta.arm*(P.st.end??1)*260/np,perPoint:P.sta.dist/np});
}
const mean=f=>cal.reduce((s,c)=>s+f(c),0)/cal.length;
const calibration={matches:K,legs260:+mean(c=>c.legs).toFixed(2),arm260:+mean(c=>c.arm).toFixed(2),metresPerPoint:+mean(c=>c.perPoint).toFixed(1)};
// ── the chart ──
const THEMES={light:{bg:'#fcfcfb',ink:'#0b0b0b',sub:'#52514e',grid:'#e4e3df',s:['#2a78d6','#eb6834']},dark:{bg:'#1a1a19',ink:'#f0efec',sub:'#c3c2b7',grid:'#383835',s:['#3987e5','#d95926']}};
const FONT='font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif"';
function chart(th){
  const W=760,H=400,L=52,Rm=150,T=92,B=48,pw=W-L-Rm,ph=H-T-B,last=series[series.length-1].p;
  const X=p=>L+pw*p/last,Y=v=>T+ph*(1-v/100);let g='';
  for(let v=0;v<=100;v+=25)g+=`<line x1="${L}" x2="${L+pw}" y1="${Y(v)}" y2="${Y(v)}" stroke="${th.grid}"/><text x="${L-8}" y="${Y(v)+4}" text-anchor="end" font-size="12" fill="${th.sub}">${v}%</text>`;
  for(let p=0;p<=last;p+=50)g+=`<text x="${X(p)}" y="${T+ph+18}" text-anchor="middle" font-size="12" fill="${th.sub}">${p}</text>`;
  // set ends: faint verticals, the set number between them
  const edges=[0,...match.sets,last];
  edges.slice(1,-1).forEach(p=>g+=`<line x1="${X(p)}" x2="${X(p)}" y1="${T}" y2="${T+ph}" stroke="${th.grid}" stroke-dasharray="3 3"/>`);
  for(let i=0;i<5;i++)g+=`<text x="${(X(edges[i])+X(edges[i+1]))/2}" y="${T-6}" text-anchor="middle" font-size="12" fill="${th.sub}">Set ${i+1}</text>`;
  const P=match.players,lines=[0,1].map(i=>`<polyline points="${series.map(r=>`${X(r.p).toFixed(1)},${Y(r.e[i]).toFixed(1)}`).join(' ')}" fill="none" stroke="${th.s[i]}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
  // direct labels at the line ends, kept apart
  const end=[0,1].map(i=>series[series.length-1].e[i]);let y0=Y(end[0])+4,y1=Y(end[1])+4;if(Math.abs(y0-y1)<16){const mid=(y0+y1)/2,s=y0<y1?-1:1;y0=mid+8*s;y1=mid-8*s;}
  const lab=[y0,y1].map((y,i)=>`<circle cx="${X(last)}" cy="${Y(end[i])}" r="4" fill="${th.s[i]}" stroke="${th.bg}" stroke-width="2"/><text x="${X(last)+10}" y="${y}" font-size="13" fill="${th.ink}"><tspan font-weight="600">${P[i].short}</tspan> ${Math.round(end[i])}%</text>`).join('');
  const legend=P.map((q,i)=>`<line x1="${L+i*290}" x2="${L+i*290+18}" y1="58" y2="58" stroke="${th.s[i]}" stroke-width="2"/><text x="${L+i*290+24}" y="62" font-size="12" fill="${th.ink}">${q.short} · endurance ${q.end.toFixed(2)} · ran ${(q.dist/1000).toFixed(2)} km</text>`).join('');
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FONT} role="img" aria-label="Energy left over a five-set match, ${P[0].short} against ${P[1].short}">
<rect width="${W}" height="${H}" fill="${th.bg}"/>
<text x="${L}" y="22" font-size="16" font-weight="600" fill="${th.ink}">How the players wear down over five sets</text>
<text x="${L}" y="40" font-size="12" fill="${th.sub}">Energy left after each point (legs, arm and breath together) · ${match.winner} won ${match.line}</text>
${legend}${g}${lines}${lab}
<text x="${L+pw/2}" y="${H-10}" text-anchor="middle" font-size="12" fill="${th.sub}">points played</text>
</svg>\n`;
}
fs.mkdirSync(OUT,{recursive:true});
for(const k in THEMES)fs.writeFileSync(path.join(OUT,`energy-${k}.svg`),chart(THEMES[k]));
fs.writeFileSync(path.join(OUT,'run.json'),JSON.stringify({match,calibration,constants:{CP:Stamina.CP,WP:Stamina.WP,LEGS:Stamina.LEGS,ARM:Stamina.ARM,TAU_B:Stamina.TAU_B,SEAT:Stamina.SEAT,EFFECT:Stamina.EFFECT}},null,1)+'\n');
console.log(`chart: ${match.players.map(p=>`${p.short} ${p.energy}% left, ${p.dist} m`).join(' · ')} · ${match.winner} won ${match.line} (seed ${match.seed}, ${match.points} points)`);
console.log(`calibration over ${K} matches: legs ${calibration.legs260}, arm ${calibration.arm260} at 260 points for endurance 1 · ${calibration.metresPerPoint} m a point`);
