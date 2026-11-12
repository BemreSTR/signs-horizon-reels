"""E018 · The Emperor's Questions: music + sound design (no narration), on the 100 BPM grid of src/e018/timeline.ts.
The hall is a bronze bell and a low choir; the scale is a pendulum (each weight: a fall, a clink, a low thump); the enemy is a heartbeat.
Output: timing/mix.wav (then: python3 tools/master.py E018 92.4)."""
import os
import numpy as np
from scipy.signal import fftconvolve
from scipy.ndimage import maximum_filter1d, uniform_filter1d
import soundfile as sf
import pyloudnorm as pyln
from sfxlib import *

BEAT = 0.6
EP = 89.4
TOTAL = 92.4
N = int(round(TOTAL * SR))
# mirrors src/e018/timeline.ts
K = dict(hookOut=3.0, letter=3.0, claim=6.6, summon=9.6, men=13.6, admit=17.4, q1=22.2, q2=30.0, q3=40.2, q4=47.4, q5=54.6, verdict=64.2, lens=73.8, finale=81.0, home=88.8)
QC = [  # (t0, ans, inf, drop)
    (22.2, 1.8, 2.8, 3.6), (30.0, 1.8, 6.6, 7.2), (40.2, 1.8, 2.8, 3.6), (47.4, 1.8, 2.8, 3.6), (54.6, 1.8, None, 5.4)]
FALL = 0.4
LANDS = [t0 + dr + FALL for (t0, _, _, dr) in QC]
PEBBLE = 30.0 + 2.8 + FALL

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

# ---------------------------------------------------------------- generators particular to this episode
def coin_land():
    """A bronze weight lands in a bronze pan: a click, inharmonic ring, and a low thump for the phone speaker."""
    n = int(0.9 * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f, tau, a in ((1380, 0.16, 1.0), (2310, 0.11, 0.7), (3640, 0.075, 0.5), (5120, 0.045, 0.3), (7300, 0.03, 0.15)):
        x += a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    x += 1.2 * bp(rng.standard_normal(n), 2000, 6500) * np.exp(-t / 0.004)
    x += 0.9 * np.sin(2 * np.pi * (170 + 90 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.05)
    x += 0.6 * bp(rng.standard_normal(n), 300, 900) * np.exp(-t / 0.02)
    x[:int(0.001 * SR)] *= np.linspace(0, 1, int(0.001 * SR))
    return norm(x)
def stone_drop():
    n = int(0.5 * SR); t = np.arange(n) / SR
    x = lp(rng.standard_normal(n), 700) * np.exp(-t / 0.018) * 2.2 + np.sin(2 * np.pi * (120 + 60 * np.exp(-t / 0.03)) * t) * np.exp(-t / 0.07)
    x += 0.5 * bp(rng.standard_normal(n), 900, 2600) * np.exp(-t / 0.01)
    return norm(x)
def creak(dur=0.9, f0=96, f1=74):
    t = T_(dur); f = f0 - (f0 - f1) * (t / dur); ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(h * ph) / h for h in range(1, 20)) * (np.sin(2 * np.pi * 13 * t) > 0.2)
    return norm(bp(x, 220, 1500) * env_ar(len(t), 0.05, 0.3))
def paper(dur=0.7):
    n = int(dur * SR); t = np.arange(n) / SR
    am = 0.35 + 0.65 * np.abs(np.sin(2 * np.pi * 17 * t + rng.uniform(0, 6))) ** 2
    return norm(bp(rng.standard_normal(n), 1400, 7000) * am * env_ar(n, dur * 0.2, dur * 0.6))
def murmur(dur):
    """Men muttering behind the witness: formant-shaped noise with slow syllable-like swells."""
    n = int(dur * SR); t = np.arange(n) / SR
    base = rng.standard_normal(n)
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 3.4 * t + 0.8 * np.sin(2 * np.pi * 0.9 * t)) ** 2
    x = bp(base, 280, 620) + 0.8 * bp(base, 800, 1300) + 0.3 * bp(base, 2200, 3200)
    return norm(x * am * env_ar(n, dur * 0.35, dur * 0.4))
def gong(f=73.4, dur=4.5):
    t = T_(dur); x = np.zeros(len(t))
    for r, a, tau in ((1, 1.0, 1.6), (1.504, 0.6, 1.2), (2.0, 0.5, 0.9), (2.74, 0.38, 0.6), (4.07, 0.2, 0.35)):
        x += a * np.sin(2 * np.pi * f * r * t + 0.4 * np.sin(2 * np.pi * 0.7 * t)) * np.exp(-t / tau)
    x += 0.7 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.05)
    return norm(x)
