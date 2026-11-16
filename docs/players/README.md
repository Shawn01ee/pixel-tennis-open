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
| Rally balls cross-court | 62.3% | **48.5%** | 59.2% | Match Charting Project, hard courts since 2010 |
| … down the middle | 4.2% | 26.9% | 26.5% |  |
| … down the line | 33.5% | **24.6%** | 14.2% |  |
| Overheads, share of shots | 8% | **0.7%** | 0.93% |  |
| Volleys, share of shots | 8.1% | **3.9%** | 2.66% |  |
| Points a player comes to the net | 22.7% | **15.4%** | 11.9% |  |
| Rally-ending shots that are winners | 59.8% | **25.9%** | 31.6% |  |
| Metres between a player's shots | 5.96 m | 4.96 m | 4.57 m | Armstrong et al. 2024 (Australian Open, Hawk-Eye) |
| … share over 4.5 m | 72.3% | 51.8% | 51% |  |
| Metres per point | 14 m | 10.4 m | 6.46–10.7 m | Armstrong et al. 2024; Cui et al. 2020 |
| Seconds between shots | 1.344 s | 1.301 s | 1.21 s | Carboch & Sklenářik 2018 |
| Shots per point, serve included | 5.24 | 4.72 | 4.43 | Match Charting Project |

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
   choices are now fitted (`tools/fit-directions.js`) toward the real split.

Bold: more than 15% from the real figure, or outside the real range. Still off after these fixes: rally balls cross-court 48.5% against 59.2%; down the line 24.6% against 14.2%; overheads, share of shots 0.7% against 0.93%; volleys, share of shots 3.9% against 2.66%; points a player comes to the net 15.4% against 11.9%; rally-ending shots that are winners 25.9% against 31.6%. The down-the-line choice already has a fitted weight of 0.036, against 3 for cross-court, so the fit cannot lower that share any further. Where the remaining down-the-line balls come from has not been traced yet.

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
| Djokovic | 364 | 58,609 | hard | 2005–2026 | 7.6 | 2.9 | 64.7 | 73.9 | 55.8 | 40.8 | 2.5 | 11.7 | 1.3 | 7.1 | 1.0 | 5.6 | 10.7 | 16.4 |
| Nadal | 219 | 36,664 | hard | 2004–2024 | 4.7 | 2.5 | 67.6 | 70.9 | 55.3 | 38.0 | 1.8 | 9.0 | 0.6 | 8.1 | 0.8 | 6.3 | 11.5 | 17.8 |
| Alcaraz | 128 | 20,435 | hard | 2021–2026 | 6.3 | 2.8 | 65.2 | 73.3 | 56.7 | 40.7 | 5.8 | 13.3 | 2.5 | 10.9 | 1.4 | 8.6 | 14.7 | 23.3 |
| Federer | 473 | 77,837 | hard | 1998–2021 | 10.5 | 2.5 | 62.0 | 77.3 | 56.2 | 39.8 | 9.6 | 16.8 | 0.9 | 17.3 | 0.8 | 8.7 | 14.7 | 23.4 |
| Sinner | 195 | 30,051 | hard | 2019–2026 | 9.5 | 2.7 | 60.7 | 77.0 | 55.3 | 40.4 | 1.6 | 10.1 | 1.1 | 4.1 | 0.5 | 6.3 | 12.7 | 19.0 |
| Medvedev | 227 | 35,928 | hard | 2017–2026 | 11.1 | 5.0 | 62.8 | 75.8 | 51.1 | 39.7 | 1.1 | 9.6 | 1.3 | 5.7 | 0.9 | 4.7 | 10.4 | 15.1 |
| Zverev | 123 | 19,666 | hard | 2014–2026 | 11.4 | 3.9 | 69.6 | 74.8 | 49.9 | 35.5 | 2.7 | 12.2 | 0.6 | 6.7 | 0.7 | 6.0 | 12.8 | 18.8 |
| de Minaur | 109 | 17,078 | hard | 2017–2026 | 4.8 | 3.1 | 58.9 | 71.2 | 53.1 | 38.5 | 1.1 | 12.0 | 0.5 | 9.2 | 1.0 | 4.7 | 11.8 | 16.5 |
| Sampras | 174 | 30,902 | hard | 1990–2002 | 14.1 | 4.6 | 58.3 | 79.4 | 52.8 | 36.1 | 52.7 | 34.8 | 0.2 | 16.3 | 0.9 | 11.2 | 17.2 | 28.5 |
| Borg | 22 | 4,068 | all | 1974–1991 | 4.4 | 3.2 | 57.3 | 68.8 | 54.7 | 45.0 | 19.0 | 23.3 | 0.0 | 5.1 | 1.9 | 6.7 | 9.5 | 16.2 |
| Agassi | 170 | 30,686 | hard | 1988–2006 | 5.9 | 2.8 | 62.9 | 70.6 | 54.3 | 38.9 | 1.9 | 9.5 | 0.5 | 4.2 | 1.1 | 7.5 | 12.7 | 20.2 |
| Murray | 185 | 31,390 | hard | 2005–2024 | 8.1 | 3.4 | 58.9 | 73.0 | 49.2 | 38.7 | 2.0 | 10.9 | 1.2 | 12.3 | 1.7 | 5.0 | 11.6 | 16.6 |
| McEnroe | 37 | 7,932 | hard | 1979–1992 | 6.6 | 4.3 | 57.9 | 71.5 | 50.4 | 36.2 | 72.5 | 51.2 | 0.6 | 14.9 | 2.1 | 10.9 | 17.3 | 28.2 |
| **Tour** | 7162 | 1,139,202 | hard | 2010–2026 | 9.1 | 3.5 | 62.5 | 73.0 | 50.9 | 35.3 | 4.1 | 11.9 | 1.1 | 10.8 | 1.0 | 6.5 | 14.1 | 20.5 |

