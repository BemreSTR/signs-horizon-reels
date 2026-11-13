"""E020 · That Bee Is a She: procedural sound (no voice), on the 120 BPM grid of src/e020/timeline.ts.
Root = the bee's wing-beat (~232 Hz = Bb3). Dry bright hits on every slam; hex wipes are a cascade of tile ticks; the verse is one rising
Bb–D–F note per feminine verb; the honest lens is nearly silent; the dive ends in a swallowed hit; the buzz grows back into frame 0 (loop).
Run from the repo root: PYTHONPATH=tools python3 tools/e020_audio.py   ->  timing/mix.wav   then: python3 tools/master.py E020 38.0"""
import os
import numpy as np
from scipy.signal import fftconvolve
from scipy.ndimage import maximum_filter1d, uniform_filter1d
import soundfile as sf
import pyloudnorm as pyln
from sfxlib import *

TOTAL = 38.0          # 35.0 s content + 3.0 s brand outro (1140 frames)
EP = 35.0
N = int(round(TOTAL * SR))
MIX = np.zeros((2, N)); REV = np.zeros((2, N))
R = np.random.default_rng(2020)

def put(sig, t, gain_db=0.0, pan=0.0, send=0.0):
    sig = np.asarray(sig)
    if sig.ndim == 1:
        sig = np.stack([sig * np.cos((pan + 1) * np.pi / 4), sig * np.sin((pan + 1) * np.pi / 4)])
    k = int(round(t * SR)); a, b = max(k, 0), min(k + sig.shape[1], N)
    if b <= a: return
    seg = sig[:, a - k:b - k] * db(gain_db)
    MIX[:, a:b] += seg
    if send: REV[:, a:b] += seg * send

tt = np.arange(N) / SR
def curve(points_db, floor=-90.0):
    """Piecewise-linear dB envelope over the whole track -> amplitude."""
    xs = [p[0] for p in points_db]; ys = [p[1] for p in points_db]
    return db(np.interp(tt, xs, ys, left=floor, right=floor))

# ---------------------------------------------------------------- generators
def buzz(dur, f0=232.0, harm=16, bright=1.0, seed=0, glide=None):
    """A wing-beat: stacked harmonics on a slowly wandering pitch + a little band noise. `glide` = (t_start, t_len, ratio) pitch rise."""
    r = np.random.default_rng(seed); n = int(dur * SR); t = np.arange(n) / SR
    wander = lp(r.standard_normal(n), 5, 1); wander /= np.abs(wander).max() + 1e-9
    f = f0 * (1 + 0.012 * np.sin(2 * np.pi * (2.6 + 0.3 * (seed % 3)) * t + seed) + 0.008 * np.sin(2 * np.pi * 6.3 * t) + 0.012 * wander)
    if glide: f = f * (1 + (glide[2] - 1) * smooth((t - glide[0]) / glide[1]))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.zeros(n)
    for h in range(1, harm + 1): x += np.sin(h * ph + 0.7 * h * h) / h ** 0.8 * (1.0 if h < 6 else bright)
    x = x / np.abs(x).max()
    flut = 0.82 + 0.18 * np.sin(2 * np.pi * 31 * t + seed)                        # flutter of the wing edge
    x = x * flut + 0.28 * bp(r.standard_normal(n), 600, 3200) * flut
    return norm(x)

def slam(size='mid'):
    """A dry hit for a text slam: 150-600 Hz body + 3 kHz+ crack, so a phone speaker still plays it."""
    n = int(0.5 * SR); t = np.arange(n) / SR
    k = {'big': (1.0, 1.0, 1.0), 'mid': (0.75, 0.9, 0.8), 'soft': (0.45, 0.8, 0.55)}[size]
    body = np.sin(2 * np.pi * (96 + 120 * np.exp(-t / 0.03)) * t) * np.exp(-t / (0.07 * k[0] + 0.03))
    knock = np.sin(2 * np.pi * 430 * t) * np.exp(-t / 0.028) * 0.5 + bp(R.standard_normal(n), 250, 900) * np.exp(-t / 0.02) * 0.9
    crack = hp(R.standard_normal(n), 3200) * np.exp(-t / 0.007) * 1.4 + hp(R.standard_normal(n), 6500) * np.exp(-t / 0.012) * 0.5
    x = 0.9 * k[0] * body + 0.8 * knock * k[1] + 0.7 * crack * k[2]
    x[:int(0.0008 * SR)] *= np.linspace(0, 1, int(0.0008 * SR))
    return norm(x)