def growl_low(dur, f=55.0):
    t = T_(dur); ph = 2 * np.pi * np.cumsum(f * (1 + 0.03 * np.sin(2 * np.pi * 2.2 * t))) / SR
    x = sum(np.sin(h * ph) / h for h in range(1, 10))
    return norm(lp(x, 480, 2) * env_ar(len(t), dur * 0.4, dur * 0.4))

CH = {'Dm': ['D2', 'A2', 'D3', 'F3', 'A3'], 'Bb': ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 'Gm': ['G1', 'D2', 'G2', 'Bb2', 'D3'], 'A': ['A1', 'E2', 'A2', 'C#3', 'E3'],
      'D': ['D2', 'A2', 'D3', 'F#3', 'A3'], 'Eb': ['Eb2', 'Bb2', 'Eb3', 'G3', 'Bb3']}
def section(prog, t_end, pad_db, arp_db, octave=2, cutoff=1300, step=BEAT):
    for i, (t0, ch) in enumerate(prog):
        t1 = prog[i + 1][0] if i + 1 < len(prog) else t_end
        put(pad([hz(n) for n in CH[ch]], t1 - t0 + 0.5, a=0.5, r=0.5 if i + 1 < len(prog) else 0.06, cutoff=cutoff), t0 - 0.05, pad_db, send=0.3)
        put(pluck(hz(CH[ch][0]), 2.6, 0.6, 1.2), t0, -15, send=0.1)
        t = t0; k = 0
        while t < t1 - 0.01:
            put(pluck(hz(CH[ch][[2, 3, 4][k % 3]]) * octave, 1.2, 0.9, 0.45), t, arp_db, pan=0.4 * np.sin(k * 2.1), send=0.45)
            t += step; k += 1

# ---------------------------------------------------------------- bed (periodic over the loop)
per = lambda f, ph=0.0: np.sin(2 * np.pi * (round(f * TOTAL) / TOTAL) * tt + ph)
lfo = lambda k, ph=0.0: 0.5 + 0.5 * np.sin(2 * np.pi * k / TOTAL * tt + ph)
bed = per(36.71) * (0.75 + 0.25 * lfo(3)) + 0.7 * per(55.0, 1.0) * (0.7 + 0.3 * lfo(5, 2)) + 0.45 * per(73.42, 2.0) * (0.6 + 0.4 * lfo(4, 1)) \
    + 0.3 * per(146.83, 0.3) * lfo(6, 5) + 0.2 * per(220.0, 1.1) * lfo(8, 2)
air = lp(pink(N, 100, 3000), 1800) * (0.5 + 0.5 * lfo(9, 1))
bed = norm(np.tanh(1.2 * bed)) * 0.85 + norm(air) * 0.25
bed_db = np.interp(tt, [0, 3, 9.6, 13.6, 21.6, 22.2, 64.0, 64.6, 73.8, 74.4, 81.0, EP, EP + 0.5, TOTAL - 0.08, TOTAL], [0, 0, 1, 2, 2, -2, -2, 2, 2, -3, -3, -2, -8, 0, 0])
MIX += (bed * db(bed_db) * db(-24.0))[None, :]

# ---------------------------------------------------------------- 1. hook (0–3): the hall, a bell, a heartbeat
put(boom(58, 33, 1.6, 1.4, 0.5), 0.0, -7)
put(bell(hz('D3'), 3.4, (1, 2.0, 2.76, 4.2), (1, .5, .25, .1)), 0.0, -11, send=0.5)
put(pad([hz('D2'), hz('A2'), hz('D3'), hz('F3')], 3.8, a=0.5, r=0.8, cutoff=1100), 0.0, -20, send=0.3)
put(choir(3.6, [hz('D3'), hz('A3'), hz('D4')], a=1.4, r=1.0), 0.0, -24, send=0.5)
put(shimmer(2.4, 2200, 7000, a=0.05, r=1.6), 0.02, -27, send=0.4)
for k_ in range(4): put(heartbeat(), 0.35 + BEAT * 1.0 * k_, -17 - 0.5 * k_)

