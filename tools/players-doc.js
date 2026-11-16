// Writes docs/players/README.md from data/mcp-players.json and data/fit-report.json: where every player number comes
// from, each player's real statistics, and what the game does with the fitted numbers next to them.
//   node tools/players-doc.js
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..');
const T=JSON.parse(fs.readFileSync(path.join(ROOT,'data','mcp-players.json'),'utf8'));
const F=JSON.parse(fs.readFileSync(path.join(ROOT,'data','fit-report.json'),'utf8'));
const RC=JSON.parse(fs.readFileSync(path.join(ROOT,'data','rally-check.json'),'utf8')),RB=fs.existsSync(path.join(ROOT,'data','rally-before.json'))?JSON.parse(fs.readFileSync(path.join(ROOT,'data','rally-before.json'),'utf8')):null;
const P=Object.keys(F.players),pc=x=>(x*100).toFixed(1),AS=r=>r.winners+r.errors;
const row=a=>`| ${a.join(' | ')} |`,sep=n=>row(Array(n).fill('---'));
const cell=(g,r)=>{const d=Math.abs(g-r),tol=Math.max(1.5,r*.15);return d<=tol?`${g} / ${r}`:`**${g}** / ${r}`;};
// the rally figures: off when more than 15% from the real figure, or outside it when the real figure is a range
const ROWS=[['Rally balls cross-court','cross','%','Match Charting Project, hard courts since 2010'],['… down the middle','middle','%',''],['… down the line','line','%',''],
  ['Overheads, share of shots','overhead','%',''],['Volleys, share of shots','volley','%',''],['Points a player comes to the net','net','%',''],
  ['Rally-ending shots that are winners','winnerShare','%',''],['Metres between a player\'s shots','cycle',' m','Armstrong et al. 2024 (Australian Open, Hawk-Eye)'],
  ['… share over 4.5 m','cycleOver45','%',''],['Metres per point','distance',' m','Armstrong et al. 2024; Cui et al. 2020'],['Seconds between shots','gap',' s','Carboch & Sklenářik 2018'],
  ['Shots per point, serve included','rally','','Match Charting Project']];
