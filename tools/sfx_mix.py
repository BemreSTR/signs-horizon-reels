"""E015 sound design: procedural SFX + continuous bed, ducked under the narration, mixed to timing/mix.wav.
Everything is synthesised (numpy), every hit is tied to a cue (docs/09). Seeds fixed."""
import json, glob, os, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt, sosfiltfilt, fftconvolve
import soundfile as sf
import pyloudnorm as pyln
from sfxlib import *   # dsp helpers + generators (shared with other episodes)
from sfxlib import _sos

SR = 44100
FPS = 30
TOTAL_F = 1497
TOTAL = TOTAL_F / FPS            # 49.9 s: voice + 0.45 s tail + 3 s outro
N = int(round(TOTAL * SR))
EP_END = 1407 / FPS              # outro starts here (46.9 s)
cues = json.load(open('public/ep/e015/cues.json'))['cues']
words = json.load(open('public/ep/e015/words.json'))
C = lambda n: cues[n]['ms'] / 1000
W = lambda i: words[i]['startMs'] / 1000
WE = lambda i: words[i]['endMs'] / 1000

# ---------------------------------------------------------------- buses
BUS = {k: np.zeros((2, N)) for k in ('bed', 'amb', 'hi', 'lo', 'rev', 'trav')}
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

# ---------------------------------------------------------------- voice
def load_voice():
    mp3 = os.environ.get('VOICE', 'public/ep/e015/voice.mp3')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ac', '1', '-ar', str(SR), '/tmp/e015_voice.wav'], check=True)
    v, _ = sf.read('/tmp/e015_voice.wav'); v = hp(v, 70, 2)
    # gentle compression (peaks were -4.3 dBFS at -21.9 LUFS): 2.4:1 above -20 dB, 6 ms attack, 140 ms release
    lvl = np.abs(v); e = np.zeros_like(lvl); a_c = np.exp(-1 / (0.006 * SR)); r_c = np.exp(-1 / (0.14 * SR)); s = 0.0
    for i in range(len(lvl)):
        c = a_c if lvl[i] > s else r_c; s = c * s + (1 - c) * lvl[i]; e[i] = s
    ed = 20 * np.log10(e + 1e-9); over = np.maximum(ed + 20, 0); g = db(-over * (1 - 1 / 2.4))
    v = v * g
    m = pyln.Meter(SR); cur = m.integrated_loudness(v)
    v = v * db(-16 - cur)
    # look-ahead style peak limiter at -1.5 dBFS
    lim = db(-1.5); pk = np.abs(v); win = int(0.004 * SR)
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
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
# ---- 1. continuous bed (periodic: it ends exactly where it begins, H34/H77)
def periodic_tone(f, ph=0.0):
    f = round(f * TOTAL) / TOTAL
    return np.sin(2 * np.pi * f * np.arange(N) / SR + ph)
tt = np.arange(N) / SR
lfo = lambda k, ph=0: 0.5 + 0.5 * np.sin(2 * np.pi * k / TOTAL * tt + ph)
bed = (1.0 * periodic_tone(36.71) * (0.75 + 0.25 * lfo(3)) + 0.7 * periodic_tone(55.0, 1.0) * (0.7 + 0.3 * lfo(5, 2))
       + 0.45 * periodic_tone(73.42, 2.0) * (0.6 + 0.4 * lfo(4, 1)) + 0.22 * periodic_tone(110.0, .5) * lfo(7, 3)
       + 0.2 * periodic_tone(36.71 * 1.5, 1.7) * lfo(2, 4))
bed += 0.38 * periodic_tone(146.83, 0.3) * lfo(6, 5) + 0.30 * periodic_tone(220.0, 1.1) * lfo(8, 2) + 0.16 * periodic_tone(293.66, 2.2) * lfo(11, 1)
bed = np.tanh(1.2 * bed)
air = lp(pink(N, 100, 3000), 1800) * (0.5 + 0.5 * lfo(9, 1))
bed_s = norm(bed) * 0.85 + norm(air) * 0.22
# automation in dB (periodic: 0 dB at both ends)
def auto(points):
    ts, ds = zip(*points); return np.interp(tt, ts, ds)
bed_db = auto([(0, 0), (2.4, 0), (2.82, 3), (4.0, 0), (14.9, 0), (15.6, 2), (19.9, 3), (20.2, -3), (28.2, -3), (28.9, -9), (30.3, -9), (30.9, -2), (36.0, -2),
               (36.5, -10), (37.8, -10), (38.6, -2), (41.7, -2), (42.4, -5), (44.9, -5), (46.2, 1), (EP_END, -1), (EP_END + 0.5, -9), (48.6, -9), (TOTAL - 0.08, 0), (TOTAL, 0)])
