# Sounds

The ball's sounds are built from how real ones sound: each rings at measured frequencies, for as long as the sources
say. Every number below is read from `src/audio/SoundData.js` and `data/sound-check.json` (`node tools/sound-check.js`,
then `node tools/sound-doc.js`). A value with no data behind it is marked **design**.

## Sources

- **patent** — [US patent 5,908,361, "Automated tennis line calling system" (filed 1997)](https://patents.google.com/patent/US5908361A/en): how a bounce and a racket hit sound on court
- **russell** — [D. Russell, Penn State, "Vibrational Modes of a Tennis Racket" (2014)](https://www.acs.psu.edu/drussell/Demos/tennis/tennis-1.html): string-bed modes 582, 936, 996, 1300, 1397 Hz; frame first bending 146 Hz
- **hamori** — [P. Hamori, 10,000 frames per second video, Tennisplayer forum post of 15 Sep 2021](https://forum.tennisplayer.net/forum/tennisplayer/95194-contact-at-10-000-frames-per-second?p=95519): ball on the strings ~4.0 ms (poly), ~4.5 ms (gut)
- **pate** — [Paté et al. 2024, Vibration 7(4):47, abstract](https://www.mdpi.com/2571-631X/7/4/47): flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little
- **banwell** — [G. Banwell 2013, Loughborough PhD thesis, abstract](https://consensus.app/papers/details/w:df397d76-ac02-4a3d-bb07-bb70d99c6b0e/): a fast-dying impulsive part, then a much quieter ring that dies more slowly, mostly from the first string-bed mode; shorter sounds are liked better

Two papers could not be read in full (the publishers refused the download); only their abstracts are used, so from
them the game takes directions, never sizes: Paté et al. (flat louder and darker than kick) and Banwell (a quick
impulsive part, then a quieter, slower ring from the string bed; short sounds are preferred).

## How a sound is made

Each sound is a sum of vibrations, each a sine at its frequency dying away at its own rate, plus a short burst of
filtered noise for the moment of impact, softened by a gentle low-pass (`src/audio/ImpactVoice.js`). Sounds are
rendered as samples and played through the stadium's mix.

## A racket hit

> "a racquet hit sound starts with several cycles at around one kilohertz, followed by one cycle at around 250 Hertz
> (similar to a ball bounce) … then several decaying cycles at around one kilohertz leading to the upshifting
> "twang" sound" — patent

| Part | Value | Source |
|---|---|---|
| String bed | modes at 582, 936, 996, 1300, 1397 Hz, around the patent's 1 kHz | russell (frequencies), patent; their sizes 0.45, 0.8, 1, 0.55, 0.35 **design** |
| While the ball is on the strings | 4 ms, the string modes at full strength, dying with a 1.5-ms time constant | hamori (poly strings; gut ~4.5 ms); the rate **design** |
| The ball leaves | 1 cycle at 250 Hz | patent |
| Ring | the same modes at 18% of their strength, dying with a 12-ms time constant | banwell (quieter, slower); sizes **design** |
| Crack | noise around 2500 Hz flat → 3800 Hz with full spin, dying in 0.5 ms | **design**; brighter with spin per pate |
| Level | 45–100% with pace, up to 15% quieter with spin | **design**; direction from pate |
| Low-pass | 7 kHz | **design** |

The frame's own bending (146 Hz, russell) is left out: the hand on the grip damps it, and a low thump is what made
the game's first hit sound like a window shutting.

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
a browser and compared — so the mix is as it was, only the sounds are different in kind.

## Measured: do the sounds come out as their sources describe?

Rendered at 48 kHz; the strongest frequency of each part from its spectrum.

| Claim | Source | In the game | Holds |
|---|---|---|---|
| Every ball sound reaches its level within 1 ms | patent | hit 0.15 ms, bounce 0.23 ms | yes |
| A hit goes ~1 kHz → 250 Hz → ~1 kHz | patent | 960 → 270 → 970 Hz | yes |
| A bounce goes ~1 kHz → 250 Hz | patent | 980 → 250 Hz | yes |
| The ring is quieter than the start | banwell | -24.2 dB | yes |
| A flat hit is louder than a spun one | pate | -25.3 dB against -26.7 dB | yes |
| … and darker (lower spectral centroid) | pate | 1317 Hz against 1440 Hz | yes |

A hit lasts 33.4 ms and a bounce 39.1 ms (to 1% of their peak), short as Banwell's listeners preferred.

## Where the sources and the game part, and what was tried

- **One contact time for every stroke.** Hamori's figures (~4.0 ms poly, ~4.5 ms gut) do not say which stroke was
  filmed, so serves, volleys and groundstrokes all use 4 ms; the legends' gut strings are not modelled.
- **Spin on every stroke.** Paté et al. compared flat and kick serves; the game applies the same direction to every
  stroke.
- **An 8-bit version was tried and dropped.** The same patent timings played on a model of the NES's sound chip
  (square waves, a noise register) followed the pitches but crackled harshly and did not sound like tennis; a
  bit-crushed version would add the same crackle. The sounds are now clean.
- **The bounce's first build failed its check.** Built as a smooth pulse, its kilohertz rose too slowly: its level came
  only with the thump, 2.3 ms in. It now starts at full strength.
