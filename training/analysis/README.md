# What the self-play data says

The players' learning (see [the training page](../README.md)) leaves behind a lot of tennis: every shot, the
situation it was played in, the choice made and whether it won the point. This page analyses that data in four
steps — look at it, find its structure, model it, then test the models honestly on data they have not seen. It is
rebuilt by `tools/analysis/collect.js` and `tools/analysis/analyze.js`.

**The data:** 57,432 shots from 312 short sets of self-play (every
player against every other, twice). Each row: 16 numbers describing the situation (how stretched the
hitter is, contact height, incoming pace and spin, both players' positions, where the shot is aimed relative to the
opponent, the rally length, the ratings involved), the stroke, the tactic chosen, and the label — whether the hitter
went on to win the point (46.2% of rows).

## What it found

- **The learning generalises.** Tactics learned from scratch win +4.3 points more than untrained play against opponents met in training, and +5.8 against opponents never met (4-fold cross-validation over players).
- **Situation predicts the point better than chance, not by much.** On unseen matches a decision tree is right 60.0% of the time (macro-F1 0.590) against 53.9% for always guessing the hitter wins; the most informative single facts are tactic chosen, opponent distance from net, shots so far.
- **Measured play recovers the real styles.** K-means on 14 style measures puts the counterpunchers together and the offensive baseliners together (adjusted Rand 0.211 against the known labels); KNN guesses 5 of 13 players' styles from their play alone.
- **Net play is out of balance.** A pass down the line wins 54.8% of its points, a plain volley only 53.0% and a smash 78.3%; on tour the player at the net wins most of those points and a smash nearly always does. This is why serve-and-volley players struggle in the game, and it is the next thing to fix.

## 1. Looking at the data

**Entropy.** The label carries H = 0.996 bits — almost a coin flip. Most of a point is decided by what happens
*after* any single shot, so no feature of one shot can say much; the question is which say anything at all.

**Mutual information** measures, in bits, how much knowing a feature reduces that uncertainty (continuous features
cut into eight equal-count bins first):

<picture><source media="(prefers-color-scheme: dark)" srcset="mi-dark.svg"><img src="mi-light.svg" alt="Mutual information between each feature and winning the point"></picture>

**Pearson correlation** with the label (linear only; mutual information also catches non-linear links):

| Feature | r |
|---|---|
| hitter distance from net | -0.125 |
| return of serve | -0.118 |
| incoming topspin | -0.117 |
| incoming pace | -0.111 |
| control rating | +0.103 |
| opponent control rating | -0.097 |
| how stretched | -0.067 |
| opponent speed rating | -0.065 |
| power rating | -0.061 |
| spin rating | +0.059 |
| shots so far | +0.031 |
| contact height | +0.020 |
| aim distance from opponent | +0.016 |
| opponent distance from net | +0.013 |
| opponent at the net | +0.004 |
| accuracy rating | +0.003 |

**Features that move together** (|r| ≥ 0.4), so a model gains little from having both:

- opponent distance from net ↔ opponent at the net: r = -0.92
- incoming pace ↔ incoming topspin: r = 0.84
- power rating ↔ control rating: r = -0.75
- incoming pace ↔ return of serve: r = 0.74
- incoming topspin ↔ return of serve: r = 0.67
- how stretched ↔ incoming pace: r = 0.58
- incoming topspin ↔ hitter distance from net: r = 0.47
- opponent speed rating ↔ opponent control rating: r = 0.44
- how stretched ↔ return of serve: r = 0.43
- contact height ↔ return of serve: r = 0.41
- return of serve ↔ shots so far: r = -0.41

**Win rate by tactic** (training rows):

| Tactic | Shots | Hitter wins the point |
|---|---|---|
| smash | 350 | 78.3% |
| putaway | 1,249 | 71.9% |
| dropvolley | 387 | 64.6% |
| passline | 1,705 | 54.8% |
| volley | 981 | 53.0% |
| angle | 3,235 | 51.8% |
| drop | 476 | 50.4% |
| deep | 17,167 | 48.9% |
| behind | 3,030 | 46.4% |
| open | 3,066 | 46.1% |
| cross | 11,081 | 44.7% |
| approach | 1,601 | 42.6% |
| passcross | 921 | 40.1% |
| line | 1,103 | 39.5% |
| safe | 5,559 | 38.8% |
| slice | 4,622 | 37.0% |
| lob | 544 | 29.6% |
| dip | 355 | 20.6% |

