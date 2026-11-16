# Data

| File | What it is | Made by |
|---|---|---|
| `mcp-players.json` | Each roster player's real statistics, and the tour's, from the Match Charting Project | `python3 -I tools/mcp_targets.py <clone of the project> data/mcp-players.json` |
| `fit-report.json` | Each player's statistics in the game next to his real ones, and his numbers before and after the fit | `node tools/fit-players.js` |

Both files, and `src/players/fitted.js`, are derived from the **Tennis Abstract Match Charting Project**
(<https://github.com/JeffSackmann/tennis_MatchChartingProject>), crowdsourced shot-by-shot professional tennis data
by The Tennis Abstract Match Charting Project, licensed under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). They carry the same licence: attribution
required, non-commercial use only, share alike. How they are made and used is in [docs/players](../docs/players/README.md).
