# Players

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
be as right as the game they play in. `node tools/rally-check.js` measures it:

|  | Before | Now | Real | Real source |
| --- | --- | --- | --- | --- |
| Rally balls cross-court | 71.9% | **48.2%** | 59.3% | Match Charting Project, hard courts since 2010 |
| … down the middle | 5.7% | **41.4%** | 26.5% |  |
| … down the line | 22.3% | **10.4%** | 14.2% |  |
| Overheads, share of shots | 8% | **0.7%** | 0.93% |  |
| Volleys, share of shots | 8.1% | **3.8%** | 2.66% |  |
| Points a player comes to the net | 22.7% | 16.7% | 17.3% | the thirteen players' own average |
| Rally-ending shots that are winners | 59.8% | 26.7% | 28.7% |  |
| Metres between a player's shots | 5.96 m | 4.62 m | 4.57 m | Armstrong et al. 2024 (Australian Open, Hawk-Eye) |
| … share over 4.5 m | 72.3% | 46.6% | 51% |  |
| Metres per point | 14 m | **11.9 m** | 6.46–10.7 m | Armstrong et al. 2024; Cui et al. 2020 |
| Seconds between shots | 1.344 s | 1.297 s | 1.21 s | Carboch & Sklenářik 2018 |
| Shots per point, serve included | 5.24 | 5.22 | 4.95 | Match Charting Project, the thirteen players' own average |

"Before" is the previous version of the game, measured the same way, except that its shots per point counted a faulted first serve as a shot; now, as in the real figure, every point has one serve. Three causes were found and fixed:

1. **Winners were mostly failed reaches.** Nearly every winner was a ball the defender had planned to reach and
   then failed to. A volleyer was allowed to cover the last 0.45 m with arm and racket, but a groundstroke player was
   not. Now both are, and a ball reached that way is played stretched, with the stretch penalty. Real players start
   moving about 0.18–0.31 s after the opponent's contact (Navia et al. 2021; Filipčič et al. 2017). The game's
   players already reacted that fast, so reaction time was not the cause.
2. **High balls were smashed from the baseline, and the smash sent the player to the net.** Any high-bouncing ball
   became an overhead. Now an overhead off the bounce is played only when no groundstroke is there to be played. A
   player stays at the net after an overhead only if he hit it from near the net.
3. **Rally balls went to the corners.** Almost nothing went down the middle. The weights of the middle and line
   choices are now fitted (`tools/fit-directions.js`) toward the real split.

Bold: more than 15% from the real figure, or outside the real range. Still off after these fixes: rally balls cross-court 48.2% against 59.3%; down the middle 41.4% against 26.5%; down the line 10.4% against 14.2%; overheads, share of shots 0.7% against 0.93%; volleys, share of shots 3.8% against 2.66%; metres per point 11.9 m against 6.46–10.7 m.

Directions are counted by the Match Charting Project's own rule (`tools/directions.js`). Only rally groundstrokes
count, and a ball hit from the middle third is never down the line: down the line means from a side third, straight
along the same side. That rule was found by rebuilding the project's direction table from its raw shot codes, which
comes out exactly equal for 98.1% of player-match rows (`tools/mcp_directions.py`). An earlier version of this page
counted direction by which side of the centre line the player stood. By that count the game sent 24.6% of rally balls
down the line; the same build, counted by the real rule, sent 14.4%. Both columns of the table use the real rule.

A ball taken 1.4 m or more inside the baseline now counts as a chance to come in (it was 2.7 m). That threshold is a
design choice with no data behind it. How often each player takes the chance is fitted to how often he really comes
in.

## The data

