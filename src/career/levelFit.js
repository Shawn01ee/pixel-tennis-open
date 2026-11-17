// levelFit — how a player's level reaches the match: written by tools/fit-levels.js (2026-11-17)
// kappa: a player rated E Elo plays with errors and placement spread multiplied by exp(kappa·(Ea − E)/400) next to
// the roster player whose way of playing he shares (rated Ea, his peak). Fitted so that two such players, 200 Elo
// apart, win best-of-three matches against each other as often as Elo says (76%). See docs/career.
const LEVEL_FIT={kappa:0.1129,fitted:'2026-11-17'};
