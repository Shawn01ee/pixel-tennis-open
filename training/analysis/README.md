# What the self-play data says

The players' learning (see [the training page](../README.md)) leaves behind a lot of tennis: every shot, the
situation it was played in, the choice made and whether it won the point. This page analyses that data in four
steps — look at it, find its structure, model it, then test the models honestly on data they have not seen. It is
rebuilt by `tools/analysis/collect.js` and `tools/analysis/analyze.js`.

**The data:** 41,422 shots from 312 short sets of self-play (every
player against every other, twice). Each row: 16 numbers describing the situation (how stretched the
hitter is, contact height, incoming pace and spin, both players' positions, where the shot is aimed relative to the
opponent, the rally length, the ratings involved), the stroke, the tactic chosen, and the label — whether the hitter
went on to win the point (50.7% of rows).

## What it found

- **The learning generalises.** Tactics learned from scratch win +4.3 points more than untrained play against opponents met in training, and +5.8 against opponents never met (4-fold cross-validation over players).
- **Situation predicts the point better than chance, not by much.** On unseen matches a decision tree is right 66.8% of the time (macro-F1 0.668) against 50.7% for always guessing the hitter wins; the most informative single facts are tactic chosen, incoming topspin, shots so far.
- **Measured play recovers the real styles.** K-means on 14 style measures puts the counterpunchers together and the offensive baseliners together (adjusted Rand 0.521 against the known labels); KNN guesses 10 of 13 players' styles from their play alone.
- **Net play is out of balance.** A pass down the line wins 80.0% of its points, a plain volley only 26.1% and a smash 52.2%; on tour the player at the net wins most of those points and a smash nearly always does. This is why serve-and-volley players struggle in the game, and it is the next thing to fix.

## 1. Looking at the data

**Entropy.** The label carries H = 1.000 bits — almost a coin flip. Most of a point is decided by what happens
*after* any single shot, so no feature of one shot can say much; the question is which say anything at all.

**Mutual information** measures, in bits, how much knowing a feature reduces that uncertainty (continuous features
cut into eight equal-count bins first):

<picture><source media="(prefers-color-scheme: dark)" srcset="mi-dark.svg"><img src="mi-light.svg" alt="Mutual information between each feature and winning the point"></picture>

**Pearson correlation** with the label (linear only; mutual information also catches non-linear links):

| Feature | r |
|---|---|
| return of serve | -0.189 |
| incoming pace | -0.187 |
| incoming topspin | -0.184 |
| aim distance from opponent | +0.174 |
| how stretched | -0.156 |
| opponent distance from net | -0.135 |
| hitter distance from net | -0.135 |
| opponent at the net | +0.133 |
| spin rating | +0.116 |
| accuracy rating | +0.108 |
| power rating | +0.088 |
| control rating | +0.050 |
| opponent control rating | -0.035 |
| shots so far | +0.033 |
| contact height | -0.027 |
| opponent speed rating | -0.002 |

**Features that move together** (|r| ≥ 0.4), so a model gains little from having both:

- opponent distance from net ↔ opponent at the net: r = -0.93
- incoming pace ↔ incoming topspin: r = 0.75
- incoming topspin ↔ return of serve: r = 0.71
- how stretched ↔ incoming pace: r = 0.66
- incoming pace ↔ return of serve: r = 0.65
- power rating ↔ spin rating: r = 0.59
- incoming topspin ↔ hitter distance from net: r = 0.50
- aim distance from opponent ↔ return of serve: r = -0.47
- how stretched ↔ incoming topspin: r = 0.46

**Win rate by tactic** (training rows):

| Tactic | Shots | Hitter wins the point |
|---|---|---|
| putaway | 791 | 83.2% |
| passline | 3,330 | 80.0% |
| angle | 1,305 | 64.6% |
| cross | 8,941 | 61.3% |
| open | 1,834 | 57.1% |
| behind | 1,014 | 53.0% |
| smash | 3,763 | 52.2% |
| passcross | 770 | 48.7% |
| drop | 218 | 48.2% |
| approach | 106 | 43.4% |
| deep | 2,299 | 43.4% |
| line | 1,927 | 41.7% |
| safe | 7,083 | 41.2% |
| dropvolley | 1,265 | 40.4% |
| lob | 1,310 | 32.7% |
| slice | 3,445 | 32.3% |
| volley | 1,856 | 26.1% |
| dip | 165 | 16.4% |

**Feature selection.** Keeping only the *m* features with the most mutual information, a depth-5 tree scores
(5-fold cross-validation on the training set, macro-F1):

| Features kept | Macro-F1 | Accuracy |
|---|---|---|
| 3 | 0.621 ± 0.007 | 62.6% |
| 6 | 0.636 ± 0.008 | 63.9% |
| 9 ← used | 0.660 ± 0.011 | 66.0% |
| 12 | 0.659 ± 0.007 | 65.9% |
| 18 | 0.655 ± 0.012 | 65.6% |

Kept: tactic chosen, incoming topspin, shots so far, incoming pace, contact height, opponent distance from net, aim distance from opponent, return of serve, how stretched.

## 2. Structure: the players' styles

Each player's play is summed up in 14 measures taken from the matches, not from the ratings: attack, steady, defend, net, touch, pass, depth, rally, aces, df, serveWon, returnWon, winners, errors
(shares of shots by kind, average distance from the net, rally length, serve and return points won, winners and
errors per point). Standardised, then **PCA**: the first two components hold 40.6% and
22.2% of the variance.

- PC1: net −0.37, returnWon +0.36, steady +0.36, pass +0.33
- PC2: rally +0.52, attack +0.48, serveWon −0.43, winners −0.35

