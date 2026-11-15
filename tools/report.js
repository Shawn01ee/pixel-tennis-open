// Draws the training record: training/history.json and src/players/learned.js → training/README.md and its charts.
//   node tools/report.js
// The charts are plain SVG written by hand here (no dependencies), one for light pages and one for dark.
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'training');
const hist=JSON.parse(fs.readFileSync(path.join(OUT,'history.json'),'utf8'));
const LEARNED=JSON.parse(fs.readFileSync(path.join(ROOT,'src','players','learned.js'),'utf8').replace(/^[\s\S]*?const LEARNED=/,'').replace(/;\s*$/,''));
const THEMES={light:{bg:'#fcfcfb',ink:'#0b0b0b',sub:'#52514e',grid:'#e4e3df',series:'#2a78d6'},dark:{bg:'#1a1a19',ink:'#f0efec',sub:'#c3c2b7',grid:'#383835',series:'#3987e5'}};
const FONT='font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif"';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
// ── chart 1: how much the learning is worth, against the training done ──
function curve(th){
  const W=760,H=360,L=56,Rm=96,T=56,B=48,pw=W-L-Rm,ph=H-T-B,xs=hist.map(h=>h.round),ys=hist.map(h=>h.overall);
  const x1=Math.max(1,...xs),lo=Math.min(48,Math.floor(Math.min(...ys))-1),hi=Math.max(56,Math.ceil(Math.max(...ys))+2);
  const X=r=>L+pw*r/x1,Y=v=>T+ph*(1-(v-lo)/(hi-lo)),step=(hi-lo)>12?4:2;let g='';
  for(let v=Math.ceil(lo/step)*step;v<=hi;v+=step)g+=`<line x1="${L}" x2="${L+pw}" y1="${Y(v)}" y2="${Y(v)}" stroke="${th.grid}" stroke-width="1"/><text x="${L-8}" y="${Y(v)+4}" text-anchor="end" font-size="12" fill="${th.sub}">${v}%</text>`;
  const every=Math.max(1,Math.ceil(x1/10));for(let r=0;r<=x1;r+=every)g+=`<text x="${X(r)}" y="${T+ph+18}" text-anchor="middle" font-size="12" fill="${th.sub}">${r}</text>`;
  const pts=hist.map(h=>`${X(h.round).toFixed(1)},${Y(h.overall).toFixed(1)}`).join(' '),last=hist[hist.length-1];
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FONT} role="img" aria-label="Share of points trained players win against untrained twins, by rounds of self-play">
<rect width="${W}" height="${H}" fill="${th.bg}"/>
<text x="${L}" y="24" font-size="16" font-weight="600" fill="${th.ink}">What the learning is worth</text>
<text x="${L}" y="42" font-size="12" fill="${th.sub}">Share of points a trained player wins against an untrained twin of itself · all ${Object.keys(last.players).length} players</text>
${g}
<line x1="${L}" x2="${L+pw}" y1="${Y(50)}" y2="${Y(50)}" stroke="${th.sub}" stroke-width="1" stroke-dasharray="4 4"/>
<text x="${L+pw+8}" y="${Y(50)+4}" font-size="12" fill="${th.sub}">no learning</text>
<polyline points="${pts}" fill="none" stroke="${th.series}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
${hist.map(h=>`<circle cx="${X(h.round).toFixed(1)}" cy="${Y(h.overall).toFixed(1)}" r="4" fill="${th.series}" stroke="${th.bg}" stroke-width="2"><title>round ${h.round} · ${h.overall}% of points · ${h.date}</title></circle>`).join('')}
<text x="${X(last.round)+10}" y="${Y(last.overall)+5}" font-size="14" font-weight="600" fill="${th.ink}">${last.overall}%</text>
<text x="${L+pw/2}" y="${H-10}" text-anchor="middle" font-size="12" fill="${th.sub}">rounds of self-play (every player meets every other twice a round)</text>
</svg>\n`;
}
// ── chart 2: the latest measurement, player by player ──
function bars(th){
  const last=hist[hist.length-1],rows=Object.entries(last.players).sort((a,b)=>b[1]-a[1]),W=760,L=110,Rm=70,T=56,rh=24,H=T+rows.length*rh+34,pw=W-L-Rm;
  const lo=Math.min(46,Math.floor(Math.min(...rows.map(r=>r[1])))-1),hi=Math.max(58,Math.ceil(Math.max(...rows.map(r=>r[1])))+1),X=v=>L+pw*(v-lo)/(hi-lo);let g='';
  for(let v=Math.ceil(lo/2)*2;v<=hi;v+=2)g+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T-4}" y2="${T+rows.length*rh}" stroke="${v===50?th.sub:th.grid}" stroke-width="1"${v===50?' stroke-dasharray="4 4"':''}/><text x="${X(v)}" y="${T+rows.length*rh+16}" text-anchor="middle" font-size="12" fill="${th.sub}">${v}%</text>`;
  rows.forEach(([n,v],i)=>{const y=T+i*rh+4,a=Math.min(X(50),X(v)),w=Math.max(2,Math.abs(X(v)-X(50)));
    g+=`<text x="${L-10}" y="${y+12}" text-anchor="end" font-size="13" fill="${th.ink}">${esc(n)}</text><rect x="${a.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${rh-8}" rx="3" fill="${th.series}"><title>${esc(n)}: ${v}%</title></rect><text x="${(v>=50?X(v)+6:X(v)-6).toFixed(1)}" y="${y+12}" text-anchor="${v>=50?'start':'end'}" font-size="12" fill="${th.ink}">${v.toFixed(1)}%</text>`;});
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FONT} role="img" aria-label="Share of points each trained player wins against its untrained twin">
<rect width="${W}" height="${H}" fill="${th.bg}"/>
<text x="16" y="24" font-size="16" font-weight="600" fill="${th.ink}">Who gained most from training</text>
<text x="16" y="42" font-size="12" fill="${th.sub}">Points won against an untrained twin · after round ${last.round} · the dashed line is no learning</text>
${g}
</svg>\n`;
}
// ── the playbook: what each player came to prefer and to avoid ──
const WHERE={c:'opponent covering cross-court',m:'opponent in the middle',l:'opponent caught on the line side'},WING={fh:'forehand',bh:'backhand'},CT={r:'right court',l:'left court'};
function sitName(s){let m;
  if(m=s.match(/^serve([12])([rl])$/))return`${m[1]==='1'?'First':'Second'} serve placement, ${CT[m[2]]}`;
  if(m=s.match(/^stype([12])([rl])$/))return`${m[1]==='1'?'First':'Second'} serve type, ${CT[m[2]]}`;
  if(m=s.match(/^return([12])(v?)$/))return`Return of a ${m[1]==='1'?'first':'second'} serve${m[2]?' against a serve-and-volleyer':''}`;
  if(m=s.match(/^plus1(fh|bh)$/))return`First ball after own serve, ${WING[m[1]]}`;
  if(m=s.match(/^rally(fh|bh):([cml])([ep])$/))return`${WING[m[1]][0].toUpperCase()+WING[m[1]].slice(1)} rally, ${WHERE[m[2]]}${m[3]==='p'?', hurried':''}`;
  if(m=s.match(/^pass(fh|bh)$/))return`Opponent at the net, ${WING[m[1]]}`;
  if(m=s.match(/^short:([cml])$/))return`Short ball, ${WHERE[m[1]]}`;
  if(s==='stretch')return'At full stretch';
  return s;}
const TAC={t:'down the T',wide:'out wide',body:'into the body',flat:'flat',slice:'slice',kick:'kick',safe:'safe and deep',cross:'cross-court',line:'down the line',angle:'sharp angle',drop:'drop shot',lob:'lob',
  open:'hard into the open court',behind:'behind the opponent',deep:'heavy and deep down the middle',dip:'low at the feet',passline:'pass down the line',passcross:'cross-court pass',approach:'approach and come in'};
function playbook(name){const all=[];for(const s in LEARNED[name]||{})for(const t in LEARNED[name][s])all.push([s,t,LEARNED[name][s][t]]);
  // a preference only counts where the player had a real choice: compare each tactic with the others in its situation
  const rel=all.map(([s,t,v])=>{const o=Object.values(LEARNED[name][s]);return[s,t,v-o.reduce((a,b)=>a+b,0)/o.length,o.length];}).filter(r=>r[3]>1);
  rel.sort((a,b)=>b[2]-a[2]);const row=([s,t,d])=>`| ${sitName(s)} | ${TAC[t]||t} | ${d>0?'+':''}${d.toFixed(2)} |`;
  return{likes:rel.slice(0,4).map(row),avoids:rel.slice(-3).reverse().map(row)};}
const last=hist[hist.length-1],first=hist[0],names=Object.keys(last.players);
let md=`# How the players learn