All in percent. Aces, double faults, first serves in and serve-and-volley are per serve point. At the net is per
point played. Drops, slices, lobs, winners and errors are per shot, serves excluded. Errors include those the
opponent forced. Aggression is Tennis Abstract's aggression score, (winners + errors) per shot.

## How the numbers are fitted

`node tools/fit-players.js` fits each player's numbers until the game reproduces his statistics.

1. **A tour-average opponent.** It starts from the roster's mean and plays copies of itself, until it serves,
   returns, hits winners and errs, and chooses its shots, like the tour reference above. In the game it hits winners
   on 6.8% of its shots and errors on 13.7%, against 6.5% and 14.1% for real.
2. **Each player against it.** One-set matches, 20 per round for 10 rounds. After each round, every
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
60 one-set matches per player against the tour-average opponent.

| Player | Aces | Double faults | 1st serves in | Return won | Serve-volley | At the net | Drop shots | Slices | Lobs | Winners vs tour | Errors vs tour | 1st serve won | 2nd serve won |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Djokovic | 6.9 / 7.6 | 3.1 / 2.9 | 65.8 / 64.7 | 40.5 / 40.8 | 2.9 / 2.5 | **7.3** / 11.7 | 1.7 / 1.3 | 7.3 / 7.1 | 0.9 / 1 | 0.85 / 0.87 | 0.76 / 0.76 | 75.6 / 73.9 | 55.2 / 55.8 |
| Nadal | 4 / 4.7 | **4.4** / 2.5 | 64.6 / 67.6 | 38 / 38 | 1.6 / 1.8 | **6.7** / 9 | 0.6 / 0.6 | 8.1 / 8.1 | 1 / 0.8 | 0.99 / 0.97 | 0.93 / 0.82 | 73.7 / 70.9 | 52.4 / 55.3 |
| Alcaraz | 6.8 / 6.3 | 3.3 / 2.8 | 66.3 / 65.2 | 41.3 / 40.7 | 6.3 / 5.8 | **11.3** / 13.3 | 2.9 / 2.5 | 10.5 / 10.9 | 1.3 / 1.4 | 1.32 / 1.33 | 1.08 / 1.04 | 76.4 / 73.3 | 56.6 / 56.7 |
| Federer | 10.9 / 10.5 | 2.5 / 2.5 | 62.1 / 62 | 39.4 / 39.8 | 9.2 / 9.6 | 14.9 / 16.8 | 0.9 / 0.9 | **11.4** / 17.3 | 0.8 / 0.8 | 1.25 / 1.34 | 1.04 / 1.05 | 80.9 / 77.3 | 63.8 / 56.2 |
| Sinner | 10.1 / 9.5 | 2.2 / 2.7 | 60.6 / 60.7 | 40.3 / 40.4 | 1.6 / 1.6 | 8.9 / 10.1 | 0.9 / 1.1 | 3.9 / 4.1 | 0.7 / 0.5 | 0.98 / 0.97 | 0.85 / 0.91 | 77.8 / 77 | 60.4 / 55.3 |
| Medvedev | 10.2 / 11.1 | 4.4 / 5 | 62.4 / 62.8 | 42.2 / 39.7 | 1.1 / 1.1 | **5.9** / 9.6 | 1.1 / 1.3 | 5.4 / 5.7 | 0.8 / 0.9 | 0.84 / 0.73 | 0.69 / 0.74 | 77.2 / 75.8 | 56.3 / 51.1 |
| Zverev | 11.1 / 11.4 | 4.1 / 3.9 | 66.7 / 69.6 | 36.8 / 35.5 | 2.7 / 2.7 | **8.2** / 12.2 | 0.7 / 0.6 | 6.4 / 6.7 | 0.7 / 0.7 | 0.89 / 0.93 | 0.94 / 0.91 | 75.7 / 74.8 | 51.8 / 49.9 |
| de Minaur | 5 / 4.8 | 3.2 / 3.1 | 61.2 / 58.9 | 41.1 / 38.5 | 1.4 / 1.1 | 12.4 / 12 | 0.6 / 0.5 | 9.5 / 9.2 | 0.9 / 1 | 0.75 / 0.72 | 0.83 / 0.84 | 71.5 / 71.2 | 57 / 53.1 |
| Sampras | 15.6 / 14.1 | 4.1 / 4.6 | 59.4 / 58.3 | 37.1 / 36.1 | 52.7 / 52.7 | 35.6 / 34.8 | 0.1 / 0.2 | **11.6** / 16.3 | 0.9 / 0.9 | 1.61 / 1.73 | 1.21 / 1.22 | 83.7 / 79.4 | 55.4 / 52.8 |
| Borg | 5.4 / 4.4 | 2.8 / 3.2 | 59.2 / 57.3 | 47 / 45 | 20 / 19 | **19.4** / 23.3 | 0.1 / 0 | 5.7 / 5.1 | 2.1 / 1.9 | 1 / 1.04 | 0.63 / 0.68 | 77.9 / 68.8 | **65.6** / 54.7 |
| Agassi | 5.9 / 5.9 | 3.1 / 2.8 | 59.6 / 62.9 | 36.1 / 38.9 | 1.9 / 1.9 | 8.9 / 9.5 | 0.5 / 0.5 | 4.4 / 4.2 | 1.1 / 1.1 | 1.08 / 1.16 | 0.88 / 0.9 | 76.2 / 70.6 | 57.9 / 54.3 |
| Murray | 8.1 / 8.1 | 3.8 / 3.4 | 59.2 / 58.9 | 38.6 / 38.7 | 2.1 / 2 | **7.9** / 10.9 | 1.4 / 1.2 | 11.1 / 12.3 | 1.6 / 1.7 | 0.77 / 0.78 | 0.87 / 0.82 | 73.2 / 73 | 46.6 / 49.2 |
| McEnroe | 6.6 / 6.6 | 4.1 / 4.3 | 57.3 / 57.9 | 30.9 / 36.2 | 71.8 / 72.5 | 50.7 / 51.2 | 0.5 / 0.6 | **10.5** / 14.9 | 2.2 / 2.1 | 1.64 / 1.68 | 1.16 / 1.23 | 76.8 / 71.5 | 52.5 / 50.4 |

