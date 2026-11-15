# Stamina

Players tire over a match. Their legs slow, their first step loses its snap, the arm loses a little pace off the
ground and on the serve, and their shots get looser. A long rally leaves them short of breath for the next point or
two. How much each of these drops, and how fast, comes from published measurements of tennis players in long
matches. The model is `src/players/Stamina.js`.

<picture><source media="(prefers-color-scheme: dark)" srcset="energy-dark.svg"><img src="energy-light.svg" alt="Energy left after each point of a five-set match: Zverev ends at 53%, Sampras at 19%"></picture>

One five-setter, played headless by the game's own simulation (`node tools/stamina.js`). Zverev (endurance 1.04)
and Sampras (0.86) played 343 points. Sampras ran 3.13 km and ended with 19% left; Zverev ran 2.52 km and kept 53%.
Each downward spike is a long rally. The line comes back up as the player gets his breath back between points.

## Three kinds of tiredness

The research finds three different things happening, so the game keeps three stores.

| Store | Filled by | Empties | What it costs at full |
|---|---|---|---|
| **Legs** | running in play, priced by metabolic power | only sitting at changeovers, slowly | top speed −3%, first step and braking −8%, shot error +10% |
| **Arm** | strokes: 1 per groundstroke or volley, 2.5 per serve | only sitting at changeovers, slowly | serve speed −2.5%, serve error +8%, groundstroke pace −3%, shot error +15% |
| **Breath** | running harder than the body can sustain | between points: about half comes back in 25 s | top speed −6%, first step −10%, pace −3%, shot error +35% |

