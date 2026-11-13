"""E019 · She Who Disputes: narration + procedural sound design.
Clock = the ElevenLabs word times (public/ep/e019/words.json, same numbers as src/e019/timeline.ts). Everything is synthesised (numpy);
every hit is tied to a cue. The bed is D minor; the grey chain adds a cold semitone (Eb) that only resolves when she turns to Allah,
and the light of the verse turns the third major (F#). Rings of sound leave her: a soft ping for every ring that is born on screen,
and none while she is trapped (emission stops 13.6 -> 34.4 s, exactly like the picture).
Output: timing/mix.wav + timing/voice_proc.wav, then: python3 tools/master.py E019 75.6"""
import os, subprocess
import numpy as np
from scipy.signal import fftconvolve, sosfilt, sosfiltfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d, minimum_filter1d
import soundfile as sf
import pyloudnorm as pyln
from sfxlib import *   # dsp helpers + generators (shared with other episodes)
from sfxlib import _sos

SR = 44100
FPS = 30
TOTAL_F = 2268
TOTAL = TOTAL_F / FPS            # 75.6 s: voice 71.81 s + tail + 3 s outro
N = int(round(TOTAL * SR))
EP_END = 72.6                    # the outro starts here
import tempfile
SCRATCH = os.environ.get('SCRATCH', tempfile.gettempdir())

# mirrors src/e019/timeline.ts
K = dict(hookOut=4.35, medina=4.5, khawla=6.073, anger=7.027, quote=9.835, custom=12.539, trap=15.19, notDivorced=15.856, notWife=17.358,
         nowhere=18.612, reports=19.984, limboEnd=23.8, went=24.059, muhammad=24.542, fear=26.41, cousin=28.735, noRev=29.936,
         notLeave=31.726, turned=32.98, aisha=35.056, heard=38.348, verseSay=40.294, verse=41.704, verseEnd=48.797, wrong=48.993,
         atone=52.153, free=53.904, fast=54.896, feed=55.902, chapter=57.796, disputes=59.847, reported=61.296, versesAre=62.916,
         queen=64.744, scholar=66.051, woman=67.331, kept=70.021)

# ---------------------------------------------------------------- buses
BUS = {k: np.zeros((2, N)) for k in ('bed', 'amb', 'hi', 'lo', 'rev')}
def put(bus, sig, t, gain_db=0.0, pan=0.0, send=0.0):
    sig = np.asarray(sig)
    if sig.ndim == 1:
        sig = np.stack([sig * np.cos((pan + 1) * np.pi / 4), sig * np.sin((pan + 1) * np.pi / 4)])
    k = int(round(t * SR)); g = db(gain_db)
    a, b = max(k, 0), min(k + sig.shape[1], N)
    if b <= a: return
    seg = sig[:, a - k:b - k] * g
    BUS[bus][:, a:b] += seg
    if send: BUS['rev'][:, a:b] += seg * send
def hit(sig, t, gain_db, pan=0.0, send=0.0):
    """One-shot: split into a low part (<170 Hz, barely ducked) and the rest (ducked hard under speech)."""
    sig = np.asarray(sig); lo_ = lp(sig, 170, 2); hi_ = sig - lo_
    put('lo', lo_, t, gain_db - 10, pan); put('hi', hi_, t, gain_db + 9, pan, send)

# ---------------------------------------------------------------- voice (ElevenLabs "Emin - Epic Historical Narrative")
def load_voice():
    mp3 = os.environ.get('VOICE', 'public/ep/e019/voice.mp3')
    wav = os.path.join(SCRATCH, 'e019_voice.wav')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ac', '1', '-ar', str(SR), wav], check=True)
    v, _ = sf.read(wav); v = hp(v, 70, 2)
    # gentle compression: 2.4:1 above -20 dB, 6 ms attack, 140 ms release
    lvl = np.abs(v); e = np.zeros_like(lvl); a_c = np.exp(-1 / (0.006 * SR)); r_c = np.exp(-1 / (0.14 * SR)); s = 0.0
    for i in range(len(lvl)):
        c = a_c if lvl[i] > s else r_c; s = c * s + (1 - c) * lvl[i]; e[i] = s
    ed = 20 * np.log10(e + 1e-9); over = np.maximum(ed + 20, 0); g = db(-over * (1 - 1 / 2.4))
    v = v * g
    m = pyln.Meter(SR); cur = m.integrated_loudness(v)
    v = v * db(-16 - cur)
    lim = db(-1.5); pk = np.abs(v); win = int(0.004 * SR)
    pkm = uniform_filter1d(maximum_filter1d(pk, win), win)
    v = v * np.minimum(1, lim / np.maximum(pkm, 1e-9))
    out = np.zeros(N); out[:len(v)] = v[:N]
    return out

