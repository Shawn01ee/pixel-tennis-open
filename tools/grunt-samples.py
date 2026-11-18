# Cuts the players' grunts from real recordings into src/audio/gruntSamples.js. All public domain (Freesound, CC0 1.0),
# fetched as Freesound's previews and decoded on a Mac:
#   curl -O https://cdn.freesound.org/previews/<id/1000>/<id>_<user id>-hq.mp3     (each id below)
#   afconvert -f WAVE -d LEI16@44100 -c 1 <file>.mp3 <file>.wav
#   python3 -I tools/grunt-samples.py <folder of the .wav files> src/audio/gruntSamples.js
# Which grunts (where each starts, s; how long, ms): every one has a pitch (median F0 over its voiced 30-ms frames) inside
# the range of men's tennis grunts measured on tour (234-395 Hz, data/grunt-f0.json), lasts 150-450 ms (the longer two
# excepted, below), is clearly voiced and well above the noise; no more than one per man unless his are at least 1.5
# semitones apart. Nadal's is the one in two parts, a lower "uh" then a rising "AH" (design: his own voice cannot be used).
# Each is cut from 20 ms before it starts to 30 ms after it ends (a fade over those 30 ms), high-passed at 60 Hz,
# halved to 22.05 kHz behind a low-pass at 10 kHz, and set to the same loudness (RMS) as the others, the recordings
# having been made at different levels.
import sys, os, wave, json, base64, numpy as np
SRC = {
  '144907': ('sketchygio', 'Male_Grunts.aiff', 892689), '464684': ('BranndyBottle', 'MaleGrunt_full.wav', 7358035),
  '874593': ('samrad20', 'malegrunt03', 13888274), '524558': ('InfrawaveSound', 'Various male grunts.wav', 10946071),
  '643670': ('SnowFightStudios', 'Grunts_Various Male.mp3', 12064174), '803168': ('salemaudio', 'Soft Male Vocal, Short Pained/Exhertion Groans', 17274093),
  '511023': ('ale-batec', 'Male Fight Grunts', 1484610),
}
CUT = [  # key, recording, start (s), length (ms)
  ('nadal', '643670', 3.21, 493), ('long', '803168', 13.36, 706),
  ('a', '144907', 2.62, 316), ('b', '464684', 0.62, 433), ('c', '874593', 0.17, 374), ('d', '524558', 35.38, 161),
  ('e', '643670', 1.18, 269), ('f', '643670', 2.14, 271), ('g', '803168', 11.66, 384), ('h', '803168', 8.74, 222),
  ('i', '511023', 0.54, 196), ('j', '511023', 26.31, 210),
]
folder, out = sys.argv[1], sys.argv[2]
def load(i):
    f = next(n for n in os.listdir(folder) if n.startswith(i + '_') and n.endswith('.wav')); w = wave.open(os.path.join(folder, f))
    return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768, w.getframerate()
def fir(cut, r, n=101):
    t = np.arange(n) - (n - 1) / 2; h = np.sinc(2 * cut / r * t) * np.hamming(n); return h / h.sum()
def highpass(s, f, r):
    a = 1 / (1 + 2 * np.pi * f / r); y = np.zeros_like(s); px = py = 0.0
    for i, v in enumerate(s): py = a * (py + v - px); px = v; y[i] = py
    return y
def f0(seg, r):
    fr, hop, out = int(.03 * r), int(.01 * r), []
    for i in range(0, len(seg) - fr, hop):
        s = seg[i:i + fr] * np.hanning(fr); s = s - s.mean()
        if np.sqrt((s * s).mean()) < .01: continue
        ac = np.correlate(s, s, 'full')[fr - 1:]; ac /= ac[0] + 1e-12; lo, hi = int(r / 600), int(r / 80); k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > .45: out.append(r / k)
    return float(np.median(out)) if out else 0.0
clips, TARGET = [], .1   # every grunt's RMS over its length (design: the same for all)
for key, rec, at, ms in CUT:
    x, r = load(rec); a0, a1 = int((at - .02) * r), int((at + ms / 1000 + .03) * r)
    s = highpass(x[max(0, a0):a1].copy(), 60, r); fade = int(.03 * r); s[-fade:] *= np.linspace(1, 0, fade)
    hz = f0(s, r); s *= TARGET / np.sqrt((s * s).mean())
    d = np.convolve(s, fir(10000, r), mode='same')[::2]; peak = float(np.abs(d).max())
    if peak > .99: d *= .99 / peak
    q = np.round(np.clip(d, -1, 1) * 32767).astype('<i2'); u, title, uid = SRC[rec]
    clips.append({'key': key, 'src': f'Freesound {rec}, "{title}" by {u} (CC0 1.0)', 'url': f'https://freesound.org/people/{u}/sounds/{rec}/',
                  'f0': round(hz), 'ms': round(len(d) / (r // 2) * 1000), 'data': base64.b64encode(q.tobytes()).decode()})
js = ("// GRUNT_SAMPLES — players' grunts, real recordings cut by tools/grunt-samples.py (do not edit by hand): men's effort\n"
      "// grunts from Freesound, all public domain (CC0 1.0). 16-bit PCM at 22050 Hz, base64; each with its pitch (f0, Hz) and length.\n"
      f"const GRUNT_SAMPLES={{rate:22050,clips:[\n" + ",\n".join(' {' + ','.join(f'{k}:{json.dumps(v)}' for k, v in c.items()) + '}' for c in clips) + "]};\n")
open(out, 'w').write(js)
for c in clips: print({k: v for k, v in c.items() if k != 'data'})
print(len(js), 'bytes written to', out)
