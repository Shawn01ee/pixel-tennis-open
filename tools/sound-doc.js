// Writes docs/sound/README.md: what each sound of the ball is made of, where every number comes from, and how the
// rendered sounds measure against their sources. Read from src/audio/SoundData.js and data/sound-check.json.
//   node tools/sound-check.js && node tools/sound-doc.js
const fs=require('fs'),vm=require('vm'),path=require('path'),ROOT=path.join(__dirname,'..');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(ROOT,'src','audio','SoundData.js'),'utf8')+';this.API={SOUND,SOUND_SOURCES};',ctx);
const{SOUND,SOUND_SOURCES:SRC}=ctx.API,chk=JSON.parse(fs.readFileSync(path.join(ROOT,'data','sound-check.json'),'utf8'));
const URL={patent:'https://patents.google.com/patent/US5908361A/en',russell:'https://www.acs.psu.edu/drussell/Demos/tennis/tennis-1.html',
  hamori:'https://forum.tennisplayer.net/forum/tennisplayer/95194-contact-at-10-000-frames-per-second?p=95519',
  pate:'https://www.mdpi.com/2571-631X/7/4/47',banwell:'https://consensus.app/papers/details/w:df397d76-ac02-4a3d-bb07-bb70d99c6b0e/'};
const H=SOUND.hit,HD=H.design,B=SOUND.bounce,BD=B.design,yes=b=>b?'yes':'**no**',h=chk.hit,b=chk.bounce,ms=x=>+(x*1000).toFixed(1);
const md=`# Sounds

The ball's sounds are built from how real ones sound: each rings at measured frequencies, for as long as the sources
say. Every number below is read from \`src/audio/SoundData.js\` and \`data/sound-check.json\` (\`node tools/sound-check.js\`,
then \`node tools/sound-doc.js\`). A value with no data behind it is marked **design**.

## Sources

${Object.keys(SRC).map(k=>`- **${k}** — [${SRC[k].split(' — ')[0]}](${URL[k]})${SRC[k].includes(' — ')?': '+SRC[k].split(' — ').slice(1).join(' — '):''}`).join('\n')}

Two papers could not be read in full (the publishers refused the download); only their abstracts are used, so from
them the game takes directions, never sizes: Paté et al. (flat louder and darker than kick) and Banwell (a quick
impulsive part, then a quieter, slower ring from the string bed; short sounds are preferred).

## How a sound is made

Each sound is a sum of vibrations, each a sine at its frequency dying away at its own rate, plus a short burst of
filtered noise for the moment of impact, softened by a gentle low-pass (\`src/audio/ImpactVoice.js\`). Sounds are
rendered as samples and played through the stadium's mix.

## A racket hit

> "a racquet hit sound starts with several cycles at around one kilohertz, followed by one cycle at around 250 Hertz
> (similar to a ball bounce) … then several decaying cycles at around one kilohertz leading to the upshifting
> "twang" sound" — patent

| Part | Value | Source |
|---|---|---|
| String bed | modes at ${H.strings.join(', ')} Hz, around the patent's 1 kHz | russell (frequencies), patent; their sizes ${HD.amps.join(', ')} **design** |
| While the ball is on the strings | ${H.contactMs} ms, the string modes at full strength, dying with a ${ms(HD.tau)}-ms time constant | hamori (poly strings; gut ~4.5 ms); the rate **design** |
| The ball leaves | ${H.ballCycles} cycle at ${H.ballHz} Hz | patent |
| Ring | the same modes at ${Math.round(HD.ring*100)}% of their strength, dying with a ${ms(HD.tau2)}-ms time constant | banwell (quieter, slower); sizes **design** |
| Crack | noise around ${HD.crackHz[0]} Hz flat → ${HD.crackHz[1]} Hz with full spin, dying in ${ms(HD.crackTau)} ms | **design**; brighter with spin per pate |
| Level | ${Math.round(HD.level[0]*100)}–100% with pace, up to ${Math.round(HD.spinQuiet*100)}% quieter with spin | **design**; direction from pate |
| Low-pass | ${HD.lp/1000} kHz | **design** |

The frame's own bending (${'146'} Hz, russell) is left out: the hand on the grip damps it, and a low thump is what made
the game's first hit sound like a window shutting.

## A bounce

> "A ball bounce begins with one or two cycles of sinusoid at about one kilohertz followed by several decaying cycles
> at about 250 Hertz, with some higher harmonics, leading to the audible downshifting "thump" sound" — patent

| Part | Value | Source |
|---|---|---|
| Start | ${B.hiCycles} cycles at ${B.hiHz} Hz, at full strength from the first | patent |
| Thump | ${B.loHz} Hz and its overtones ${BD.overtones.map(([k,a,t])=>`×${k} (${Math.round(a*100)}%, ${ms(t)} ms)`).join(', ')} dying away | patent (pitch, harmonics); sizes and decays **design** |
| Level | with the speed the ball lands at | **design** |

The patent finds no difference between surfaces, and the game has none.

## The net, shoes and the menu

The patent only names the net's sound ("a whack") and calls the tape's less repeatable: both are **design**, made the
same way. The squeak of shoes, the slide on clay and the menu's two notes are the game's first versions, kept as they
were (**design**). Setting a target makes no sound.

## Loudness

Each ball sound's gain (**design**) gives it the same energy as the game's first version of it, rendered both ways in
a browser and compared — so the mix is as it was, only the sounds are different in kind.

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

## Where the sources and the game part, and what was tried

- **One contact time for every stroke.** Hamori's figures (~4.0 ms poly, ~4.5 ms gut) do not say which stroke was
  filmed, so serves, volleys and groundstrokes all use ${H.contactMs} ms; the legends' gut strings are not modelled.
- **Spin on every stroke.** Paté et al. compared flat and kick serves; the game applies the same direction to every
  stroke.
- **An 8-bit version was tried and dropped.** The same patent timings played on a model of the NES's sound chip
  (square waves, a noise register) followed the pitches but crackled harshly and did not sound like tennis; a
  bit-crushed version would add the same crackle. The sounds are now clean.
- **The bounce's first build failed its check.** Built as a smooth pulse, its kilohertz rose too slowly: its level came
  only with the thump, 2.3 ms in. It now starts at full strength.
`;
fs.mkdirSync(path.join(ROOT,'docs','sound'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs','sound','README.md'),md);console.log('written docs/sound/README.md');
