# What the self-play data says

The players' learning (see [the training page](../README.md)) leaves behind a lot of tennis: every shot, the
situation it was played in, the choice made and whether it won the point. This page analyses that data in four
steps — look at it, find its structure, model it, then test the models honestly on data they have not seen. It is
rebuilt by `tools/analysis/collect.js` and `tools/analysis/analyze.js`.

**The data:** 61,071 shots from 312 short sets of self-play (every
player against every other, twice). Each row: 16 numbers describing the situation (how stretched the
hitter is, contact height, incoming pace and spin, both players' positions, where the shot is aimed relative to the
opponent, the rally length, the ratings involved), the stroke, the tactic chosen, and the label — whether the hitter
went on to win the point (46.4% of rows).

## What it found

- **The learning generalises.** Tactics learned from scratch win +4.3 points more than untrained play against opponents met in training, and +5.8 against opponents never met (4-fold cross-validation over players).
- **Situation predicts the point better than chance, not by much.** On unseen matches a decision tree is right 60.7% of the time (macro-F1 0.602) against 53.7% for always guessing the hitter wins; the most informative single facts are tactic chosen, shots so far, power rating.
- **Measured play recovers the real styles.** K-means on 14 style measures puts the counterpunchers together and the offensive baseliners together (adjusted Rand 0.211 against the known labels); KNN guesses 6 of 13 players' styles from their play alone.
- **Net play is out of balance.** A pass down the line wins 56.5% of its points, a plain volley only 53.6% and a smash 78.5%; on tour the player at the net wins most of those points and a smash nearly always does. This is why serve-and-volley players struggle in the game, and it is the next thing to fix.

## 1. Looking at the data

**Entropy.** The label carries H = 0.996 bits — almost a coin flip. Most of a point is decided by what happens
*after* any single shot, so no feature of one shot can say much; the question is which say anything at all.

**Mutual information** measures, in bits, how much knowing a feature reduces that uncertainty (continuous features
cut into eight equal-count bins first):

<picture><source media="(prefers-color-scheme: dark)" srcset="mi-dark.svg"><img src="mi-light.svg" alt="Mutual information between each feature and winning the point"></picture>

**Pearson correlation** with the label (linear only; mutual information also catches non-linear links):

| Feature | r |
|---|---|
| hitter distance from net | -0.129 |
| return of serve | -0.119 |
| incoming topspin | -0.116 |
| incoming pace | -0.113 |
| control rating | +0.111 |
| opponent control rating | -0.106 |
| power rating | -0.079 |
| how stretched | -0.070 |
| opponent speed rating | -0.066 |
| spin rating | +0.047 |
| shots so far | +0.030 |
| accuracy rating | -0.020 |
| contact height | +0.019 |
| aim distance from opponent | +0.017 |
| opponent distance from net | +0.012 |
| opponent at the net | +0.001 |

**Features that move together** (|r| ≥ 0.4), so a model gains little from having both:

- opponent distance from net ↔ opponent at the net: r = -0.92
- incoming pace ↔ incoming topspin: r = 0.83
- power rating ↔ control rating: r = -0.74
- incoming pace ↔ return of serve: r = 0.74
- incoming topspin ↔ return of serve: r = 0.67
- how stretched ↔ incoming pace: r = 0.58
- incoming topspin ↔ hitter distance from net: r = 0.47
- how stretched ↔ return of serve: r = 0.44
- opponent speed rating ↔ opponent control rating: r = 0.43
- contact height ↔ return of serve: r = 0.41

**Win rate by tactic** (training rows):

| Tactic | Shots | Hitter wins the point |
|---|---|---|
| smash | 362 | 78.5% |
| putaway | 1,317 | 71.5% |
| dropvolley | 394 | 61.2% |
| passline | 1,785 | 56.5% |
| volley | 1,059 | 53.6% |
| angle | 3,629 | 53.2% |
| deep | 18,543 | 49.0% |
| drop | 516 | 48.1% |
| behind | 2,940 | 47.1% |
| cross | 11,498 | 45.5% |
| open | 3,126 | 45.1% |
| approach | 1,817 | 42.6% |
| passcross | 1,047 | 40.1% |
| line | 1,161 | 38.8% |
| slice | 5,027 | 37.9% |
| safe | 5,808 | 37.8% |
| lob | 636 | 27.2% |
| dip | 406 | 23.9% |

**Feature selection.** Keeping only the *m* features with the most mutual information, a depth-5 tree scores
(5-fold cross-validation on the training set, macro-F1):

| Features kept | Macro-F1 | Accuracy |
|---|---|---|
| 3 | 0.540 ± 0.032 | 56.3% |
| 6 | 0.571 ± 0.020 | 58.3% |
| 9 | 0.554 ± 0.026 | 58.8% |
| 12 ← used | 0.577 ± 0.019 | 59.4% |
| 18 | 0.576 ± 0.020 | 59.3% |

Kept: tactic chosen, shots so far, power rating, opponent distance from net, incoming topspin, return of serve, control rating, hitter distance from net, opponent control rating, incoming pace, spin rating, opponent speed rating.

## 2. Structure: the players' styles

Each player's play is summed up in 14 measures taken from the matches, not from the ratings: attack, steady, defend, net, touch, pass, depth, rally, aces, df, serveWon, returnWon, winners, errors
(shares of shots by kind, average distance from the net, rally length, serve and return points won, winners and
errors per point). Standardised, then **PCA**: the first two components hold 49.2% and
15.1% of the variance.

- PC1: steady +0.36, depth +0.35, rally +0.35, net −0.34
- PC2: aces +0.50, errors +0.44, attack +0.38, df +0.34

