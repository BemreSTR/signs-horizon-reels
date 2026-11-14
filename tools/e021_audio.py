"""E021 · She Wished to Be Forgotten (Maryam, 3:42 + 19:16–26): procedural sound (no voice), on the 120 BPM grid of src/e021/timeline.ts.
Key = D (Dorian / D major when the Qur'an answers her). A pitched ping is born with every ring on screen (RINGS), a low thump with every
contraction (PULSES), the trunk is knocked on SHAKES and each date lands with a soft thud + a high note (FALLS). During the wish (39-45.4)
the bed falls away to almost nothing, then comes back warm on "DO NOT GRIEVE". The drone is phase-locked to the 70 s loop.
Run from the repo root: PYTHONPATH=tools python3 tools/e021_audio.py  ->  timing/mix.wav   then: python3 tools/master.py E021 70.0"""
import os
import numpy as np
from scipy.signal import fftconvolve
from scipy.ndimage import maximum_filter1d, uniform_filter1d
import soundfile as sf
import pyloudnorm as pyln
from sfxlib import *

TOTAL = 70.0          # 67.0 s content + 3.0 s brand outro (2100 frames)
EP = 67.0
N = int(round(TOTAL * SR))
MIX = np.zeros((2, N)); REV = np.zeros((2, N))
R = np.random.default_rng(2021)

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
    xs = [p[0] for p in points_db]; ys = [p[1] for p in points_db]
    return db(np.interp(tt, xs, ys, left=floor, right=floor))

# ---------------------------------------------------------------- mirror of src/e021/timeline.ts
PULSES = [36.0, 37.2, 38.2, 39.0]
SHAKES = [49.5, 50.0, 50.5]
FALLS = [50.5, 50.7, 50.95, 51.15, 51.4, 51.65, 51.9, 52.2]
LAND = 0.67   # fall time of a date (px / g in World.tsx)
RINGS = [(-4 + 70, 0.5), (-3 + 70, 0.5), (-2 + 70, 0.5), (-1 + 70, 0.5)] + [(t, 0.5) for t in range(0, 5)] + [(t, 0.7) for t in range(5, 12)] \
    + [(13, 0.3), (15.5, 0.3), (17.5, 0.3), (28.0, 0.8), (36.0, 0.5)] + [(p + 0.05, 0.45) for p in PULSES[1:]] + [(47.0, 0.8), (52.5, 0.6)] \
    + [(t, 0.5) for t in (63, 64, 65, 66)]

def under(sig, t0, pts, floor=-90.0):
    """Local dB envelope for a layer that starts at t0 (points are absolute seconds)."""
    t = t0 + np.arange(len(sig)) / SR
    return sig * db(np.interp(t, [p[0] for p in pts], [p[1] for p in pts], left=floor, right=floor))

# ---------------------------------------------------------------- generators
def ping(name, amp=1.0, dur=2.4):
    return bell(hz(name), dur, (1, 2.76, 5.4), (1, .3, .1)) * amp

def slam(size='mid'):
    """A soft dry hit for a text beat: 150-600 Hz body + 3 kHz+ tick, so a phone speaker still plays it."""
    n = int(0.45 * SR); t = np.arange(n) / SR
    k = {'big': (1.0, 1.0, 1.0), 'mid': (0.75, 0.9, 0.8), 'soft': (0.45, 0.8, 0.55)}[size]
    body = np.sin(2 * np.pi * (88 + 100 * np.exp(-t / 0.035)) * t) * np.exp(-t / (0.09 * k[0] + 0.04))
    knock = np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.035) * 0.55 + bp(R.standard_normal(n), 200, 800) * np.exp(-t / 0.025) * 0.8
    tick_ = hp(R.standard_normal(n), 3400) * np.exp(-t / 0.006) * 1.1
    x = 0.9 * k[0] * body + 0.8 * knock * k[1] + 0.6 * tick_ * k[2]
    x[:int(0.001 * SR)] *= np.linspace(0, 1, int(0.001 * SR))
    return norm(x)

def thump(f=48, big=1.0):
    """A heartbeat / contraction: low body + a 150-500 Hz knock so it survives a phone speaker."""
    n = int(0.6 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * np.cumsum(f + 40 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.14)
    x += 0.9 * bp(R.standard_normal(n), 150, 520) * np.exp(-t / 0.05) + 0.5 * np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.06)
    x += 0.25 * hp(R.standard_normal(n), 3200) * np.exp(-t / 0.004)
    return norm(x) * big

