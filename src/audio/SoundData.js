// SoundData — what the ball's sounds are made of, from descriptions and measurements of the real thing. Each group names
// its sources (keys of SOUND_SOURCES); a value under "design" has no data behind it. tools/sound-doc.js writes
// docs/sound/README.md from this file and data/sound-check.json.
const SOUND_SOURCES={
  patent:'US patent 5,908,361, "Automated tennis line calling system" (filed 1997) — how a bounce and a racket hit sound on court',
  russell:'D. Russell, Penn State, "Vibrational Modes of a Tennis Racket" (2014) — string-bed modes 582, 936, 996, 1300, 1397 Hz; frame first bending 146 Hz',
  hamori:'P. Hamori, 10,000 frames per second video, Tennisplayer forum post of 15 Sep 2021 — ball on the strings ~4.0 ms (poly), ~4.5 ms (gut)',
  pate:'Paté et al. 2024, Vibration 7(4):47, abstract — flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little',
  banwell:'G. Banwell 2013, Loughborough PhD thesis, abstract — a fast-dying impulsive part, then a much quieter ring that dies more slowly, mostly from the first string-bed mode; shorter sounds are liked better',
};
// Every gain (design) gives a sound the same energy as the game's first version of it, rendered both ways in a browser
// and compared (2026-11-17), so the mix stays as it was
const SOUND={
  // every ball sound starts "from zero to significant levels within less than one millisecond" (patent)
  onsetMs:{src:['patent'],v:1},
  // a racket hit: "several cycles at around one kilohertz, followed by one cycle at around 250 Hertz (similar to a ball
  // bounce) … then several decaying cycles at around one kilohertz leading to the upshifting twang" (patent). The
  // kilohertz is the string bed: its measured modes (Russell) cluster around it, and Banwell hears them in the ring.
  // They ring hard while the ball is on the strings (Hamori: poly, the tour's string now), then as a quieter ring that
  // dies more slowly (Banwell; sizes design). The frame's 146-Hz bending is left out: the hand damps it, and a low thump
  // made the first version sound like a window shutting. Flat hits louder and darker than spun ones (Paté, on serves:
  // direction only). Pace makes it louder: design
  hit:{src:['patent','russell','hamori','banwell','pate'],strings:[582,936,996,1300,1397],ballHz:250,ballCycles:1,contactMs:4.0,
    design:{amps:[.45,.8,1,.55,.35],tau:.0015,ring:.18,tau2:.012,ball:.9,crack:.5,crackHz:[2500,3800],crackTau:.0005,
      level:[.45,1],spinQuiet:.15,lp:7000,gain:0.33,wet:.1}},
  // a bounce: "one or two cycles of sinusoid at about one kilohertz followed by several decaying cycles at about 250
  // Hertz, with some higher harmonics, leading to the audible downshifting thump" (patent). The kilohertz starts at
  // full strength and is gone in its two cycles (first built as a smooth pulse, it rose too slowly: its level came only
  // with the thump, 2.3 ms in, where the patent hears every ball sound rise within 1 ms). Overtones, their sizes and
  // decays, and the level by impact speed: design
  bounce:{src:['patent'],hiHz:1000,hiCycles:2,loHz:250,design:{hi:1,overtones:[[1,1,.008],[2,.3,.006],[3,.12,.004]],lp:6000,gain:0.37,wet:.12}},
  // the net: the patent only names it ("a whack"); the tape it calls less repeatable. All design
  net:{src:['patent'],design:{meshHz:110,meshTau:.03,meshNoise:600,tapeHz:[900,600],tapeTau:.02,tapeNoise:3000,lp:7000,meshGain:0.41,tapeGain:0.13,wet:.2}},
};
