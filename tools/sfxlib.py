"""Shared sound toolbox: dsp helpers and procedural generators (mono, peak ~1). Seeded: same call order, same sound."""
import json, glob, os, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt, sosfiltfilt, fftconvolve
import soundfile as sf
import pyloudnorm as pyln

SR = 44100
rng = np.random.default_rng(1511)

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
        k = int(t * SR); g = a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / (tau * rng.uniform(0.5, 1.6))); x[k:k + m] += g[:max(0, n - k)]
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