const rallyOff=k=>{const g=RC.game[k],r=RC.real[k];if(typeof r==='string'){const[lo,hi]=r.split('–').map(Number);return g<lo||g>hi;}return Math.abs(g/r-1)>.15;};
const DIR=(s=>({middle:+s.match(/DIR=\{middle:([0-9.]+)/)[1],line:+s.match(/line:([0-9.]+)\};/)[1]}))(fs.readFileSync(path.join(ROOT,'src','players','ShotPlanner.js'),'utf8'));
function stillOff(){
  const L=ROWS.filter(([,k])=>rallyOff(k));if(!L.length)return'Every figure is now within 15% of the real one.';
  return`Bold: more than 15% from the real figure, or outside the real range. Still off after these fixes: ${L.map(([n,k,u])=>`${n.replace('… ','').replace(/^./,c=>c.toLowerCase())} ${RC.game[k]}${u} against ${RC.real[k]}${u}`).join('; ')}.`+
    (rallyOff('line')&&RC.game.line>RC.real.line&&DIR.line<.1?` The down-the-line choice already has a fitted weight of ${DIR.line}, against 3 for cross-court, so the fit cannot lower that share any further. Where the remaining down-the-line balls come from has not been traced yet.`:'');
}
let md=`# Players

Every number a player has in the game is one of five kinds, and this page says which:

| Kind | Numbers | Where they come from |
|---|---|---|
| **Real** | name, country, height, hand, one- or two-handed backhand; the Power, Control and Touch bars on the player card | the players' public profiles; the card bars are his real winners per shot, errors per shot, and drop, slice and net frequency against the tour's (Match Charting Project), 75 being the tour |
| **Fitted** | first-serve speed, first- and second-serve accuracy, return errors, error scale, shot power, how often he serve-volleys, comes in, drops, slices and lobs | fitted so the game reproduces his statistics in the Match Charting Project (below) |
| **Read off** | risk-taking (aggr) | his aggression score in the Match Charting Project |
| **Published** | Stamina, five-set record | ATP's five-set records ([docs/stamina](../stamina/README.md)) |
| **Design** | top speed, acceleration, topspin, kick, second-serve speed, return position, placement, ball bounces before serving, seeding, signature trait, looks | no public data per player; set by hand |

## How points are played

Before any player was fitted, the rally itself was checked against real tennis, because the player numbers can only
be as right as the game they play in. \`node tools/rally-check.js\` measures it:

${row(['','Before','Now','Real','Real source'])}
${row(['---','---','---','---','---'])}
${ROWS.map(([n,k,u,s])=>row([n,RB?`${RB.game[k]}${u}`:'—',rallyOff(k)?`**${RC.game[k]}${u}**`:`${RC.game[k]}${u}`,`${RC.real[k]}${u}`,s])).join('\n')}

"Before" is the previous version of the game, measured the same way. Three causes were found and fixed:

1. **Winners were mostly failed reaches.** Nearly every winner was a ball the defender had planned to reach and
   then failed to. A volleyer was allowed to cover the last 0.45 m with arm and racket, but a groundstroke player was
   not. Now both are, and a ball reached that way is played stretched, with the stretch penalty. Real players start
   moving about 0.18–0.31 s after the opponent's contact (Navia et al. 2021; Filipčič et al. 2017). The game's
   players already reacted that fast, so reaction time was not the cause.
2. **High balls were smashed from the baseline, and the smash sent the player to the net.** Any high-bouncing ball
   became an overhead. Now an overhead off the bounce is played only when no groundstroke is there to be played. A
   player stays at the net after an overhead only if he hit it from near the net.
3. **Rally balls went to the corners.** Almost nothing went down the middle. The weights of the middle and line
   choices are now fitted (\`tools/fit-directions.js\`) toward the real split.

${stillOff()}

A ball taken 1.4 m or more inside the baseline now counts as a chance to come in (it was 2.7 m). That threshold is a
design choice with no data behind it. How often each player takes the chance is fitted to how often he really comes
in.

## The data

The **Tennis Abstract Match Charting Project** is a crowdsourced, shot-by-shot record of professional matches,
charted by volunteers from video ([github.com/JeffSackmann/tennis_MatchChartingProject](https://github.com/JeffSackmann/tennis_MatchChartingProject),
CC BY-NC-SA 4.0). It covers every one of the thirteen, Borg and McEnroe included. The game is played on a hard
court, so each player's figures come from his charted hard-court matches. Borg has fewer than 20 of those, so his
come from all surfaces. The tour reference is every charted hard-court match since 2010
(${T.tour.matches.toLocaleString('en')} player-matches, ${T.tour.points.toLocaleString('en')} points).

${row(['Player','Charted matches','Points','Courts','Years','Aces','Double faults','1st serves in','1st serve won','2nd serve won','Return won','Serve-volley','At the net','Drop shots','Slices','Lobs','Winners / shot','Errors / shot','Aggression'])}
${sep(19)}
${[...P.map(k=>[k,T.players[k]]),['Tour',T.tour]].map(([k,r])=>row([k==='Tour'?'**Tour**':k,r.matches,r.points.toLocaleString('en'),r.surface,r.years,pc(r.ace),pc(r.df),pc(r.firstIn),pc(r.firstWon),pc(r.secondWon),pc(r.returnWon),pc(r.snv),pc(r.net),pc(r.drop),pc(r.slice),pc(r.lob),pc(r.winners),pc(r.errors),pc(AS(r))])).join('\n')}

All in percent. Aces, double faults, first serves in and serve-and-volley are per serve point. At the net is per
point played. Drops, slices, lobs, winners and errors are per shot, serves excluded. Errors include those the
opponent forced. Aggression is Tennis Abstract's aggression score, (winners + errors) per shot.

## How the numbers are fitted

\`node tools/fit-players.js\` fits each player's numbers until the game reproduces his statistics.

1. **A tour-average opponent.** It starts from the roster's mean and plays copies of itself, until it serves,
   returns, hits winners and errs, and chooses its shots, like the tour reference above. In the game it hits winners
   on ${F.tourInGame.winners}% of its shots and errors on ${F.tourInGame.errors}%, against ${pc(T.tour.winners)}% and ${pc(T.tour.errors)}% for real.
2. **Each player against it.** One-set matches, ${F.sets} per round for ${F.rounds} rounds. After each round, every
   number moves toward the value that would give the player's real statistic:

   | Number | Fitted to | How |
   |---|---|---|
   | first-serve speed | aces | faster serves, more aces |
   | first-serve accuracy | first serves in | |
   | second-serve accuracy | double faults | |
   | return errors | return points won | |
   | serve-and-volley rate | serve-and-volley share | worked out directly: he comes in behind a first serve at this rate, and behind a second at 45% of it |
   | net, drop, slice, lob | how often he comes in, drops, slices and lobs | |
   | error scale | errors per shot, as a ratio to the tour | see below |
   | shot power | winners per shot, as a ratio to the tour | faster balls go unreached more often |
   | risk-taking | not fitted | 0.5 × his aggression score ÷ the tour's, so the tour average is 0.5 |

   The steps shrink every round (Robbins–Monro), so one noisy round cannot throw a number about. The last
   measurement is three times as long as a round.
3. **Winners and errors as ratios to the tour.** A player who hits 1.3 times the tour's winners for real is fitted to
   hit 1.3 times the game tour's. Since the tour itself now matches the real tour, these are the real rates too.

## What the game does now

Each cell reads game / real. Cells where the two differ by more than 1.5 points or 15% are in bold. From
${F.sets*3} one-set matches per player against the tour-average opponent.

${row(['Player','Aces','Double faults','1st serves in','Return won','Serve-volley','At the net','Drop shots','Slices','Lobs','Winners vs tour','Errors vs tour','1st serve won','2nd serve won'])}
${sep(14)}
${P.map(k=>{const{game:g,real:r}=F.players[k];return row([k,cell(g.ace,r.ace),cell(g.df,r.df),cell(g.firstIn,r.firstIn),cell(g.returnWon,r.returnWon),cell(g.snv,r.snv),cell(g.net,r.net),cell(g.drop,r.drop),cell(g.slice,r.slice),cell(g.lob,r.lob),`${g.winnersVsTour} / ${r.winnersVsTour}`,`${g.errorsVsTour} / ${r.errorsVsTour}`,cell(g.firstWon,r.firstWon),cell(g.secondWon,r.secondWon)]);}).join('\n')}

The last two columns, points won on first and second serve, are not fitted. They are the check: they follow from
everything else.

**Where the fit ran out of room.** A number that ends at the edge of its allowed range means the game could not reach
the real figure with it. This round:
${P.filter(k=>(F.players[k].atBound||[]).length).map(k=>`- ${k}: ${F.players[k].atBound.map(x=>({net:'coming in (net)',slice:'slices',drop:'drop shots',lob:'lobs',rerr:'return points won (return errors)',serr:'first serves in',serr2:'double faults',err:'errors'})[x]||x).join(', ')}`).join('\n')||'- none'}

These are the bold cells above. Closing them needs changes to how the game plays, not to the player's numbers.

### The numbers, before and after

${row(['Player','1st serve km/h','1st serve accuracy','2nd serve accuracy','Return errors','Error scale','Power','Risk','Serve-volley','Net','Drop','Slice','Lob'])}
${sep(13)}
${P.map(k=>{const{before:b,after:a}=F.players[k],f=(x,y,d=2)=>`${(+x).toFixed(d)} → ${(+y).toFixed(d)}`;return row([k,f(b.s1*3.6,a.s1*3.6,0),f(b.serr,a.serr),f(b.serr2,a.serr2),f(b.rerr,a.rerr),f(b.err,a.err),f(b.power,a.power),f(b.aggr,a.aggr),f(b.sv,a.sv),f(b.net,a.net),f(b.drop,a.drop),f(b.slice,a.slice),f(b.lob,a.lob)]);}).join('\n')}

Accuracy and error columns are scales: lower is steadier.

## Limits

- **Some figures have a floor in the game.** Every player gets pulled to the net by short balls, and stretched
  players lob. So baseliners still come in and lob a little more than they really do, even with the fitted
  tendency at its lowest.
- **Points won on serve run high for some players.** These are the check columns and are not fitted. Where they
  are high, the serve or the first shot after it is stronger in the game than for real.
- **Charted matches are not a random sample.** Volunteers chart big matches more often, so the opponents are
  stronger than average. Players are fitted against one tour average opponent, not their real ones.
- **Each era plays the modern tour.** Borg, McEnroe, Sampras and Agassi are fitted against the 2010s tour average,
  not the opponents of their own day.
- **Learned tactics move the frequencies.** The computer players' learned tactics (training/) change how often they
  pick each shot. After a lot of new training, run \`node tools/fit-players.js\` again.

## Licence

The fitted numbers (\`src/players/fitted.js\`) and \`data/\` are derived from the Match Charting Project and carry its
licence, CC BY-NC-SA 4.0: attribution, non-commercial use only, share alike. The game is free and non-commercial.
Selling it would need these numbers replaced.
`;
fs.mkdirSync(path.join(ROOT,'docs','players'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'docs','players','README.md'),md);
console.log('docs/players/README.md written');
