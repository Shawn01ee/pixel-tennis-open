# Men's tennis grunts as measured by Raine, Pisanski & Reby (2017), "Tennis grunts communicate acoustic cues to sex and
# contest outcome", Animal Behaviour 130:47-55, from their dataset (University of Sussex, figshare 23586057, CC BY 4.0;
# data/grunts/*.xlsx). Players are anonymous there; sex code 1 is men (speaking pitch about 113 Hz), 7 women.
#   between-subjects.xlsx  two grunts from each of 30 men and 30 women: the grunts' mean F0, and each player's speaking F0
#   within-subjects.xlsx   about 23 grunts each from 7 men and 7 women: shot type, match outcome, how far into the match
# Writes data/grunt-f0.json: how far apart men's grunts are in pitch, how much higher a serve's grunt is than a
# groundstroke's, and how much grunts rise from the start of a match to its end — each against the player's own.
#   python3 -I tools/grunt-data.py
import os, re, json, zipfile, statistics as st, xml.etree.ElementTree as ET
import numpy as np
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); N = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
def sheet(name):
    z = zipfile.ZipFile(os.path.join(ROOT, 'data', 'grunts', name))
    ss = [''.join(t.text or '' for t in si.iter(N + 't')) for si in ET.fromstring(z.read('xl/sharedStrings.xml')).iter(N + 'si')] if 'xl/sharedStrings.xml' in z.namelist() else []
    rows = []
    for r in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).iter(N + 'row'):
        row = {}
        for c in r.iter(N + 'c'):
            v = c.find(N + 'v'); val = v.text if v is not None else ''
            row[re.match(r'[A-Z]+', c.get('r')).group()] = ss[int(val)] if c.get('t') == 's' else val
        rows.append(row)
    h = rows[0]; return [{h[k]: r.get(k, '') for k in h} for r in rows[1:] if r]
semi = lambda a, b: 12 * np.log2(a / b)
B = [r for r in sheet('between-subjects.xlsx') if r['Player Sex'] == '1']
per = {}
for r in B: per.setdefault(r['Player ID'], []).append(float(r['meanF0']))
pm = np.array(sorted(st.mean(v) for v in per.values())); med = float(np.median(pm))
spread = [float(semi(x, med)) for x in pm]
W = [r for r in sheet('within-subjects.xlsx') if r['Player Sex'] == '1']
SHOT = 'Shot Type (1 = forehand, 2 = backhand, 3 = serve)'; T = 'Grunt Time - % of the match elapsed at the time of grunt production'
serve, drift, outcome, within, players = [], [], [], [], sorted({r['Player ID'] for r in W})
for pid in players:
    g = [r for r in W if r['Player ID'] == pid]; f = lambda rr: [float(r['mean F0']) for r in rr]
    sv, gs = f([r for r in g if r[SHOT] == '3']), f([r for r in g if r[SHOT] in ('1', '2')])
    if sv and gs: serve.append(float(semi(st.mean(sv), st.mean(gs))))
    x = np.array([float(r[T]) / 100 for r in g]); y = semi(np.array(f(g)), st.mean(f(g)))
    if len(g) > 3: drift.append(float(np.polyfit(x, y, 1)[0]))
    within.append(float(np.std(y, ddof=1)))
    codes = sorted({r['Match Outcome'] for r in g})
    if len(codes) == 2: outcome.append(float(semi(st.mean(f([r for r in g if r['Match Outcome'] == codes[1]])), st.mean(f([r for r in g if r['Match Outcome'] == codes[0]])))))
out = {
    'source': 'Raine, Pisanski & Reby 2017, Animal Behaviour 130:47-55; dataset figshare 23586057 (CC BY 4.0)',
    'men': len(pm), 'gruntF0': {'median': round(med), 'min': round(float(pm[0])), 'max': round(float(pm[-1])), 'p10': round(float(np.percentile(pm, 10))), 'p90': round(float(np.percentile(pm, 90)))},
    'spreadSemitones': {'sd': round(st.stdev(spread), 2), 'p10': round(float(np.percentile(spread, 10)), 2), 'p90': round(float(np.percentile(spread, 90)), 2), 'min': round(min(spread), 2), 'max': round(max(spread), 2)},
    'overSpeaking': round(st.mean(float(r['meanF0']) / float(r['speaking F0']) for r in B if r['speaking F0']), 2),
    'withinMen': len(players),
    'withinPlayerSdSemitones': {'perPlayer': [round(v, 2) for v in within], 'median': round(float(np.median(within)), 2), 'note': 'all of a man\'s grunts in the match about his own mean (shot type, progress and outcome included)'},
    'serveOverGroundSemitones': {'perPlayer': [round(v, 2) for v in serve], 'mean': round(st.mean(serve), 2)},
    'matchStartToEndSemitones': {'perPlayer': [round(v, 2) for v in drift], 'mean': round(st.mean(drift), 2)},
    'outcomeCodeDiffSemitones': {'perPlayer': [round(v, 2) for v in outcome], 'note': 'higher match-outcome code against lower, per player who has both'},
}
json.dump(out, open(os.path.join(ROOT, 'data', 'grunt-f0.json'), 'w'), indent=1)
print(json.dumps(out, indent=1))
