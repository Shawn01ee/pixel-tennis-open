// Writes docs/sound/README.md: what each sound of the ball is made of, where every number comes from, and how the
// rendered sounds measure against their sources. Read from src/audio/SoundData.js and data/sound-check.json.
//   node tools/sound-check.js && node tools/sound-doc.js
const fs=require('fs'),vm=require('vm'),path=require('path'),ROOT=path.join(__dirname,'..');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(ROOT,'src','audio','SoundData.js'),'utf8')+';this.API={SOUND,SOUND_SOURCES};',ctx);
const{SOUND,SOUND_SOURCES:SRC}=ctx.API,chk=JSON.parse(fs.readFileSync(path.join(ROOT,'data','sound-check.json'),'utf8'));
const URL={chip:'https://www.nesdev.org/wiki/APU_Mixer',patent:'https://patents.google.com/patent/US5908361A/en',
  hamori:'https://forum.tennisplayer.net/forum/tennisplayer/95194-contact-at-10-000-frames-per-second?p=95519',
  pate:'https://www.mdpi.com/2571-631X/7/4/47',banwell:'https://consensus.app/papers/details/w:df397d76-ac02-4a3d-bb07-bb70d99c6b0e/',
  russell:'https://www.acs.psu.edu/drussell/Demos/tennis/tennis-1.html'};
