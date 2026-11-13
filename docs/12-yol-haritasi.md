# 12 · Yol Haritası

Durum, kararlar ve bölüm kaydı. Yayın sonrası metrikler [growth/metrikler.csv](../growth/metrikler.csv)'de (`python3 tools/growth_report.py` → [growth/rapor.md](../growth/rapor.md)).

> Depo notu: Project'teki sürüm 2026-11-02'de E014'te kalmıştı. E015–E020 satırları depodaki bölüm notlarından eklendi (aşağıda). Güncel bölümler `episodes/` altındadır.

**Durum (2026-11-02, sonrası E020'ye kadar işlendi):** Altyapı, araçlar ve bileşen kiti kuruldu; 20 bölüm üretildi. Öncelik: düzenli yayın (hedef günde 2), stok, delil ve karşılaştırmalı din içeriği ([growth/strateji](../growth/strateji.md)). İleride: hafif formatlar (One Word, Read It Again), kanca A/B denemeleri, bir bölümde insan sesi denemesi, başka dillere uyarlama, uzun format derlemeler.

## Kararlar

| # | Konu | Karar |
|---|---|---|
| D2 | Anlatıcı sesi | "Emin - Epic Historical Narrative" (PVC), Eleven v4, hız 1.20 ([03 §7](03-hikaye-anlatimi.md#7-tts-ve-elevenlabs)) |
| D3 | Müzik | **Serbest** (2026-11-02); dijital sessizlik yok, seslendirme bastırılmaz ([09](09-ses-tasarimi.md)) |
| D4 | Tilavet | Yapay zekâ tilaveti yok; gerçek kârî kaydı kullanılabilir (E010) |
| D5 | Meal | Saheeh International; araştırmada ikinci meal karşılaştırılır |
| D6 | Kanal ve filigran | **Signs in the Horizon** (41:53); her videoda `@signsinthehorizon` filigranı ([08 §8](08-gorsel-dil.md#8-açılış-kapak-filigran)) |
| D7 | Altyazı | Her zaman, 60 px, ekranda aynı söz varken kapalı |
| D8 | Sürüm kontrolü | Git (`main`), medya çıktıları `.gitignore`'da |
| D9 | Platformlar | Instagram Reels (ana), YouTube Shorts, TikTok; hedef süre 60–120 sn (2026-11-02) |
| D10 | Lisans | Konu değil; kullanıcı yetkili |

## Bölüm kaydı

| No | Konu | Hat | Süre | Kanca (`hookCue`) | Yeni dünya / imza anı | Yayın | Durum |
|---|---|---|---|---|---|---|---|
| 001 | 309 Yıl (18:25) | Hikâye | 84,0 | "three hundred" 7,4 sn (eski kural) | Mağara POV, şehir, güneş/ay halkaları 300/309 | Instagram | Yayında |
| 002 | Now? (10:90–92) | Kitap köprüsü | 94,6 | "under the water" 11,6 sn | Yarılan deniz, sualtı, şafak sahili | ? | Yayında |
| 003 | The Desert That Sings (İşaya 42 · 7:157) | Kitap köprüsü | 113,9 | `arabia` 2,8 sn | Kumdaki kitap, kelimenin kuma dönüşmesi | Instagram | Yayında; hook B Trial Reel 2026-11-01 |
| 004 | A Prophet Like Moses | Kitap köprüsü | 118,7 | "three men" | Üç yuva, üçüncü çizginin doğuşu | Instagram 2026-10-27 01:21 | Yayında |
| 005 | The Orbiting Sentence (36:40) | One Word | 81,7 | `seven_letters` 1,5 sn | Yedi harfin yörüngeye bükülmesi (tek sahne, H73) | – | Hazır, yayınlanmadı |
| 006 | The Sound of the Well (12:10) | One Word | 107,5 | `well` 1,8 sn | Kuyu şaftı, fonetik mühür (tek sahne, H73) | Instagram | Yayında |
| 007 | The Lowest Basin (30:2–4) | One Word | 61,3 | `thirty` 0,8 sn | AI plakalar + `kit/`, −430 m telemetri | Instagram 2026-10-28 20:21 | Yayında |
| 008 | The Prohibition Paradox (5:91) | Delil | 138,6 | `richest` 1,5 sn | 3B kırılan küp, split-screen | Instagram | Yayında; açıklama ilk satırı düzeltildi |
| 009 | The Two Voices (53:3–4) | Delil | 67,4 | `fingerprints` 2,4 sn | 3B veri uzayı | Instagram 2026-10-27 22:36 | Yayındaki sürüm düzeltme öncesi; düzeltme yorumu sabitlendi (H80) |
| 010 | The Best of Stories (12:1–4) | Tilavet | 58,8 | başlık 0–3,2 sn | Ölçülmüş dalga formu görselleştiricisi (H83) | – | QA kaydı yok |
| 011 | The Valley of Baca | Kitap köprüsü | ~69 (tahmin) | `mecca` | Mürekkepten vadiye, iki çöl | – | Senaryo v2 hazır, ses bekliyor; v1 araştırması H84 |
| 012 | The Challenge (3:61 · Buhârî 4380) | Delil + Kitap köprüsü | 84,5 | `liar` 0,66 sn | Işık noktası kervan ve kamplar, anlaşma çizgisi | – | K5 onaylandı (2026-11-02), yayına hazır |
| 013 | The Mirror (2:255) | Delil (yapı) | 105,4 | `mirror` 2,3 sn | Havuz aynası, kubbe, sekiz kollu yıldız | – | K5 onaylandı, yayına hazır |
| 014 | Where Are the Bodies? (51:48 · 59:23 · 30. Lem'a) | Delil · Risale (Kuddûs 1) | 119,5 | `bodies` 0,68 sn | Three.js sürü ve akbabalar, toprağa dalış, Dünya ağı, ölçek zinciri, çiğ damlalarında güneş | – | K5 bekliyor |
| 015–019 | bkz. `episodes/e015…e019` notları (E019 = She Who Disputes, 58:1, ElevenLabs sesli) | | | | | | Teslim edildi |
| 020 | That Bee Is a She (16:68–69) | One Word | 38 s, sessiz, parlak/gündüz, döngülü | – | Bal arısı kesiti metnin arkasında, hex-wipe, kovan petekleri | – | Teslim edildi, commit bdc17b6 |

Süreler outro dahil saniye. Yeni bölüm eklenirken satır kısa tutulur; ayrıntı bölüm klasöründe.
