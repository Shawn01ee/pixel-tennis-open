// Writes docs/surfaces/README.md: the four majors, how each court is set from measurements of real courts, and how
// the game then plays on it next to the real tour on that surface. Every number is read from src (Surface, Venue)
// or from data/mcp-surfaces.json and data/surface-check.json; the verdicts are worked out from the measurements.
//   node tools/surfaces-doc.js
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..');
const{loadSim}=require(path.join(ROOT,'tests','load'));
const{SURFACES}=loadSim(['SURFACES']);
const chk=JSON.parse(fs.readFileSync(path.join(ROOT,'data','surface-check.json'),'utf8'));
// the majors, read from the source so the page follows the game
const vsrc=fs.readFileSync(path.join(ROOT,'src','stadium','Venue.js'),'utf8');
const majors=[...vsrc.matchAll(/\{key:'(\w+)',name:'([^']+)',tag:'[^']*',sub:'([^']+)',month:'([^']+)',surface:'(\w+)',look:'\w+',phase:'(\w+)'(,white:true)?\}/g)].map(m=>({name:m[2],sub:m[3],month:m[4],surface:m[5],phase:m[6],white:!!m[7]}));
const S=['hard','clay','grass'],N={hard:'Hard',clay:'Clay',grass:'Grass'},B=chk.bounce;
const LABEL={ace:'Aces (of serve points)',df:'Double faults',firstIn:'First serves in',firstWon:'Points won behind the first serve',secondWon:'Points won behind the second serve',
  net:'Net points (the project\'s own rule)',winners:'Winners per ball struck',errors:'Errors per ball struck',rally:'Shots per point'};
const fmt=(k,v)=>k==='rally'?v.toFixed(2):v.toFixed(1)+'%';
const cell=q=>q.inside?`${q.game}${'%'} [${q.lo}–${q.hi}]`:`**${q.game}% [${q.lo}–${q.hi}]**`;
const cellK=(k,q)=>{const u=k==='rally'?'':'%',t=`${q.game}${u} [${q.lo}–${q.hi}]`;return q.inside?t:`**${t}**`;};
const rows=Object.keys(LABEL).map(k=>`| ${LABEL[k]} | ${S.map(s=>`${cellK(k,chk.surfaces[s].stats[k])} | ${chk.surfaces[s].stats[k].real}${k==='rally'?'':'%'}`).join(' | ')} |`).join('\n');
// how each surface differs from the hard court: real against game
const diff=k=>S.slice(1).map(s=>{const g=chk.surfaces[s].stats[k].game-chk.surfaces.hard.stats[k].game,r=chk.surfaces[s].stats[k].real-chk.surfaces.hard.stats[k].real,u=k==='rally'?'':' points';
  const same=Math.sign(g)===Math.sign(r)&&Math.abs(g)>=Math.abs(r)/2&&Math.abs(g)<=Math.abs(r)*2;return`${N[s]} ${r>=0?'+':''}${r.toFixed(k==='rally'?2:1)}${u} real, ${g>=0?'+':''}${g.toFixed(k==='rally'?2:1)} in the game${same?'':' (**not reproduced**)'}`;}).join('; ');
