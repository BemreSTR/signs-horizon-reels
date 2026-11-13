"""QA scan for a silent render. Usage: python3 tools/qa_video.py out/E020_silent.mp4
Prints: frame count, black/frozen frames, luminance flash candidates (full-frame jumps), brightness oscillation rate, loop seam (first vs last frame difference)."""
import subprocess, sys
import numpy as np
f = sys.argv[1]
w, h = 270, 480
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
n = len(a); print('frames', n, 'secs', round(n / 30, 2))
lum = a.mean((1, 2))
black = np.where(lum < 6)[0]; print('black frames (lum<6):', black.tolist()[:20])
d = np.abs(np.diff(a, axis=0)).mean((1, 2))
frozen = [i for i in range(n - 1) if d[i] < 0.02]
print('frozen frame pairs (mean diff < 0.02):', len(frozen), frozen[:12])
jump = np.abs(np.diff(lum)); idx = np.argsort(-jump)[:8]
print('largest luminance jumps (frame, t, delta):', [(int(i), round(i / 30, 2), round(float(jump[i]), 1)) for i in sorted(idx)])
# flash: frames where >60% of pixels are bright (>200) -- a "full-screen bright" frame
bright = (a > 200).mean((1, 2)); fl = np.where(bright > 0.6)[0]; print('frames with >60% pixels > 200:', fl.tolist()[:20])
# oscillation: count direction reversals of a 5-frame smoothed luminance with amplitude > 12 inside any 1 s window
sm = np.convolve(lum, np.ones(5) / 5, mode='same'); dirs = np.sign(np.diff(sm)); worst = 0
for s0 in range(0, n - 30):
    seg = sm[s0:s0 + 30]; sd = np.sign(np.diff(seg)); rev = 0; last = 0; ext = [seg[0]]
    for i, v in enumerate(sd):
        if v != 0 and v != last:
            if last != 0 and abs(seg[i] - ext[-1]) > 12: rev += 1; ext.append(seg[i])
            last = v
    worst = max(worst, rev)
print('max large luminance reversals in any 1 s window:', worst, '(<= 6 keeps it under 3 Hz)')
print('loop seam: mean |last - first| =', round(float(np.abs(a[-1] - a[0]).mean()), 2), ' (consecutive-frame typical:', round(float(np.median(d)), 2), ')')
