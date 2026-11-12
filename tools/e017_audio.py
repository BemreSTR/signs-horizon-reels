"""E017 · The Two Rats: music + sound design (no narration), on the 100 BPM grid of src/e017/timeline.ts.
The rats' gnawing is the clock: the white rat (day) ticks high and left, the black rat (night) low and right.
Output: timing/mix.wav (then: python3 tools/master.py E017 60)."""
import os
import numpy as np
from scipy.signal import fftconvolve
from scipy.ndimage import maximum_filter1d, uniform_filter1d
import soundfile as sf
import pyloudnorm as pyln
from sfxlib import *
from sfxlib import _sos

BEAT = 0.6
EP = 57.0
TOTAL = 60.0
N = int(round(TOTAL * SR))
T = dict(hookOut=3.0, wide=3.0, lion=9.0, dragon=12.0, rats=15.0, white=18.6, black=21.0, map=24.0, mapLion=26.4, mapDragon=28.2, mapYou=30.6,
         faster=32.4, stop=37.8, terror=40.2, again=42.0, horse=43.8, door=45.6, verse=48.0, home=55.8)

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

tt = np.arange(N) / SR

# ---------------------------------------------------------------- the day/night schedule (mirrors timeline.ts)
FLIPS = [(0.0, 1), (12.0, 0), (15.0, 1), (16.2, 0), (17.4, 1), (21.0, 0), (23.4, 1), (24.6, 0), (25.8, 1), (27.0, 0), (28.2, 1), (29.4, 0), (30.6, 1), (31.8, 0)]
t_, s_ = T['faster'], 1
for d_ in [0.6, 0.6, 0.5, 0.5, 0.45, 0.4, 0.4, 0.35, 0.35, 0.3, 0.3, 0.3]:
    FLIPS.append((t_, s_)); s_ = 1 - s_; t_ += d_
day = np.zeros(N); night = np.zeros(N)
for i, (t0, s) in enumerate(FLIPS):
    t1 = FLIPS[i + 1][0] if i + 1 < len(FLIPS) else T['stop']
    (day if s else night)[int(t0 * SR):int(t1 * SR)] = 1
day[int(T['again'] * SR):] = 1                                          # after "the other looked again": day, through the loop
sm = int(0.02 * SR)
day = uniform_filter1d(day, sm); night = uniform_filter1d(night, sm)

def gnaw(bright):
    """A rat at a root: ~10 scratchy bites a second, for the whole piece (gated by day/night afterwards)."""
    x = np.zeros(N); t = 0.0
    lo_, hi_ = (2200, 6200) if bright else (650, 2300)
    while t < TOTAL - 0.1:
        m = int(0.045 * SR); e = np.exp(-np.arange(m) / SR / (0.011 if bright else 0.016))
        k = int(t * SR); x[k:k + m] += (bp(rng.standard_normal(m), lo_, hi_) * e * rng.uniform(0.45, 1.0))[:max(0, N - k)]
        t += 0.1 * rng.uniform(0.82, 1.18)
    return norm(x)
glev = np.interp(tt, [0, 3.0, 3.6, 14.6, 15.2, 23.6, 24.2, 32.0, 32.6, 37.8, 42.0, 43.0, 47.8, 48.6, 55.6, 56.4, 57.0, 57.4, 59.0, 59.9, 60],
                 [-15, -15, -25, -25, -20, -20, -24, -24, -18, -17, -30, -28, -28, -60, -60, -22, -22, -30, -30, -15, -15])
put(np.stack([gnaw(True) * day * db(glev) * c for c in (0.86, 0.5)]), 0.0, 0)        # white rat: left
put(np.stack([gnaw(False) * night * db(glev + 2) * c for c in (0.5, 0.86)]), 0.0, 0)  # black rat: right
for i, (t0, s) in enumerate(FLIPS[2:]):                                               # each change of shift is a tick … or a tock
    lvl = -17 if t0 < T['faster'] else -13
    put(tick(0) if s else tick(1), t0, lvl, pan=-0.4 if s else 0.4, send=0.3)
    put(pluck(hz('A4') if s else hz('D3'), 0.5, 0.8, 0.18), t0, lvl - 4, pan=-0.4 if s else 0.4, send=0.3)

