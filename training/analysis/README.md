# What the self-play data says

The players' learning (see [the training page](../README.md)) leaves behind a lot of tennis: every shot, the
situation it was played in, the choice made and whether it won the point. This page analyses that data in four
steps — look at it, find its structure, model it, then test the models honestly on data they have not seen. It is
rebuilt by `tools/analysis/collect.js` and `tools/analysis/analyze.js`.

**The data:** 57,392 shots from 312 short sets of self-play (every
player against every other, twice). Each row: 16 numbers describing the situation (how stretched the
hitter is, contact height, incoming pace and spin, both players' positions, where the shot is aimed relative to the
opponent, the rally length, the ratings involved), the stroke, the tactic chosen, and the label — whether the hitter
went on to win the point (46.2% of rows).

## What it found

- **The learning generalises.** Tactics learned from scratch win +4.3 points more than untrained play against opponents met in training, and +5.8 against opponents never met (4-fold cross-validation over players).
- **Situation predicts the point better than chance, not by much.** On unseen matches a decision tree is right 61.8% of the time (macro-F1 0.605) against 53.7% for always guessing the hitter wins; the most informative single facts are tactic chosen, shots so far, incoming topspin.
- **Measured play recovers the real styles.** K-means on 14 style measures puts the counterpunchers together and the offensive baseliners together (adjusted Rand 0.409 against the known labels); KNN guesses 5 of 13 players' styles from their play alone.
- **Net play is out of balance.** A pass down the line wins 55.4% of its points, a plain volley only 56.4% and a smash 74.4%; on tour the player at the net wins most of those points and a smash nearly always does. This is why serve-and-volley players struggle in the game, and it is the next thing to fix.

## 1. Looking at the data

**Entropy.** The label carries H = 0.996 bits — almost a coin flip. Most of a point is decided by what happens
*after* any single shot, so no feature of one shot can say much; the question is which say anything at all.

**Mutual information** measures, in bits, how much knowing a feature reduces that uncertainty (continuous features
cut into eight equal-count bins first):

<picture><source media="(prefers-color-scheme: dark)" srcset="mi-dark.svg"><img src="mi-light.svg" alt="Mutual information between each feature and winning the point"></picture>

**Pearson correlation** with the label (linear only; mutual information also catches non-linear links):

| Feature | r |
|---|---|
| incoming topspin | -0.126 |
| hitter distance from net | -0.124 |
| return of serve | -0.123 |
| incoming pace | -0.121 |
| control rating | +0.121 |
| opponent control rating | -0.114 |
| power rating | -0.091 |
| how stretched | -0.069 |
| spin rating | +0.063 |
| opponent speed rating | -0.051 |
| shots so far | +0.031 |
| accuracy rating | -0.022 |
| contact height | +0.019 |
| aim distance from opponent | +0.017 |
| opponent distance from net | +0.007 |
| opponent at the net | +0.005 |

**Features that move together** (|r| ≥ 0.4), so a model gains little from having both:

- opponent distance from net ↔ opponent at the net: r = -0.92
- incoming pace ↔ incoming topspin: r = 0.84
- power rating ↔ control rating: r = -0.75
- incoming pace ↔ return of serve: r = 0.74
- incoming topspin ↔ return of serve: r = 0.67
- how stretched ↔ incoming pace: r = 0.58
- incoming topspin ↔ hitter distance from net: r = 0.48
- how stretched ↔ return of serve: r = 0.43
- opponent speed rating ↔ opponent control rating: r = 0.42
- return of serve ↔ shots so far: r = -0.42
- contact height ↔ return of serve: r = 0.41

**Win rate by tactic** (training rows):

| Tactic | Shots | Hitter wins the point |
|---|---|---|
| smash | 340 | 74.4% |
| putaway | 1,251 | 68.6% |
| dropvolley | 352 | 62.2% |
| volley | 931 | 56.4% |
| passline | 1,613 | 55.4% |
| angle | 3,625 | 52.5% |
| deep | 16,822 | 49.5% |
| behind | 2,908 | 47.8% |
| passcross | 929 | 45.0% |
| drop | 492 | 44.9% |
| open | 2,866 | 44.8% |
| cross | 11,685 | 44.7% |
| approach | 1,585 | 41.7% |
| line | 1,049 | 38.2% |
| safe | 5,497 | 37.4% |
| slice | 4,496 | 37.3% |
| lob | 592 | 27.0% |
| dip | 359 | 19.8% |

**Feature selection.** Keeping only the *m* features with the most mutual information, a depth-5 tree scores
(5-fold cross-validation on the training set, macro-F1):

| Features kept | Macro-F1 | Accuracy |
|---|---|---|
| 3 | 0.562 ± 0.005 | 57.1% |
| 6 | 0.582 ± 0.008 | 58.8% |
| 9 ← used | 0.585 ± 0.007 | 60.1% |
| 12 | 0.582 ± 0.014 | 61.2% |
| 18 | 0.581 ± 0.013 | 61.1% |

Kept: tactic chosen, shots so far, incoming topspin, opponent distance from net, control rating, power rating, opponent control rating, return of serve, incoming pace.

## 2. Structure: the players' styles

Each player's play is summed up in 14 measures taken from the matches, not from the ratings: attack, steady, defend, net, touch, pass, depth, rally, aces, df, serveWon, returnWon, winners, errors
(shares of shots by kind, average distance from the net, rally length, serve and return points won, winners and
errors per point). Standardised, then **PCA**: the first two components hold 52.4% and
15.1% of the variance.

- PC1: returnWon +0.36, steady +0.35, depth +0.35, net −0.33
- PC2: touch +0.61, winners +0.46, errors +0.41, attack +0.32

