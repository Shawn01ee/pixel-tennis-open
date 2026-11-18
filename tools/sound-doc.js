// Writes docs/sound/README.md: where each sound of the ball comes from, what it measures, and how it compares with
// written descriptions of real ones. Read from src/audio/SoundData.js and data/sound-check.json.
//   node tools/sound-check.js && node tools/sound-doc.js
const fs=require('fs'),vm=require('vm'),path=require('path'),ROOT=path.join(__dirname,'..');
const ctx=vm.createContext({Math});vm.runInContext(['core/MathUtil.js','audio/SoundData.js','audio/gruntSamples.js','audio/TennisSfx.js'].map(f=>fs.readFileSync(path.join(ROOT,'src',f),'utf8')).join('\n')+';this.API={SOUND,SOUND_SOURCES,GRUNT_SAMPLES,TennisSfx};',ctx);
const{GRUNT_SAMPLES:GS,TennisSfx:TS}=ctx.API,GD=JSON.parse(fs.readFileSync(path.join(ROOT,'data','grunt-f0.json'),'utf8')),{ROSTER}=require(path.join(ROOT,'tests','load')).loadSim(['ROSTER']);
const{SOUND,SOUND_SOURCES:SRC}=ctx.API,chk=JSON.parse(fs.readFileSync(path.join(ROOT,'data','sound-check.json'),'utf8'));
const URL={hitRec:'https://pixabay.com/sound-effects/tennis-ball-hit-151257/',bounceRec:'https://pixabay.com/sound-effects/tennisballbounce-39028/',
  patent:'https://patents.google.com/patent/US5908361A/en',gruntRec:'https://freesound.org/search/?q=male+grunt&f=license%3A%22Creative+Commons+0%22',raine:'https://sussex.figshare.com/articles/dataset/_strong_Dataset_Tennis_grunts_communicate_acoustic_cues_to_sex_and_contest_outcome_strong_/23586057',pate:'https://www.mdpi.com/2571-631X/7/4/47'};