The computer players are not scripted. Each one keeps a table of **what has worked for it** — which serve to which
corner, cross-court or down the line, when to come in, how to pass a player at the net — and that table is filled in
by playing. This page is the record of that learning. It is rebuilt by \`tools/train.js\` every time the players train
(a GitHub Action runs it daily), so the numbers below are the current ones.

## The result

<picture><source media="(prefers-color-scheme: dark)" srcset="learning-dark.svg"><img src="learning-light.svg" alt="Learning curve: share of points trained players win against untrained twins, by rounds of self-play"></picture>

After **${last.round} rounds** of self-play (${last.points.toLocaleString('en-US')} points), a trained player wins **${last.overall}% of points** and
**${last.sets}% of sets** against an untrained copy of itself — same serve, same speed, same strokes, only the decisions
differ. Before any training the same measurement gave ${first.overall}% (50% is the expected value; the rest is noise in
a sample of ${first.evalPoints.toLocaleString('en-US')} points).

<picture><source media="(prefers-color-scheme: dark)" srcset="players-dark.svg"><img src="players-light.svg" alt="Share of points each trained player wins against its untrained twin"></picture>

| Date | Rounds | Points played in training | Points won vs untrained twin | Sets won | Points in the sample |
|---|---|---|---|---|---|
${hist.map(h=>`| ${h.date} | ${h.round} | ${h.points.toLocaleString('en-US')} | ${h.overall}% | ${h.sets}% | ${h.evalPoints.toLocaleString('en-US')} |`).join('\n')}

Each row is one measurement. A single measurement of all players is good to about ±1 percentage point; one player's
bar in the second chart rests on far fewer points and is good to about ±3.

## The model

- **Situations.** A choice is always made in a situation the player can see: first or second serve and which court;
  returning a first or a second serve, and whether the server is coming in; the first ball after the player's own
  serve; a forehand or backhand rally ball, with the opponent covering the cross-court, in the middle or caught on
  the line side, and with or without time to set up; a short ball; the opponent at the net; at full stretch.
- **Choices.** In each situation there is a short list of tactics (where to serve and with which serve, cross-court,
  down the line, sharp angle, slice, drop shot, lob, into the open court, behind the opponent, heavy and deep, low at
  the feet, approach, the two passing shots), each with a base weight from the player's style.
- **Reward.** When a point ends, every choice the winner made in it is credited (+1) and every choice the loser made
  is blamed (−1), the latest choice in full and each earlier one 0.6 times as much as the one after it.
- **Update.** Each choice keeps a value *q* between −1 and 1, moved a small step toward each new result
  (*q* ← *q* + α·(*r* − *q*), α = 0.03 in training, 0.05 in match play).
- **Policy.** A tactic is chosen with probability proportional to *weight · e^(β·q)* (β = 1.5 in training so the
  players keep trying things, 2.6 in match play so they use what they know). Nothing is ever ruled out.
- **Self-play.** In a round every player plays a short set against every other player, serving first once and second
  once, all learning at the same time — so each one is learning against opponents who are learning too.
- **In the game.** The published game starts from these values. On Rookie the opponent ignores them, on Pro and
  Legend it plays them, and it keeps learning from the person it is playing; that part stays in the browser.

## The playbook

What each player came to prefer and to avoid. The number is how far the tactic's learned value sits above or below
the average of the other choices in the same situation.

`;
for(const n of names){const b=playbook(n);if(!b.likes.length)continue;
  md+=`<details><summary><b>${n}</b> — ${last.players[n]}% of points against the untrained twin</summary>\n\n| Situation | Prefers | Value |\n|---|---|---|\n${b.likes.join('\n')}\n\n| Situation | Avoids | Value |\n|---|---|---|\n${b.avoids.join('\n')}\n\n</details>\n\n`;}
md+=`## What the data says

The shots the players play while training are analysed in **[analysis/](analysis/README.md)**: correlation, entropy and
mutual information, PCA and K-means of the playing styles, decision trees and KNN, and cross-validation — including
of the learning itself.

## Reproduce it

\`\`\`
node tools/train.js 4          # four more rounds, then one measurement appended to history.json
node tools/train.js 8 4 curve  # eight rounds, measuring after every round (four sets per player)
node tools/train.js eval 40    # measure only, player by player
node tools/report.js           # redraw this page from history.json and learned.js
\`\`\`
`;
fs.writeFileSync(path.join(OUT,'README.md'),md);
for(const k in THEMES){fs.writeFileSync(path.join(OUT,`learning-${k}.svg`),curve(THEMES[k]));fs.writeFileSync(path.join(OUT,`players-${k}.svg`),bars(THEMES[k]));}
console.log('wrote training/README.md and four charts');
