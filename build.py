# Bundles src/ into one self-contained page, dist/pixel-tennis-open.html, in the order of src/manifest.json — checked
# and if need be repaired by tools/loadorder.py, a topological sort of what each file needs while loading
import json, os, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from loadorder import LoadOrder
# the manifest's order, repaired by a topological sort if a file is listed before something it needs while loading
listed = json.load(open(os.path.join(SRC, 'manifest.json'), encoding='utf-8'))
files, _ = LoadOrder(SRC).order()
moved = [f for f, g in zip(listed, files) if f != g]
if moved:
    print(f'load order: {len(moved)} files placed after what they need (run python3 tools/loadorder.py)')
js = '\n'.join(open(os.path.join(SRC, f), encoding='utf-8').read() for f in files)
js = "(()=>{'use strict';\n" + js + "\n})();"
html = open(os.path.join(ROOT, 'template.html'), encoding='utf-8').read()
assert '/*__APP__*/' in html
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
out = os.path.join(ROOT, 'dist', 'pixel-tennis-open.html')
open(out, 'w', encoding='utf-8').write(html.replace('/*__APP__*/', js))
print(f'{len(files)} source files -> {os.path.relpath(out, ROOT)} ({len(html) + len(js):,} bytes)')
