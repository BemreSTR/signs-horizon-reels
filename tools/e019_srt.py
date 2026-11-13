"""E019 captions.srt (phrase level) from the ElevenLabs word times. Usage: python3 tools/e019_srt.py -> out/E019/captions.srt"""
import json, os
ws = json.load(open('public/ep/e019/words.json'))
groups, cur = [], []
def flush():
    global cur
    if cur: groups.append(cur); cur = []
for w in ws:
    cur.append(w)
    t = w['text'].strip()
    n = len(cur); chars = len(' '.join(x['text'].strip() for x in cur))
    if (t[-1] in '.?!' and n >= 2) or (t[-1] in ',:' and n >= 4) or chars >= 60 or n >= 12: flush()
flush()
def ts(ms):
    ms = int(round(ms)); h, r = divmod(ms, 3600000); m, r = divmod(r, 60000); s, ms = divmod(r, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
out = []
for i, g in enumerate(groups):
    a = g[0]['startMs']; b = g[-1]['endMs'] + 120
    if i + 1 < len(groups): b = min(b, groups[i + 1][0]['startMs'] - 20)
    out.append(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{' '.join(x['text'].strip() for x in g)}\n")
os.makedirs('out/E019', exist_ok=True)
open('out/E019/captions.srt', 'w').write('\n'.join(out))
print(len(groups), 'cues')