# ---------------------------------------------------------------- 2. the letter (3–9.6)
put(whoosh(1.6, False, 200, 3600), 3.3, -17, pan=0.7, send=0.3)                           # in from the right
put(paper(0.6), 4.7, -23, send=0.3)
put(boom(70, 44, 0.5, 1.0, 0.5), 4.9, -14, send=0.2)                                      # it settles on the carpet
put(wax_crack(), 5.25, -20, send=0.3)
put(sparkles(1.2, 20, 3, 2600, 8000), 5.0, -26, send=0.5)
put(pad([hz(n) for n in CH['Gm']], 6.0, a=0.6, r=0.8, cutoff=1200), K['claim'] - 0.1, -19, send=0.4)
put(boom(56, 36, 1.5, 1.2, 0.4), K['claim'], -11, send=0.2)                               # "claims to be a prophet"
put(pluck(hz('D4'), 2.4, 0.8, 1.0), K['claim'] + 0.3, -17, send=0.5)
put(pluck(hz('Bb3'), 2.4, 0.8, 1.0), K['claim'] + 1.2, -18, send=0.5)
put(reverse_swell(1.6, 300, 6000), K['summon'] - 1.6, -19, send=0.3)
put(paper(0.5), 9.3, -26, send=0.3)                                                       # the letter lifts away

# ---------------------------------------------------------------- 3. the caravan (9.6–13.6): hooves of light, one note each
wl = wind(5.0, 160, 900); put(wl * env_ar(len(wl), 1.2, 1.0), 9.2, -25, pan=0.5)
for i, nm in enumerate(('D4', 'F4', 'A4', 'D5', 'A4', 'F5', 'D5', 'A5')):
    te = 9.7 + i * 0.26
    put(pluck(hz(nm), 1.8, 0.9, 0.7), te + 0.9, -18 - (0 if i == 0 else 3), pan=0.8 - 0.8 * i / 7, send=0.5)
    put(boom(80, 52, 0.18, 0.8, 0.4), te + 0.8, -22, pan=0.7 - 0.7 * i / 7)
put(bell(hz('A3'), 3.0, (1, 2.0, 3.0, 4.2), (1, .4, .2, .08)), 11.4, -14, send=0.6)       # the leader arrives
put(pad([hz(n) for n in CH['Dm']], 4.2, a=0.6, r=0.6, cutoff=1200), K['summon'], -19, send=0.4)

# ---------------------------------------------------------------- 4. his men behind him (13.6–17.4): a heartbeat, a murmur, a hush
tb = K['men']
while tb < K['admit'] + 3.0:
    put(heartbeat(), tb, -14.5 if tb < K['admit'] else -12.5); tb += BEAT
mm = murmur(2.6); put(mm, 15.0, -22, pan=-0.2, send=0.4)                                  # "if he lies, say so"
put(growl_low(2.4, 49.0), 15.0, -20, send=0.2)
put(pad([hz(n) for n in CH['Eb']], 3.8, a=0.8, r=0.8, cutoff=1000), K['men'], -21, send=0.4)
put(boom(54, 34, 1.4, 1.2, 0.5), K['admit'], -8, send=0.2)                                # "I would have lied"
put(pad([hz(n) for n in CH['A']], 4.4, a=0.4, r=0.8, cutoff=1000), K['admit'], -19, send=0.4)
put(crackle(3.0, lambda t: 6 + 14 * np.sin(np.pi * t / 3.0) ** 2, 6500), K['admit'] + 0.1, -26)   # the leader's light flickers
put(hush(0.9), K['admit'] + 3.0, -20, send=0.4)
put(reverse_swell(1.4, 250, 6000), K['q1'] - 1.4, -17, send=0.2)