BUS['bed'][:] = (bed_s * db(bed_db))[None, :]

# ---- 2. hook (S1): title punch, riser, the seal cracks on "destroyed"
hit(boom(60, 34, 1.1, 1.3), 0.0, -9)                                   # kare 0 punch (impact_soft_vo)
hit(reverse_swell(1.75, 350, 5200), C('destroyed') - 1.78, -26, send=0.15)  # tension riser ends on the crack
hit(shimmer(1.7, 900, 3200, a=1.2, r=0.3), C('destroyed') - 1.7, -33)
tc = C('destroyed') - 0.02
hit(boom(78, 30, 2.4, 1.8, 0.8), tc, -4.5, send=0.12)                 # sub boom
hit(wax_crack(), tc, -13, send=0.25)                                    # the wax breaks
hit(sparkles(2.0, 34, 3, 2600, 9500), tc + 0.05, -26, pan=0.2, send=0.5)   # gold dust
hit(shimmer(2.4, 2200, 7500, a=0.05, r=1.9), tc + 0.05, -29, send=0.3)
put('amb', bp(pink(int(4.0 * SR)), 180, 700) * env_ar(int(4.0 * SR), 1.0, 1.5), 0.0, -33)   # S1 stone-room tone

# ---- 3. tilt up to Mecca night
hit(whoosh(0.95, True, 200, 3800), 3.88, -17, pan=0.0, send=0.2)
hit(boom(55, 40, 0.8, 1.0, 0.2), 4.72, -22)

# ---- 4. Mecca: wind, low choir chord, ink, flame, condemned, alive
wl = wind(11.0)
put('amb', wl * env_ar(len(wl), 1.5, 2.5), 4.3, -27)
ch = choir(10.8, [73.42, 110.0, 146.83, 174.61, 220.0], a=3.2, r=3.0)
put('amb', ch, 4.3, -27)
tr = wordAt = W(13) - 0.45
hit(shimmer(1.5, 2500, 6800, a=0.5, r=0.7), tr - 0.05, -31, pan=0.25, send=0.35)       # first line inks in
hit(shimmer(1.5, 1800, 5400, a=0.5, r=0.7), tr + 0.7, -32, pan=-0.25, send=0.35)       # second line
for nm, tg in (('burn', W(22)), ('blazing', C('blazing'))):                               # gold words ignite
    hit(sweep_noise(0.7, 700, 3400, width=0.22), tg - 0.1, -26 if nm == 'blazing' else -30, send=0.2)
    hit(bell(587.33 if nm == 'burn' else 880.0, 2.0), tg, -31 if nm == 'burn' else -29, pan=0.3, send=0.5)
cr = crackle(5.4, lambda t: 3 + 14 * smooth((t - 0.5) / 3.0), 7000)
put('amb', cr * env_ar(len(cr), 0.3, 1.5), W(22) - 0.1, -33)
hit(boom(68, 36, 1.6, 1.4, 0.4), C('condemned') - 0.02, -7, send=0.18)                 # "condemned": the decree lands
hit(bell(220.0, 3.2, (1, 2.0, 3.0, 4.2), (1, .5, .25, .1)), C('condemned'), -26, send=0.6)
for k, dt in enumerate((0.12, 0.42)):                                                      # "alive": a heartbeat
    hit(heartbeat(), W(31) + dt, -12 - 2 * k)

# ---- 5. light leak into the road
hit(reverse_swell(0.7, 400, 7000), 14.3, -25, send=0.3)
hit(boom(52, 38, 1.0, 1.0, 0.2), 14.95, -16, send=0.2)
hit(shimmer(1.4, 1500, 5200, a=0.1, r=1.0), 14.9, -33, send=0.4)

# ---- 6. the road of 3,600 days: one smooth accelerating run, a chime for every year gate
RUN0, RUN1 = 15.55, 19.95
LOCK = C('days')                                                          # the counter locks on "days"
T_TR = 15.30
put('trav', accel_travel(LOCK - T_TR), T_TR, 0.0, send=0.0)
gates = []
for k in range(1, 10):
    y = 120 * k / 1186; x = 0.5 - np.sin(np.arcsin(1 - 2 * y) / 3); gates.append(RUN0 + (RUN1 - RUN0) * x)
scale = [3136.0, 3520.0, 3951.1, 4186.0, 4698.6, 5274.0, 5587.7, 6271.9, 7040.0]   # rising 'pings' above the voice band
for k, g in enumerate(gates):
    if g > LOCK: continue
    put('trav', bell(scale[k], 1.1, (1, 2.4), (1, .2)), g, -11 + 0.3 * k, pan=(-1) ** k * 0.5, send=0.3)
