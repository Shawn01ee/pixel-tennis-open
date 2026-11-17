// fitted — each player's numbers fitted to his real statistics by tools/fit-players.js (2026-11-16)
// Derived from the Tennis Abstract Match Charting Project (https://github.com/JeffSackmann/tennis_MatchChartingProject),
// licensed CC BY-NC-SA 4.0: these numbers are under the same licence, for non-commercial use with attribution.
// s1 first-serve speed (m/s), set by aces · serr, serr2 first- and second-serve error scale, by first serves in and double
// faults · rerr return error scale, by return points won · err error scale, by errors per shot · power, by winners per
// shot · aggr risk, from the aggression score ((winners + errors) per shot) · sv, net, drop, slice, lob: how often
// he serve-volleys, comes in, drops, slices and lobs, by how often he really does. See docs/players.
const FITTED={
 "Djokovic":{"s1":54.91,"serr":0.386,"serr2":0.483,"rerr":2.166,"err":2.22,"power":0.915,"aggr":0.398,"sv":0.03,"net":3,"drop":0.825,"slice":1.89,"lob":0.485},
 "Nadal":{"s1":51.29,"serr":0.422,"serr2":0.523,"rerr":0.876,"err":1.783,"power":0.989,"aggr":0.434,"sv":0.022,"net":3,"drop":0.324,"slice":1.839,"lob":0.351},
 "Alcaraz":{"s1":54.88,"serr":0.374,"serr2":0.423,"rerr":0.174,"err":2.05,"power":0.912,"aggr":0.567,"sv":0.069,"net":3,"drop":0.361,"slice":3,"lob":0.598},
 "Federer":{"s1":56.22,"serr":0.361,"serr2":0.392,"rerr":0.035,"err":2.195,"power":0.956,"aggr":0.57,"sv":0.12,"net":3,"drop":0.455,"slice":3,"lob":0.187},
 "Sinner":{"s1":55.68,"serr":0.413,"serr2":0.413,"rerr":0.471,"err":2.064,"power":0.918,"aggr":0.463,"sv":0.021,"net":3,"drop":1.029,"slice":0.259,"lob":0.044},
 "Medvedev":{"s1":56.05,"serr":0.467,"serr2":0.56,"rerr":0.842,"err":1.81,"power":0.885,"aggr":0.369,"sv":0.014,"net":3,"drop":0.566,"slice":0.726,"lob":0.297},
 "Zverev":{"s1":53.12,"serr":0.699,"serr2":0.674,"rerr":0.611,"err":1.282,"power":1.007,"aggr":0.458,"sv":0.032,"net":3,"drop":0.255,"slice":0.614,"lob":0.061},
 "de Minaur":{"s1":53.85,"serr":0.497,"serr2":0.476,"rerr":0.794,"err":1.584,"power":0.871,"aggr":0.402,"sv":0.014,"net":1.993,"drop":0.194,"slice":1.773,"lob":0.437},
 "Sampras":{"s1":55.97,"serr":0.442,"serr2":0.638,"rerr":0.064,"err":2.229,"power":0.997,"aggr":0.693,"sv":0.681,"net":0.085,"drop":0.105,"slice":3,"lob":0.295},
 "Borg":{"s1":52.03,"serr":0.506,"serr2":0.349,"rerr":0.627,"err":1.542,"power":0.929,"aggr":0.394,"sv":0.248,"net":3,"drop":0.019,"slice":0.793,"lob":1.114},
 "Agassi":{"s1":53.1,"serr":0.45,"serr2":0.356,"rerr":1.399,"err":1.713,"power":0.907,"aggr":0.491,"sv":0.023,"net":2.289,"drop":0.338,"slice":0.453,"lob":0.377},
 "Murray":{"s1":57.7,"serr":0.366,"serr2":0.334,"rerr":0.472,"err":2.282,"power":0.727,"aggr":0.404,"sv":0.027,"net":3,"drop":0.607,"slice":3,"lob":0.778},
 "McEnroe":{"s1":53.59,"serr":0.215,"serr2":0.236,"rerr":0,"err":3.87,"power":0.807,"aggr":0.686,"sv":0.963,"net":1.226,"drop":0.197,"slice":3,"lob":0.933},
};
// the tour-average opponent the players were fitted against: the player card rates each number against it
const FITTED_TOUR={"s1":58.628,"serr":0.482,"serr2":0.547,"rerr":0.66,"err":1.627,"power":1.012,"aggr":0.5,"sv":0.052,"net":1.357,"drop":0.314,"slice":1.784,"lob":0.154};
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