# ---------------------------------------------------------------- bed (periodic over the 60 s loop)
per = lambda f, ph=0.0: np.sin(2 * np.pi * (round(f * TOTAL) / TOTAL) * tt + ph)
lfo = lambda k, ph=0.0: 0.5 + 0.5 * np.sin(2 * np.pi * k / TOTAL * tt + ph)
bed = per(36.71) * (0.75 + 0.25 * lfo(3)) + 0.7 * per(55.0, 1.0) * (0.7 + 0.3 * lfo(5, 2)) + 0.45 * per(73.42, 2.0) * (0.6 + 0.4 * lfo(4, 1)) \
    + 0.3 * per(146.83, 0.3) * lfo(6, 5) + 0.2 * per(220.0, 1.1) * lfo(8, 2)
air = lp(pink(N, 100, 3000), 1800) * (0.5 + 0.5 * lfo(9, 1))
bed = norm(np.tanh(1.2 * bed)) * 0.85 + norm(air) * 0.25
bed_db = np.interp(tt, [0, 3, 9, 15, 32.4, 37.7, 37.9, 40.2, 42.0, 48, EP, EP + 0.5, 58.8, TOTAL - 0.08, TOTAL], [0, 0, 2, -1, 1, 4, -6, 2, -4, -4, -2, -8, -8, 0, 0])
MIX += (bed * db(bed_db) * db(-24.0))[None, :]

# ---------------------------------------------------------------- generators particular to this episode
def growl(dur, f=62.0):
    t = T_(dur); ph = 2 * np.pi * np.cumsum(f * (1 + 0.05 * np.sin(2 * np.pi * 3 * t))) / SR
    x = sum(np.sin(h * ph) / h for h in range(1, 14)) * (0.55 + 0.45 * np.sin(2 * np.pi * 27 * t) ** 2)
    x = lp(x, 520, 2) + 0.25 * bp(rng.standard_normal(len(t)), 180, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 27 * t) ** 2)
    return norm(x * env_ar(len(t), 0.25, dur * 0.45))
def hiss(dur):
    n = int(dur * SR); return norm(bp(rng.standard_normal(n), 2600, 7500) * env_ar(n, dur * 0.3, dur * 0.5))
def creak(dur=0.9):
    t = T_(dur); f = 96 - 22 * (t / dur); ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(h * ph) / h for h in range(1, 20)) * (np.sin(2 * np.pi * 13 * t) > 0.2)
    return norm(bp(x, 220, 1500) * env_ar(len(t), 0.05, 0.3))
# ---------------------------------------------------------------- 1. hook (0–3): two rats are eating your life
put(boom(60, 34, 1.1, 1.3), 0.0, -7)
put(bell(hz('D3'), 3.0, (1, 2.0, 3.0, 4.2), (1, .5, .25, .1)), 0.0, -12, send=0.5)
put(pad([hz('D2'), hz('A2'), hz('D3')], 3.6, a=0.6, r=0.8, cutoff=1000), 0.0, -21, send=0.3)
put(shimmer(2.0, 2200, 7000, a=0.05, r=1.6), 0.02, -27, send=0.4)

# ---------------------------------------------------------------- 2. the well (3–9)
put(whoosh(2.3, False, 180, 3400), T['wide'] - 0.05, -17, send=0.3)
wl = wind(34.8, 140, 700)
put(wl * env_ar(len(wl), 2.0, 0.3), 3.0, -27)
for td, f_ in ((5.0, 1500), (6.7, 1250), (8.1, 1700), (10.9, 1350), (14.2, 1600), (17.0, 1300), (22.6, 1500), (25.3, 1200), (29.9, 1650), (39.2, 1400)):
    put(norm(glide(f_, f_ * 0.62, 0.11, 1.0)), td, -24, pan=float(rng.uniform(-0.5, 0.5)), send=0.9)   # a drop, far down
put(pluck(hz('D4'), 2.0), 3.7, -18, pan=-0.2, send=0.5)
put(pluck(hz('F4'), 2.0), 4.0, -18, pan=0.2, send=0.5)
put(pad([hz('D2'), hz('A2'), hz('D3'), hz('F3')], 5.8, a=1.5, r=1.0), 3.2, -22, send=0.3)

# ---------------------------------------------------------------- 3. above a lion, below a dragon (9–15)
put(boom(72, 32, 2.0, 1.6, 0.6), T['lion'], -8, send=0.15)
put(growl(2.4), T['lion'] + 0.05, -12, pan=0.3, send=0.2)
put(boom(60, 28, 2.6, 1.7, 0.6), T['dragon'], -7, send=0.15)
put(growl(2.6, 44.0), T['dragon'] + 0.05, -12, send=0.2)
put(hiss(2.4), T['dragon'] + 0.1, -21, send=0.3)
put(crackle(2.4, lambda t: 10 + 12 * t, 6000), T['dragon'] + 0.2, -26)