Endurance (the player card's **Stamina** rating) divides how fast the legs and arm fill. It also speeds up how fast
the breath comes back.

### What the numbers rest on

- **Top speed and first step.** Over a match, repeated-sprint times rise 2.3% by mid-match and 3.1% by the end. Leg
  stiffness drops 6.5% and jump height falls ([Girard et al. 2014](https://doi.org/10.1136/bjsports-2013-093165)).
  Over a three-hour match, maximal leg strength falls 9% and leg stiffness 9%
  ([Girard et al. 2006](https://doi.org/10.1136/bjsm.2005.023754),
  [Girard et al. 2007](https://doi.org/10.1016/j.jelekin.2007.05.005)). After four-hour matches on consecutive days,
  20 m sprints are slower ([Gescheit et al. 2015](https://doi.org/10.1123/ijspp.2014-0329)).
- **Serve.** In fifteen five-set Wimbledon matches, men served 177.0 km/h in the first set and 176.1 km/h in the
  fifth. First serves in went from 63.1% to 62.3%, and double faults stayed at 2.8%
  ([Maquirriain et al. 2016](https://doi.org/10.1080/17461391.2016.1156163)). In the lab, serve speed fell 1.8 m/s
  (about 3.7%) over a three-hour match ([Martin et al. 2016](https://doi.org/10.1177/0363546516645542),
  [Martin et al. 2016](https://doi.org/10.1371/journal.pone.0159979)). The game sits between the two: real pros
  pace themselves to protect the serve.
- **Groundstrokes.** Over 2 h 40 min of simulated play, both groundstroke speed and accuracy fell
  ([Hornery et al. 2007](https://doi.org/10.1123/ijspp.2.4.423)). In tracked tour matches, forehand success fell from
  75.2% in the first set to 65.5% in the second ([Pereira et al. 2016](https://doi.org/10.1080/02640414.2016.1165858)).
  At the point of exhaustion, groundstroke accuracy was 69% lower than at the start
  ([Davey et al. 2002](https://doi.org/10.1080/026404102753576080)). That is what a full breath store stands for.
- **Recovery.** Every physical marker is back to normal within 24 hours of a match
  ([Girard et al. 2014](https://doi.org/10.1136/bjsports-2013-093165)). Even so, sprint and jump stay down after
  four long matches on consecutive days ([Gescheit et al. 2015](https://doi.org/10.1123/ijspp.2014-0329)). In a
  tournament, a tenth of what a player ended a match with is carried into the next round (at most 0.15).
- **Players adapt.** Reviews of match-play fatigue find players change their game to protect what is failing,
  so a decline measured in the lab overstates the one seen on court
  ([Reid & Duffield 2014](https://doi.org/10.1136/bjsports-2013-093196)). The game's effects are set toward the
  match-play figures where the two differ.

### The cost of running

Running in tennis is mostly speeding up and slowing down. The legs are charged the **metabolic power of accelerated
running** ([di Prampero et al. 2005](https://doi.org/10.1242/jeb.01700),
[Osgnach et al. 2010](https://doi.org/10.1249/MSS.0b013e3181ae5cfd)). Accelerating forward at *a* costs the same as
running uphill on a slope of *a/g*. Minetti's polynomial gives that cost per metre: 3.6 J/kg on the flat. Speeding
up at 4 m/s² costs about five times as much. Easing off costs less, while braking hard costs about what flat
running does, because the muscles take the load. Turning sharply is charged as half a forward acceleration.
In the game this comes to about 13 J/kg per metre over a match, because tennis running is nearly all starting and
stopping. For comparison, the first 30 m of a sprint from a standing start average 10.7 J/kg per metre
(di Prampero et al. 2005).

The breath store fills only above a **critical power** of 16 W/kg, about 85% of a tour player's aerobic maximum.
It works like the W′ balance used in endurance sport ([Skiba et al. 2012](https://doi.org/10.1249/MSS.0b013e3182517a80)):
it holds 600 J/kg above that level, and comes back with a 40-second time constant (phosphocreatine resynthesis).
Between points the game allows the 25 seconds the rules give, then 90 at a changeover and 120 between sets.

## Calibration

The long-term stores are scaled so that an average-endurance player who plays 260 points of a five-setter ends near
0.8 in both, where the effects match the end-of-match declines above. Over 20 headless five-set matches
(`node tools/stamina.js 20`), scaled to endurance 1 and 260 points, the result is **legs 0.81, arm 0.81**.

Players in the game run 13.6 m a point. A meta-analysis of international men's matches puts it at 9.6 m (95% CI
7.6–12.2) and a five-setter at 2.3 km ([Pluim et al. 2023](https://doi.org/10.1007/s40279-022-01807-8)). Hawk-Eye
data from the Australian Open puts it at 4.2–4.5 m between shots ([Armstrong et al. 2024](https://doi.org/10.52082/jssm.2024.1)).
The game's players run a little more than real ones, so the capacities are calibrated against the game's own
distances, not the published ones.

`docs/stamina/run.json` holds the chart's match, the calibration and the constants it was made with.

## Endurance ratings

The endurance ratings come from each player's reputation, not from measurements, and are the one judgement call
here:

| Player | Endurance | | Player | Endurance |
|---|---|---|---|---|
| Djokovic | 1.20 | | Federer | 1.06 |
| Nadal | 1.18 | | Agassi | 1.06 |
| de Minaur | 1.16 | | Zverev | 1.04 |
| Murray | 1.16 | | McEnroe | 0.92 |
| Borg | 1.16 | | Sampras | 0.86 |
| Medvedev | 1.14 | | | |
| Alcaraz | 1.10 | | | |
| Sinner | 1.10 | | | |

## In the game

- The scoreboard has a thin energy gauge under each name: green, then amber below 60%, then red below 35%.
- The match statistics show the distance each player has run and the energy each has left.
- A tired player's feet stop pattering between shots, and they walk back to the baseline more slowly.
- `node tests/stamina.test.js` checks the cost model, the three stores, and that the end-of-match declines fall
  inside the measured ranges.

## References

The paper details and DOIs were checked against PubMed.

- Armstrong C, Peeling P, Murphy A, Reid M (2024). Navigating the court: a comparison of distance demands between sexes in Grand Slam tennis. *J Sports Sci Med* 23:1–7. [doi:10.52082/jssm.2024.1](https://doi.org/10.52082/jssm.2024.1)
- Davey PR, Thorpe RD, Williams C (2002). Fatigue decreases skilled tennis performance. *J Sports Sci* 20:311–318. [doi:10.1080/026404102753576080](https://doi.org/10.1080/026404102753576080)
- di Prampero PE, Fusi S, Sepulcri L, et al. (2005). Sprint running: a new energetic approach. *J Exp Biol* 208:2809–2816. [doi:10.1242/jeb.01700](https://doi.org/10.1242/jeb.01700)
- Gescheit DT, Cormack SJ, Reid M, Duffield R (2015). Consecutive days of prolonged tennis match play: performance, physical, and perceptual responses in trained players. *Int J Sports Physiol Perform* 10:913–920. [doi:10.1123/ijspp.2014-0329](https://doi.org/10.1123/ijspp.2014-0329)
- Girard O, Lattier G, Micallef JP, Millet GP (2006). Changes in exercise characteristics, maximal voluntary contraction, and explosive strength during prolonged tennis playing. *Br J Sports Med* 40:521–526. [doi:10.1136/bjsm.2005.023754](https://doi.org/10.1136/bjsm.2005.023754)
- Girard O, Lattier G, Maffiuletti NA, et al. (2007). Neuromuscular fatigue during a prolonged intermittent exercise: application to tennis. *J Electromyogr Kinesiol* 18:1038–1046. [doi:10.1016/j.jelekin.2007.05.005](https://doi.org/10.1016/j.jelekin.2007.05.005)
- Girard O, Christian RJ, Racinais S, Périard JD (2014). Heat stress does not exacerbate tennis-induced alterations in physical performance. *Br J Sports Med* 48:i39–i44. [doi:10.1136/bjsports-2013-093165](https://doi.org/10.1136/bjsports-2013-093165)
- Hornery DJ, Farrow D, Mujika I, Young WB (2007). Caffeine, carbohydrate, and cooling use during prolonged simulated tennis. *Int J Sports Physiol Perform* 2:423–438. [doi:10.1123/ijspp.2.4.423](https://doi.org/10.1123/ijspp.2.4.423)
- Maquirriain J, Baglione R, Cardey M (2016). Male professional tennis players maintain constant serve speed and accuracy over long matches on grass courts. *Eur J Sport Sci* 16:845–849. [doi:10.1080/17461391.2016.1156163](https://doi.org/10.1080/17461391.2016.1156163)
- Martin C, Kulpa R, Ezanno F, et al. (2016). Influence of playing a prolonged tennis match on shoulder internal range of motion. *Am J Sports Med* 44:2147–2151. [doi:10.1177/0363546516645542](https://doi.org/10.1177/0363546516645542)
- Martin C, Bideau B, Delamarche P, Kulpa R (2016). Influence of a prolonged tennis match play on serve biomechanics. *PLoS One* 11:e0159979. [doi:10.1371/journal.pone.0159979](https://doi.org/10.1371/journal.pone.0159979)
- Osgnach C, Poser S, Bernardini R, et al. (2010). Energy cost and metabolic power in elite soccer: a new match analysis approach. *Med Sci Sports Exerc* 42:170–178. [doi:10.1249/MSS.0b013e3181ae5cfd](https://doi.org/10.1249/MSS.0b013e3181ae5cfd)
- Pereira TJC, Nakamura FY, de Jesus MT, et al. (2016). Analysis of the distances covered and technical actions performed by professional tennis players during official matches. *J Sports Sci* 35:361–368. [doi:10.1080/02640414.2016.1165858](https://doi.org/10.1080/02640414.2016.1165858)
- Pluim BM, Jansen MGT, Williamson S, et al. (2023). Physical demands of tennis across the different court surfaces, performance levels and sexes: a systematic review with meta-analysis. *Sports Med* 53:807–836. [doi:10.1007/s40279-022-01807-8](https://doi.org/10.1007/s40279-022-01807-8)
- Reid M, Duffield R (2014). The development of fatigue during match-play tennis. *Br J Sports Med* 48:i7–i11. [doi:10.1136/bjsports-2013-093196](https://doi.org/10.1136/bjsports-2013-093196)
- Skiba PF, Chidnok W, Vanhatalo A, Jones AM (2012). Modeling the expenditure and reconstitution of work capacity above critical power. *Med Sci Sports Exerc* 44:1526–1532. [doi:10.1249/MSS.0b013e3182517a80](https://doi.org/10.1249/MSS.0b013e3182517a80)
