"""E016 · The Pomegranate Problem: music + sound design (no narration). Everything is synthesised and tied to the
100 BPM grid of src/e016/timeline.ts. Output: timing/mix.wav (then: python3 tools/master.py E016 49.8)."""
import numpy as np
from scipy.signal import fftconvolve
import soundfile as sf
import pyloudnorm as pyln
from sfxlib import *
from sfxlib import _sos

BEAT = 0.6
EP = 46.8
TOTAL = 49.8
N = int(round(TOTAL * SR))
T = dict(slam=1.2, hookOut=3.0, crack=4.2, open=4.8, dive=5.4, tree=7.2, fruits=10.2, spring=17.4, turn=24.0, lightsOut=25.8,
         sprout=27.6, flood=33.0, world=34.2, quote=35.4, verse=40.8, home=45.6)
NF = 144                                              # fruits on the tree (src/e016/tree.ts)

MIX = np.zeros((2, N)); REV = np.zeros((2, N))
def put(sig, t, gain_db=0.0, pan=0.0, send=0.0):
    sig = np.asarray(sig)
    if sig.ndim == 1:
        sig = np.stack([sig * np.cos((pan + 1) * np.pi / 4), sig * np.sin((pan + 1) * np.pi / 4)])
    k = int(round(t * SR)); a, b = max(k, 0), min(k + sig.shape[1], N)
    if b <= a: return
    seg = sig[:, a - k:b - k] * db(gain_db)
    MIX[:, a:b] += seg
    if send: REV[:, a:b] += seg * send

# ---------------------------------------------------------------- instruments
NOTE = {'C': 0, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'Bb': 10}
def hz(name):
    n, o = name[:-1], int(name[-1]); return 440.0 * 2 ** ((NOTE[n] - 9) / 12 + (o - 4))

