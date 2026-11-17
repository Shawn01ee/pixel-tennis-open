// SoundData — what the game's sounds are made of. The sounds of the ball come from descriptions and measurements of the
// real thing; the sound chip that plays them is the NES's (its numbers from the NESdev wiki), which is what makes them
// pixel sounds. Each group names its sources (keys of SOUND_SOURCES); a value marked "design" has no data behind it.
// tools/sound-doc.js writes docs/sound/README.md from this file and data/sound-check.json.
const SOUND_SOURCES={
  chip:'NESdev wiki: APU Pulse, APU Noise, APU Mixer and CPU pages (nesdev.org/wiki), read 2026-11-17',
  patent:'US patent 5,908,361, "Automated tennis line calling system" (filed 1997) — how a bounce and a racket hit sound on court',
  hamori:'P. Hamori, 10,000 frames per second video, Tennisplayer forum post of 15 Sep 2021 — ball on the strings ~4.0 ms (poly), ~4.5 ms (gut)',
  pate:'Paté et al. 2024, Vibration 7(4):47, abstract — flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little',
  banwell:'G. Banwell 2013, Loughborough PhD thesis, abstract — a fast-dying impulsive part, then a much quieter ring that dies more slowly; shorter sounds are liked better',
  russell:'D. Russell, Penn State, "Vibrational Modes of a Tennis Racket" (2014) — first string-bed mode 582 Hz, frame first bending 146 Hz',
};
// Every gain (design) is set so a sound carries the same energy as the one it replaced, which nobody found too loud or
// too quiet: each rendered both ways in a browser and compared (2026-11-17)
const SOUND={
  // the NES's 2A03: CPU clock (Hz); noise clock dividers in CPU cycles (NTSC, $0–$F); the four pulse duty patterns as
  // heard; the non-linear mixer's constants; the console's first-order output filters (Hz). Volume is 4 bits (0–15)
  chip:{src:['chip'],cpu:1789773,noise:[4,8,16,32,64,96,128,160,202,254,380,508,762,1016,2034,4068],
    duty:[[0,1,0,0,0,0,0,0],[0,1,1,0,0,0,0,0],[0,1,1,1,1,0,0,0],[1,0,0,1,1,1,1,1]],
    pulseMix:[95.88,8128,100],tndMix:[159.79,8227,12241,100],highpass:90,lowpass:14000,timer:[8,2047]},
  // every ball sound starts "from zero to significant levels within less than one millisecond" (patent)
  onsetMs:{src:['patent'],v:1},
  // a racket hit: "several cycles at around one kilohertz, followed by one cycle at around 250 Hertz (similar to a ball
  // bounce) … then several decaying cycles at around one kilohertz leading to the upshifting twang" (patent). The first
  // part lasts as long as the ball is on the strings (Hamori: poly, the tour's string now) and, with the 250-Hz cycle, is
  // the impulsive part; the last is the quieter, slower ring (Banwell). A crack of noise marks the onset, 1 ms (design:
  // spread over the whole contact it made a low pop, measured at 160 Hz, where the patent hears 1 kHz). Flat hits are
  // louder and darker than spun ones (Paté, on serves: direction only, the sizes are design). Pace makes it louder: design
  hit:{src:['patent','hamori','banwell','pate'],hiHz:1000,loHz:250,loCycles:1,contactMs:4.0,
    design:{ringCycles:8,ringShare:.45,vol:[9,15],spinQuiet:2,crackPer:[6,4],gain:2.05,wet:.08}},
  // a bounce: "one or two cycles of sinusoid at about one kilohertz followed by several decaying cycles at about 250
  // Hertz, with some higher harmonics, leading to the audible downshifting thump" (patent). Level by impact speed: design
  bounce:{src:['patent'],hiHz:1000,hiCycles:2,loHz:250,design:{loCycles:5,vol:[2,13],gain:2.44,wet:.12}},
  // the net: the patent only names it ("a whack"); the tape it calls less repeatable. All design
  net:{src:['patent'],design:{meshPer:9,meshMs:70,meshHz:110,tapePer:3,tapeMs:14,tapeHz:[900,750,600],meshGain:1.7,tapeGain:0.61,wet:.2}},
  // shoes and the menu: no data, all design (the squeak's pitch kept from the earlier sound)
  squeak:{src:[],design:{hz:[2300,3000],rise:1.35,ms:[70,150],vibHz:[38,58],vibDepth:.04,vol:[3,7],gain:1.0,wet:.25}},
  slide:{src:[],design:{per:10,ms:300,vol:7,gain:0.3,wet:.2}},
  chime:{src:[],design:{notes:[[880,.22],[660,.3]],gap:.14,vol:8,gain:0.66,wet:.15}},
  click:{src:[],design:{hz:[1200,900],ms:40,vol:6,gain:0.56,wet:.05}},
};