voice = load_voice()
# speech activity A(t) in [0,1] for ducking: 10 ms rms, fast attack, slow release
hop = int(0.01 * SR); nfr = N // hop
rms = np.sqrt((voice[:nfr * hop].reshape(nfr, hop) ** 2).mean(1)) + 1e-9
act = np.clip((20 * np.log10(rms) + 52) / 16, 0, 1)
A = np.zeros(nfr); s = 0
for i in range(nfr):
    s = max(act[i], s * np.exp(-0.01 / 0.22)) if act[i] > s * 0.9 else s * np.exp(-0.01 / 0.22)
    A[i] = max(s, act[i])
A_full = np.interp(np.arange(N) / SR, (np.arange(nfr) + 0.5) * 0.01, A)

# ================================================================ SCORE
tt = np.arange(N) / SR
def periodic_tone(f, ph=0.0):
    f = round(f * TOTAL) / TOTAL            # whole cycles over the loop: the bed ends exactly where it begins
    return np.sin(2 * np.pi * f * tt + ph)
lfo = lambda k, ph=0: 0.5 + 0.5 * np.sin(2 * np.pi * k / TOTAL * tt + ph)
def auto(points):
    ts, ds = zip(*points); return np.interp(tt, ts, ds)

# ---- 1. continuous bed: D minor root + colour layers that follow the story
root = (1.0 * periodic_tone(36.71) * (0.75 + 0.25 * lfo(3)) + 0.7 * periodic_tone(55.0, 1.0) * (0.7 + 0.3 * lfo(5, 2))
        + 0.45 * periodic_tone(73.42, 2.0) * (0.6 + 0.4 * lfo(4, 1)) + 0.22 * periodic_tone(110.0, .5) * lfo(7, 3))
minor = (0.38 * periodic_tone(146.83, 0.3) * lfo(6, 5) + 0.30 * periodic_tone(174.61, 1.1) * lfo(8, 2) + 0.16 * periodic_tone(293.66, 2.2) * lfo(11, 1)
         + 0.14 * periodic_tone(349.23, 0.7) * lfo(9, 3))
cold = 0.34 * periodic_tone(155.56, 0.9) * lfo(5, 1) + 0.2 * periodic_tone(311.13, 2.4) * lfo(7, 5)     # Eb: the semitone that rubs against D
major = 0.34 * periodic_tone(185.0, 0.4) * lfo(4, 2) + 0.2 * periodic_tone(370.0, 1.9) * lfo(6, 0)       # F#: the third turns bright
g_minor = np.interp(tt, [0, 38.0, 38.6, 48.6, 49.4, 57.0, 58.0, 72.0, EP_END, TOTAL], [1, 1, 0.15, 0.15, 0.85, 0.85, 0.2, 0.2, 0.6, 1])
g_cold = np.interp(tt, [0, 12.5, 15.9, 23.8, 24.5, 29.0, 31.0, 31.8, 33.0, TOTAL], [0, 0, 0.55, 1.0, 0.25, 0.5, 0.7, 0.8, 0, 0])
g_major = np.interp(tt, [0, 37.9, 38.6, 48.6, 49.4, 56.8, 58.0, 72.0, EP_END, TOTAL], [0, 0, 1, 1, 0.15, 0.15, 0.9, 0.9, 0.3, 0])
bed = np.tanh(1.2 * (root + minor * g_minor + cold * g_cold + major * g_major))
air = lp(pink(N, 100, 3000), 1800) * (0.5 + 0.5 * lfo(9, 1))
bed_s = norm(bed) * 0.85 + norm(air) * 0.22
bed_db = auto([(0, 0), (2.4, 0), (2.8, 3), (4.0, 0), (4.5, -3), (12.5, -2), (19.9, 1), (20.2, -3), (23.9, -1), (24.2, -4), (28.9, -9), (30.3, -9),
               (31.7, -3), (34.0, 0), (35.0, -5), (38.1, -8), (38.4, 2), (40.2, -3), (41.7, -4), (48.8, -4), (49.0, 2), (52.0, -3), (53.8, -1),
               (57.7, 0), (61.2, -6), (64.7, -8), (67.2, -4), (69.9, -3), (70.05, 3), (72.0, 0), (EP_END, -1), (EP_END + 0.5, -9), (TOTAL - 1.0, -9),
               (TOTAL - 0.08, 0), (TOTAL, 0)])
