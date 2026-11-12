"""E017 · The Two Rats: music + sound design (no narration), on the 100 BPM grid of src/e017/timeline.ts.
The rats' gnawing is the clock: the white rat (day) ticks high and left, the black rat (night) low and right.
Output: timing/mix.wav (then: python3 tools/master.py E017 85.2)."""
import os
import numpy as np
from scipy.signal import fftconvolve
from scipy.ndimage import maximum_filter1d, uniform_filter1d
import soundfile as sf
import pyloudnorm as pyln
from sfxlib import *
from sfxlib import _sos

BEAT = 0.6
EP = 82.2
TOTAL = 85.2
N = int(round(TOTAL * SR))
T = dict(hookOut=3.0, wide=3.0, run=4.2, jump=6.0, caught=7.2, lion=9.6, dragon=11.7, rats=13.8, you=16.2, map=19.8, mapTree=22.2, mapWhite=24.6,
         mapBlack=27.0, mapLion=29.4, mapDragon=31.8, faster=34.2, stop=39.6, first=45.6, second=55.2, link=57.9, call=65.4, door=67.2, horse=71.4,
         lesson=75.6, faith=79.2, home=81.3)

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
FLIPS = [(0.0, 1), (11.7, 0), (13.8, 1), (15.0, 0), (16.2, 1), (20.4, 0), (21.6, 1), (23.0, 0), (24.6, 1), (27.0, 0), (29.4, 1), (30.6, 0), (31.8, 1), (33.0, 0)]
t_, s_ = T['faster'], 1
for d_ in [0.6, 0.6, 0.5, 0.5, 0.45, 0.4, 0.4, 0.35, 0.35, 0.3, 0.3, 0.3]:
    FLIPS.append((t_, s_)); s_ = 1 - s_; t_ += d_
day = np.zeros(N); night = np.zeros(N)
for i, (t0, s) in enumerate(FLIPS):
    t1 = FLIPS[i + 1][0] if i + 1 < len(FLIPS) else T['stop']
    (day if s else night)[int(t0 * SR):int(t1 * SR)] = 1
night[int(T['stop'] * SR):int(T['second'] * SR)] = 1                    # the first brother's well: the black rat
day[int(T['second'] * SR):] = 1                                         # the second brother's well, and on through the loop: the white rat
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
glev = np.interp(tt, [0, 3.0, 3.6, 13.4, 14.0, 16.2, 16.8, 33.8, 34.4, 39.6, 40.2, 45.6, 55.0, 55.8, 67.0, 68.0, 81.0, 81.6, 82.2, 82.6, 84.2, 85.1, 85.2],
                 [-15, -15, -26, -26, -19, -19, -25, -25, -18, -17, -30, -26, -26, -30, -30, -36, -36, -22, -22, -30, -30, -15, -15])
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
bed_db = np.interp(tt, [0, 3, 9.6, 13.8, 34.2, 39.5, 39.7, 45.6, 55.2, 56.0, 67.2, 75.6, EP, EP + 0.5, 84.0, TOTAL - 0.08, TOTAL], [0, 0, 2, -1, 1, 4, -6, 3, 3, -6, -3, -4, -2, -8, -8, 0, 0])
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

# ---------------------------------------------------------------- 2. how he got there (3–9.6): the chase, the jump, the tree
put(whoosh(1.9, False, 180, 3400), T['wide'] - 0.05, -17, send=0.3)
wl = wind(36.6, 140, 700)
put(wl * env_ar(len(wl), 2.0, 0.3), 3.0, -27)
for td, f_ in ((8.6, 1500), (10.9, 1350), (15.6, 1600), (18.9, 1300), (22.9, 1500), (26.2, 1200), (30.2, 1650), (41.5, 1400), (52.8, 1250), (58.6, 1500), (63.4, 1350)):
    put(norm(glide(f_, f_ * 0.62, 0.11, 1.0)), td, -24, pan=float(rng.uniform(-0.5, 0.5)), send=0.9)   # a drop, far down
