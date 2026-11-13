# Bundles src/ (in the order listed in src/manifest.json) into one self-contained page: dist/pixel-tennis-open.html
import json, os
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
files = json.load(open(os.path.join(SRC, 'manifest.json'), encoding='utf-8'))
js = '\n'.join(open(os.path.join(SRC, f), encoding='utf-8').read() for f in files)
js = "(()=>{'use strict';\n" + js + "\n})();"
html = open(os.path.join(ROOT, 'template.html'), encoding='utf-8').read()
assert '/*__APP__*/' in html
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
out = os.path.join(ROOT, 'dist', 'pixel-tennis-open.html')
open(out, 'w', encoding='utf-8').write(html.replace('/*__APP__*/', js))
print(f'{len(files)} source files -> {os.path.relpath(out, ROOT)} ({len(html) + len(js):,} bytes)')
