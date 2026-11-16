// fitted — each player's numbers fitted to his real statistics by tools/fit-players.js (2026-11-16)
// Derived from the Tennis Abstract Match Charting Project (https://github.com/JeffSackmann/tennis_MatchChartingProject),
// licensed CC BY-NC-SA 4.0: these numbers are under the same licence, for non-commercial use with attribution.
// s1 first-serve speed (m/s), set by aces · serr, serr2 first- and second-serve error scale, by first serves in and double
// faults · rerr return error scale, by return points won · err error scale, by errors per shot · power, by winners per
// shot · aggr risk, from the aggression score ((winners + errors) per shot) · sv, net, drop, slice, lob: how often
// he serve-volleys, comes in, drops, slices and lobs, by how often he really does. See docs/players.
const FITTED={
 "Djokovic":{"s1":55.42,"serr":0.368,"serr2":0.432,"rerr":2.044,"err":2.147,"power":0.938,"aggr":0.398,"sv":0.031,"net":3,"drop":0.796,"slice":1.935,"lob":0.56},
 "Nadal":{"s1":51.61,"serr":0.451,"serr2":0.524,"rerr":0.965,"err":1.837,"power":1.003,"aggr":0.434,"sv":0.022,"net":3,"drop":0.358,"slice":1.992,"lob":0.337},
 "Alcaraz":{"s1":55.54,"serr":0.366,"serr2":0.432,"rerr":0.126,"err":1.998,"power":0.952,"aggr":0.567,"sv":0.071,"net":3,"drop":0.326,"slice":3,"lob":0.554},
 "Federer":{"s1":56.94,"serr":0.36,"serr2":0.328,"rerr":0.028,"err":2.163,"power":0.96,"aggr":0.57,"sv":0.122,"net":3,"drop":0.445,"slice":3,"lob":0.268},
 "Sinner":{"s1":56.54,"serr":0.423,"serr2":0.389,"rerr":0.424,"err":2.014,"power":0.94,"aggr":0.463,"sv":0.02,"net":3,"drop":0.945,"slice":0.257,"lob":0.077},
 "Medvedev":{"s1":55.38,"serr":0.546,"serr2":0.635,"rerr":0.9,"err":1.556,"power":0.931,"aggr":0.369,"sv":0.014,"net":3,"drop":0.557,"slice":0.712,"lob":0.256},
 "Zverev":{"s1":52.66,"serr":0.739,"serr2":0.652,"rerr":0.759,"err":1.344,"power":0.974,"aggr":0.458,"sv":0.032,"net":3,"drop":0.346,"slice":0.624,"lob":0.062},
 "de Minaur":{"s1":52.65,"serr":0.542,"serr2":0.544,"rerr":0.91,"err":1.472,"power":0.906,"aggr":0.402,"sv":0.014,"net":1.914,"drop":0.165,"slice":1.771,"lob":0.388},
 "Sampras":{"s1":55.88,"serr":0.464,"serr2":0.631,"rerr":0.036,"err":2.125,"power":1.016,"aggr":0.693,"sv":0.683,"net":0.087,"drop":0.053,"slice":3,"lob":0.285},
 "Borg":{"s1":53.29,"serr":0.515,"serr2":0.381,"rerr":0.757,"err":1.549,"power":0.941,"aggr":0.394,"sv":0.251,"net":3,"drop":0.017,"slice":0.989,"lob":1.431},
 "Agassi":{"s1":54.49,"serr":0.453,"serr2":0.372,"rerr":1.286,"err":1.724,"power":0.938,"aggr":0.491,"sv":0.024,"net":2.564,"drop":0.303,"slice":0.506,"lob":0.35},
 "Murray":{"s1":56.41,"serr":0.391,"serr2":0.408,"rerr":0.476,"err":2.248,"power":0.794,"aggr":0.404,"sv":0.026,"net":3,"drop":0.706,"slice":3,"lob":0.859},
 "McEnroe":{"s1":54.05,"serr":0.222,"serr2":0.245,"rerr":0,"err":3.738,"power":0.872,"aggr":0.686,"sv":0.973,"net":1.169,"drop":0.178,"slice":3,"lob":1.039},
};
// the tour-average opponent the players were fitted against: the player card rates each number against it
const FITTED_TOUR={"s1":58.551,"serr":0.478,"serr2":0.536,"rerr":0.621,"err":1.611,"power":1.028,"aggr":0.5,"sv":0.052,"net":1.296,"drop":0.312,"slice":1.817,"lob":0.149};
// each player's real statistics and the tour's (Match Charting Project), for the player card
const MCP_RATES={
 "Djokovic":{"ace":0.0761,"df":0.0293,"firstIn":0.6475,"returnWon":0.4083,"snv":0.0247,"net":0.1168,"drop":0.0131,"slice":0.071,"lob":0.0103,"winners":0.0563,"errors":0.1074},
 "Nadal":{"ace":0.0472,"df":0.0254,"firstIn":0.6764,"returnWon":0.3795,"snv":0.0182,"net":0.0899,"drop":0.0059,"slice":0.0813,"lob":0.0082,"winners":0.0627,"errors":0.1154},
 "Alcaraz":{"ace":0.0626,"df":0.0285,"firstIn":0.6523,"returnWon":0.4066,"snv":0.0579,"net":0.1332,"drop":0.0252,"slice":0.1095,"lob":0.0138,"winners":0.0862,"errors":0.1469},
 "Federer":{"ace":0.1051,"df":0.0247,"firstIn":0.62,"returnWon":0.3976,"snv":0.0963,"net":0.1684,"drop":0.0089,"slice":0.1729,"lob":0.0083,"winners":0.0868,"errors":0.1473},
 "Sinner":{"ace":0.0947,"df":0.0268,"firstIn":0.6074,"returnWon":0.4043,"snv":0.0159,"net":0.1006,"drop":0.0112,"slice":0.0407,"lob":0.0051,"winners":0.0629,"errors":0.1274},
 "Medvedev":{"ace":0.1106,"df":0.0502,"firstIn":0.6283,"returnWon":0.3966,"snv":0.0113,"net":0.0962,"drop":0.0129,"slice":0.0571,"lob":0.0094,"winners":0.0474,"errors":0.1041},
 "Zverev":{"ace":0.1141,"df":0.0395,"firstIn":0.6955,"returnWon":0.3548,"snv":0.0267,"net":0.1224,"drop":0.0063,"slice":0.0671,"lob":0.0065,"winners":0.0602,"errors":0.1279},
 "de Minaur":{"ace":0.0483,"df":0.0308,"firstIn":0.5885,"returnWon":0.3852,"snv":0.0111,"net":0.1196,"drop":0.005,"slice":0.0924,"lob":0.0103,"winners":0.0468,"errors":0.1183},
 "Sampras":{"ace":0.1409,"df":0.0459,"firstIn":0.5832,"returnWon":0.3609,"snv":0.5271,"net":0.3483,"drop":0.0016,"slice":0.1626,"lob":0.0093,"winners":0.1123,"errors":0.1722},
 "Borg":{"ace":0.0444,"df":0.032,"firstIn":0.5727,"returnWon":0.4497,"snv":0.1897,"net":0.2333,"drop":0.0004,"slice":0.0515,"lob":0.0191,"winners":0.0671,"errors":0.0949},
 "Agassi":{"ace":0.0585,"df":0.0282,"firstIn":0.6294,"returnWon":0.3887,"snv":0.0191,"net":0.0945,"drop":0.0047,"slice":0.0416,"lob":0.0111,"winners":0.0749,"errors":0.1271},
 "Murray":{"ace":0.0814,"df":0.0338,"firstIn":0.5888,"returnWon":0.3869,"snv":0.02,"net":0.1089,"drop":0.0122,"slice":0.1225,"lob":0.0172,"winners":0.0503,"errors":0.1158},
 "McEnroe":{"ace":0.066,"df":0.0434,"firstIn":0.5792,"returnWon":0.3615,"snv":0.7252,"net":0.5125,"drop":0.0055,"slice":0.1487,"lob":0.0212,"winners":0.1091,"errors":0.1728},
 "Tour":{"ace":0.0914,"df":0.0351,"firstIn":0.6249,"returnWon":0.3531,"snv":0.0415,"net":0.1192,"drop":0.0114,"slice":0.1078,"lob":0.0105,"winners":0.0648,"errors":0.1406},
};
