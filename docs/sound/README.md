# Sounds

A racket hit is a real one, recorded; the bounce and the net are built from how real ones sound. Every number below is read from `src/audio/SoundData.js` and `data/sound-check.json` (`node tools/sound-check.js`,
then `node tools/sound-doc.js`). A value with no data behind it is marked **design**.

## Sources

- **recording** — [jacklilley, "Tennis Ball being hit", Freesound 338122 (CC0 1.0)](https://freesound.org/people/jacklilley/sounds/338122/): a professional hitting, recorded with a Rode microphone and a Zoom H4n
- **patent** — [US patent 5,908,361, "Automated tennis line calling system" (filed 1997)](https://patents.google.com/patent/US5908361A/en): how a bounce and a racket hit sound on court
- **pate** — [Paté et al. 2024, Vibration 7(4):47, abstract](https://www.mdpi.com/2571-631X/7/4/47): flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little
- **banwell** — [G. Banwell 2013, Loughborough PhD thesis, abstract](https://consensus.app/papers/details/w:df397d76-ac02-4a3d-bb07-bb70d99c6b0e/): a fast-dying impulsive part, then a much quieter ring that dies more slowly, mostly from the first string-bed mode; shorter sounds are liked better

Two papers could not be read in full (the publishers refused the download); only their abstracts are used, so from
them the game takes directions, never sizes: Paté et al. (flat louder and darker than kick) and Banwell (a quick
impulsive part, then a quieter, slower ring from the string bed; short sounds are preferred).

## A racket hit

Three hits cut from a recording of a professional hitting ([Freesound 338122](https://freesound.org/people/jacklilley/sounds/338122/),
public domain) by `tools/sound-samples.py`: from 3 ms before each peak to 160 ms after, a high-pass at 80 Hz for wind
and handling, 22.05 kHz, a 30-ms fade. Nothing else is changed. A shot plays the soft, middle or hard one by its pace,
and pace sets the level (45–100%, **design**); spin takes up to 15% off it (Paté: flat louder than
spun; the size **design**).

| Hit | Peak | Spectral centroid | Strongest | −20 dB after | −40 dB after |
|---|---|---|---|---|---|
| soft | 0.566 | 2304 Hz | 1314 Hz | 17.3 ms | 96 ms |
| middle | 0.71 | 2340 Hz | 1314 Hz | 13.6 ms | 92.1 ms |
| hard | 0.921 | 2504 Hz | 388 Hz | 11.8 ms | 72.1 ms |

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
| Every ball sound reaches its level within 1 ms | patent | hits 0.36, 1.22, 1.68 ms; bounce 0.17 ms | **no** |
| A hit goes ~1 kHz → 250 Hz → ~1 kHz (first 4 ms, next 4, next 20) | patent | 310 → 860 → 1310 Hz; 330 → 860 → 1300 Hz; 380 → 430 → 3200 Hz | **no — the recording does not** |
| A bounce goes ~1 kHz → 250 Hz | patent | 980 → 250 Hz | yes |
| A flat hit is louder than a spun one | pate | level 0.93 against 0.79 | yes |

The recorded hits start low (300–400 Hz) and rise, rather than the patent's 1 kHz first; and two take a little over a
millisecond to reach half their peak. The recording is the real thing, so the game keeps it; the patent described the
hits its microphones picked up around a court in the 1990s, with the rackets and balls of the day.

## Where the sources and the game part, and what was tried

- **Spin on every stroke.** Paté et al. compared flat and kick serves; the game applies the louder-when-flat direction
  to every stroke (not the darker sound: a recording is played as it is).
- **One recording.** All three hits are one player's, on one court, with one racket.
- **The bounce's first build failed its check.** Built as a smooth pulse, its kilohertz rose too slowly: its level came
  only with the thump, 2.3 ms in. It now starts at full strength.