**Feature selection.** Keeping only the *m* features with the most mutual information, a depth-5 tree scores
(5-fold cross-validation on the training set, macro-F1):

| Features kept | Macro-F1 | Accuracy |
|---|---|---|
| 3 | 0.537 ± 0.011 | 58.7% |
| 6 | 0.569 ± 0.034 | 58.6% |
| 9 | 0.546 ± 0.018 | 58.8% |
| 12 ← used | 0.592 ± 0.012 | 60.9% |
| 18 | 0.592 ± 0.014 | 60.9% |

Kept: tactic chosen, opponent distance from net, shots so far, incoming topspin, power rating, return of serve, control rating, hitter distance from net, incoming pace, opponent control rating, opponent speed rating, stroke.

## 2. Structure: the players' styles

Each player's play is summed up in 14 measures taken from the matches, not from the ratings: attack, steady, defend, net, touch, pass, depth, rally, aces, df, serveWon, returnWon, winners, errors
(shares of shots by kind, average distance from the net, rally length, serve and return points won, winners and
errors per point). Standardised, then **PCA**: the first two components hold 53.1% and
17.0% of the variance.

- PC1: steady +0.35, returnWon +0.34, depth +0.33, rally +0.33
- PC2: touch +0.57, winners +0.54, aces −0.31, pass +0.30

<picture><source media="(prefers-color-scheme: dark)" srcset="styles-dark.svg"><img src="styles-light.svg" alt="Players on the first two principal components, coloured by K-means cluster"></picture>

**K-means** on the standardised measures, k chosen by silhouette:

| k | Silhouette | Agreement with the known styles (adjusted Rand) |
|---|---|---|
| 2 ← chosen | 0.413 | 0.211 |
| 3 | 0.195 | 0.274 |
| 4 | 0.172 | 0.352 |
| 5 | 0.130 | 0.305 |

- **Cluster 1:** Sampras (serve and volley), McEnroe (serve and volley)
- **Cluster 2:** Djokovic (offensive baseliner), Nadal (offensive baseliner), Alcaraz (all-court), Federer (all-court), Sinner (offensive baseliner), Medvedev (counterpuncher), Zverev (offensive baseliner), de Minaur (counterpuncher), Borg (counterpuncher), Agassi (offensive baseliner), Murray (counterpuncher)

The known styles are the tennis world's labels: serve and volley (Sampras, McEnroe), all-court (Federer, Alcaraz),
offensive baseliner (Djokovic, Nadal, Sinner, Agassi, Zverev) and counterpuncher (Murray, Medvedev, de Minaur, Borg).

**KNN, leave-one-out:** each player's style predicted from the three most similar other players (distance-weighted
vote, measures standardised): **5 of 13** right (38.5%).

| Player | Known style | Predicted from play | Most similar player |
|---|---|---|---|
| Djokovic | offensive baseliner | offensive baseliner | Agassi |
| Nadal | offensive baseliner | offensive baseliner | Agassi |
| Alcaraz | all-court | offensive baseliner ✗ | Federer |
| Federer | all-court | offensive baseliner ✗ | Zverev |
| Sinner | offensive baseliner | offensive baseliner | Agassi |
| Medvedev | counterpuncher | offensive baseliner ✗ | Zverev |
| Zverev | offensive baseliner | all-court ✗ | Federer |
| de Minaur | counterpuncher | offensive baseliner ✗ | Djokovic |
| Sampras | serve and volley | all-court ✗ | Federer |
| Borg | counterpuncher | offensive baseliner ✗ | Nadal |
| Agassi | offensive baseliner | offensive baseliner | Nadal |
| Murray | counterpuncher | offensive baseliner ✗ | Zverev |
| McEnroe | serve and volley | serve and volley | Sampras |

## 3. Models: can a shot's situation predict the point?

Task: from one shot's situation and choice, predict whether its hitter wins the point. Two classifiers, on the
features kept above:

