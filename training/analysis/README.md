# What the self-play data says

The players' learning (see [the training page](../README.md)) leaves behind a lot of tennis: every shot, the
situation it was played in, the choice made and whether it won the point. This page analyses that data in four
steps — look at it, find its structure, model it, then test the models honestly on data they have not seen. It is
rebuilt by `tools/analysis/collect.js` and `tools/analysis/analyze.js`.

**The data:** 48,368 shots from 312 short sets of self-play (every
player against every other, twice). Each row: 16 numbers describing the situation (how stretched the
hitter is, contact height, incoming pace and spin, both players' positions, where the shot is aimed relative to the
opponent, the rally length, the ratings involved), the stroke, the tactic chosen, and the label — whether the hitter
went on to win the point (45.1% of rows).

## What it found

- **The learning generalises.** Tactics learned from scratch win +4.3 points more than untrained play against opponents met in training, and +5.8 against opponents never met (4-fold cross-validation over players).
- **Situation predicts the point better than chance, not by much.** On unseen matches a decision tree is right 60.4% of the time (macro-F1 0.581) against 54.8% for always guessing the hitter wins; the most informative single facts are tactic chosen, hitter distance from net, stroke.
- **Measured play recovers the real styles.** K-means on 14 style measures puts the counterpunchers together and the offensive baseliners together (adjusted Rand 0.211 against the known labels); KNN guesses 7 of 13 players' styles from their play alone.
- **Net play is out of balance.** A pass down the line wins 45.1% of its points, a plain volley only 62.6% and a smash 80.0%; on tour the player at the net wins most of those points and a smash nearly always does. This is why serve-and-volley players struggle in the game, and it is the next thing to fix.

## 1. Looking at the data

**Entropy.** The label carries H = 0.993 bits — almost a coin flip. Most of a point is decided by what happens
*after* any single shot, so no feature of one shot can say much; the question is which say anything at all.

**Mutual information** measures, in bits, how much knowing a feature reduces that uncertainty (continuous features
cut into eight equal-count bins first):

<picture><source media="(prefers-color-scheme: dark)" srcset="mi-dark.svg"><img src="mi-light.svg" alt="Mutual information between each feature and winning the point"></picture>

**Pearson correlation** with the label (linear only; mutual information also catches non-linear links):

| Feature | r |
|---|---|
| hitter distance from net | -0.170 |
| return of serve | -0.130 |
| incoming topspin | -0.128 |
| incoming pace | -0.105 |
| opponent distance from net | +0.064 |
| contact height | +0.063 |
| how stretched | -0.061 |
| control rating | +0.061 |
| opponent control rating | -0.061 |
| spin rating | +0.060 |
| opponent at the net | -0.044 |
| shots so far | +0.042 |
| power rating | -0.028 |
| aim distance from opponent | +0.025 |
| opponent speed rating | -0.025 |
| accuracy rating | -0.004 |

**Features that move together** (|r| ≥ 0.4), so a model gains little from having both:

- opponent distance from net ↔ opponent at the net: r = -0.93
- incoming pace ↔ incoming topspin: r = 0.82
- power rating ↔ control rating: r = -0.79
- incoming pace ↔ return of serve: r = 0.75
- incoming topspin ↔ return of serve: r = 0.72
- how stretched ↔ incoming pace: r = 0.59
- incoming topspin ↔ hitter distance from net: r = 0.50
- return of serve ↔ shots so far: r = -0.47
- how stretched ↔ return of serve: r = 0.44

**Win rate by tactic** (training rows):

| Tactic | Shots | Hitter wins the point |
|---|---|---|
| smash | 635 | 80.0% |
| putaway | 1,700 | 72.4% |
| dropvolley | 569 | 71.2% |
| volley | 1,077 | 62.6% |
| angle | 1,844 | 53.5% |
| drop | 698 | 50.6% |
| approach | 2,680 | 48.8% |
| deep | 13,906 | 48.0% |
| behind | 1,629 | 46.4% |
| passline | 1,799 | 45.1% |
| cross | 6,645 | 41.4% |
| open | 1,972 | 40.4% |
| safe | 5,595 | 37.4% |
| passcross | 1,499 | 36.4% |
| line | 885 | 34.5% |
| slice | 3,804 | 33.9% |
| lob | 861 | 26.7% |
| dip | 570 | 21.2% |

**Feature selection.** Keeping only the *m* features with the most mutual information, a depth-5 tree scores
(5-fold cross-validation on the training set, macro-F1):

| Features kept | Macro-F1 | Accuracy |
|---|---|---|
| 3 | 0.527 ± 0.015 | 59.2% |
| 6 | 0.553 ± 0.017 | 60.1% |
| 9 | 0.559 ± 0.027 | 60.3% |
| 12 ← used | 0.563 ± 0.025 | 60.6% |
| 18 | 0.562 ± 0.025 | 60.6% |

Kept: tactic chosen, hitter distance from net, stroke, opponent distance from net, shots so far, incoming topspin, return of serve, incoming pace, aim distance from opponent, power rating, spin rating, opponent control rating.

## 2. Structure: the players' styles

Each player's play is summed up in 14 measures taken from the matches, not from the ratings: attack, steady, defend, net, touch, pass, depth, rally, aces, df, serveWon, returnWon, winners, errors
(shares of shots by kind, average distance from the net, rally length, serve and return points won, winners and
errors per point). Standardised, then **PCA**: the first two components hold 44.4% and
16.9% of the variance.

- PC1: steady +0.36, depth +0.36, net −0.35, attack +0.35
- PC2: winners −0.55, serveWon −0.38, touch −0.33, aces +0.33