def pluck(f, dur=1.6, bright=1.0, decay=0.55):
    """Soft mallet / harp: a few harmonics with faster decay up the series, plus a felt attack."""
    t = T_(dur); x = np.zeros(len(t))
    for h, a in ((1, 1.0), (2, 0.42 * bright), (3, 0.2 * bright), (4, 0.1 * bright), (5.4, 0.05 * bright)):
        x += a * np.sin(2 * np.pi * f * h * t) * np.exp(-t / (decay / h ** 0.8))
    m = int(0.012 * SR); x[:m] += 0.25 * bp(rng.standard_normal(m), 800, 5000) * np.exp(-np.arange(m) / SR / 0.004)
    x[:int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return norm(x)

def T_(d): return np.arange(int(d * SR)) / SR

def pad(notes, dur, a=1.2, r=1.6, cutoff=1600):
    """Warm string pad: detuned stacked harmonics, low-passed, slow attack. Stereo."""
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros((2, n))
    for ni, f0 in enumerate(notes):
        for vi, cents in enumerate((-9, 0, 8)):
            f = f0 * 2 ** (cents / 1200) * (1 + 0.002 * np.sin(2 * np.pi * (4.6 + 0.4 * vi) * t + ni))
            ph = 2 * np.pi * np.cumsum(f) / SR; v = np.zeros(n)
            for h in range(1, 9): v += np.sin(h * ph + 1.3 * h + ni) / h ** 1.5
            pan = (vi - 1) * 0.6 + (ni % 3 - 1) * 0.15
            out[0] += v * np.cos((np.clip(pan, -1, 1) + 1) * np.pi / 4); out[1] += v * np.sin((np.clip(pan, -1, 1) + 1) * np.pi / 4)
    out = np.stack([lp(out[c], cutoff, 2) for c in range(2)])
    return norm(out) * env_ar(n, a, r)

def glide(f0, f1, dur, shape=1.0):
    t = T_(dur); u = t / dur; f = f0 * (f1 / f0) ** (u ** shape)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ar(len(t), 0.02, dur * 0.5)

def zap():
    n = int(0.05 * SR); t = np.arange(n) / SR
    return norm(bp(rng.standard_normal(n), 2200, 6500) * np.exp(-t / 0.011))

# ---------------------------------------------------------------- 0. bed: periodic, so the loop seam is silent (H34/H77)
tt = np.arange(N) / SR
per = lambda f, ph=0.0: np.sin(2 * np.pi * (round(f * TOTAL) / TOTAL) * tt + ph)
lfo = lambda k, ph=0.0: 0.5 + 0.5 * np.sin(2 * np.pi * k / TOTAL * tt + ph)
bed = per(36.71) * (0.75 + 0.25 * lfo(3)) + 0.7 * per(55.0, 1.0) * (0.7 + 0.3 * lfo(5, 2)) + 0.45 * per(73.42, 2.0) * (0.6 + 0.4 * lfo(4, 1)) \
    + 0.3 * per(146.83, 0.3) * lfo(6, 5) + 0.22 * per(220.0, 1.1) * lfo(8, 2)
air = lp(pink(N, 100, 3000), 1800) * (0.5 + 0.5 * lfo(9, 1))
bed = norm(np.tanh(1.2 * bed)) * 0.85 + norm(air) * 0.25
bed_db = np.interp(tt, [0, 7.2, 8.5, 23.9, 24.0, 27.6, 34.2, 35.4, 40.8, EP, EP + 0.5, 48.6, TOTAL - 0.08, TOTAL],
                   [0, 0, -4, -4, 2, 3, 5, -2, -3, -1, -8, -8, 0, 0])
MIX += (bed * db(bed_db) * db(-24.0))[None, :]

# ---------------------------------------------------------------- 1. hook (0–3): the price reel, the slam
put(boom(60, 34, 1.1, 1.3), 0.0, -11)
for i, nm in enumerate(('D4', 'F4', 'A4', 'C5', 'D5', 'F5')):            # A COIN … AN EMPIRE: one rising note per price
    put(pluck(hz(nm), 0.9, 1.3), i * 0.2, -19 + i, pan=-0.4 + 0.16 * i, send=0.25)
    put(tick(i % 2), i * 0.2, -24)
put(reverse_swell(1.05, 400, 7000), 0.13, -21, send=0.2)
put(boom(76, 31, 2.4, 1.8, 0.8), T['slam'] - 0.02, -8, send=0.15)        # THE WHOLE WORLD
put(bell(hz('D3'), 3.4, (1, 2.0, 3.0, 4.2), (1, .5, .25, .1)), T['slam'], -15, send=0.5)
put(bell(hz('A4'), 2.6), T['slam'], -22, pan=0.3, send=0.6)
put(sparkles(1.8, 30, 3), T['slam'] + 0.04, -24, pan=-0.2, send=0.5)
put(shimmer(2.2, 2200, 7500, a=0.05, r=1.7), T['slam'] + 0.04, -26, send=0.4)

# ---------------------------------------------------------------- 2. the claim, the opening, the dive (3–7.2)
put(pad([hz('D2'), hz('A2'), hz('D3'), hz('F3')], 4.6, a=1.2, r=0.5), 2.9, -21, send=0.3)
put(pluck(hz('D4'), 1.8), 3.5, -18, pan=-0.2, send=0.4)
put(pluck(hz('A4'), 2.0), 3.65, -16, pan=0.2, send=0.4)                  # SAID NURSI.
put(wax_crack(), T['crack'], -13, send=0.3)
put(sparkles(1.9, 6, 26, 3000, 9000), T['open'], -25, send=0.5)           # the arils catch the light
put(crackle(1.5, lambda t: 8 + 14 * t, 6500), T['open'], -27)
put(pluck(hz('F4'), 1.6), 5.4, -19, pan=-0.2, send=0.4)
put(pluck(hz('G4'), 1.6), 5.5 + 0.3, -19, pan=0.2, send=0.4)
dv = accel_travel(T['tree'] - T['dive'] + 0.05, 3.0, 30.0)
put(dv, T['dive'], -15, send=0.1)                                         # into one aril
put(reverse_swell(1.5, 300, 7000), T['tree'] - 1.5, -17, send=0.25)
put(boom(58, 36, 1.6, 1.1, 0.25), T['tree'], -9, send=0.2)                # the gold flash
put(shimmer(2.6, 1800, 7000, a=0.03, r=2.1), T['tree'], -20, send=0.5)

# ---------------------------------------------------------------- 3. one centre (7.2–17.4) and the whole spring (17.4–24)
CH = {'Dm': ['D2', 'A2', 'D3', 'F3', 'A3'], 'Bb': ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 'F': ['F2', 'C3', 'F3', 'A3', 'C4'], 'C': ['C2', 'G2', 'C3', 'E3', 'G3']}
ARP = {'Dm': ['D3', 'A3', 'D4', 'F4', 'A4'], 'Bb': ['Bb2', 'F3', 'Bb3', 'D4', 'F4'], 'F': ['F3', 'C4', 'F4', 'A4', 'C5'], 'C': ['C3', 'G3', 'C4', 'E4', 'G4']}
PROG = [(7.2, 'Dm'), (9.6, 'Bb'), (12.0, 'F'), (14.4, 'C'), (16.8, 'Dm'), (19.2, 'Bb'), (21.6, 'F')]
for i, (t0, ch) in enumerate(PROG):
    t1 = PROG[i + 1][0] if i + 1 < len(PROG) else T['turn']
    put(pad([hz(n) for n in CH[ch]], t1 - t0 + 0.5, a=0.5, r=0.55 if t1 < T['turn'] else 0.08), t0 - 0.05, -18.5 if t0 < T['spring'] else -17, send=0.35)
    put(pluck(hz(CH[ch][0]) , 2.6, 0.6, 1.2), t0, -15, send=0.1)          # bass note
    step = 0.3 if t0 < 16.8 else 0.6
    pat = [0, 1, 2, 3, 4, 3, 2, 1]
    k = 0; t = t0 + (0.3 if i == 0 else 0)
    while t < t1 - 0.01:
        if t < T['turn'] - 0.2:
            cres = -22 + 6 * smooth((t - 7.2) / 5.0) - (3 if t0 >= 16.8 else 0)
            nm = ARP[ch][pat[k % 8]]
            f = hz(nm) * (2 if t0 >= 16.8 else 1)
            put(pluck(f, 1.4, 1.0, 0.5), t, cres, pan=0.5 * np.sin(k * 1.7), send=0.45)
        t += step; k += 1
t = 9.6
while t < T['spring'] - 0.3:                                               # the pulse that climbs from the root (every 2 beats)
    put(boom(62, 44, 0.5, 0.9, 0.15), t, -20)
    put(glide(220, 880, 0.75, 0.8), t, -27, send=0.5)
    t += 2 * BEAT
for o in range(NF):                                                        # every fruit: one small bright note, accelerating
    tp = T['fruits'] + 5.2 * np.sqrt(o / NF)
    nm = ['D5', 'F5', 'G5', 'A5', 'C6', 'D6'][int(rng.integers(0, 6))]
    put(pluck(hz(nm), 0.5, 0.7, 0.16), tp, -27 + 3 * (o / NF), pan=float(rng.uniform(-0.7, 0.7)), send=0.5)
put(whoosh(2.3, False, 180, 3600), T['spring'] - 0.1, -17, send=0.3)       # pulling back to the earth
put(sparkles(4.2, 14, 40, 2800, 9500, 0.05), 18.4, -27, send=0.6)          # the wave of spring lights
put(shimmer(4.6, 1600, 6000, a=1.5, r=1.6), 18.6, -27, send=0.5)

# ---------------------------------------------------------------- 4. remove the One (24–35.4)
put(boom(70, 30, 2.2, 1.6, 0.6), T['turn'], -9, send=0.15)
put(hush(1.0), T['turn'], -22, send=0.3)
for k_, tb in enumerate((24.6, 25.2)):
    put(heartbeat(), tb, -12 - k_)
put(glide(420, 55, 1.3, 0.7), T['lightsOut'], -18, send=0.2)               # the power goes out, from the root upward
put(whoosh(1.2, False, 200, 3000), T['lightsOut'], -19)
put(pad([hz('D2'), hz('Eb2'), hz('A2')], T['world'] - 26.4, a=5.0, r=0.06, cutoff=900), 26.4, -15, send=0.2)   # unease, growing
put(wax_crack(), T['sprout'], -12, send=0.3)                               # the first fruit grows a tree of its own
put(pluck(hz('Eb4'), 2.2, 1.2), T['sprout'] + 0.02, -14, send=0.5)
for i in range(1, NF):
    ts = T['sprout'] + 4.5 * np.log(1 + i) / np.log(NF)
    g = -25 + 6 * (i / NF)
    put(zap(), ts, g, pan=float(rng.uniform(-0.8, 0.8)), send=0.2)
    if i < 12: put(pluck(hz(['Eb4', 'D4', 'A4', 'Bb4'][i % 4]), 1.0, 1.2, 0.3), ts, -20, pan=float(rng.uniform(-0.5, 0.5)), send=0.4)
ris = accel_travel(T['world'] - 28.8, 2.2, 38.0)
put(ris, 28.8, -9.5, send=0.1)
put(reverse_swell(2.4, 250, 7000), T['world'] - 2.4, -13, send=0.2)
put(crackle(1.25, lambda t: 30 + 60 * t, 7000), T['flood'], -17)
for i, nm in enumerate(('A4', 'C5', 'Eb5')):                               # AN ORCHARD · A FOREST · A SPRING
    put(pluck(hz(nm), 0.8, 1.5), T['flood'] + 0.4 * i, -11, send=0.3)
    put(boom(66, 40, 0.5, 1.0, 0.4), T['flood'] + 0.4 * i, -13)
put(boom(80, 28, 3.0, 1.9, 0.9), T['world'] - 0.02, -5, send=0.2)        # THE WHOLE WORLD
put(norm(bp(rng.standard_normal(int(0.5 * SR)), 300, 6000) * np.exp(-T_(0.5) / 0.09)), T['world'], -9, send=0.4)
put(bell(hz('D3'), 3.6, (1, 2.0, 3.0, 4.2), (1, .5, .25, .1)), T['world'], -12, send=0.6)
put(hush(1.2), T['world'] + 0.25, -18, send=0.4)

# ---------------------------------------------------------------- 5. the sentence (35.4–41.4)
put(pad([hz('D3'), hz('A3'), hz('D4')], 6.0, a=1.6, r=1.6, cutoff=1200), 35.3, -22, send=0.4)
for tq, nm, g in ((35.6, 'A3', -22), (36.4, 'D4', -19), (36.9, 'F4', -19), (37.4, 'A4', -19), (37.9, 'D5', -16)):
    put(pluck(hz(nm), 3.0, 0.8, 1.3), tq, g, pan=0.0, send=0.55)
put(shimmer(2.4, 2400, 7000, a=0.1, r=1.8), 37.9, -25, send=0.5)           # "the whole world."

# ---------------------------------------------------------------- 6. the verse (41.4–46.8): open fifth, nothing percussive
put(pad([hz('D2'), hz('A2'), hz('D3'), hz('A3')], 6.8, a=1.4, r=1.8, cutoff=1400), 40.6, -19, send=0.45)
put(bell(hz('D4'), 3.6, (1, 2.0, 3.0), (1, .3, .1)), T['verse'] + 0.2, -22, send=0.6)
put(shimmer(1.6, 2200, 6500, a=0.5, r=0.9), T['verse'] + 0.2, -28, pan=0.25, send=0.4)
put(shimmer(1.6, 1800, 5600, a=0.5, r=0.9), T['verse'] + 0.9, -29, pan=-0.25, send=0.4)
put(pluck(hz('A4'), 3.0, 0.7, 1.4), T['verse'] + 1.5, -21, send=0.6)

# ---------------------------------------------------------------- 7. brand sting (46.8–49.8), then the loop
put(whoosh(0.7, True, 250, 3600), EP + 0.08, -19, send=0.2)
put(reverse_swell(1.6, 300, 6000), EP + 0.86 - 1.6, -21, send=0.2)
put(boom(60, 36, 1.4, 1.2, 0.3), EP + 0.83, -10, send=0.25)
put(shimmer(2.3, 2200, 7600, a=0.05, r=1.7), EP + 0.84, -22, send=0.45)
put(pad([hz('D2'), hz('A2'), hz('D3')], 2.0, a=0.7, r=1.1), EP + 1.02, -19, send=0.3)
put(shimmer(1.2, 3000, 8000, a=0.05, r=0.9), EP + 1.9, -28, send=0.4)

# ---------------------------------------------------------------- mix
def ir(sec=2.8):
    n = int(sec * SR); t = np.arange(n) / SR
    L = lp(rng.standard_normal(n) * np.exp(-t / 0.6), 5200); R = lp(rng.standard_normal(n) * np.exp(-t / 0.6), 5200)
    pre = int(0.024 * SR); L = np.concatenate([np.zeros(pre), L])[:n]; R = np.concatenate([np.zeros(pre), R])[:n]
    return np.stack([L, R]) / np.sqrt(n) * 3.0
I = ir()
mix = MIX + np.stack([fftconvolve(REV[c], I[c])[:N] for c in range(2)])
mix = np.stack([hp(mix[c], 28, 2) for c in range(2)])
m0 = pyln.Meter(SR); mix = mix * db(-14.5 - m0.integrated_loudness(mix.T))   # bring the music up to level …
from scipy.ndimage import maximum_filter1d, uniform_filter1d
pk = np.abs(mix).max(0); win = int(0.005 * SR)
mix = mix * np.minimum(1, db(-1.6) / np.maximum(uniform_filter1d(maximum_filter1d(pk, win), win), 1e-9))[None, :]   # … and hold the slams under -1.6 dBFS
f = int(0.03 * SR); mix[:, :f] *= np.linspace(0, 1, f); mix[:, -f:] *= np.linspace(1, 0, f)
import os; os.makedirs('timing', exist_ok=True)
sf.write('timing/mix.wav', mix.T.astype(np.float32), SR, subtype='FLOAT')
m = pyln.Meter(SR)
print('mix LUFS', round(m.integrated_loudness(mix.T), 1), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 1))
mono = mix.mean(0)
print('rms per 2.4 s:', [int(round(20 * np.log10(np.sqrt((mono[int(a * SR):int((a + 2.4) * SR)] ** 2).mean()) + 1e-9))) for a in np.arange(0, 49.0, 2.4)])