put(growl(1.9), T['run'] + 0.1, -13, pan=-0.5, send=0.2)                              # the lion
tb = T['run']; k_ = 0
while tb < T['jump']:                                                                # running feet, the lion's paws behind them
    put(pluck(hz('D4') if k_ % 2 else hz('A3'), 0.25, 0.6, 0.06), tb, -19, pan=-0.6 + 0.5 * (tb - T['run']) / 1.8)
    put(boom(90, 60, 0.18, 0.8, 0.5), tb + 0.07, -19, pan=-0.7 + 0.4 * (tb - T['run']) / 1.8)
    tb += 0.15; k_ += 1
put(whoosh(0.5, True, 300, 4000), T['jump'], -18, send=0.3)                           # the jump
put(glide(900, 180, 1.15, 1.6), T['jump'] + 0.05, -20, send=0.6)                      # the fall
put(boom(70, 40, 0.7, 1.2, 0.6), T['caught'], -9, send=0.2)                           # he catches the tree
put(creak(0.7), T['caught'] + 0.02, -14, pan=-0.2, send=0.4)
put(sparkles(0.9, 22, 4, 2500, 7000), T['caught'] + 0.05, -27, send=0.5)              # leaves shaking
put(pad([hz('D2'), hz('A2'), hz('D3'), hz('F3')], 3.0, a=1.0, r=0.8), 6.6, -22, send=0.3)

# ---------------------------------------------------------------- 3. above the lion, below a dragon, and the two rats (9.6–16.2)
put(boom(72, 32, 2.0, 1.6, 0.6), T['lion'], -8, send=0.15)
put(growl(2.0), T['lion'] + 0.05, -12, pan=-0.4, send=0.2)
put(boom(60, 28, 2.4, 1.7, 0.6), T['dragon'], -7, send=0.15)
put(growl(2.0, 44.0), T['dragon'] + 0.05, -12, send=0.2)
put(hiss(2.0), T['dragon'] + 0.1, -21, send=0.3)
put(crackle(2.0, lambda t: 10 + 12 * t, 6000), T['dragon'] + 0.2, -26)
put(boom(56, 40, 0.9, 1.0, 0.3), T['rats'] + 0.2, -13)

# ---------------------------------------------------------------- 4. it is you (16.2–19.8)
put(pluck(hz('D4'), 2.0, 0.8, 1.0), T['you'] + 0.3, -17, send=0.5)
put(boom(64, 32, 2.0, 1.5, 0.5), T['you'] + 1.5, -8, send=0.2)
put(bell(hz('D4'), 3.0, (1, 2.0, 3.0), (1, .35, .12)), T['you'] + 1.5, -16, send=0.6)
put(shimmer(2.0, 2400, 7600, a=0.05, r=1.6), T['you'] + 1.5, -23, send=0.5)
for k_ in range(3): put(heartbeat(), T['you'] + 2.1 + 0.6 * k_, -12 - k_)

# ---------------------------------------------------------------- 5. what everything is (19.8–34.2): a slow ostinato, one note for each meaning
CH = {'Dm': ['D2', 'A2', 'D3', 'F3', 'A3'], 'Bb': ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 'Gm': ['G1', 'D2', 'G2', 'Bb2', 'D3'], 'A': ['A1', 'E2', 'A2', 'C#3', 'E3'], 'D': ['D2', 'A2', 'D3', 'F#3', 'A3'],
      'G': ['G1', 'D2', 'G2', 'B2', 'D3'], 'Bm': ['B1', 'F#2', 'B2', 'D3', 'F#3']}
NOTE['B'] = 11
def section(prog, t_end, pad_db, arp_db, octave=2, cutoff=1300, step=BEAT):
    for i, (t0, ch) in enumerate(prog):
        t1 = prog[i + 1][0] if i + 1 < len(prog) else t_end
        put(pad([hz(n) for n in CH[ch]], t1 - t0 + 0.5, a=0.5, r=0.5 if i + 1 < len(prog) else 0.06, cutoff=cutoff), t0 - 0.05, pad_db, send=0.3)
        put(pluck(hz(CH[ch][0]), 2.6, 0.6, 1.2), t0, -15, send=0.1)
        t = t0; k = 0
        while t < t1 - 0.01:
            put(pluck(hz(CH[ch][[2, 3, 4][k % 3]]) * octave, 1.2, 0.9, 0.45), t, arp_db, pan=0.4 * np.sin(k * 2.1), send=0.45)
            t += step; k += 1
