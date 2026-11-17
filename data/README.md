# Data

| File | What it is | Made by |
|---|---|---|
| `mcp-players.json` | Each roster player's real statistics, and the tour's, from the Match Charting Project | `python3 -I tools/mcp_targets.py <clone of the project> data/mcp-players.json` |
| `fit-report.json` | Each player's statistics in the game next to his real ones, and his numbers before and after the fit | `node tools/fit-players.js` |
| `rally-check.json` | How points are played in the game (directions, overheads, net play, how points end, running) next to the real figures | `node tools/rally-check.js 24 data/rally-check.json` |
| `rally-before.json` | The same for the version before the movement fix (commit 193b5ff), measured by the same tool | the same, run on that commit |

The real rally directions (59.3% cross-court, 26.5% middle, 14.2% down the line) and the rule they are counted by
come from `python3 -I tools/mcp_directions.py <clone of the project>`, which also checks the rule by rebuilding the
project's direction table from its raw shot codes.

These files, and `src/players/fitted.js`, are derived from the **Tennis Abstract Match Charting Project**
(<https://github.com/JeffSackmann/tennis_MatchChartingProject>), crowdsourced shot-by-shot professional tennis data
by The Tennis Abstract Match Charting Project, licensed under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). They carry the same licence: attribution
required, non-commercial use only, share alike. How they are made and used is in [docs/players](../docs/players/README.md).
