"""Tam çözünürlüklü karelerde yazı sütununu (x 180–900) tara. Kullanım: python3 tools/safezone.py out/E018_silent.mp4 4.6 26.5 61.0
Parlak (lum>150) satır gruplarının x aralığını yazar; 178'den küçük / 902'den büyük olanları << ile işaretler (sahne öğeleri de çıkabilir, gözle ayır)."""
import subprocess, sys, io
import numpy as np
from PIL import Image
f = sys.argv[1]
for t in sys.argv[2:]:
    png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', t, '-i', f, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    a = np.asarray(Image.open(io.BytesIO(png)).convert('RGB')).astype(int)
    m = a.sum(axis=2) / 3 > 150
    rows = np.where(m.sum(axis=1) > 2)[0]; runs = []
    if len(rows):
        s = p = rows[0]
        for r in rows[1:]:
            if r > p + 6: runs.append((s, p)); s = r
            p = r
        runs.append((s, p))
    out = []
    for y0, y1 in runs:
        if y1 - y0 < 14: continue
        xs = np.where(m[y0:y1 + 1].any(axis=0))[0]
        if xs.max() - xs.min() < 120: continue
        out.append(f'y{y0}-{y1} x{xs.min()}-{xs.max()}' + (' <<' if xs.min() < 178 or xs.max() > 902 else ''))
    print(t, '|', '; '.join(out))
