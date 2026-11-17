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
| Rally balls cross-court | 71.9% | 59.5% | 59.3% | Match Charting Project, hard courts since 2010 |
| … down the middle | 5.7% | 27.7% | 26.5% |  |
| … down the line | 22.3% | 12.8% | 14.2% |  |
| Overheads, share of shots | 8% | **0.7%** | 0.93% |  |
| Volleys, share of shots | 8.1% | **4.6%** | 2.66% |  |
| Points a player comes to the net | 22.7% | 17.6% | 17.3% | the thirteen players' own average |
| Rally-ending shots that are winners | 59.8% | 27.7% | 28.7% |  |
| Metres between a player's shots | 5.96 m | 5.22 m | 4.57 m | Armstrong et al. 2024 (Australian Open, Hawk-Eye) |
| … share over 4.5 m | 72.3% | 58.1% | 51% |  |
| Metres per point | 14 m | **12.9 m** | 6.46–10.7 m | Armstrong et al. 2024; Cui et al. 2020 |
| Seconds between shots | 1.344 s | 1.325 s | 1.21 s | Carboch & Sklenářik 2018 |
| Shots per point, serve included | 5.24 | 5.16 | 4.95 | Match Charting Project, the thirteen players' own average |

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

Bold: more than 15% from the real figure, or outside the real range. Still off after these fixes: overheads, share of shots 0.7% against 0.93%; volleys, share of shots 4.6% against 2.66%; metres per point 12.9 m against 6.46–10.7 m.

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
| Djokovic | 8.5 / 7.6 | 1.8 / 2.9 | 65.3 / 64.7 | 39.8 / 40.8 | 2.1 / 2.5 | 12.5 / 11.7 | 1.2 / 1.2 | 7 / 6.6 | 1.3 / 1 | 0.85 / 0.88 | 0.86 / 0.8 | 73.4 / 73.9 | 61.8 / 55.8 |
| Nadal | 5.1 / 4.7 | 3 / 2.5 | 69.9 / 67.6 | 37.7 / 38 | 2.1 / 1.8 | 10 / 9 | 0.4 / 0.5 | 7.4 / 7.5 | 0.6 / 0.8 | 1.07 / 0.98 | 0.83 / 0.82 | 79.8 / 70.9 | 58.9 / 55.3 |
| Alcaraz | 6 / 6.3 | 3.1 / 2.8 | 63.1 / 65.2 | 39.3 / 40.7 | 5.9 / 5.8 | 14 / 13.3 | 2.3 / 2.3 | 9.6 / 9.9 | 1.1 / 1.2 | 1.36 / 1.32 | 1.07 / 1.04 | 72.1 / 73.3 | 57.3 / 56.7 |
| Federer | 10.9 / 10.5 | 3 / 2.5 | 61.1 / 62 | 36.6 / 39.8 | 9.1 / 9.6 | 16.9 / 16.8 | 0.8 / 0.8 | 14.7 / 15.7 | 0.9 / 0.8 | 1.39 / 1.33 | 1.02 / 1.05 | 76 / 77.3 | 52.3 / 56.2 |
| Sinner | 9.9 / 9.5 | 2.3 / 2.7 | 58.1 / 60.7 | 40.8 / 40.4 | 1.2 / 1.6 | 10.3 / 10.1 | 1 / 1 | 3.6 / 3.7 | 0.5 / 0.5 | 1.05 / 0.98 | 0.89 / 0.92 | 74.5 / 77 | 59.2 / 55.3 |
| Medvedev | 11 / 11.1 | 5.1 / 5 | 61.7 / 62.8 | 40.4 / 39.7 | 1.2 / 1.1 | 9.1 / 9.6 | 1 / 1.2 | 5.6 / 5.3 | 0.9 / 0.9 | 0.7 / 0.74 | 0.72 / 0.76 | 75.3 / 75.8 | 57 / 51.1 |
| Zverev | 10.8 / 11.4 | 3.3 / 3.9 | 70.7 / 69.6 | 36.6 / 35.5 | 2.5 / 2.7 | 12 / 12.2 | 0.6 / 0.6 | 6.1 / 6.1 | 0.6 / 0.6 | 1 / 0.93 | 0.91 / 0.93 | 75.9 / 74.8 | 53.1 / 49.9 |
| de Minaur | 5.2 / 4.8 | 3.7 / 3.1 | 58.2 / 58.9 | 36.4 / 38.5 | 0.8 / 1.1 | 10.9 / 12 | 0.5 / 0.5 | 8.7 / 8.5 | 1.3 / 1 | 0.69 / 0.73 | 0.81 / 0.82 | 76.9 / 71.2 | 60.4 / 53.1 |
| Sampras | 14.6 / 14.1 | 4 / 4.6 | 59.5 / 58.3 | **30.4** / 36.1 | 52.1 / 52.7 | **40.2** / 34.8 | 0.1 / 0.1 | **12** / 14.4 | 1.2 / 0.8 | 1.74 / 1.68 | 1.23 / 1.21 | 77.1 / 79.4 | 51.3 / 52.8 |
| Borg | 5 / 4.4 | 2.6 / 3.2 | 55.7 / 57.3 | 41.8 / 45 | 20 / 19 | 23 / 23.3 | 0.1 / 0 | 4.9 / 4.8 | 2.1 / 1.8 | 1 / 1.07 | 0.71 / 0.66 | 76.8 / 68.8 | **63.8** / 54.7 |
| Agassi | 4.9 / 5.9 | 2.6 / 2.8 | 61.4 / 62.9 | 41.1 / 38.9 | 2.2 / 1.9 | 9.9 / 9.5 | 0.5 / 0.4 | 3.9 / 3.8 | 1 / 1 | 1.02 / 1.16 | 0.87 / 0.93 | 76.4 / 70.6 | 61.8 / 54.3 |
| Murray | 7.5 / 8.1 | 3.1 / 3.4 | 58.2 / 58.9 | 37.7 / 38.7 | 1.6 / 2 | 10.7 / 10.9 | 1.1 / 1.1 | 11.2 / 11.4 | 1.5 / 1.6 | 0.8 / 0.79 | 0.75 / 0.79 | 74.5 / 73 | **60.1** / 49.2 |
| McEnroe | 5.3 / 6.6 | 4.5 / 4.3 | 56.3 / 57.9 | **26.4** / 36.2 | 70.1 / 72.5 | 53.6 / 51.2 | 0.3 / 0.5 | **11.1** / 13.1 | 2.2 / 1.9 | 1.6 / 1.62 | 1.21 / 1.18 | 67 / 71.5 | **41.9** / 50.4 |

