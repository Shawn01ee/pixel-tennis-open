# Cuts real recordings of the ball into the game: the racket hit (src/audio/hitSamples.js) and the bounce
# (src/audio/bounceSamples.js). Both chosen by the user from Pixabay and downloaded by hand (Pixabay does not allow
# automated downloads), used under the Pixabay Content License: free to use in a game, no credit needed, never to be
# shared on their own — they live only inside the game's files.
#   hit     "Tennis Ball Hit" by soundreality, Pixabay 151257 (soundreality-tennis-ball-hit-151257.mp3): one clean hit,
#           cut 24 ms after its peak: from 30 ms on, the recording's room rattles on at -18 to -30 dB for a third of a
#           second, a 'ta-da-dak' after every shot
#   bounce  "tennisballbounce" by freesound_community, Pixabay 39028 (freesound_community-tennisballbounce-39028.mp3):
#           a ball bounced on a hard floor; the four strong bounces are kept (the weak ones are second bounces),
#           each cut 40 ms after its peak: by then it has died to -30 dB, and the room's echo comes back at about 100 ms
#           (-28 dB), a second 'tak' after every bounce
# Each MP3 decoded to 44.1 kHz mono 16-bit WAV first (on a Mac: afconvert -f WAVE -d LEI16@44100 -c 1 in.mp3 out.wav).
# Each sound: from 3 ms before its peak to the length below after it, a high-pass at 40 Hz (rumble only), halved to
# 22.05 kHz behind a low-pass at 10 kHz, a fade over the last part. Nothing else is changed: level, spectrum and decay
# are the recording's. Also measures each one, for docs/sound.
#   python3 -I tools/sound-samples.py hit <decoded wav> src/audio/hitSamples.js
#   python3 -I tools/sound-samples.py bounce <decoded wav> src/audio/bounceSamples.js
import sys, wave, base64, json, numpy as np
KIND = {
  'hit': dict(name='HIT_SAMPLES', after=.024, fade=.012, keep=.5, source='Pixabay 151257, "Tennis Ball Hit" by soundreality (Pixabay Content License)',
              url='https://pixabay.com/sound-effects/tennis-ball-hit-151257/'),
  'bounce': dict(name='BOUNCE_SAMPLES', after=.04, fade=.015, keep=.7, source='Pixabay 39028, "tennisballbounce" by freesound_community (Pixabay Content License)',
              url='https://pixabay.com/sound-effects/tennisballbounce-39028/'),
}
kind, src, out = sys.argv[1], sys.argv[2], sys.argv[3]; K = KIND[kind]
w = wave.open(src); r = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
# the sounds: where the 2-ms envelope rises far above the floor, at least 250 ms apart; the strong ones are kept
win = int(.002 * r); env = np.convolve(np.abs(x), np.ones(win) / win, mode='same')
thr = max(np.percentile(env, 30) * 12, env.max() * .12); hits = []; i = 0
while i < len(env):
    if env[i] > thr: k = i + int(np.argmax(np.abs(x[i:i + int(.004 * r)]))); hits.append(k); i = k + int(.25 * r)
    else: i += 1
top = max(abs(x[k]) for k in hits); hits = [k for k in hits if abs(x[k]) >= K['keep'] * top]
def fir(cut, n=101):  # windowed-sinc low-pass
    t = np.arange(n) - (n - 1) / 2; h = np.sinc(2 * cut / r * t) * np.hamming(n); return h / h.sum()
def highpass(s, f):   # first-order
    a = 1 / (1 + 2 * np.pi * f / r); y = np.zeros_like(s); px = py = 0.0
    for i, v in enumerate(s): py = a * (py + v - px); px = v; y[i] = py
    return y
clips = []
for k in hits:
    a0, a1 = k - int(.003 * r), k + int(K['after'] * r)
    s = highpass(x[max(0, a0): a1].copy(), 40)
    n = len(s); fade = int(K['fade'] * r); s[n - fade:] *= np.linspace(1, 0, fade)
    seg = s[: int(.063 * r)]; S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), 8192)) ** 2; f = np.fft.rfftfreq(8192, 1 / r)
    b = (f > 40) & (f < 16000); tot = S[b].sum(); band = lambda lo, hi: round(float(100 * S[(f >= lo) & (f < hi)].sum() / tot))
    e = np.convolve(np.abs(s), np.ones(win) / win, mode='same'); p0 = int(.003 * r); e0 = e[p0]
    fall = lambda d: round(next((i for i, v in enumerate(e[p0:]) if v < e0 * 10 ** (-d / 20)), len(e) - p0) / r * 1000, 1)
    d = np.convolve(s, fir(10000), mode='same')[::2]
    q = np.round(np.clip(d, -1, 1) * 32767).astype('<i2')
    clips.append({'at': round(k / r, 3), 'peak': round(float(np.abs(s).max()), 3), 'centroid': round(float((f[b] * S[b]).sum() / tot)),
                  'dominant': round(float(f[b][np.argmax(S[b])])), 'low': band(40, 300), 'body': band(300, 1000), 'mid': band(1000, 3000), 'high': band(3000, 16000),
                  'fall20ms': fall(20), 'fall40ms': fall(40), 'data': base64.b64encode(q.tobytes()).decode()})
clips.sort(key=lambda c: c['peak'])
js = (f"// {K['name']} — real recordings cut by tools/sound-samples.py (do not edit by hand): {K['source']},\n"
      f"// {K['url']}. Used inside the game only, never on their own. 16-bit PCM at {r // 2} Hz, base64; softest first.\n"
      f"// Each with what it measures: energy shares (%) below 300 Hz, 300 Hz–1 kHz, 1–3 kHz, above 3 kHz over its first 60 ms.\n"
      f"const {K['name']}={{source:{json.dumps(K['source'])},url:{json.dumps(K['url'])},rate:{r // 2},clips:[\n" +
      ",\n".join(' {' + ','.join(f'{k}:{json.dumps(v)}' for k, v in c.items()) + '}' for c in clips) + "]};\n")
open(out, 'w').write(js)
for c in clips: print({k: v for k, v in c.items() if k != 'data'})
print(len(js), 'bytes written to', out)
