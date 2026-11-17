// levelFit — how a player's level reaches the match: written by tools/fit-levels.js (2026-11-17)
// kappa: a player rated E Elo plays with errors and placement spread multiplied by exp(kappa·(Ea − E)/400) next to
// the roster player whose way of playing he shares (rated Ea, his peak). Fitted so that two such players, 200 Elo
// apart, win best-of-three matches against each other as often as Elo says (76%). See docs/career.
const LEVEL_FIT={kappa:0.1009,fitted:'2026-11-17'};
// attr: Elo a trained point is worth, measured by tools/fit-attributes.js (2026-11-17); attrRaw: [measured, 95% low, high]; see docs/career
LEVEL_FIT.attr={"serve":4.2,"power":0,"speed":4.8,"spin":3.5,"control":39.7,"accuracy":26.5,"touch":12,"stamina":3.7};LEVEL_FIT.attrRaw={"serve":[4.2,0.4,8],"power":[-6.5,-10.4,-2.8],"speed":[4.8,1.1,8.6],"spin":[3.5,-0.2,7.3],"control":[39.7,34.1,47.4],"accuracy":[26.5,22,31.9],"touch":[12,8.2,16.2],"stamina":[3.7,0,7.5]};
