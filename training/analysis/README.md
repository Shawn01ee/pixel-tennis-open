# What the self-play data says

The players' learning (see [the training page](../README.md)) leaves behind a lot of tennis: every shot, the
situation it was played in, the choice made and whether it won the point. This page analyses that data in four
steps — look at it, find its structure, model it, then test the models honestly on data they have not seen. It is
rebuilt by `tools/analysis/collect.js` and `tools/analysis/analyze.js`.

**The data:** 60,453 shots from 312 short sets of self-play (every
player against every other, twice). Each row: 16 numbers describing the situation (how stretched the
hitter is, contact height, incoming pace and spin, both players' positions, where the shot is aimed relative to the
opponent, the rally length, the ratings involved), the stroke, the tactic chosen, and the label — whether the hitter
went on to win the point (46.4% of rows).

## What it found

- **The learning generalises.** Tactics learned from scratch win +4.3 points more than untrained play against opponents met in training, and +5.8 against opponents never met (4-fold cross-validation over players).
- **Situation predicts the point better than chance, not by much.** On unseen matches a decision tree is right 61.0% of the time (macro-F1 0.595) against 53.7% for always guessing the hitter wins; the most informative single facts are tactic chosen, shots so far, incoming topspin.
- **Measured play recovers the real styles.** K-means on 14 style measures puts the counterpunchers together and the offensive baseliners together (adjusted Rand 0.409 against the known labels); KNN guesses 10 of 13 players' styles from their play alone.
- **Net play is out of balance.** A pass down the line wins 56.0% of its points, a plain volley only 53.1% and a smash 78.8%; on tour the player at the net wins most of those points and a smash nearly always does. This is why serve-and-volley players struggle in the game, and it is the next thing to fix.

## 1. Looking at the data

**Entropy.** The label carries H = 0.996 bits — almost a coin flip. Most of a point is decided by what happens
*after* any single shot, so no feature of one shot can say much; the question is which say anything at all.

**Mutual information** measures, in bits, how much knowing a feature reduces that uncertainty (continuous features
cut into eight equal-count bins first):

<picture><source media="(prefers-color-scheme: dark)" srcset="mi-dark.svg"><img src="mi-light.svg" alt="Mutual information between each feature and winning the point"></picture>

**Pearson correlation** with the label (linear only; mutual information also catches non-linear links):

| Feature | r |
|---|---|
| hitter distance from net | -0.132 |
| incoming topspin | -0.119 |
| return of serve | -0.115 |
| incoming pace | -0.114 |
| control rating | +0.108 |
| opponent control rating | -0.101 |
| power rating | -0.085 |
| how stretched | -0.070 |
| spin rating | +0.053 |
| opponent speed rating | -0.049 |
| shots so far | +0.029 |
| contact height | +0.023 |
| opponent distance from net | +0.013 |
| aim distance from opponent | +0.012 |
| accuracy rating | -0.011 |
| opponent at the net | +0.002 |

**Features that move together** (|r| ≥ 0.4), so a model gains little from having both:

- opponent distance from net ↔ opponent at the net: r = -0.92
- incoming pace ↔ incoming topspin: r = 0.84
- power rating ↔ control rating: r = -0.74
- incoming pace ↔ return of serve: r = 0.74
- incoming topspin ↔ return of serve: r = 0.67
- how stretched ↔ incoming pace: r = 0.57
- incoming topspin ↔ hitter distance from net: r = 0.48
- how stretched ↔ return of serve: r = 0.44
- opponent speed rating ↔ opponent control rating: r = 0.42
- contact height ↔ return of serve: r = 0.42
- return of serve ↔ shots so far: r = -0.41

**Win rate by tactic** (training rows):

| Tactic | Shots | Hitter wins the point |
|---|---|---|
| smash | 349 | 78.8% |
| putaway | 1,310 | 72.6% |
| dropvolley | 435 | 63.9% |
| passline | 1,788 | 56.0% |
| angle | 3,643 | 53.2% |
| volley | 994 | 53.1% |
| deep | 18,343 | 49.4% |
| behind | 2,938 | 47.0% |
| drop | 533 | 46.9% |
| cross | 11,768 | 44.7% |
| open | 3,069 | 43.8% |
| approach | 1,625 | 41.2% |
| passcross | 943 | 40.4% |
| safe | 5,698 | 39.0% |
| slice | 4,887 | 37.1% |
| line | 1,168 | 36.6% |
| lob | 576 | 26.9% |
| dip | 386 | 22.3% |

**Feature selection.** Keeping only the *m* features with the most mutual information, a depth-5 tree scores
(5-fold cross-validation on the training set, macro-F1):

| Features kept | Macro-F1 | Accuracy |
|---|---|---|
| 3 | 0.552 ± 0.015 | 56.2% |
| 6 | 0.552 ± 0.022 | 58.6% |
| 9 | 0.563 ± 0.017 | 59.4% |
| 12 ← used | 0.596 ± 0.012 | 61.1% |
| 18 | 0.588 ± 0.017 | 60.6% |

Kept: tactic chosen, shots so far, incoming topspin, control rating, opponent control rating, power rating, hitter distance from net, return of serve, opponent distance from net, incoming pace, opponent speed rating, stroke.

## 2. Structure: the players' styles

Each player's play is summed up in 14 measures taken from the matches, not from the ratings: attack, steady, defend, net, touch, pass, depth, rally, aces, df, serveWon, returnWon, winners, errors
(shares of shots by kind, average distance from the net, rally length, serve and return points won, winners and
errors per point). Standardised, then **PCA**: the first two components hold 51.7% and
15.6% of the variance.

- PC1: steady +0.35, depth +0.35, net −0.34, rally +0.34
- PC2: touch +0.51, pass +0.47, winners +0.35, attack +0.32