- **Decision tree** (CART, Gini impurity, leaves of at least 60 shots). Depth by cross-validation:
depth 2: 0.496 · depth 3: 0.502 · depth 4: 0.532 · depth 6: 0.592 · depth 8: 0.592 · depth 10: 0.585 · depth 12: 0.577 · depth 14: 0.580 → **depth 6**.
- **KNN** (z-scored features, scaling fitted on each training fold only, distance-weighted vote; up to 5,000
training rows per fold to keep the Θ(n²) cost reasonable). k by cross-validation: k=5: 0.563 · k=15: 0.578 · k=45: 0.588 · k=95: 0.588
→ **k = 45**.

What a depth-3 tree on every feature learns (training set):

```
45660 shots, 46%
  if isReturn ≤ 0.50: 36495 shots, 49%
    if oppControl ≤ 76.00: 8267 shots, 61%
      if power ≤ 91.50: → hitter wins 63% (6901 shots)
      else: → hitter wins 48% (1366 shots)
    else: 28228 shots, 46%
      if power ≤ 91.50: → hitter wins 48% (23531 shots)
      else: → hitter wins 34% (4697 shots)
  else: 9165 shots, 35%
    if gap ≤ 2.37: 6117 shots, 39%
      if inPace ≤ 16.98: → hitter wins 44% (2738 shots)
      else: → hitter wins 35% (3379 shots)
    else: 3048 shots, 27%
      if oppDepth ≤ 9.22: → hitter wins 38% (497 shots)
      else: → hitter wins 25% (2551 shots)
```

Most important features of the chosen tree (share of the impurity it removes): depth 18.3%, oppControl 17.0%, isReturn 16.8%, power 13.6%, oppSpeed 8.8%, oppDepth 5.4%, wing=volley 4.1%, gap 3.2%.

## 4. Evaluation on unseen matches

**Split.** Shots of one match share players and conditions, so the split is by match: 20.5% of
rows (62 whole matches) are held out as the **test set** and used once, at the end.
Everything above — feature selection, depth, k — was chosen by **5-fold cross-validation inside the training set**,
also grouped by match.

| Model (test set) | Accuracy | Precision | Recall | F1 | Macro-F1 |
|---|---|---|---|---|---|
| Always "the hitter wins" (baseline) | 53.9% | 0.0% | 0.0% | 0.000 | 0.350 |
| Tactic only (its training win rate) | 56.0% | 57.0% | 18.4% | 0.278 | 0.481 |
| Decision tree, depth 6 | 60.0% | 58.1% | 47.9% | 0.525 | 0.590 |
| KNN, k = 45 | 58.6% | 56.6% | 43.8% | 0.494 | 0.572 |

Positive class: the hitter wins the point.

**Confusion matrices** (test set):

| Model | True positive | False negative | False positive | True negative |
|---|---|---|---|---|
| Tactic only | 998 | 4427 | 754 | 5593 |
| Decision tree | 2600 | 2825 | 1878 | 4469 |
| KNN | 2377 | 3048 | 1822 | 4525 |

**Reading it.** The models beat the baseline by 6.1 points of accuracy:
a single shot's situation does carry information about the point — chiefly tactic chosen, opponent distance from net, shots so far — but
tennis points are long chains of shots, and most of the outcome is decided later. That is the honest ceiling for
this task, and it is why the players learn from whole points rather than from single shots.

### Cross-validating the tactics learning itself

The question that matters for the players: is what they learn real, or just fitted to the opponents they trained
against? The thirteen players are dealt into folds; in each, the players outside the fold learn from scratch against
each other only, then play opponents they trained against (in-sample) and the fold's players, whom they never met
(held out).

| Fold | Test players (never met in training) | In-sample advantage | Held-out advantage |
|---|---|---|---|
| 1 | Sinner, McEnroe, Alcaraz, Federer | +5.3 pts | +6.3 pts |
| 2 | de Minaur, Medvedev, Nadal | +3.3 pts | +6.3 pts |
| 3 | Sampras, Zverev, Djokovic | +3.0 pts | +7.3 pts |
| 4 | Agassi, Murray, Borg | +5.8 pts | +3.4 pts |
| **All folds** | | **+4.3 pts** | **+5.8 pts** |