The **Tennis Abstract Match Charting Project** is a crowdsourced, shot-by-shot record of professional matches,
charted by volunteers from video ([github.com/JeffSackmann/tennis_MatchChartingProject](https://github.com/JeffSackmann/tennis_MatchChartingProject),
CC BY-NC-SA 4.0). It covers every one of the thirteen, Borg and McEnroe included. The game is played on a hard
court, so each player's figures come from his charted hard-court matches. Borg has fewer than 20 of those, so his
come from all surfaces. The tour reference is every charted hard-court match since 2010
(7,162 player-matches, 1,139,202 points).

| Player | Charted matches | Points | Courts | Years | Aces | Double faults | 1st serves in | 1st serve won | 2nd serve won | Return won | Serve-volley | At the net | Drop shots | Slices | Lobs | Winners / shot | Errors / shot | Aggression |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Djokovic | 364 | 58,609 | hard | 2005–2026 | 7.6 | 2.9 | 64.7 | 73.9 | 55.8 | 40.8 | 2.5 | 11.7 | 1.2 | 6.6 | 1.0 | 5.2 | 13.9 | 19.1 |
| Nadal | 219 | 36,664 | hard | 2004–2024 | 4.7 | 2.5 | 67.6 | 70.9 | 55.3 | 38.0 | 1.8 | 9.0 | 0.5 | 7.5 | 0.8 | 5.8 | 14.1 | 19.9 |
| Alcaraz | 128 | 20,435 | hard | 2021–2026 | 6.3 | 2.8 | 65.2 | 73.3 | 56.7 | 40.7 | 5.8 | 13.3 | 2.3 | 9.9 | 1.2 | 7.8 | 18.0 | 25.8 |
| Federer | 473 | 77,837 | hard | 1998–2021 | 10.5 | 2.5 | 62.0 | 77.3 | 56.2 | 39.8 | 9.6 | 16.8 | 0.8 | 15.7 | 0.8 | 7.9 | 18.1 | 26.0 |
| Sinner | 195 | 30,051 | hard | 2019–2026 | 9.5 | 2.7 | 60.7 | 77.0 | 55.3 | 40.4 | 1.6 | 10.1 | 1.0 | 3.7 | 0.5 | 5.8 | 15.8 | 21.6 |
| Medvedev | 227 | 35,928 | hard | 2017–2026 | 11.1 | 5.0 | 62.8 | 75.8 | 51.1 | 39.7 | 1.1 | 9.6 | 1.2 | 5.3 | 0.9 | 4.4 | 13.1 | 17.5 |
| Zverev | 123 | 19,666 | hard | 2014–2026 | 11.4 | 3.9 | 69.6 | 74.8 | 49.9 | 35.5 | 2.7 | 12.2 | 0.6 | 6.1 | 0.6 | 5.5 | 16.1 | 21.6 |
| de Minaur | 109 | 17,078 | hard | 2017–2026 | 4.8 | 3.1 | 58.9 | 71.2 | 53.1 | 38.5 | 1.1 | 12.0 | 0.5 | 8.5 | 1.0 | 4.3 | 14.1 | 18.4 |
| Sampras | 174 | 30,902 | hard | 1990–2002 | 14.1 | 4.6 | 58.3 | 79.4 | 52.8 | 36.1 | 52.7 | 34.8 | 0.1 | 14.4 | 0.8 | 9.9 | 21.0 | 31.0 |
| Borg | 22 | 4,068 | all | 1974–1991 | 4.4 | 3.2 | 57.3 | 68.8 | 54.7 | 45.0 | 19.0 | 23.3 | 0.0 | 4.8 | 1.8 | 6.3 | 11.5 | 17.8 |
| Agassi | 170 | 30,686 | hard | 1988–2006 | 5.9 | 2.8 | 62.9 | 70.6 | 54.3 | 38.9 | 1.9 | 9.5 | 0.4 | 3.8 | 1.0 | 6.8 | 16.2 | 23.0 |
| Murray | 185 | 31,390 | hard | 2005–2024 | 8.1 | 3.4 | 58.9 | 73.0 | 49.2 | 38.7 | 2.0 | 10.9 | 1.1 | 11.4 | 1.6 | 4.7 | 13.7 | 18.4 |
| McEnroe | 37 | 7,932 | hard | 1979–1992 | 6.6 | 4.3 | 57.9 | 71.5 | 50.4 | 36.2 | 72.5 | 51.2 | 0.5 | 13.1 | 1.9 | 9.6 | 20.4 | 30.0 |
| **Tour** | 7162 | 1,139,202 | hard | 2010–2026 | 9.1 | 3.5 | 62.5 | 73.0 | 50.9 | 35.3 | 4.1 | 11.9 | 1.0 | 9.8 | 1.0 | 5.9 | 17.3 | 23.2 |

All in percent. Aces, double faults, first serves in and serve-and-volley are per serve point. At the net is per
point played. Drops, slices, lobs, winners and errors are per ball struck, serves excluded, counted as the game
counts them: errors include those the opponent forced, the return's too (the project's shot tables leave a hitter's
forced errors out, and forced errors on the return sit in its serve table; `tools/mcp_targets.py` adds them back,
since the game cannot tell a forced error from an unforced one). Aggression is Tennis Abstract's aggression score,
(winners + errors) per shot.

