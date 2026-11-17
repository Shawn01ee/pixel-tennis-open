# Net points in the Match Charting Project (CC BY-NC-SA 4.0), and the rule its NetPoints table uses, checked by
# rebuilding that table from the raw shot codes.
# usage: python3 -I tools/mcp_net.py <a clone of github.com/JeffSackmann/tennis_MatchChartingProject> [points file]
#
# The rule (tools/netpoints.js counts the same in the game): a player has a net point when, in the point, he approaches
# (a shot marked +, or a serve marked + : serve-and-volley) or plays at the net (a volley, half-volley, swinging volley
# or overhead not marked = for 'at the baseline', or any shot marked - for 'at the net'), except a shot that is a
# forced error (#) and not an approach. It rebuilds the table from the raw codes (default file:
# charting-m-points-2020s.csv) and reports how many player-match rows come out exactly equal, and how many more net
# points there would be with forced errors left in, as the game must (it does not tell forced from unforced errors).
import csv, sys, collections
D = sys.argv[1]
PTS = sys.argv[2] if len(sys.argv) > 2 else 'charting-m-points-2020s.csv'
rd = lambda f: csv.DictReader(open(f'{D}/{f}', encoding='utf-8', errors='replace'))
matches = {r['match_id']: r for r in rd('charting-m-matches.csv')}
SHOTS = set('fbrsvzopuylmhijktq'); NETL = set('vzophijk')
def parse(code):
    i = 0
    while i < len(code) and code[i] == 'c': i += 1
    if i >= len(code) or code[i] not in '0456': return None, []
    srv, out, cur = '', [], None
    for ch in code[i + 1:]:
        if ch in SHOTS: cur = [ch, '']; out.append(cur)
        elif cur is None: srv += ch
        else: cur[1] += ch
    return srv, out
def net_shot(letter, rest, forced_out):
    if '+' in rest: return True
    if forced_out and '#' in rest: return False
    return '-' in rest or (letter in NETL and '=' not in rest)
rule, loose = collections.Counter(), collections.Counter()
for r in rd(PTS):
    mid = r['match_id']
    if mid not in matches: continue
    m = matches[mid]; srv, seq = parse(r['2nd'] if r['2nd'] else r['1st'])
    if srv is None: continue
    svr = int(r['Svr']) - 1
    for p in (0, 1):
        mine = [(l, x) for k, (l, x) in enumerate(seq, 1) if (svr if k % 2 == 0 else 1 - svr) == p]
        snv = p == svr and '+' in srv
        key = (mid, m['Player 1' if p == 0 else 'Player 2'])
        if snv or any(net_shot(l, x, True) for l, x in mine): rule[key] += 1
        if snv or any(net_shot(l, x, False) for l, x in mine): loose[key] += 1
table = {(r['match_id'], r['player']): int(r['net_pts']) for r in rd('charting-m-stats-NetPoints.csv') if r['row'] == 'NetPoints'}
seen = {k[0] for k in rule}
keys = [k for k in table if k[0] in seen]
exact = sum(1 for k in keys if rule[k] == table[k])
a, b, c = sum(rule[k] for k in keys), sum(table[k] for k in keys), sum(loose[k] for k in keys)
print(f'rule rebuilt from {PTS}: {exact} of {len(keys)} player-match rows exactly equal ({exact / len(keys) * 100:.1f}%); net points {a} rebuilt, {b} in the table')
print(f'with forced errors left in (as the game counts): {c} net points, {(c / a - 1) * 100:+.1f}%')
