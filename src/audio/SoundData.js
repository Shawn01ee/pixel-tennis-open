// SoundData — what the ball's sounds are made of, from descriptions and measurements of the real thing. Each group names
// its sources (keys of SOUND_SOURCES); a value under "design" has no data behind it. tools/sound-doc.js writes
// docs/sound/README.md from this file and data/sound-check.json.
const SOUND_SOURCES={
  recording:'jacklilley, "Tennis Ball being hit", Freesound 338122 (CC0 1.0) — a professional hitting, recorded with a Rode microphone and a Zoom H4n',
  patent:'US patent 5,908,361, "Automated tennis line calling system" (filed 1997) — how a bounce and a racket hit sound on court',
  pate:'Paté et al. 2024, Vibration 7(4):47, abstract — flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little',
  banwell:'G. Banwell 2013, Loughborough PhD thesis, abstract — a fast-dying impulsive part, then a much quieter ring that dies more slowly, mostly from the first string-bed mode; shorter sounds are liked better',
};
// Every gain (design) gives a sound the same energy as the game's first version of it, rendered both ways in a browser
// and compared (2026-11-17), so the mix stays as it was — except the hit, 4 dB stronger, asked for more punch
const SOUND={
  // every ball sound starts "from zero to significant levels within less than one millisecond" (patent)
  onsetMs:{src:['patent'],v:1},
  // a racket hit: a real one. Three hits from a recording of a professional hitting (Freesound 338122, public domain;
  // cut by tools/sound-samples.py into hitSamples.js), softest to hardest by the shot's pace. Made-up hits — tones on
  // a sound chip, the string bed's modes, a noise pop — each sounded like something else (a beep, a wood block, a tick).
  // Flat louder than spun (Paté, on serves: direction only); the level by pace: design
  hit:{src:['recording','pate'],design:{level:[.45,1],spinQuiet:.15,gain:.93,wet:.1}},
  // a bounce: "one or two cycles of sinusoid at about one kilohertz followed by several decaying cycles at about 250
  // Hertz, with some higher harmonics, leading to the audible downshifting thump" (patent). The kilohertz starts at
  // full strength and is gone in its two cycles (first built as a smooth pulse, it rose too slowly: its level came only
  // with the thump, 2.3 ms in, where the patent hears every ball sound rise within 1 ms). Overtones, their sizes and
  // decays, and the level by impact speed: design
  bounce:{src:['patent'],hiHz:1000,hiCycles:2,loHz:250,design:{hi:1,overtones:[[1,1,.008],[2,.3,.006],[3,.12,.004]],lp:6000,gain:0.37,wet:.12}},
  // the net: the patent only names it ("a whack"); the tape it calls less repeatable. All design
  net:{src:['patent'],design:{meshHz:110,meshTau:.03,meshNoise:600,tapeHz:[900,600],tapeTau:.02,tapeNoise:3000,lp:7000,meshGain:0.41,tapeGain:0.13,wet:.2}},
};
