# Where rally balls go in the Match Charting Project (CC BY-NC-SA 4.0), and the rule its ShotDirection table uses,
# checked by rebuilding that table from the raw shot codes.
# usage: python3 -I tools/mcp_directions.py <a clone of github.com/JeffSackmann/tennis_MatchChartingProject> [points file]
#
# 1. The target the game is measured against: cross-court (including inside-out), down the middle and down the line
#    (including inside-in), every charted men's hard-court match since 2010, from charting-m-stats-ShotDirection.csv.
# 2. The rule behind that table. Each shot is coded 1 (to a right-hander's forehand side), 2 (middle) or 3 (to a
#    right-hander's backhand side); where the hitter stands is the code of the ball that came to him. The rule below
#    rebuilds the table from the raw codes (default file: charting-m-points-2020s.csv) and reports how many
#    player-match rows come out exactly equal.
# 3. One part of the rule the game cannot copy: forced errors are left out of the table, and the game does not tell
#    forced from unforced errors. The split with them put back shows how much that matters.
import csv, sys, collections
D = sys.argv[1]
PTS = sys.argv[2] if len(sys.argv) > 2 else 'charting-m-points-2020s.csv'
rd = lambda f: csv.DictReader(open(f'{D}/{f}', encoding='utf-8', errors='replace'))
CLS = ('crosscourt', 'down_middle', 'down_the_line', 'inside_out', 'inside_in')
pct = lambda c: {k: round(v / max(1, sum(c.values())) * 100, 1) for k, v in c.items()}
def split(c):
    t = sum(c[k] for k in CLS)
    return {'cross': round((c['crosscourt'] + c['inside_out']) / t * 100, 1), 'middle': round(c['down_middle'] / t * 100, 1),
            'line': round((c['down_the_line'] + c['inside_in']) / t * 100, 1), 'shots': t}

matches = {r['match_id']: r for r in rd('charting-m-matches.csv')}
hard = lambda mid: mid in matches and matches[mid]['Surface'] == 'Hard' and mid[:4] >= '2010'

# 1. the target
tot = collections.Counter()
for r in rd('charting-m-stats-ShotDirection.csv'):
    if r['row'] == 'Total' and hard(r['match_id']):
        for k in CLS: tot[k] += int(r[k])
print('1. hard courts since 2010, ShotDirection table:', split(tot))

# 2. the rule. Counted: rally forehands (f), backhands (b) and backhand slices (s) with a direction, not the return,
#    not a forced error (#). For a right-hander's forehand the corner it goes cross-court to from its own side is 1,
#    for his backhand 3 (mirrored for a left-hander). A ball that came to the middle or to the other side of the
#    stroke puts him 'inside'.
SHOTS = set('fbrsvzopuylmhijktq')
def parse(code):
    i = 0
    while i < len(code) and code[i] == 'c': i += 1
    if i >= len(code) or code[i] not in '0456': return []
    out, cur = [], None
    for ch in code[i + 1:]:
        if ch in SHOTS: cur = [ch, None, '']; out.append(cur)
        elif cur is not None:
            if ch in '123' and cur[1] is None: cur[1] = ch
            cur[2] += ch
    return out
def classify(letter, d, prev, hand):
    if d == '2': return 'down_middle'
    if hand == 'L': d, prev = {'1': '3', '3': '1'}[d], {'1': '3', '3': '1'}.get(prev, prev)
    nat, opp = ('1', '3') if letter == 'f' else ('3', '1')
    if d == nat: return 'inside_in' if prev == opp else 'crosscourt'
    return 'inside_out' if prev in (opp, '2') else 'down_the_line'
ROW = {'f': 'F', 'b': 'B', 's': 'S'}
mine = collections.defaultdict(collections.Counter)
withForced = collections.Counter()
for r in rd(PTS):
    mid = r['match_id']
    if mid not in matches: continue
    m = matches[mid]
    seq = parse(r['2nd'] if r['2nd'] else r['1st'])
    svr, prev = int(r['Svr']) - 1, None
    for k, (letter, d, rest) in enumerate(seq, start=1):
        who = svr if k % 2 == 0 else 1 - svr     # k = 1 is the return
        if letter in ROW and d and k > 1:
            c = classify(letter, d, prev, m['Pl 1 hand' if who == 0 else 'Pl 2 hand'])
            if '#' not in rest: mine[(mid, m['Player 1' if who == 0 else 'Player 2'], ROW[letter])][c] += 1
            if hard(mid): withForced[c] += 1
        prev = d
real = {(r['match_id'], r['player'], r['row']): collections.Counter({k: int(r[k]) for k in CLS})
        for r in rd('charting-m-stats-ShotDirection.csv') if r['row'] in ROW.values()}
keys = [k for k in mine if k in real]
exact = sum(1 for k in keys if mine[k] == real[k])
a, b = collections.Counter(), collections.Counter()
for k in keys: a.update(mine[k]); b.update(real[k])
print(f'2. rule rebuilt from {PTS}: {exact} of {len(keys)} player-match rows exactly equal ({exact / len(keys) * 100:.1f}%)')
for c in CLS: print(f'   {c:14s} rebuilt {a[c]:8d}  table {b[c]:8d}')
noForced = collections.Counter()
for k in keys:
    if hard(k[0]): noForced.update(mine[k])
print('3. hard courts in that file, as the table counts them:', split(noForced))
print('   the same with forced errors put back:            ', split(withForced))
