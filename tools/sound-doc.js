// Writes docs/sound/README.md: where each sound of the ball comes from, what it measures, and how it compares with
// written descriptions of real ones. Read from src/audio/SoundData.js and data/sound-check.json.
//   node tools/sound-check.js && node tools/sound-doc.js
const fs=require('fs'),vm=require('vm'),path=require('path'),ROOT=path.join(__dirname,'..');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(ROOT,'src','audio','SoundData.js'),'utf8')+';this.API={SOUND,SOUND_SOURCES};',ctx);
const{SOUND,SOUND_SOURCES:SRC}=ctx.API,chk=JSON.parse(fs.readFileSync(path.join(ROOT,'data','sound-check.json'),'utf8'));
const URL={hitRec:'https://pixabay.com/sound-effects/tennis-ball-hit-151257/',bounceRec:'https://pixabay.com/sound-effects/tennisballbounce-39028/',
  patent:'https://patents.google.com/patent/US5908361A/en',pate:'https://www.mdpi.com/2571-631X/7/4/47'};
const HD=SOUND.hit.design,yes=b=>b?'yes':'**no**',H=chk.hits,B=chk.bounces,h=chk.hit;
const row=r=>`| ${r.peak} | ${r.centroid} Hz | ${r.dominant} Hz | ${r.low}% / ${r.body}% / ${r.mid}% / ${r.high}% | ${r.fall20ms} ms | ${r.fall40ms} ms |`;
const md=`# Sounds

The racket hit and the bounce are real recordings; the net and the menu's notes are made in the game (**design**). The
players' feet make no sound: the game's maker had them taken out.
Every number below is read from \`src/audio/SoundData.js\` and \`data/sound-check.json\` (\`node tools/sound-check.js\`,
then \`node tools/sound-doc.js\`).

## Sources

${Object.keys(SRC).map(k=>`- **${k}** — [${SRC[k].split(' — ')[0]}](${URL[k]})${SRC[k].includes(' — ')?': '+SRC[k].split(' — ').slice(1).join(' — '):''}`).join('\n')}

The hit and the bounce are used under the Pixabay Content License: free to use in a game, no credit required, never to
be shared on their own; they live only inside the game's files (\`src/audio/hitSamples.js\`, \`bounceSamples.js\`).

## How they are cut

\`tools/sound-samples.py\` takes each from 3 ms before its peak to where its own sound has died away — the hit to 24 ms
after, each bounce to 40 ms — with a high-pass at 40 Hz for rumble only, 22.05 kHz, and a fade at the end. After that
both recordings carry the room they were made in: the hit's rattles on at −18 to −30 dB for a third of a second, the
bounce's echo comes back at about 100 ms; heard after every shot as a "ta-da-dak" (the game's maker), so they are left
out and the stadium's echo gives the space instead. Nothing else is changed: level, spectrum and the decay up to the
cut are the recording's; cutting the tails took 0.5 dB of energy off the hit and 0.1 dB off a bounce, the peaks none.

## A racket hit

Pace sets its level (${Math.round(HD.level[0]*100)}–100%, **design**); spin takes up to ${Math.round(HD.spinQuiet*100)}% off it (Paté: flat louder than spun;
the size **design**). The stadium's echo takes ${Math.round(HD.wet*100)}% of it (**design**). It is played lower and heavier than recorded, as the game's maker asked, but not slowed: the first ${HD.keepMs} ms — the snap —
as recorded, the ring after it about ${(-12*Math.log2(HD.pitch)).toFixed(1)} semitones lower (drawn out by 1/${HD.pitch}, so its strongest frequency
sounds at about ${Math.round(H[0].dominant*HD.pitch)} Hz), with everything below ${HD.filter.f} Hz lifted ${HD.filter.db} dB (**design**). As recorded:

| Peak | Spectral centroid | Strongest | Energy below 300 Hz / 300 Hz–1 kHz / 1–3 kHz / above 3 kHz | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
${H.map(row).join('\n')}

## A bounce

One of ${B.length} recorded bounces, softest to hardest by how fast the ball comes down, its level by the same (**design**).

| Peak | Spectral centroid | Strongest | Energy below 300 Hz / 300 Hz–1 kHz / 1–3 kHz / above 3 kHz | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
${B.map(row).join('\n')}

## How they got here

Every made-up hit sounded like something else: a low thump with an echo (a window shutting), square waves on a model
of the NES's sound chip (a crackling beep), a racket's measured string modes struck as tones (a wood block), a noise
pop (a thin tick), a falling tone over noise. Then two public-domain recordings from Freesound: a close one (hard and
clacky) and outdoor serves. The game's maker then chose these two by ear.

## Measured against the line-calling patent

The patent (filed 1997) describes the sounds its microphones picked up around a court. The strongest frequency of
each stretch, from the moment the sound starts:

| Claim | In the recordings | Holds |
|---|---|---|
| Every ball sound reaches its level within ${SOUND.onsetMs.v} ms | hit ${H.map(r=>r.onsetMs).join(', ')} ms; bounces ${B.map(r=>r.onsetMs).join(', ')} ms | ${yes(chk.onsetOk)} |
| A hit: ~1 kHz for 4 ms → 250 Hz → ~1 kHz | ${H.map(r=>r.parts.join(' → ')+' Hz').join('; ')} | ${H.every(r=>r.patentLike)?'yes':'**no**'} |
| A bounce: ~1 kHz for 2 ms → 250 Hz | ${B.map(r=>r.parts.join(' → ')+' Hz').join('; ')} | ${B.filter(r=>r.patentLike).length} of ${B.length} |
| A flat hit is louder than a spun one (pate) | level ${h.flatGain} against ${h.spunGain} | ${yes(h.flatLouder)} |

Most bounces follow the patent; the hit does not — it starts lower (${H.map(r=>r.parts[0]).join(', ')} Hz) and is at 1 kHz
after that. The recordings are kept as they are.

## Loudness

Each recording's gain (**design**) is set against the game's first version of the same sound, rendered both ways in a
browser: the bounce at the same energy, the hit 4 dB stronger, for punch.
`;
fs.mkdirSync(path.join(ROOT,'docs','sound'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs','sound','README.md'),md);console.log('written docs/sound/README.md');
