# How the players learn

The computer players are not scripted. Each one keeps a table of **what has worked for it** — which serve to which
corner, cross-court or down the line, when to come in, how to pass a player at the net — and that table is filled in
by playing. This page is the record of that learning. It is rebuilt by `tools/train.js` every time the players train
(a GitHub Action runs it daily), so the numbers below are the current ones.

## The result

<picture><source media="(prefers-color-scheme: dark)" srcset="learning-dark.svg"><img src="learning-light.svg" alt="Learning curve: share of points trained players win against untrained twins, by rounds of self-play"></picture>

After **8 rounds** of self-play (50,983 points), a trained player wins **57.9% of points** and
**86.5% of sets** against an untrained copy of itself — same serve, same speed, same strokes, only the decisions
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
| Opponent at the net, backhand | pass down the line | +0.92 |
| Opponent at the net, forehand | pass down the line | +0.88 |
| First ball after own serve, backhand | cross-court | +0.73 |
| Backhand rally, opponent covering cross-court | cross-court | +0.63 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.60 |
| Opponent at the net, backhand | low at the feet | -0.57 |
| Short ball, opponent covering cross-court | approach and come in | -0.52 |

</details>

<details><summary><b>Nadal</b> — 61.8% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.74 |
| Opponent at the net, forehand | pass down the line | +0.72 |
| First ball after own serve, forehand | cross-court | +0.61 |
| Forehand rally, opponent covering cross-court | cross-court | +0.60 |

| Situation | Avoids | Value |
|---|---|---|
| Short ball, opponent covering cross-court | approach and come in | -0.53 |
| Opponent at the net, backhand | lob | -0.42 |
| Opponent at the net, backhand | low at the feet | -0.41 |

</details>

<details><summary><b>Alcaraz</b> — 55% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Forehand rally, opponent covering cross-court | sharp angle | +0.61 |
| Opponent at the net, forehand | pass down the line | +0.59 |
| Backhand rally, opponent covering cross-court | sharp angle | +0.57 |
| Opponent at the net, backhand | pass down the line | +0.51 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, backhand | low at the feet | -0.41 |
| Opponent at the net, forehand | low at the feet | -0.40 |
| Opponent at the net, forehand | lob | -0.37 |

</details>

<details><summary><b>Federer</b> — 54.5% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, forehand | pass down the line | +0.76 |
| First ball after own serve, backhand | cross-court | +0.75 |
| Opponent at the net, backhand | pass down the line | +0.68 |
| First ball after own serve, forehand | cross-court | +0.55 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.43 |
| First ball after own serve, forehand | drop shot | -0.38 |
| Return of a second serve | down the line | -0.37 |

</details>

<details><summary><b>Sinner</b> — 56.3% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.80 |
| Backhand rally, opponent covering cross-court | cross-court | +0.77 |
| Forehand rally, opponent caught on the line side | cross-court | +0.69 |
| Opponent at the net, forehand | pass down the line | +0.66 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.48 |
| First ball after own serve, forehand | slice | -0.45 |
| Opponent at the net, backhand | lob | -0.45 |

</details>

<details><summary><b>Medvedev</b> — 58.3% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, forehand | pass down the line | +0.80 |
| Opponent at the net, backhand | pass down the line | +0.69 |
| Short ball, opponent covering cross-court | cross-court | +0.58 |
| First ball after own serve, backhand | cross-court | +0.53 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.53 |
| Return of a second serve | down the line | -0.49 |
| Short ball, opponent covering cross-court | approach and come in | -0.44 |

</details>

<details><summary><b>Zverev</b> — 52.7% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.55 |
| Opponent at the net, forehand | pass down the line | +0.54 |
| First ball after own serve, forehand | cross-court | +0.49 |
| Short ball, opponent covering cross-court | cross-court | +0.48 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.46 |
| Opponent at the net, backhand | low at the feet | -0.36 |
| Short ball, opponent covering cross-court | approach and come in | -0.36 |

</details>

<details><summary><b>de Minaur</b> — 51.5% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, forehand | pass down the line | +0.77 |
| Opponent at the net, backhand | pass down the line | +0.65 |
| Return of a first serve | lob | +0.37 |
| Short ball, opponent caught on the line side | hard into the open court | +0.32 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.46 |
| Opponent at the net, backhand | low at the feet | -0.38 |
| Opponent at the net, forehand | lob | -0.34 |

</details>

<details><summary><b>Sampras</b> — 56.1% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| First ball after own serve, backhand | cross-court | +0.73 |
| Backhand rally, opponent covering cross-court | cross-court | +0.73 |
| Opponent at the net, forehand | pass down the line | +0.57 |
| First ball after own serve, forehand | cross-court | +0.53 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.42 |
| Return of a second serve | down the line | -0.32 |
| Backhand rally, opponent covering cross-court | down the line | -0.31 |

</details>

<details><summary><b>Borg</b> — 68.9% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, forehand | pass down the line | +0.82 |
| Opponent at the net, backhand | pass down the line | +0.80 |
| First ball after own serve, backhand | cross-court | +0.55 |
| Short ball, opponent covering cross-court | cross-court | +0.42 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.59 |
| Opponent at the net, backhand | low at the feet | -0.45 |
| Return of a first serve against a serve-and-volleyer | low at the feet | -0.40 |

</details>

<details><summary><b>Agassi</b> — 55.1% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.70 |
| Backhand rally, opponent covering cross-court | cross-court | +0.69 |
| Backhand rally, opponent caught on the line side | cross-court | +0.63 |
| Forehand rally, opponent caught on the line side | cross-court | +0.58 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.50 |
| Opponent at the net, backhand | low at the feet | -0.48 |
| Opponent at the net, forehand | lob | -0.42 |

</details>

<details><summary><b>Murray</b> — 64.8% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, forehand | pass down the line | +0.93 |
| Opponent at the net, backhand | pass down the line | +0.92 |
| First ball after own serve, backhand | cross-court | +0.65 |
| Backhand rally, opponent covering cross-court | cross-court | +0.47 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.59 |
| Short ball, opponent covering cross-court | approach and come in | -0.55 |
| Return of a first serve against a serve-and-volleyer | low at the feet | -0.42 |

</details>

<details><summary><b>McEnroe</b> — 61.3% of points against the untrained twin</summary>

| Situation | Prefers | Value |
|---|---|---|
| Opponent at the net, backhand | pass down the line | +0.90 |
| Opponent at the net, forehand | pass down the line | +0.68 |
| Return of a first serve | lob | +0.29 |
| Short ball, opponent covering cross-court | drop shot | +0.28 |

| Situation | Avoids | Value |
|---|---|---|
| Opponent at the net, forehand | low at the feet | -0.52 |
| Opponent at the net, backhand | low at the feet | -0.41 |
| Return of a first serve against a serve-and-volleyer | low at the feet | -0.34 |

</details>

## Reproduce it

```
node tools/train.js 4          # four more rounds, then one measurement appended to history.json
node tools/train.js 8 4 curve  # eight rounds, measuring after every round (four sets per player)
node tools/train.js eval 40    # measure only, player by player
node tools/report.js           # redraw this page from history.json and learned.js
```
