# What the self-play data says

The players' learning (see [the training page](../README.md)) leaves behind a lot of tennis: every shot, the
situation it was played in, the choice made and whether it won the point. This page analyses that data in four
steps — look at it, find its structure, model it, then test the models honestly on data they have not seen. It is
rebuilt by `tools/analysis/collect.js` and `tools/analysis/analyze.js`.

**The data:** 45,231 shots from 312 short sets of self-play (every
player against every other, twice). Each row: 16 numbers describing the situation (how stretched the
hitter is, contact height, incoming pace and spin, both players' positions, where the shot is aimed relative to the
opponent, the rally length, the ratings involved), the stroke, the tactic chosen, and the label — whether the hitter
went on to win the point (51.2% of rows).

## What it found

- **The learning generalises.** Tactics learned from scratch win +4.3 points more than untrained play against opponents met in training, and +5.8 against opponents never met (4-fold cross-validation over players).
- **Situation predicts the point better than chance, not by much.** On unseen matches a decision tree is right 69.4% of the time (macro-F1 0.693) against 51.2% for always guessing the hitter wins; the most informative single facts are tactic chosen, incoming topspin, contact height.
- **Measured play recovers the real styles.** K-means on 14 style measures puts the counterpunchers together and the offensive baseliners together (adjusted Rand 0.598 against the known labels); KNN guesses 8 of 13 players' styles from their play alone.
- **Net play is out of balance.** A pass down the line wins 82.5% of its points, a plain volley only 23.0% and a smash 49.8%; on tour the player at the net wins most of those points and a smash nearly always does. This is why serve-and-volley players struggle in the game, and it is the next thing to fix.

## 1. Looking at the data

**Entropy.** The label carries H = 1.000 bits — almost a coin flip. Most of a point is decided by what happens
*after* any single shot, so no feature of one shot can say much; the question is which say anything at all.

**Mutual information** measures, in bits, how much knowing a feature reduces that uncertainty (continuous features
cut into eight equal-count bins first):

<picture><source media="(prefers-color-scheme: dark)" srcset="mi-dark.svg"><img src="mi-light.svg" alt="Mutual information between each feature and winning the point"></picture>

**Pearson correlation** with the label (linear only; mutual information also catches non-linear links):

| Feature | r |
|---|---|
| incoming pace | -0.154 |
| return of serve | -0.150 |
| opponent distance from net | -0.150 |
| incoming topspin | -0.148 |
| aim distance from opponent | +0.147 |
| opponent at the net | +0.141 |
| accuracy rating | +0.138 |
| how stretched | -0.125 |
| spin rating | +0.111 |
| hitter distance from net | -0.105 |
| power rating | +0.093 |
| control rating | +0.053 |
| opponent control rating | -0.042 |
| contact height | -0.036 |
| opponent speed rating | +0.017 |
| shots so far | +0.009 |

**Features that move together** (|r| ≥ 0.4), so a model gains little from having both:

- opponent distance from net ↔ opponent at the net: r = -0.93
- incoming pace ↔ incoming topspin: r = 0.74
- incoming topspin ↔ return of serve: r = 0.68
- how stretched ↔ incoming pace: r = 0.64
- incoming pace ↔ return of serve: r = 0.63
- power rating ↔ spin rating: r = 0.59
- incoming topspin ↔ hitter distance from net: r = 0.50
- aim distance from opponent ↔ return of serve: r = -0.46
- how stretched ↔ incoming topspin: r = 0.44

**Win rate by tactic** (training rows):

| Tactic | Shots | Hitter wins the point |
|---|---|---|
| passline | 3,610 | 82.5% |
| putaway | 800 | 78.8% |
| cross | 10,451 | 61.0% |
| angle | 1,449 | 59.1% |
| open | 2,131 | 54.4% |
| behind | 1,200 | 53.3% |
| passcross | 706 | 52.3% |
| smash | 3,805 | 49.8% |
| approach | 125 | 48.0% |
| drop | 289 | 44.6% |
| safe | 6,986 | 44.3% |
| line | 2,501 | 42.4% |
| deep | 2,637 | 42.3% |
| dropvolley | 1,329 | 39.7% |
| slice | 3,832 | 35.7% |
| lob | 1,184 | 34.1% |
| volley | 2,003 | 23.0% |
| dip | 193 | 14.5% |

**Feature selection.** Keeping only the *m* features with the most mutual information, a depth-5 tree scores
(5-fold cross-validation on the training set, macro-F1):

| Features kept | Macro-F1 | Accuracy |
|---|---|---|
| 3 | 0.606 ± 0.015 | 61.2% |
| 6 | 0.640 ± 0.011 | 64.1% |
| 9 | 0.640 ± 0.012 | 64.3% |
| 12 | 0.639 ± 0.009 | 64.2% |
| 18 ← used | 0.648 ± 0.009 | 65.0% |

Kept: tactic chosen, incoming topspin, contact height, opponent distance from net, incoming pace, aim distance from opponent, shots so far, return of serve, power rating, opponent at the net, accuracy rating, spin rating, control rating, opponent control rating, how stretched, hitter distance from net, opponent speed rating, stroke.

## 2. Structure: the players' styles

Each player's play is summed up in 14 measures taken from the matches, not from the ratings: attack, steady, defend, net, touch, pass, depth, rally, aces, df, serveWon, returnWon, winners, errors
(shares of shots by kind, average distance from the net, rally length, serve and return points won, winners and
errors per point). Standardised, then **PCA**: the first two components hold 37.0% and
30.0% of the variance.

- PC1: steady −0.38, returnWon −0.35, touch +0.35, defend +0.34
- PC2: rally +0.47, attack +0.46, serveWon −0.33, net −0.30