# ---------------------------------------------------------------- 5. the five questions
section([(22.2, 'Dm'), (27.0, 'Bb'), (30.0, 'Gm'), (36.0, 'Dm'), (40.2, 'Bb'), (43.8, 'Gm'), (47.4, 'Dm'), (51.0, 'A'), (54.6, 'Gm'), (60.0, 'A')], K['verdict'], -21, -24)
put(whoosh(1.0, True, 250, 3400), K['q1'] - 0.6, -22, send=0.3)                           # the scale appears
for qi, (t0, ans, inf, drop) in enumerate(QC):
    # the question: a short, rising, open phrase
    a, b = (('A3', 'D4'), ('G3', 'Bb3'), ('F3', 'A3'), ('A3', 'C#4'), ('D3', 'A3'))[qi]
    put(pluck(hz(a), 1.4, 0.9, 0.5), t0, -16, pan=-0.3, send=0.5)
    put(pluck(hz(b), 1.8, 0.9, 0.6), t0 + BEAT * 0.5, -15, pan=-0.1, send=0.5)
    if qi == 4:
        for ti, nm in zip((1.8, 3.6, 5.4), ('D4', 'F4', 'A4')):                              # each command: a ripple and a rising note
            put(boom(66, 38, 0.9, 1.2, 0.5), t0 + ti, -10, send=0.2)
            put(pluck(hz(nm), 2.2, 0.9, 0.9), t0 + ti + 0.05, -15, send=0.5)
            put(shimmer(1.2, 2200, 6500, a=0.05, r=0.9), t0 + ti + 0.05, -26, send=0.4)
    else:
        put(boom(64, 36, 1.0, 1.3, 0.5), t0 + ans, -9, send=0.2)                             # the answer: a low pulse out of the witness
        put(heartbeat(), t0 + ans + 0.25, -13)
        put(shimmer(1.0, 2200, 6500, a=0.05, r=0.7), t0 + ans + 0.05, -27, send=0.4)
    if inf is not None:                                                                       # the emperor's reasoning: a warm gold chord
        put(pluck(hz('A4'), 2.2, 0.8, 1.0), t0 + inf, -17, pan=0.2, send=0.5)
        put(choir(2.8, [hz('D3'), hz('A3'), hz('F4')], a=0.8, r=1.2), t0 + inf - 0.1, -24, send=0.5)
    # the weight: a fall, a clink, a low thump, the beam answering
    put(whoosh(FALL + 0.05, False, 300, 4200), t0 + drop - 0.02, -21, send=0.2)
    put(coin_land(), t0 + drop + FALL, -9.5, pan=0.3, send=0.3)
    put(bell(hz('F5') if qi % 2 == 0 else hz('A5'), 1.4, (1, 2.76), (1, .35)), t0 + drop + FALL + 0.01, -22, pan=0.3, send=0.6)
    put(creak(0.8), t0 + drop + FALL + 0.05, -20, pan=-0.1, send=0.4)
    put(sparkles(0.7, 24, 4, 2800, 8000), t0 + drop + FALL, -27, send=0.5)
put(stone_drop(), PEBBLE, -12, pan=-0.3, send=0.3)                                         # the enemy's pebble of doubt
put(creak(0.7, 82, 64), PEBBLE + 0.05, -19, pan=-0.2, send=0.4)
put(pad([hz(n) for n in CH['Eb']], 3.6, a=0.6, r=0.6, cutoff=900), 32.8, -22, send=0.4)
put(murmur(1.6), 33.0, -25, pan=-0.2, send=0.4)
tb = 32.8
while tb < 36.4:
    put(heartbeat(), tb, -15); tb += BEAT

# ---------------------------------------------------------------- 6. the verdict (64.2–73.8)
V = K['verdict']
put(reverse_swell(1.8, 250, 6500), V - 1.8, -17, send=0.2)
put(gong(73.4, 5.0), V, -8, send=0.3)                                                     # the scale is full; the throne lights up
put(whoosh(1.0, True, 200, 3000), V + 0.2, -22, send=0.3)
put(pad([hz(n) for n in CH['D']], 9.6, a=1.0, r=1.2, cutoff=1900), V + 0.1, -17, send=0.4)
put(choir(4.6, [hz('D3'), hz('F#3'), hz('A3'), hz('D4')], a=1.2, r=2.2), V + 0.6, -20, send=0.5)   # the crown lifts
put(shimmer(3.6, 1800, 7000, a=0.05, r=2.6), V + 0.6, -21, send=0.5)
put(sparkles(3.0, 26, 4, 2800, 9000, 0.05), V + 0.7, -25, send=0.6)
for i, nm in enumerate(('D4', 'F#4', 'A4', 'D5')):
    put(pluck(hz(nm), 2.4, 0.9, 0.9), V + 0.8 + 0.14 * i, -17, pan=-0.4 + 0.25 * i, send=0.6)
put(hush(1.2), V + 3.4, -22, send=0.4)                                                    # a breath before the feet
put(bell(hz('D4'), 3.6, (1, 2.0, 3.0), (1, .35, .12)), V + 4.8, -14, send=0.6)            # "I would wash his feet"
put(pluck(hz('A4'), 2.6, 0.9, 1.0), V + 4.95, -17, send=0.6)
put(choir(4.0, [hz('A3'), hz('D4'), hz('F#4')], a=0.8, r=2.0), V + 4.8, -23, send=0.5)

