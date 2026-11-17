// CareerData — the real figures the career mode rests on. docs/career gives each source and how it is used; values
// with no data behind them are marked "design".
const CAREER_DATA={
  // ATP ranking points by the round a player goes out in, rules since 2024 (ATP Rankings FAQ, as tabled in Wikipedia's
  // "ATP rankings"). R32 in a 32-player draw and R128 in a 128 draw: the first round
  POINTS:{
    gs:   {W:2000,F:1300,SF:800,QF:400,R16:200,R32:100,R64:50,R128:10},
    m1000:{W:1000,F:650,SF:400,QF:200,R16:100,R32:50,R64:10},        // the 56-player draw's figures, on a 64 draw
    a500: {W:500,F:330,SF:200,QF:100,R16:50,R32:0},
    a250: {W:250,F:165,SF:100,QF:50,R16:25,R32:0},
    c175: {W:175,F:90,SF:50,QF:25,R16:13,R32:0},
    c125: {W:125,F:64,SF:35,QF:16,R16:8,R32:0},
    c100: {W:100,F:50,SF:25,QF:14,R16:7,R32:0},
    c75:  {W:75,F:44,SF:22,QF:12,R16:6,R32:0},
    c50:  {W:50,F:25,SF:14,QF:8,R16:4,R32:0},
  },
  // the official ATP singles ranking of 16 November 2026: points held by the players ranked 1 to 500
  // (data/career/atp-ranking-points-2026-11-16.json)
  RANK_POINTS:[9320,7950,6100,5170,3820,3680,3625,3390,3300,3234,3170,2940,2925,2540,2500,2500,2465,2435,2360,2220,2160,2145,2085,1980,1885,1790,1785,1640,1640,1625,1595,1507,1495,1492,1480,1430,1321,1320,1296,1280,1241,1237,1223,1220,1214,1200,1197,1146,1095,1075,1055,1045,1040,1015,968,959,941,920,909,899,898,879,875,871,845,836,835,831,828,825,822,822,820,807,787,773,772,759,751,735,732,725,693,692,688,680,671,670,663,661,657,647,646,638,638,620,619,616,613,609,609,590,588,579,575,571,570,566,540,539,530,527,521,521,521,512,510,505,504,497,496,493,493,491,487,477,461,457,448,446,444,438,431,429,422,421,419,418,415,411,406,404,403,403,401,400,393,389,386,386,380,363,362,361,360,355,354,354,353,349,348,346,343,343,341,339,339,338,334,333,327,325,324,322,322,321,321,320,319,317,314,308,307,307,307,304,302,301,300,297,290,290,290,288,288,288,288,286,285,284,280,279,278,278,278,274,272,269,269,269,269,268,267,266,264,264,262,262,261,261,259,259,256,256,255,254,254,253,253,250,247,246,245,244,242,242,241,241,240,240,236,233,233,232,228,227,226,225,224,224,223,223,223,222,221,221,220,220,219,218,218,217,217,216,215,214,213,213,211,211,210,207,202,201,201,200,200,199,199,198,197,197,196,196,194,194,193,191,191,188,188,187,187,187,186,186,185,185,182,181,180,179,178,176,175,175,173,173,173,172,172,171,171,171,170,170,170,169,169,169,168,168,167,165,164,163,163,163,162,161,160,160,160,159,159,159,158,158,157,156,152,152,152,151,151,150,150,150,149,148,148,148,148,148,147,146,146,145,144,144,143,143,143,143,143,142,140,140,139,139,138,138,138,138,136,136,136,136,133,133,133,132,131,131,130,130,129,129,129,129,128,127,127,127,127,127,126,126,125,125,124,124,123,123,122,121,121,120,119,118,118,118,117,117,117,117,116,116,115,115,113,113,113,113,112,110,110,110,109,108,108,108,108,108,107,107,107,106,106,105,104,103,103,103,103,102,102,102,102,102,101,101,101,100,100,100,100,100,100,100,100,99,98,98,98,98,98,98,98,97,97,96,96,96,95,95,95,95,94,94,94,93,92,92,92,91,91,91,91,90,89,89,89,89,88,88,88,87,87,87],
  // Elo by ATP rank: Elo = A − B·ln(rank), least squares over the 463 players ranked 1–500 in Tennis Abstract's ATP
  // Elo list of 16 November 2026, with the scatter about that line (one standard deviation)
  // (data/career/atp-elo-by-rank-2026-11-16.json)
  ELO_RANK:{A:2442.4,B:173.66,SD:90.9},
  // each roster player at his best: peak Elo from Tennis Abstract (The Tennis 128 for the retired; the ATP Elo list of
  // 16 November 2026 for the active, its "Peak Elo" column)
  PEAK_ELO:{Djokovic:2470,Borg:2473,McEnroe:2442,Federer:2383,Nadal:2370,Murray:2347,Sampras:2319,Agassi:2282,
    Sinner:2339.8,Alcaraz:2308.5,Medvedev:2201.2,Zverev:2176.5,'de Minaur':2053.1},
  // the tournament categories. draw: players; sets: sets to win (Grand Slam men's singles best of five, the rest best of
  // three); real figures. cut: the worst ranking that gets in directly — 104 for a Grand Slam is the rule (104
  // direct acceptances of 128); the others are design, near typical entry lists. top: the best ranking that usually
  // plays the category (design)
  TIERS:{
    gs:   {name:'Grand Slam',short:'GS',draw:128,sets:3,cut:104,top:1},
    m1000:{name:'ATP Masters 1000',short:'1000',draw:64,sets:2,cut:80,top:1},
    a500: {name:'ATP 500',short:'500',draw:32,sets:2,cut:55,top:3},
    a250: {name:'ATP 250',short:'250',draw:32,sets:2,cut:95,top:8},
    c175: {name:'Challenger 175',short:'CH175',draw:32,sets:2,cut:150,top:40},
    c125: {name:'Challenger 125',short:'CH125',draw:32,sets:2,cut:220,top:60},
    c100: {name:'Challenger 100',short:'CH100',draw:32,sets:2,cut:280,top:80},
    c75:  {name:'Challenger 75',short:'CH75',draw:32,sets:2,cut:380,top:110},
    c50:  {name:'Challenger 50',short:'CH50',draw:32,sets:2,cut:9999,top:150},
  },
  ROUNDS:{128:['R128','R64','R32','R16','QF','SF','F'],64:['R64','R32','R16','QF','SF','F'],32:['R32','R16','QF','SF','F']},
  ROUND_NAMES:{R128:'First round',R64:'Second round',R32:'Round of 32',R16:'Round of 16',QF:'Quarter-final',SF:'Semi-final',F:'Final',W:'Champion'},
};