BUS['bed'][:] = (bed_s * db(bed_db))[None, :]

# ---- 2. hook: the punch on frame 0, a gold chink on "Prophet", a riser into "her."
hit(boom(60, 34, 1.1, 1.3), 0.0, -9)
hit(bell(587.33, 2.4), 1.724, -30, pan=0.2, send=0.5)
hit(reverse_swell(1.75, 350, 5200), 2.45, -26, send=0.15)
hit(shimmer(1.7, 900, 3200, a=1.2, r=0.3), 2.45, -33)
put('amb', bp(pink(int(4.0 * SR)), 180, 700) * env_ar(int(4.0 * SR), 1.0, 1.5), 0.0, -33)

# ---- 3. Medina at night: wind, a low open choir, the name
hit(whoosh(0.95, True, 200, 3800), 3.9, -17, send=0.2)
hit(boom(55, 40, 0.8, 1.0, 0.2), K['medina'], -21)
wl = wind(19.5)
put('amb', wl * env_ar(len(wl), 1.5, 3.0), 4.3, -28)
ch = choir(9.5, [73.42, 110.0, 146.83, 220.0], a=3.2, r=3.0)
put('amb', ch, 4.3, -27)
hit(shimmer(1.5, 2500, 6800, a=0.5, r=0.7), K['khawla'] - 0.4, -31, pan=0.25, send=0.35)
hit(bell(880.0, 2.6), K['khawla'], -30, pan=0.3, send=0.5)
hit(bell(587.33, 3.0), K['khawla'] + 0.02, -31, pan=-0.2, send=0.5)

# ---- 4. the sentence (9.8 s) and the trap: a cold hit, then a chain that tightens link by link
hit(reverse_swell(2.7, 300, 3200), 7.1, -29, send=0.2)
hit(boom(46, 32, 1.5, 1.0, 0.2), K['quote'] - 0.03, -10, send=0.15)
hit(bell(2349.0, 1.3, (1, 2.4, 4.1), (1, .5, .25)), K['quote'], -32, pan=-0.3, send=0.4)
put('amb', grind(11.2) * 1.0, 12.55, -36)
t_c = 12.75; k_c = 0
while t_c < 23.6:
    u = (t_c - 12.75) / 10.9
    hit(bell(1500 + 200 * (k_c % 3), 0.3, (1, 2.76, 5.4), (1, .5, .25)), t_c, -31 + 6 * u, pan=(-1) ** k_c * 0.45, send=0.25)
    t_c += 1.25 - 0.8 * u; k_c += 1
hit(boom(55, 36, 1.0, 1.0, 0.3), K['trap'], -13, send=0.15)                    # "trap": the ring closes
hit(boom(50, 36, 0.9, 1.0, 0.3), K['notDivorced'] + 0.4, -15)                    # "divorced"
hit(boom(50, 36, 0.9, 1.0, 0.3), K['notWife'] + 0.4, -14)                        # "wife"
hit(reverse_swell(0.8, 500, 7000), K['nowhere'] - 0.8, -25, send=0.2)
hit(boom(50, 33, 2.3, 1.4, 0.5), K['nowhere'] - 0.02, -6, send=0.2)             # NOWHERE.
hit(hush(1.3), K['nowhere'] + 0.9, -30, send=0.3)
for k in range(0, 4):                                                            # limbo: a slow heart, waiting
    hit(heartbeat(), 20.25 + 1.0 * k, -21 - 0.8 * k)
    hit(heartbeat(), 20.25 + 1.0 * k + 0.32, -24 - 0.8 * k)
hit(heartbeat(), 23.25, -23); hit(heartbeat(), 23.57, -26)