def step():
    """A footfall in sand: a soft low-passed puff and a grain tick."""
    n = int(0.16 * SR); t = np.arange(n) / SR
    x = lp(R.standard_normal(n), 1100) * np.exp(-t / 0.035) + 0.5 * bp(R.standard_normal(n), 160, 420) * np.exp(-t / 0.05) + 0.35 * hp(R.standard_normal(n), 3400) * np.exp(-t / 0.012)
    x[:int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return norm(x)

def knock():
    """The palm trunk: a dry wooden knock and a short leaf rustle."""
    n = int(0.9 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) + 0.6 * np.sin(2 * np.pi * 410 * t) * np.exp(-t / 0.03) + 0.8 * bp(R.standard_normal(n), 220, 900) * np.exp(-t / 0.02)
    leaves = hp(R.standard_normal(n), 2600) * np.exp(-t / 0.28) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t) ** 2) * 0.55
    return norm(x + leaves)

def date_land():
    """A date on sand: soft thud and a faint squeak of grain."""
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * (170 + 90 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.05) + 0.7 * bp(R.standard_normal(n), 300, 1200) * np.exp(-t / 0.018) + 0.3 * hp(R.standard_normal(n), 3600) * np.exp(-t / 0.006)
    return norm(x)

def water(dur):
    """A small stream: a band of noise whose level wanders, plus bubbling drips."""
    n = int(dur * SR); t = np.arange(n) / SR
    wob = lp(R.standard_normal(n), 6, 1); wob = wob / (np.abs(wob).max() + 1e-9)
    base = bp(R.standard_normal(n), 700, 3200) * (0.55 + 0.45 * wob) + 0.5 * bp(R.standard_normal(n), 3200, 7000) * (0.5 + 0.5 * np.roll(wob, 9000))
    x = norm(base) * 0.7
    k = 0.0
    while k < dur - 0.3:
        k += R.exponential(1 / 7.0)
        f = R.uniform(900, 2400); m = int(0.12 * SR); tm = np.arange(m) / SR
        d = np.sin(2 * np.pi * np.cumsum(f * (1 + 2.2 * tm)) / SR) * np.exp(-tm / 0.03) * R.uniform(0.15, 0.6)
        i0 = int(k * SR)
        if i0 + m < n: x[i0:i0 + m] += d
    return norm(x)

def lock(f, loop=70.0):
    """Nearest frequency whose period divides the loop length: no click at the wrap."""
    return round(f * loop) / loop

def drone(dur, notes_hz, amps):
    t = np.arange(int(dur * SR)) / SR; x = np.zeros_like(t)
    for f, a in zip(notes_hz, amps):
        f = lock(f)
        for h, ha in ((1, 1.0), (2, 0.35), (3, 0.18), (4, 0.08)):
            x += a * ha * np.sin(2 * np.pi * f * h * t + h)
    return x

# ---------------------------------------------------------------- 0. the loop-locked drone (D2 + A2): the same level at 0 and at 70
dr = drone(TOTAL, [73.416, 110.0], [1.0, 0.55])
dr_env = curve([(0, -26), (5, -26), (12, -29), (38.5, -29), (41.5, -80), (45.4, -80), (48, -27), (62, -27), (66, -26), (70, -26)], floor=-26)
put(dr * dr_env, 0.0, 0, send=0.15)

# ---------------------------------------------------------------- 1. hook (0-5): the first hit, the twist at 1.5
put(slam('big'), 0.0, -3, send=0.14)
put(boom(60, 36, 1.1, 1.2, 0.3), 0.0, -9, send=0.2)
put(sparkles(0.8, 40, 8, 3200, 9500), 0.02, -27, send=0.3)
put(pad([hz('D3'), hz('A3'), hz('F3')], 5.4, a=0.5, r=1.2, cutoff=1300), 0.0, -24, send=0.4)   # minor: she wishes to be forgotten
put(reverse_swell(0.5, 700, 7500), 1.0, -21, send=0.2)
put(slam('mid'), 1.5, -9, send=0.15)
put(slam('soft'), 2.5, -13, send=0.15)
put(choir(3.0, [hz('D3'), hz('A3'), hz('F#4')], a=1.3, r=1.4, bright=0.8), 1.6, -31, send=0.5)   # ...and she was chosen: the major third arrives
put(reverse_swell(0.6, 600, 6500), 4.45, -22, send=0.2)

