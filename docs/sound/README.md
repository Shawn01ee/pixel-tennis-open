# Sounds

The racket hit, the bounce and the players' grunts are real recordings; the net and the menu's notes are made in the
game (**design**). The players' feet make no sound: the game's maker had them taken out.
Every number below is read from `src/audio/SoundData.js` and `data/sound-check.json` (`node tools/sound-check.js`,
then `node tools/sound-doc.js`).

## Sources

- **hitRec** — [soundreality, "Tennis Ball Hit", Pixabay 151257 (Pixabay Content License)](https://pixabay.com/sound-effects/tennis-ball-hit-151257/): one clean hit, chosen by ear by the game's maker
- **bounceRec** — [freesound_community, "tennisballbounce", Pixabay 39028 (Pixabay Content License)](https://pixabay.com/sound-effects/tennisballbounce-39028/): a ball bounced on a hard floor, chosen with it
- **gruntRec** — [Men's shouts and effort grunts from Freesound, all CC0 1.0: RyanPBaskett 583259, Halgrimm 218895, randbsoundbites 795440, SoundsForHim 399626, enmiller2 171659, BaggoNotes 718967, IENBA 770124, mf_gloom 517858 and 517848, unfa 213232](https://freesound.org/search/?q=male+grunt&f=license%3A%22Creative+Commons+0%22): twelve, cut by tools/grunt-samples.py
- **stappen** — [Stappen et al. 2022, "Predicting Sex and Stroke Success – Computer-aided Player Grunt Analysis in Tennis Matches", arXiv 2202.09102](undefined): a tennis grunt is "a non-verbal screaming vocalisation made by tennis players ... when striking the ball"
- **raine** — [Raine, Pisanski & Reby 2017, "Tennis grunts communicate acoustic cues to sex and contest outcome", Animal Behaviour 130:47-55; their dataset (figshare 23586057, CC BY 4.0)](https://sussex.figshare.com/articles/dataset/_strong_Dataset_Tennis_grunts_communicate_acoustic_cues_to_sex_and_contest_outcome_strong_/23586057): the pitch of 30 men's grunts on tour, and of about 23 grunts each from 7 men through a match (data/grunt-f0.json, tools/grunt-data.py)
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

## A player's grunt

On a perfectly timed shot the player grunts. A tennis grunt is "a non-verbal screaming vocalisation made by tennis
players ... when striking the ball" (Stappen et al. 2022), a short shout, so the grunts are real men's shouts at an
effort (all CC0 1.0, from Freesound) — no moans or groans: each at its loudest within 60 ms of starting, 120–400 ms
long — cut by `tools/grunt-samples.py`. How men grunt on tour is from Raine, Pisanski & Reby (2017), whose dataset gives
the pitch of 30 men's grunts and of about 23 grunts each from 7 men through a match
(`tools/grunt-data.py` → `data/grunt-f0.json`; the players there are anonymous).

| From the data (men) | Value | In the game |
|---|---|---|
| Grunt pitch, lowest to highest player | 234–395 Hz (median 304) | the range voices are kept inside: yes |
| Spread between men (one standard deviation) | 2.16 semitones | how far a shared recording is raised or lowered: yes |
| A man's grunts about his own pitch through a match | 1.89 semitones (median of 7) | each grunt, at random, cut at 2: yes |
| A serve's grunt over a groundstroke's | 1.2 semitones | not used: serves have no timing, so no grunt |
| From the start of a match to its end | 1.42 semitones | not used |

Which voice is whose is **design** (the players' own voices cannot be used). Nadal's is the long one in two parts, a low
"ah" and then a higher "HAH!" (**design**). The first choice of grunts, groans among them, sounded like a moan ("우 우",
the game's maker); these replaced them. Anyone outside the thirteen: one of the other recordings by his id, raised or lowered
by up to the spread between men and kept inside the measured range (**design**). The thirteen on average carry the
energy of a full-pace hit (gain 0.48, **design**).

| Player | Recording | Its pitch | Raised | Pitch in the game | Length | Inside 234–395 Hz |
|---|---|---|---|---|---|---|
| Novak Djokovic | Freesound 770124, clip g | 320 Hz | – | 320 Hz | 342 ms | yes |
| Rafael Nadal | Freesound 583259, clip nadal | 252 Hz | – | 252 Hz | 750 ms | yes |
| Carlos Alcaraz | Freesound 213232, clip j | 392 Hz | – | 392 Hz | 366 ms | yes |
| Roger Federer | Freesound 171659, clip e | 292 Hz | – | 292 Hz | 208 ms | yes |
| Jannik Sinner | Freesound 770124, clip l | 383 Hz | – | 383 Hz | 307 ms | yes |
| Daniil Medvedev | Freesound 718967, clip k | 242 Hz | – | 242 Hz | 217 ms | yes |
| Alexander Zverev | Freesound 218895, clip c | 284 Hz | – | 284 Hz | 224 ms | yes |
| Alex de Minaur | Freesound 517848, clip i | 352 Hz | – | 352 Hz | 203 ms | yes |
| Pete Sampras | Freesound 399626, clip d | 310 Hz | – | 310 Hz | 328 ms | yes |
| Björn Borg | Freesound 795440, clip b | 263 Hz | – | 263 Hz | 202 ms | yes |
| Andre Agassi | Freesound 517858, clip h | 315 Hz | – | 315 Hz | 373 ms | yes |
| Andy Murray | Freesound 718967, clip f | 321 Hz | – | 321 Hz | 329 ms | yes |
| John McEnroe | Freesound 795440, clip b | 263 Hz | +2.16 semitones | 298 Hz | 202 ms | yes |

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
