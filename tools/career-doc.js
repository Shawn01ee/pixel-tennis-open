// Writes docs/career/README.md from the career's data and the level fit: every number in it is read from
// src/career (CareerData, Career, levelFit) or data/career, and the statements about the fit are worked out from the
// measurements, so the page cannot say more than they do.
//   node tools/career-doc.js
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..');
const{loadSim}=require(path.join(ROOT,'tests','load'));
const{CAREER_DATA:D,Career,CareerEvent,Calendar,EloModel,WorldRanking,LEVEL_FIT}=loadSim(['CAREER_DATA','Career','CareerEvent','Calendar','EloModel','WorldRanking','LEVEL_FIT']);
const fit=JSON.parse(fs.readFileSync(path.join(ROOT,'data','career','level-fit.json'),'utf8'));
const pc=x=>x.toFixed(1)+'%',T=D.TIERS,P=D.POINTS,E=D.ELO_RANK,S=Career.START;
const startPts=S.points.reduce((a,b)=>a+b,0),startRank=WorldRanking.rankOf(startPts);
// the fit, judged by its own margins
const chk=g=>{const c=fit.check[g],d=c.game-c.elo,inside=Math.abs(d)<=c.margin;return{...c,d,inside};};
const c100=chk(100),c200=chk(200),c400=chk(400);
const verdict=c=>c.inside?`${pc(c.game)} against Elo's ${pc(c.elo)}: inside the measurement's ±${c.margin} points`:`**${pc(c.game)} against Elo's ${pc(c.elo)}: ${Math.abs(c.d).toFixed(1)} points ${c.d>0?'more':'fewer'} than Elo, outside the measurement's ±${c.margin}**`;
const tierRows=Object.entries(T).map(([k,t])=>`| ${t.name} | ${t.draw} | ${t.sets===3?'best of five':'best of three'} | ${P[k].W} / ${P[k].F} / ${P[k].SF} / ${P[k].QF} / ${P[k].R16} | ${k==='gs'?'104 (rule)':t.cut>=9999?'none (design)':t.cut+' (design)'} | ${t.top} (design) |`).join('\n');
const weeks=[...new Set(Calendar.EVENTS.map(e=>e.wk))].length,count=k=>Calendar.EVENTS.filter(e=>e.tier===k).length;
const md=`# Career

A career of the player you make. He starts ranked **${startRank}**, with ${startPts} points from last season, and goes
as far as his results take him: Challengers, ATP 250s and 500s, Masters 1000s and the Pixel Tennis Open, the summer
hard-court major. The ranking is the real one, the points are the real ones, and how strong the players around him are
comes from real ratings. What has no data behind it is marked **design**.

*This page is written by \`tools/career-doc.js\` from the game's own files; the statements about the fit are worked out from
its measurements.*

## The year

${weeks} weeks of the hard-court year are played, in the shape of the real one: a January swing to the two-week major,
February indoors, the two-week March Masters, the North American summer, the autumn in Asia and indoors. The clay and
grass months and the off-season are skipped: the tour is elsewhere. ${Calendar.EVENTS.length} events: ${count('gs')} Grand
Slam, ${count('m1000')} Masters 1000, ${count('a500')} ATP 500, ${count('a250')} ATP 250 and ${Calendar.EVENTS.length-count('gs')-count('m1000')-count('a500')-count('a250')}
Challengers. Event names are invented. Each week you enter one event you are ranked high enough for, or train.

| Category | Draw | Matches | Points: W / F / SF / QF / R16 | Entry cut-off | Best ranking that plays it |
|---|---|---|---|---|---|
${tierRows}

**Points** are the ATP's, by the round a player goes out in, under the rules in force since 2024 (ATP Rankings FAQ, as
tabled in Wikipedia's *ATP rankings*). A Masters 1000 is played as a 64 draw with the 56-draw figures. The first round
of a 32 draw is worth nothing, as on the tour. Points count for **52 weeks**, then drop off; the hub shows what is about
to.

**Draws** are seeded like real ones: a quarter of the draw seeded by ranking, seed 1 on the top line and seed 2 on the
bottom one, the rest drawn into the remaining places. The field is drawn from the band of the ranking that plays the
category (from the "best ranking" column to a little past the cut-off), everyone in the band equally likely to enter
(**design**). There are no qualifiers, wild cards or byes.

## The ranking

Everyone else holds the points of his place on the **official ATP ranking of 16 November 2026**, places 1 to
${WorldRanking.SIZE} (${D.RANK_POINTS[0]} points at No. 1, ${WorldRanking.points(100)} at No. 100, ${WorldRanking.points(500)} at No. 500;
\`data/career/atp-ranking-points-2026-11-16.json\`). Your points put you one place behind everyone holding as many or
more. The other players' points do not change: the world is a snapshot, and you move through it.

The top thirteen places are the roster: the thirteen real players, each at his best. Everyone below is invented
(name, country, looks; **design**) and plays like one of the thirteen.

## How strong everyone is

Strength is an **Elo rating**, the way Tennis Abstract rates players. A gap of *d* points gives the stronger player
1/(1+10^(−d/400)) of best-of-three matches: 64% at 100 points, 76% at 200, 85% at 300, 91% at 400 (Tennis Abstract's
own figures). A best-of-five match is played as the same chance of winning each set, over five sets.

- **The thirteen** play at their peak Elo: Tennis Abstract's *The Tennis 128* for the retired, the *Peak Elo* column of
  its ATP Elo list of 16 November 2026 for the active
  (${Object.entries(D.PEAK_ELO).sort((a,b)=>b[1]-a[1]).map(([n,e])=>`${n} ${Math.round(e)}`).join(', ')}).
- **An invented player** ranked *r* has Elo **${E.A} − ${E.B}·ln r**, give or take **${E.SD}** (one standard deviation):
  the least-squares line through the 463 players ranked 1–500 in Tennis Abstract's ATP Elo list of 16 November 2026,
  with that list's own scatter around it (\`data/career/atp-elo-by-rank-2026-11-16.json\`). No. 14 is about
  ${Math.round(EloModel.atRank(14))}, No. 100 about ${Math.round(EloModel.atRank(100))}, No. 500 about ${Math.round(EloModel.atRank(500))}.
- **Matches you do not play** — everyone else's, and yours when you press *Simulate* — are decided by these odds.

### From Elo to the court

An invented player — and yours — plays like the roster player he is modelled on (the same fitted serve, shots,
movement and choices; no signature trait), with **errors and placement spread multiplied by exp(κ·(Ea − E)/400)**,
where *E* is his Elo and *Ea* the roster player's peak. κ is fitted by \`tools/fit-levels.js\`: two players with the same
model, 0–1000 Elo below its peak, one 200 points below the other, play best-of-three matches; the target, fixed before
any match was played, is Elo's **${pc(fit.target.won)}** for the stronger.

Result (${fit.date}): **κ = ${fit.kappa}**. At the end:

- 200 points apart (the target): ${verdict(c200)}, over ${c200.n} matches.
- 100 points apart: ${verdict(c100)}, over ${c100.n} matches.
- 400 points apart: ${verdict(c400)}, over ${c400.n} matches.

${[c100,c400].every(c=>c.inside)?'Both checks the fit was not aimed at agree with Elo within their margins, so one number carries the whole range.':
`Where a check falls outside its margin, the single exponential does not carry Elo's odds across the whole range; it is reported here as measured and not adjusted.`}

The bars on a player card follow from the same numbers: accuracy from the placement spread, control 40 points lower
for every doubling of errors (the card's own scale).

## Your player

| | Value | Basis |
|---|---|---|
| Starting level | ${S.level} Elo | the Elo at No. 300 on the line above |
| Starting points | ${startPts} (${S.points.length} × ${S.points[0]}, dropping off over the first year) | design |
| Growth | each point of experience closes ${(S.rate*100).toFixed(1)}% of the gap to ${S.ceiling} Elo | design |
| Experience | ${Career.XP.match} a match, ${Career.XP.match+Career.XP.win} a win, ${Career.XP.train} a week of training | design |

Your level is what decides how your player plays on court (as above) and the odds when you simulate. On court you
choose the shots, and timing and aim can beat the odds: that is the game.

## Limits

- The rest of the ranking does not move; nobody else wins or loses points.
- Only hard courts, and one major: the clay and grass months and the other three majors are not in the game yet.
- Draws have no qualifying, wild cards or byes; a Masters 1000 is a 64 draw.
- The entry cut-offs below the Grand Slams, the ranking bands, the starting point and the growth are design.
`;
fs.mkdirSync(path.join(ROOT,'docs','career'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs','career','README.md'),md);
console.log('docs/career/README.md written');