The last two columns, points won on first and second serve, are not fitted. They are the check: they follow from
everything else.

**Where the fit ran out of room.** A number that ends at the edge of its allowed range means the game could not reach
the real figure with it. This round:
- Alcaraz: return points won (return errors)
- Federer: slices, return points won (return errors)
- Zverev: coming in (net)
- Sampras: slices, return points won (return errors)
- McEnroe: slices, return points won (return errors)

These are the bold cells above. Closing them needs changes to how the game plays, not to the player's numbers.

### The numbers, before and after

| Player | 1st serve km/h | 1st serve accuracy | 2nd serve accuracy | Return errors | Error scale | Power | Risk | Serve-volley | Net | Drop | Slice | Lob |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Djokovic | 197 → 199 | 0.53 → 0.52 | 0.60 → 0.56 | 2.67 → 3.04 | 1.60 → 1.54 | 0.99 → 0.94 | 0.41 → 0.41 | 0.03 → 0.03 | 1.33 → 1.01 | 0.51 → 0.35 | 1.09 → 0.91 | 0.33 → 0.30 |
| Nadal | 189 → 188 | 0.57 → 0.63 | 0.62 → 0.68 | 1.34 → 1.67 | 1.37 → 1.21 | 1.00 → 0.98 | 0.43 → 0.43 | 0.02 → 0.02 | 0.80 → 0.65 | 0.17 → 0.14 | 1.79 → 1.23 | 0.28 → 0.23 |
| Alcaraz | 197 → 196 | 0.37 → 0.37 | 0.40 → 0.44 | 0.05 → 0.03 | 1.99 → 2.00 | 0.94 → 0.92 | 0.56 → 0.56 | 0.07 → 0.07 | 2.95 → 2.15 | 0.19 → 0.17 | 2.39 → 2.00 | 0.40 → 0.34 |
| Federer | 213 → 210 | 0.37 → 0.41 | 0.33 → 0.41 | 0.00 → 0.00 | 2.06 → 1.94 | 0.99 → 0.98 | 0.56 → 0.56 | 0.12 → 0.12 | 2.80 → 2.74 | 0.27 → 0.26 | 3.00 → 3.00 | 0.08 → 0.12 |
| Sinner | 202 → 201 | 0.47 → 0.47 | 0.51 → 0.44 | 0.28 → 0.25 | 1.77 → 1.82 | 0.95 → 0.93 | 0.47 → 0.47 | 0.02 → 0.02 | 1.67 → 1.59 | 0.31 → 0.31 | 0.33 → 0.26 | 0.07 → 0.04 |
| Medvedev | 204 → 204 | 0.65 → 0.68 | 0.83 → 0.83 | 1.01 → 1.10 | 1.30 → 1.24 | 0.95 → 0.91 | 0.38 → 0.38 | 0.01 → 0.01 | 2.01 → 1.45 | 0.34 → 0.24 | 0.57 → 0.45 | 0.22 → 0.14 |
| Zverev | 195 → 194 | 0.85 → 0.93 | 0.89 → 0.88 | 0.89 → 1.03 | 1.12 → 1.01 | 0.98 → 0.98 | 0.47 → 0.47 | 0.03 → 0.03 | 3.00 → 3.00 | 0.18 → 0.15 | 0.87 → 0.76 | 0.19 → 0.15 |
| de Minaur | 190 → 189 | 0.81 → 0.82 | 0.78 → 0.84 | 1.64 → 1.86 | 1.03 → 0.97 | 0.93 → 0.90 | 0.40 → 0.40 | 0.01 → 0.01 | 0.81 → 0.74 | 0.10 → 0.12 | 1.26 → 1.03 | 0.41 → 0.39 |
| Sampras | 207 → 205 | 0.42 → 0.42 | 0.61 → 0.63 | 0.00 → 0.00 | 2.28 → 2.17 | 0.98 → 0.96 | 0.67 → 0.67 | 0.70 → 0.69 | 0.01 → 0.01 | 0.01 → 0.01 | 3.00 → 3.00 | 0.18 → 0.12 |
| Borg | 192 → 192 | 0.67 → 0.74 | 0.56 → 0.58 | 0.89 → 1.06 | 1.29 → 1.20 | 0.99 → 0.94 | 0.38 → 0.38 | 0.24 → 0.25 | 1.31 → 1.13 | 0.02 → 0.02 | 0.78 → 0.65 | 1.72 → 1.47 |
| Agassi | 192 → 193 | 0.63 → 0.66 | 0.58 → 0.62 | 2.07 → 1.84 | 1.21 → 1.15 | 0.97 → 0.92 | 0.50 → 0.50 | 0.02 → 0.02 | 0.83 → 0.64 | 0.08 → 0.07 | 0.39 → 0.32 | 0.44 → 0.42 |
| Murray | 202 → 200 | 0.60 → 0.68 | 0.62 → 0.64 | 0.95 → 1.21 | 1.43 → 1.32 | 0.96 → 0.81 | 0.40 → 0.40 | 0.03 → 0.03 | 0.78 → 0.64 | 0.43 → 0.33 | 3.00 → 2.36 | 0.89 → 0.66 |
| McEnroe | 190 → 189 | 0.23 → 0.23 | 0.24 → 0.24 | 0.00 → 0.00 | 3.70 → 3.65 | 0.79 → 0.80 | 0.65 → 0.65 | 0.95 → 0.96 | 0.51 → 0.39 | 0.07 → 0.05 | 3.00 → 3.00 | 0.37 → 0.45 |

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
