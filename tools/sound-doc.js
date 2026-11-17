// Writes docs/sound/README.md: what each sound of the ball is made of, where every number comes from, and how the
// rendered sounds measure against their sources. Read from src/audio/SoundData.js and data/sound-check.json.
//   node tools/sound-check.js && node tools/sound-doc.js
const fs=require('fs'),vm=require('vm'),path=require('path'),ROOT=path.join(__dirname,'..');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(ROOT,'src','audio','SoundData.js'),'utf8')+';this.API={SOUND,SOUND_SOURCES};',ctx);
const{SOUND,SOUND_SOURCES:SRC}=ctx.API,chk=JSON.parse(fs.readFileSync(path.join(ROOT,'data','sound-check.json'),'utf8'));
const URL={recording:'https://freesound.org/people/jacklilley/sounds/338122/',patent:'https://patents.google.com/patent/US5908361A/en',russell:'https://www.acs.psu.edu/drussell/Demos/tennis/tennis-1.html',
  hamori:'https://forum.tennisplayer.net/forum/tennisplayer/95194-contact-at-10-000-frames-per-second?p=95519',
  pate:'https://www.mdpi.com/2571-631X/7/4/47',banwell:'https://consensus.app/papers/details/w:df397d76-ac02-4a3d-bb07-bb70d99c6b0e/'};
const HD=SOUND.hit.design,B=SOUND.bounce,BD=B.design,yes=b=>b?'yes':'**no**',h=chk.hit,b=chk.bounce,R=chk.hits,ms=x=>+(x*1000).toFixed(1);
const md=`# Sounds

A racket hit is a real one, recorded; the bounce and the net are built from how real ones sound. Every number below is read from \`src/audio/SoundData.js\` and \`data/sound-check.json\` (\`node tools/sound-check.js\`,
then \`node tools/sound-doc.js\`). A value with no data behind it is marked **design**.

## Sources

${Object.keys(SRC).map(k=>`- **${k}** — [${SRC[k].split(' — ')[0]}](${URL[k]})${SRC[k].includes(' — ')?': '+SRC[k].split(' — ').slice(1).join(' — '):''}`).join('\n')}

Two papers could not be read in full (the publishers refused the download); only their abstracts are used, so from
them the game takes directions, never sizes: Paté et al. (flat louder and darker than kick) and Banwell (a quick
impulsive part, then a quieter, slower ring from the string bed; short sounds are preferred).

## A racket hit

Three hits cut from a recording of a professional hitting ([Freesound 338122](https://freesound.org/people/jacklilley/sounds/338122/),
public domain) by \`tools/sound-samples.py\`: from 3 ms before each peak to 160 ms after, a high-pass at 80 Hz for wind
and handling, 22.05 kHz, a 30-ms fade. Nothing else is changed. A shot plays the soft, middle or hard one by its pace,
and pace sets the level (${Math.round(HD.level[0]*100)}–100%, **design**); spin takes up to ${Math.round(HD.spinQuiet*100)}% off it (Paté: flat louder than
spun; the size **design**).

| Hit | Peak | Spectral centroid | Strongest | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
${R.map((r,i)=>`| ${['soft','middle','hard'][i]||i} | ${r.peak} | ${r.centroid} Hz | ${r.dominant} Hz | ${r.fall20ms} ms | ${r.fall40ms} ms |`).join('\n')}

Made-up hits came first, and each sounded like something else: the first a low thump with an echo (a window shutting),
then square waves on a model of the NES's sound chip (a crackling beep), the string bed's measured modes struck as
tones (a wood block), a noise pop (a thin tick), a falling tone over noise. All of them followed the line-calling
patent's description of a hit; the recording does not (below).

## How the other sounds are made

Each is a sum of vibrations, each a sine at its frequency dying away at its own rate, plus a short burst of filtered
noise for the moment of impact, softened by a gentle low-pass (\`src/audio/ImpactVoice.js\`).

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
a browser and compared — so the mix is as it was, only the sounds are different in kind. The hit is the exception: 4 dB
stronger than the first version, for more punch.

## Measured: do the sounds come out as their sources describe?

The strongest frequency of each part from its spectrum; the recorded hits from the moment each starts.

| Claim | Source | In the game | Holds |
|---|---|---|---|
| Every ball sound reaches its level within ${SOUND.onsetMs.v} ms | patent | hits ${R.map(r=>r.onsetMs).join(', ')} ms; bounce ${b.onsetMs} ms | ${yes(chk.onsetOk)} |
| A hit goes ~1 kHz → 250 Hz → ~1 kHz (first 4 ms, next 4, next 20) | patent | ${R.map(r=>r.parts.join(' → ')+' Hz').join('; ')} | ${R.every(r=>r.patentLike)?'yes':'**no — the recording does not**'} |
| A bounce goes ~1 kHz → 250 Hz | patent | ${b.parts.first} → ${b.parts.thump} Hz | ${yes(b.downshift)} |
| A flat hit is louder than a spun one | pate | level ${h.flatGain} against ${h.spunGain} | ${yes(h.flatLouder)} |

The recorded hits start low (300–400 Hz) and rise, rather than the patent's 1 kHz first; and two take a little over a
millisecond to reach half their peak. The recording is the real thing, so the game keeps it; the patent described the
hits its microphones picked up around a court in the 1990s, with the rackets and balls of the day.

## Where the sources and the game part, and what was tried

- **Spin on every stroke.** Paté et al. compared flat and kick serves; the game applies the louder-when-flat direction
  to every stroke (not the darker sound: a recording is played as it is).
- **One recording.** All three hits are one player's, on one court, with one racket.
- **The bounce's first build failed its check.** Built as a smooth pulse, its kilohertz rose too slowly: its level came
  only with the thump, 2.3 ms in. It now starts at full strength.
`;
fs.mkdirSync(path.join(ROOT,'docs','sound'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs','sound','README.md'),md);console.log('written docs/sound/README.md');
