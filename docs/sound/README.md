# Sounds

The ball's sounds are built from what real ones are made of, then played on an 8-bit sound chip — the NES's — so they
fit the pixel look. Every number below is read from `src/audio/SoundData.js` and `data/sound-check.json`
(`node tools/sound-check.js`, then `node tools/sound-doc.js`). A value with no data behind it is marked **design**.

## Sources

- **chip** — [NESdev wiki: APU Pulse, APU Noise, APU Mixer and CPU pages (nesdev.org/wiki), read 2026-11-17](https://www.nesdev.org/wiki/APU_Mixer)
- **patent** — [US patent 5,908,361, "Automated tennis line calling system" (filed 1997)](https://patents.google.com/patent/US5908361A/en): how a bounce and a racket hit sound on court
- **hamori** — [P. Hamori, 10,000 frames per second video, Tennisplayer forum post of 15 Sep 2021](https://forum.tennisplayer.net/forum/tennisplayer/95194-contact-at-10-000-frames-per-second?p=95519): ball on the strings ~4.0 ms (poly), ~4.5 ms (gut)
- **pate** — [Paté et al. 2024, Vibration 7(4):47, abstract](https://www.mdpi.com/2571-631X/7/4/47): flat serves sound louder and have a lower spectral centroid than kick serves; the racket matters little
- **banwell** — [G. Banwell 2013, Loughborough PhD thesis, abstract](https://consensus.app/papers/details/w:df397d76-ac02-4a3d-bb07-bb70d99c6b0e/): a fast-dying impulsive part, then a much quieter ring that dies more slowly; shorter sounds are liked better
- **russell** — [D. Russell, Penn State, "Vibrational Modes of a Tennis Racket" (2014)](https://www.acs.psu.edu/drussell/Demos/tennis/tennis-1.html): first string-bed mode 582 Hz, frame first bending 146 Hz

Two papers could not be read in full (the publishers refused the download); only their abstracts are used, so from
them the game takes directions, never sizes: Paté et al. (flat louder and darker than kick) and Banwell (a quick
impulsive part, then a quieter, slower ring; short sounds are preferred).

## The chip

| Part | Value | Source |
|---|---|---|
| CPU clock | 1,789,773 Hz (NTSC) | chip |
| Pulse pitch | CPU ÷ (16 × (timer + 1)), timer 8–2047 (11 bits; under 8 is silent) | chip |
| Pulse duty cycles | 12.5%, 25%, 50%, 25% inverted | chip |
| Volume | 16 steps (4 bits) | chip |
| Noise | 15-bit shift register clocked every 4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068 CPU cycles; short loop on bit 6 | chip |
| Mixer | pulse 95.88 ÷ (8128 ÷ (p1 + p2) + 100); noise 159.79 ÷ (12241 ÷ n + 100) | chip |
| Output filters | first-order high-pass 90 Hz, low-pass 14 kHz | chip |

One liberty: notes and volume may change at any sample. A real console steps its envelopes only a few hundred times
a second, too coarse to let the 4-ms contact of ball and strings be heard as its own part.

## A racket hit

> "a racquet hit sound starts with several cycles at around one kilohertz, followed by one cycle at around 250 Hertz
> (similar to a ball bounce) … then several decaying cycles at around one kilohertz leading to the upshifting
> "twang" sound" — patent

| Part | Value | Source |
|---|---|---|
| Ball on the strings | 4 ms at ~1000 Hz (pulse, 50%) | hamori (poly strings; gut ~4.5 ms), patent |
| Then | 1 cycle at 250 Hz | patent |
| Ring | 8 cycles at ~1000 Hz, from 45% of the level down to silence | patent (pitch); count and level **design**, quieter than the start per banwell |
| Crack | noise for the first 1 ms | **design**; length from the patent's onset |
| Level | 9–15 of 15 with pace; up to 2 steps quieter with spin | **design**; direction from pate |
| Brightness | crack clocked every 128 CPU cycles flat → 64 with full spin | **design**; direction from pate |

## A bounce

> "A ball bounce begins with one or two cycles of sinusoid at about one kilohertz followed by several decaying cycles
> at about 250 Hertz, with some higher harmonics, leading to the audible downshifting "thump" sound" — patent

| Part | Value | Source |
|---|---|---|
| Start | 2 cycles at 1000 Hz | patent |
| Thump | 5 cycles at 250 Hz, dying away (a square wave, so with odd harmonics) | patent (pitch); count **design** |
| Level | 2–13 of 15 with the speed the ball lands at | **design** |

The patent finds no difference between surfaces, and the game has none.

## The net, shoes and the menu

The patent only names the net's sound ("a whack") and calls the tape's less repeatable; the squeak of shoes, the slide
on clay and the menu's notes have no data. All of them are **design**, in the same chip.

## Loudness

Each sound's gain (**design**) gives it the same energy as the sound it replaced, rendered both ways in a browser and
compared — so nothing is louder or quieter than before, only different in kind.

## Measured: do the sounds come out as their sources describe?

Rendered at 48 kHz; the strongest frequency of each part from its spectrum.

| Claim | Source | In the game | Holds |
|---|---|---|---|
| Every ball sound reaches its level within 1 ms | patent | hit 0.08 ms, bounce 0.15 ms | yes |
| A hit goes ~1 kHz → 250 Hz → ~1 kHz | patent | 990 → 250 → 1010 Hz | yes |
| A bounce goes ~1 kHz → 250 Hz | patent | 1000 → 250 Hz | yes |
| The ring is quieter than the start | banwell | -14.7 dB | yes |
| A flat hit is louder than a spun one | pate | -20.1 dB against -21.2 dB | yes |
| … and darker (lower spectral centroid) | pate | 3713 Hz against 3820 Hz | yes |

A hit lasts 18 ms and a bounce 25 ms (to 1% of their peak), short as Banwell's listeners preferred.

## Where the sources and the game part

- **The ring's pitch.** Russell measured the first string-bed mode of a racket hanging free at 582 Hz, and Banwell
  names that mode as the main source of the ring; the patent hears the ring at about 1 kHz. The game follows the
  patent, which describes hits recorded on court rather than a racket in a lab.
- **One contact time for every stroke.** Hamori's figures (~4.0 ms poly, ~4.5 ms gut) do not say which stroke was
  filmed, so serves, volleys and groundstrokes all use 4 ms; the legends' gut strings are not modelled.
- **Spin on every stroke.** Paté et al. compared flat and kick serves; the game applies the same direction to every
  stroke.
- **The first build failed its own check.** With the crack spread over the whole contact, the hit's first part
  measured 160 Hz, a low pop, where the patent hears 1 kHz. The crack now marks only the onset; nothing else changed.