hit(reverse_swell(0.55, 600, 8000), LOCK - 0.05, -27, send=0.2)          # the held breath before the door
hit(boom(60, 32, 1.8, 1.2, 0.3), 19.98, -9, send=0.2)                      # arrival; the clock stops
hit(hush(0.9), 19.98, -30, send=0.3)

# ---- 7. the door: no army, no sword, four words
hit(boom(70, 40, 0.5, 1.0, 0.5), C('army') - 0.03, -9)
hit(boom(70, 40, 0.5, 1.0, 0.5), C('sword') - 0.03, -9)
hit(bell(3300, 0.35, (1, 2.4, 4.1), (1, .5, .25)), C('sword') - 0.03, -30, pan=0.4, send=0.3)   # a small blade-ring, quickly gone
for i, tn in enumerate((26.0, 26.25, 26.5, 26.75)):
    hit(bell([587.33, 698.46, 880.0, 1046.5][i], 1.8), tn, -24, pan=-0.45 + 0.3 * i, send=0.5)
fl = choir(2.4, [146.83, 220.0, 293.66], a=1.2, r=1.2)
put('amb', fl, 28.2, -25)                                                # warm swell under the quote
for i, wi in enumerate((70, 71, 72, 73)):
    hit(shimmer(0.7, 3000, 7800, a=0.05, r=0.55), W(wi) - 0.02, -33, pan=-0.3 + 0.2 * i, send=0.4)
hit(boom(55, 36, 1.3, 1.1, 0.2), 30.42, -15, send=0.2)

# ---- 8. the door opens wide, never crossed
dg = grind(1.9)
put('amb', dg, 30.4, -22)
hit(reverse_swell(1.3, 500, 7000), 30.5, -28, send=0.3)
hit(sparkles(2.0, 20, 2, 3000, 9000), 31.62, -28, send=0.45)
hit(boom(62, 34, 2.0, 1.5, 0.5), W(78) - 0.02, -5, send=0.2)             # "open": impact_soft_vo
hit(shimmer(2.6, 2000, 7000, a=0.05, r=1.9), W(78), -30, send=0.4)
cr2 = crackle(6.6, lambda t: 6 + 10 * smooth((t - 2.0) / 2.0), 7500)
put('amb', cr2 * env_ar(len(cr2), 0.4, 0.8), 32.0, -30)
dr = wind(8.0, 160, 900)
put('amb', dr * env_ar(len(dr), 1.5, 2.0), 32.0, -31)
tn = W(90)
hit(bell(880.0, 3.0), tn + 0.05, -27, pan=0.2, send=0.6)                    # the threshold ignites (never crossed)
hit(boom(58, 36, 1.5, 1.2, 0.2), tn + 0.02, -14, send=0.2)
hit(hush(1.0), 37.3, -30, send=0.3)

# ---- 9. honest lens, tilt down to the desk
hit(bell(1318.5, 2.2), W(101) + 0.02, -33, pan=-0.2, send=0.6)             # "key": a small gold chink
hit(boom(50, 33, 2.2, 1.0, 0.1), W(105) - 0.02, -16, send=0.3)             # "destruction": a low tone
hit(whoosh(0.95, False, 200, 3800), 41.78, -17, send=0.2)
hit(boom(48, 34, 1.0, 1.0, 0.2), 42.55, -22)

# ---- 10. final line, loop tail, brand sting (OutroSound timings from docs: pre-roll swell, hit, shimmer, warm swell)
fd = W(114)
hit(shimmer(2.2, 2400, 6800, a=0.3, r=1.5), fd - 0.05, -26, send=0.4)
hit(boom(44, 33, 2.6, 1.0, 0.0), fd - 0.1, -12, send=0.3)
hit(reverse_swell(1.6, 300, 6000), EP_END + 0.86 - 1.6 - 0.74 + 0.74, -27, send=0.2)    # reverse_swell (pre-roll)
hit(whoosh(0.7, True, 250, 3600), EP_END + 0.08, -23, send=0.2)                          # whoosh_soft
hit(boom(60, 36, 1.4, 1.2, 0.3), EP_END + 0.83, -9.5, send=0.25)                         # impact_soft
hit(shimmer(2.3, 2200, 7600, a=0.05, r=1.7), EP_END + 0.84, -28, send=0.45)               # shimmer_air_01
sl = choir(2.0, [73.42, 110.0, 146.83], a=0.7, r=1.1)
put('amb', sl, EP_END + 1.02, -27)                                                        # swell_low
hit(shimmer(1.2, 3000, 8000, a=0.05, r=0.9), EP_END + 1.9, -34, send=0.4)                 # shimmer_air_02

