# The tour on each surface, from the Match Charting Project (CC BY-NC-SA 4.0): every charted men's match since 2010
# on hard, clay and grass, counted the same way as the tour reference in tools/mcp_targets.py. These are the real
# figures the game's courts are checked against (tools/surface-check.js, docs/surfaces).
# usage: python3 -I tools/mcp_surfaces.py <a clone of github.com/JeffSackmann/tennis_MatchChartingProject> data/mcp-surfaces.json
import csv, json, sys, collections
D, OUT = sys.argv[1], sys.argv[2]
rd = lambda f: csv.DictReader(open(f'{D}/{f}', encoding='utf-8', errors='replace'))
matches = {r['match_id']: r for r in rd('charting-m-matches.csv')}
def num(x):
  try: return float(x)
  except: return 0.0
ov = {(r['match_id'], r['player']): r for r in rd('charting-m-stats-Overview.csv') if r['set'] == 'Total'}
snv = {(r['match_id'], r['player']): r for r in rd('charting-m-stats-SnV.csv') if r['row'] == 'SnV'}
net = {(r['match_id'], r['player']): r for r in rd('charting-m-stats-NetPoints.csv') if r['row'] == 'NetPoints'}
st = collections.defaultdict(dict)
for r in rd('charting-m-stats-ShotTypes.csv'):
  if r['row'] in ('Total', 'Dr', 'Sl', 'Lo'): st[(r['match_id'], r['player'])][r['row']] = r
players_in = collections.defaultdict(list)
for k in ov: players_in[k[0]].append(k[1])
FIELDS = ['matches','serve_pts','aces','dfs','first_in','first_won','second_pts','second_won','return_pts','return_won','snv','net_pts','shots','drop','slice','lob','winners','unforced','forced','opp_shots']
def add(acc, mid, p):
  o = ov.get((mid, p)); s = st.get((mid, p), {})
  opp = [q for q in players_in[mid] if q != p]
  if not o or 'Total' not in s or len(opp) != 1: return False
  so = st.get((mid, opp[0]), {})
  if 'Total' not in so: return False
  acc['matches'] += 1
  acc['serve_pts'] += num(o['serve_pts']); acc['aces'] += num(o['aces']); acc['dfs'] += num(o['dfs'])
  acc['first_in'] += num(o['first_in']); acc['first_won'] += num(o['first_won'])
  acc['second_pts'] += num(o['serve_pts']) - num(o['first_in']); acc['second_won'] += num(o['second_won'])
  acc['return_pts'] += num(o['return_pts']); acc['return_won'] += num(o['return_pts_won'])
  acc['snv'] += num(snv.get((mid, p), {}).get('snv_pts', 0)); acc['net_pts'] += num(net.get((mid, p), {}).get('net_pts', 0))
  T = s['Total']; acc['shots'] += num(T['shots']); acc['winners'] += num(T['winners']); acc['unforced'] += num(T['unforced'])
  acc['forced'] += num(so['Total']['induced_forced']); acc['opp_shots'] += num(so['Total']['shots'])
  for row, key in (('Dr', 'drop'), ('Sl', 'slice'), ('Lo', 'lob')): acc[key] += num(s.get(row, {}).get('shots', 0))
  return True
def rates(a):
  pts = a['serve_pts'] + a['return_pts']
  return {'matches': int(a['matches']) // 2, 'points': int(pts) // 2,
    'ace': a['aces'] / a['serve_pts'], 'df': a['dfs'] / a['serve_pts'], 'firstIn': a['first_in'] / a['serve_pts'],
    'firstWon': a['first_won'] / a['first_in'], 'secondWon': a['second_won'] / a['second_pts'],
    'snv': a['snv'] / a['serve_pts'], 'net': a['net_pts'] / pts, 'drop': a['drop'] / a['shots'], 'slice': a['slice'] / a['shots'], 'lob': a['lob'] / a['shots'],
    'winners': a['winners'] / a['shots'], 'errors': (a['unforced'] + a['forced']) / a['shots'],
    'rally': (a['shots'] + a['opp_shots'] + a['serve_pts'] + a['return_pts']) / pts}
out = {'source': 'Tennis Abstract Match Charting Project, https://github.com/JeffSackmann/tennis_MatchChartingProject (CC BY-NC-SA 4.0)',
  'rule': "every charted men's match since 2010 on the surface, both players; counted as in tools/mcp_targets.py", 'surfaces': {}}
for surf in ('Hard', 'Clay', 'Grass'):
  acc = dict.fromkeys(FIELDS, 0.0)
  for m, r in matches.items():
    if r.get('Surface') == surf and r['Date'][:4] >= '2010':
      for p in players_in[m]: add(acc, m, p)
  out['surfaces'][surf.lower()] = rates(acc)
json.dump(out, open(OUT, 'w'), indent=1)
k = ['matches','points','ace','df','firstIn','firstWon','secondWon','snv','net','winners','errors','rally']
print('surface ' + ' '.join(f'{x[:8]:>8}' for x in k))
for n, r in out['surfaces'].items():
  print(f'{n:7} ' + ' '.join(f'{r[x]:8.0f}' if x in ('matches', 'points') else f'{r[x]*100:7.1f}%' if x != 'rally' else f'{r[x]:8.2f}' for x in k))