# ---- 5. the door: warm light on the street
hit(reverse_swell(0.95, 400, 6000), K['went'] - 0.95, -27, send=0.3)
put('amb', choir(5.4, [146.83, 220.0, 293.66, 349.23], a=1.4, r=2.2), 23.9, -27)
hit(bell(293.66, 3.2), K['muhammad'], -28, pan=0.2, send=0.6)
hit(bell(880.0, 3.0), K['muhammad'] + 0.02, -33, pan=-0.2, send=0.6)
hit(shimmer(2.4, 2000, 7000, a=0.05, r=1.7), K['muhammad'] + 0.01, -30, send=0.4)
hit(sparkles(1.8, 16, 2, 3000, 9000), K['muhammad'] + 0.2, -30, send=0.45)

# ---- 6. his answer: restraint. Then she does not leave.
hit(boom(48, 34, 1.4, 1.0, 0.2), 27.55, -17, send=0.2)                              # "fear Allah."
hit(hush(0.9), K['noRev'] - 0.05, -31, send=0.3)                                    # "No revelation had come yet."
hit(boom(52, 38, 1.0, 1.0, 0.2), K['notLeave'] - 0.02, -13, send=0.2)               # "She did not leave."
for k, dt in enumerate((0.1, 0.42)): hit(heartbeat(), K['notLeave'] + dt, -12 - 2 * k)

# ---- 7. she turns her complaint to Allah: the beam to the sky, the rings come back
hit(reverse_swell(1.3, 400, 7000), K['turned'] - 1.3, -27, send=0.3)
hit(boom(62, 34, 2.0, 1.5, 0.5), K['turned'] - 0.02, -5, send=0.2)
hit(bell(587.33, 3.2), K['turned'], -27, pan=0.2, send=0.6)
hit(shimmer(2.6, 2000, 7000, a=0.05, r=1.9), K['turned'] + 0.02, -30, send=0.4)
hit(whoosh(1.7, True, 300, 5200), K['turned'] + 0.05, -26, send=0.25)
hit(sparkles(2.6, 22, 2, 3000, 9000), K['turned'] + 0.4, -28, send=0.45)
put('amb', choir(6.0, [146.83, 220.0, 293.66, 349.23], a=1.2, r=3.0), 32.9, -26)

# ---- 8. the room: muffled, then "But Allah heard all of it."
rw = wind(4.4, 160, 800)
put('amb', lp(rw, 900) * env_ar(len(rw), 0.5, 0.9), 34.9, -29)
hit(reverse_swell(0.85, 400, 6500), K['heard'] - 0.85, -26, send=0.3)
hit(boom(55, 36, 2.4, 1.6, 0.6), K['heard'] - 0.02, -4.5, send=0.2)
hit(bell(293.66, 3.8), K['heard'], -26, pan=-0.2, send=0.6)
hit(bell(880.0, 3.2), K['heard'] + 0.19, -30, pan=0.3, send=0.6)                    # "Allah"
hit(shimmer(3.5, 2200, 7500, a=0.05, r=2.4), K['heard'] + 0.02, -29, send=0.4)
hit(sparkles(3.0, 30, 3, 2600, 9500), K['heard'] + 0.15, -27, pan=0.2, send=0.5)
put('amb', choir(7.0, [146.83, 185.0, 220.0, 293.66, 370.0], a=0.9, r=3.5), 38.3, -25)

# ---- 9. the verse, in her honour: soft, wide, three golden "Allah"
hit(hush(1.0), 40.2, -31, send=0.3)
hit(boom(50, 34, 1.4, 1.1, 0.2), K['verse'] - 0.02, -12, send=0.25)
for tb, fb in ((K['verse'], 587.33), (45.767, 440.0), (46.72, 587.33)):
    hit(bell(fb, 2.6), tb, -29, pan=0.15, send=0.65)
for i, ta in enumerate((41.62, 43.2, 44.95, 46.55)):                               # the four Arabic lines inking in
    hit(shimmer(1.3, 2400, 6800, a=0.3, r=0.8), ta, -33, pan=-0.3 + 0.2 * i, send=0.4)
put('amb', wind(8.0, 160, 900) * env_ar(int(8.0 * SR), 1.5, 2.0), 41.0, -31)

# ---- 10. "a wrong and a falsehood": the chain breaks
tc = K['wrong'] - 0.02
hit(reverse_swell(1.75, 350, 5200), tc - 1.78, -26, send=0.15)
hit(boom(78, 30, 2.4, 1.8, 0.8), tc, -4.5, send=0.12)
hit(wax_crack(), tc, -13, send=0.25)
hit(sparkles(2.0, 34, 3, 2600, 9500), tc + 0.05, -26, pan=0.2, send=0.5)
hit(shimmer(2.4, 2200, 7500, a=0.05, r=1.9), tc + 0.05, -29, send=0.3)
for k in range(7):
    hit(bell(1100 + 330 * (k % 4), 0.4, (1, 2.76, 5.4), (1, .5, .25)), tc + 0.08 + 0.12 * k, -31 - 0.5 * k, pan=(-1) ** k * 0.6, send=0.35)