const H=SOUND.hit,B=SOUND.bounce,K=SOUND.chip,yes=b=>b?'yes':'**no**',h=chk.hit,b=chk.bounce;
const md=`# Sounds

The ball's sounds are built from what real ones are made of, then played on an 8-bit sound chip — the NES's — so they
fit the pixel look. Every number below is read from \`src/audio/SoundData.js\` and \`data/sound-check.json\`
(\`node tools/sound-check.js\`, then \`node tools/sound-doc.js\`). A value with no data behind it is marked **design**.

## Sources

${Object.keys(SRC).map(k=>`- **${k}** — [${SRC[k].split(' — ')[0]}](${URL[k]})${SRC[k].includes(' — ')?': '+SRC[k].split(' — ').slice(1).join(' — '):''}`).join('\n')}

Two papers could not be read in full (the publishers refused the download); only their abstracts are used, so from
them the game takes directions, never sizes: Paté et al. (flat louder and darker than kick) and Banwell (a quick
impulsive part, then a quieter, slower ring; short sounds are preferred).

## The chip

| Part | Value | Source |
|---|---|---|
| CPU clock | ${K.cpu.toLocaleString('en')} Hz (NTSC) | chip |
| Pulse pitch | CPU ÷ (16 × (timer + 1)), timer ${K.timer[0]}–${K.timer[1]} (11 bits; under ${K.timer[0]} is silent) | chip |
| Pulse duty cycles | 12.5%, 25%, 50%, 25% inverted | chip |
| Volume | 16 steps (4 bits) | chip |
| Noise | 15-bit shift register clocked every ${K.noise.join(', ')} CPU cycles; short loop on bit 6 | chip |
| Mixer | pulse ${K.pulseMix[0]} ÷ (${K.pulseMix[1]} ÷ (p1 + p2) + ${K.pulseMix[2]}); noise ${K.tndMix[0]} ÷ (${K.tndMix[2]} ÷ n + ${K.tndMix[3]}) | chip |
| Output filters | first-order high-pass ${K.highpass} Hz, low-pass ${K.lowpass/1000} kHz | chip |

One liberty: notes and volume may change at any sample. A real console steps its envelopes only a few hundred times
a second, too coarse to let the 4-ms contact of ball and strings be heard as its own part.

## A racket hit

> "a racquet hit sound starts with several cycles at around one kilohertz, followed by one cycle at around 250 Hertz
> (similar to a ball bounce) … then several decaying cycles at around one kilohertz leading to the upshifting
> "twang" sound" — patent

| Part | Value | Source |
|---|---|---|
| Ball on the strings | ${H.contactMs} ms at ~${H.hiHz} Hz (pulse, 50%) | hamori (poly strings; gut ~4.5 ms), patent |
| Then | ${H.loCycles} cycle at ${H.loHz} Hz | patent |
| Ring | ${H.design.ringCycles} cycles at ~${H.hiHz} Hz, from ${Math.round(H.design.ringShare*100)}% of the level down to silence | patent (pitch); count and level **design**, quieter than the start per banwell |
| Crack | noise for the first ${SOUND.onsetMs.v} ms | **design**; length from the patent's onset |
| Level | ${H.design.vol[0]}–${H.design.vol[1]} of 15 with pace; up to ${H.design.spinQuiet} steps quieter with spin | **design**; direction from pate |
| Brightness | crack clocked every ${K.noise[H.design.crackPer[0]]} CPU cycles flat → ${K.noise[H.design.crackPer[1]]} with full spin | **design**; direction from pate |

## A bounce

> "A ball bounce begins with one or two cycles of sinusoid at about one kilohertz followed by several decaying cycles
> at about 250 Hertz, with some higher harmonics, leading to the audible downshifting "thump" sound" — patent

| Part | Value | Source |
|---|---|---|
| Start | ${B.hiCycles} cycles at ${B.hiHz} Hz | patent |
| Thump | ${B.design.loCycles} cycles at ${B.loHz} Hz, dying away (a square wave, so with odd harmonics) | patent (pitch); count **design** |
| Level | ${B.design.vol[0]}–${B.design.vol[1]} of 15 with the speed the ball lands at | **design** |

The patent finds no difference between surfaces, and the game has none.

## The net, shoes and the menu

The patent only names the net's sound ("a whack") and calls the tape's less repeatable; the squeak of shoes, the slide
on clay and the menu's notes have no data. All of them are **design**, in the same chip.

## Loudness

Each sound's gain (**design**) gives it the same energy as the sound it replaced, rendered both ways in a browser and
compared — so nothing is louder or quieter than before, only different in kind.

## Measured: do the sounds come out as their sources describe?

Rendered at ${chk.rate/1000} kHz; the strongest frequency of each part from its spectrum.

| Claim | Source | In the game | Holds |
|---|---|---|---|
| Every ball sound reaches its level within ${SOUND.onsetMs.v} ms | patent | hit ${h.onsetMs} ms, bounce ${b.onsetMs} ms | ${yes(chk.onsetOk)} |
| A hit goes ~1 kHz → 250 Hz → ~1 kHz | patent | ${h.parts.contact} → ${h.parts.dip} → ${h.parts.ring} Hz | ${yes(h.upshift)} |
| A bounce goes ~1 kHz → 250 Hz | patent | ${b.parts.first} → ${b.parts.thump} Hz | ${yes(b.downshift)} |
| The ring is quieter than the start | banwell | ${h.ringVsCrackDb} dB | ${yes(h.ringVsCrackDb<0)} |
| A flat hit is louder than a spun one | pate | ${h.flat.db} dB against ${h.spun.db} dB | ${yes(h.flat.db>h.spun.db)} |
| … and darker (lower spectral centroid) | pate | ${h.flat.centroid} Hz against ${h.spun.centroid} Hz | ${yes(h.flat.centroid<h.spun.centroid)} |

A hit lasts ${h.lengthMs} ms and a bounce ${b.lengthMs} ms (to 1% of their peak), short as Banwell's listeners preferred.

## Where the sources and the game part

- **The ring's pitch.** Russell measured the first string-bed mode of a racket hanging free at 582 Hz, and Banwell
  names that mode as the main source of the ring; the patent hears the ring at about 1 kHz. The game follows the
  patent, which describes hits recorded on court rather than a racket in a lab.
- **One contact time for every stroke.** Hamori's figures (~4.0 ms poly, ~4.5 ms gut) do not say which stroke was
  filmed, so serves, volleys and groundstrokes all use ${H.contactMs} ms; the legends' gut strings are not modelled.
- **Spin on every stroke.** Paté et al. compared flat and kick serves; the game applies the same direction to every
  stroke.
- **The first build failed its own check.** With the crack spread over the whole contact, the hit's first part
  measured 160 Hz, a low pop, where the patent hears 1 kHz. The crack now marks only the onset; nothing else changed.
`;
fs.mkdirSync(path.join(ROOT,'docs','sound'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs','sound','README.md'),md);console.log('written docs/sound/README.md');
