# Pixel Tennis Open

**[▶ Play in your browser](https://shawn01ee.github.io/pixel-tennis-open/)**

A pixel-art tennis match in a 45° isometric stadium, running in the browser. You don't steer the player: you choose
the shot and where it goes, and the player moves, times the swing and recovers on their own. An Auto mode plays the
whole match for you.

This is the first playable piece of a planned career game (tour, matches, growth, ranking, majors). For now it is
one match on a blue hard court.

## Play

Play at <https://shawn01ee.github.io/pixel-tennis-open/>, or open `dist/pixel-tennis-open.html` in a desktop browser. It is a single file; it loads three.js from a CDN, so it
needs a network connection. Pick your player and opponent, then press **Walk out**.

| Key | Action |
|---|---|
| A / S / D / F / G | Drive (topspin) / Flat / Slice / Lob / Drop shot |
| Click on the court | Where the shot goes |
| Space | Auto on or off |
| X | Game speed |
| V | Next camera view (Follow, Court, Behind, Stadium) |

## Build and test

```sh
python3 build.py                      # src/ + template.html -> dist/pixel-tennis-open.html
node tests/locomotion.test.js         # movement and footwork
node tests/match-simulation.test.js   # whole matches, computer and scripted human
node tests/crowd.test.js              # crowd reactions (statistical; can fail on an unlucky seed)
```

Python 3 and Node are the only requirements; there are no packages to install.

## Layout

One class per file, grouped by what it is about. `src/manifest.json` sets the build order.

| Folder | Contents |
|---|---|
| `src/core` | constants, maths, random numbers, court dimensions |
| `src/physics` | ball flight (drag, Magnus), bounce, net, shot solver |
| `src/rules` | match formats and scoring |
| `src/players` | profiles and roster, movement, shot planning, the person's controls |
| `src/match` | the match itself, umpire, ball kids, crowd mood, commentary |
| `src/render` | renderer, camera, figures (skeleton, body mesh, footwork), ball, effects |
| `src/stadium` | court surface, stands, crowd, LED boards, big screen |
| `src/audio` | synthesised hits, crowd and umpire voice |
| `src/ui` | scoreboard, controls, menus, setup and result screens |
| `src/app` | input, game loop, entry point |
