# Signs in the Horizon · Reels studio

Remotion (React/TS) + numpy sound design. Kurallar ve içerik: Claude Project `signs-in-the-horizon` (`08-gorsel-dil`, `09-ses-tasarimi`, `13-hatalar-ve-dersler`).

## Kurulum
```bash
npm install
pip install --break-system-packages numpy scipy soundfile pyloudnorm pocketsphinx pillow
```

## Bölümler
- **E015** The Open Check: seslendirmeli (`src/E015.tsx`, `tools/sfx_mix.py`).
- **E016** The Pomegranate Problem: seslendirmesiz, müzikli (`src/e016/`, `tools/e016_audio.py`, `episodes/e016-the-pomegranate-problem.md`).

Ortak ses araçları `tools/sfxlib.py`.

## Bölüm akışı (E015 örneği)
```bash
# 1. ses → zamanlama (public/ep/e015/{words,cues,pauses}.json, timing/captions.srt)
python3 tools/align.py && python3 tools/build_timing.py      # girdi: timing/words.txt, timing/voice16k.wav
# 2. video (sessiz)
tools/render.sh E015
# 3. ses efektleri + miks → timing/mix.wav, sonra master + mux → out/E015.mp4
python3 tools/sfx_mix.py && python3 tools/mix_report.py
python3 tools/master.py E015
# kapaklar / kontrol kareleri
node tools/stills.mjs Cover1 out/covers 0
```
Yapı: `src/scenes` bölüme özel sahneler, `src/lib` zaman/kamera/cue, `src/components` ortak katmanlar, `src/covers`, `src/brandkit` (marka outro). `tools/sfx_mix.py`: üstte sentezleyiciler, altta bölümün partisyonu.