With 2,458 points per version per fold, one fold's figure is good to about ±2.6 points and the pooled one to about ±1.4 (two standard errors). **What is learned carries over to opponents never met: the held-out advantage is as large as the in-sample one, so the players are learning tennis, not the habits of particular opponents.** Advantage = share of points the trained player wins minus the share its untrained twin wins against the same opponent, in percentage points. Each fold trains 3 rounds from scratch; each comparison is 2 short sets with each version.

## Complexity of what runs here

| Step | Time | Space | Notes |
|---|---|---|---|
| Pearson, entropy, mutual information | Θ(n) per feature | O(distinct values) | counting in a hash map |
| Binning for mutual information | Θ(n log n) | Θ(n) | one sort for the cut points, then binary search per value |
| Grouped split / k-fold | Θ(n) | Θ(n) | Fisher–Yates shuffle of the match ids |
| Decision tree, fit | Θ(depth · d · n log n) | Θ(n) | each node sorts its rows per feature and sweeps the thresholds once |
| Decision tree, predict | Θ(depth) per row | — | |
| KNN, predict | Θ(n·d + n log k) per row | Θ(k) heap | a bounded max-heap keeps the k nearest; sorting all n would be Θ(n log n) |
| PCA | Θ(n·d²) + O(d³) per Jacobi sweep | Θ(d²) | d = 14 |
| K-means | Θ(n·k·d) per iteration | Θ(k·d) | k-means++ starts, best of 50 restarts |
| Silhouette | Θ(n²·d) | Θ(k) | n = 13 players |

## Algorithms and data structures in the code, and where they are not used

Used where the problem calls for them:

| Where | Problem | What is used | Cost |
|---|---|---|---|
| `tools/loadorder.py` (every build) | 79 source files must load after whatever they use while loading | a graph of load-time dependencies; **topological sort** (Kahn's algorithm) with a **min-heap** so ties keep the manifest's order; **BFS** for how far a load-time call can reach; **DFS** with white/grey/black colours to name a cycle | O((V + E) log V) for the sort, O(V·(V + E)) for the reach; V = 79 files |
| `KNN` | the k nearest of n rows | a bounded **max-heap** (priority queue) | Θ(n log k) instead of Θ(n log n) |
| `DecisionTree` | the best threshold for a feature | **sorting** the node's rows once, then one sweep | Θ(n log n) instead of Θ(n²) |
| `Stats.bin` | which bin each value falls in | **binary search** over the sorted cut points | O(log q) per value |
| `Stats.entropy`, mutual information | counting outcomes per value | **hash map** | Θ(n) |
| `Validation` | random splits and folds | **Fisher–Yates** shuffle | Θ(n) |
| the game's `Tactics` | the learned value of a tactic in a situation, looked up at every choice | nested **hash maps** (player → situation → tactic) | O(1) per lookup |
| the game's `Tournament` | the draw | a complete **binary tree** stored level by level (quarter-finals → final); a winner moves to slot ⌊i/2⌋ of the next round | O(1) per result |

Not used, on purpose:

- **Dijkstra, Floyd–Warshall, Prim.** Players run straight lines across an open court; the only obstacle is the net,
  and the one walking route that has to avoid it (to and from the tunnel) is three fixed waypoints. A shortest-path
  search would recompute what is already known. Nothing needs a spanning tree.
- **Warshall's transitive closure** would also give the load-time reach above; with 79 files either is instant, and
  a BFS from the few files that are actually called while loading does less work than closing the whole graph (Θ(V³)).
- **BST / AVL tree.** Nothing ordered changes while it is being searched: rankings and seedings of thirteen players
  are sorted once.
- **Linked lists, stacks, queues for the match itself.** A match is a handful of coroutines (the point, the ball
  kids, the walk-on) stepped every tick; with at most a dozen of them, a list scanned once per tick is the simplest
  thing that works. A priority queue of timed events would only pay off with thousands.

## Reproduce

```
node tools/analysis/collect.js 2        # play every pairing twice and record every shot (a few minutes)
node tools/analysis/learning-cv.js 4 3  # 4-fold cross-validation of the tactics learning (about half an hour)
node tools/analysis/analyze.js          # this page and its charts
```
