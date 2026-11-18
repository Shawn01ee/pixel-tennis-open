// SoundData — what the ball's sounds are made of, from descriptions and measurements of the real thing. Each group names
// its sources (keys of SOUND_SOURCES); a value under "design" has no data behind it. tools/sound-doc.js writes
// docs/sound/README.md from this file and data/sound-check.json.
const SOUND_SOURCES={
  hitRec:'soundreality, "Tennis Ball Hit", Pixabay 151257 (Pixabay Content License) — one clean hit, chosen by ear by the game\'s maker',
  bounceRec:'freesound_community, "tennisballbounce", Pixabay 39028 (Pixabay Content License) — a ball bounced on a hard floor, chosen with it',
  gruntRec:'Men\'s shouts and effort grunts from Freesound, all CC0 1.0: RyanPBaskett 583259, Halgrimm 218895, randbsoundbites 795440, SoundsForHim 399626, enmiller2 171659, BaggoNotes 718967, IENBA 770124, mf_gloom 517858 and 517848, unfa 213232 — twelve, cut by tools/grunt-samples.py',
  stappen:'Stappen et al. 2022, "Predicting Sex and Stroke Success – Computer-aided Player Grunt Analysis in Tennis Matches", arXiv 2202.09102 — a tennis grunt is "a non-verbal screaming vocalisation made by tennis players ... when striking the ball"',
  raine:'Raine, Pisanski & Reby 2017, "Tennis grunts communicate acoustic cues to sex and contest outcome", Animal Behaviour 130:47-55; their dataset (figshare 23586057, CC BY 4.0) — the pitch of 30 men\'s grunts on tour, and of about 23 grunts each from 7 men through a match (data/grunt-f0.json, tools/grunt-data.py)',
  patent:'US patent 5,908,361, "Automated tennis line calling system" (filed 1997) — how a bounce and a racket hit sound on court',
  pate:'Paté et al. 2024, Vibration 7(4):47, abstract — flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little',
};
// Every gain (design) gives a sound the same energy as the game's first version of it, rendered both ways in a browser
// and compared (2026-11-17), so the mix stays as it was — except the hit, 4 dB stronger, asked for more punch
const SOUND={
  // every ball sound starts "from zero to significant levels within less than one millisecond" (patent)
  onsetMs:{src:['patent'],v:1},
  // a racket hit: a real one, the game maker's pick by ear after every made-up hit (a thump, a beep, a wood block, a
  // tick) and two other recordings (close and clacky; outdoor serves) fell short. Cut by tools/sound-samples.py into
  // hitSamples.js with its own room tail kept, so it takes less of the stadium's echo (design). Played a little lower
  // and heavier than recorded — 10% slower, everything below 400 Hz lifted 3 dB — as the game's maker asked, and kept
  // as they approved it ("경쾌하고 좋은데") after a lower pitch and a hit cut short were tried (design).
  // Flat louder than spun (Paté, on serves: direction only); the level by pace: design
  hit:{src:['hitRec','pate'],design:{level:[.45,1],spinQuiet:.15,gain:.55,wet:.06,rate:.9,filter:{type:'lowshelf',f:400,db:3}}},
  // a bounce: real ones from the recording chosen with the hit (bounceSamples.js), by impact speed; checked against
  // the patent's "one or two cycles of sinusoid at about one kilohertz followed by several decaying cycles at about 250
  // Hertz". Each cut 40 ms after its peak, before the recording room's echo comes back. Level by impact speed: design
  // Every court sounds like the Pixel Tennis Open (the hard court): a ball comes down slower on grass, so its bounces
  // average 2.2 dB quieter there; court lifts that back (measured by tools/sound-courts.js, 2026-11-18)
  bounce:{src:['bounceRec','patent'],hiHz:1000,loHz:250,design:{gain:2.04,wet:.12,court:{hard:1,clay:1,grass:1.29}}},
  // a player's grunt on a perfectly timed shot: real men's shouts at an effort (gruntSamples.js) — a tennis grunt is a
  // short shout at the strike (Stappen), so no moans or groans: loudest within 60 ms, 120–400 ms long — each with its
  // pitch inside the range of men's tennis grunts measured on tour (Raine: 30 men, 234–395 Hz). Each of the thirteen
  // has his own (which is whose: design, their own voices cannot be used); Nadal's is the long one in two parts, a low
  // "ah" and then a higher "HAH!" (design); McEnroe's is Borg's raised by the spread between men. Anyone else: one of the
  // eleven by his id, raised or lowered by up to that spread (2.16 semitones, one standard deviation over the 30 men),
  // kept inside the measured range. Each grunt moves about the player's own pitch as men's grunts did through a match
  // (1.89 semitones, one standard deviation, the median of 7 men; cut at two). The thirteen on average with the energy
  // of a full-pace hit, rendered both ways in a browser; with the bounce's share of the stadium's echo (design)
  grunt:{src:['gruntRec','stappen','raine'],range:[234,395],between:2.16,within:1.89,
    design:{voice:{0:'g',1:'nadal',2:'j',3:'e',4:'l',5:'k',6:'c',7:'i',8:'d',9:'b',10:'h',11:'f',12:['b',2.16]},cut:2,gain:.48,wet:.12}},
  // the net: the patent only names it ("a whack"); the tape it calls less repeatable. All design
  net:{src:['patent'],design:{meshHz:110,meshTau:.03,meshNoise:600,tapeHz:[900,600],tapeTau:.02,tapeNoise:3000,lp:7000,meshGain:0.41,tapeGain:0.13,wet:.2}},
};