def tock(f, tau=0.018):
    n = int(0.12 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / tau) + 0.5 * np.sin(2 * np.pi * f * 2.4 * t) * np.exp(-t / (tau * 0.5)) + 0.8 * hp(R.standard_normal(n), 2800) * np.exp(-t / 0.003)
    return norm(x)

def hexsfx(dur=0.4):
    """Tiles flip over: ticks thicken up to the cut (dur/2), then thin out."""
    n = int(dur * SR); out = np.zeros(n); half = dur / 2
    ts = np.concatenate([half * (1 - np.sort(R.uniform(0, 1, 16)) ** 1.6), half + half * np.sort(R.uniform(0, 1, 12)) ** 0.7])
    for i, te in enumerate(ts):
        s = tock(R.uniform(700, 2100), 0.016) * (0.45 + 0.55 * (1 - abs(te - half) / half))
        k = int(te * SR); m = min(len(s), n - k)
        if m > 0: out[k:k + m] += s[:m]
    out += 0.5 * sweep_noise(dur, 900, 6500, width=0.25, bands=10) * env_ar(n, dur * 0.4, dur * 0.4)
    return norm(out)

def drip(f=1500, dur=0.25):
    t = T_(dur); fr = f * np.exp(-t / 0.07) + 380
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.055)
    x[:int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return norm(x + 0.25 * hp(R.standard_normal(len(t)), 4000) * np.exp(-t / 0.006))

def kick():
    n = int(0.3 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * (52 + 90 * np.exp(-t / 0.025)) * t) * np.exp(-t / 0.09) + 0.4 * bp(R.standard_normal(n), 800, 3000) * np.exp(-t / 0.004)
    return norm(x)

# ---------------------------------------------------------------- 1. the wing-beat beds (each is one long layer with a slow dB envelope: no gating)
# close bee: hook (0-3), cut at the wipe; it returns at the very end and grows into frame 0 (loop)
close = buzz(TOTAL, 232.0, seed=1)
put(close * curve([(0, -15.0), (1.5, -12.5), (2.8, -12.0), (3.15, -50), (36.7, -50), (38.0, -15.0)]), 0.0, -8)
# swarm: four detuned bees over the meadow (3-6)
for j, (f0, pan) in enumerate([(205, -0.7), (221, -0.25), (247, 0.3), (263, 0.75)]):
    b = buzz(TOTAL, f0, harm=12, seed=10 + j)
    put(b * curve([(2.9, -90), (3.4, -23), (5.7, -22), (6.1, -90)]), 0.0, -8, pan=pan, send=0.15)
# the drone: lower, heavier (6-8.5)
dr = buzz(TOTAL, 158.0, harm=18, bright=1.3, seed=30)
put(dr * curve([(5.99, -90), (6.0, -13.0), (8.3, -13.0), (8.7, -90)]), 0.0, -8)
# the workers: a crowd hum on the comb (8.5-10.5)
for j, (f0, pan) in enumerate([(190, -0.8), (212, -0.4), (228, -0.1), (241, 0.2), (256, 0.5), (274, 0.8)]):
    b = buzz(TOTAL, f0, harm=10, seed=40 + j)
    put(b * curve([(8.4, -90), (8.7, -25.5), (10.2, -25.5), (10.9, -90)]), 0.0, -8, pan=pan, send=0.2)
comb = bp(R.standard_normal(N), 160, 900) * curve([(8.4, -90), (8.8, -33), (10.2, -33), (10.9, -90)])
put(comb, 0.0, -8, send=0.2)
# the lesson: the buzz grows back (30.5 -> 34) and rises in pitch as the camera falls into the cell (34 -> 34.8)
les = buzz(TOTAL, 232.0, seed=50, glide=(34.0, 0.8, 1.9))
put(les * curve([(30.4, -90), (31.0, -30), (33.0, -19), (34.0, -14), (34.78, -9), (34.82, -90)]), 0.0, -8)

# ---------------------------------------------------------------- 2. slams (dry, on the beat)
SL = [(0.0, 'big', -4), (0.5, 'mid', -7), (1.5, 'big', -4), (2.0, 'soft', -11), (3.5, 'mid', -8), (4.5, 'mid', -8), (6.0, 'big', -4), (7.0, 'mid', -7),
      (8.5, 'mid', -8), (9.5, 'mid', -8), (10.5, 'big', -6), (11.0, 'mid', -9), (11.5, 'mid', -9), (23.0, 'soft', -13), (24.5, 'soft', -13), (26.0, 'soft', -12),
      (28.5, 'mid', -10), (31.0, 'mid', -8), (32.0, 'mid', -8), (33.0, 'big', -4)]
for te, sz, g in SL:
    put(slam(sz), te, g + 2, pan=0.0, send=0.08 if sz != 'big' else 0.14)
put(boom(60, 38, 0.7, 1.2, 0.3), 0.0, -10, send=0.1)                              # "THAT": a low thump under the first hit
put(sparkles(0.6, 40, 8, 3200, 9500), 0.02, -24, send=0.3)
put(reverse_swell(0.5, 600, 7500), 1.0, -19, send=0.2)                            # lifts into "IS A SHE."
put(boom(58, 36, 0.9, 1.2, 0.3), 1.5, -9, send=0.15)
put(boom(52, 36, 0.5, 1.0, 0.2), 2.0, -16)                                         # a heartbeat on "SHE."
put(sparkles(1.0, 30, 6, 3000, 9000), 1.52, -28, send=0.4)
put(boom(70, 40, 0.6, 1.2, 0.3), 6.0, -8, send=0.15)                               # the drone pops in
put(whoosh(0.22, False, 400, 4200), 5.8, -26)

# ---------------------------------------------------------------- 3. momentum under the first ten seconds: soft kick on the beat, ticks on the off-beat
for k in range(int((10.5 - 3.0) / 1.0)):
    tk = 3.0 + k
    put(kick(), tk, -22, send=0.05)
    put(tock(1650, 0.01), tk + 0.5, -33, pan=0.3)
# a rising pluck line under the facts: Bb4 / D5 / F5 / D5
for te, nm in [(3.5, 'Bb4'), (4.5, 'D5'), (6.0, 'F5'), (7.0, 'Bb4'), (8.5, 'D5'), (9.5, 'F5')]:
    put(pluck(hz(nm), 1.4, 0.9, 0.5), te, -26, pan=-0.2, send=0.4)

# ---------------------------------------------------------------- 4. hex wipes (cut times 3.0, 10.5, 23.0, 28.0, 34.8)
for ct in (3.0, 10.5, 23.0, 28.0, 34.8):
    put(hexsfx(0.4), ct - 0.2, -18, send=0.15)
    put(whoosh(0.4, True, 300, 5200), ct - 0.2, -29)
    put(boom(80, 48, 0.25, 0.9, 0.3), ct - 0.02, -15)

# ---------------------------------------------------------------- 5. the question (10.5-14): hush, a low bell, hex lights
put(bell(hz('Bb3'), 4.2, (1, 2.0, 3.0, 4.2), (1, .5, .25, .1)), 10.5, -17, send=0.6)
put(pad([hz('Bb2'), hz('F3'), hz('D4')], 3.7, a=0.4, r=0.8, cutoff=1500), 10.5, -23, send=0.4)
for te in (10.9, 11.4, 12.2, 12.7, 13.3):
    put(pluck(hz(['F5', 'D5', 'Bb5', 'F5', 'D6'][int((te * 10) % 5)]), 1.2, 0.8, 0.35), te, -33, pan=R.uniform(-0.6, 0.6), send=0.6)
put(reverse_swell(0.5, 500, 6000), 13.5, -24, send=0.2)

# ---------------------------------------------------------------- 6. the verse (14-23): one rising note per feminine verb, then a soft ding on the label
put(pad([hz('Bb2'), hz('F3'), hz('D4'), hz('F4')], 9.2, a=0.6, r=1.0, cutoff=1600), 14.0, -25, send=0.45)
for te, nm, up, dg in [(14.0, 'Bb4', 'D6', 15.0), (17.0, 'D5', 'F6', 18.0), (20.0, 'F5', 'Bb6', 21.0)]:
    put(pluck(hz(nm), 2.2, 0.95, 0.8), te + 0.12, -15, pan=-0.15, send=0.5)       # the verb word is revealed ~0.12 s after the phrase starts
    put(bell(hz(nm), 2.6, (1, 2.0, 3.0, 4.2), (1, .35, .15, .06)), te + 0.12, -25, pan=0.1, send=0.6)
    put(slam('soft'), te, -17)
    put(whoosh(0.3, True, 500, 5000), te - 0.25, -30)
    put(bell(hz(up), 1.8, (1, 2.76, 5.4), (1, .3, .1)), dg, -27, pan=0.25, send=0.6)
    put(tock(1100, 0.02), dg, -26)
put(choir(4.0, [hz('Bb3'), hz('F4'), hz('D5')], a=1.2, r=2.0), 20.0, -29, send=0.5)

# ---------------------------------------------------------------- 7. the honest lens (23-28): almost nothing
put(pad([hz('Bb2'), hz('F3'), hz('D4')], 5.2, a=0.8, r=1.2, cutoff=1500), 23.0, -25, send=0.4)
put(bell(hz('Bb3'), 3.4, (1, 2.0, 3.0), (1, .3, .1)), 26.0, -19, send=0.6)         # "WE CLAIM NOTHING MORE."
put(hush(0.9), 22.4, -31, send=0.3)

# ---------------------------------------------------------------- 8. honey (28-31): the warm drop
put(boom(54, 36, 1.4, 1.2, 0.2), 28.0, -9, send=0.2)
put(pad([hz('Bb2'), hz('D3'), hz('F3'), hz('A3')], 3.4, a=0.35, r=0.8, cutoff=1900), 28.0, -21, send=0.5)
put(choir(3.0, [hz('Bb3'), hz('D4'), hz('F4')], a=0.5, r=1.6), 28.0, -26, send=0.5)
for te, f in [(28.35, 1700), (29.0, 1450), (29.55, 1600), (30.1, 1350), (30.6, 1500)]:
    put(drip(f), te, -21, pan=R.uniform(-0.2, 0.3), send=0.45)
put(bell(hz('D5'), 3.0, (1, 2.76, 5.4), (1, .3, .1)), 28.5, -22, send=0.6)

# ---------------------------------------------------------------- 9. the lesson (31-34.8) and the dive
put(pad([hz('Bb2'), hz('F3'), hz('D4')], 3.0, a=0.4, r=0.6, cutoff=1800), 31.0, -26, send=0.4)
put(bell(hz('Bb5'), 3.0, (1, 2.0, 3.0), (1, .3, .1)), 33.0, -19, send=0.6)         # "YOU."
put(boom(56, 36, 1.2, 1.2, 0.3), 33.0, -8, send=0.2)
put(reverse_swell(0.8, 250, 7500), 34.0, -17, send=0.15)
put(whoosh(0.8, True, 220, 5200), 34.0, -21)
put(boom(60, 34, 0.8, 1.3, 0.4), 34.8, -6, send=0.2)                                # swallowed by the cell
put(slam('big'), 34.8, -8)

# ---------------------------------------------------------------- 10. brand sting (35-38), then the buzz grows into frame 0
put(whoosh(0.7, True, 250, 3600), EP + 0.08, -19, send=0.2)
put(reverse_swell(1.6, 300, 6000), EP + 0.86 - 1.6, -21, send=0.2)
put(boom(60, 36, 1.4, 1.2, 0.3), EP + 0.83, -10, send=0.25)
put(shimmer(2.3, 2200, 7600, a=0.05, r=1.7), EP + 0.84, -22, send=0.45)
put(pad([hz('Bb2'), hz('F3'), hz('Bb3')], 2.0, a=0.7, r=1.1), EP + 1.02, -19, send=0.3)
put(shimmer(1.2, 3000, 8000, a=0.05, r=0.9), EP + 1.9, -28, send=0.4)
put(reverse_swell(0.95, 400, 6500), 37.05, -24, send=0.2)                          # leads into the first hit

# ================================================================ MIX
def ir(sec=2.4):
    n = int(sec * SR); t = np.arange(n) / SR
    Lc = lp(R.standard_normal(n) * np.exp(-t / 0.5), 5500); Rc = lp(R.standard_normal(n) * np.exp(-t / 0.5), 5500)
    pre = int(0.02 * SR); Lc = np.concatenate([np.zeros(pre), Lc])[:n]; Rc = np.concatenate([np.zeros(pre), Rc])[:n]
    return np.stack([Lc, Rc]) / np.sqrt(n) * 3.0
I = ir()
mix = MIX + np.stack([fftconvolve(REV[c], I[c])[:N] for c in range(2)])
mix = np.stack([hp(mix[c], 30, 2) for c in range(2)])
m0 = pyln.Meter(SR); mix = mix * db(-14.5 - m0.integrated_loudness(mix.T))
pk = np.abs(mix).max(0); win = int(0.005 * SR)
mix = mix * np.minimum(1, db(-1.6) / np.maximum(uniform_filter1d(maximum_filter1d(pk, win), win), 1e-9))[None, :]
f = int(0.004 * SR); mix[:, :f] *= np.linspace(0, 1, f); mix[:, -f:] *= np.linspace(1, 0, f)   # tiny edge fades only: the loop point must stay clean
os.makedirs('timing', exist_ok=True)
sf.write('timing/mix.wav', mix.T.astype(np.float32), SR, subtype='FLOAT')
m = pyln.Meter(SR)
print('mix LUFS', round(m.integrated_loudness(mix.T), 1), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 1))
mono = mix.mean(0)
print('rms per 2 s:', [int(round(20 * np.log10(np.sqrt((mono[int(a * SR):int((a + 2) * SR)] ** 2).mean()) + 1e-9))) for a in np.arange(0, TOTAL - 2 + 1e-6, 2)])