# ---------------------------------------------------------------- 4. the two rats never stop; the white is the day, the black is the night (15–24)
CH = {'Dm': ['D2', 'A2', 'D3', 'F3', 'A3'], 'Bb': ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 'Gm': ['G1', 'D2', 'G2', 'Bb2', 'D3'], 'A': ['A1', 'E2', 'A2', 'C#3', 'E3'], 'D': ['D2', 'A2', 'D3', 'F#3', 'A3']}
PROG = [(15.0, 'Dm'), (19.8, 'Bb'), (24.0, 'Dm'), (26.4, 'Bb'), (28.2, 'Gm'), (30.6, 'A'), (32.4, 'A'), (35.4, 'A')]
for i, (t0, ch) in enumerate(PROG):
    t1 = PROG[i + 1][0] if i + 1 < len(PROG) else T['stop']
    put(pad([hz(n) for n in CH[ch]], t1 - t0 + 0.5, a=0.5, r=0.5 if t1 < T['stop'] else 0.05, cutoff=1300), t0 - 0.05, -20 if t0 < T['faster'] else -18, send=0.3)
    put(pluck(hz(CH[ch][0]), 2.6, 0.6, 1.2), t0, -15, send=0.1)
    t = t0
    k = 0
    while t < t1 - 0.01:                                                              # a slow three-note ostinato: one note per beat
        nm = CH[ch][[2, 3, 4][k % 3]]
        put(pluck(hz(nm) * 2, 1.2, 0.9, 0.45), t, -23 + (4 if t0 >= T['faster'] else 0), pan=0.4 * np.sin(k * 2.1), send=0.45)
        t += BEAT; k += 1
put(bell(hz('A4'), 2.4), T['white'] + 0.15, -18, pan=-0.3, send=0.6)                # … is the day
put(shimmer(1.8, 2400, 7200, a=0.05, r=1.4), T['white'] + 0.15, -26, send=0.4)
put(bell(hz('D3'), 3.0, (1, 2.0, 3.0, 4.2), (1, .5, .25, .1)), T['black'] + 0.15, -15, pan=0.3, send=0.6)   # … is the night
put(boom(52, 34, 1.4, 1.1, 0.2), T['black'] + 0.15, -15)

# ---------------------------------------------------------------- 5. what everything is (24–32.4)
for tm, nm, low, g in ((T['map'], 'D4', False, -15), (T['mapLion'], 'A3', True, -13), (T['mapDragon'], 'G3', True, -13), (T['mapYou'], 'D5', False, -12)):
    put(pluck(hz(nm), 2.4, 1.0, 0.9), tm + 0.15, g, send=0.5)
    put(boom(64 if low else 58, 32 if low else 40, 1.6 if low else 0.8, 1.4, 0.4), tm + 0.15, -12 if low else -16, send=0.15)
put(growl(1.5), T['mapLion'] + 0.2, -17, pan=0.3, send=0.2)
put(hiss(1.8), T['mapDragon'] + 0.2, -24, send=0.3)
put(shimmer(2.0, 2400, 7600, a=0.05, r=1.6), T['mapYou'] + 0.15, -22, send=0.5)       # YOU.
for k_ in range(3): put(heartbeat(), T['mapYou'] + 0.15 + 0.6 * k_, -12 - k_)

# ---------------------------------------------------------------- 6. faster (32.4–37.8), then the branch creaks and everything holds its breath
tb = 33.0
while tb < T['stop'] - 0.3:
    put(heartbeat(), tb, -14); tb += BEAT * (1.0 if tb < 35.4 else 0.5)
put(accel_travel(T['stop'] - T['faster'], 2.4, 30.0), T['faster'], -12.5, send=0.1)
put(reverse_swell(2.4, 250, 7000), T['stop'] - 2.4, -13, send=0.2)
put(creak(1.0), T['stop'] - 0.05, -11, pan=-0.3, send=0.4)
put(hush(1.2), T['stop'], -17, send=0.4)

