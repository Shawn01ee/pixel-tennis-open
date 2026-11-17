# The four majors and their courts

The game has four majors of its own, in the spirit of the real four (names, colours and dress codes are invented or
**design**; the surfaces are measured):

| Major | When | Surface | Session | Dress |
|---|---|---|---|---|
| Pixel Tennis Open | January | hard | day | own kit |
| Terre Battue Open | late May | clay | day | own kit |
| Old Lawn Championships | late June | grass | day | all white |
| Big City Open | late August | hard | night | own kit |

All four are played to the Grand Slam rules: best of five sets for the men, a 10-point tiebreak at 6–6 in the fifth
set. They can be played as a Tournament or an Exhibition, and they are the Grand Slams of the career's year, which now
has a clay spring and a grass season (docs/career).

*This page is written by `tools/surfaces-doc.js` from the game's files and `tools/surface-check.js`'s measurements
(2026-11-17).*

## The courts

A bounce is set by two numbers: how much of the ball's vertical speed comes back (the coefficient of restitution,
COR), and how hard the court grips the ball as it slides (the coefficient of sliding friction, COF; the ITF rates a
court's pace as 100 × (1 − COF)).

| | COF (sliding friction) | Vertical bounce | Basis |
|---|---|---|---|
| Hard | 0.62 | COR 0.758 from 254 cm | ITF drop test for the ball (135–147 cm rebound); a 200 km/h serve's loss of speed through the bounce |
| Clay | 0.8 | COR 0.758, as hard | COF of a court built like European clay, 15–35 m/s (Cross 2003, Table 1). A vertical drop rebounds as on a hard court: COR 0.77 on both the acrylic and the crushed-brick court (Thorpe & Canaway 1986, via Cross 2003) |
| Grass | 0.64 | COR 0.640 | COF of the grass centre court at Kooyong, then a Grand Slam's (Thorpe & Canaway, via Cross 2003). Vertical drop COR 0.65 on grass against 0.77 on the other courts (same tests): the hard court's bounce × 0.65/0.77 |

Design, not data: a grass court now and then kicks a ball off a tuft, its baselines are worn to bare earth (a deader
bounce there), and players slide into their shots on clay.

Measured in the game the way Cross measured real courts (a ball without spin at 30 m/s, 16° to the court):
hard COF 0.632, COR 0.737 (ITF pace 37; the ball keeps 68.5% of its speed along the court); clay COF 0.807, COR 0.738 (ITF pace 19; the ball keeps 59.8% of its speed along the court); grass COF 0.653, COR 0.589 (ITF pace 35; the ball keeps 70.2% of its speed along the court).
Real oblique bounces come back higher than vertical ones: Cross (2003) gives COR 0.8–0.9 on most courts and on clay,
0.6–0.9 on grass depending on its condition. **The game's oblique bounce is lower: COR 0.737 on hard, 0.738 on clay, 0.589 on grass.** Its bounce is set by the vertical drop and does not rise with the angle of impact, so clay does not bounce higher than a hard court.

## How the game plays on each

252 one-set matches between two copies of the game's tour-average player (the player fitted to the
real tour on hard courts by `tools/fit-players.js`), 84 on each surface, against every charted
men's match since 2010 on that surface in the Match Charting Project (hard 3581 matches, clay 1469 matches, grass 532 matches).
Counted the same way on both sides: net points by the project's own rule (`tools/netpoints.js`); winners and errors
per ball struck after the serve, every error counted, forced or not, the return's too (the project's shot tables
leave out a hitter's forced errors, and forced errors on the return sit in its serve table, so
`tools/mcp_surfaces.py` adds them back: the game cannot tell a forced error from an unforced one); shots per point
are every ball struck plus one serve. Game figures with their 95% interval (bootstrap over the matches); **bold**
where the real figure falls outside it.
Nothing here was tuned: the courts are set from the measurements above and this is how they play.

| | Hard: game | real | Clay: game | real | Grass: game | real |
|---|---|---|---|---|---|---|
| Aces (of serve points) | 8.9% [8.1–9.6] | 9.1% | **7.1% [6.5–7.8]** | 5.4% | 10.7% [10–11.5] | 10.6% |
| Double faults | **3.1% [2.6–3.5]** | 3.5% | 3.3% [2.8–3.7] | 3.2% | 3.7% [3.1–4.2] | 3.4% |
| First serves in | **64.3% [63.2–65.4]** | 62.5% | **64.3% [63.2–65.4]** | 63% | 63.5% [62.1–64.8] | 64% |
| Points won behind the first serve | 73.2% [71.9–74.7] | 73% | **70.3% [69.1–71.9]** | 68.8% | **76.4% [75.2–77.5]** | 75% |
| Points won behind the second serve | **53.8% [51.6–56.1]** | 50.9% | **52.7% [50.3–54.9]** | 50.2% | 54.1% [51.9–56.6] | 52.8% |
| Net points (the project's own rule) | **12.6% [12–13.3]** | 11.9% | **11.9% [11.3–12.4]** | 11.1% | **10.1% [9.5–10.6]** | 14.6% |
| Winners per ball struck | 5.8% [5.5–6.1] | 5.9% | **6.4% [6.2–6.8]** | 6.1% | **5.2% [4.9–5.5]** | 7.1% |
| Errors per ball struck | 17.2% [16.6–17.8] | 17.3% | **17.3% [16.7–17.8]** | 16% | 20.3% [19.8–20.8] | 20.3% |
| Shots per point | 4.82 [4.72–4.92] | 4.76 | **4.76 [4.68–4.87]** | 5.14 | **4.33 [4.26–4.41]** | 4.14 |

How each surface differs from the hard court (reproduced when the game moves the same way, by at least half and at most
twice the real change):

- Aces: Clay -3.7 points real, -1.8 in the game (**not reproduced**); Grass +1.5 points real, +1.8 in the game.
- Points won behind the first serve: Clay -4.2 points real, -2.9 in the game; Grass +2.0 points real, +3.2 in the game.
- Shots per point: Clay +0.38 real, -0.06 in the game (**not reproduced**); Grass -0.62 real, -0.49 in the game.
- Winners per ball struck: Clay +0.2 points real, +0.6 in the game (**not reproduced**); Grass +1.2 points real, -0.6 in the game (**not reproduced**).

Outside the interval: hard double faults, hard first serves in, hard points won behind the second serve, hard net points (the project's own rule), clay aces (of serve points), clay first serves in, clay points won behind the first serve, clay points won behind the second serve, clay net points (the project's own rule), clay winners per ball struck, clay errors per ball struck, clay shots per point, grass points won behind the first serve, grass net points (the project's own rule), grass winners per ball struck, grass shots per point.

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
- Tennis Abstract Match Charting Project (CC BY-NC-SA 4.0), `data/mcp-surfaces.json` (`tools/mcp_surfaces.py`).