The last two columns, points won on first and second serve, are not fitted. They are the check: they follow from
everything else.

**Where the fit ran out of room.** A number that ends at the edge of its allowed range means the game could not reach
the real figure with it. This round:
- Djokovic: coming in (net)
- Nadal: coming in (net)
- Alcaraz: coming in (net), slices
- Federer: coming in (net), slices, return points won (return errors)
- Sinner: coming in (net)
- Medvedev: coming in (net)
- Zverev: coming in (net)
- Sampras: slices, return points won (return errors)
- Borg: coming in (net)
- Murray: coming in (net), slices
- McEnroe: slices, return points won (return errors)

These are the bold cells above. Closing them needs changes to how the game plays, not to the player's numbers.

### The numbers, before and after

| Player | 1st serve km/h | 1st serve accuracy | 2nd serve accuracy | Return errors | Error scale | Power | Risk | Serve-volley | Net | Drop | Slice | Lob |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Djokovic | 197 → 200 | 0.39 → 0.37 | 0.47 → 0.43 | 1.83 → 2.04 | 2.05 → 2.15 | 0.90 → 0.94 | 0.40 → 0.40 | 0.03 → 0.03 | 3.00 → 3.00 | 0.63 → 0.80 | 1.86 → 1.94 | 0.62 → 0.56 |
| Nadal | 186 → 186 | 0.44 → 0.45 | 0.45 → 0.52 | 0.91 → 0.96 | 1.78 → 1.84 | 0.94 → 1.00 | 0.43 → 0.43 | 0.02 → 0.02 | 3.00 → 3.00 | 0.32 → 0.36 | 1.76 → 1.99 | 0.40 → 0.34 |
| Alcaraz | 198 → 200 | 0.35 → 0.37 | 0.42 → 0.43 | 0.07 → 0.13 | 2.01 → 2.00 | 0.93 → 0.95 | 0.57 → 0.57 | 0.07 → 0.07 | 3.00 → 3.00 | 0.29 → 0.33 | 2.83 → 3.00 | 0.46 → 0.55 |
| Federer | 204 → 205 | 0.37 → 0.36 | 0.35 → 0.33 | 0.03 → 0.03 | 2.10 → 2.16 | 0.93 → 0.96 | 0.57 → 0.57 | 0.12 → 0.12 | 3.00 → 3.00 | 0.40 → 0.45 | 3.00 → 3.00 | 0.24 → 0.27 |
| Sinner | 201 → 204 | 0.42 → 0.42 | 0.41 → 0.39 | 0.36 → 0.42 | 2.03 → 2.01 | 0.91 → 0.94 | 0.46 → 0.46 | 0.02 → 0.02 | 2.58 → 3.00 | 0.76 → 0.94 | 0.32 → 0.26 | 0.06 → 0.08 |
| Medvedev | 201 → 199 | 0.53 → 0.55 | 0.69 → 0.64 | 0.82 → 0.90 | 1.50 → 1.56 | 0.89 → 0.93 | 0.37 → 0.37 | 0.01 → 0.01 | 3.00 → 3.00 | 0.56 → 0.56 | 0.67 → 0.71 | 0.28 → 0.26 |
| Zverev | 190 → 190 | 0.75 → 0.74 | 0.77 → 0.65 | 0.70 → 0.76 | 1.27 → 1.34 | 0.95 → 0.97 | 0.46 → 0.46 | 0.03 → 0.03 | 3.00 → 3.00 | 0.32 → 0.35 | 0.67 → 0.62 | 0.08 → 0.06 |
| de Minaur | 190 → 190 | 0.48 → 0.54 | 0.50 → 0.54 | 0.71 → 0.91 | 1.61 → 1.47 | 0.80 → 0.91 | 0.40 → 0.40 | 0.01 → 0.01 | 2.17 → 1.91 | 0.16 → 0.17 | 1.54 → 1.77 | 0.35 → 0.39 |
| Sampras | 200 → 201 | 0.40 → 0.46 | 0.61 → 0.63 | 0.02 → 0.04 | 2.27 → 2.13 | 1.00 → 1.02 | 0.69 → 0.69 | 0.66 → 0.68 | 0.09 → 0.09 | 0.05 → 0.05 | 3.00 → 3.00 | 0.21 → 0.28 |
| Borg | 191 → 192 | 0.53 → 0.52 | 0.41 → 0.38 | 0.61 → 0.76 | 1.61 → 1.55 | 0.87 → 0.94 | 0.39 → 0.39 | 0.25 → 0.25 | 3.00 → 3.00 | 0.01 → 0.02 | 0.84 → 0.99 | 1.20 → 1.43 |
| Agassi | 194 → 196 | 0.45 → 0.45 | 0.40 → 0.37 | 1.35 → 1.29 | 1.62 → 1.72 | 0.91 → 0.94 | 0.49 → 0.49 | 0.02 → 0.02 | 2.18 → 2.56 | 0.30 → 0.30 | 0.48 → 0.51 | 0.35 → 0.35 |
| Murray | 203 → 203 | 0.41 → 0.39 | 0.43 → 0.41 | 0.52 → 0.48 | 2.26 → 2.25 | 0.74 → 0.79 | 0.40 → 0.40 | 0.03 → 0.03 | 3.00 → 3.00 | 0.66 → 0.71 | 3.00 → 3.00 | 0.83 → 0.86 |
| McEnroe | 189 → 195 | 0.19 → 0.22 | 0.23 → 0.24 | 0.00 → 0.00 | 4.06 → 3.74 | 0.83 → 0.87 | 0.69 → 0.69 | 0.90 → 0.97 | 1.00 → 1.17 | 0.22 → 0.18 | 3.00 → 3.00 | 1.07 → 1.04 |

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
