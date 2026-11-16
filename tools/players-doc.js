// Writes docs/players/README.md from data/mcp-players.json and data/fit-report.json: where every player number comes
// from, each player's real statistics, and what the game does with the fitted numbers next to them.
//   node tools/players-doc.js
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..');
const T=JSON.parse(fs.readFileSync(path.join(ROOT,'data','mcp-players.json'),'utf8'));
const F=JSON.parse(fs.readFileSync(path.join(ROOT,'data','fit-report.json'),'utf8'));
const P=Object.keys(F.players),pc=x=>(x*100).toFixed(1),AS=r=>r.winners+r.errors;
const row=a=>`| ${a.join(' | ')} |`,sep=n=>row(Array(n).fill('---'));
const cell=(g,r)=>{const d=Math.abs(g-r),tol=Math.max(1.5,r*.15);return d<=tol?`${g} / ${r}`:`**${g}** / ${r}`;};
let md=`# Players

Every number a player has in the game is one of five kinds, and this page says which:

| Kind | Numbers | Where they come from |
|---|---|---|
| **Real** | name, country, height, hand, one- or two-handed backhand | the players' public profiles |
| **Fitted** | first-serve speed, first- and second-serve accuracy, return errors, error scale, shot power, how often he serve-volleys, comes in, drops, slices and lobs | fitted so the game reproduces his statistics in the Match Charting Project (below) |
| **Read off** | risk-taking (aggr) | his aggression score in the Match Charting Project |
| **Published** | Stamina, five-set record | ATP's five-set records ([docs/stamina](../stamina/README.md)) |
| **Design** | top speed, acceleration, topspin, kick, second-serve speed, return position, placement, ball bounces before serving, seeding, signature trait, looks | no public data per player; set by hand |

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
   returns and chooses its shots like the tour reference above.
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
3. **Winners and errors as ratios.** Points in the game end in a winner more often than real ones do. In the game the
   tour average hits winners on ${F.tourInGame.winners}% of its shots and errors on ${F.tourInGame.errors}%, against
   ${pc(T.tour.winners)}% and ${pc(T.tour.errors)}% for real. That gap comes from how players move and reach the
   ball, not from any one player. So each player is fitted to his real ratio to the tour: a player who hits 1.3
   times the tour's winners for real hits 1.3 times the game tour's.

## What the game does now

Each cell reads game / real. Cells where the two differ by more than 1.5 points or 15% are in bold. From
${F.sets*3} one-set matches per player against the tour-average opponent.

${row(['Player','Aces','Double faults','1st serves in','Return won','Serve-volley','At the net','Drop shots','Slices','Lobs','Winners vs tour','Errors vs tour','1st serve won','2nd serve won'])}
${sep(14)}
${P.map(k=>{const{game:g,real:r}=F.players[k];return row([k,cell(g.ace,r.ace),cell(g.df,r.df),cell(g.firstIn,r.firstIn),cell(g.returnWon,r.returnWon),cell(g.snv,r.snv),cell(g.net,r.net),cell(g.drop,r.drop),cell(g.slice,r.slice),cell(g.lob,r.lob),`${g.winnersVsTour} / ${r.winnersVsTour}`,`${g.errorsVsTour} / ${r.errorsVsTour}`,cell(g.firstWon,r.firstWon),cell(g.secondWon,r.secondWon)]);}).join('\n')}

The last two columns, points won on first and second serve, are not fitted. They are the check: they follow from
everything else.

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
