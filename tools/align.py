import re, wave, json, sys
from pocketsphinx import Decoder, Config
cfg = Config(); cfg.set_string('-loglevel','FATAL')
d = Decoder(cfg)
d.add_word('lahab','L AA HH AA B',False)
d.add_word("prophet's",'P R AA F AH T S',False)
raw = wave.open('timing/voice16k.wav','rb').readframes(10**9)
orig = open('timing/words.txt').read().split()
words = [re.sub(r"[^a-z']", '', w.lower()) for w in orig]
d.set_align_text(' '.join(words))
d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
segs=[(re.sub(r'\(\d\)','',s.word), s.start_frame/100, (s.end_frame+1)/100) for s in d.seg()]
sp=[s for s in segs if not s[0].startswith('<') and not s[0].startswith('[')]
assert len(sp)==len(orig), (len(sp), len(orig))
out=[{'i':i,'text':orig[i],'start':sp[i][1],'end':sp[i][2]} for i in range(len(orig))]
json.dump(out, open('timing/align_raw.json','w'), indent=1)
for o in out: print(o['i'], o['text'], o['start'], o['end'])
