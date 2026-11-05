"""E015 sound design: procedural SFX + continuous bed, ducked under the narration, mixed to timing/mix.wav.
Everything is synthesised (numpy), every hit is tied to a cue (docs/09). Seeds fixed."""
import json, glob, os, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt, sosfiltfilt, fftconvolve
import soundfile as sf
import pyloudnorm as pyln

SR = 44100
FPS = 30
TOTAL_F = 1497
TOTAL = TOTAL_F / FPS            # 49.9 s: voice + 0.45 s tail + 3 s outro
N = int(round(TOTAL * SR))
EP_END = 1407 / FPS              # outro starts here (46.9 s)
rng = np.random.default_rng(1511)

cues = json.load(open('public/ep/e015/cues.json'))['cues']
words = json.load(open('public/ep/e015/words.json'))
C = lambda n: cues[n]['ms'] / 1000
W = lambda i: words[i]['startMs'] / 1000
WE = lambda i: words[i]['endMs'] / 1000

# ---------------------------------------------------------------- dsp helpers
def _sos(kind, f, order=2):
    return butter(order, f, kind, fs=SR, output='sos')
bp = lambda x, lo, hi, o=2: sosfilt(_sos('bp', [lo, hi], o), x)
lp = lambda x, f, o=2: sosfilt(_sos('lp', f, o), x)
hp = lambda x, f, o=2: sosfilt(_sos('hp', f, o), x)
def T(d): return np.arange(int(d * SR)) / SR
def smooth(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
def norm(x, peak=1.0): m = np.abs(x).max(); return x * (peak / m) if m > 0 else x
def env_ar(n, a, r):
    t = np.arange(n) / SR; d = n / SR
    return smooth(t / max(a, 1e-4)) * smooth((d - t) / max(r, 1e-4))
def db(x): return 10 ** (x / 20)

def pink(n, lo=20, hi=SR / 2 - 1):
    spec = np.zeros(n // 2 + 1, complex); f = np.arange(len(spec)) * SR / n
    amp = (1 / np.sqrt(np.maximum(f, 1))) * ((f >= lo) & (f <= hi))
    spec = amp * np.exp(1j * rng.uniform(0, 2 * np.pi, len(spec)))
    return norm(np.fft.irfft(spec, n))

# ---------------------------------------------------------------- sound generators (mono, peak ~1)
def boom(f0=72, f1=33, dur=1.9, sat=1.6, thump=0.5):
    t = T(dur); f = f1 + (f0 - f1) * np.exp(-t / 0.13)
    x = np.tanh(sat * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / (dur * 0.26))
    x += thump * lp(rng.standard_normal(len(t)), 160) * np.exp(-t / 0.035) * 5
    x = norm(x)
    tb = T(min(dur, 0.55)); fb = 92 + (230 - 92) * np.exp(-tb / 0.045)
    b = np.tanh(2.4 * np.sin(2 * np.pi * np.cumsum(fb) / SR)) * np.exp(-tb / 0.12)
    cl = bp(rng.standard_normal(len(tb)), 260, 2400) * np.exp(-tb / 0.018) * 1.6
    x[:len(tb)] += 0.9 * norm(b + 0.55 * cl)
    return norm(x)

def wax_crack():
    n = int(0.55 * SR); x = np.zeros(n); t = np.arange(n) / SR
    for dt, a, h in [(0, 1, 2200), (0.027, .7, 3000), (0.064, .85, 2000), (0.108, .5, 3600), (0.168, .4, 4800), (0.236, .25, 5200), (0.31, .15, 6000)]:
        k = int(dt * SR); m = int(0.014 * SR)
        b = hp(rng.standard_normal(m), h) * np.exp(-np.arange(m) / SR / 0.0028)
        x[k:k + m] += a * b
    for f, tau, a in [(2620, 0.10, .30), (4130, 0.07, .20), (5870, 0.05, .12), (7400, 0.03, .08)]:
        x += a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    return norm(x)

def sparkles(dur, d0, d1, lo=2600, hi=9500, tau=0.03):
    n = int(dur * SR); x = np.zeros(n); t = 0.0
    while t < dur:
        d = d0 + (d1 - d0) * (t / dur); t += rng.exponential(1 / max(d, 0.1))
        if t >= dur - 0.2: break
        f = rng.uniform(lo, hi); m = int(0.22 * SR); tt = np.arange(m) / SR
        a = rng.uniform(0.2, 1) * (1 - t / dur) ** 0.7
        k = int(t * SR); x[k:k + m] += a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / (tau * rng.uniform(0.5, 1.6)))
    return norm(x)

def shimmer(dur, lo=1800, hi=7000, parts=16, a=0.35, r=0.6):
    t = T(dur); x = np.zeros(len(t))
    for _ in range(parts):
        f = rng.uniform(lo, hi); trem = 0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(.25, 1.8) * t + rng.uniform(0, 6.28))
        x += rng.uniform(.3, 1) * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * trem
    return norm(x * env_ar(len(t), a, r))