<picture><source media="(prefers-color-scheme: dark)" srcset="styles-dark.svg"><img src="styles-light.svg" alt="Players on the first two principal components, coloured by K-means cluster"></picture>

**K-means** on the standardised measures, k chosen by silhouette:

| k | Silhouette | Agreement with the known styles (adjusted Rand) |
|---|---|---|
| 2 ← chosen | 0.375 | 0.409 |
| 3 | 0.323 | 0.480 |
| 4 | 0.331 | 0.394 |
| 5 | 0.165 | 0.374 |

- **Cluster 1:** Alcaraz (all-court), Federer (all-court), Sampras (serve and volley), McEnroe (serve and volley)
- **Cluster 2:** Djokovic (offensive baseliner), Nadal (offensive baseliner), Sinner (offensive baseliner), Medvedev (counterpuncher), Zverev (offensive baseliner), de Minaur (counterpuncher), Borg (counterpuncher), Agassi (offensive baseliner), Murray (counterpuncher)

The known styles are the tennis world's labels: serve and volley (Sampras, McEnroe), all-court (Federer, Alcaraz),
offensive baseliner (Djokovic, Nadal, Sinner, Agassi, Zverev) and counterpuncher (Murray, Medvedev, de Minaur, Borg).

**KNN, leave-one-out:** each player's style predicted from the three most similar other players (distance-weighted
vote, measures standardised): **10 of 13** right (76.9%).

| Player | Known style | Predicted from play | Most similar player |
|---|---|---|---|
| Djokovic | offensive baseliner | offensive baseliner | Nadal |
| Nadal | offensive baseliner | offensive baseliner | Djokovic |
| Alcaraz | all-court | all-court | Federer |
| Federer | all-court | serve and volley ✗ | Sampras |
| Sinner | offensive baseliner | offensive baseliner | Djokovic |
| Medvedev | counterpuncher | counterpuncher | Zverev |
| Zverev | offensive baseliner | offensive baseliner | Medvedev |
| de Minaur | counterpuncher | counterpuncher | Medvedev |
| Sampras | serve and volley | all-court ✗ | Federer |
| Borg | counterpuncher | offensive baseliner ✗ | Agassi |
| Agassi | offensive baseliner | offensive baseliner | Borg |
| Murray | counterpuncher | counterpuncher | de Minaur |
| McEnroe | serve and volley | serve and volley | Sampras |

## 3. Models: can a shot's situation predict the point?

Task: from one shot's situation and choice, predict whether its hitter wins the point. Two classifiers, on the
features kept above:

- **Decision tree** (CART, Gini impurity, leaves of at least 60 shots). Depth by cross-validation:
depth 2: 0.547 · depth 3: 0.530 · depth 4: 0.547 · depth 6: 0.594 · depth 8: 0.586 · depth 10: 0.579 · depth 12: 0.582 · depth 14: 0.585 → **depth 6**.
- **KNN** (z-scored features, scaling fitted on each training fold only, distance-weighted vote; up to 5,000
training rows per fold to keep the Θ(n²) cost reasonable). k by cross-validation: k=5: 0.553 · k=15: 0.571 · k=45: 0.572 · k=95: 0.563
→ **k = 15**.

What a depth-3 tree on every feature learns (training set):

```
48866 shots, 46%
  if power ≤ 87.00: 37096 shots, 50%
    if isReturn ≤ 0.50: 30125 shots, 53%
      if oppControl ≤ 76.00: → hitter wins 66% (6672 shots)
      else: → hitter wins 49% (23453 shots)
    else: 6971 shots, 37%
      if gap ≤ 2.07: → hitter wins 41% (4747 shots)
      else: → hitter wins 28% (2224 shots)
  else: 11770 shots, 36%
    if depth ≤ 10.07: 2078 shots, 59%
      if gap ≤ 3.61: → hitter wins 53% (1237 shots)
      else: → hitter wins 68% (841 shots)
    else: 9692 shots, 31%
      if oppControl ≤ 68.50: → hitter wins 48% (1062 shots)
      else: → hitter wins 29% (8630 shots)
```

Most important features of the chosen tree (share of the impurity it removes): depth 21.0%, oppControl 20.3%, power 18.5%, isReturn 13.1%, oppDepth 6.3%, gap 4.9%, oppSpeed 3.3%, spin 2.9%.

## 4. Evaluation on unseen matches

**Split.** Shots of one match share players and conditions, so the split is by match: 19.2% of
rows (62 whole matches) are held out as the **test set** and used once, at the end.
Everything above — feature selection, depth, k — was chosen by **5-fold cross-validation inside the training set**,
also grouped by match.

| Model (test set) | Accuracy | Precision | Recall | F1 | Macro-F1 |
|---|---|---|---|---|---|
| Always "the hitter wins" (baseline) | 53.7% | 0.0% | 0.0% | 0.000 | 0.350 |
| Tactic only (its training win rate) | 57.0% | 61.5% | 19.0% | 0.291 | 0.491 |
| Decision tree, depth 6 | 61.0% | 60.6% | 45.0% | 0.516 | 0.595 |
| KNN, k = 15 | 59.4% | 57.4% | 47.4% | 0.519 | 0.584 |

Positive class: the hitter wins the point.

**Confusion matrices** (test set):

| Model | True positive | False negative | False positive | True negative |
|---|---|---|---|---|
| Tactic only | 1020 | 4340 | 638 | 5589 |
| Decision tree | 2410 | 2950 | 1565 | 4662 |
| KNN | 2540 | 2820 | 1887 | 4340 |

**Reading it.** The models beat the baseline by 7.3 points of accuracy:
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
