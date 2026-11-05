import numpy as np, soundfile as sf, sys
from scipy.signal import butter, sosfilt
SR=44100
mix,_=sf.read('timing/mix.wav'); v,_=sf.read('timing/voice_proc.wav'); mix=mix.mean(1); bg=mix-v
sos=butter(4,[300,4000],'bp',fs=SR,output='sos'); hp=butter(4,160,'hp',fs=SR,output='sos')
bgh=sosfilt(hp,bg); bgl=bg-bgh
def rms(x,a,b): s=x[int(a*SR):int(b*SR)]; return 20*np.log10(np.sqrt((s**2).mean())+1e-9)
def pk(x,a,b): s=x[int(a*SR):int(b*SR)]; return 20*np.log10(np.abs(s).max()+1e-9)
vb=sosfilt(sos,v); bb=sosfilt(sos,bg); hop=int(0.05*SR); n=len(v)//hop
vr=np.array([np.sqrt((vb[i*hop:(i+1)*hop]**2).mean()) for i in range(n)]); br=np.array([np.sqrt((bb[i*hop:(i+1)*hop]**2).mean()) for i in range(n)])
vdb=20*np.log10(vr+1e-9); sp=vdb>-38  # real speech frames
m=20*np.log10(vr[sp]/(br[sp]+1e-9))
print(f'speech-band margin (voice frames > -38 dB): median {np.median(m):.1f}  bottom10% {np.percentile(m,10):.1f}  min {m.min():.1f}  | frames {sp.sum()}')
ev=[('title punch',0.0,0.6),('crack @2.8',2.78,3.6),('tilt 4.0',3.9,4.9),('condemned',12.63,13.5),('leak',14.3,15.3),('clock 17',16.8,17.6),('arrival',19.95,20.8),('army',21.0,21.5),('bells',26.0,27.0),('door',30.5,32.0),('open',31.6,32.6),('tilt down',41.8,42.7),('final',45.0,46.0),('outro hit',47.7,48.7)]
print('voice rms',round(rms(v,0.2,46.4),1),'| event: all-rms, >160Hz rms, >160Hz peak, <160Hz rms')
for nme,a,b in ev: print(f'{nme:12s} {rms(bg,a,b):6.1f} {rms(bgh,a,b):6.1f} {pk(bgh,a,b):6.1f} {rms(bgl,a,b):6.1f}')
print('mix peak',round(pk(mix,0,50),1))