<picture><source media="(prefers-color-scheme: dark)" srcset="styles-dark.svg"><img src="styles-light.svg" alt="Players on the first two principal components, coloured by K-means cluster"></picture>

**K-means** on the standardised measures, k chosen by silhouette:

| k | Silhouette | Agreement with the known styles (adjusted Rand) |
|---|---|---|
| 2 | 0.172 | 0.037 |
| 3 | 0.232 | 0.500 |
| 4 | 0.255 | 0.598 |
| 5 ← chosen | 0.264 | 0.521 |

- **Cluster 1:** Nadal (offensive baseliner), Alcaraz (all-court), Federer (all-court), Sinner (offensive baseliner), Agassi (offensive baseliner)
- **Cluster 2:** Medvedev (counterpuncher), de Minaur (counterpuncher), Borg (counterpuncher), Murray (counterpuncher)
- **Cluster 3:** Sampras (serve and volley), McEnroe (serve and volley)
- **Cluster 4:** Djokovic (offensive baseliner)
- **Cluster 5:** Zverev (offensive baseliner)

The known styles are the tennis world's labels: serve and volley (Sampras, McEnroe), all-court (Federer, Alcaraz),
offensive baseliner (Djokovic, Nadal, Sinner, Agassi, Zverev) and counterpuncher (Murray, Medvedev, de Minaur, Borg).

**KNN, leave-one-out:** each player's style predicted from the three most similar other players (distance-weighted
vote, measures standardised): **10 of 13** right (76.9%).

| Player | Known style | Predicted from play | Most similar player |
|---|---|---|---|
| Djokovic | offensive baseliner | offensive baseliner | Nadal |
| Nadal | offensive baseliner | offensive baseliner | Agassi |
| Alcaraz | all-court | offensive baseliner ✗ | Federer |
| Federer | all-court | offensive baseliner ✗ | Sinner |
| Sinner | offensive baseliner | offensive baseliner | Federer |
| Medvedev | counterpuncher | counterpuncher | Murray |
| Zverev | offensive baseliner | offensive baseliner | Sinner |
| de Minaur | counterpuncher | counterpuncher | Murray |
| Sampras | serve and volley | all-court ✗ | Federer |
| Borg | counterpuncher | counterpuncher | Murray |
| Agassi | offensive baseliner | offensive baseliner | Nadal |
| Murray | counterpuncher | counterpuncher | Medvedev |
| McEnroe | serve and volley | serve and volley | Sampras |

## 3. Models: can a shot's situation predict the point?

Task: from one shot's situation and choice, predict whether its hitter wins the point. Two classifiers, on the
features kept above:

- **Decision tree** (CART, Gini impurity, leaves of at least 60 shots). Depth by cross-validation:
depth 2: 0.620 · depth 3: 0.642 · depth 4: 0.652 · depth 6: 0.659 · depth 8: 0.656 · depth 10: 0.661 · depth 12: 0.661 · depth 14: 0.659 → **depth 10**.
- **KNN** (z-scored features, scaling fitted on each training fold only, distance-weighted vote; up to 5,000
training rows per fold to keep the Θ(n²) cost reasonable). k by cross-validation: k=5: 0.627 · k=15: 0.651 · k=45: 0.660 · k=95: 0.660
→ **k = 45**.

What a depth-3 tree on every feature learns (training set):

```
32790 shots, 51%
  if inSpin ≤ 3.94: 20824 shots, 59%
    if tac=volley ≤ 0.50: 19403 shots, 61%
      if gap ≤ 2.62: → hitter wins 46% (5086 shots)
      else: → hitter wins 67% (14317 shots)
    else: 1421 shots, 26%
      if depth ≤ 7.23: → hitter wins 55% (200 shots)
      else: → hitter wins 21% (1221 shots)
  else: 11966 shots, 37%
    if oppDepth ≤ 11.57: 1335 shots, 54%
      if control ≤ 88.00: → hitter wins 48% (899 shots)
      else: → hitter wins 66% (436 shots)
    else: 10631 shots, 34%
      if tac=slice ≤ 0.50: → hitter wins 37% (8874 shots)
      else: → hitter wins 20% (1757 shots)
```

Most important features of the chosen tree (share of the impurity it removes): inSpin 21.1%, gap 13.0%, power 8.9%, tac=volley 8.2%, oppDepth 8.0%, tac=passline 6.4%, depth 6.2%, inPace 5.1%.

## 4. Evaluation on unseen matches

**Split.** Shots of one match share players and conditions, so the split is by match: 20.8% of
rows (62 whole matches) are held out as the **test set** and used once, at the end.
Everything above — feature selection, depth, k — was chosen by **5-fold cross-validation inside the training set**,
also grouped by match.

| Model (test set) | Accuracy | Precision | Recall | F1 | Macro-F1 |
|---|---|---|---|---|---|
| Always "the hitter wins" (baseline) | 50.7% | 50.7% | 100.0% | 0.673 | 0.336 |
| Tactic only (its training win rate) | 63.1% | 63.7% | 63.0% | 0.634 | 0.631 |
| Decision tree, depth 10 | 66.8% | 67.0% | 67.9% | 0.675 | 0.668 |
| KNN, k = 45 | 66.8% | 68.4% | 64.3% | 0.663 | 0.668 |

Positive class: the hitter wins the point.

**Confusion matrices** (test set):

| Model | True positive | False negative | False positive | True negative |
|---|---|---|---|---|
| Tactic only | 2757 | 1617 | 1571 | 2687 |
| Decision tree | 2970 | 1404 | 1462 | 2796 |
| KNN | 2811 | 1563 | 1299 | 2959 |

**Reading it.** The models beat the baseline by 16.2 points of accuracy:
a single shot's situation does carry information about the point — chiefly tactic chosen, incoming topspin, shots so far — but
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