# ================================================================ MIX
def ir(sec=2.6):
    n = int(sec * SR); t = np.arange(n) / SR
    L = rng.standard_normal(n) * np.exp(-t / 0.55); R = rng.standard_normal(n) * np.exp(-t / 0.55)
    L = lp(L, 5500) ; R = lp(R, 5500)
    pre = int(0.022 * SR); L = np.concatenate([np.zeros(pre), L])[:n]; R = np.concatenate([np.zeros(pre), R])[:n]
    return np.stack([L, R]) / np.sqrt(n) * 3.2
wet = np.stack([fftconvolve(BUS['rev'][c], ir()[c])[:N] for c in range(2)])
duck = lambda d: db(-d * A_full)
# slow envelope of the narration (fast attack, 0.6 s release): sustained beds follow phrases, not syllables
A_slow = np.zeros(nfr); st_ = 0.0
for i in range(nfr):
    st_ = max(act[i], st_ * np.exp(-0.01 / 0.6)); A_slow[i] = st_
A_slow_full = np.interp(np.arange(N) / SR, (np.arange(nfr) + 0.5) * 0.01, A_slow)
duck_slow = lambda d: db(-d * A_slow_full)
def carve(x, depth_db, lo_=400, hi_=3000):
    sosm = _sos('bp', [lo_, hi_], 2)
    return np.stack([x[c] - (1 - db(-depth_db)) * sosfiltfilt(sosm, x[c]) for c in range(2)])
bgm = np.zeros((2, N))
bgm += BUS['bed'] * duck(4.0) * db(-28.0)
bgm += BUS['hi'] * duck(9.0)
bgm += BUS['lo'] * duck(4.0)
bgm += wet * duck(9.0)
sustained = carve(BUS['amb'] * db(4.0), 6.0) * duck_slow(6.0) + BUS['trav'] * db(-8.0) * duck_slow(3.0)
# masking guard: whenever the narration is present keep everything else >= MARGIN dB under it in the speech band (300 Hz-4 kHz)
from scipy.ndimage import uniform_filter1d, minimum_filter1d
MARGIN = 11.0
sosb = _sos('bp', [300, 4000], 4)
vb = sosfilt(sosb, voice)
bgs = np.stack([sosfiltfilt(sosb, bgm[c]) for c in range(2)])   # zero-phase split, so (bgm - bgs) holds no speech-band energy
win = int(0.03 * SR)
vr = np.sqrt(np.maximum(uniform_filter1d(vb ** 2, win), 0)); br = np.sqrt(np.maximum(uniform_filter1d((bgs ** 2).mean(0), win), 0))
g = np.where(vr > db(-48.0), np.clip(vr / (br + 1e-12) * db(-MARGIN), 0, 1), 1.0)
gf0 = g[::441]
gp = np.concatenate([gf0, np.ones(12)])
gf = np.minimum.reduce([gp[k:k + len(gf0)] for k in range(0, 9)])   # look-ahead 80 ms: duck BEFORE a consonant arrives
gf = minimum_filter1d(gf, 3)
sm = np.empty_like(gf); st = gf[0]; rel = 1 - np.exp(-0.01 / 0.12)
for i, x_ in enumerate(gf):
    st = x_ if x_ < st else st + (x_ - st) * rel
    sm[i] = st
gs = np.interp(np.arange(N) / SR, np.arange(len(sm)) * 0.01, sm)
bgm = (bgm - bgs) + bgs * gs[None, :]
mix = bgm + sustained + np.stack([voice, voice])   # narration, centre
# 30 ms edge fades (loop seam)
f = int(0.03 * SR); mix[:, :f] *= np.linspace(0, 1, f); mix[:, -f:] *= np.linspace(1, 0, f)
sf.write('timing/mix.wav', mix.T.astype(np.float32), SR, subtype='FLOAT')
sf.write('timing/voice_proc.wav', voice.astype(np.float32), SR, subtype='FLOAT')
m = pyln.Meter(SR)
print('mix LUFS', round(m.integrated_loudness(mix.T), 1), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 1), '| voice LUFS', round(m.integrated_loudness(voice), 1))
np.save('timing/ducking_A.npy', A_full[::441])
np.save('/tmp/trav_bus.npy', (BUS['trav'] * db(-8.0))[:, :int(21 * SR)])
print('  sustained LUFS', round(m.integrated_loudness(sustained.T), 1), '| transient bgm LUFS', round(m.integrated_loudness(bgm.T), 1))
