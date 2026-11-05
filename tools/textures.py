"""Procedural textures for E015 (own seeds, H67). basalt.png = columnar basalt (Voronoi), grain.png = tileable film grain."""
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree
from scipy.ndimage import gaussian_filter, zoom

def fbm(h, w, rng, octaves=6, base=4):
    out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        n = max(2, base * 2**o)
        g = rng.standard_normal((int(n*h/w)+2, n+2)).astype(np.float32)
        z = zoom(g, (h/(g.shape[0]-1), w/(g.shape[1]-1)), order=3)[:h, :w]
        out += amp*z; tot += amp; amp *= 0.55
    return out/tot

def basalt(W=1296, H=2304, seed=1511):
    rng = np.random.default_rng(seed)
    # Voronoi columns
    cell = 118
    gx, gy = np.meshgrid(np.arange(-1, W//cell+2), np.arange(-1, H//cell+2))
    pts = np.stack([(gx*cell + rng.uniform(0.15, 0.85, gx.shape)*cell).ravel(), (gy*cell + rng.uniform(0.15, 0.85, gy.shape)*cell).ravel()], 1)
    tree = cKDTree(pts)
    yy, xx = np.mgrid[0:H, 0:W]
    q = np.stack([xx.ravel(), yy.ravel()], 1)
    d, idx = tree.query(q, k=2)
    edge = (d[:, 1] - d[:, 0]).reshape(H, W)
    cid = idx[:, 0].reshape(H, W)
    tone = rng.uniform(-1, 1, len(pts))[cid].astype(np.float32)
    # per-cell slight tilt (light direction) so columns catch light differently
    tilt = (rng.uniform(-1, 1, (len(pts), 2))[cid]).astype(np.float32)
    cx = pts[cid, 0]; cy = pts[cid, 1]
    shade = ((xx - cx) * tilt[..., 0] + (yy - cy) * tilt[..., 1]) / cell * 0.35
    edge_dark = np.clip(1 - edge / 7.0, 0, 1) ** 1.5           # dark seams
    edge_hi = np.clip(1 - np.abs(edge - 11) / 5.0, 0, 1) * 0.35  # faint chamfer highlight
    n1 = fbm(H, W, rng, 7, 3); n2 = fbm(H, W, rng, 5, 24)
    speck = gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 0.8)
    v = 0.30 + 0.07*tone + 0.05*shade + 0.10*n1 + 0.05*n2 + 0.05*speck + 0.05*edge_hi - 0.28*edge_dark
    v = np.clip(v, 0, 1)
    # blue-black stone palette (night950 -> a lighter slate)
    lo = np.array([6, 9, 15], np.float32); hi = np.array([58, 68, 88], np.float32)
    img = lo + (hi - lo) * (v[..., None] ** 1.55)
    # a few faint gold seams (mineral veins) along some cell edges
    veins = (edge < 3.2) & (rng.uniform(size=len(pts))[cid] > 0.9)
    veins = gaussian_filter(veins.astype(np.float32), 1.1)
    img += veins[..., None] * np.array([46, 34, 12], np.float32)
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save('public/tex/basalt.jpg', quality=92)

def grain(W=1200, H=2100, seed=2026):
    rng = np.random.default_rng(seed)
    g = rng.standard_normal((H, W)).astype(np.float32)
    g = gaussian_filter(g, 0.7)
    g = np.clip(0.5 + g / (6*g.std()), 0, 1)
    a = (g * 255).astype(np.uint8)
    Image.fromarray(a, 'L').save('public/tex/grain.png')

grain()
print('ok')
