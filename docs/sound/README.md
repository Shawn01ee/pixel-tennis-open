# Sounds

The racket hit and the bounce are real recordings; the net and the menu's notes are made in the game (**design**). The
players' feet make no sound: the game's maker had them taken out.
Every number below is read from `src/audio/SoundData.js` and `data/sound-check.json` (`node tools/sound-check.js`,
then `node tools/sound-doc.js`).

## Sources

- **hitRec** — [soundreality, "Tennis Ball Hit", Pixabay 151257 (Pixabay Content License)](https://pixabay.com/sound-effects/tennis-ball-hit-151257/): one clean hit, chosen by ear by the game's maker
- **bounceRec** — [freesound_community, "tennisballbounce", Pixabay 39028 (Pixabay Content License)](https://pixabay.com/sound-effects/tennisballbounce-39028/): a ball bounced on a hard floor, chosen with it
- **patent** — [US patent 5,908,361, "Automated tennis line calling system" (filed 1997)](https://patents.google.com/patent/US5908361A/en): how a bounce and a racket hit sound on court
- **pate** — [Paté et al. 2024, Vibration 7(4):47, abstract](https://www.mdpi.com/2571-631X/7/4/47): flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little

The hit and the bounce are used under the Pixabay Content License: free to use in a game, no credit required, never to
be shared on their own; they live only inside the game's files (`src/audio/hitSamples.js`, `bounceSamples.js`).

## How they are cut

`tools/sound-samples.py` takes each from 3 ms before its peak — the hit to 400 ms after, keeping its own short room
tail, as the game's maker approved it; each bounce to 40 ms, where it has died away (the recording room's echo comes
back at about 100 ms, a second "tak"; cutting it took 0.1 dB of energy off a bounce, the peak none) — with a high-pass
at 40 Hz for rumble only, 22.05 kHz, and a fade at the end. Nothing else is changed: level, spectrum and decay are the
recording's.

## A racket hit

Pace sets its level (45–100%, **design**); spin takes up to 15% off it (Paté: flat louder than spun;
the size **design**). It takes less of the stadium's echo than the other sounds, having its own tail (**design**). It
is played a little lower and heavier than recorded, as the game's maker asked: 10% slower (so its strongest
frequency sounds at about 892 Hz), with everything below 400 Hz lifted 3 dB (**design**). This is the hit
the game's maker approved by ear; a lower pitch with the speed kept, and the hit cut short of its tail, were tried after
it and taken back. As recorded:

| Peak | Spectral centroid | Strongest | Energy below 300 Hz / 300 Hz–1 kHz / 1–3 kHz / above 3 kHz | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
| 1.004 | 1308 Hz | 991 Hz | 2% / 37% / 54% / 7% | 8.8 ms | 346.6 ms |

## A bounce

One of 4 recorded bounces, softest to hardest by how fast the ball comes down, its level by the same (**design**).

| Peak | Spectral centroid | Strongest | Energy below 300 Hz / 300 Hz–1 kHz / 1–3 kHz / above 3 kHz | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
| 0.244 | 433 Hz | 199 Hz | 76% / 9% / 15% / 1% | 11.2 ms | 33.3 ms |
| 0.248 | 386 Hz | 199 Hz | 75% / 11% / 13% / 0% | 9.3 ms | 35 ms |
| 0.259 | 393 Hz | 199 Hz | 73% / 11% / 15% / 0% | 9.2 ms | 30.9 ms |
| 0.282 | 507 Hz | 199 Hz | 67% / 9% / 23% / 1% | 8.5 ms | 31.2 ms |

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
| Every ball sound reaches its level within 1 ms | hit 0.14 ms; bounces 0.23, 1.81, 1, 0.41 ms | **no** |
| A hit: ~1 kHz for 4 ms → 250 Hz → ~1 kHz | 400 → 1050 → 990 Hz | **no** |
| A bounce: ~1 kHz for 2 ms → 250 Hz | 1160 → 200 Hz; 350 → 190 Hz; 1360 → 200 Hz; 1240 → 200 Hz | 3 of 4 |
| A flat hit is louder than a spun one (pate) | level 0.55 against 0.468 | yes |

Most bounces follow the patent; the hit does not — it starts lower (400 Hz) and is at 1 kHz
after that. The recordings are kept as they are.

## Loudness

Each recording's gain (**design**) is set against the game's first version of the same sound, rendered both ways in a
browser: the bounce at the same energy, the hit 4 dB stronger, for punch.
