"""Konu öznesini arka plandan ayır (yazıyı arkasına koymak için). E020'de kullanıldı.
Kullanım: python3 tools/cutout.py e020 hero drone   ->  public/ep/e020/hero_cut.png, drone_cut.png
Gerekenler: pip install rembg onnxruntime; ilk çalıştırmada isnet-general-use modeli (~170 MB) GitHub'dan ~/.u2net ya da ~/.rembg altına iner
(ağ kapalıysa modeli elle koy: https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx)."""
import sys
from rembg import remove, new_session
from PIL import Image
ep, names = sys.argv[1], sys.argv[2:]
s = new_session('isnet-general-use')
for n in names:
    im = Image.open(f'public/ep/{ep}/{n}.jpg').convert('RGB')
    out = remove(im, session=s, alpha_matting=True, alpha_matting_foreground_threshold=235,
                 alpha_matting_background_threshold=15, alpha_matting_erode_size=8)
    out.save(f'public/ep/{ep}/{n}_cut.png'); print(n, out.size, out.mode)
