# Sounds

The racket hit, the bounce and the players' shoes (a different one on each court) are real recordings; the net and the
menu's notes are made in the game (**design**).
Every number below is read from `src/audio/SoundData.js` and `data/sound-check.json` (`node tools/sound-check.js`,
then `node tools/sound-doc.js`).

## Sources

- **hitRec** — [soundreality, "Tennis Ball Hit", Pixabay 151257 (Pixabay Content License)](https://pixabay.com/sound-effects/tennis-ball-hit-151257/): one clean hit, chosen by ear by the game's maker
- **bounceRec** — [freesound_community, "tennisballbounce", Pixabay 39028 (Pixabay Content License)](https://pixabay.com/sound-effects/tennisballbounce-39028/): a ball bounced on a hard floor, chosen with it
- **squeakRec** — [baidonovan, "Rubber Shoe Squeak", Freesound 187343 (CC0 1.0)](https://freesound.org/people/baidonovan/sounds/187343/): a rubber sole squeaking on a floor
- **slideRec** — [Joao_Janz, "Boots Gravel Feet Slide 1_5", Freesound 504383 (CC0 1.0)](https://freesound.org/people/Joao_Janz/sounds/504383/): a foot sliding on gravel; a recording of a real clay match (Freesound 479289) was too noisy to cut slides from
- **grassRec** — [HenKonen, "Footsteps Grass", Freesound 682128 (CC0 1.0)](https://freesound.org/people/HenKonen/sounds/682128/): steps in grass
- **patent** — [US patent 5,908,361, "Automated tennis line calling system" (filed 1997)](https://patents.google.com/patent/US5908361A/en): how a bounce and a racket hit sound on court
- **pate** — [Paté et al. 2024, Vibration 7(4):47, abstract](https://www.mdpi.com/2571-631X/7/4/47): flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little

The hit and the bounce are used under the Pixabay Content License: free to use in a game, no credit required, never to
be shared on their own; they live only inside the game's files (`src/audio/hitSamples.js`, `bounceSamples.js`). The
shoes are public domain (Freesound, CC0 1.0).

## How they are cut

`tools/sound-samples.py` takes each from 3 ms before its peak — the hit to 400 ms after, keeping its own short room
tail; each bounce to 160 ms — with a high-pass at 40 Hz for rumble only, 22.05 kHz, and a fade at the end. Nothing else
is changed: level, spectrum and decay are the recording's.

## A racket hit

Pace sets its level (45–100%, **design**); spin takes up to 15% off it (Paté: flat louder than spun;
the size **design**). It takes less of the stadium's echo than the other sounds, having its own tail (**design**). It
is played a little lower and heavier than recorded, as the game's maker asked: 10% slower (so its strongest
frequency sounds at about 892 Hz), with everything below 400 Hz lifted 3 dB (**design**). As recorded:

| Peak | Spectral centroid | Strongest | Energy below 300 Hz / 300 Hz–1 kHz / 1–3 kHz / above 3 kHz | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
| 1.004 | 1308 Hz | 991 Hz | 2% / 37% / 54% / 7% | 8.8 ms | 346.6 ms |

## A bounce

One of 4 recorded bounces, softest to hardest by how fast the ball comes down, its level by the same (**design**).

| Peak | Spectral centroid | Strongest | Energy below 300 Hz / 300 Hz–1 kHz / 1–3 kHz / above 3 kHz | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
| 0.244 | 445 Hz | 210 Hz | 77% / 7% / 14% / 1% | 11.2 ms | 61.8 ms |
| 0.248 | 404 Hz | 215 Hz | 76% / 9% / 15% / 0% | 9.3 ms | 77.8 ms |
| 0.259 | 387 Hz | 188 Hz | 76% / 9% / 14% / 0% | 9.2 ms | 77.5 ms |
| 0.282 | 482 Hz | 194 Hz | 71% / 7% / 20% / 1% | 8.5 ms | 69.9 ms |

## The shoes

When a player stops or cuts hard, his shoes sound as the court makes them: a rubber squeak on a hard court, a slide on
clay, a brush of grass on grass. One of each court's recordings is picked at random and played up to 4% faster or slower,
so they do not repeat exactly, louder the harder the stop (**design**); on grass the crackling top above 5 kHz is
softened (**design**). Each court's at the energy of the game's first shoe sound. The clay slide is a foot sliding on
gravel: a recording of a real clay match was too noisy to cut slides from.

| Court | Length | Peak | Spectral centroid | Strongest | Energy below 300 Hz / 300 Hz–1 kHz / 1–3 kHz / above 3 kHz |
|---|---|---|---|---|---|
| hard | 154 ms | 0.177 | 2395 Hz | 2083 Hz | 0% / 0% / 91% / 9% |
| clay | 331 ms | 0.064 | 1501 Hz | 463 Hz | 9% / 65% / 16% / 10% |
| grass | 307 ms | 0.682 | 4273 Hz | 1545 Hz | 2% / 12% / 39% / 48% |
| grass | 299 ms | 0.846 | 4287 Hz | 43 Hz | 6% / 9% / 39% / 46% |
| grass | 284 ms | 0.848 | 4163 Hz | 1513 Hz | 0% / 10% / 49% / 41% |
| grass | 354 ms | 0.861 | 4577 Hz | 587 Hz | 1% / 11% / 37% / 50% |

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
