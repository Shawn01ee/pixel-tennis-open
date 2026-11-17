# Sounds

A racket hit is a real one, recorded; the bounce and the net are built from how real ones sound. Every number below is read from `src/audio/SoundData.js` and `data/sound-check.json` (`node tools/sound-check.js`,
then `node tools/sound-doc.js`). A value with no data behind it is marked **design**.

## Sources

- **recording** — [jamesdrake89, "Tennis Serves 3", Freesound 662266 (CC0 1.0)](https://freesound.org/people/jamesdrake89/sounds/662266/): six serves, recorded outdoors
- **games** — [CC0 tennis hits made for games, set against it: Freesound 710041, 709678 and 412863](https://freesound.org/people/kletton97/sounds/710041/): most of their energy between 300 Hz and 1 kHz, little above 3 kHz
- **patent** — [US patent 5,908,361, "Automated tennis line calling system" (filed 1997)](https://patents.google.com/patent/US5908361A/en): how a bounce and a racket hit sound on court
- **pate** — [Paté et al. 2024, Vibration 7(4):47, abstract](https://www.mdpi.com/2571-631X/7/4/47): flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little
- **banwell** — [G. Banwell 2013, Loughborough PhD thesis, abstract](https://consensus.app/papers/details/w:df397d76-ac02-4a3d-bb07-bb70d99c6b0e/): a fast-dying impulsive part, then a much quieter ring that dies more slowly, mostly from the first string-bed mode; shorter sounds are liked better

Two papers could not be read in full (the publishers refused the download); only their abstracts are used, so from
them the game takes directions, never sizes: Paté et al. (flat louder and darker than kick) and Banwell (a quick
impulsive part, then a quieter, slower ring from the string bed; short sounds are preferred).

## A racket hit

Six serves cut from a recording made outdoors ([Freesound 662266](https://freesound.org/people/jamesdrake89/sounds/662266/),
public domain) by `tools/sound-samples.py`: from 3 ms before each peak to 160 ms after, a high-pass at 80 Hz for wind
and traffic, 22.05 kHz, a 30-ms fade. Nothing else is changed. A shot plays one of them by its pace, softest to
hardest, and pace sets the level (45–100%, **design**); spin takes up to 15% off it (Paté:
flat louder than spun; the size **design**).

Why these: measured over each hit's first 60 ms, they carry 38–70% of their energy between 300 Hz and 1 kHz and about
1% above 3 kHz — the balance of the public-domain tennis hits made for games they were set against
([710041](https://freesound.org/people/kletton97/sounds/710041/), [709678](https://freesound.org/people/rvdw2004/sounds/709678/),
[412863](https://freesound.org/people/gprosser/sounds/412863/): 42–92% and up to 16%). The recording the game used first
([338122](https://freesound.org/people/jacklilley/sounds/338122/), closer and brighter: 27–36% and 13–22%) sounded hard
and clacky.

| Hit | Peak | Spectral centroid | Strongest | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
| 1 of 6 | 0.302 | 1366 Hz | 807 Hz | 7.5 ms | 42 ms |
| 2 of 6 | 0.316 | 1450 Hz | 1001 Hz | 8.6 ms | 33.7 ms |
| 3 of 6 | 0.353 | 1350 Hz | 937 Hz | 6.9 ms | 51.8 ms |
| 4 of 6 | 0.381 | 1491 Hz | 872 Hz | 7.4 ms | 47 ms |
| 5 of 6 | 0.492 | 1586 Hz | 969 Hz | 7.3 ms | 32.8 ms |
| 6 of 6 | 0.497 | 1385 Hz | 1034 Hz | 15.1 ms | 76.7 ms |

Made-up hits came first, and each sounded like something else: the first a low thump with an echo (a window shutting),
then square waves on a model of the NES's sound chip (a crackling beep), the string bed's measured modes struck as
tones (a wood block), a noise pop (a thin tick), a falling tone over noise. All of them followed the line-calling
patent's description of a hit; the recording does not (below).

## How the other sounds are made

Each is a sum of vibrations, each a sine at its frequency dying away at its own rate, plus a short burst of filtered
noise for the moment of impact, softened by a gentle low-pass (`src/audio/ImpactVoice.js`).

## A bounce

> "A ball bounce begins with one or two cycles of sinusoid at about one kilohertz followed by several decaying cycles
> at about 250 Hertz, with some higher harmonics, leading to the audible downshifting "thump" sound" — patent

| Part | Value | Source |
|---|---|---|
| Start | 2 cycles at 1000 Hz, at full strength from the first | patent |
| Thump | 250 Hz and its overtones ×1 (100%, 8 ms), ×2 (30%, 6 ms), ×3 (12%, 4 ms) dying away | patent (pitch, harmonics); sizes and decays **design** |
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
| Every ball sound reaches its level within 1 ms | patent | hits 0.77, 1.18, 0.41, 0.68, 0.59, 0.36 ms; bounce 0.17 ms | **no** |
| A hit goes ~1 kHz → 250 Hz → ~1 kHz (first 4 ms, next 4, next 20) | patent | 360 → 900 → 570 Hz; 350 → 980 → 560 Hz; 340 → 910 → 560 Hz; 370 → 850 → 580 Hz; 370 → 960 → 550 Hz; 380 → 980 → 580 Hz | **no — the recording does not** |
| A bounce goes ~1 kHz → 250 Hz | patent | 980 → 250 Hz | yes |
| A flat hit is louder than a spun one | pate | level 1.33 against 1.131 | yes |

The recorded hits start low (340–380 Hz) and rise, rather than the patent's 1 kHz first; and one of them takes a little over a millisecond to reach half their peak. The recording is the real thing, so the game keeps it; the patent described the
hits its microphones picked up around a court in the 1990s, with the rackets and balls of the day.

## Where the sources and the game part, and what was tried

- **Spin on every stroke.** Paté et al. compared flat and kick serves; the game applies the louder-when-flat direction
  to every stroke (not the darker sound: a recording is played as it is).
- **One recording.** All six hits are one player's serves, on one court, with one racket.
- **The bounce's first build failed its check.** Built as a smooth pulse, its kilohertz rose too slowly: its level came
  only with the thump, 2.3 ms in. It now starts at full strength.
