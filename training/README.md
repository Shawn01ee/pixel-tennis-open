# How the players learn

The computer players are not scripted. Each one keeps a table of **what has worked for it** — which serve to which
corner, cross-court or down the line, when to come in, how to pass a player at the net — and that table is filled in
by playing. This page is the record of that learning. It is rebuilt by `tools/train.js` every time the players train
(a GitHub Action runs it daily), so the numbers below are the current ones.

## The result

<picture><source media="(prefers-color-scheme: dark)" srcset="learning-dark.svg"><img src="learning-light.svg" alt="Learning curve: share of points trained players win against untrained twins, by rounds of self-play"></picture>

After **12 rounds** of self-play (75,965 points), a trained player wins **55.8% of points** and
**75.6% of sets** against an untrained copy of itself — same serve, same speed, same strokes, only the decisions
differ. Before any training the same measurement gave 50.9% (50% is the expected value; the rest is noise in
a sample of 2,505 points).

<picture><source media="(prefers-color-scheme: dark)" srcset="players-dark.svg"><img src="players-light.svg" alt="Share of points each trained player wins against its untrained twin"></picture>

| Date | Rounds | Points played in training | Points won vs untrained twin | Sets won | Points in the sample |
|---|---|---|---|---|---|
| 2026-11-15 | 0 | 0 | 50.9% | 59.6% | 2,505 |
| 2026-11-15 | 1 | 6,343 | 54.1% | 76.9% | 2,211 |
| 2026-11-15 | 2 | 12,693 | 55.5% | 84.6% | 2,295 |
| 2026-11-15 | 3 | 19,332 | 57.3% | 82.7% | 2,080 |
| 2026-11-15 | 4 | 25,832 | 55.6% | 80.8% | 2,188 |
| 2026-11-15 | 5 | 32,077 | 57.2% | 84.6% | 1,993 |
| 2026-11-15 | 6 | 38,094 | 57.4% | 84.6% | 2,011 |
| 2026-11-15 | 7 | 44,630 | 56.3% | 80.8% | 2,189 |
| 2026-11-15 | 8 | 50,983 | 57.9% | 86.5% | 2,008 |
| 2026-11-15 | 12 | 75,965 | 55.8% | 75.6% | 3,251 |

Each row is one measurement. A single measurement of all players is good to about ±1 percentage point; one player's
bar in the second chart rests on far fewer points and is good to about ±3.

## The model

- **Situations.** A choice is always made in a situation the player can see: first or second serve and which court;
  returning a first or a second serve, and whether the server is coming in; the first ball after the player's own
  serve; a forehand or backhand rally ball, with the opponent covering the cross-court, in the middle or caught on
  the line side, and with or without time to set up; a short ball; the opponent at the net; at full stretch.
- **Choices.** In each situation there is a short list of tactics (where to serve and with which serve, cross-court,
  down the line, sharp angle, slice, drop shot, lob, into the open court, behind the opponent, heavy and deep, low at
  the feet, approach, the two passing shots), each with a base weight from the player's style.
- **Reward.** When a point ends, every choice the winner made in it is credited (+1) and every choice the loser made
  is blamed (−1), the latest choice in full and each earlier one 0.6 times as much as the one after it.
- **Update.** Each choice keeps a value *q* between −1 and 1, moved a small step toward each new result
  (*q* ← *q* + α·(*r* − *q*), α = 0.03 in training, 0.05 in match play).
- **Policy.** A tactic is chosen with probability proportional to *weight · e^(β·q)* (β = 1.5 in training so the
  players keep trying things, 2.6 in match play so they use what they know). Nothing is ever ruled out.
- **Self-play.** In a round every player plays a short set against every other player, serving first once and second
  once, all learning at the same time — so each one is learning against opponents who are learning too.
- **In the game.** The published game starts from these values. On Rookie the opponent ignores them, on Pro and
  Legend it plays them, and it keeps learning from the person it is playing; that part stays in the browser.

## The playbook

What each player came to prefer and to avoid. The number is how far the tactic's learned value sits above or below
the average of the other choices in the same situation.

<details><summary><b>Djokovic</b> — 66.1% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.88 |
| Opponent at the net, forehand | pass down the line | +0.84 |
| First ball after own serve, backhand | cross-court | +0.74 |
| Forehand rally, opponent caught on the line side | hard into the open court | +0.70 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.72 |
| Opponent at the net, backhand | low at the feet | -0.64 |
| Short ball, opponent covering cross-court | approach and come in | -0.58 |

</details>

<details><summary><b>Nadal</b> — 54.5% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.73 |
| Opponent at the net, forehand | pass down the line | +0.66 |
| Forehand rally, opponent in the middle | cross-court | +0.53 |
| Forehand rally, opponent caught on the line side | cross-court | +0.53 |

| Situation | Avoids | Value |
|---|---|---|
| Short ball, opponent covering cross-court | approach and come in | -0.64 |
| Opponent at the net, backhand | low at the feet | -0.58 |
| First ball after own serve, backhand | drop shot | -0.50 |

</details>

<details><summary><b>Alcaraz</b> — 56.6% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Forehand rally, opponent covering cross-court | sharp angle | +0.66 |
| Opponent at the net, backhand | pass down the line | +0.61 |
| Opponent at the net, forehand | pass down the line | +0.56 |
| Backhand rally, opponent covering cross-court | sharp angle | +0.55 |