def sweep_noise(dur, f0, f1, width=0.22, bands=14, reverse=False, shape='bell'):
    """Band-limited noise whose centre sweeps f0 -> f1 (log). reverse=True -> amplitude swell that ends abruptly."""
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    fs = np.geomspace(f0, f1, bands)
    base = rng.standard_normal(n)
    for i, f in enumerate(fs):
        c = (i + 0.5) / bands
        g = np.exp(-((t / dur - c) ** 2) / (2 * width ** 2))
        x += g * bp(base, f / 1.35, min(f * 1.35, SR / 2 - 100), 2)
    if reverse: x *= (t / dur) ** 2
    else: x *= env_ar(n, dur * .25, dur * .5)
    return norm(x)

def whoosh(dur=0.9, up=True, lo=220, hi=4200):
    return sweep_noise(dur, lo, hi, width=0.2) if up else sweep_noise(dur, hi, lo, width=0.2)

def choir(dur, notes, a=2.0, r=2.5, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros((2, n))
    for ni, f0 in enumerate(notes):
        for vi, cents in enumerate((-7, 0, 6)):
            f = f0 * 2 ** (cents / 1200) * (1 + 0.0035 * np.sin(2 * np.pi * (5.0 + 0.3 * vi) * t + ni + vi))
            ph = 2 * np.pi * np.cumsum(f) / SR; v = np.zeros(n)
            for h in range(1, 11): v += np.sin(h * ph + h) / h ** (1.15 / bright)
            pan = (vi - 1) * 0.55 + (ni - 2) * 0.05
            out[0] += v * np.cos((pan + 1) * np.pi / 4); out[1] += v * np.sin((pan + 1) * np.pi / 4)
    res = np.zeros_like(out)
    for ch in range(2):
        res[ch] = 0.45 * out[ch] + 1.2 * bp(out[ch], 600, 820) + 0.9 * bp(out[ch], 1050, 1400)
    return norm(res) * env_ar(n, a, r)

def bell(f, dur=2.2, ratios=(1, 2.76, 5.4, 8.93), amps=(1, .55, .28, .12)):
    t = T(dur); x = np.zeros(len(t))
    for r, a in zip(ratios, amps): x += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (dur * 0.34 / (1 + 0.6 * (r - 1))))
    x[:int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return norm(x)

def tick(kind):
    n = int(0.05 * SR); t = np.arange(n) / SR
    c = hp(rng.standard_normal(n), 1800) * np.exp(-t / 0.004)
    if kind == 0: c = c + 0.7 * np.sin(2 * np.pi * 2100 * t) * np.exp(-t / 0.008)
    else: c = 0.6 * c + 1.0 * np.sin(2 * np.pi * 980 * t) * np.exp(-t / 0.012) + 0.4 * np.sin(2 * np.pi * 1450 * t) * np.exp(-t / 0.006)
    return norm(c)

def crackle(dur, rate_fn, hi=7000):
    n = int(dur * SR); x = np.zeros(n); t = 0.0
    while True:
        t += rng.exponential(1 / max(rate_fn(t), 0.2))
        if t >= dur - 0.05: break
        big = rng.random() < 0.12; m = int((0.012 if big else 0.004) * SR)
        e = np.exp(-np.arange(m) / SR / (0.004 if big else 0.0012))
        b = bp(rng.standard_normal(m), rng.uniform(1400, hi * 0.8), hi) * e if not big else lp(rng.standard_normal(m), 2400) * e
        x[int(t * SR):int(t * SR) + m] += b[:max(0, min(m, n - int(t * SR)))] * rng.uniform(0.15, 1) ** 2 * (2.2 if big else 1)
    return norm(x) * 0.9

def wind(dur, lo=240, hi=1500):
    n = int(dur * SR); t = np.arange(n) / SR
    x = bp(pink(n), lo, hi, 2)
    g = 0.55 + 0.3 * np.sin(2 * np.pi * 0.11 * t + 1) + 0.15 * np.sin(2 * np.pi * 0.27 * t)
    return norm(x * g)

def grind(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    low = lp(rng.standard_normal(n), 380) * (0.55 + 0.45 * np.sin(2 * np.pi * 6.5 * t) ** 2)
    mid = bp(rng.standard_normal(n), 500, 1700) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t + 2) ** 2) * 0.35
    sub = np.sin(2 * np.pi * (44 + 6 * np.sin(2 * np.pi * 0.7 * t)) * t) * 0.8
    return norm((low + mid + sub) * env_ar(n, dur * 0.3, dur * 0.35))

