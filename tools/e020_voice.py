"""E020 voiced version: the same video, ElevenLabs narration (public/ep/e020/voice.mp3) laid on the 120 BPM grid over the procedural music/sfx.
Clock stays the beat grid: each spoken line is cut out of the single take and placed at its on-screen beat (TARGETS below); the video is untouched.
Run: PYTHONPATH=tools python3 tools/e020_audio.py && PYTHONPATH=tools python3 tools/e020_voice.py
then: SUFFIX=_voice python3 tools/master.py E020 38.0   ->  out/E020_voice.mp4"""
import os, shutil, subprocess
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt
from scipy.ndimage import uniform_filter1d
SR = 44100
shutil.copy('timing/mix.wav', 'timing/mix_music.wav')
music, sr = sf.read('timing/mix_music.wav'); assert sr == SR; music = music.T          # (2, N)
N = music.shape[1]
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'public/ep/e020/voice.mp3', '-ac', '1', '-ar', str(SR), 'timing/e020_voice_raw.wav'], check=True)
v, _ = sf.read('timing/e020_voice_raw.wav')
v = sosfiltfilt(butter(2, 75, 'hp', fs=SR, output='sos'), v)
# (source speech start, source speech end, on-screen onset time); source runs come from silencedetect (-38 dB, 0.2 s) on the take
LINES = [
    (0.000, 0.942, 0.00),    # That bee...
    (1.203, 1.862, 1.50),    # is a she.
    (2.447, 5.421, 2.60),    # Every honeybee you see collecting nectar is female.
    (5.824, 7.463, 6.00),    # The males never forage.
    (7.807, 9.920, 8.50),    # Every worker in the hive is female.
    (10.557, 13.111, 10.95), # Now, how does the Quran speak to the bee?
    (13.656, 15.340, 14.05), # Make homes in the mountains.
    (15.708, 17.572, 17.05), # Then eat from all the fruits.
    (17.905, 19.560, 20.05), # Follow the ways of your Lord.
    (20.177, 22.155, 22.95), # Classical grammar allows the feminine.
    (22.614, 24.124, 25.00), # Biology says female.
    (24.515, 25.821, 26.60), # We claim nothing more.
    (26.250, 28.083, 28.50), # A drink of varying colors.
    (28.658, 30.445, 31.00), # The smallest worker in the hive...
    (30.782, 32.048, 33.00), # is addressed as "you."
]
voice = np.zeros(N)
for a, b, t in LINES:
    s0, s1 = int(max(a - 0.03, 0) * SR), int(min(b + 0.07, len(v) / SR) * SR)
    seg = v[s0:s1].copy(); f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    k = int(round((t - (a - max(a - 0.03, 0))) * SR)); k = max(k, 0)
    voice[k:k + len(seg)] += seg[:N - k]
# presence: a gentle lift 2.5-4.5 kHz (phone speakers), zero-phase
voice = voice + 0.18 * sosfiltfilt(butter(2, [2500, 4500], 'bp', fs=SR, output='sos'), voice)
mt = pyln.Meter(SR)
voice *= 10 ** ((-16.0 - mt.integrated_loudness(np.stack([voice, voice]).T)) / 20)
# speech activity: fast attack, slow release (no syllable gating)
hop = int(0.01 * SR); nfr = N // hop
rms = np.sqrt((voice[:nfr * hop].reshape(nfr, hop) ** 2).mean(1)) + 1e-9
act = (20 * np.log10(rms) > -50).astype(float)
act = np.maximum.accumulate(np.concatenate([act, np.zeros(60)])[:nfr]) * 0 + act
sm = np.zeros(nfr); g = 0.0
for i in range(nfr):                      # attack 40 ms, release 450 ms; look-ahead handled by shifting 60 ms earlier
    j = min(i + 6, nfr - 1); tgt = act[j]
    g += (tgt - g) * (1 - np.exp(-0.01 / (0.04 if tgt > g else 0.45)))
    sm[i] = g
A = np.interp(np.arange(N), np.arange(nfr) * hop + hop / 2, sm)
DUCK_MID, DUCK_LO = float(os.environ.get('DUCK_MID', 13.0)), 2.5
lo = np.stack([sosfiltfilt(butter(4, 160, 'lp', fs=SR, output='sos'), music[c]) for c in range(2)])
rest = music - lo
gm = 10 ** (-DUCK_MID * A / 20); gl = 10 ** (-DUCK_LO * A / 20)
MUSIC_DB = float(os.environ.get('MUSIC_DB', -10.0))
bg = (rest * gm + lo * gl) * 10 ** (MUSIC_DB / 20)
mix = bg + np.stack([voice, voice])
pk = np.abs(mix).max(0)
sf.write('timing/mix.wav', mix.T.astype(np.float32), SR, subtype='FLOAT')
sf.write('timing/voice_proc.wav', voice.astype(np.float32), SR, subtype='FLOAT')
# speech-band margin (docs/09: median >= 18 dB, bottom 10% >= 10 dB)
sos = butter(4, [300, 4000], 'bp', fs=SR, output='sos'); bgm = bg.mean(0)
vb, bb = sosfilt(sos, voice), sosfilt(sos, bgm); h = int(0.05 * SR); n = N // h
vr = np.array([np.sqrt((vb[i * h:(i + 1) * h] ** 2).mean()) for i in range(n)]); br = np.array([np.sqrt((bb[i * h:(i + 1) * h] ** 2).mean()) for i in range(n)])
sp = 20 * np.log10(vr + 1e-9) > -38; m = 20 * np.log10(vr[sp] / (br[sp] + 1e-9))
print(f'speech-band margin: median {np.median(m):.1f}  bottom10% {np.percentile(m, 10):.1f}  min {m.min():.1f}  frames {sp.sum()}')
print('mix LUFS', round(mt.integrated_loudness(mix.T), 1), 'peak', round(20 * np.log10(pk.max()), 1))
