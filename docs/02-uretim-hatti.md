# 02 · Üretim Hattı

Bir bölümün fikirden yayına kadar aşamaları, onay kapıları (K0–K5), her kapının kontrol listesi ve iş bölümü. Komutların sırası ve tuzaklar: `bolum-uret` skill'i.

## Aşamalar

| # | Aşama | Kim | Çıktı | Kapı |
|---|---|---|---|---|
| 0 | Konu seçimi ([05](05-mucize-katalogu.md), [growth/strateji](../growth/strateji.md)) | Sen + Claude | Konu, hedef süre | **K0** |
| 1 | Araştırma ([04](04-icerik-dogrulugu.md), şablon [sablonlar/01](sablonlar/01-arastirma-dosyasi.md)), sonra `dogruluk-denetcisi` | Claude | `01-arastirma.md`, `verse.json`, gerekiyorsa `kjv.json` / `hadith.json` | **K1** |
| 2 | Hikâye planı: önce 3 kanca adayı, sonra sahne sahne reji ([03](03-hikaye-anlatimi.md), [sablonlar/02](sablonlar/02-hikaye-plani.md)) | Claude | `02-hikaye.md` | **K2** |
| 3 | Senaryo + ElevenLabs metni + görsel promptları, sonra `dogruluk-denetcisi` | Claude | `03-senaryo.md`, `03-elevenlabs.txt`, `images/imageprompts.md` | **K3** |
| 3b | Seslendirme ve AI görseller | **Sen** | `audio/voice.mp3` (+ ElevenLabs kelime SRT'si varsa `audio/srt.txt`), `images/*.jpeg` | – |
| 4 | Hizalama ve ayet senkronu ([10 §4](10-teknik-mimari.md#4-ses-hizalama-ingest)) | Claude / Antigravity | `timing/`, `studio/public/ep/eNNN/` | Sorun varsa yeni ses |
| 5 | Animatik / taslak (`render_episode.py --draft`) | Claude | `review/draft.mp4` | **K4** |
| 6 | Prodüksiyon: sahneler, ses, kare kontrolü | Claude | `studio/src/eNNN/` | İç QA |
| 7 | Final render, `qa.py`, 3 kapak, yayın paketi, `izleyici-gozu` | Claude | `out/final.mp4`, `out/kapak1–3.png`, `04-yayin.md` | **K5** |
| 8 | Yayın ve 3./7. gün ölçümü ([growth](../growth/README.md)) | **Sen** + Claude | `growth/metrikler.csv` | – |

Her **K** kapısında durulur ve açık onay alınır. Kapı atlanmaz; atlanması gerekiyorsa nedeni bölüm dosyasına yazılır.

## Kapı kontrol listeleri

`qa.py`'nin otomatik ölçtüklerini (format, süre, ses seviyesi, kanca zamanı, açılış hareketi, döngü, flaş, yayın metni, `verse_check`, bozuk kare, miks payı) burada tekrar etmiyoruz; burada yalnızca göz ve yargı gerektirenler var.

**K0 · Konu**
- Konu [05](05-mucize-katalogu.md)'te kullanılabilir durumda; son bölümlerle aynı tür ve dünyada değil.
- Hedef süre seçildi: 60–120 sn içinde, konuya göre; 120 sn üstü gerekçeli ([03 §3](03-hikaye-anlatimi.md#3-süre)).

**K1 · Araştırma**
- Arapça kaynak JSON'da; en az iki meal karşılaştırıldı.
- Her isim, tarih ve sayı bir kaynağa bağlı; köprü cümlesi tefsir, hadis ya da sözlüğe dayanıyorsa asıldan okundu (H84).
- Karşı görüşler, kanıt seviyesi, iddia cümlesi ("iddia etmiyoruz" kısmıyla), söylenmeyecekler listesi var.
- `dogruluk-denetcisi` çalıştı, bulgular işlendi.

**K2 · Hikâye planı**
- 3 kanca adayı yazıldı, biri seçildi; açılış kuralları karşılanıyor ([growth/strateji §3](../growth/strateji.md#3-açılış-kuralları)).
- En az 3–4 fiziksel mekân, kamera yolculuğu; her sahne için mekân, kamera, kod katmanları, tipografi, geçiş ve ses tanımlı (H73, H74).
- İmza anı tek cümle; dürüst mercek var; son kare ilk kareye bağlanıyor; paylaşılacak cümle ilk ~30 sn'de.

**K3 · Senaryo**
- Kelime bütçesi tutuyor (~2,7 kelime/sn, %5 pay); kanca kelimesi ≤ 3,5 sn.
- TTS kuralları ([03 §7](03-hikaye-anlatimi.md#7-tts-ve-elevenlabs)); `script_build.py` uyarısız; `03-elevenlabs.txt` `align.txt` ile kelime kelime aynı.
- Sesli okundu, akıyor; CTA yok; `dogruluk-denetcisi` çalıştı.

**K4 · Animatik**
- Kare 0 telefon boyutunda 1 saniyede anlaşılıyor; ilk 0,5 sn'de hareket var.
- Her cue'da ekran sesle aynı şeyi söylüyor (H51); 4 sn'den uzun durağan an yok.
- Altyazı ekrandaki büyük metinle çakışmıyor; güvenli alan doğru.

**K5 · Son izleme**
- `python3 tools/qa.py episodes/NNN-slug --glitch --mix ENNN` FAIL'siz; `review/cue-sheet.png` ve `frame0-small.png` incelendi.
- Arapça ekranlar tam çözünürlükte, harekeler kırpılmamış (H17, H46, H62).
- 3 bağımsız kapak hazır; `04-yayin.md` tam (`publish_pack.py`).
- **Sen telefonda sesli ve sessiz izledin.** Ses kulakla doğrulanamaz; son dinleme sende (H38).

## Revizyon

| Durum | Ne yapılır |
|---|---|
| Tek cümle kötü okunmuş | O paragraf yeniden üretilir (`voice_fix_<n>.mp3`), yerine konur, yeniden hizalanır; cue'lar kelimeye bağlı olduğu için görüntü kendiliğinden kayar |
| Ses tamamen yenilendi | Hizalama baştan; sahne kodu değişmez, zamanlar yenilenir |
| Görsel revizyon | Cue adı ya da kontak sayfasındaki kare numarasıyla söylenir |
| Kanca A/B denemesi | Gövde aynı, varyant `--props` ile `out/<ad>/`'a render edilir; Trial Reel olarak yayınlanır ([growth/deneyler](../growth/deneyler.md)) |

## Klasör düzeni

```
docs/        rehber (bu klasör)       growth/   yayın verisi ve strateji
episodes/NNN-slug/   01-arastirma.md · 02-hikaye.md · 03-senaryo.md · 03-elevenlabs.txt · 04-yayin.md · publish.json
                     verse-spec.json · verse.json · kjv.json · hadith.json · qa.json
                     audio/ (voice.mp3, srt.txt) · images/ (imageprompts.md) · timing/ · review/ · out/ (git dışı)
episodes/adaylar/    aday konu taslakları (doğrulanmamış)
studio/      Remotion (src/eNNN/, public/ep/eNNN/)      tools/   Python araçları      assets/   marka ve ham varlıklar
```

Adlandırma: bölüm klasörü `NNN-kebab-slug`, cue adları `snake_case` İngilizce, sahne bileşenleri `PascalCase`.

## İş bölümü: Claude ve Antigravity

Mekanik işler (kuralı belli, sonucu ölçülebilir) Antigravity'ye verilebilir. Claude böyle bir işe başlamadan önce nedenini söyler ve **"Antigravity'ye verelim mi?"** diye sorar; evet denirse aşağıdaki şablonla talimat yazar.

- **Antigravity'ye uygun:** hazır betikleri çalıştırıp raporlamak (`ingest.py`, `fetch_verse.py`, `verse_check.py`, `render_episode.py`, `qa.py`, `stills.py`), dosya düzeni, tekrarlanan ölçümler, tarif edilmiş küçük kod değişiklikleri.
- **Claude'da kalır:** ayet, hadis ve Kitab-ı Mukaddes alıntıları ve doğruluk denetimi; senaryo, kanca, kurgu ve tasarım kararları; hata ayıklama; ortak dosyalar (`brand/`, `components/`, `brandkit/`, `lib/`, `audio/mix.tsx`) ve yayınlanmış bölümleri etkileyen değişiklikler.

Talimat şablonu (Claude'a özel kurallar ve Arapça hook'u Antigravity'de çalışmaz, bu yüzden her talimat kuralları içerir):

```text
Proje: /Users/bemres/Desktop/projeler2/kuranmucizeleri2 (Remotion, Python araçları).
Görev: <tek cümle>
Adımlar: <komutlar ya da değişiklik, sırayla>
Bitti sayılması için: <ölçülebilir ölçüt>

Kurallar:
- Arapça metni asla elle yazma ya da değiştirme; yalnızca kaynak JSON'lardan (verse.json, hadith.json) gelir.
- Şu dosyalara dokunma: <liste>. Ortak dosyalara (studio/src/brand, components, brandkit, lib, audio/mix.tsx) dokunma.
- out/final.mp4, kapak.png ve onaylı karelerin üzerine yazma; gerekiyorsa önce sor.
- Remotion komutlarında --port=3456 kullan; başka bir render çalışıyorsa bekle.
- Hiçbir dosyayı silme. Commit atma, push yapma.
- Bitince değiştirdiğin dosyaların listesini ve komut çıktılarını raporla.
```

İş bitince Claude kontrol eder: `git status` / `git diff` yalnızca beklenen dosyalar mı; Arapça dokunulduysa `verse_check.py`; render ya da sahne değiştiyse `qa.py`; koddaki Arapça karakter sayısı 0 (H81).
