// fitted — each player's numbers fitted to his real statistics by tools/fit-players.js (2026-11-17)
// Derived from the Tennis Abstract Match Charting Project (https://github.com/JeffSackmann/tennis_MatchChartingProject),
// licensed CC BY-NC-SA 4.0: these numbers are under the same licence, for non-commercial use with attribution.
// s1 first-serve speed (m/s), set by aces · serr, serr2 first- and second-serve error scale, by first serves in and double
// faults · rerr return error scale, by return points won · err error scale, by errors per shot · power, by winners per
// shot · aggr risk, from the aggression score ((winners + errors) per shot) · sv, net, drop, slice, lob: how often
// he serve-volleys, comes in, drops, slices and lobs, by how often he really does. See docs/players.
const FITTED={
 "Djokovic":{"s1":55.26,"serr":0.515,"serr2":0.555,"rerr":3.042,"err":1.543,"power":0.944,"aggr":0.411,"sv":0.03,"net":1.014,"drop":0.355,"slice":0.913,"lob":0.299},
 "Nadal":{"s1":52.32,"serr":0.634,"serr2":0.677,"rerr":1.668,"err":1.21,"power":0.977,"aggr":0.429,"sv":0.022,"net":0.651,"drop":0.145,"slice":1.229,"lob":0.226},
 "Alcaraz":{"s1":54.36,"serr":0.374,"serr2":0.436,"rerr":0.032,"err":1.997,"power":0.924,"aggr":0.556,"sv":0.073,"net":2.152,"drop":0.171,"slice":1.999,"lob":0.34},
 "Federer":{"s1":58.45,"serr":0.41,"serr2":0.415,"rerr":0,"err":1.939,"power":0.976,"aggr":0.56,"sv":0.123,"net":2.739,"drop":0.259,"slice":3,"lob":0.115},
 "Sinner":{"s1":55.87,"serr":0.469,"serr2":0.437,"rerr":0.249,"err":1.821,"power":0.934,"aggr":0.466,"sv":0.021,"net":1.592,"drop":0.314,"slice":0.263,"lob":0.045},
 "Medvedev":{"s1":56.78,"serr":0.684,"serr2":0.835,"rerr":1.105,"err":1.239,"power":0.914,"aggr":0.376,"sv":0.014,"net":1.454,"drop":0.239,"slice":0.447,"lob":0.139},
 "Zverev":{"s1":53.98,"serr":0.928,"serr2":0.876,"rerr":1.027,"err":1.014,"power":0.976,"aggr":0.466,"sv":0.032,"net":3,"drop":0.147,"slice":0.764,"lob":0.152},
 "de Minaur":{"s1":52.37,"serr":0.825,"serr2":0.845,"rerr":1.858,"err":0.975,"power":0.897,"aggr":0.397,"sv":0.014,"net":0.74,"drop":0.118,"slice":1.03,"lob":0.389},
 "Sampras":{"s1":56.97,"serr":0.422,"serr2":0.634,"rerr":0,"err":2.167,"power":0.965,"aggr":0.667,"sv":0.687,"net":0.005,"drop":0.013,"slice":3,"lob":0.119},
 "Borg":{"s1":53.37,"serr":0.743,"serr2":0.582,"rerr":1.059,"err":1.202,"power":0.935,"aggr":0.383,"sv":0.252,"net":1.129,"drop":0.019,"slice":0.647,"lob":1.465},
 "Agassi":{"s1":53.53,"serr":0.66,"serr2":0.62,"rerr":1.837,"err":1.15,"power":0.921,"aggr":0.496,"sv":0.024,"net":0.644,"drop":0.071,"slice":0.317,"lob":0.419},
 "Murray":{"s1":55.68,"serr":0.679,"serr2":0.638,"rerr":1.21,"err":1.32,"power":0.813,"aggr":0.396,"sv":0.026,"net":0.639,"drop":0.327,"slice":2.364,"lob":0.662},
 "McEnroe":{"s1":52.49,"serr":0.233,"serr2":0.242,"rerr":0,"err":3.654,"power":0.798,"aggr":0.646,"sv":0.956,"net":0.39,"drop":0.053,"slice":3,"lob":0.452},
};
// the tour-average opponent the players were fitted against: the player card rates each number against it
const FITTED_TOUR={"s1":57.69,"serr":0.6,"serr2":0.691,"rerr":0.719,"err":1.226,"power":0.972,"aggr":0.5,"sv":0.051,"net":0.584,"drop":0.201,"slice":1.31,"lob":0.159};
// each player's real statistics and the tour's (Match Charting Project), for the player card
const MCP_RATES={
 "Djokovic":{"ace":0.0761,"df":0.0293,"firstIn":0.6475,"returnWon":0.4083,"snv":0.0247,"net":0.1168,"drop":0.0121,"slice":0.0658,"lob":0.0095,"winners":0.0522,"errors":0.1386},
 "Nadal":{"ace":0.0472,"df":0.0254,"firstIn":0.6764,"returnWon":0.3795,"snv":0.0182,"net":0.0899,"drop":0.0055,"slice":0.0749,"lob":0.0075,"winners":0.0578,"errors":0.1413},
 "Alcaraz":{"ace":0.0626,"df":0.0285,"firstIn":0.6523,"returnWon":0.4066,"snv":0.0579,"net":0.1332,"drop":0.0228,"slice":0.0992,"lob":0.0125,"winners":0.0781,"errors":0.18},
 "Federer":{"ace":0.1051,"df":0.0247,"firstIn":0.62,"returnWon":0.3976,"snv":0.0963,"net":0.1684,"drop":0.008,"slice":0.1567,"lob":0.0075,"winners":0.0787,"errors":0.1814},
 "Sinner":{"ace":0.0947,"df":0.0268,"firstIn":0.6074,"returnWon":0.4043,"snv":0.0159,"net":0.1006,"drop":0.0102,"slice":0.0373,"lob":0.0047,"winners":0.0577,"errors":0.1584},
 "Medvedev":{"ace":0.1106,"df":0.0502,"firstIn":0.6283,"returnWon":0.3966,"snv":0.0113,"net":0.0962,"drop":0.012,"slice":0.053,"lob":0.0087,"winners":0.044,"errors":0.1307},
 "Zverev":{"ace":0.1141,"df":0.0395,"firstIn":0.6955,"returnWon":0.3548,"snv":0.0267,"net":0.1224,"drop":0.0057,"slice":0.0614,"lob":0.006,"winners":0.0551,"errors":0.1609},
 "de Minaur":{"ace":0.0483,"df":0.0308,"firstIn":0.5885,"returnWon":0.3852,"snv":0.0111,"net":0.1196,"drop":0.0046,"slice":0.0853,"lob":0.0096,"winners":0.0432,"errors":0.1409},
 "Sampras":{"ace":0.1409,"df":0.0459,"firstIn":0.5832,"returnWon":0.3609,"snv":0.5271,"net":0.3483,"drop":0.0014,"slice":0.144,"lob":0.0082,"winners":0.0995,"errors":0.2101},
 "Borg":{"ace":0.0444,"df":0.032,"firstIn":0.5727,"returnWon":0.4497,"snv":0.1897,"net":0.2333,"drop":0.0004,"slice":0.0484,"lob":0.018,"winners":0.0631,"errors":0.1145},
 "Agassi":{"ace":0.0585,"df":0.0282,"firstIn":0.6294,"returnWon":0.3887,"snv":0.0191,"net":0.0945,"drop":0.0043,"slice":0.038,"lob":0.0102,"winners":0.0684,"errors":0.1616},
 "Murray":{"ace":0.0814,"df":0.0338,"firstIn":0.5888,"returnWon":0.3869,"snv":0.02,"net":0.1089,"drop":0.0114,"slice":0.1143,"lob":0.016,"winners":0.047,"errors":0.1368},
 "McEnroe":{"ace":0.066,"df":0.0434,"firstIn":0.5792,"returnWon":0.3615,"snv":0.7252,"net":0.5125,"drop":0.0049,"slice":0.1308,"lob":0.0187,"winners":0.0959,"errors":0.204},
 "Tour":{"ace":0.0914,"df":0.0351,"firstIn":0.6249,"returnWon":0.3531,"snv":0.0415,"net":0.1192,"drop":0.0104,"slice":0.0982,"lob":0.0095,"winners":0.0591,"errors":0.1729},
};