## How the numbers are fitted

`node tools/fit-players.js` fits each player's numbers until the game reproduces his statistics.

1. **A tour-average opponent.** It starts from the roster's mean and plays copies of itself, until it serves,
   returns, hits winners and errs, and chooses its shots, like the tour reference above. In the game it hits winners
   on 5.9% of its shots and errors on 17.1%, against 5.9% and 17.3% for real.
2. **Each player against it.** One-set matches, 16 per round for 14 rounds. After each round, every
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
48 one-set matches per player against the tour-average opponent.

| Player | Aces | Double faults | 1st serves in | Return won | Serve-volley | At the net | Drop shots | Slices | Lobs | Winners vs tour | Errors vs tour | 1st serve won | 2nd serve won |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Djokovic | 7.1 / 7.6 | 3.3 / 2.9 | 64 / 64.7 | 41.1 / 40.8 | 2.2 / 2.5 | 11.4 / 11.7 | 1.3 / 1.2 | 6.1 / 6.6 | 0.9 / 1 | 0.92 / 0.88 | 0.8 / 0.8 | 74.9 / 73.9 | 63.1 / 55.8 |
| Nadal | 5.8 / 4.7 | 2.8 / 2.5 | 65.7 / 67.6 | 39.2 / 38 | 1.9 / 1.8 | 8.5 / 9 | 0.5 / 0.5 | 7.7 / 7.5 | 1 / 0.8 | 0.92 / 0.98 | 0.81 / 0.82 | 74.7 / 70.9 | **64** / 55.3 |
| Alcaraz | 6.5 / 6.3 | 2.7 / 2.8 | 63.3 / 65.2 | 38.1 / 40.7 | 5.7 / 5.8 | 14.3 / 13.3 | 2.3 / 2.3 | 9.8 / 9.9 | 1.3 / 1.2 | 1.25 / 1.32 | 1.03 / 1.04 | 74.8 / 73.3 | 54.3 / 56.7 |
| Federer | 10.7 / 10.5 | 2.5 / 2.5 | 60.9 / 62 | 34.3 / 39.8 | 9.5 / 9.6 | 16.9 / 16.8 | 0.8 / 0.8 | 13.7 / 15.7 | 0.6 / 0.8 | 1.43 / 1.33 | 1.09 / 1.05 | 77 / 77.3 | 57.6 / 56.2 |
| Sinner | 8.7 / 9.5 | 3.5 / 2.7 | 60.5 / 60.7 | 40.5 / 40.4 | 1.3 / 1.6 | 9.6 / 10.1 | 1 / 1 | 3.6 / 3.7 | 0.6 / 0.5 | 0.89 / 0.98 | 0.85 / 0.92 | 73 / 77 | 52 / 55.3 |
| Medvedev | 11.9 / 11.1 | 5.5 / 5 | 62.7 / 62.8 | 41.3 / 39.7 | 1.1 / 1.1 | 9.4 / 9.6 | 1.1 / 1.2 | 5.3 / 5.3 | 0.7 / 0.9 | 0.7 / 0.74 | 0.75 / 0.76 | 76.5 / 75.8 | 52 / 51.1 |
| Zverev | 11.5 / 11.4 | 3.6 / 3.9 | 71.6 / 69.6 | 33.3 / 35.5 | 2 / 2.7 | 10.7 / 12.2 | 0.5 / 0.6 | 6.6 / 6.1 | 0.7 / 0.6 | 0.91 / 0.93 | 0.99 / 0.93 | 75.8 / 74.8 | 50.7 / 49.9 |
| de Minaur | 5.1 / 4.8 | 3.5 / 3.1 | 59.4 / 58.9 | 38.9 / 38.5 | 1.2 / 1.1 | 11.8 / 12 | 0.3 / 0.5 | 9.1 / 8.5 | 1.1 / 1 | 0.63 / 0.73 | 0.83 / 0.82 | 75.3 / 71.2 | 59.6 / 53.1 |
| Sampras | 14.4 / 14.1 | 4.5 / 4.6 | 57.4 / 58.3 | 32.1 / 36.1 | 53.7 / 52.7 | **40.7** / 34.8 | 0.1 / 0.1 | **11** / 14.4 | 0.8 / 0.8 | 1.61 / 1.68 | 1.21 / 1.21 | 74.8 / 79.4 | 47.6 / 52.8 |
| Borg | 3.8 / 4.4 | 3.4 / 3.2 | 56.1 / 57.3 | 44.9 / 45 | 18.3 / 19 | 22.5 / 23.3 | 0.1 / 0 | 5.1 / 4.8 | 1.7 / 1.8 | 1.05 / 1.07 | 0.72 / 0.66 | 75.8 / 68.8 | 59.8 / 54.7 |
| Agassi | 5.3 / 5.9 | 2.2 / 2.8 | 65.2 / 62.9 | 39.1 / 38.9 | 2 / 1.9 | 9.3 / 9.5 | 0.4 / 0.4 | 3.8 / 3.8 | 1 / 1 | 1.17 / 1.16 | 0.97 / 0.93 | 76.1 / 70.6 | **66.7** / 54.3 |
| Murray | 9.2 / 8.1 | 2.9 / 3.4 | 61 / 58.9 | 40.8 / 38.7 | 1.9 / 2 | 10.2 / 10.9 | 1.2 / 1.1 | 11.5 / 11.4 | 1.3 / 1.6 | 0.97 / 0.79 | 0.89 / 0.79 | 74.1 / 73 | **57.5** / 49.2 |
| McEnroe | 7.4 / 6.6 | 4.7 / 4.3 | 56.4 / 57.9 | **27.9** / 36.2 | 70.6 / 72.5 | 53.8 / 51.2 | 0.4 / 0.5 | **9.4** / 13.1 | 2.2 / 1.9 | 1.6 / 1.62 | 1.17 / 1.18 | 71.1 / 71.5 | **41.6** / 50.4 |