# ---------------------------------------------------------------- 2. chosen (5-11.5): major, bells, ink shimmers on the Arabic words
put(choir(7.0, [hz('D3'), hz('A3'), hz('F#4'), hz('D5')], a=1.0, r=2.0, bright=1.0), 5.0, -24, send=0.5)
put(pad([hz('D2'), hz('A2'), hz('F#3'), hz('A3')], 7.0, a=0.8, r=1.4, cutoff=1700), 5.0, -24, send=0.45)
put(boom(54, 34, 1.6, 1.2, 0.25), 5.0, -9, send=0.2)
for te in (5.5, 6.3, 7.1):                                                           # Arabic lines are inked in, right to left
    put(shimmer(1.2, 2600, 8000, a=0.05, r=0.9), te, -31, send=0.45)
for te in (6.0, 7.0, 8.0, 9.0):
    put(slam('soft'), te, -15, send=0.1)
put(bell(hz('D5'), 3.2, (1, 2.76, 5.4), (1, .3, .1)), 9.0, -20, send=0.6)                  # "WOMEN OF THE WORLDS"
put(bell(hz('A4'), 3.0, (1, 2.76, 5.4), (1, .3, .1)), 9.0, -24, send=0.6)
put(reverse_swell(0.5, 500, 6000), 11.0, -22, send=0.2)

# ---------------------------------------------------------------- 3. she withdraws (11.5-18.5): minor, footsteps in sand, the screen falls
put(pad([hz('D2'), hz('A2'), hz('F3'), hz('C4')], 7.2, a=1.2, r=1.4, cutoff=1400), 11.4, -25, send=0.45)
put(under(wind(7.0, 220, 1300), 11.5, [(11.5, -90), (12.5, -44), (17.5, -44), (18.5, -90)]), 11.5, 0, send=0.3)
for k in range(12):                                                                   # she walks east: one step per beat (12.0 - 17.5)
    te = 12.0 + k * 0.5 * (1.0 if k < 8 else 1.0)
    put(step(), te, -29 - 0.4 * k, pan=-0.15 + 0.03 * k, send=0.2)
for te in (12.0, 13.0, 16.0):
    put(slam('soft'), te, -14, send=0.1)
put(slam('mid'), 15.0, -11, send=0.12)
put(sweep_noise(1.6, 300, 4200, width=0.25, bands=14, reverse=False) * 0.6, 15.0, -26, pan=0.0, send=0.25)   # the cloth drops (15.0 - 16.6)
put(boom(70, 44, 0.6, 1.0, 0.3), 16.55, -17, send=0.15)
put(bell(hz('A4'), 3.0, (1, 2.76, 5.4), (1, .3, .1)), 16.6, -27, send=0.6)

# ---------------------------------------------------------------- 4. the visitor, the question, the answer (18.5-30.5)
put(pad([hz('D2'), hz('Eb3'), hz('A2'), hz('F3')], 9.0, a=1.0, r=1.3, cutoff=1250), 18.4, -26, send=0.4)   # unsettled
put(reverse_swell(0.7, 400, 6500), 18.3, -22, send=0.2)
put(slam('mid'), 19.0, -11, send=0.12)
for te in (20.0, 21.0, 22.0, 23.5, 24.5, 25.5):
    put(slam('soft'), te, -15, send=0.1)
# the light flickers (LIGHT_MOD): a high glass tone with the same wobble (1.75 Hz + 2.7 Hz) from 19.0 to 23.4
fl_n = int(4.6 * SR); fl_t = np.arange(fl_n) / SR
flick = (np.sin(2 * np.pi * hz('A5') * fl_t) + 0.4 * np.sin(2 * np.pi * hz('E6') * fl_t)) * (0.5 + 0.28 * np.sin(11 * fl_t) + 0.22 * np.sin(17 * fl_t + 1)) * env_ar(fl_n, 0.5, 1.0)
put(flick, 18.9, -37, pan=0.2, send=0.5)
for te in (21.0, 22.0):
    put(thump(44, 0.8), te + 0.0, -26)                                                # her heart, quietly
