// SoundData — what the ball's sounds are made of, from descriptions and measurements of the real thing. Each group names
// its sources (keys of SOUND_SOURCES); a value under "design" has no data behind it. tools/sound-doc.js writes
// docs/sound/README.md from this file and data/sound-check.json.
const SOUND_SOURCES={
  hitRec:'soundreality, "Tennis Ball Hit", Pixabay 151257 (Pixabay Content License) — one clean hit, chosen by ear by the game\'s maker',
  bounceRec:'freesound_community, "tennisballbounce", Pixabay 39028 (Pixabay Content License) — a ball bounced on a hard floor, chosen with it',
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
  // and heavier than recorded — 10% slower, everything below 400 Hz lifted 3 dB — as the game's maker asked (design).
  // Flat louder than spun (Paté, on serves: direction only); the level by pace: design
  hit:{src:['hitRec','pate'],design:{level:[.45,1],spinQuiet:.15,gain:.55,wet:.06,rate:.9,shelf:{f:400,db:3}}},
  // a bounce: real ones from the recording chosen with the hit (bounceSamples.js), by impact speed; checked against
  // the patent's "one or two cycles of sinusoid at about one kilohertz followed by several decaying cycles at about 250
  // Hertz". Level by impact speed: design
  bounce:{src:['bounceRec','patent'],hiHz:1000,loHz:250,design:{gain:2.04,wet:.12}},
  // the net: the patent only names it ("a whack"); the tape it calls less repeatable. All design
  net:{src:['patent'],design:{meshHz:110,meshTau:.03,meshNoise:600,tapeHz:[900,600],tapeTau:.02,tapeNoise:3000,lp:7000,meshGain:0.41,tapeGain:0.13,wet:.2}},
};