# ---- 11. the way back: three rising lights (D, F, A), then the chapter's name
for tn, fn, pn in ((K['free'], 'D5', -0.4), (K['fast'], 'F5', 0.0), (K['feed'], 'A5', 0.4)):
    hit(pluck(hz(fn), 1.9, bright=1.0), tn, -24, pan=pn, send=0.5)
    hit(sweep_noise(0.7, 900, 4200, width=0.22), tn - 0.2, -33, pan=pn, send=0.3)
    hit(shimmer(1.4, 3000, 8000, a=0.05, r=1.0), tn + 0.05, -35, pan=pn, send=0.4)
hit(boom(60, 34, 1.8, 1.3, 0.4), K['chapter'] - 0.02, -9, send=0.25)
hit(bell(146.83, 4.5, (1, 2.0, 3.0, 4.2), (1, .5, .25, .1)), K['chapter'], -22, send=0.6)
hit(bell(587.33, 3.0), K['chapter'] + 0.02, -31, pan=0.2, send=0.6)
hit(boom(55, 34, 1.6, 1.2, 0.3), K['disputes'] - 0.02, -10, send=0.25)
put('amb', choir(4.4, [146.83, 185.0, 220.0, 293.66], a=0.8, r=2.5), K['disputes'] - 0.1, -26)
hit(bell(587.33, 3.0), K['disputes'], -28, pan=-0.2, send=0.6)

# ---- 12. honest lens (quiet), then the finale
hit(hush(1.1), K['reported'] - 0.15, -31, send=0.3)
hit(boom(48, 34, 1.0, 1.0, 0.1), K['queen'] - 0.02, -17)
hit(boom(48, 34, 1.0, 1.0, 0.1), K['scholar'] - 0.02, -17)
put('amb', pad([146.83, 185.0, 220.0, 293.66], 3.9, a=2.6, r=0.4, cutoff=2000), 67.2, -26)
hit(reverse_swell(2.6, 300, 6500), K['kept'] - 2.6, -26, send=0.2)
fd = K['kept']
hit(boom(44, 33, 2.8, 1.0, 0.0), fd - 0.05, -6, send=0.3)
hit(bell(293.66, 4.6), fd, -20, send=0.6)
hit(bell(587.33, 4.0), fd + 0.01, -25, pan=0.25, send=0.6)
hit(bell(880.0, 3.2), 70.62, -31, pan=-0.25, send=0.6)
hit(shimmer(3.0, 2200, 7600, a=0.3, r=2.0), fd, -24, send=0.4)
hit(sparkles(2.5, 24, 2, 2800, 9000), 70.5, -28, send=0.5)
put('amb', choir(5.0, [73.42, 110.0, 146.83, 185.0, 220.0, 293.66], a=0.6, r=3.0), fd - 0.08, -23)

# ---- 13. rings of sound: a soft ping each time one is born on screen (not while she is trapped)
emit = lambda t: np.interp(t, [0, 12.0, 13.6, 32.9, 34.4, 57.7, 64.7, 72.6], [1, 0.85, 0, 0, 1, 0.9, 1, 1])
scale = ['D5', 'A4', 'F5', 'G4', 'C5', 'A5']
n_ = 0
for k in range(1, 60):
    tr = k * 150 / 95
    if tr < 4.6 or tr > 66.0 or emit(tr) < 0.45: continue
    hit(pluck(hz(scale[n_ % len(scale)]), 1.3, bright=0.8, decay=0.4), tr, -37 + 3 * emit(tr), pan=(-1) ** n_ * 0.35, send=0.55)
    n_ += 1
print('ring pings', n_)

# ---- 14. loop tail and brand sting
hit(reverse_swell(1.6, 300, 6000), EP_END - 0.74, -27, send=0.2)
hit(whoosh(0.7, True, 250, 3600), EP_END + 0.08, -23, send=0.2)
hit(boom(60, 36, 1.4, 1.2, 0.3), EP_END + 0.83, -9.5, send=0.25)
hit(shimmer(2.3, 2200, 7600, a=0.05, r=1.7), EP_END + 0.84, -28, send=0.45)
put('amb', choir(2.0, [73.42, 110.0, 146.83], a=0.7, r=1.1), EP_END + 1.02, -27)
hit(shimmer(1.2, 3000, 8000, a=0.05, r=0.9), EP_END + 1.9, -34, send=0.4)