section([(13.8, 'Dm'), (16.2, 'Bb'), (19.8, 'Dm'), (22.2, 'Bb'), (24.6, 'Dm'), (27.0, 'Gm'), (29.4, 'A'), (31.8, 'A')], T['faster'], -20, -23)
for tm, nm, low, bright in ((T['map'], 'D4', False, False), (T['mapTree'], 'F4', False, False), (T['mapWhite'], 'A4', False, True), (T['mapBlack'], 'D3', True, False),
                            (T['mapLion'], 'A3', True, False), (T['mapDragon'], 'G3', True, False)):
    put(pluck(hz(nm), 2.4, 1.0, 0.9), tm + 0.15, -14, send=0.5)
    put(boom(64 if low else 58, 32 if low else 40, 1.5 if low else 0.8, 1.4, 0.4), tm + 0.15, -12 if low else -16, send=0.15)
    if bright: put(shimmer(1.8, 2400, 7200, a=0.05, r=1.4), tm + 0.15, -25, send=0.4)
put(growl(1.5), T['mapLion'] + 0.2, -17, pan=-0.4, send=0.2)
put(hiss(1.8), T['mapDragon'] + 0.2, -24, send=0.3)

# ---------------------------------------------------------------- 6. faster (34.2–39.6), then the branch creaks and everything holds its breath
section([(34.2, 'A'), (37.2, 'A')], T['stop'], -18, -19)
tb = T['faster'] + 0.6
while tb < T['stop'] - 0.3:
    put(heartbeat(), tb, -14); tb += BEAT * (1.0 if tb < 37.2 else 0.5)
put(accel_travel(T['stop'] - T['faster'], 2.4, 30.0), T['faster'], -12.5, send=0.1)
put(reverse_swell(2.4, 250, 7000), T['stop'] - 2.4, -13, send=0.2)
put(creak(1.0), T['stop'] - 0.05, -11, pan=-0.3, send=0.4)
put(hush(1.2), T['stop'], -17, send=0.4)

# ---------------------------------------------------------------- 7. two brothers, the same well (39.6–45.6)
put(pad([hz('D3'), hz('A3'), hz('D4')], 6.2, a=1.0, r=1.0, cutoff=1200), T['stop'] + 0.2, -21, send=0.4)
put(pluck(hz('D4'), 2.4, 0.8, 1.1), T['stop'] + 0.9, -16, pan=-0.4, send=0.5)       # one brother …
put(pluck(hz('D4'), 2.4, 0.8, 1.1), T['stop'] + 1.2, -16, pan=0.4, send=0.5)        # … and the other: the same note
put(pluck(hz('A4'), 2.4, 0.8, 1.1), T['stop'] + 3.0, -19, send=0.5)

# ---------------------------------------------------------------- 8. the first brother (45.6–55.2): only enemies
put(boom(70, 30, 2.2, 1.6, 0.6), T['first'] + 0.2, -8, send=0.15)
put(pad([hz('D2'), hz('Eb2'), hz('A2')], 9.4, a=1.5, r=0.3, cutoff=850), T['first'], -14, send=0.2)
put(growl(2.2), T['first'] + 0.3, -15, pan=-0.4, send=0.2)
put(growl(2.4, 44.0), T['first'] + 2.2, -15, send=0.2)
put(hiss(2.6), T['first'] + 2.4, -23, send=0.3)
tb = T['first'] + 0.6
while tb < T['second'] - 0.4:
    put(heartbeat(), tb, -13); tb += 0.6
put(boom(60, 30, 1.8, 1.4, 0.4), 49.9, -11, send=0.15)                               # neither dying nor living
put(pluck(hz('Eb4'), 2.4, 1.0, 1.0), 49.9, -17, send=0.5)
put(hush(1.0), T['second'] - 0.6, -19, send=0.4)

# ---------------------------------------------------------------- 9. the second brother (55.2–67.2): he thinks, then he calls
put(pluck(hz('D4'), 2.6, 0.8, 1.2), T['second'] + 0.3, -16, send=0.6)
put(pluck(hz('A4'), 2.6, 0.8, 1.2), T['second'] + 0.9, -18, send=0.6)
section([(57.6, 'D'), (60.0, 'G'), (62.4, 'Bm'), (64.8, 'A')], T['door'], -21, -22, octave=2, cutoff=1500)
for i in range(6):                                                                    # the threads: one rising note for each thing that turns out to be connected
    put(pluck(hz(['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'][i] if False else ['D5', 'F#5', 'A5', 'D6', 'F#5', 'A5'][i]), 1.6, 0.8, 0.5), T['link'] + 0.77 * i, -19, pan=-0.5 + 0.2 * i, send=0.6)
