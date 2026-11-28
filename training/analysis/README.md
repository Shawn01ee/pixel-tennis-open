# What the self-play data says

The players' learning (see [the training page](../README.md)) leaves behind a lot of tennis: every shot, the
situation it was played in, the choice made and whether it won the point. This page analyses that data in four
steps — look at it, find its structure, model it, then test the models honestly on data they have not seen. It is
rebuilt by `tools/analysis/collect.js` and `tools/analysis/analyze.js`.

**The data:** 57,406 shots from 312 short sets of self-play (every
player against every other, twice). Each row: 16 numbers describing the situation (how stretched the
hitter is, contact height, incoming pace and spin, both players' positions, where the shot is aimed relative to the
opponent, the rally length, the ratings involved), the stroke, the tactic chosen, and the label — whether the hitter
went on to win the point (46.3% of rows).

## What it found

- **The learning generalises.** Tactics learned from scratch win +4.3 points more than untrained play against opponents met in training, and +5.8 against opponents never met (4-fold cross-validation over players).
- **Situation predicts the point better than chance, not by much.** On unseen matches a decision tree is right 62.0% of the time (macro-F1 0.611) against 53.5% for always guessing the hitter wins; the most informative single facts are tactic chosen, control rating, shots so far.
- **Measured play recovers the real styles.** K-means on 14 style measures puts the counterpunchers together and the offensive baseliners together (adjusted Rand 0.409 against the known labels); KNN guesses 6 of 13 players' styles from their play alone.
- **Net play is out of balance.** A pass down the line wins 56.3% of its points, a plain volley only 56.9% and a smash 76.6%; on tour the player at the net wins most of those points and a smash nearly always does. This is why serve-and-volley players struggle in the game, and it is the next thing to fix.

## 1. Looking at the data

**Entropy.** The label carries H = 0.996 bits — almost a coin flip. Most of a point is decided by what happens
*after* any single shot, so no feature of one shot can say much; the question is which say anything at all.

**Mutual information** measures, in bits, how much knowing a feature reduces that uncertainty (continuous features
cut into eight equal-count bins first):

<picture><source media="(prefers-color-scheme: dark)" srcset="mi-dark.svg"><img src="mi-light.svg" alt="Mutual information between each feature and winning the point"></picture>

**Pearson correlation** with the label (linear only; mutual information also catches non-linear links):

| Feature | r |
|---|---|
| control rating | +0.127 |
| hitter distance from net | -0.127 |
| opponent control rating | -0.121 |
| return of serve | -0.120 |
| incoming topspin | -0.119 |
| incoming pace | -0.115 |
| power rating | -0.097 |
| how stretched | -0.067 |
| opponent speed rating | -0.052 |
| spin rating | +0.052 |
| shots so far | +0.032 |
| aim distance from opponent | +0.017 |
| contact height | +0.017 |
| accuracy rating | -0.014 |
| opponent distance from net | +0.010 |
| opponent at the net | +0.003 |

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
- return of serve ↔ shots so far: r = -0.42
- contact height ↔ return of serve: r = 0.42

**Win rate by tactic** (training rows):

| Tactic | Shots | Hitter wins the point |
|---|---|---|
| smash | 351 | 76.6% |
| putaway | 1,276 | 70.1% |
| dropvolley | 375 | 61.6% |
| volley | 938 | 56.9% |
| passline | 1,706 | 56.3% |
| angle | 3,506 | 52.1% |
| deep | 17,186 | 49.1% |
| behind | 2,634 | 47.7% |
| drop | 465 | 45.4% |
| cross | 11,070 | 45.4% |
| open | 2,931 | 44.7% |
| approach | 1,637 | 42.0% |
| passcross | 952 | 41.3% |
| safe | 5,405 | 38.2% |
| slice | 5,016 | 37.1% |
| line | 1,087 | 35.7% |
| lob | 514 | 30.0% |
| dip | 357 | 19.0% |

**Feature selection.** Keeping only the *m* features with the most mutual information, a depth-5 tree scores
(5-fold cross-validation on the training set, macro-F1):

| Features kept | Macro-F1 | Accuracy |
|---|---|---|
| 3 | 0.589 ± 0.025 | 59.1% |
| 6 | 0.590 ± 0.023 | 60.2% |
| 9 ← used | 0.604 ± 0.021 | 61.3% |
| 12 | 0.604 ± 0.021 | 61.4% |
| 18 | 0.603 ± 0.022 | 61.3% |

Kept: tactic chosen, control rating, shots so far, power rating, opponent control rating, incoming topspin, opponent distance from net, return of serve, hitter distance from net.

## 2. Structure: the players' styles

Each player's play is summed up in 14 measures taken from the matches, not from the ratings: attack, steady, defend, net, touch, pass, depth, rally, aces, df, serveWon, returnWon, winners, errors
(shares of shots by kind, average distance from the net, rally length, serve and return points won, winners and
errors per point). Standardised, then **PCA**: the first two components hold 50.6% and
15.3% of the variance.

- PC1: returnWon +0.37, steady +0.36, depth +0.34, rally +0.34
- PC2: aces +0.46, df +0.38, pass +0.37, attack +0.31

<picture><source media="(prefers-color-scheme: dark)" srcset="styles-dark.svg"><img src="styles-light.svg" alt="Players on the first two principal components, coloured by K-means cluster"></picture>

**K-means** on the standardised measures, k chosen by silhouette:

