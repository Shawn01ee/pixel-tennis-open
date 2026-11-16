// fitted — each player's numbers fitted to his real statistics by tools/fit-players.js (2026-11-16)
// Derived from the Tennis Abstract Match Charting Project (https://github.com/JeffSackmann/tennis_MatchChartingProject),
// licensed CC BY-NC-SA 4.0: these numbers are under the same licence, for non-commercial use with attribution.
// s1 first-serve speed (m/s), set by aces · serr, serr2 first- and second-serve error scale, by first serves in and double
// faults · rerr return error scale, by return points won · err error scale, by errors per shot · power, by winners per
// shot · aggr risk, from the aggression score ((winners + errors) per shot) · sv, net, drop, slice, lob: how often
// he serve-volleys, comes in, drops, slices and lobs, by how often he really does. See docs/players.
const FITTED={
 "Djokovic":{"s1":54.7,"serr":0.69,"serr2":0.721,"rerr":2.273,"err":1.138,"power":0.955,"aggr":0.398,"sv":0.031,"net":0.025,"drop":1.182,"slice":0.243,"lob":0.075},
 "Nadal":{"s1":52.04,"serr":0.836,"serr2":1.031,"rerr":1.348,"err":0.906,"power":1.001,"aggr":0.434,"sv":0.021,"net":0.01,"drop":0.521,"slice":0.642,"lob":0.035},
 "Alcaraz":{"s1":53.37,"serr":0.841,"serr2":0.997,"rerr":0.661,"err":0.893,"power":1.022,"aggr":0.567,"sv":0.07,"net":0.074,"drop":0.833,"slice":0.604,"lob":0.085},
 "Federer":{"s1":57.56,"serr":0.686,"serr2":0.616,"rerr":0.177,"err":1.13,"power":1.003,"aggr":0.57,"sv":0.126,"net":0.122,"drop":0.722,"slice":1.857,"lob":0.046},
 "Sinner":{"s1":57.39,"serr":0.755,"serr2":0.735,"rerr":0.352,"err":1.16,"power":0.95,"aggr":0.463,"sv":0.02,"net":0.008,"drop":1.13,"slice":0.031,"lob":0.004},
 "Medvedev":{"s1":57.12,"serr":0.948,"serr2":1.151,"rerr":0.795,"err":0.885,"power":0.929,"aggr":0.369,"sv":0.014,"net":0.006,"drop":0.653,"slice":0.081,"lob":0.031},
 "Zverev":{"s1":51.99,"serr":1.38,"serr2":1.445,"rerr":0.65,"err":0.707,"power":1,"aggr":0.458,"sv":0.032,"net":0.038,"drop":0.318,"slice":0.066,"lob":0.008},
 "de Minaur":{"s1":51.62,"serr":1.105,"serr2":1.085,"rerr":1.534,"err":0.672,"power":0.984,"aggr":0.402,"sv":0.014,"net":0.022,"drop":0.126,"slice":0.418,"lob":0.094},
 "Sampras":{"s1":55.75,"serr":0.936,"serr2":1.346,"rerr":0.553,"err":0.976,"power":1.219,"aggr":0.693,"sv":0.675,"net":0.328,"drop":0.206,"slice":1.614,"lob":0.083},
 "Borg":{"s1":53.08,"serr":1.048,"serr2":0.56,"rerr":1.268,"err":0.805,"power":1.005,"aggr":0.394,"sv":0.245,"net":0.14,"drop":0.04,"slice":0.195,"lob":0.391},
 "Agassi":{"s1":53.3,"serr":0.854,"serr2":0.632,"rerr":1.275,"err":0.863,"power":0.977,"aggr":0.491,"sv":0.024,"net":0.009,"drop":0.395,"slice":0.024,"lob":0.041},
 "Murray":{"s1":54.78,"serr":0.925,"serr2":0.985,"rerr":1.187,"err":0.895,"power":0.954,"aggr":0.404,"sv":0.025,"net":0.02,"drop":0.708,"slice":1.134,"lob":0.322},
 "McEnroe":{"s1":54.05,"serr":0.778,"serr2":0.861,"rerr":0.55,"err":1.095,"power":1.143,"aggr":0.686,"sv":0.916,"net":1.033,"drop":0.587,"slice":1.384,"lob":0.546},
};