The last two columns, points won on first and second serve, are not fitted. They are the check: they follow from
everything else.

**Where the fit ran out of room.** A number that ends at the edge of its allowed range means the game could not reach
the real figure with it. This round:
- Alcaraz: return points won (return errors)
- Federer: slices, return points won (return errors)
- Zverev: coming in (net)
- Sampras: slices, return points won (return errors)
- Murray: slices
- McEnroe: slices, return points won (return errors)

These are the bold cells above. Closing them needs changes to how the game plays, not to the player's numbers.

### The numbers, before and after

| Player | 1st serve km/h | 1st serve accuracy | 2nd serve accuracy | Return errors | Error scale | Power | Risk | Serve-volley | Net | Drop | Slice | Lob |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Djokovic | 197 → 197 | 0.61 → 0.53 | 0.70 → 0.60 | 2.53 → 2.67 | 1.40 → 1.60 | 0.99 → 0.99 | 0.40 → 0.41 | 0.03 → 0.03 | 1.05 → 1.33 | 0.46 → 0.51 | 1.30 → 1.09 | 0.44 → 0.33 |
| Nadal | 187 → 189 | 0.63 → 0.57 | 0.69 → 0.62 | 1.13 → 1.34 | 1.27 → 1.37 | 1.01 → 1.00 | 0.43 → 0.43 | 0.02 → 0.02 | 0.60 → 0.80 | 0.14 → 0.17 | 1.71 → 1.79 | 0.41 → 0.28 |
| Alcaraz | 197 → 197 | 0.45 → 0.37 | 0.47 → 0.40 | 0.07 → 0.05 | 1.62 → 1.99 | 0.96 → 0.94 | 0.56 → 0.56 | 0.07 → 0.07 | 2.16 → 2.95 | 0.21 → 0.19 | 2.58 → 2.39 | 0.53 → 0.40 |
| Federer | 209 → 213 | 0.48 → 0.37 | 0.44 → 0.33 | 0.00 → 0.00 | 1.72 → 2.06 | 1.01 → 0.99 | 0.57 → 0.56 | 0.12 → 0.12 | 2.97 → 2.80 | 0.30 → 0.27 | 3.00 → 3.00 | 0.14 → 0.08 |
| Sinner | 201 → 202 | 0.55 → 0.47 | 0.54 → 0.51 | 0.27 → 0.28 | 1.53 → 1.77 | 0.95 → 0.95 | 0.47 → 0.47 | 0.02 → 0.02 | 1.46 → 1.67 | 0.36 → 0.31 | 0.40 → 0.33 | 0.10 → 0.07 |
| Medvedev | 204 → 204 | 0.76 → 0.65 | 0.91 → 0.83 | 0.81 → 1.01 | 1.18 → 1.30 | 0.97 → 0.95 | 0.37 → 0.38 | 0.01 → 0.01 | 1.59 → 2.01 | 0.31 → 0.34 | 0.66 → 0.57 | 0.32 → 0.22 |
| Zverev | 196 → 195 | 0.95 → 0.85 | 0.95 → 0.89 | 0.75 → 0.89 | 0.97 → 1.12 | 0.99 → 0.98 | 0.46 → 0.47 | 0.03 → 0.03 | 3.00 → 3.00 | 0.22 → 0.18 | 1.00 → 0.87 | 0.25 → 0.19 |
| de Minaur | 189 → 190 | 0.86 → 0.81 | 0.89 → 0.78 | 1.28 → 1.64 | 0.90 → 1.03 | 0.96 → 0.93 | 0.40 → 0.40 | 0.01 → 0.01 | 0.79 → 0.81 | 0.15 → 0.10 | 1.33 → 1.26 | 0.54 → 0.41 |
| Sampras | 205 → 207 | 0.54 → 0.42 | 0.88 → 0.61 | 0.01 → 0.00 | 1.73 → 2.28 | 1.02 → 0.98 | 0.68 → 0.67 | 0.69 → 0.70 | 0.03 → 0.01 | 0.02 → 0.01 | 3.00 → 3.00 | 0.23 → 0.18 |
| Borg | 192 → 192 | 0.71 → 0.67 | 0.64 → 0.56 | 0.68 → 0.89 | 1.15 → 1.29 | 0.98 → 0.99 | 0.40 → 0.38 | 0.25 → 0.24 | 1.32 → 1.31 | 0.01 → 0.02 | 0.80 → 0.78 | 2.34 → 1.72 |
| Agassi | 193 → 192 | 0.71 → 0.63 | 0.72 → 0.58 | 2.13 → 2.07 | 1.06 → 1.21 | 0.99 → 0.97 | 0.49 → 0.50 | 0.02 → 0.02 | 0.85 → 0.83 | 0.10 → 0.08 | 0.47 → 0.39 | 0.58 → 0.44 |
| Murray | 200 → 202 | 0.56 → 0.60 | 0.57 → 0.62 | 0.36 → 0.95 | 1.49 → 1.43 | 0.90 → 0.96 | 0.41 → 0.40 | 0.03 → 0.03 | 0.67 → 0.78 | 0.49 → 0.43 | 3.00 → 3.00 | 1.09 → 0.89 |
| McEnroe | 190 → 190 | 0.27 → 0.23 | 0.32 → 0.24 | 0.00 → 0.00 | 3.16 → 3.70 | 0.77 → 0.79 | 0.67 → 0.65 | 0.96 → 0.95 | 0.61 → 0.51 | 0.09 → 0.07 | 3.00 → 3.00 | 0.46 → 0.37 |

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
  pick each shot. After a lot of new training, run `node tools/fit-players.js` again.

## Licence

The fitted numbers (`src/players/fitted.js`) and `data/` are derived from the Match Charting Project and carry its
licence, CC BY-NC-SA 4.0: attribution, non-commercial use only, share alike. The game is free and non-commercial.
Selling it would need these numbers replaced.
