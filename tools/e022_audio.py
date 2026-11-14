"""E022 · The Lion Who Gave Away Her Meal (Said Nursi, Sozler, Onuncu Soz, Ikinci Hakikat + Qur'an 17:24): procedural sound (no voice),
on the 120 BPM grid of src/e022/timeline.ts. Key = D. Minor while she is starving (0-2.9), major from the gift (2.9) on. Events mirrored
from the film: the meat slides 2.9-4.2, a thread of light at 4.0, a pluck for every fig that the milk reaches (MILK), a music-box lullaby in
the room (23.4-28.0), rising motes in the wide shot (29.4-44), the wing lowering 49.3-53.3. The drone is phase-locked to the 70 s loop.
Run from the repo root: PYTHONPATH=tools python3 tools/e022_audio.py  ->  timing/mix.wav   then: python3 tools/master.py E022 67.0"""
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
R = np.random.default_rng(2022)

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


# ---------------------------------------------------------------- mirror of src/e022/timeline.ts
MILK = [17.2, 17.9, 18.5, 19.1, 19.6, 20.0]
BELL = (1, 2.76, 5.4), (1, .3, .1)

def rubble():
    """The stomach of a hungry animal: a very low, slow rumble (so low a phone only shows its click)."""
    n = int(1.4 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * (44 + 8 * np.sin(2 * np.pi * 3.1 * t)) * t) * np.exp(-t / 0.5) + 0.35 * bp(R.standard_normal(n), 120, 380) * np.exp(-t / 0.3)
    return norm(x)

def slide(dur):
    """The meat slides over the sand: a soft low-passed scrape."""
    n = int(dur * SR); t = np.arange(n) / SR
    x = lp(R.standard_normal(n), 1400) * np.sin(np.pi * t / dur) ** 1.5 + 0.5 * bp(R.standard_normal(n), 200, 700) * np.sin(np.pi * t / dur)
    return norm(x)

def plink(f):
    """A drop of milk reaching a fig: a glassy high note and a tiny wet tick."""
    return pluck(hz(f), 1.4, 0.9, 0.45)

# ---------------------------------------------------------------- 0. the loop-locked drone (D2 + A2): the same level at 0 and at 70
dr = drone(TOTAL, [73.416, 110.0], [1.0, 0.55])
dr_env = curve([(0, -25), (2.9, -26), (5, -26), (12, -28), (28, -27), (37, -28), (46, -30), (62, -26), (66, -25), (70, -25)], floor=-25)
put(dr * dr_env, 0.0, 0, send=0.15)

# ---------------------------------------------------------------- 1. hook (0-5): hunger, then the gift
put(slam('big'), 0.0, -3, send=0.14)
put(boom(60, 36, 1.1, 1.2, 0.3), 0.0, -9, send=0.2)
put(sparkles(0.6, 30, 6, 3200, 9500), 0.02, -29, send=0.3)
put(pad([hz('D3'), hz('A3'), hz('F3')], 3.4, a=0.5, r=1.0, cutoff=1200), 0.0, -24, send=0.4)          # minor: she is starving
put(rubble(), 0.4, -22, send=0.2); put(rubble(), 1.9, -24, send=0.2)
put(slam('mid'), 1.5, -9, send=0.15)
put(reverse_swell(0.7, 500, 6500), 2.2, -21, send=0.2)
put(slam('mid'), 2.9, -9, send=0.15)                                                                    # "SHE GAVE IT AWAY"
put(slide(1.3), 2.9, -25, pan=0.1, send=0.2)                                                            # the meat slides to the cub (2.9 - 4.2)
put(choir(3.2, [hz('D3'), hz('A3'), hz('F#4')], a=1.2, r=1.4, bright=0.8), 3.0, -29, send=0.5)       # the major third arrives with the gift
put(thump(46, 0.7), 4.2, -20); put(bell(hz('D5'), 3.2, *BELL), 4.2, -20, send=0.6)                      # the cub gets up and eats
put(shimmer(1.4, 2400, 7600, a=0.05, r=0.9), 4.0, -28, send=0.45)                                       # the thread of light (4.0)
put(reverse_swell(0.5, 700, 7500), 4.5, -22, send=0.2)

