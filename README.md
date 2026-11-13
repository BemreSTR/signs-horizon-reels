# Signs in the Horizon · Reels studio

Instagram Reels / Shorts üretim deposu: **Remotion 4 (React + TypeScript)** ile kod-animasyon, **numpy** ile prosedürel ses tasarımı. Video modeli kullanılmaz; her kare `t` zamanının saf fonksiyonudur.

Bu depo, **başka bir bilgisayardan çekip aynı kalite ve standartta video üretmek** için yeterli olacak şekilde tutulur. Kurallar `docs/` ve `growth/` altındadır (Claude Project `signs-in-the-horizon` ile aynı içerik; **kaynak gerçek bu depodur**, Project kopyadır).

## Hızlı başlangıç (yeni makine)

Gerekenler: Node 22+, Python 3.13, `ffmpeg` (ses/mux/kare okuma), bir Chrome/Chromium (headless).

```bash
git clone https://github.com/BemreSTR/signs-horizon-reels.git && cd signs-horizon-reels
npm install
pip install -r requirements.txt            # sistem Python'u kilitliyse: --break-system-packages
mkdir -p out timing                         # git dışı çalışma klasörleri (render çıktısı, ses ara dosyaları)
export CHROME=/yol/chrome-headless-shell    # yoksa tools/render.sh Playwright'ın kopyasını arar (/opt/pw-browsers, ~/.cache/ms-playwright)
npx remotion still src/index.ts E020Cover1 out/test.png --frame=0 --browser-executable="$CHROME" --public-dir=public   # smoke test (H36)
```

- **Chrome:** Remotion'ın kendi indirdiği Chrome takılabiliyor (H12); sistem Chrome'u ya da Playwright `chromium_headless_shell` kullan. `CHROME` ortam değişkeni hem `tools/render.sh` hem `tools/stills.mjs` için geçerlidir.
- **Render eşzamanlılığı 1:** `--concurrency=2` yazıyı tek/çift karelerde ~1 px titretti (E018). `render.sh` bunu zaten 1 yapar.
- **rembg modeli** (`tools/cutout.py`): ilk çalıştırmada `isnet-general-use.onnx` (~170 MB) GitHub'dan iner (`~/.u2net` / `~/.rembg/models`). Ağ kapalıysa modeli elle koy. Yalnızca konu-arkaya-yazı kesimleri (E020) için gerekir.
- **Fontlar** `public/fonts/` içinde ve depoda (`src/lib/fonts.ts`). Yeni font eklerken hem `package.json` (`@fontsource/...`) hem `fonts.ts` güncellenir; `fitText` ölçümü fontu `fonts.ts`'ten tanımasına bağlıdır (E020).
- **Ayet metni** yalnızca Quran.com `text_uthmani` kaynaklıdır (User-Agent ile istek, H06); `quran-json` paketinin Arapçası KFGQPC kodlamasıdır, ekranda **kullanma** (E016 dersi).

## Bölümler

| No | Başlık | Tür | Kod | Ses | Not |
|---|---|---|---|---|---|
| E015 | The Open Check (111:3) | seslendirmeli | `src/E015.tsx`, `src/scenes/` | `tools/sfx_mix.py` | `episodes/e015-the-open-check.md` |
| E016 | The Pomegranate Problem | seslendirmesiz, müzikli | `src/e016/` | `tools/e016_audio.py` | `episodes/e016-the-pomegranate-problem.md` |
| E017 | The Two Rats (85 sn) | seslendirmesiz | `src/e017/` | `tools/e017_audio.py` | `episodes/e017-the-two-rats.md` |
| E018 | The Emperor's Questions | seslendirmesiz | `src/e018/` | `tools/e018_audio.py` | `episodes/e018-the-emperors-questions.md` |
| E019 | She Who Disputes (58:1–4) | ElevenLabs sesli | `src/e019/` | `tools/e019_audio.py`, `e019_srt.py` | `episodes/e019-she-who-disputes.md` (+ klasör: senaryo, ElevenLabs metni) |
| E020 | That Bee Is a She (16:68–69, 38 sn, parlak/gündüz, döngü) | seslendirmesiz | `src/e020/` | `tools/e020_audio.py` | `episodes/e020-that-bee-is-a-she.md` (+ sesli sürüm: `tools/e020_voice.py`, `SUFFIX=_voice python3 tools/master.py E020 38.0`) |

`src/<id>/` her bölümün sahneleri, zaman çizelgesi (`timeline.ts`), kapakları (`Covers.tsx`); ortak parçalar `src/lib`, `src/components`, `src/brandkit` (marka outro, filigran). Bölüm varlıkları `public/ep/<id>/`.

## Bölüm akışı

**Seslendirmesiz (E016–E018, E020)** — saat vuruş ızgarasıdır (`src/<id>/timeline.ts`):

```bash
tools/render.sh E020                                   # -> out/E020_silent.mp4 (yalnız görüntü)
PYTHONPATH=tools python3 tools/e020_audio.py           # prosedürel ses -> timing/ (sfxlib.py)
python3 tools/master.py E020 38.0                      # loudnorm -14 LUFS, mux -> out/E020.mp4 (38.0 = bölüm saniyesi)
python3 tools/qa_video.py out/E020_silent.mp4          # bozuk/donuk kare, flaş, parlaklık salınımı, döngü dikişi
python3 tools/safezone.py out/E020_silent.mp4 4.6 26.5 # x 180–900 yazı sütunu, tam çözünürlük
node tools/stills.mjs E020Cover1 out/E020 2.4          # tam boyutlu still (kapaklar: 3 bağımsız)
```