# ---------------------------------------------------------------- 7. the honest lens (73.8–81.0): he kept his throne; the enemy found the light
L = K['lens']
put(boom(52, 32, 2.0, 1.5, 0.5), L + 0.05, -8, send=0.2)                                  # the crown settles
put(creak(1.0, 90, 60), L + 0.1, -15, pan=-0.2, send=0.4)
put(pad([hz(n) for n in CH['Bb']], 4.6, a=0.4, r=1.2, cutoff=900), L, -18, send=0.4)
put(growl_low(2.8, 46.0), L + 0.2, -19, send=0.2)
put(murmur(2.0), L + 1.0, -26, pan=0.2, send=0.4)
put(hush(0.9), L + 2.9, -21, send=0.4)
put(pluck(hz('F4'), 2.2, 0.8, 1.0), L + 3.4, -18, send=0.5)                               # the witness's light returns
put(pad([hz(n) for n in CH['D']], 4.6, a=0.8, r=1.4, cutoff=1700), L + 3.9, -17, send=0.4)
put(reverse_swell(1.2, 300, 6000), L + 3.0, -21, send=0.3)
put(bell(hz('D4'), 3.4, (1, 2.0, 3.0), (1, .35, .12)), L + 4.2, -13, send=0.6)             # it turns gold: "entered Islam"
put(bell(hz('A4'), 3.0, (1, 2.0), (1, .3)), L + 4.2, -17, send=0.6)
put(choir(3.6, [hz('D3'), hz('F#3'), hz('A3'), hz('D4')], a=0.5, r=1.8), L + 4.2, -21, send=0.5)
put(shimmer(2.8, 2000, 7400, a=0.05, r=2.0), L + 4.2, -20, send=0.5)
put(sparkles(2.4, 24, 4, 2800, 9000, 0.05), L + 4.3, -25, send=0.6)

# ---------------------------------------------------------------- 8. ask the same questions yourself (81–89.4): the questions return, then the loop
F = K['finale']
put(pad([hz('D2'), hz('A2'), hz('D3'), hz('F#3')], 8.4, a=1.0, r=0.8, cutoff=1500), F, -20, send=0.4)
for i, nm in enumerate(('A3', 'D4', 'F4', 'A4', 'D5')):                                     # each question comes back: one soft, open note
    put(pluck(hz(nm), 2.4, 0.8, 1.0), F + 1.2 + 0.6 * i, -16, pan=-0.4 + 0.2 * i, send=0.6)
    put(tick(0 if i % 2 else 1), F + 1.2 + 0.6 * i, -24, pan=-0.4 + 0.2 * i, send=0.3)
put(choir(4.4, [hz('D3'), hz('A3'), hz('D4')], a=0.8, r=2.0), F + 3.9, -23, send=0.5)     # "now ask the same questions yourself"
put(bell(hz('A4'), 3.4, (1, 2.0, 3.0), (1, .3, .1)), F + 3.9, -17, send=0.6)
put(whoosh(0.9, True, 200, 3000), K['home'] - 0.2, -23, send=0.3)                         # back to the hall
put(reverse_swell(1.0, 300, 6000), EP - 1.0, -23, send=0.2)

# ---------------------------------------------------------------- 9. brand sting, then the loop
put(whoosh(0.7, True, 250, 3600), EP + 0.08, -19, send=0.2)
put(reverse_swell(1.6, 300, 6000), EP + 0.86 - 1.6, -21, send=0.2)
put(boom(60, 36, 1.4, 1.2, 0.3), EP + 0.83, -10, send=0.25)
put(shimmer(2.3, 2200, 7600, a=0.05, r=1.7), EP + 0.84, -22, send=0.45)
put(pad([hz('D2'), hz('A2'), hz('D3')], 2.0, a=0.7, r=1.1), EP + 1.02, -19, send=0.3)
put(shimmer(1.2, 3000, 8000, a=0.05, r=0.9), EP + 1.9, -28, send=0.4)

# ---------------------------------------------------------------- mix
def ir(sec=2.8):
    n = int(sec * SR); t = np.arange(n) / SR
    Lc = lp(rng.standard_normal(n) * np.exp(-t / 0.6), 5200); Rc = lp(rng.standard_normal(n) * np.exp(-t / 0.6), 5200)
    pre = int(0.024 * SR); Lc = np.concatenate([np.zeros(pre), Lc])[:n]; Rc = np.concatenate([np.zeros(pre), Rc])[:n]
    return np.stack([Lc, Rc]) / np.sqrt(n) * 3.0
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
