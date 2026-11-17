# Cuts the racket hits out of a real recording and writes them into the game (src/audio/hitSamples.js).
# Source: "Tennis Serves 3" by jamesdrake89, Freesound 662266 (tennis serves recorded outdoors for a project),
# Creative Commons 0. Chosen over a closer, brighter recording (Freesound 338122, which the game used first and sounded
# hard and clacky) because its hits have the balance of tennis hits made for games: measured over each hit's first
# 60 ms, 38–70% of the energy between 300 Hz and 1 kHz and about 1% above 3 kHz, like the CC0 game-style hits it was set
# against (Freesound 710041, 709678, 412863), where 338122 had 27–36% and 13–22%. Its preview is what is used:
# https://cdn.freesound.org/previews/662/662266_4980667-hq.mp3, decoded to 44.1 kHz mono 16-bit WAV (on a Mac:
# afconvert -f WAVE -d LEI16@44100 -c 1 in.mp3 out.wav).
# Each hit: from 3 ms before its peak to 160 ms after, a high-pass at 80 Hz (wind and traffic), halved to 22.05 kHz
# behind a low-pass at 10 kHz, a 30-ms fade at the end. Nothing else is changed: the level, spectrum and decay are the
# recording's. Also measures each hit (peak, spectral centroid and strongest frequency over 30 ms, the time to fall
# 20 and 40 dB), for docs/sound.
#   python3 -I tools/sound-samples.py <decoded wav> src/audio/hitSamples.js
import sys, wave, base64, json, numpy as np
src, out = sys.argv[1], sys.argv[2]
w = wave.open(src); r = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
# the hits: where the 2-ms envelope rises far above the floor, at least 250 ms apart
win = int(.002 * r); env = np.convolve(np.abs(x), np.ones(win) / win, mode='same')
thr = max(np.percentile(env, 30) * 12, env.max() * .12); hits = []; i = 0
while i < len(env):
    if env[i] > thr: k = i + int(np.argmax(np.abs(x[i:i + int(.004 * r)]))); hits.append(k); i = k + int(.25 * r)
    else: i += 1
def fir(cut, n=101):  # windowed-sinc low-pass
    t = np.arange(n) - (n - 1) / 2; h = np.sinc(2 * cut / r * t) * np.hamming(n); return h / h.sum()
def highpass(s, f):   # first-order
    a = 1 / (1 + 2 * np.pi * f / r); y = np.zeros_like(s); px = py = 0.0
    for i, v in enumerate(s): py = a * (py + v - px); px = v; y[i] = py
    return y
clips = []
for k in hits:
    s = x[k - int(.003 * r): k + int(.160 * r)]
    s = highpass(s, 80)
    n = len(s); fade = int(.030 * r); s[n - fade:] *= np.linspace(1, 0, fade)
    seg = s[: int(.033 * r)]; S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), 4096)); f = np.fft.rfftfreq(4096, 1 / r); b = (f > 80) & (f < 12000)
    e = np.convolve(np.abs(s), np.ones(win) / win, mode='same'); p0 = int(.003 * r); e0 = e[p0]
    fall = lambda d: round(next((i for i, v in enumerate(e[p0:]) if v < e0 * 10 ** (-d / 20)), len(e) - p0) / r * 1000, 1)
    d = np.convolve(s, fir(10000), mode='same')[::2]
    q = np.round(np.clip(d, -1, 1) * 32767).astype('<i2')
    clips.append({'at': round(k / r, 3), 'peak': round(float(np.abs(s).max()), 3), 'centroid': round(float((f[b] * S[b]).sum() / S[b].sum())),
                  'dominant': round(float(f[b][np.argmax(S[b])])), 'fall20ms': fall(20), 'fall40ms': fall(40), 'data': base64.b64encode(q.tobytes()).decode()})
clips.sort(key=lambda c: c['peak'])
meta = {'source': 'Freesound 662266, "Tennis Serves 3" by jamesdrake89 (CC0 1.0)', 'url': 'https://freesound.org/people/jamesdrake89/sounds/662266/', 'rate': r // 2}
js = ("// hitSamples — real racket hits, cut from a recording by tools/sound-samples.py (do not edit by hand). " + meta['source'] + ",\n"
      "// " + meta['url'] + " — public domain. 16-bit PCM at " + str(meta['rate']) + " Hz, base64; softest first. Each with what it measures.\n"
      "const HIT_SAMPLES={source:" + json.dumps(meta['source']) + ",url:" + json.dumps(meta['url']) + ",rate:" + str(meta['rate']) + ",clips:[\n" +
      ",\n".join(' {' + ','.join(f'{k}:{json.dumps(v)}' for k, v in c.items()) + '}' for c in clips) + "]};\n")
open(out, 'w').write(js)
for c in clips: print({k: v for k, v in c.items() if k != 'data'})
print(len(js), 'bytes written to', out)
