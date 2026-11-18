# Sounds

The racket hit, the bounce and the players' feet (running steps and hard stops, different on each court) are real
recordings; the net and the
menu's notes are made in the game (**design**).
Every number below is read from `src/audio/SoundData.js` and `data/sound-check.json` (`node tools/sound-check.js`,
then `node tools/sound-doc.js`).

## Sources

- **hitRec** — [soundreality, "Tennis Ball Hit", Pixabay 151257 (Pixabay Content License)](https://pixabay.com/sound-effects/tennis-ball-hit-151257/): one clean hit, chosen by ear by the game's maker
- **bounceRec** — [freesound_community, "tennisballbounce", Pixabay 39028 (Pixabay Content License)](https://pixabay.com/sound-effects/tennisballbounce-39028/): a ball bounced on a hard floor, chosen with it
- **hardFeet** — [SpliceSound, "Footsteps, Tile, Male Tennis Shoes, Fast Pace", Freesound 170501, and whi1ter1ce, "Basketball noises singular Person", Freesound 708054 (both CC0 1.0)](https://freesound.org/people/SpliceSound/sounds/170501/): tennis shoes running; the squeaks of a sports court
- **clayFeet** — [KikeVilaplana, "Footsteps Gravel Running-Stop", Freesound 436525, and Joao_Janz, "Boots Gravel Feet Slide 1_5", Freesound 504383 (both CC0 1.0)](https://freesound.org/people/KikeVilaplana/sounds/436525/): running on gravel (the steps that are not clipped); a foot sliding on gravel. A recording of a real clay match (Freesound 479289) was too noisy to cut from
- **grassFeet** — [saangosu, "running on wet grass", Freesound 781080 (CC0 1.0)](https://freesound.org/people/saangosu/sounds/781080/): running steps on grass
- **patent** — [US patent 5,908,361, "Automated tennis line calling system" (filed 1997)](https://patents.google.com/patent/US5908361A/en): how a bounce and a racket hit sound on court
- **pate** — [Paté et al. 2024, Vibration 7(4):47, abstract](https://www.mdpi.com/2571-631X/7/4/47): flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little

The hit and the bounce are used under the Pixabay Content License: free to use in a game, no credit required, never to
be shared on their own; they live only inside the game's files (`src/audio/hitSamples.js`, `bounceSamples.js`). The
feet are public domain (Freesound, CC0 1.0).

## How they are cut

`tools/sound-samples.py` takes each from 3 ms before its peak — the hit to 400 ms after, keeping its own short room
tail; each bounce to 160 ms — with a high-pass at 40 Hz for rumble only, 22.05 kHz, and a fade at the end. Nothing else
is changed: level, spectrum and decay are the recording's.

## A racket hit

Pace sets its level (45–100%, **design**); spin takes up to 15% off it (Paté: flat louder than spun;
the size **design**). It takes less of the stadium's echo than the other sounds, having its own tail (**design**). It
is played lower and heavier than recorded, as the game's maker asked, but not slowed: the first 6 ms — the snap —
as recorded, the ring after it about 2.8 semitones lower (drawn out by 1/0.85, so its strongest frequency
sounds at about 842 Hz), with everything below 400 Hz lifted 3 dB (**design**). As recorded:

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

## The feet

Each court has its own: running steps, and a sound for a hard stop or cut — a squeak on a hard court, a slide on clay,
a scuff of grass on grass. A step plays at every 0.85 m a player runs, louder the faster he runs; a stop, louder the harder
he stops. One of the court's recordings at random, played up to 4% faster or slower so they never repeat exactly
(**design**); on grass the crackling top above 5 kHz is softened (**design**). A stop carries the energy of the
game's first shoe sound, a step 10 dB less (**design**). Hard court: tennis shoes on a hard floor for the steps, the
squeaks of a sports court for the stops; clay: running and sliding on gravel (a clay court is crushed brick; a real
clay match, Freesound 479289, was too noisy to cut from, and the steps of the clay recording that were clipped are left
out); grass: running on grass.

| Sound | Length | Peak | Spectral centroid | Strongest | Energy below 300 Hz / 300 Hz–1 kHz / 1–3 kHz / above 3 kHz |
|---|---|---|---|---|---|
| hard step | 54 ms | 0.269 | 1390 Hz | 129 Hz | 27% / 41% / 12% / 20% |
| hard step | 44 ms | 0.273 | 873 Hz | 156 Hz | 29% / 42% / 24% / 4% |
| hard step | 43 ms | 0.285 | 1077 Hz | 393 Hz | 18% / 51% / 20% / 11% |
| hard step | 44 ms | 0.292 | 881 Hz | 156 Hz | 25% / 49% / 21% / 5% |
| hard step | 45 ms | 0.318 | 817 Hz | 178 Hz | 23% / 54% / 20% / 3% |
| hard step | 48 ms | 0.363 | 2037 Hz | 140 Hz | 24% / 27% / 15% / 34% |
| hard step | 58 ms | 0.409 | 965 Hz | 156 Hz | 41% / 38% / 13% / 8% |
| hard step | 201 ms | 0.456 | 836 Hz | 43 Hz | 44% / 37% / 13% / 6% |
| hard stop | 53 ms | 0.043 | 3613 Hz | 2805 Hz | 0% / 11% / 41% / 47% |
| hard stop | 53 ms | 0.061 | 3085 Hz | 2503 Hz | 0% / 1% / 77% / 22% |
| clay step | 53 ms | 0.565 | 851 Hz | 754 Hz | 11% / 70% / 18% / 1% |
| clay step | 78 ms | 0.579 | 1516 Hz | 2013 Hz | 15% / 19% / 61% / 5% |
| clay step | 74 ms | 0.643 | 1717 Hz | 1938 Hz | 2% / 20% / 73% / 5% |
| clay stop | 331 ms | 0.064 | 1501 Hz | 463 Hz | 9% / 65% / 16% / 10% |
| grass step | 132 ms | 0.091 | 2069 Hz | 1669 Hz | 2% / 26% / 49% / 22% |
| grass step | 153 ms | 0.116 | 2433 Hz | 2358 Hz | 2% / 16% / 57% / 26% |
| grass step | 145 ms | 0.127 | 2548 Hz | 2239 Hz | 1% / 18% / 40% / 41% |
| grass step | 139 ms | 0.137 | 2392 Hz | 1863 Hz | 1% / 23% / 41% / 35% |
| grass step | 111 ms | 0.139 | 2094 Hz | 834 Hz | 2% / 34% / 39% / 25% |
| grass step | 152 ms | 0.185 | 2214 Hz | 1841 Hz | 1% / 21% / 55% / 23% |
| grass step | 114 ms | 0.235 | 2295 Hz | 2342 Hz | 1% / 19% / 56% / 24% |
| grass step | 132 ms | 0.302 | 2229 Hz | 700 Hz | 2% / 22% / 53% / 23% |
| grass stop | 152 ms | 0.185 | 2214 Hz | 1841 Hz | 1% / 21% / 55% / 23% |
| grass stop | 114 ms | 0.235 | 2295 Hz | 2342 Hz | 1% / 19% / 56% / 24% |
| grass stop | 132 ms | 0.302 | 2229 Hz | 700 Hz | 2% / 22% / 53% / 23% |

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
| A flat hit is louder than a spun one (pate) | level 0.56 against 0.476 | yes |

Most bounces follow the patent; the hit does not — it starts lower (400 Hz) and is at 1 kHz
after that. The recordings are kept as they are.

## Loudness

Each recording's gain (**design**) is set against the game's first version of the same sound, rendered both ways in a
browser: the bounce at the same energy, the hit 4 dB stronger, for punch.
