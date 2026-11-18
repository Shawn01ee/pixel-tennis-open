# Cuts the players' grunts from real recordings into src/audio/gruntSamples.js. All public domain (Freesound, CC0 1.0),
# fetched as Freesound's previews and decoded on a Mac:
#   the preview (…-hq.mp3) linked on each sound's page, https://freesound.org/people/<user>/sounds/<id>/ (below)
#   afconvert -f WAVE -d LEI16@44100 -c 1 <file>.mp3 <file>.wav
#   python3 -I tools/grunt-samples.py <folder of the .wav files> src/audio/gruntSamples.js
# Which grunts (where each starts, s; how long, ms), by rules fixed before measuring: a tennis grunt is a short shout at
# the strike (Stappen et al. 2022: "a non-verbal screaming vocalisation made by tennis players ... when striking the
# ball"), so only recordings of shouts, efforts and grunts — none of pain, groaning or moaning; each grunt's pitch
# (median F0 over its voiced 30-ms frames) inside the range of men's tennis grunts measured on tour (234-395 Hz,
# data/grunt-f0.json); at its loudest within 60 ms of starting, as a shout is; 120-400 ms long; clearly voiced and well
# above the noise; at most two from any one man, at least 1.5 semitones apart, the most clearly voiced first. Nadal's
# is the one in two parts, a low "ah" and then a higher "HAH!" (design: his own voice cannot be used; it is longer).
# Checked again once cut: two whose pitch then read an octave away (Halgrimm's at 5.80 s, BaggoNotes' at 4.69 s) are
# not clearly voiced after all and are left out; BaggoNotes' next is taken by the same rule, Halgrimm has no other.
# randbsoundbites' at 2.98 s, once cut, reached its loudest only after 90 ms: his other, at 1.86 s, instead.
# Each is cut from 20 ms before it starts to 30 ms after it ends (a fade over those 30 ms), high-passed at 60 Hz,
# halved to 22.05 kHz behind a low-pass at 10 kHz, and set to the same loudness (RMS) as the others, the recordings
# having been made at different levels.
import sys, os, wave, json, base64, numpy as np
SRC = {
  '583259': ('RyanPBaskett', 'ah-hah!', 0), '218895': ('Halgrimm', 'human grunts 3', 0), '795440': ('randbsoundbites', 'Grunting', 0),
  '399626': ('SoundsForHim', 'Male grunt', 0), '171659': ('enmiller2', 'grunts', 0), '718967': ('BaggoNotes', 'ShoutingPunches_Male', 0),
  '770124': ('IENBA', 'Big Character Grunts', 0), '517858': ('mf_gloom', 'TELV 152 Worker Attack grunt', 0), '517848': ('mf_gloom', 'TELV 152 Grunt 2 Lunge', 0),
  '213232': ('unfa', 'Huh-haaa! (dry)', 0),
}
CUT = [  # key, recording, start (s), length (ms)
  ('nadal', '583259', 0.86, 700),
('b', '795440', 1.86, 152), ('c', '218895', 11.16, 174), ('d', '399626', 0.57, 278),
  ('e', '171659', 7.53, 158), ('f', '718967', 8.78, 279), ('g', '770124', 6.03, 292), ('h', '517858', 1.37, 323),
  ('i', '517848', 0.94, 153), ('j', '213232', 1.76, 316), ('k', '718967', 6.65, 167), ('l', '770124', 2.06, 257),
]
folder, out = sys.argv[1], sys.argv[2]
def load(i):
    f = next(n for n in os.listdir(folder) if (n.startswith(i + '_') or n.startswith(i + '.')) and n.endswith('.wav')); w = wave.open(os.path.join(folder, f))
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
    q = np.round(np.clip(d, -1, 1) * 32767).astype('<i2'); u, title, _ = SRC[rec]
    clips.append({'key': key, 'src': f'Freesound {rec}, "{title}" by {u} (CC0 1.0)', 'url': f'https://freesound.org/people/{u}/sounds/{rec}/',
                  'f0': round(hz), 'ms': round(len(d) / (r // 2) * 1000), 'data': base64.b64encode(q.tobytes()).decode()})
js = ("// GRUNT_SAMPLES — players' grunts, real recordings cut by tools/grunt-samples.py (do not edit by hand): men's effort\n"
      "// grunts from Freesound, all public domain (CC0 1.0). 16-bit PCM at 22050 Hz, base64; each with its pitch (f0, Hz) and length.\n"
      f"const GRUNT_SAMPLES={{rate:22050,clips:[\n" + ",\n".join(' {' + ','.join(f'{k}:{json.dumps(v)}' for k, v in c.items()) + '}' for c in clips) + "]};\n")
open(out, 'w').write(js)
for c in clips: print({k: v for k, v in c.items() if k != 'data'})
print(len(js), 'bytes written to', out)