| Situation | Avoids | Value |
|---|---|---|
| Forehand rally, opponent caught on the line side | down the line | -0.47 |
| First ball after own serve, backhand | slice | -0.46 |
| Short ball, opponent covering cross-court | approach and come in | -0.42 |

</details>

<details><summary><b>Federer</b> — 51.9% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| First ball after own serve, backhand | cross-court | +0.68 |
| Opponent at the net, backhand | pass down the line | +0.66 |
| Opponent at the net, forehand | pass down the line | +0.58 |
| First ball after own serve, forehand | cross-court | +0.53 |

| Situation | Avoids | Value |
|---|---|---|
| First ball after own serve, forehand | drop shot | -0.49 |
| Opponent at the net, forehand | low at the feet | -0.41 |
| Opponent at the net, forehand | lob | -0.39 |

</details>

<details><summary><b>Sinner</b> — 54.7% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.69 |
| Forehand rally, opponent caught on the line side | cross-court | +0.60 |
| Opponent at the net, forehand | pass down the line | +0.59 |
| Forehand rally, opponent covering cross-court | cross-court | +0.53 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.54 |
| Opponent at the net, backhand | lob | -0.49 |
| First ball after own serve, forehand | drop shot | -0.46 |

</details>

<details><summary><b>Medvedev</b> — 53.7% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.91 |
| Opponent at the net, forehand | pass down the line | +0.79 |
| First ball after own serve, backhand | cross-court | +0.63 |
| Short ball, opponent covering cross-court | cross-court | +0.57 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.54 |
| Short ball, opponent covering cross-court | approach and come in | -0.53 |
| Opponent at the net, backhand | low at the feet | -0.53 |

</details>

<details><summary><b>Zverev</b> — 53.5% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, forehand | pass down the line | +0.62 |
| Opponent at the net, backhand | pass down the line | +0.54 |
| Short ball, opponent covering cross-court | cross-court | +0.48 |
| Short ball, opponent covering cross-court | sharp angle | +0.41 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.51 |
| Return of a second serve | down the line | -0.44 |
| Short ball, opponent covering cross-court | approach and come in | -0.44 |

</details>

<details><summary><b>de Minaur</b> — 54.4% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, forehand | pass down the line | +0.75 |
| Opponent at the net, backhand | pass down the line | +0.62 |
| Return of a first serve | lob | +0.38 |
| First ball after own serve, backhand | cross-court | +0.37 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.45 |
| Opponent at the net, forehand | lob | -0.44 |
| Opponent at the net, backhand | low at the feet | -0.40 |

</details>

<details><summary><b>Sampras</b> — 54.7% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, forehand | pass down the line | +0.70 |
| First ball after own serve, backhand | cross-court | +0.68 |
| Opponent at the net, backhand | pass down the line | +0.63 |
| Backhand rally, opponent covering cross-court | cross-court | +0.50 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.39 |
| Return of a second serve | down the line | -0.38 |
| Short ball, opponent covering cross-court | approach and come in | -0.36 |

</details>

<details><summary><b>Borg</b> — 59.8% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, forehand | pass down the line | +0.84 |
| Opponent at the net, backhand | pass down the line | +0.80 |
| Short ball, opponent covering cross-court | cross-court | +0.56 |
| First ball after own serve, backhand | cross-court | +0.53 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, backhand | low at the feet | -0.62 |
| Opponent at the net, forehand | low at the feet | -0.57 |
| Short ball, opponent caught on the line side | approach and come in | -0.51 |

</details>

<details><summary><b>Agassi</b> — 56.6% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, forehand | pass down the line | +0.63 |
| Backhand rally, opponent caught on the line side | cross-court | +0.62 |
| Opponent at the net, backhand | pass down the line | +0.61 |
| Forehand rally, opponent caught on the line side | cross-court | +0.57 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, backhand | low at the feet | -0.56 |
| Return of a first serve against a serve-and-volleyer | low at the feet | -0.52 |
| Opponent at the net, forehand | lob | -0.49 |

</details>

<details><summary><b>Murray</b> — 60.8% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.87 |
| Opponent at the net, forehand | pass down the line | +0.74 |
| First ball after own serve, backhand | cross-court | +0.62 |
| First ball after own serve, forehand | cross-court | +0.51 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.59 |
| Short ball, opponent covering cross-court | approach and come in | -0.53 |
| Opponent at the net, backhand | lob | -0.47 |

</details>

<details><summary><b>McEnroe</b> — 53.4% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.70 |
| Opponent at the net, forehand | pass down the line | +0.69 |
| Short ball, opponent covering cross-court | drop shot | +0.33 |
| Return of a second serve | lob | +0.32 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.51 |
| Opponent at the net, backhand | low at the feet | -0.39 |
| Return of a first serve against a serve-and-volleyer | low at the feet | -0.35 |

</details>

## What the data says

The shots the players play while training are analysed in **[analysis/](analysis/README.md)**: correlation, entropy and
mutual information, PCA and K-means of the playing styles, decision trees and KNN, and cross-validation — including
of the learning itself.

## Reproduce it

```
node tools/train.js 4          # four more rounds, then one measurement appended to history.json
node tools/train.js 8 4 curve  # eight rounds, measuring after every round (four sets per player)
node tools/train.js eval 40    # measure only, player by player
node tools/report.js           # redraw this page from history.json and learned.js
```