# ---------------------------------------------------------------- 7. Nursi: two brothers, two readings (37.8–48)
put(pad([hz('D3'), hz('A3'), hz('D4')], 2.7, a=0.8, r=0.6, cutoff=1200), T['stop'] + 0.1, -22, send=0.4)
put(pluck(hz('D4'), 2.2, 0.8, 1.0), T['stop'] + 0.3, -17, send=0.5)
put(pluck(hz('A4'), 2.2, 0.8, 1.0), T['stop'] + 0.6, -17, send=0.5)
put(boom(70, 30, 2.0, 1.6, 0.6), T['terror'] + 0.1, -8, send=0.15)                    # one saw only terror
put(pad([hz('D2'), hz('Eb2'), hz('A2')], 1.9, a=0.3, r=0.08, cutoff=900), T['terror'], -14, send=0.2)
put(growl(1.7), T['terror'] + 0.1, -15, pan=0.3, send=0.2)
put(hiss(1.7), T['terror'] + 0.1, -23, send=0.3)
for i, nm in enumerate(('D4', 'F#4', 'A4', 'D5', 'F#5', 'A5')):                        # the other looked again: the same well, in D major
    put(pluck(hz(nm), 2.6, 0.9, 0.9), T['again'] + 0.12 * i, -17, pan=-0.5 + 0.2 * i, send=0.6)
put(pad([hz(n) for n in CH['D']], 6.6, a=1.2, r=1.0, cutoff=1800), T['again'], -18, send=0.4)
put(bell(hz('D4'), 3.0, (1, 2.0, 3.0), (1, .35, .12)), T['horse'] + 0.25, -17, send=0.6)     # a tamed horse
put(pluck(hz('A4'), 2.4, 0.9, 1.0), T['horse'] + 0.25, -17, send=0.5)
put(boom(56, 40, 1.0, 1.0, 0.2), T['horse'] + 0.25, -16, send=0.2)
put(reverse_swell(1.3, 400, 7000), T['door'] - 1.2, -19, send=0.3)
put(choir(3.2, [hz('D3'), hz('F#3'), hz('A3'), hz('D4')], a=0.9, r=1.5), T['door'] + 0.1, -21, send=0.5)   # a door to a garden
put(shimmer(3.0, 1800, 7000, a=0.05, r=2.4), T['door'] + 0.2, -19, send=0.5)
put(sparkles(2.6, 22, 4, 2800, 9000, 0.05), T['door'] + 0.3, -25, send=0.6)
put(pluck(hz('D5'), 2.8, 0.9, 1.2), T['door'] + 0.25, -16, send=0.6)

# ---------------------------------------------------------------- 8. the verse (48–55.8): an open fifth, nothing percussive
put(pad([hz('D2'), hz('A2'), hz('D3'), hz('A3')], 8.8, a=1.6, r=2.0, cutoff=1400), 47.6, -19, send=0.45)
put(bell(hz('D4'), 3.6, (1, 2.0, 3.0), (1, .3, .1)), T['verse'] + 0.5, -22, send=0.6)
for i, ta in enumerate((0.5, 1.0, 1.7, 2.4)):
    put(shimmer(1.5, 2000 - 100 * i, 6400, a=0.5, r=0.8), T['verse'] + ta, -29, pan=0.3 * (-1) ** i, send=0.4)
put(pluck(hz('A4'), 3.0, 0.7, 1.4), T['verse'] + 3.4, -22, send=0.6)
put(whoosh(1.1, True, 200, 3000), T['home'] + 0.05, -23, send=0.3)                    # back to the roots

# ---------------------------------------------------------------- 9. brand sting (57–60), then the loop
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
m0 = pyln.Meter(SR); mix = mix * db(-14.5 - m0.integrated_loudness(mix.T))
pk = np.abs(mix).max(0); win = int(0.005 * SR)
mix = mix * np.minimum(1, db(-1.6) / np.maximum(uniform_filter1d(maximum_filter1d(pk, win), win), 1e-9))[None, :]
f = int(0.03 * SR); mix[:, :f] *= np.linspace(0, 1, f); mix[:, -f:] *= np.linspace(1, 0, f)
os.makedirs('timing', exist_ok=True)
sf.write('timing/mix.wav', mix.T.astype(np.float32), SR, subtype='FLOAT')
m = pyln.Meter(SR)
print('mix LUFS', round(m.integrated_loudness(mix.T), 1), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 1))
mono = mix.mean(0)
print('rms per 3 s:', [int(round(20 * np.log10(np.sqrt((mono[int(a * SR):int((a + 3) * SR)] ** 2).mean()) + 1e-9))) for a in np.arange(0, 60, 3)])