put(pad([hz('D3'), hz('A3'), hz('F#4')], 4.0, a=1.4, r=1.0, cutoff=1500), 26.4, -27, send=0.45)   # resolving toward 28.0
put(reverse_swell(1.0, 300, 6000), 27.0, -20, send=0.2)
# 28.0 "IT IS EASY FOR ME": the release
put(slam('big'), 28.0, -4, send=0.15)
put(boom(52, 34, 1.8, 1.2, 0.25), 28.0, -8, send=0.2)
put(choir(4.0, [hz('D3'), hz('A3'), hz('D4'), hz('F#4')], a=0.5, r=2.4, bright=1.0), 28.0, -22, send=0.5)
put(pad([hz('D2'), hz('A2'), hz('F#3'), hz('A3')], 3.5, a=0.4, r=1.4, cutoff=1900), 28.0, -23, send=0.45)
put(bell(hz('D5'), 3.4, (1, 2.76, 5.4), (1, .3, .1)), 28.0, -18, send=0.6)
put(sparkles(1.6, 18, 4, 3000, 9000), 28.05, -27, send=0.4)

# ---------------------------------------------------------------- 5. she carries and withdraws far (30.5-34.5)
put(under(wind(5.8, 200, 1500), 30.5, [(30.5, -90), (32.0, -43), (35.5, -42), (36.2, -90)]), 30.5, 0, send=0.35)
put(pad([hz('D2'), hz('A2'), hz('E3')], 4.6, a=1.2, r=1.2, cutoff=1300), 30.4, -26, send=0.45)
for k in range(10):
    put(step(), 31.0 + k * 0.5, -30 - 0.3 * k, pan=0.0 + 0.04 * k, send=0.3)
for te, sz, g in ((31.0, 'mid', -11), (32.0, 'mid', -11), (33.0, 'mid', -9)):
    put(slam(sz), te, g, send=0.12)

# ---------------------------------------------------------------- 6. labour and the wish (34.5-46): contractions, then almost silence
put(slam('soft'), 35.0, -15, send=0.1); put(slam('soft'), 36.0, -15, send=0.1)
put(pad([hz('D2'), hz('A2'), hz('F3')], 5.0, a=1.0, r=1.5, cutoff=1200), 34.5, -26, send=0.4)
put(ping('A3', 0.9, 3.0), 36.05, -22, send=0.5)
for i, te in enumerate(PULSES):                                                      # the pulses quicken and grow (dt 1.2, 1.0, 0.8)
    put(thump(46 + 2 * i, 1.0), te - 0.03, -15 + 1.2 * i, send=0.12)
    put(thump(40 + 2 * i, 0.6), te + 0.2, -22 + 1.2 * i)                              # the second beat of the heart
for te in PULSES[1:]:
    put(ping('A3', 0.8, 2.4), te + 0.05, -26, send=0.5)
put(reverse_swell(0.4, 300, 3500), 38.6, -26, send=0.2)
# the wish (39.0): everything but a single low bell falls away
put(bell(hz('D4'), 6.0, (1, 2.0, 3.0), (1, .25, .08)), 39.0, -19, send=0.7)
put(hush(1.6), 39.0, -29, send=0.3)
for te in (39.0, 40.0, 41.0, 42.0):
    put(step(), te, -40, pan=0.1)
put(under(wind(7.0, 180, 900), 39.0, [(39.0, -90), (41.5, -49), (44.5, -49), (46.0, -90)]), 39.0, 0, send=0.4)
glass_n = int(5.0 * SR); glass_t = np.arange(glass_n) / SR                           # a thin high note, hardly there
put((np.sin(2 * np.pi * hz('A5') * glass_t) * 0.5 + np.sin(2 * np.pi * hz('D6') * glass_t) * 0.25) * env_ar(glass_n, 1.5, 2.0), 40.5, -45, pan=0.25, send=0.6)
for i, te in enumerate((38.6, 39.4, 40.2)):                                          # Arabic inked in during the wish: only breath
    put(shimmer(1.2, 2200, 6500, a=0.05, r=0.9), te, -41, send=0.5)
put(reverse_swell(0.9, 250, 5500), 45.1, -23, send=0.2)

