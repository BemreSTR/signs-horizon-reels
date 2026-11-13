# 10 · Teknik Mimari

Remotion projesinin yapısı, cue tabanlı zaman çizelgesi, ses hizalama, araçlar ve render.

> **Depo notu (önemli):** Bu doküman Project'ten, E001–E014'ün üretildiği eski "kuranmucizeleri2" (macOS M2, `studio/` klasörü) düzeninden alındı. **Bu depoda (E015–E020) Remotion kökte** durur: `src/`, `public/`, `remotion.config.ts`; araçlar `tools/` altında ve eski `render_episode.py` / `qa.py` / `ingest.py` yerine `tools/render.sh`, `tools/master.py`, `tools/qa_video.py`, `tools/safezone.py`, `tools/stills.mjs`, `tools/sfxlib.py`, `tools/eNNN_audio.py` vardır. Güncel çalışma akışı için kök [README.md](../README.md) ve `episodes/*.md` geçerlidir; bu dosya tasarım gerekçeleri (determinizm, cue mantığı, H## tuzakları) için tutulur. `studio/...` yollarını `...` olarak oku.

## 1. Yığın ve kararlar

- **Remotion 4.0.53x** (React + TypeScript), Node 22, sistem Chrome'u; Python 3.13 (stable-ts 2.19.1, openai-whisper, numpy, scipy, soundfile, librosa), ffmpeg 9. Sürüm kontrolü **git** (`main`); ses ve render çıktıları `.gitignore`'da (`episodes/*/out/`, `review/`, `voice.final.wav`, `public/ep/*/voice.wav`), `voice.mp3` depoda.
- **Motor: Remotion'da kalınır.** HyperFrames (HeyGen, 1.0 öncesi) aynı Chrome sorunlarını taşıyor, Arapça RTL hataları açık; darboğaz motor değil (2026-10-25 kararı).
- **Dış kütüphane kararı (2026-10-27):** hazır Remotion şablonları, `remotion-captions-kit` ve `pmndrs/drei` kurulmaz (kart estetiği, kendi altyazı sistemimiz, `useFrame` determinizmi bozar). `rough` gerekirse sabit seed'le. Arapça yazılış efekti: paketsiz SVG/CSS maske (`kit/ArabicInk.tsx`); mekanik kalırsa `harfbuzzjs` yalnızca hazırlık betiğinde.
- **Yeniden kullanım ilkesi:** **tesisat** (yükleyici, cue zamanlaması, altyazı, ses miksi, render, QA) ve **marka** (altyazı, ayet tipografisi, künye, nur noktası, outro, filigran) ortak; **ekran** (dünya, kamera, imza anı) her bölümde yeni. Yeniden kullanılan şey sahne değil, motorlardır (deniz, gök, kum, parşömen, ışık üreten fonksiyonlar).

## 2. Proje yapısı (eski düzen)

```
studio/
├── remotion.config.ts, scripts/chrome.sh (H12), scripts/safe-zone-scan.js (H59)
├── src/
│   ├── Root.tsx                 bölüm ve kapak kompozisyonları
│   ├── brand/tokens.ts          C, FONT, TEXT_COLUMN, TYPE_FROM_004 (tokens.json'un kopyası)
│   ├── brandkit/                BrandKit (logo, kapak, banner), Outro (3 sn), Watermark
│   ├── lib/                     anim.ts (useTime, ramp, span, lerp, EASE), episodeData.ts, words.ts
│   ├── audio/mix.tsx            soundtrackKit: ducking, sessizlik pencereleri, Bed, Hits, stingDuck
│   ├── components/              Typography (ArabicLine, WordLine, RefChip), Captions, Atmosphere (Grain, Vignette, Glow, NurPoint, Dust)
│   ├── kit/                     Camera (CameraRig, ParallaxLayer), SceneDeck, transitions, ScriptureCards (QuranVerseStage), ArabicInk
│   └── eNNN/                    ENNN.tsx · episode.ts · captions.ts · scenes/ · world/ · audio/Soundtrack.tsx · covers/
└── public/                      fonts/, sfx/, textures/, brand/, ep/eNNN/ (words, cues, verse, voice.wav, görseller)
```

Bölüm kalıbı (E012 en güncel örnek): `episode.ts` → `episodeData(cues, words, verse)`; `ENNN.tsx` → `SceneDeck` ile sahne pencereleri ve geçişler, altyazı `OFF` pencereleri, `Watermark`, döngü (`loopT = (frame − eNNNFrames(outro)) / FPS`, son sahneden S1'e geçiş), `Outro base={<S1 t={sting − OUTRO_SECONDS}/>}`; `Root.tsx`'e `calculateMetadata` ile kayıt.

## 3. Cue tabanlı zaman çizelgesi

Seslendirme ana saattir: süre `AUDIO_SECONDS + 0,45 sn` döngü kuyruğu + 3 sn outro. Sahne zamanları `cue('ad') ± ofset`; elle saniye yazılmaz (H82). Kelime kelime açılan metin `wordAt(i, 'beklenen')`, `wordsAt`, `wordsFrom` ile; senaryo değişip indeks kayarsa render hata verir (H65). Görsel giriş kelimeden 2–3 kare önce; vuruş SFX kelime başında ya da −1 kare; sahne kesmesi en yakın duraklamanın ortasında.

Determinizm: animasyon yalnızca zamanla (`useTime` / `useCurrentFrame`); CSS `transition`/`animation` yok; `Math.random()` yerine `random(seed)` ve `@remotion/noise`; Three.js'te `useFrame` yok; varlıklar `public/` + `staticFile`, dokular `<Img>` ile (H44). `public/` yalnızca render varlıkları içindir (H35).

Arapça: yalnızca `public/ep/eNNN/verse.json` ve `hadith.json`'dan; kodda Arapça karakter 0 (`grep -rP '[\x{0600}-\x{06FF}]' src/eNNN`, H81). `dir="rtl"`, `lang="ar"`.

## 4. Ses hizalama (ingest) — eski düzen

```bash
python3 tools/script_build.py episodes/NNN-slug                       # senaryo → timing/align.txt, cue-anchors.json, paragraphs.json
python3 tools/ingest.py episodes/NNN-slug --sync studio/public/ep/eNNN [--srt audio/srt.txt]
python3 tools/fetch_verse.py episodes/NNN-slug --sync studio/public/ep/eNNN
python3 tools/verse_check.py episodes/NNN-slug --sync studio/public/ep/eNNN
```

(Bu betikler yeni depoda yok; E019'da ElevenLabs SRT'den `words.json` doğrudan üretildi. Ayet için: Quran.com `text_uthmani`, User-Agent ile, H06.)

- **`--srt`:** ElevenLabs kelime düzeyinde SRT verdiyse kelime zamanları doğrudan ondan alınır (en doğrusu; E012'de stable-ts son kelimeleri yığmıştı). SRT mp3 zaman çizgisindedir; ingest `{{silence:x}}` sessizliklerini ekleyip zamanları kaydırır (`voice.final.wav` ve `voice.wav` bu yüzden mp3'ten uzundur).
- SRT yoksa **stable-ts zorunlu hizalama** (`small` modeli; `medium.en` duraklama sonrası daha kötü, H10) ve doğrulama transkripsiyonu. Önbellek ses, metin ve modelin SHA-256'sıyla anahtarlanır (H56).
- **H69 başlangıç kontrolü:** `hizalama-raporu.md` duraklama sonrası kelimelerde enerji başlangıcıyla 80 ms'den büyük farkları önerir; öneri spektrogramda onaylanıp `timing/overrides.json`'a (`{"cue_adı": ms}`, mp3 çizgisinde) yazılır. Nazal (m, n) ve "th" başlangıçları en riskli; sert ünsüzler (p, d, b) en güvenilir çapa (H09, H41).
- Çıktılar: `words.json` (Remotion `Caption[]`), `cues.json`, `segments.json`, `pauses.json`, `captions.srt`, `hizalama-raporu.md`. Biçim: [schemas/timing.schema.json](schemas/timing.schema.json).
- Uyarı eşikleri: metin ↔ transkript farkı, kelime < 40 ms ya da > 1500 ms, güven < 0,5, beklenmeyen > 1,5 sn boşluk. Whisper duyma hataları (H11) ElevenLabs hatası sanılmaz; transkripsiyon bölüm atlayabilir (H58).
- `{{silence:x}}` eklemeden önce doğal boşluğu ölç; zaten yeterliyse işaret gereksiz (H68).

## 5. Araçlar — eski düzen (`tools/`)

| Betik | Görev |
|---|---|
| `script_build.py` | Senaryo → hizalama dosyaları; tanımsız işarette, rakamda, `!`'de uyarır/durur; kelime sayısı ve süre tahmini |
| `ingest.py` | Hizalama, sessizlik ekleme, cue çözümleme, rapor, studio senkronu (`--srt`) |
| `fetch_verse.py` / `verse_check.py` | Ayet ve meali Quran.com API'den çeker (excerpt'ler harekesiz iskeletle, `nth` ile, H07) / kod noktası düzeyinde doğrular |
| `render_episode.py` | Tip kontrolü → JPEG kare dizisi → bozuk kare taraması ve yeniden render → ses miksi → iki geçişli loudnorm → x264 (yuv420p, tv, bt709, H55) → kapak, kontak sayfası, yayın metni. `--draft [--range]` yarım çözünürlük taslak; `--props JSON --out NAD` varyant render |
| `qa.py` | Tek komutluk QA: tsc, format, süre (60–120 hedef), loudness, kanca (`qa.json` → `hookCue`), açılış hareketi, döngü (hareketli dikiş dahil), flaş, yayın metni, `verse_check`; `--glitch`, `--mix ENNN [--props]`, `--out NAD` |
| `stills.py` | Tam boyutta still ve güvenli alan çizgili kontak sayfası (`--scale` kullanma, H13) |
| `publish_pack.py` | `publish.json` → `04-yayin.md` + `out/yayin.txt` (H72); `format: recitation` desteği |
| `mix_check.py`, `glitch_scan.py`, `sfx_forge.py`, `sfx_fetch.py`, `textures*.py`, `audio_features.py`, `growth_report.py` | Miks payı, bozuk kare, SFX üretimi/arama, dokular (her biri kendi seed'iyle, H67), ses görselleştirme verisi (H83), growth raporu |
| `link_check.py` | Bütün .md dosyalarında göreli bağlantı ve #anchor kontrolü |

## 6. Render ve tuzaklar

```bash
python3 tools/render_episode.py episodes/NNN-slug ENNN --cover <sn> --tp -1.2     # eski düzen
python3 tools/qa.py episodes/NNN-slug --glitch --mix ENNN                          # eski düzen
```

- Concurrency: eski depoda 2; **bu depoda 1** (E018'de 2 yazıyı tek/çift karelerde ~1 px titretti; bkz. kök `CLAUDE.md`). Final render ~10–15 dk, arka planda; Studio kapalı (H16).
- Render komutları `--port=3456` kullanır; başka oturumun Studio'su 3000'i tutabilir (H60).
- Remotion'ın paketli headless Chrome'u takılır → sistem Chrome'u (H12). Yeni kurulumda ilk iş 1 karelik smoke render (H36).
- GPU döşeme bozulması karelerin %0,5–3'ünde → bozuk kare taraması + otomatik yeniden render (H14, H53). Çok sayıda `mix-blend-mode: screen` katmanı kare düşürebilir (H70).
- `--frames=a-b` video üretir, kare dizisi için `--sequence`; dosya adlarını tamsayı kare numarasıyla eşleştir (H15).
- Final kodlama `crf 20`, `preset medium` (2026-11-02; Instagram zaten yeniden sıkıştırır, E014 ~144 MB). Ölçülen süreler: 2.400–3.400 kare tam render ~6–10 dk, efekt stemi ~1,5 dk, taslak ~5 dk.
