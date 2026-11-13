"""E019 Gemini kapağındaki yanlış gömülü yazıyı (eksik harf) yıldız izi kutbu etrafında döndürerek doldurur. Referans betik: parametreler (cx,cy kutup, y aralığı) E019 görseline özeldir; bkz. CLAUDE.md E019 dersi.
Çalıştırmadan önce: mkdir -p out"""
import cv2, numpy as np
S='out/'  # ara çıktı klasörü (out/ git dışı)
im=cv2.imread('public/ep/e019/gemini_cover.jpg'); H,W=im.shape[:2]
cx,cy=720,2296
y0,y1=int(430*1.29),int(1250*1.29)
g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
m=np.zeros((H,W),np.uint8); m[y0:y1]=(g[y0:y1]>140)
n,lab,stats,cent=cv2.connectedComponentsWithStats(m,8)
big=np.zeros((H,W),np.uint8)
for i in range(1,n):
    x,y,w,h,a=stats[i]
    if h>40 or a>1500: big[lab==i]=255
near=cv2.dilate(big,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(121,121)))
mask=big.copy()
for i in range(1,n):
    if (near[lab==i]>0).any() and big[lab==i].max()==0: mask[lab==i]=255   # period, serifs fragments
mask=cv2.dilate(mask,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(55,55)))
cv2.imwrite(S+'mask2.png',mask)
out=im.copy(); filled=(mask==0)
ys,xs=np.mgrid[0:H,0:W].astype(np.float32)
dx=xs-cx; dy=ys-cy; r=np.hypot(dx,dy); ph=np.arctan2(dy,dx)
angles=[]
for k in range(1,60):
    a=k*1.5
    angles+= [a,-a]
for a in angles:
    if filled.all(): break
    th=np.deg2rad(a)
    sx=(cx+r*np.cos(ph+th)).astype(np.float32); sy=(cy+r*np.sin(ph+th)).astype(np.float32)
    ok=(sx>=0)&(sx<W-1)&(sy>=0)&(sy<H-1)
    src_ok=np.zeros((H,W),bool)
    si=np.clip(sy.astype(int),0,H-1); sj=np.clip(sx.astype(int),0,W-1)
    src_ok=ok&(mask[si,sj]==0)
    # keep sources inside the sky (above the town) only
    src_ok&=(sy<1700*1.29)
    take=(~filled)&src_ok
    if take.any():
        rem=cv2.remap(im,sx,sy,cv2.INTER_LINEAR)
        out[take]=rem[take]; filled|=take
print('unfilled',(~filled).sum())
# feather blend at the seam
soft=cv2.GaussianBlur(((mask>0)).astype(np.float32),(0,0),7)[...,None]
res=(out*soft+im*(1-soft)).astype(np.uint8)
res=np.where(mask[...,None]>0,out,res) if False else res
# inside the mask use out, outside use im, feathered edges
inner=cv2.GaussianBlur((mask>0).astype(np.float32),(0,0),6)[...,None]
res=(out.astype(np.float32)*inner+im.astype(np.float32)*(1-inner))
res=np.where((mask>0)[...,None],out,res).astype(np.uint8)
cv2.imwrite('public/ep/e019/cover_clean.jpg',res,[cv2.IMWRITE_JPEG_QUALITY,95])
cv2.imwrite(S+'clean_small.png',cv2.resize(res,(559,1000)))
cv2.imwrite(S+'clean_crop.png',res[int(400*1.29):int(1300*1.29)])