# ---------------------------------------------------------------- 7. comfort (46-54.5)
put(slam('big'), 46.5, -5, send=0.18)
put(boom(52, 34, 2.0, 1.2, 0.25), 46.5, -8, send=0.2)
put(choir(5.5, [hz('D3'), hz('A3'), hz('F#4'), hz('D5')], a=0.4, r=2.6, bright=1.0), 46.4, -21, send=0.5)
put(pad([hz('D2'), hz('A2'), hz('F#3'), hz('A3')], 8.0, a=0.6, r=1.6, cutoff=1900), 46.3, -22, send=0.45)
put(bell(hz('D5'), 3.6, (1, 2.76, 5.4), (1, .3, .1)), 47.0, -16, send=0.6)
put(bell(hz('A5'), 3.2, (1, 2.76, 5.4), (1, .3, .1)), 47.5, -22, send=0.6)
put(slam('soft'), 47.5, -13, send=0.1)
wt = water(7.8); wt_t = np.arange(len(wt)) / SR
put(wt * db(np.interp(wt_t, [0, 2.0, 6.7, 7.8], [-60, 0, 0, -60])), 46.8, -33, send=0.3)   # swells in with the stream (reveal 46.5 - 48.8)
for i, nm in enumerate(['D5', 'F#5', 'A5', 'D6', 'A5', 'F#5', 'E5', 'A5']):          # the stream: a soft harp ripple
    put(pluck(hz(nm), 1.6, 0.8, 0.5), 47.6 + i * 0.25, -29 - 0.2 * i, pan=-0.3 + 0.08 * i, send=0.5)
for te in SHAKES:                                                                      # the trunk is knocked three times
    put(knock(), te, -13, send=0.2)
    put(slam('mid'), te, -14, send=0.1)
LANDINGS = [f + LAND for f in FALLS]
for i, te in enumerate(LANDINGS):                                                      # each date lands (soft thud + a high note)
    put(date_land(), te, -19 - 0.2 * (i % 3), pan=R.uniform(-0.3, 0.1), send=0.2)
    put(pluck(hz(['D6', 'F#6', 'A5', 'E6', 'G5', 'A6', 'F#6', 'D6'][i]), 1.2, 0.7, 0.4), te + 0.02, -30, pan=R.uniform(-0.3, 0.3), send=0.6)
for te in FALLS:                                                                       # a branch of rustle as each date leaves the crown
    put(hp(R.standard_normal(int(0.25 * SR)), 2800) * np.exp(-np.arange(int(0.25 * SR)) / SR / 0.07) * 0.5, te, -33, pan=0.4, send=0.3)
put(slam('mid'), 50.5, -11, send=0.1)
# 52.25 "EAT. DRINK. BE COMFORTED."
put(slam('mid'), 52.25, -9, send=0.14); put(slam('mid'), 53.25, -10, send=0.14)
put(choir(4.2, [hz('D3'), hz('A3'), hz('D4'), hz('F#4'), hz('A4')], a=0.6, r=2.4, bright=1.1), 52.2, -21, send=0.5)
put(bell(hz('D5'), 3.6, (1, 2.76, 5.4), (1, .3, .1)), 52.5, -17, send=0.6)
put(sparkles(1.8, 14, 3, 3000, 9000), 52.3, -28, send=0.4)
for te in (52.4, 53.2, 54.0):
    put(shimmer(1.0, 2600, 8000, a=0.05, r=0.8), te, -34, send=0.45)

# ---------------------------------------------------------------- 8. the honest lens (54.5-63): soft and spare
put(pad([hz('D2'), hz('A2'), hz('F#3')], 8.8, a=1.2, r=1.6, cutoff=1500), 54.4, -26, send=0.4)
for te in (55.0, 56.0, 57.0, 59.0, 60.0):
    put(slam('soft'), te, -19, send=0.1)
put(bell(hz('A4'), 3.2, (1, 2.0, 3.0), (1, .3, .1)), 57.0, -24, send=0.6)             # "THE ANGEL, OR THE NEWBORN ‘ISA": two readings, a held question
put(bell(hz('D5'), 3.4, (1, 2.76, 5.4), (1, .3, .1)), 61.0, -19, send=0.6)             # "DO NOT GRIEVE" again
put(slam('mid'), 61.0, -12, send=0.1)