| k | Silhouette | Agreement with the known styles (adjusted Rand) |
|---|---|---|
| 2 ← chosen | 0.322 | 0.409 |
| 3 | 0.257 | 0.410 |
| 4 | 0.185 | 0.196 |
| 5 | 0.194 | 0.227 |

- **Cluster 1:** Alcaraz (all-court), Federer (all-court), Sampras (serve and volley), McEnroe (serve and volley)
- **Cluster 2:** Djokovic (offensive baseliner), Nadal (offensive baseliner), Sinner (offensive baseliner), Medvedev (counterpuncher), Zverev (offensive baseliner), de Minaur (counterpuncher), Borg (counterpuncher), Agassi (offensive baseliner), Murray (counterpuncher)

The known styles are the tennis world's labels: serve and volley (Sampras, McEnroe), all-court (Federer, Alcaraz),
offensive baseliner (Djokovic, Nadal, Sinner, Agassi, Zverev) and counterpuncher (Murray, Medvedev, de Minaur, Borg).

**KNN, leave-one-out:** each player's style predicted from the three most similar other players (distance-weighted
vote, measures standardised): **6 of 13** right (46.2%).

| Player | Known style | Predicted from play | Most similar player |
|---|---|---|---|
| Djokovic | offensive baseliner | offensive baseliner | Borg |
| Nadal | offensive baseliner | offensive baseliner | Borg |
| Alcaraz | all-court | offensive baseliner ✗ | Zverev |
| Federer | all-court | offensive baseliner ✗ | Zverev |
| Sinner | offensive baseliner | offensive baseliner | Zverev |
| Medvedev | counterpuncher | offensive baseliner ✗ | Zverev |
| Zverev | offensive baseliner | offensive baseliner | Sinner |
| de Minaur | counterpuncher | offensive baseliner ✗ | Djokovic |
| Sampras | serve and volley | all-court ✗ | Federer |
| Borg | counterpuncher | offensive baseliner ✗ | Nadal |
| Agassi | offensive baseliner | offensive baseliner | Nadal |
| Murray | counterpuncher | counterpuncher | de Minaur |
| McEnroe | serve and volley | all-court ✗ | Sampras |

## 3. Models: can a shot's situation predict the point?

Task: from one shot's situation and choice, predict whether its hitter wins the point. Two classifiers, on the
features kept above:

- **Decision tree** (CART, Gini impurity, leaves of at least 60 shots). Depth by cross-validation:
depth 2: 0.545 · depth 3: 0.553 · depth 4: 0.575 · depth 6: 0.596 · depth 8: 0.599 · depth 10: 0.597 · depth 12: 0.600 · depth 14: 0.598 → **depth 8**.
- **KNN** (z-scored features, scaling fitted on each training fold only, distance-weighted vote; up to 5,000
training rows per fold to keep the Θ(n²) cost reasonable). k by cross-validation: k=5: 0.572 · k=15: 0.588 · k=45: 0.597 · k=95: 0.600
→ **k = 95**.

What a depth-3 tree on every feature learns (training set):

```
46030 shots, 46%
  if inSpin ≤ 4.68: 36835 shots, 49%
    if oppControl ≤ 76.00: 8607 shots, 62%
      if oppDepth ≤ 8.69: → hitter wins 46% (1304 shots)
      else: → hitter wins 65% (7303 shots)
    else: 28228 shots, 45%
      if control ≤ 83.50: → hitter wins 38% (13245 shots)
      else: → hitter wins 52% (14983 shots)
  else: 9195 shots, 34%
    if gap ≤ 2.36: 6023 shots, 38%
      if inPace ≤ 16.86: → hitter wins 44% (2658 shots)
      else: → hitter wins 34% (3365 shots)
    else: 3172 shots, 26%
      if oppDepth ≤ 12.28: → hitter wins 34% (507 shots)
      else: → hitter wins 24% (2665 shots)
```

Most important features of the chosen tree (share of the impurity it removes): oppControl 16.0%, inSpin 15.5%, depth 13.3%, control 10.8%, power 9.8%, gap 7.1%, oppSpeed 7.0%, oppDepth 6.7%.

## 4. Evaluation on unseen matches

**Split.** Shots of one match share players and conditions, so the split is by match: 19.8% of
rows (62 whole matches) are held out as the **test set** and used once, at the end.
Everything above — feature selection, depth, k — was chosen by **5-fold cross-validation inside the training set**,
also grouped by match.

| Model (test set) | Accuracy | Precision | Recall | F1 | Macro-F1 |
|---|---|---|---|---|---|
| Always "the hitter wins" (baseline) | 53.5% | 0.0% | 0.0% | 0.000 | 0.349 |
| Tactic only (its training win rate) | 55.0% | 54.9% | 17.4% | 0.264 | 0.470 |
| Decision tree, depth 8 | 62.0% | 61.1% | 50.0% | 0.550 | 0.611 |
| KNN, k = 95 | 60.8% | 59.9% | 47.7% | 0.531 | 0.597 |

Positive class: the hitter wins the point.

**Confusion matrices** (test set):

| Model | True positive | False negative | False positive | True negative |
|---|---|---|---|---|
| Tactic only | 921 | 4365 | 758 | 5332 |
| Decision tree | 2645 | 2641 | 1681 | 4409 |
| KNN | 2521 | 2765 | 1690 | 4400 |

**Reading it.** The models beat the baseline by 8.5 points of accuracy:
a single shot's situation does carry information about the point — chiefly tactic chosen, control rating, shots so far — but
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