<picture><source media="(prefers-color-scheme: dark)" srcset="styles-dark.svg"><img src="styles-light.svg" alt="Players on the first two principal components, coloured by K-means cluster"></picture>

**K-means** on the standardised measures, k chosen by silhouette:

| k | Silhouette | Agreement with the known styles (adjusted Rand) |
|---|---|---|
| 2 | 0.233 | 0.409 |
| 3 ← chosen | 0.268 | 0.598 |
| 4 | 0.245 | 0.639 |
| 5 | 0.247 | 0.530 |

- **Cluster 1:** Alcaraz (all-court), Federer (all-court), Zverev (offensive baseliner), Sampras (serve and volley), McEnroe (serve and volley)
- **Cluster 2:** Medvedev (counterpuncher), de Minaur (counterpuncher), Borg (counterpuncher), Murray (counterpuncher)
- **Cluster 3:** Djokovic (offensive baseliner), Nadal (offensive baseliner), Sinner (offensive baseliner), Agassi (offensive baseliner)

The known styles are the tennis world's labels: serve and volley (Sampras, McEnroe), all-court (Federer, Alcaraz),
offensive baseliner (Djokovic, Nadal, Sinner, Agassi, Zverev) and counterpuncher (Murray, Medvedev, de Minaur, Borg).

**KNN, leave-one-out:** each player's style predicted from the three most similar other players (distance-weighted
vote, measures standardised): **8 of 13** right (61.5%).

| Player | Known style | Predicted from play | Most similar player |
|---|---|---|---|
| Djokovic | offensive baseliner | offensive baseliner | Nadal |
| Nadal | offensive baseliner | offensive baseliner | Sinner |
| Alcaraz | all-court | offensive baseliner ✗ | Federer |
| Federer | all-court | offensive baseliner ✗ | Alcaraz |
| Sinner | offensive baseliner | offensive baseliner | Nadal |
| Medvedev | counterpuncher | counterpuncher | Murray |
| Zverev | offensive baseliner | all-court ✗ | Sinner |
| de Minaur | counterpuncher | counterpuncher | Medvedev |
| Sampras | serve and volley | all-court ✗ | Federer |
| Borg | counterpuncher | counterpuncher | Murray |
| Agassi | offensive baseliner | offensive baseliner | Sinner |
| Murray | counterpuncher | counterpuncher | Medvedev |
| McEnroe | serve and volley | all-court ✗ | Sampras |

## 3. Models: can a shot's situation predict the point?

Task: from one shot's situation and choice, predict whether its hitter wins the point. Two classifiers, on the
features kept above:

- **Decision tree** (CART, Gini impurity, leaves of at least 60 shots). Depth by cross-validation:
depth 2: 0.611 · depth 3: 0.618 · depth 4: 0.636 · depth 6: 0.656 · depth 8: 0.668 · depth 10: 0.674 · depth 12: 0.678 · depth 14: 0.673 → **depth 12**.
- **KNN** (z-scored features, scaling fitted on each training fold only, distance-weighted vote; up to 5,000
training rows per fold to keep the Θ(n²) cost reasonable). k by cross-validation: k=5: 0.628 · k=15: 0.641 · k=45: 0.644 · k=95: 0.642
→ **k = 45**.

What a depth-3 tree on every feature learns (training set):

```
36518 shots, 51%
  if tac=passline ≤ 0.50: 33615 shots, 48%
    if gap ≤ 3.12: 17937 shots, 40%
      if oppSpeed ≤ 99.50: → hitter wins 38% (16582 shots)
      else: → hitter wins 60% (1355 shots)
    else: 15678 shots, 59%
      if spin ≤ 71.50: → hitter wins 43% (4408 shots)
      else: → hitter wins 65% (11270 shots)
  else: 2903 shots, 82%
    if height ≤ 0.66: 882 shots, 67%
      if stretch ≤ 0.33: → hitter wins 79% (274 shots)
      else: → hitter wins 62% (608 shots)
    else: 2021 shots, 89%
      if gap ≤ 2.22: → hitter wins 73% (325 shots)
      else: → hitter wins 92% (1696 shots)
```

Most important features of the chosen tree (share of the impurity it removes): gap 18.3%, tac=passline 13.3%, oppDepth 10.7%, spin 8.0%, oppSpeed 8.0%, inSpin 5.9%, depth 4.9%, tac=volley 4.0%.

## 4. Evaluation on unseen matches

**Split.** Shots of one match share players and conditions, so the split is by match: 19.3% of
rows (62 whole matches) are held out as the **test set** and used once, at the end.
Everything above — feature selection, depth, k — was chosen by **5-fold cross-validation inside the training set**,
also grouped by match.

| Model (test set) | Accuracy | Precision | Recall | F1 | Macro-F1 |
|---|---|---|---|---|---|
| Always "the hitter wins" (baseline) | 51.2% | 51.2% | 100.0% | 0.677 | 0.338 |
| Tactic only (its training win rate) | 61.7% | 64.7% | 55.3% | 0.596 | 0.616 |
| Decision tree, depth 12 | 69.4% | 72.5% | 64.7% | 0.684 | 0.693 |
| KNN, k = 45 | 67.4% | 69.8% | 64.1% | 0.668 | 0.674 |

Positive class: the hitter wins the point.

**Confusion matrices** (test set):

| Model | True positive | False negative | False positive | True negative |
|---|---|---|---|---|
| Tactic only | 2464 | 1994 | 1344 | 2911 |
| Decision tree | 2883 | 1575 | 1093 | 3162 |
| KNN | 2858 | 1600 | 1238 | 3017 |

**Reading it.** The models beat the baseline by 18.2 points of accuracy:
a single shot's situation does carry information about the point — chiefly tactic chosen, incoming topspin, contact height — but
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