def heartbeat():
    n = int(0.4 * SR); t = np.arange(n) / SR
    f = 38 + 22 * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09)
    x += 0.5 * lp(rng.standard_normal(n), 220) * np.exp(-t / 0.012)
    return norm(x)

def hush(dur=0.8):
    return sweep_noise(dur, 5200, 260, width=0.25)

def reverse_swell(dur=1.6, lo=300, hi=6000):
    return sweep_noise(dur, lo, hi, width=0.3, reverse=True)


def accel_travel(dur, rate0=2.4, rate1=34.0):
    """The road of 3,600 days: a pulse train that accelerates smoothly (soft footfalls -> rotor -> a fused rising tone),
    with a rising air sweep and a low body. Built so that most energy sits below 300 Hz and above 3 kHz, clear of the voice."""
    n = int(dur * SR); t = np.arange(n) / SR; u = t / dur
    rate = rate0 * (rate1 / rate0) ** (u ** 1.25)
    phi = np.cumsum(rate) / SR
    pulse = 0.5 - 0.5 * np.cos(2 * np.pi * phi)
    depth = 0.95 - 0.5 * smooth((u - 0.5) / 0.45)
    am = (1 - depth) + depth * pulse ** 1.4
    rn = lambda x: x / (np.sqrt((x ** 2).mean()) + 1e-9)          # equal-RMS components: no single layer decides the peak
    out = np.zeros((2, n))
    for ch in range(2):
        carrier = sweep_noise(dur, 420, 8000, width=0.30, bands=20, reverse=True) / np.maximum(u, 0.12) ** 2 * (0.65 + 0.35 * u) * am
        air = hp(rng.standard_normal(n), 4200) * (0.12 + 0.88 * u ** 0.9) * (0.45 + 0.55 * pulse ** 1.2)
        chug = bp(rng.standard_normal(n), 70, 240) * am * (0.3 + 0.7 * u ** 1.1)
        out[ch] = 1.0 * rn(carrier) + 0.8 * rn(air) + 0.45 * rn(chug)
    f = 150 * 7.5 ** (u ** 1.1); ph = 2 * np.pi * np.cumsum(f) / SR
    tone = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * (u ** 1.6) * (0.7 + 0.3 * pulse)
    sub = np.sin(2 * np.pi * np.cumsum(42 + 36 * u ** 1.3) / SR) * (u ** 2) * (0.6 + 0.4 * pulse)
    out += 0.22 * rn(tone) + 0.3 * rn(sub)
    sosm = _sos('bp', [450, 2600], 2)
    for ch in range(2):                                                # carve the voice band instead of gating it
        out[ch] = out[ch] - (1 - db(-11.0)) * sosfiltfilt(sosm, out[ch])
    out *= np.minimum(1, (dur - t) / 0.05)                              # clean cut at the lock
    return out / np.abs(out).max()

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
