# 09 · Ses Tasarımı

Ses katmanları, müzik, görsel olay → ses eşlemesi ve miks hedefleri. Kod kalıbı ve kütüphane listesi: `ses-tasarim` skill'i.

> Depo notu: bu depoda sesler `tools/sfxlib.py` + `tools/eNNN_audio.py` ile numpy'da prosedürel üretilir, `tools/master.py` ile −14 LUFS'a masterlanır. E015 dersleri (kıskaç yerine yavaş zarf, telefon hoparlörü için 150–600 Hz gövde, mono→stereo +3 dB) kök `CLAUDE.md`'dedir.

## 1. İlkeler

1. **Seslendirme kraldır.** Her katman seslendirmeye hizmet eder; hiçbir şey kelimeyi maskelemez.
2. **Dijital sessizlik yok (H77).** Videonun başından sonuna kesintisiz, kısık bir yatak (hava, drone, ortam ya da müzik) akar. Senaryodaki `{{silence:x}}` duraklamalarında yataklar çekilir ama sıfıra inmez; vurgu, yatağın geri çekilmesiyle yapılır.
3. **Her vuruş bir görsel olaya bağlıdır.** Sebepsiz ses yok; her vuruş bir cue'ya bağlanır (`cue('ad') ± ofset`). Az ama yerinde.
4. **Dünya sesi.** Her mekânın kendi ortamı vardır; sahne değişince ses dünyası da değişir.

## 2. Müzik

**Serbest** (kullanıcı kararı, 2026-11-02): melodi, ritim ve fon müziği kullanılabilir. Şartlar: konuşma bandında seslendirmeyi bastırmaz (miks hedefleri §4), sahnenin tonuna uyar (huşu, gerilim, tefekkür), ayet ekranında sakinleşir. Müzik dışarıdan alınabilir; lisans konusu yoktur.

## 3. Katmanlar

| Katman | Seviye | Davranış |
|---|---|---|
| Seslendirme | Master öncesi ~−16 LUFS | Her zaman önde |
| Kesintisiz yatak (doku, drone, müzik) | Seslendirmenin ~28–35 dB altı | Baştan sona; konuşmada 2–4 dB daha kısılır |
| Ortam yatağı (mekân sesi) | ~18–22 dB altı | Konuşmada kısılır (ducking), boşluklarda yükselir |
| Geçiş SFX (whoosh, swell) | Kısa tepe | Mümkünse kelime aralarına düşer |
| Vurgu SFX (impact, sub, thump) | İfşada en yüksek | Kelimeyle çakışırsa `*_vo` varyantı |
| Mikro SFX (tık, kâğıt, kalem) | Çok düşük | Seyrek |
| Tilavet (varsa) | ~−18 LUFS | Çalarken seslendirme ve SFX susar; yalnızca gerçek kârî kaydı (E010) |

## 4. Miks hedefleri

- Master **−14 LUFS**, gerçek tepe **≤ −1 dBTP** (`render_episode.py`, gerekirse `--tp -1.2`).
- `mix_check` konuşma bandında (300 Hz–4 kHz): medyan pay **≥ 18 dB**, alt %10 **≥ 10 dB** (H31, H50). ~20–26 dB atmosferi en iyi taşıdı; 28 dB üstü dünya boş duyulabilir.
- Döngü: kapanış yatağı açılıştaki dosya ve seviyeyle biter; 30 ms kenar fade tıkı önler (H33, H34).
- Ses kulakla doğrulanamaz: ölçümler raporlanır, son dinleme kullanıcıdadır (H38).

## 5. Eşleme (iyi çalışanlar)

| Görsel olay | Ses |
|---|---|
| Kanca punch'ı | `impact_soft_vo` (düşük) |
| Sayfa, kart, anlaşma | `paper_turn`, `quill_scratch` |
| Kum, rüzgâr, iz | `sand_gust`, `sand_fall`, `whoosh_soft_*` |
| Su, kuyu, pınar | `drip_*`, `bubbles_rise`, `surface_break` |
| Işık, ifşa | `swell_low` / `reverse_swell` → `shimmer_air_*` |
| Sessizliğe giriş | `hush_down` |
| Ağır an, soru | `thump_low` |

## 6. Kaynaklar

- **Prosedürel:** `tools/sfx_forge.py` (whoosh, riser, sub, hava dokusu) — bu depoda `tools/sfxlib.py`.
- **Gerçek kayıt foley:** `tools/sfx_fetch.py "sorgu"` Openverse'ten aday getirir, `review.html`'de dinlenir, `--adopt` ile kütüphaneye eklenir. Tonal eleme artık yalnızca bilgi amaçlıdır (müzik serbest).
- **Müzik ve diğer sesler:** her kaynaktan; dosya `studio/public/sfx/` (ya da `music/`) altına konur ve bir cue'ya bağlanır.