<picture><source media="(prefers-color-scheme: dark)" srcset="styles-dark.svg"><img src="styles-light.svg" alt="Players on the first two principal components, coloured by K-means cluster"></picture>

**K-means** on the standardised measures, k chosen by silhouette:

| k | Silhouette | Agreement with the known styles (adjusted Rand) |
|---|---|---|
| 2 ← chosen | 0.393 | 0.211 |
| 3 | 0.223 | 0.188 |
| 4 | 0.230 | 0.196 |
| 5 | 0.247 | 0.153 |

- **Cluster 1:** Sampras (serve and volley), McEnroe (serve and volley)
- **Cluster 2:** Djokovic (offensive baseliner), Nadal (offensive baseliner), Alcaraz (all-court), Federer (all-court), Sinner (offensive baseliner), Medvedev (counterpuncher), Zverev (offensive baseliner), de Minaur (counterpuncher), Borg (counterpuncher), Agassi (offensive baseliner), Murray (counterpuncher)

The known styles are the tennis world's labels: serve and volley (Sampras, McEnroe), all-court (Federer, Alcaraz),
offensive baseliner (Djokovic, Nadal, Sinner, Agassi, Zverev) and counterpuncher (Murray, Medvedev, de Minaur, Borg).

**KNN, leave-one-out:** each player's style predicted from the three most similar other players (distance-weighted
vote, measures standardised): **6 of 13** right (46.2%).

| Player | Known style | Predicted from play | Most similar player |
|---|---|---|---|
| Djokovic | offensive baseliner | offensive baseliner | Agassi |
| Nadal | offensive baseliner | offensive baseliner | Agassi |
| Alcaraz | all-court | offensive baseliner ✗ | Sinner |
| Federer | all-court | offensive baseliner ✗ | Zverev |
| Sinner | offensive baseliner | offensive baseliner | Zverev |
| Medvedev | counterpuncher | offensive baseliner ✗ | Zverev |
| Zverev | offensive baseliner | offensive baseliner | Sinner |
| de Minaur | counterpuncher | offensive baseliner ✗ | Djokovic |
| Sampras | serve and volley | all-court ✗ | Federer |
| Borg | counterpuncher | offensive baseliner ✗ | Agassi |
| Agassi | offensive baseliner | offensive baseliner | Djokovic |
| Murray | counterpuncher | offensive baseliner ✗ | Djokovic |
| McEnroe | serve and volley | serve and volley | Sampras |

## 3. Models: can a shot's situation predict the point?

Task: from one shot's situation and choice, predict whether its hitter wins the point. Two classifiers, on the
features kept above:

- **Decision tree** (CART, Gini impurity, leaves of at least 60 shots). Depth by cross-validation:
depth 2: 0.476 · depth 3: 0.516 · depth 4: 0.535 · depth 6: 0.585 · depth 8: 0.587 · depth 10: 0.590 · depth 12: 0.590 · depth 14: 0.590 → **depth 10**.
- **KNN** (z-scored features, scaling fitted on each training fold only, distance-weighted vote; up to 5,000
training rows per fold to keep the Θ(n²) cost reasonable). k by cross-validation: k=5: 0.561 · k=15: 0.576 · k=45: 0.578 · k=95: 0.581
→ **k = 95**.

What a depth-3 tree on every feature learns (training set):

```
50049 shots, 46%
  if inSpin ≤ 4.51: 40087 shots, 49%
    if oppControl ≤ 76.00: 9231 shots, 60%
      if power ≤ 87.00: → hitter wins 63% (7098 shots)
      else: → hitter wins 50% (2133 shots)
    else: 30856 shots, 46%
      if power ≤ 91.50: → hitter wins 48% (25935 shots)
      else: → hitter wins 34% (4921 shots)
  else: 9962 shots, 35%
    if gap ≤ 2.10: 6700 shots, 38%
      if oppControl ≤ 68.50: → hitter wins 50% (916 shots)
      else: → hitter wins 36% (5784 shots)
    else: 3262 shots, 27%
      if inPace ≤ 18.59: → hitter wins 34% (1240 shots)
      else: → hitter wins 23% (2022 shots)
```

Most important features of the chosen tree (share of the impurity it removes): inSpin 14.5%, depth 14.5%, oppControl 14.1%, power 11.4%, oppSpeed 7.5%, oppDepth 7.1%, gap 6.0%, spin 4.2%.

## 4. Evaluation on unseen matches

**Split.** Shots of one match share players and conditions, so the split is by match: 18.0% of
rows (62 whole matches) are held out as the **test set** and used once, at the end.
Everything above — feature selection, depth, k — was chosen by **5-fold cross-validation inside the training set**,
also grouped by match.

| Model (test set) | Accuracy | Precision | Recall | F1 | Macro-F1 |
|---|---|---|---|---|---|
| Always "the hitter wins" (baseline) | 53.7% | 0.0% | 0.0% | 0.000 | 0.350 |
| Tactic only (its training win rate) | 56.0% | 57.9% | 18.2% | 0.277 | 0.480 |
| Decision tree, depth 10 | 60.7% | 58.1% | 53.7% | 0.558 | 0.602 |
| KNN, k = 95 | 60.0% | 59.0% | 44.2% | 0.505 | 0.584 |

Positive class: the hitter wins the point.

**Confusion matrices** (test set):

| Model | True positive | False negative | False positive | True negative |
|---|---|---|---|---|
| Tactic only | 927 | 4173 | 673 | 5249 |
| Decision tree | 2737 | 2363 | 1972 | 3950 |
| KNN | 2252 | 2848 | 1566 | 4356 |

**Reading it.** The models beat the baseline by 6.9 points of accuracy:
a single shot's situation does carry information about the point — chiefly tactic chosen, shots so far, power rating — but
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
