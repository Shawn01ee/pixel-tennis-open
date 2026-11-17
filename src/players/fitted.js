// fitted — each player's numbers fitted to his real statistics by tools/fit-players.js (2026-11-17)
// Derived from the Tennis Abstract Match Charting Project (https://github.com/JeffSackmann/tennis_MatchChartingProject),
// licensed CC BY-NC-SA 4.0: these numbers are under the same licence, for non-commercial use with attribution.
// s1 first-serve speed (m/s), set by aces · serr, serr2 first- and second-serve error scale, by first serves in and double
// faults · rerr return error scale, by return points won · err error scale, by errors per shot · power, by winners per
// shot · aggr risk, from the aggression score ((winners + errors) per shot) · sv, net, drop, slice, lob: how often
// he serve-volleys, comes in, drops, slices and lobs, by how often he really does. See docs/players.
const FITTED={
 "Djokovic":{"s1":54.62,"serr":0.528,"serr2":0.598,"rerr":2.674,"err":1.602,"power":0.99,"aggr":0.411,"sv":0.03,"net":1.328,"drop":0.514,"slice":1.087,"lob":0.328},
 "Nadal":{"s1":52.37,"serr":0.569,"serr2":0.621,"rerr":1.341,"err":1.371,"power":0.999,"aggr":0.429,"sv":0.023,"net":0.804,"drop":0.175,"slice":1.787,"lob":0.283},
 "Alcaraz":{"s1":54.78,"serr":0.374,"serr2":0.395,"rerr":0.049,"err":1.986,"power":0.94,"aggr":0.556,"sv":0.072,"net":2.946,"drop":0.192,"slice":2.389,"lob":0.397},
 "Federer":{"s1":59.06,"serr":0.372,"serr2":0.326,"rerr":0.001,"err":2.065,"power":0.994,"aggr":0.56,"sv":0.124,"net":2.799,"drop":0.265,"slice":3,"lob":0.084},
 "Sinner":{"s1":56.18,"serr":0.469,"serr2":0.509,"rerr":0.275,"err":1.774,"power":0.954,"aggr":0.466,"sv":0.02,"net":1.673,"drop":0.31,"slice":0.326,"lob":0.066},
 "Medvedev":{"s1":56.71,"serr":0.645,"serr2":0.833,"rerr":1.009,"err":1.303,"power":0.949,"aggr":0.376,"sv":0.014,"net":2.008,"drop":0.342,"slice":0.57,"lob":0.222},
 "Zverev":{"s1":54.29,"serr":0.854,"serr2":0.891,"rerr":0.889,"err":1.118,"power":0.981,"aggr":0.466,"sv":0.032,"net":3,"drop":0.176,"slice":0.869,"lob":0.193},
 "de Minaur":{"s1":52.69,"serr":0.812,"serr2":0.784,"rerr":1.636,"err":1.028,"power":0.929,"aggr":0.397,"sv":0.014,"net":0.811,"drop":0.097,"slice":1.258,"lob":0.405},
 "Sampras":{"s1":57.49,"serr":0.417,"serr2":0.608,"rerr":0.002,"err":2.284,"power":0.982,"aggr":0.667,"sv":0.7,"net":0.012,"drop":0.014,"slice":3,"lob":0.176},
 "Borg":{"s1":53.2,"serr":0.674,"serr2":0.555,"rerr":0.893,"err":1.292,"power":0.989,"aggr":0.383,"sv":0.241,"net":1.307,"drop":0.021,"slice":0.78,"lob":1.72},
 "Agassi":{"s1":53.28,"serr":0.632,"serr2":0.58,"rerr":2.074,"err":1.206,"power":0.967,"aggr":0.496,"sv":0.024,"net":0.828,"drop":0.081,"slice":0.392,"lob":0.439},
 "Murray":{"s1":55.98,"serr":0.597,"serr2":0.621,"rerr":0.948,"err":1.426,"power":0.957,"aggr":0.396,"sv":0.026,"net":0.776,"drop":0.429,"slice":3,"lob":0.888},
 "McEnroe":{"s1":52.8,"serr":0.231,"serr2":0.244,"rerr":0,"err":3.698,"power":0.79,"aggr":0.646,"sv":0.949,"net":0.512,"drop":0.065,"slice":3,"lob":0.368},
};
// the tour-average opponent the players were fitted against: the player card rates each number against it
const FITTED_TOUR={"s1":58.051,"serr":0.589,"serr2":0.654,"rerr":0.628,"err":1.281,"power":1.011,"aggr":0.5,"sv":0.052,"net":0.676,"drop":0.209,"slice":1.627,"lob":0.221};
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