const outside=S.flatMap(s=>Object.keys(LABEL).filter(k=>!chk.surfaces[s].stats[k].inside).map(k=>`${N[s].toLowerCase()} ${LABEL[k].toLowerCase()}`));
const md=`# The four majors and their courts

The game has four majors of its own, in the spirit of the real four (names, colours and dress codes are invented or
**design**; the surfaces are measured):

| Major | When | Surface | Session | Dress |
|---|---|---|---|---|
${majors.map(m=>`| ${m.name} | ${m.month} | ${m.surface} | ${m.phase} | ${m.white?'all white':'own kit'} |`).join('\n')}

All four are played to the Grand Slam rules: best of five sets for the men, a 10-point tiebreak at 6–6 in the fifth
set. They can be played as a Tournament or an Exhibition, and they are the Grand Slams of the career's year, which now
has a clay spring and a grass season (docs/career).

*This page is written by \`tools/surfaces-doc.js\` from the game's files and \`tools/surface-check.js\`'s measurements
(${chk.date}).*

## The courts

A bounce is set by two numbers: how much of the ball's vertical speed comes back (the coefficient of restitution,
COR), and how hard the court grips the ball as it slides (the coefficient of sliding friction, COF; the ITF rates a
court's pace as 100 × (1 − COF)).

| | COF (sliding friction) | Vertical bounce | Basis |
|---|---|---|---|
| Hard | ${SURFACES.hard.mu} | COR ${SURFACES.hard.drop().toFixed(3)} from 254 cm | ITF drop test for the ball (135–147 cm rebound); a 200 km/h serve's loss of speed through the bounce |
| Clay | ${SURFACES.clay.mu} | COR ${SURFACES.clay.drop().toFixed(3)}, as hard | COF of a court built like European clay, 15–35 m/s (Cross 2003, Table 1). A vertical drop rebounds as on a hard court: COR 0.77 on both the acrylic and the crushed-brick court (Thorpe & Canaway 1986, via Cross 2003) |
| Grass | ${SURFACES.grass.mu} | COR ${SURFACES.grass.drop().toFixed(3)} | COF of the grass centre court at Kooyong, then a Grand Slam's (Thorpe & Canaway, via Cross 2003). Vertical drop COR 0.65 on grass against 0.77 on the other courts (same tests): the hard court's bounce × 0.65/0.77 |

Design, not data: a grass court now and then kicks a ball off a tuft, its baselines are worn to bare earth (a deader
bounce there), and players slide into their shots on clay.

Measured in the game the way Cross measured real courts (a ball without spin at 30 m/s, 16° to the court):
${S.map(s=>`${N[s].toLowerCase()} COF ${B[s].cof}, COR ${B[s].cor} (ITF pace ${B[s].pace}; the ball keeps ${B[s].speedKept}% of its speed along the court)`).join('; ')}.
Real oblique bounces come back higher than vertical ones: Cross (2003) gives COR 0.8–0.9 on most courts and on clay,
0.6–0.9 on grass depending on its condition. ${B.clay.cor<.8?`**The game's oblique bounce is lower: COR ${B.hard.cor} on hard, ${B.clay.cor} on clay, ${B.grass.cor} on grass.** Its bounce is set by the vertical drop and does not rise with the angle of impact, so clay does not bounce higher than a hard court.`:'The game\'s clay bounce is inside that range.'}

## How the game plays on each

${chk.surfaces.hard.matches*3} one-set matches between two copies of the game's tour-average player (the player fitted to the
real tour on hard courts by \`tools/fit-players.js\`), ${chk.surfaces.hard.matches} on each surface, against every charted
men's match since 2010 on that surface in the Match Charting Project (${S.map(s=>`${N[s].toLowerCase()} ${JSON.parse(fs.readFileSync(path.join(ROOT,'data','mcp-surfaces.json'),'utf8')).surfaces[s].matches} matches`).join(', ')}).
Counted the same way on both sides: net points by the project's own rule (\`tools/netpoints.js\`); winners and errors
per ball struck after the serve, every error counted, forced or not, the return's too (the project's shot tables
leave out a hitter's forced errors, and forced errors on the return sit in its serve table, so
\`tools/mcp_surfaces.py\` adds them back: the game cannot tell a forced error from an unforced one); shots per point
are every ball struck plus one serve. Game figures with their 95% interval (bootstrap over the matches); **bold**
where the real figure falls outside it.
Nothing here was tuned: the courts are set from the measurements above and this is how they play.

| | Hard: game | real | Clay: game | real | Grass: game | real |
|---|---|---|---|---|---|---|
${rows}

How each surface differs from the hard court (reproduced when the game moves the same way, by at least half and at most
twice the real change):

- Aces: ${diff('ace')}.
- Points won behind the first serve: ${diff('firstWon')}.
- Shots per point: ${diff('rally')}.
- Winners per ball struck: ${diff('winners')}.

${outside.length?`Outside the interval: ${outside.join(', ')}.`:'Every figure is inside its interval.'}

What the game does not have yet, and so cannot reproduce:

- **Players do not adapt to the surface.** Real players serve slower on clay to put more spin on the ball (an average
  first serve of 160 km/h at the clay major against 185 km/h at the grass one; Haake et al. 2000, via Cross 2003), and
  stand and come in differently. In the game they play the same way everywhere; only the ball behaves differently.
- **The bounce does not rise with the angle of impact** (above).
- Matches simulated by Elo in the career use one rating for all surfaces.

## Sources

- R. Cross, *Measurements of the horizontal and vertical speeds of tennis courts*, Sports Engineering 6, 95–111 (2003),
  doi:10.1007/BF02903531 — its Table 1, and its summary of Thorpe & Canaway (1986) and Pallis & Mehta (2000).
- R. Cross, *Measurement of the speed and bounce of tennis courts* (University of Sydney): the ITF's high and low
  limits (COF above 0.71 high, e.g. clay; below 0.55 low, e.g. grass).
- ITF, *Surface Pace* (ISSS technical meeting, Nyon, 2002): pace rating = 100 × (1 − COF).
- Tennis Abstract Match Charting Project (CC BY-NC-SA 4.0), \`data/mcp-surfaces.json\` (\`tools/mcp_surfaces.py\`).
`;
fs.mkdirSync(path.join(ROOT,'docs','surfaces'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs','surfaces','README.md'),md);
console.log('docs/surfaces/README.md written');