const HD=SOUND.hit.design,yes=b=>b?'yes':'**no**',R=b=>b?'yes':'**no**',H=chk.hits,B=chk.bounces,h=chk.hit;
const row=r=>`| ${r.peak} | ${r.centroid} Hz | ${r.dominant} Hz | ${r.low}% / ${r.body}% / ${r.mid}% / ${r.high}% | ${r.fall20ms} ms | ${r.fall40ms} ms |`;
const md=`# Sounds

The racket hit, the bounce and the players' grunts are real recordings; the net and the menu's notes are made in the
game (**design**). The players' feet make no sound: the game's maker had them taken out.
Every number below is read from \`src/audio/SoundData.js\` and \`data/sound-check.json\` (\`node tools/sound-check.js\`,
then \`node tools/sound-doc.js\`).

## Sources

${Object.keys(SRC).map(k=>`- **${k}** — [${SRC[k].split(' — ')[0]}](${URL[k]})${SRC[k].includes(' — ')?': '+SRC[k].split(' — ').slice(1).join(' — '):''}`).join('\n')}

The hit and the bounce are used under the Pixabay Content License: free to use in a game, no credit required, never to
be shared on their own; they live only inside the game's files (\`src/audio/hitSamples.js\`, \`bounceSamples.js\`).

## How they are cut

\`tools/sound-samples.py\` takes each from 3 ms before its peak — the hit to 400 ms after, keeping its own short room
tail, as the game's maker approved it; each bounce to 40 ms, where it has died away (the recording room's echo comes
back at about 100 ms, a second "tak"; cutting it took 0.1 dB of energy off a bounce, the peak none) — with a high-pass
at 40 Hz for rumble only, 22.05 kHz, and a fade at the end. Nothing else is changed: level, spectrum and decay are the
recording's.

## A racket hit

Pace sets its level (${Math.round(HD.level[0]*100)}–100%, **design**); spin takes up to ${Math.round(HD.spinQuiet*100)}% off it (Paté: flat louder than spun;
the size **design**). It takes less of the stadium's echo than the other sounds, having its own tail (**design**). It
is played a little lower and heavier than recorded, as the game's maker asked: ${Math.round((1-HD.rate)*100)}% slower (so its strongest
frequency sounds at about ${Math.round(H[0].dominant*HD.rate)} Hz), with everything below ${HD.filter.f} Hz lifted ${HD.filter.db} dB (**design**). This is the hit
the game's maker approved by ear; a lower pitch with the speed kept, and the hit cut short of its tail, were tried after
it and taken back. As recorded:

| Peak | Spectral centroid | Strongest | Energy below 300 Hz / 300 Hz–1 kHz / 1–3 kHz / above 3 kHz | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
${H.map(row).join('\n')}

## A bounce

One of ${B.length} recorded bounces, softest to hardest by how fast the ball comes down, its level by the same (**design**).

| Peak | Spectral centroid | Strongest | Energy below 300 Hz / 300 Hz–1 kHz / 1–3 kHz / above 3 kHz | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
${B.map(row).join('\n')}

## A player's grunt

On a perfectly timed shot the player grunts. The grunts are real men's effort grunts (all CC0 1.0, from Freesound),
cut by \`tools/grunt-samples.py\`; how men grunt on tour is from Raine, Pisanski & Reby (2017), whose dataset gives
the pitch of ${GD.men} men's grunts and of about 23 grunts each from ${GD.withinMen} men through a match
(\`tools/grunt-data.py\` → \`data/grunt-f0.json\`; the players there are anonymous).

| From the data (men) | Value | In the game |
|---|---|---|
| Grunt pitch, lowest to highest player | ${GD.gruntF0.min}–${GD.gruntF0.max} Hz (median ${GD.gruntF0.median}) | the range voices are kept inside: ${R(SOUND.grunt.range[0]===GD.gruntF0.min&&SOUND.grunt.range[1]===GD.gruntF0.max)} |
| Spread between men (one standard deviation) | ${GD.spreadSemitones.sd} semitones | how far a shared recording is raised or lowered: ${R(SOUND.grunt.between===GD.spreadSemitones.sd)} |
| A man's grunts about his own pitch through a match | ${GD.withinPlayerSdSemitones.median} semitones (median of ${GD.withinMen}) | each grunt, at random, cut at ${SOUND.grunt.design.cut}: ${R(SOUND.grunt.within===GD.withinPlayerSdSemitones.median)} |
| A serve's grunt over a groundstroke's | ${GD.serveOverGroundSemitones.mean} semitones | not used: serves have no timing, so no grunt |
| From the start of a match to its end | ${GD.matchStartToEndSemitones.mean} semitones | not used |

Which voice is whose is **design** (the players' own voices cannot be used). Nadal's is the one in two parts, a lower
"uh" then a rising "AH" (**design**). Anyone outside the thirteen: one of the other recordings by his id, raised or lowered
by up to the spread between men and kept inside the measured range (**design**). The thirteen on average carry the
energy of a full-pace hit (gain ${SOUND.grunt.design.gain}, **design**).

| Player | Recording | Its pitch | Raised | Pitch in the game | Length | Inside ${GD.gruntF0.min}–${GD.gruntF0.max} Hz |
|---|---|---|---|---|---|---|
${ROSTER.map(p=>{const v=TS.gruntVoice(p.id),c=GS.clips.find(x=>x.key===v.key),f=Math.round(c.f0*2**(v.semi/12)),ok=f>=GD.gruntF0.min&&f<=GD.gruntF0.max;
  return`| ${p.name} | ${c.src.split(',')[0]}, clip ${c.key} | ${c.f0} Hz | ${v.semi?'+'+v.semi+' semitones':'–'} | ${f} Hz | ${c.ms} ms | ${ok?'yes':'**no** ('+(f-GD.gruntF0.max>0?'+':'')+(f>GD.gruntF0.max?f-GD.gruntF0.max:f-GD.gruntF0.min)+' Hz, the pitch tracker\'s rounding)'} |`;}).join('\n')}

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
