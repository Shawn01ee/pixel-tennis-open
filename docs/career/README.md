# Career

A career of the player you make. He starts ranked **349**, with 150 points from last season, and goes
as far as his results take him: Challengers, ATP 250s and 500s, Masters 1000s and the four majors, on hard courts,
clay and grass (the majors and their courts: docs/surfaces). The ranking is the real one, the points are the real ones, and how strong the players around him are
comes from real ratings. What has no data behind it is marked **design**.

*This page is written by `tools/career-doc.js` from the game's own files; the statements about the fit are worked out from
its measurements.*

## The year

48 weeks of the year are played, in the shape of the real one: a January hard-court swing to the first major,
February indoors, the two-week March Masters, the clay spring to the clay major, a short grass season to the grass major,
a few weeks of summer clay, the North American hard courts to the last major, the autumn in Asia and indoors. The
off-season is skipped. 103 events (72 on hard courts, 21 on clay, 10 on grass):
4 Grand Slams, 9 Masters 1000, 13 ATP 500, 23 ATP 250 and 54
Challengers. Event names are invented. Each week you enter one event you are ranked high enough for, or train.

| Category | Draw | Matches | Points: W / F / SF / QF / R16 | Entry cut-off | Best ranking that plays it |
|---|---|---|---|---|---|
| Grand Slam | 128 | best of five | 2000 / 1300 / 800 / 400 / 200 | 104 (rule) | 1 (design) |
| ATP Masters 1000 | 64 | best of three | 1000 / 650 / 400 / 200 / 100 | 80 (design) | 1 (design) |
| ATP 500 | 32 | best of three | 500 / 330 / 200 / 100 / 50 | 55 (design) | 3 (design) |
| ATP 250 | 32 | best of three | 250 / 165 / 100 / 50 / 25 | 95 (design) | 8 (design) |
| Challenger 175 | 32 | best of three | 175 / 90 / 50 / 25 / 13 | 150 (design) | 40 (design) |
| Challenger 125 | 32 | best of three | 125 / 64 / 35 / 16 / 8 | 220 (design) | 60 (design) |
| Challenger 100 | 32 | best of three | 100 / 50 / 25 / 14 / 7 | 280 (design) | 80 (design) |
| Challenger 75 | 32 | best of three | 75 / 44 / 22 / 12 / 6 | 380 (design) | 110 (design) |
| Challenger 50 | 32 | best of three | 50 / 25 / 14 / 8 / 4 | none (design) | 150 (design) |

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
500 (9320 points at No. 1, 609 at No. 100, 87 at No. 500;
`data/career/atp-ranking-points-2026-11-16.json`). Your points put you one place behind everyone holding as many or
more. The other players' points do not change: the world is a snapshot, and you move through it.

The top thirteen places are the roster: the thirteen real players, each at his best. Everyone below is invented
(name, country, looks; **design**) and plays like one of the thirteen.

## How strong everyone is

Strength is an **Elo rating**, the way Tennis Abstract rates players. A gap of *d* points gives the stronger player
1/(1+10^(−d/400)) of best-of-three matches: 64% at 100 points, 76% at 200, 85% at 300, 91% at 400 (Tennis Abstract's
own figures). A best-of-five match is played as the same chance of winning each set, over five sets.

- **The thirteen** play at their peak Elo: Tennis Abstract's *The Tennis 128* for the retired, the *Peak Elo* column of
  its ATP Elo list of 16 November 2026 for the active
  (Borg 2473, Djokovic 2470, McEnroe 2442, Federer 2383, Nadal 2370, Murray 2347, Sinner 2340, Sampras 2319, Alcaraz 2309, Agassi 2282, Medvedev 2201, Zverev 2177, de Minaur 2053).
- **An invented player** ranked *r* has Elo **2442.4 − 173.66·ln r**, give or take **90.9** (one standard deviation):
  the least-squares line through the 463 players ranked 1–500 in Tennis Abstract's ATP Elo list of 16 November 2026,
  with that list's own scatter around it (`data/career/atp-elo-by-rank-2026-11-16.json`). No. 14 is about
  1984, No. 100 about 1643, No. 500 about 1363.
- **Matches you do not play** — everyone else's, and yours when you press *Simulate* — are decided by these odds.

### From Elo to the court

An invented player — and yours — plays like the roster player he is modelled on (the same fitted serve, shots,
movement and choices; no signature trait), with **errors and placement spread multiplied by exp(κ·(Ea − E)/400)**,
where *E* is his Elo and *Ea* the roster player's peak. κ is fitted by `tools/fit-levels.js`: two players with the same
model, 0–1000 Elo below its peak, one 200 points below the other, play best-of-three matches; the target, fixed before
any match was played, is Elo's **76.0%** for the stronger.

Result (2026-11-17): **κ = 0.1129**. At the end:

- 200 points apart (the target): 74.4% against Elo's 76.0%: inside the measurement's ±4.7 points, over 336 matches.
- 100 points apart: 63.7% against Elo's 64.0%: inside the measurement's ±5.1 points, over 336 matches.
- 400 points apart: 92.9% against Elo's 90.9%: inside the measurement's ±2.8 points, over 336 matches.

Both checks the fit was not aimed at agree with Elo within their margins, so one number carries the whole range.

The bars on a player card follow from the same numbers: accuracy from the placement spread, control 40 points lower
for every doubling of errors (the card's own scale).

## Your player

| | Value | Basis |
|---|---|---|
| Starting level | 1452 Elo | the Elo at No. 300 on the line above |
| Starting points | 150 (6 × 25, dropping off over the first year) | design |
| Growth | each point of experience closes 0.6% of the gap to 2350 Elo | design |
| Experience | 1 a match, 3 a win, 2 a week of training | design |

Your level is what decides how your player plays on court (as above) and the odds when you simulate. On court you
choose the shots, and timing and aim can beat the odds: that is the game.

## Limits

- The rest of the ranking does not move; nobody else wins or loses points.
- Matches decided by Elo use one rating for every surface; on court, the surface plays its part (docs/surfaces).
- Draws have no qualifying, wild cards or byes; a Masters 1000 is a 64 draw.
- The entry cut-offs below the Grand Slams, the ranking bands, the starting point and the growth are design.