<picture><source media="(prefers-color-scheme: dark)" srcset="styles-dark.svg"><img src="styles-light.svg" alt="Players on the first two principal components, coloured by K-means cluster"></picture>

**K-means** on the standardised measures, k chosen by silhouette:

| k | Silhouette | Agreement with the known styles (adjusted Rand) |
|---|---|---|
| 2 ← chosen | 0.392 | 0.211 |
| 3 | 0.287 | 0.205 |
| 4 | 0.204 | 0.460 |
| 5 | 0.230 | 0.316 |

- **Cluster 1:** Sampras (serve and volley), McEnroe (serve and volley)
- **Cluster 2:** Djokovic (offensive baseliner), Nadal (offensive baseliner), Alcaraz (all-court), Federer (all-court), Sinner (offensive baseliner), Medvedev (counterpuncher), Zverev (offensive baseliner), de Minaur (counterpuncher), Borg (counterpuncher), Agassi (offensive baseliner), Murray (counterpuncher)

The known styles are the tennis world's labels: serve and volley (Sampras, McEnroe), all-court (Federer, Alcaraz),
offensive baseliner (Djokovic, Nadal, Sinner, Agassi, Zverev) and counterpuncher (Murray, Medvedev, de Minaur, Borg).

**KNN, leave-one-out:** each player's style predicted from the three most similar other players (distance-weighted
vote, measures standardised): **7 of 13** right (53.8%).

| Player | Known style | Predicted from play | Most similar player |
|---|---|---|---|
| Djokovic | offensive baseliner | counterpuncher ✗ | Medvedev |
| Nadal | offensive baseliner | offensive baseliner | Djokovic |
| Alcaraz | all-court | offensive baseliner ✗ | Federer |
| Federer | all-court | offensive baseliner ✗ | Djokovic |
| Sinner | offensive baseliner | offensive baseliner | Zverev |
| Medvedev | counterpuncher | offensive baseliner ✗ | Djokovic |
| Zverev | offensive baseliner | offensive baseliner | Sinner |
| de Minaur | counterpuncher | offensive baseliner ✗ | Djokovic |
| Sampras | serve and volley | serve and volley | McEnroe |
| Borg | counterpuncher | offensive baseliner ✗ | Nadal |
| Agassi | offensive baseliner | offensive baseliner | Zverev |
| Murray | counterpuncher | counterpuncher | Medvedev |
| McEnroe | serve and volley | serve and volley | Sampras |

## 3. Models: can a shot's situation predict the point?

Task: from one shot's situation and choice, predict whether its hitter wins the point. Two classifiers, on the
features kept above:

- **Decision tree** (CART, Gini impurity, leaves of at least 60 shots). Depth by cross-validation:
depth 2: 0.500 · depth 3: 0.520 · depth 4: 0.539 · depth 6: 0.553 · depth 8: 0.578 · depth 10: 0.576 · depth 12: 0.579 · depth 14: 0.576 → **depth 8**.
- **KNN** (z-scored features, scaling fitted on each training fold only, distance-weighted vote; up to 5,000
training rows per fold to keep the Θ(n²) cost reasonable). k by cross-validation: k=5: 0.571 · k=15: 0.578 · k=45: 0.582 · k=95: 0.583
→ **k = 45**.

What a depth-3 tree on every feature learns (training set):

```
39195 shots, 45%
  if depth ≤ 9.40: 4986 shots, 66%
    if depth ≤ 4.05: 1282 shots, 79%
      if inSpin ≤ 1.78: → hitter wins 65% (206 shots)
      else: → hitter wins 82% (1076 shots)
    else: 3704 shots, 62%
      if oppDepth ≤ 3.60: → hitter wins 39% (296 shots)
      else: → hitter wins 64% (3408 shots)
  else: 34209 shots, 42%
    if oppDepth ≤ 12.28: 13469 shots, 34%
      if inPace ≤ 16.81: → hitter wins 38% (7237 shots)
      else: → hitter wins 30% (6232 shots)
    else: 20740 shots, 47%
      if oppControl ≤ 67.50: → hitter wins 62% (2029 shots)
      else: → hitter wins 45% (18711 shots)
```

Most important features of the chosen tree (share of the impurity it removes): depth 32.7%, oppDepth 19.7%, power 9.8%, oppControl 6.8%, inPace 6.5%, gap 5.7%, height 3.6%, spin 3.0%.

## 4. Evaluation on unseen matches

**Split.** Shots of one match share players and conditions, so the split is by match: 19.0% of
rows (62 whole matches) are held out as the **test set** and used once, at the end.
Everything above — feature selection, depth, k — was chosen by **5-fold cross-validation inside the training set**,
also grouped by match.

| Model (test set) | Accuracy | Precision | Recall | F1 | Macro-F1 |
|---|---|---|---|---|---|
| Always "the hitter wins" (baseline) | 54.8% | 0.0% | 0.0% | 0.000 | 0.354 |
| Tactic only (its training win rate) | 57.8% | 61.5% | 17.9% | 0.277 | 0.490 |
| Decision tree, depth 8 | 60.4% | 59.0% | 40.7% | 0.482 | 0.581 |
| KNN, k = 45 | 60.5% | 58.2% | 45.0% | 0.507 | 0.589 |

Positive class: the hitter wins the point.

**Confusion matrices** (test set):

| Model | True positive | False negative | False positive | True negative |
|---|---|---|---|---|
| Tactic only | 743 | 3407 | 465 | 4558 |
| Decision tree | 1691 | 2459 | 1173 | 3850 |
| KNN | 1867 | 2283 | 1341 | 3682 |

**Reading it.** The models beat the baseline by 5.7 points of accuracy:
a single shot's situation does carry information about the point — chiefly tactic chosen, hitter distance from net, stroke — but
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