# ================================================================ MIX
def ir(sec=2.6):
    n = int(sec * SR); t = np.arange(n) / SR
    L = rng.standard_normal(n) * np.exp(-t / 0.55); R = rng.standard_normal(n) * np.exp(-t / 0.55)
    L = lp(L, 5500); R = lp(R, 5500)
    pre = int(0.022 * SR); L = np.concatenate([np.zeros(pre), L])[:n]; R = np.concatenate([np.zeros(pre), R])[:n]
    return np.stack([L, R]) / np.sqrt(n) * 3.2
IR = ir()
wet = np.stack([fftconvolve(BUS['rev'][c], IR[c])[:N] for c in range(2)])
duck = lambda d: db(-d * A_full)
A_slow = np.zeros(nfr); st_ = 0.0
for i in range(nfr):
    st_ = max(act[i], st_ * np.exp(-0.01 / 0.6)); A_slow[i] = st_
A_slow_full = np.interp(np.arange(N) / SR, (np.arange(nfr) + 0.5) * 0.01, A_slow)
duck_slow = lambda d: db(-d * A_slow_full)
def carve(x, depth_db, lo_=400, hi_=3000):
    sosm = _sos('bp', [lo_, hi_], 2)
    return np.stack([x[c] - (1 - db(-depth_db)) * sosfiltfilt(sosm, x[c]) for c in range(2)])
bgm = np.zeros((2, N))
bgm += BUS['bed'] * duck(4.0) * db(-25.0)
bgm += BUS['hi'] * duck(9.0)
bgm += BUS['lo'] * duck(4.0)
bgm += wet * duck(9.0)
sustained = carve(BUS['amb'] * db(9.0), 6.0) * duck_slow(6.0)
# masking guard: whenever the narration is present keep everything else >= MARGIN dB under it in the speech band (300 Hz-4 kHz)
MARGIN = 11.0
sosb = _sos('bp', [300, 4000], 4)
vb = sosfilt(sosb, voice)
bgs = np.stack([sosfiltfilt(sosb, bgm[c]) for c in range(2)])
win = int(0.03 * SR)
vr = np.sqrt(np.maximum(uniform_filter1d(vb ** 2, win), 0)); br = np.sqrt(np.maximum(uniform_filter1d((bgs ** 2).mean(0), win), 0))
g = np.where(vr > db(-48.0), np.clip(vr / (br + 1e-12) * db(-MARGIN), 0, 1), 1.0)
gf0 = g[::441]
gp = np.concatenate([gf0, np.ones(12)])
gf = np.minimum.reduce([gp[k:k + len(gf0)] for k in range(0, 9)])       # look-ahead 80 ms: duck BEFORE a consonant arrives
gf = minimum_filter1d(gf, 3)
sm = np.empty_like(gf); st = gf[0]; rel = 1 - np.exp(-0.01 / 0.12)
for i, x_ in enumerate(gf):
    st = x_ if x_ < st else st + (x_ - st) * rel
    sm[i] = st
gs = np.interp(np.arange(N) / SR, np.arange(len(sm)) * 0.01, sm)
bgm = (bgm - bgs) + bgs * gs[None, :]
mix = bgm + sustained + np.stack([voice, voice])                       # narration, centre
f = int(0.03 * SR); mix[:, :f] *= np.linspace(0, 1, f); mix[:, -f:] *= np.linspace(1, 0, f)   # 30 ms edge fades (loop seam)
os.makedirs('timing', exist_ok=True)
sf.write('timing/mix.wav', mix.T.astype(np.float32), SR, subtype='FLOAT')
sf.write('timing/voice_proc.wav', voice.astype(np.float32), SR, subtype='FLOAT')
m = pyln.Meter(SR)
print('mix LUFS', round(m.integrated_loudness(mix.T), 1), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 1), '| voice LUFS', round(m.integrated_loudness(voice), 1))
print('  sustained LUFS', round(m.integrated_loudness(sustained.T), 1), '| transient bgm LUFS', round(m.integrated_loudness(bgm.T), 1))