<picture><source media="(prefers-color-scheme: dark)" srcset="styles-dark.svg"><img src="styles-light.svg" alt="Players on the first two principal components, coloured by K-means cluster"></picture>

**K-means** on the standardised measures, k chosen by silhouette:

| k | Silhouette | Agreement with the known styles (adjusted Rand) |
|---|---|---|
| 2 ← chosen | 0.326 | 0.409 |
| 3 | 0.217 | 0.480 |
| 4 | 0.145 | 0.147 |
| 5 | 0.126 | 0.153 |

- **Cluster 1:** Djokovic (offensive baseliner), Nadal (offensive baseliner), Sinner (offensive baseliner), Medvedev (counterpuncher), Zverev (offensive baseliner), de Minaur (counterpuncher), Borg (counterpuncher), Agassi (offensive baseliner), Murray (counterpuncher)
- **Cluster 2:** Alcaraz (all-court), Federer (all-court), Sampras (serve and volley), McEnroe (serve and volley)

The known styles are the tennis world's labels: serve and volley (Sampras, McEnroe), all-court (Federer, Alcaraz),
offensive baseliner (Djokovic, Nadal, Sinner, Agassi, Zverev) and counterpuncher (Murray, Medvedev, de Minaur, Borg).

**KNN, leave-one-out:** each player's style predicted from the three most similar other players (distance-weighted
vote, measures standardised): **5 of 13** right (38.5%).

| Player | Known style | Predicted from play | Most similar player |
|---|---|---|---|
| Djokovic | offensive baseliner | offensive baseliner | Sinner |
| Nadal | offensive baseliner | offensive baseliner | Djokovic |
| Alcaraz | all-court | offensive baseliner ✗ | Agassi |
| Federer | all-court | offensive baseliner ✗ | Sampras |
| Sinner | offensive baseliner | offensive baseliner | Djokovic |
| Medvedev | counterpuncher | offensive baseliner ✗ | Sinner |
| Zverev | offensive baseliner | offensive baseliner | Sinner |
| de Minaur | counterpuncher | offensive baseliner ✗ | Medvedev |
| Sampras | serve and volley | all-court ✗ | Federer |
| Borg | counterpuncher | offensive baseliner ✗ | Agassi |
| Agassi | offensive baseliner | offensive baseliner | Djokovic |
| Murray | counterpuncher | offensive baseliner ✗ | Medvedev |
| McEnroe | serve and volley | all-court ✗ | Sampras |

## 3. Models: can a shot's situation predict the point?

Task: from one shot's situation and choice, predict whether its hitter wins the point. Two classifiers, on the
features kept above:

- **Decision tree** (CART, Gini impurity, leaves of at least 60 shots). Depth by cross-validation:
depth 2: 0.518 · depth 3: 0.551 · depth 4: 0.569 · depth 6: 0.581 · depth 8: 0.590 · depth 10: 0.589 · depth 12: 0.585 · depth 14: 0.584 → **depth 8**.
- **KNN** (z-scored features, scaling fitted on each training fold only, distance-weighted vote; up to 5,000
training rows per fold to keep the Θ(n²) cost reasonable). k by cross-validation: k=5: 0.562 · k=15: 0.580 · k=45: 0.583 · k=95: 0.588
→ **k = 95**.

What a depth-3 tree on every feature learns (training set):

```
47116 shots, 46%
  if inSpin ≤ 4.58: 37671 shots, 49%
    if oppControl ≤ 76.00: 8798 shots, 62%
      if oppDepth ≤ 4.98: → hitter wins 43% (1086 shots)
      else: → hitter wins 64% (7712 shots)
    else: 28873 shots, 46%
      if power ≤ 87.00: → hitter wins 49% (21597 shots)
      else: → hitter wins 35% (7276 shots)
  else: 9445 shots, 34%
    if gap ≤ 2.01: 6273 shots, 37%
      if power ≤ 91.50: → hitter wins 39% (5144 shots)
      else: → hitter wins 28% (1129 shots)
    else: 3172 shots, 26%
      if oppDepth ≤ 8.34: → hitter wins 39% (279 shots)
      else: → hitter wins 25% (2893 shots)
```

Most important features of the chosen tree (share of the impurity it removes): inSpin 18.8%, oppControl 15.8%, depth 15.6%, power 15.5%, oppDepth 7.9%, spin 6.5%, oppSpeed 6.4%, gap 5.8%.

## 4. Evaluation on unseen matches

**Split.** Shots of one match share players and conditions, so the split is by match: 17.9% of
rows (62 whole matches) are held out as the **test set** and used once, at the end.
Everything above — feature selection, depth, k — was chosen by **5-fold cross-validation inside the training set**,
also grouped by match.

| Model (test set) | Accuracy | Precision | Recall | F1 | Macro-F1 |
|---|---|---|---|---|---|
| Always "the hitter wins" (baseline) | 53.7% | 0.0% | 0.0% | 0.000 | 0.349 |
| Tactic only (its training win rate) | 55.4% | 55.9% | 17.7% | 0.269 | 0.474 |
| Decision tree, depth 8 | 61.8% | 61.4% | 47.2% | 0.534 | 0.605 |
| KNN, k = 95 | 60.1% | 58.1% | 49.8% | 0.537 | 0.594 |

Positive class: the hitter wins the point.

**Confusion matrices** (test set):

| Model | True positive | False negative | False positive | True negative |
|---|---|---|---|---|
| Tactic only | 842 | 3917 | 664 | 4853 |
| Decision tree | 2244 | 2515 | 1408 | 4109 |
| KNN | 2372 | 2387 | 1708 | 3809 |

**Reading it.** The models beat the baseline by 8.1 points of accuracy:
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