put(shimmer(4.0, 1800, 6000, a=2.0, r=1.5), T['link'] + 0.5, -27, send=0.5)
put(reverse_swell(1.5, 300, 6000), T['call'] - 1.3, -19, send=0.3)
put(bell(hz('A4'), 3.2, (1, 2.0, 3.0), (1, .35, .12)), T['call'] + 0.15, -15, send=0.7)   # he calls out
put(bell(hz('D5'), 3.0, (1, 2.0), (1, .25)), T['call'] + 0.75, -19, send=0.7)             # … the echo

# ---------------------------------------------------------------- 10. the door and the horse (67.2–75.6)
put(boom(56, 38, 1.6, 1.1, 0.25), T['door'] + 0.2, -11, send=0.2)
put(pad([hz(n) for n in CH['D']], 8.8, a=1.2, r=1.2, cutoff=1900), T['door'], -17, send=0.4)
put(choir(4.0, [hz('D3'), hz('F#3'), hz('A3'), hz('D4')], a=1.0, r=1.8), T['door'] + 0.2, -20, send=0.5)
put(shimmer(3.6, 1800, 7000, a=0.05, r=2.8), T['door'] + 0.3, -19, send=0.5)
put(sparkles(3.0, 22, 4, 2800, 9000, 0.05), T['door'] + 0.4, -25, send=0.6)
for i, nm in enumerate(('D4', 'F#4', 'A4', 'D5', 'F#5', 'A5')):
    put(pluck(hz(nm), 2.6, 0.9, 0.9), T['door'] + 0.3 + 0.12 * i, -17, pan=-0.5 + 0.2 * i, send=0.6)
put(bell(hz('D4'), 3.0, (1, 2.0, 3.0), (1, .35, .12)), T['horse'] + 0.3, -16, send=0.6)   # a tamed horse
put(pluck(hz('A4'), 2.4, 0.9, 1.0), T['horse'] + 0.6, -16, send=0.5)
put(boom(56, 40, 1.0, 1.0, 0.2), T['horse'] + 0.3, -15, send=0.2)

# ---------------------------------------------------------------- 11. the lesson (75.6–81.3)
put(pad([hz('D2'), hz('A2'), hz('D3'), hz('A3')], 3.8, a=0.6, r=0.6, cutoff=1300), T['lesson'], -19, send=0.4)
for i, nm in enumerate(('D4', 'D4', 'D4')):                                           # same well. same lion. same rats.
    put(pluck(hz(nm), 1.8, 0.9, 0.8), T['lesson'] + 0.3 + 0.6 * i, -14, send=0.5)
    put(boom(60, 40, 0.6, 1.0, 0.4), T['lesson'] + 0.3 + 0.6 * i, -13)
put(hush(0.8), T['faith'] - 0.8, -21, send=0.4)
put(boom(62, 34, 2.4, 1.4, 0.4), T['faith'] + 0.25, -7, send=0.2)                     # the difference was faith
put(pad([hz(n) for n in CH['D']] + [hz('D4'), hz('F#4')], 3.6, a=0.25, r=1.4, cutoff=2400), T['faith'] + 0.2, -15, send=0.5)
put(bell(hz('D4'), 3.4, (1, 2.0, 3.0), (1, .35, .12)), T['faith'] + 0.25, -14, send=0.6)
put(bell(hz('A4'), 3.0, (1, 2.0), (1, .3)), T['faith'] + 0.25, -18, send=0.6)
put(shimmer(2.8, 2000, 7400, a=0.05, r=2.2), T['faith'] + 0.25, -20, send=0.5)
put(whoosh(0.9, True, 200, 3000), T['home'], -23, send=0.3)                           # back to the roots

# ---------------------------------------------------------------- 12. brand sting, then the loop
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
print('rms per 3 s:', [int(round(20 * np.log10(np.sqrt((mono[int(a * SR):int((a + 3) * SR)] ** 2).mean()) + 1e-9))) for a in np.arange(0, TOTAL - 3, 3)])
