# What the self-play data says

The players' learning (see [the training page](../README.md)) leaves behind a lot of tennis: every shot, the
situation it was played in, the choice made and whether it won the point. This page analyses that data in four
steps — look at it, find its structure, model it, then test the models honestly on data they have not seen. It is
rebuilt by `tools/analysis/collect.js` and `tools/analysis/analyze.js`.

**The data:** 57,702 shots from 312 short sets of self-play (every
player against every other, twice). Each row: 16 numbers describing the situation (how stretched the
hitter is, contact height, incoming pace and spin, both players' positions, where the shot is aimed relative to the
opponent, the rally length, the ratings involved), the stroke, the tactic chosen, and the label — whether the hitter
went on to win the point (46.2% of rows).

## What it found

- **The learning generalises.** Tactics learned from scratch win +4.3 points more than untrained play against opponents met in training, and +5.8 against opponents never met (4-fold cross-validation over players).
- **Situation predicts the point better than chance, not by much.** On unseen matches a decision tree is right 61.6% of the time (macro-F1 0.604) against 53.6% for always guessing the hitter wins; the most informative single facts are tactic chosen, shots so far, incoming topspin.
- **Measured play recovers the real styles.** K-means on 14 style measures puts the counterpunchers together and the offensive baseliners together (adjusted Rand 0.211 against the known labels); KNN guesses 5 of 13 players' styles from their play alone.
- **Net play is out of balance.** A pass down the line wins 55.7% of its points, a plain volley only 56.6% and a smash 80.4%; on tour the player at the net wins most of those points and a smash nearly always does. This is why serve-and-volley players struggle in the game, and it is the next thing to fix.

## 1. Looking at the data

**Entropy.** The label carries H = 0.996 bits — almost a coin flip. Most of a point is decided by what happens
*after* any single shot, so no feature of one shot can say much; the question is which say anything at all.

**Mutual information** measures, in bits, how much knowing a feature reduces that uncertainty (continuous features
cut into eight equal-count bins first):

<picture><source media="(prefers-color-scheme: dark)" srcset="mi-dark.svg"><img src="mi-light.svg" alt="Mutual information between each feature and winning the point"></picture>

**Pearson correlation** with the label (linear only; mutual information also catches non-linear links):

| Feature | r |
|---|---|
| hitter distance from net | -0.145 |
| return of serve | -0.131 |
| incoming topspin | -0.129 |
| incoming pace | -0.122 |
| control rating | +0.117 |
| opponent control rating | -0.108 |
| power rating | -0.086 |
| how stretched | -0.081 |
| opponent speed rating | -0.051 |
| spin rating | +0.048 |
| contact height | +0.034 |
| shots so far | +0.033 |
| aim distance from opponent | +0.025 |
| opponent distance from net | +0.022 |
| accuracy rating | -0.007 |
| opponent at the net | -0.003 |

**Features that move together** (|r| ≥ 0.4), so a model gains little from having both:

- opponent distance from net ↔ opponent at the net: r = -0.92
- incoming pace ↔ incoming topspin: r = 0.84
- power rating ↔ control rating: r = -0.75
- incoming pace ↔ return of serve: r = 0.74
- incoming topspin ↔ return of serve: r = 0.68
- how stretched ↔ incoming pace: r = 0.58
- incoming topspin ↔ hitter distance from net: r = 0.47
- how stretched ↔ return of serve: r = 0.43
- return of serve ↔ shots so far: r = -0.42
- opponent speed rating ↔ opponent control rating: r = 0.41

**Win rate by tactic** (training rows):

| Tactic | Shots | Hitter wins the point |
|---|---|---|
| smash | 414 | 80.4% |
| putaway | 1,389 | 74.1% |
| dropvolley | 422 | 69.4% |
| volley | 953 | 56.6% |
| passline | 1,798 | 55.7% |
| angle | 3,267 | 53.2% |
| deep | 16,533 | 48.5% |
| behind | 2,669 | 47.5% |
| drop | 506 | 47.0% |
| open | 3,116 | 45.6% |
| cross | 11,123 | 45.2% |
| approach | 1,860 | 43.8% |
| passcross | 1,060 | 38.1% |
| safe | 5,763 | 37.9% |
| slice | 4,633 | 36.8% |
| line | 1,137 | 35.8% |
| lob | 641 | 25.3% |
| dip | 418 | 21.3% |

**Feature selection.** Keeping only the *m* features with the most mutual information, a depth-5 tree scores
(5-fold cross-validation on the training set, macro-F1):

| Features kept | Macro-F1 | Accuracy |
|---|---|---|
| 3 | 0.539 ± 0.006 | 57.4% |
| 6 | 0.552 ± 0.009 | 60.0% |
| 9 | 0.576 ± 0.024 | 59.1% |
| 12 | 0.572 ± 0.024 | 59.9% |
| 18 ← used | 0.582 ± 0.026 | 60.0% |

Kept: tactic chosen, shots so far, incoming topspin, opponent distance from net, hitter distance from net, return of serve, incoming pace, control rating, power rating, opponent control rating, stroke, spin rating, opponent speed rating, contact height, how stretched, aim distance from opponent, accuracy rating, opponent at the net.

## 2. Structure: the players' styles

Each player's play is summed up in 14 measures taken from the matches, not from the ratings: attack, steady, defend, net, touch, pass, depth, rally, aces, df, serveWon, returnWon, winners, errors
(shares of shots by kind, average distance from the net, rally length, serve and return points won, winners and
errors per point). Standardised, then **PCA**: the first two components hold 47.7% and
14.4% of the variance.

- PC1: steady +0.38, returnWon +0.36, depth +0.36, net −0.35
- PC2: winners −0.49, touch −0.39, errors −0.38, df +0.35

