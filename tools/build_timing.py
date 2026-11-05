"""Word timings -> words.json / cues.json / pauses.json / captions.srt (E015).
Source: pocketsphinx forced alignment (timing/align_raw.json), snapped to ffmpeg silencedetect boundaries (H69-style check)."""
import json, re, subprocess, math, glob
FPS = 30
MP3 = glob.glob('/mnt/user-data/attachments/*/31c7352b-*.mp3')[0]
al = json.load(open('timing/align_raw.json'))
dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',MP3]).decode())
out = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',MP3,'-af','silencedetect=noise=-38dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
sil = list(zip(starts, ends))
W = [dict(i=a['i'], text=a['text'], s=a['start'], e=a['end']) for a in al]
W[0]['s'] = 0.12  # measured speech onset (energy > -45 dB)
snapped = []
for (s, e) in sil:
    if e >= dur - 0.05:   # trailing silence
        W[-1]['e'] = min(W[-1]['e'], s); continue
    # boundary k: between W[k-1] and W[k]
    best, bd = None, 9
    for k in range(1, len(W)):
        d = abs((W[k-1]['e'] + W[k]['s'])/2 - (s+e)/2)
        if d < bd: best, bd = k, d
    if bd > 0.35: continue
    k = best
    W[k-1]['e'] = max(W[k-1]['s'] + 0.06, min(W[k-1]['e'], s + 0.02))
    W[k]['s'] = max(W[k]['s'], e - 0.02)
    snapped.append((k, round(s,2), round(e,2)))
for k in range(1, len(W)):                      # monotonic
    if W[k]['s'] < W[k-1]['e']: W[k]['s'] = W[k-1]['e']
    if W[k]['e'] <= W[k]['s']: W[k]['e'] = W[k]['s'] + 0.06
words = [{"text": (" " if i else "") + w['text'], "startMs": round(w['s']*1000), "endMs": round(w['e']*1000),
          "timestampMs": round((w['s']+w['e'])*500), "confidence": None} for i, w in enumerate(W)]
# sentence ends -> pageBreakAfter
for i, w in enumerate(W):
    if re.search(r'[.:]$|\.\.\.$', w['text']): words[i]['pageBreakAfter'] = True
json.dump(words, open('public/ep/e015/words.json','w'), ensure_ascii=False, indent=1)
# cues: name -> word index (anchor start) per 03-senaryo.md
anchors = dict(hook=0, destroyed=7, mecca=10, abu_lahab=19, blazing=24, condemned=28, ten_years=36, three_thousand=40,
               army=49, sword=55, four_words=64, open=78, defeating=87, enemy=99, ten_years_echo=108)
exp = dict(hook='For', destroyed='destroyed', mecca='Mecca,', abu_lahab='Abu', blazing='blazing', condemned='condemned', ten_years='ten',
           three_thousand='three', army='army,', sword='sword.', four_words='four', open='open.', defeating='defeating', enemy='enemy',
           ten_years_echo='ten')
cues = {}
for n, i in anchors.items():
    assert W[i]['text'] == exp[n], (n, i, W[i]['text'])      # H65: indices must match the expected word
    cues[n] = dict(ms=words[i]['startMs'], frame=round(W[i]['s']*FPS), anchor='start', wordIndex=i, word=W[i]['text'])
# extra anchors used by the scenes
for n, i in dict(i_accept=70, accept=71, your=72, faith=73, door=75, wide=77, never=90, impostor=95, key=101, destruction=105,
                 because=106, final_destroyed=114, honest_start=94, alive=31, lived=34, days=44, utter=63).items():
    cues[n] = dict(ms=words[i]['startMs'], frame=round(W[i]['s']*FPS), anchor='start', wordIndex=i, word=W[i]['text'])
json.dump(dict(version=1, fps=FPS, audioDurationMs=round(dur*1000), cues=cues), open('public/ep/e015/cues.json','w'), indent=1)
json.dump([dict(startMs=round(s*1000), endMs=round(e*1000), source='silencedetect') for s,e in sil], open('public/ep/e015/pauses.json','w'), indent=1)
print('duration', dur, 'snapped', len(snapped))
for n,c in list(cues.items())[:16]: print(f"{n:15s} {c['ms']/1000:6.2f}s f{c['frame']:4d} {c['word']}")
# SRT for platforms: pages of max ~2 lines / 7 words, split at sentence ends & pauses
def ts(t):
    h=int(t//3600); m=int(t%3600//60); s=t%60; return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s-int(s))*1000)):03d}"
pages=[]; cur=[]
for i,w in enumerate(W):
    cur.append(w)
    last = i==len(W)-1
    nxt_gap = (W[i+1]['s']-w['e']) if not last else 9
    if last or re.search(r'[.:?!]$', w['text']) or len(cur)>=8 or (re.search(r',$', w['text']) and len(cur)>=4) or nxt_gap>0.45:
        pages.append(cur); cur=[]
srt=[]
for n,p in enumerate(pages,1):
    txt=' '.join(x['text'] for x in p)
    mid=len(txt)//2
    if len(txt)>36:
        sp=[m.start() for m in re.finditer(' ',txt)]; cut=min(sp,key=lambda x:abs(x-mid)); txt=txt[:cut]+'\n'+txt[cut+1:]
    srt.append(f"{n}\n{ts(p[0]['s'])} --> {ts(p[-1]['e']+0.1)}\n{txt}\n")
open('timing/captions.srt','w').write('\n'.join(srt))
print(len(pages),'caption pages')