# ---------------------------------------------------------------- 2. the lion quote (5-13): warm, the cub's heartbeat fades out
put(choir(7.5, [hz('D3'), hz('A3'), hz('F#4'), hz('D5')], a=1.0, r=2.0, bright=1.0), 5.0, -25, send=0.5)
put(pad([hz('D2'), hz('A2'), hz('F#3'), hz('A3')], 8.0, a=0.8, r=1.4, cutoff=1700), 5.0, -24, send=0.45)
put(boom(54, 34, 1.6, 1.2, 0.25), 5.0, -10, send=0.2)
for te in (5.5, 6.5, 7.5, 9.0, 10.0):
    put(slam('soft'), te, -15, send=0.1)
for k in range(11):                                                                                   # the cub eats: a small quick heartbeat (period 0.66 s)
    put(thump(60, 0.45), 4.8 + k * 0.66, -31 - 1.0 * k)
put(bell(hz('A4'), 3.0, *BELL), 10.0, -24, send=0.6)                                                    # "AND GIVES IT TO ITS CUB"
put(reverse_swell(0.8, 400, 6500), 12.2, -21, send=0.2)

# ---------------------------------------------------------------- 3. to the tree (13-15)
put(whoosh(1.6, True, 200, 3000), 13.0, -22, send=0.25)
put(slam('mid'), 13.3, -11, send=0.12)
put(pad([hz('D2'), hz('A2'), hz('E3')], 2.5, a=0.8, r=1.2, cutoff=1400), 13.0, -26, send=0.4)

# ---------------------------------------------------------------- 4. the fig tree (15-20.5): roots wake, milk climbs, a pluck at every fig
put(boom(50, 32, 1.8, 1.2, 0.2), 15.0, -14, send=0.2)
put(pad([hz('D2'), hz('A2'), hz('F#3'), hz('E4')], 7.0, a=1.4, r=1.4, cutoff=1500), 14.9, -25, send=0.45)
put(under(wind(6.0, 200, 900), 15.0, [(15.0, -90), (16.0, -46), (19.5, -46), (21.0, -90)]), 15.0, 0, send=0.3)
for te in (15.4, 16.4, 17.4, 18.4):
    put(slam('soft'), te, -15, send=0.1)
for i, te in enumerate(MILK):
    put(plink(['D6', 'F#6', 'A5', 'E6', 'G6', 'A6'][i]), te, -23 - 0.3 * i, pan=-0.3 + 0.12 * i, send=0.6)
    put(bell(hz(['D5', 'F#5', 'A5', 'E5', 'G5', 'D6'][i]), 2.2, *BELL), te, -29, pan=0.2, send=0.6)
    sw = sweep_noise(1.8, 250, 2600, width=0.28, bands=12, reverse=False) * 0.5                          # the milk rises through the trunk, 2.3 s before it arrives
    put(sw, te - 2.2, -37, pan=-0.2 + 0.1 * i, send=0.25)
put(bell(hz('A4'), 3.2, *BELL), 18.4, -22, send=0.6)                                                    # "TO ITS FRUIT"
put(sparkles(1.5, 16, 4, 3000, 9000), 19.8, -29, send=0.4)

# ---------------------------------------------------------------- 5. to the house, into the window, the room (20-28)
put(whoosh(1.7, True, 200, 3400), 20.0, -22, send=0.25)
put(reverse_swell(1.8, 300, 4000), 21.6 - 0.2, -21, send=0.2)                                           # the zoom into the lit window (21.6 - 23.4)
put(slam('mid'), 22.0, -11, send=0.12)
put(pad([hz('D2'), hz('A2'), hz('F#3'), hz('A3')], 8.0, a=1.2, r=1.6, cutoff=1500), 22.2, -26, send=0.45)
put(choir(5.5, [hz('D3'), hz('A3'), hz('D4'), hz('F#4')], a=1.2, r=2.4, bright=0.9), 23.0, -28, send=0.5)
for te in (22.8, 23.8, 24.8, 25.8, 26.8):
    put(slam('soft'), te, -16, send=0.1)
# a music-box lullaby (D major, 3/4 feel): one note every half beat group, starting when the room is reached
LULLABY = ['A5', 'F#5', 'D5', 'F#5', 'A5', None, 'B5', 'G5', 'E5', 'G5', 'B5', None, 'A5', 'F#5', 'D5', 'F#5', 'E5', None, 'D5', None, None, None]
for i, nm in enumerate(LULLABY):
    if nm: put(pluck(hz(nm), 1.8, 1.0, 0.5), 23.5 + i * 0.5, -27 - (i > 16) * 3, pan=0.1 * ((i % 3) - 1), send=0.55)