# ---------------------------------------------------------------- 9. the ending (63-67)
put(slam('mid'), 63.0, -10, send=0.12); put(slam('mid'), 64.0, -10, send=0.12); put(slam('soft'), 65.0, -13, send=0.12)
put(pad([hz('D2'), hz('A2'), hz('D3')], 4.5, a=0.6, r=1.0, cutoff=1500), 62.8, -25, send=0.4)
put(bell(hz('D5'), 3.6, (1, 2.76, 5.4), (1, .3, .1)), 65.0, -20, send=0.6)
put(boom(54, 34, 1.4, 1.2, 0.2), 65.0, -11, send=0.2)

# ---------------------------------------------------------------- 10. ring pings (every ring born on screen has a ping), notes by section
def ring_note(t):
    t = t % 70.0 if t >= 66.0 or t < 0 else t
    if t < 5 or t >= 63: return ['D6', 'A5'][int(round(t)) % 2]
    if t < 11.5: return ['D5', 'A5', 'D6', 'F#6', 'A5', 'D6', 'F#6'][min(6, max(0, int(round(t)) - 5))]
    if t < 28: return ['A5', 'F5', 'D5'][int(t * 2) % 3]
    return 'A5'
for rt, amp in RINGS:
    if rt in (28.0, 47.0, 52.5) or abs(rt - 36.0) < 1e-6 or any(abs(rt - (p + 0.05)) < 1e-6 for p in PULSES): continue   # these have their own bells
    put(ping(ring_note(rt), amp * 0.9, 2.2), rt, -27 - (4 if 13 <= rt < 18 else 0), pan=0.2 if int(rt) % 2 else -0.2, send=0.55)

# ---------------------------------------------------------------- 11. brand sting (67-70), then a swell that leads into frame 0
put(whoosh(0.7, True, 250, 3600), EP + 0.08, -19, send=0.2)
put(reverse_swell(1.6, 300, 6000), EP + 0.86 - 1.6, -21, send=0.2)
put(boom(60, 36, 1.4, 1.2, 0.3), EP + 0.83, -10, send=0.25)
put(shimmer(2.3, 2200, 7600, a=0.05, r=1.7), EP + 0.84, -22, send=0.45)
put(pad([hz('D2'), hz('A2'), hz('D3')], 2.0, a=0.7, r=1.1), EP + 1.02, -19, send=0.3)
put(shimmer(1.2, 3000, 8000, a=0.05, r=0.9), EP + 1.9, -28, send=0.4)
put(reverse_swell(0.95, 400, 6500), 69.05, -24, send=0.2)                            # leads into the first hit

# ================================================================ MIX
def ir(sec=2.6):
    n = int(sec * SR); t = np.arange(n) / SR
    Lc = lp(R.standard_normal(n) * np.exp(-t / 0.55), 5200); Rc = lp(R.standard_normal(n) * np.exp(-t / 0.55), 5200)
    pre = int(0.02 * SR); Lc = np.concatenate([np.zeros(pre), Lc])[:n]; Rc = np.concatenate([np.zeros(pre), Rc])[:n]
    return np.stack([Lc, Rc]) / np.sqrt(n) * 3.0
I = ir()
mix = MIX + np.stack([fftconvolve(REV[c], I[c])[:N] for c in range(2)])
mix = np.stack([hp(mix[c], 30, 2) for c in range(2)])
m0 = pyln.Meter(SR); mix = mix * db(-14.5 - m0.integrated_loudness(mix.T))
pk = np.abs(mix).max(0); win = int(0.005 * SR)
mix = mix * np.minimum(1, db(-1.6) / np.maximum(uniform_filter1d(maximum_filter1d(pk, win), win), 1e-9))[None, :]
f = int(0.004 * SR); mix[:, :f] *= np.linspace(0, 1, f); mix[:, -f:] *= np.linspace(1, 0, f)
os.makedirs('timing', exist_ok=True)
sf.write('timing/mix.wav', mix.T.astype(np.float32), SR, subtype='FLOAT')
m = pyln.Meter(SR)
print('mix LUFS', round(m.integrated_loudness(mix.T), 1), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 1))
mono = mix.mean(0)
print('rms per 2 s:', [int(round(20 * np.log10(np.sqrt((mono[int(a * SR):int((a + 2) * SR)] ** 2).mean()) + 1e-9))) for a in np.arange(0, TOTAL - 2 + 1e-6, 2)])
