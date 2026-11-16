# Per-player statistics from the Match Charting Project (CC BY-NC-SA 4.0), hard courts where there are 20+ such
# matches, else all surfaces; plus a tour reference (every charted hard-court match since 2010).
# usage: python3 -I tools/mcp_targets.py <a clone of github.com/JeffSackmann/tennis_MatchChartingProject> data/mcp-players.json
import csv, json, sys, collections
D, OUT = sys.argv[1], sys.argv[2]
NAMES = {'Djokovic':'Novak Djokovic','Nadal':'Rafael Nadal','Alcaraz':'Carlos Alcaraz','Federer':'Roger Federer','Sinner':'Jannik Sinner',
  'Medvedev':'Daniil Medvedev','Zverev':'Alexander Zverev','de Minaur':'Alex De Minaur','Sampras':'Pete Sampras','Borg':'Bjorn Borg',
  'Agassi':'Andre Agassi','Murray':'Andy Murray','McEnroe':'John McEnroe'}
rd = lambda f: csv.DictReader(open(f'{D}/{f}', encoding='utf-8', errors='replace'))
matches = {r['match_id']: r for r in rd('charting-m-matches.csv')}
def num(x):
  try: return float(x)
  except: return 0.0
# gather per (match, player) rows
ov = {(r['match_id'], r['player']): r for r in rd('charting-m-stats-Overview.csv') if r['set'] == 'Total'}
snv = {(r['match_id'], r['player']): r for r in rd('charting-m-stats-SnV.csv') if r['row'] == 'SnV'}
net = {(r['match_id'], r['player']): r for r in rd('charting-m-stats-NetPoints.csv') if r['row'] == 'NetPoints'}
st = collections.defaultdict(dict)
for r in rd('charting-m-stats-ShotTypes.csv'):
  if r['row'] in ('Total', 'Dr', 'Sl', 'Lo', 'Vo', 'Ov'): st[(r['match_id'], r['player'])][r['row']] = r
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
  return {'matches': int(a['matches']), 'points': int(pts),
    'ace': a['aces'] / a['serve_pts'], 'df': a['dfs'] / a['serve_pts'], 'firstIn': a['first_in'] / a['serve_pts'],
    'firstWon': a['first_won'] / a['first_in'], 'secondWon': a['second_won'] / a['second_pts'], 'returnWon': a['return_won'] / a['return_pts'],
    'snv': a['snv'] / a['serve_pts'], 'net': a['net_pts'] / pts, 'drop': a['drop'] / a['shots'], 'slice': a['slice'] / a['shots'], 'lob': a['lob'] / a['shots'],
    'winners': a['winners'] / a['shots'], 'unforced': a['unforced'] / a['shots'], 'errors': (a['unforced'] + a['forced']) / a['shots'],
    'rally': (a['shots'] + a['opp_shots'] + a['serve_pts'] + a['return_pts']) / pts}
out = {'source': 'Tennis Abstract Match Charting Project, https://github.com/JeffSackmann/tennis_MatchChartingProject (CC BY-NC-SA 4.0)',
  'rule': 'hard-court matches if a player has 20 or more, else all surfaces', 'players': {}}
for short, full in NAMES.items():
  mids = [m for m, r in matches.items() if full.lower() in (r['Player 1'].strip().lower(), r['Player 2'].strip().lower())]
  hard = [m for m in mids if matches[m].get('Surface') == 'Hard']
  use, surf = (hard, 'hard') if len(hard) >= 20 else (mids, 'all')
  acc = dict.fromkeys(FIELDS, 0.0); name = None
  for m in use:
    for p in players_in[m]:
      if p.strip().lower() == full.lower(): add(acc, m, p)
  r = rates(acc); r['surface'] = surf; r['years'] = f"{min(matches[m]['Date'][:4] for m in use)}–{max(matches[m]['Date'][:4] for m in use)}"
  out['players'][short] = r
ref = dict.fromkeys(FIELDS, 0.0)
for m, r in matches.items():
  if r.get('Surface') == 'Hard' and r['Date'][:4] >= '2010':
    for p in players_in[m]: add(ref, m, p)
out['tour'] = rates(ref); out['tour']['surface'] = 'hard'; out['tour']['years'] = '2010–2026'
json.dump(out, open(OUT, 'w'), indent=1, ensure_ascii=False)
k = ['matches','points','ace','df','firstIn','firstWon','secondWon','returnWon','snv','net','drop','slice','lob','winners','errors','rally']
print('player     ' + ' '.join(f'{x[:7]:>7}' for x in k))
for n, r in list(out['players'].items()) + [('TOUR', out['tour'])]:
  print(f'{n:10} ' + ' '.join(f'{r[x]:7.0f}' if x in ('matches', 'points') else f'{r[x]*100:6.1f}%' if x != 'rally' else f'{r[x]:7.2f}' for x in k), r['surface'])