for te in (24.3, 27.1):                                                                                 # the cradle creaks at the end of each swing (period 3.4 s)
    n = int(0.7 * SR); tt = np.arange(n) / SR
    put(norm(bp(R.standard_normal(n), 300, 900) * np.sin(np.pi * tt / 0.7) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt))), te, -38, send=0.15)
put(under(wind(5.0, 220, 1100), 23.5, [(23.5, -90), (24.5, -50), (27.5, -50), (28.5, -90)]), 23.5, 0, send=0.3)

# ---------------------------------------------------------------- 6. the wide shot (28-37.5): "how wide a mercy" - a swell, bells, motes rising
put(reverse_swell(1.6, 300, 6500), 27.0, -20, send=0.2)
put(whoosh(2.6, False, 160, 2800), 28.0, -23, send=0.3)                                                 # the camera pulls out (28.0 - 30.6)
put(slam('big'), 28.8, -5, send=0.16)
put(boom(52, 34, 2.0, 1.2, 0.25), 28.8, -8, send=0.2)
put(choir(6.0, [hz('D3'), hz('A3'), hz('D4'), hz('F#4'), hz('A4')], a=0.7, r=2.6, bright=1.1), 28.7, -21, send=0.5)
put(pad([hz('D2'), hz('A2'), hz('F#3'), hz('A3')], 9.0, a=0.8, r=1.6, cutoff=1900), 28.6, -22, send=0.45)
put(bell(hz('D5'), 3.6, *BELL), 28.8, -17, send=0.6)
put(slam('mid'), 29.6, -11, send=0.12); put(slam('mid'), 30.4, -9, send=0.12)
put(bell(hz('A5'), 3.4, *BELL), 30.4, -20, send=0.6)                                                    # "IS PLAIN"
put(sparkles(8.0, 14, 5, 3000, 9500), 29.4, -29, send=0.4)                                              # rising motes (29.4 - 40, thinning to 46)
put(shimmer(2.0, 2400, 7800, a=0.05, r=1.0), 29.4, -26, send=0.45)
for te in (31.8, 32.8, 33.8, 34.8, 35.8):
    put(slam('soft'), te, -16, send=0.1)
put(bell(hz('F#5'), 3.0, *BELL), 34.8, -24, send=0.6)                                                   # "INFINITELY MERCIFUL"
put(bell(hz('A5'), 3.2, *BELL), 35.8, -22, send=0.6)                                                    # "COMPASSIONATE"
put(reverse_swell(0.9, 350, 5500), 36.6, -24, send=0.2)

# ---------------------------------------------------------------- 7. the honest lens (37.5-46.5): spare, open fifths, a held question
put(pad([hz('D2'), hz('A2'), hz('E3')], 9.0, a=1.4, r=1.8, cutoff=1300), 37.4, -26, send=0.4)
for te in (38.0, 39.0, 41.6, 42.4, 43.2, 44.2, 45.2):
    put(slam('soft'), te, -19, send=0.1)
put(bell(hz('A4'), 3.4, (1, 2.0, 3.0), (1, .3, .1)), 39.0, -24, send=0.6)                              # "NOT A LAB PROOF"
put(bell(hz('E5'), 3.4, (1, 2.0, 3.0), (1, .3, .1)), 44.2, -25, send=0.6)                               # "READS THE SAME LOVE ..."
put(bell(hz('D5'), 3.6, *BELL), 45.2, -21, send=0.6)                                                    # "... AS A SIGN OF MERCY"
put(sparkles(5.0, 30, 10, 3000, 9000), 40.0, -33, send=0.4)

# ---------------------------------------------------------------- 8. to the plain, the child's side (44.5-49.3)
put(whoosh(2.4, True, 200, 3200), 44.6, -23, send=0.3)
put(reverse_swell(1.8, 300, 5200), 45.4, -22, send=0.2)
put(slam('mid'), 46.8, -12, send=0.12); put(slam('mid'), 47.8, -13, send=0.12)
put(pad([hz('D2'), hz('A2'), hz('D3')], 4.0, a=1.0, r=1.2, cutoff=1400), 46.4, -26, send=0.4)

