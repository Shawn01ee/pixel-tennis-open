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

252 one-set matches between the roster's players, 84 on each surface, against every charted
men's match since 2010 on that surface in the Match Charting Project (hard 3581 matches, clay 1469 matches, grass 532 matches).
Game figures with their 95% interval (bootstrap over the matches); **bold** where the real figure falls outside it.
Nothing here was tuned: the courts are set from the measurements above and this is how they play.

| | Hard: game | real | Clay: game | real | Grass: game | real |
|---|---|---|---|---|---|---|
| Aces (of serve points) | **7.1% [6.2–7.9]** | 9.1% | 5.6% [4.9–6.3] | 5.4% | **7.7% [6.6–8.7]** | 10.6% |
| Double faults | 3.1% [2.6–3.6] | 3.5% | 3.2% [2.8–3.7] | 3.2% | 3.6% [3.2–4.1] | 3.4% |
| First serves in | 63.5% [62.3–64.6] | 62.5% | 62.8% [61.4–64] | 63% | 62.3% [61–64] | 64% |
| Points won behind the first serve | 72.6% [70.8–74.1] | 73% | **70.8% [69.3–72.3]** | 68.8% | 75.4% [74–76.8] | 75% |
| Points won behind the second serve | 52.6% [50–55] | 50.9% | **53.1% [51.4–55]** | 50.2% | **55.3% [53.3–57.4]** | 52.8% |
| Points a player comes to the net | **18.4% [16.7–19.8]** | 11.9% | **18% [16.2–19.6]** | 11.1% | **16.9% [15.3–18.5]** | 14.6% |
| Winners per rally shot | 6.6% [6.1–7.1] | 6.5% | **7.4% [6.8–8]** | 6.6% | **5.8% [5.2–6.4]** | 8% |
| Errors per rally shot (a missed return not counted) | **12.1% [11.6–12.5]** | 14.1% | **11.7% [11.3–12.2]** | 13.7% | **13.7% [13.4–14.2]** | 15.9% |
| Shots per point | **4.86 [4.73–4.98]** | 4.43 | 4.82 [4.69–4.95] | 4.82 | **4.73 [4.62–4.88]** | 3.77 |

How each surface differs from the hard court (reproduced when the game moves the same way, by at least half and at most
twice the real change):

- Aces: Clay -3.7 points real, -1.5 in the game (**not reproduced**); Grass +1.5 points real, +0.6 in the game (**not reproduced**).
- Points won behind the first serve: Clay -4.2 points real, -1.8 in the game (**not reproduced**); Grass +2.0 points real, +2.8 in the game.
- Shots per point: Clay +0.39 real, -0.04 in the game (**not reproduced**); Grass -0.66 real, -0.13 in the game (**not reproduced**).
- Winners per rally shot: Clay +0.1 points real, +0.8 in the game (**not reproduced**); Grass +1.5 points real, -0.8 in the game (**not reproduced**).

Outside the interval: hard aces (of serve points), hard points a player comes to the net, hard errors per rally shot (a missed return not counted), hard shots per point, clay points won behind the first serve, clay points won behind the second serve, clay points a player comes to the net, clay winners per rally shot, clay errors per rally shot (a missed return not counted), grass aces (of serve points), grass points won behind the second serve, grass points a player comes to the net, grass winners per rally shot, grass errors per rally shot (a missed return not counted), grass shots per point.

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
