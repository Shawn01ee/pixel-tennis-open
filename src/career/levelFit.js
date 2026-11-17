// levelFit — how a player's level reaches the match: written by tools/fit-levels.js (2026-11-17)
// kappa: a player rated E Elo plays with errors and placement spread multiplied by exp(kappa·(Ea − E)/400) next to
// the roster player whose way of playing he shares (rated Ea, his peak). Fitted so that two such players, 200 Elo
// apart, win best-of-three matches against each other as often as Elo says (76%). See docs/career.
const LEVEL_FIT={kappa:0.1098,fitted:'2026-11-17'};
// attr: Elo a trained point is worth, measured by tools/fit-attributes.js (2026-11-17); attrRaw: [measured, 95% low, high]; see docs/career
LEVEL_FIT.attr={"serve":0,"power":0,"speed":5.4,"spin":4.2,"control":46.2,"accuracy":29.9,"touch":7.6,"stamina":5.2};LEVEL_FIT.attrRaw={"serve":[-1.2,-5,2.5],"power":[-2.3,-6,1.4],"speed":[5.4,1.7,9.3],"spin":[4.2,0.4,8],"control":[46.2,39.8,55.7],"accuracy":[29.9,25.2,35.7],"touch":[7.6,3.8,11.5],"stamina":[5.2,1.5,9]};