**Seslendirmeli (E015, E019)** — saat ses kelime zamanlarıdır:

```bash
# E015: ses -> zamanlama (girdiler git dışı timing/ altında: words.txt = script.txt kelimeleri, voice16k.wav = voice.mp3'ten 16 kHz mono)
ffmpeg -i public/ep/e015/voice.mp3 -ac 1 -ar 16000 timing/voice16k.wav
python3 tools/align.py && python3 tools/build_timing.py      # çıktı public/ep/e015/{words,cues,pauses}.json (depoda hazır; yeniden üretmek gerekmez)
# E019: ElevenLabs SRT -> public/ep/e019/words.json
python3 tools/e019_srt.py
tools/render.sh E015   # ya da E019
python3 tools/sfx_mix.py && python3 tools/mix_report.py      # E015 sesi (timing/mix.wav)
PYTHONPATH=tools python3 tools/e019_audio.py                 # E019 sesi (voice.mp3 + prosedürel katman)
python3 tools/master.py E015 49.9      # E019 için: tools/master.py E019 75.6
```

**Teslim:** `out/<ID>.mp4`, `captions.srt` (varsa), `out/<ID>/kapak1–3.png`. `out/` ve `timing/` git dışıdır; teslim edilenler sohbetten indirilir. Kaynak kod, notlar ve ses betikleri depoda kalır: `tools/eNNN_audio.py` + `public/ep/<id>/` ile aynı videonun sesi/görüntüsü yeniden üretilir.

## Dokümanlar

| Yer | İçerik |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Çalışma notları ve **E015–E020 dersleri** (en güncel, en kısa kural kaynağı; her bölümden sonra güncellenir) |
| [`docs/README.md`](docs/README.md) | Doküman dizini, değişmez ilkeler, eski ↔ yeni düzen eşlemesi |
| [`docs/08-gorsel-dil.md`](docs/08-gorsel-dil.md) | Görsel dil: renk, tipografi, güvenli alan, ayet sunumu, kapak, filigran |
| [`docs/09-ses-tasarimi.md`](docs/09-ses-tasarimi.md) | Ses: katmanlar, miks hedefleri (−14 LUFS), eşleme |
| [`docs/13-hatalar-ve-dersler.md`](docs/13-hatalar-ve-dersler.md) | H01–H89 hata/ders listesi + **ön kontrol listesi** |
| [`docs/02-uretim-hatti.md`](docs/02-uretim-hatti.md) | Aşamalar ve onay kapıları (K0–K5) |
| [`docs/03-hikaye-anlatimi.md`](docs/03-hikaye-anlatimi.md) | Hikâye/senaryo, kelime bütçesi, ElevenLabs, cue sözdizimi |
| [`docs/04-icerik-dogrulugu.md`](docs/04-icerik-dogrulugu.md) | **Doğruluk ve kırmızı çizgiler** (tasvir yasağı, kaynak, dil) |
| [`docs/05-mucize-katalogu.md`](docs/05-mucize-katalogu.md) | Yapılan bölümler, seriler, aday konular, kullanılmayacaklar |
| [`docs/10-teknik-mimari.md`](docs/10-teknik-mimari.md), [`12-yol-haritasi.md`](docs/12-yol-haritasi.md) | Mimari gerekçeler, kararlar, bölüm kaydı |
| [`docs/brand/`](docs/brand) | `kimlik.md` (ad, profil metinleri, logo), `tokens.json` |
| [`docs/sablonlar/`](docs/sablonlar), [`docs/schemas/`](docs/schemas) | Araştırma, hikâye planı, senaryo şablonları; zamanlama şeması |
| [`growth/`](growth) | Strateji, metinler (açıklama, sabit yorum, yorum cevapları), deneyler, rapor, `metrikler.csv` |
| [`episodes/`](episodes) | Bölüm başına plan, kaynaklar, dürüst mercek, teslim notları |

## Sabit ilkeler (özet; tamamı `docs/04`, `docs/08`)

Konuşma Türkçe, videodaki yazı/ses İngilizce · peygamber/melek/Allah ve insan yüzü çizilmez · Arapça yalnızca kaynaktan (Quran.com `text_uthmani`) · CTA yok (abone ol/beğen/paylaş yok) · her sayı ve isim kaynaklı, dürüst mercek (karşı okuma) ekranda · yapay zekâ görsel/ses beyanı yayında işaretlenir · kritik yazı x 180–900 · döngü dikişi temiz · okuma süresi ≥ 1 sn + 0,25 sn/kelime.

## Depoyu güncel tutma kuralı

Her bölüm bitince **aynı commit'te**: kod + `public/ep/<id>/` varlıkları + `tools/eNNN_audio.py` + `episodes/<id>.md` notu + `CLAUDE.md` yeni dersler + (yeni sabit kural çıktıysa) `docs/` + bu README'deki bölüm tablosu + `docs/05` ve `docs/12` kayıtları; sonra `git push`. Claude Project'teki kopyalar da aynı gün güncellenir. Teslim dosyaları (`out/`) depoya girmez.