<picture><source media="(prefers-color-scheme: dark)" srcset="styles-dark.svg"><img src="styles-light.svg" alt="Players on the first two principal components, coloured by K-means cluster"></picture>

**K-means** on the standardised measures, k chosen by silhouette:

| k | Silhouette | Agreement with the known styles (adjusted Rand) |
|---|---|---|
| 2 ← chosen | 0.379 | 0.211 |
| 3 | 0.220 | 0.410 |
| 4 | 0.144 | 0.283 |
| 5 | 0.138 | 0.173 |

- **Cluster 1:** Sampras (serve and volley), McEnroe (serve and volley)
- **Cluster 2:** Djokovic (offensive baseliner), Nadal (offensive baseliner), Alcaraz (all-court), Federer (all-court), Sinner (offensive baseliner), Medvedev (counterpuncher), Zverev (offensive baseliner), de Minaur (counterpuncher), Borg (counterpuncher), Agassi (offensive baseliner), Murray (counterpuncher)

The known styles are the tennis world's labels: serve and volley (Sampras, McEnroe), all-court (Federer, Alcaraz),
offensive baseliner (Djokovic, Nadal, Sinner, Agassi, Zverev) and counterpuncher (Murray, Medvedev, de Minaur, Borg).

**KNN, leave-one-out:** each player's style predicted from the three most similar other players (distance-weighted
vote, measures standardised): **5 of 13** right (38.5%).

| Player | Known style | Predicted from play | Most similar player |
|---|---|---|---|
| Djokovic | offensive baseliner | offensive baseliner | Nadal |
| Nadal | offensive baseliner | offensive baseliner | Agassi |
| Alcaraz | all-court | offensive baseliner ✗ | Federer |
| Federer | all-court | offensive baseliner ✗ | Zverev |
| Sinner | offensive baseliner | offensive baseliner | Zverev |
| Medvedev | counterpuncher | offensive baseliner ✗ | Zverev |
| Zverev | offensive baseliner | offensive baseliner | Sinner |
| de Minaur | counterpuncher | offensive baseliner ✗ | Borg |
| Sampras | serve and volley | all-court ✗ | Federer |
| Borg | counterpuncher | offensive baseliner ✗ | Nadal |
| Agassi | offensive baseliner | offensive baseliner | Nadal |
| Murray | counterpuncher | offensive baseliner ✗ | Djokovic |
| McEnroe | serve and volley | all-court ✗ | Sampras |

## 3. Models: can a shot's situation predict the point?

Task: from one shot's situation and choice, predict whether its hitter wins the point. Two classifiers, on the
features kept above:

- **Decision tree** (CART, Gini impurity, leaves of at least 60 shots). Depth by cross-validation:
depth 2: 0.504 · depth 3: 0.543 · depth 4: 0.555 · depth 6: 0.575 · depth 8: 0.580 · depth 10: 0.579 · depth 12: 0.582 · depth 14: 0.577 → **depth 8**.
- **KNN** (z-scored features, scaling fitted on each training fold only, distance-weighted vote; up to 5,000
training rows per fold to keep the Θ(n²) cost reasonable). k by cross-validation: k=5: 0.565 · k=15: 0.578 · k=45: 0.578 · k=95: 0.579
→ **k = 15**.

What a depth-3 tree on every feature learns (training set):

```
46617 shots, 46%
  if inSpin ≤ 4.25: 35935 shots, 50%
    if oppControl ≤ 76.00: 8277 shots, 62%
      if oppDepth ≤ 4.53: → hitter wins 43% (1030 shots)
      else: → hitter wins 65% (7247 shots)
    else: 27658 shots, 46%
      if depth ≤ 9.13: → hitter wins 67% (2528 shots)
      else: → hitter wins 44% (25130 shots)
  else: 10682 shots, 34%
    if inPace ≤ 16.55: 4663 shots, 40%
      if power ≤ 91.50: → hitter wins 43% (3805 shots)
      else: → hitter wins 26% (858 shots)
    else: 6019 shots, 30%
      if gap ≤ 2.36: → hitter wins 33% (3823 shots)
      else: → hitter wins 23% (2196 shots)
```

Most important features of the chosen tree (share of the impurity it removes): power 18.9%, inSpin 17.6%, oppControl 15.0%, depth 15.0%, oppSpeed 7.0%, oppDepth 6.4%, gap 3.8%, inPace 3.7%.

## 4. Evaluation on unseen matches

**Split.** Shots of one match share players and conditions, so the split is by match: 19.2% of
rows (62 whole matches) are held out as the **test set** and used once, at the end.
Everything above — feature selection, depth, k — was chosen by **5-fold cross-validation inside the training set**,
also grouped by match.

| Model (test set) | Accuracy | Precision | Recall | F1 | Macro-F1 |
|---|---|---|---|---|---|
| Always "the hitter wins" (baseline) | 53.6% | 0.0% | 0.0% | 0.000 | 0.349 |
| Tactic only (its training win rate) | 56.6% | 60.3% | 19.1% | 0.290 | 0.489 |
| Decision tree, depth 8 | 61.6% | 61.1% | 47.4% | 0.534 | 0.604 |
| KNN, k = 15 | 59.4% | 56.6% | 53.5% | 0.550 | 0.590 |

Positive class: the hitter wins the point.

**Confusion matrices** (test set):

| Model | True positive | False negative | False positive | True negative |
|---|---|---|---|---|
| Tactic only | 981 | 4164 | 647 | 5293 |
| Decision tree | 2439 | 2706 | 1551 | 4389 |
| KNN | 2751 | 2394 | 2107 | 3833 |

**Reading it.** The models beat the baseline by 8.0 points of accuracy:
a single shot's situation does carry information about the point — chiefly tactic chosen, shots so far, incoming topspin — but
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