# ---------------------------------------------------------------- 9. Qur'an 17:24 (49.3-62): the wing lowers (49.3-53.3), the flame warms (54-58.5)
put(boom(52, 34, 1.8, 1.2, 0.25), 49.3, -10, send=0.2)
put(choir(7.0, [hz('D3'), hz('A3'), hz('F#4'), hz('D5')], a=1.4, r=2.2, bright=1.0), 49.3, -25, send=0.5)
put(pad([hz('D2'), hz('A2'), hz('F#3'), hz('A3')], 12.0, a=1.0, r=1.8, cutoff=1700), 49.3, -24, send=0.45)
put(sweep_noise(4.0, 300, 4200, width=0.3, bands=14, reverse=False) * 0.5, 49.3, -31, pan=0.0, send=0.3)   # feathers opening and lowering
for k, nm in enumerate(['D5', 'F#5', 'A5', 'D6', 'F#6', 'A5', 'D6', 'F#6', 'E6']):                       # one note per feather, as the wing comes down
    put(pluck(hz(nm), 1.6, 0.8, 0.5), 49.6 + k * 0.42, -29 - 0.2 * k, pan=-0.3 + 0.07 * k, send=0.55)
put(bell(hz('D5'), 3.6, *BELL), 53.3, -20, send=0.6)                                                    # the wing is down
put(slam('soft'), 50.6, -16, send=0.1); put(slam('soft'), 51.6, -16, send=0.1)
put(slam('soft'), 56.2, -15, send=0.1); put(slam('soft'), 57.1, -15, send=0.1); put(slam('soft'), 58.0, -14, send=0.1); put(slam('soft'), 58.9, -14, send=0.1)
put(pad([hz('D2'), hz('A2'), hz('F#3'), hz('D4')], 7.0, a=2.0, r=1.8, cutoff=2000), 54.5, -23, send=0.45)   # the flame warms
put(bell(hz('A4'), 3.4, *BELL), 58.0, -21, send=0.6)                                                    # "AS THEY RAISED ME"
put(bell(hz('F#5'), 3.4, *BELL), 58.9, -22, send=0.6)                                                   # "WHEN I WAS SMALL"
put(sparkles(3.0, 20, 5, 3000, 9000), 58.9, -29, send=0.4)
put(reverse_swell(0.8, 350, 6000), 61.2, -22, send=0.2)

# ---------------------------------------------------------------- 10. the lesson (62-67)
put(slam('big'), 62.0, -6, send=0.16); put(slam('big'), 62.7, -8, send=0.16)
put(boom(54, 34, 1.8, 1.2, 0.25), 62.0, -9, send=0.2)
put(choir(5.0, [hz('D3'), hz('A3'), hz('D4'), hz('F#4'), hz('A4')], a=0.5, r=2.2, bright=1.1), 61.9, -22, send=0.5)
put(bell(hz('D5'), 3.6, *BELL), 62.7, -17, send=0.6)
put(slam('mid'), 64.0, -11, send=0.12); put(bell(hz('A5'), 3.4, *BELL), 64.0, -22, send=0.6)
put(slam('mid'), 65.0, -11, send=0.12); put(bell(hz('F#5'), 3.4, *BELL), 65.0, -22, send=0.6)
put(pad([hz('D2'), hz('A2'), hz('D3')], 4.5, a=0.6, r=1.0, cutoff=1500), 62.8, -25, send=0.4)

# ---------------------------------------------------------------- 11. brand sting (67-70), then a swell that leads into frame 0
put(whoosh(0.7, True, 250, 3600), EP + 0.08, -19, send=0.2)
put(reverse_swell(1.6, 300, 6000), EP + 0.86 - 1.6, -21, send=0.2)
put(boom(60, 36, 1.4, 1.2, 0.3), EP + 0.83, -10, send=0.25)
put(shimmer(2.3, 2200, 7600, a=0.05, r=1.7), EP + 0.84, -22, send=0.45)
put(pad([hz('D2'), hz('A2'), hz('D3')], 2.0, a=0.7, r=1.1), EP + 1.02, -19, send=0.3)
put(shimmer(1.2, 3000, 8000, a=0.05, r=0.9), EP + 1.9, -28, send=0.4)
put(reverse_swell(0.95, 400, 6500), 69.05, -24, send=0.2)                                              # leads into the first hit

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
