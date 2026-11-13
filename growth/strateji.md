# Growth stratejisi

İlk Instagram yayınlarının verisinden çıkan yön (Kasım 2026). Veri az; her madde test edilecek bir hipotezdir ve [deneyler.md](deneyler.md)'de ölçülür. Rakamlar: [rapor.md](rapor.md). İçerik kuralları (doğruluk, saygı, tasvir yasağı, CTA yok) büyüme uğruna gevşemez.

> Depo notu: Project'teki sürümde `acilislar/*.jpg` görselleri vardı; bunlar depoya alınmadı (ikili dosya). Tablolar metin olarak aşağıdadır.

## 1. Veri ne söylüyor

1. **İzleyici uzunluktan bağımsız olarak ~20–30 sn izleyip çıkıyor.** 61 sn'lik E007 ile 139 sn'lik E008 benzer süre izleniyor.
2. **Paylaşımı Kur'an ve önceki kitaplar ile peygamberliğin delili getiriyor:** E003 %9,5, E009 %5,3, E004 %2,1; hikâye ve coğrafya (E001, E007) %0,7–1,3. Paylaşım (DM gönderimi) takipçi olmayanlara dağıtımın en güçlü sinyali; E009'da paylaşım beğeniyi geçti (259 / 214).
3. **Takibi Arapça kelime inceliği getiriyor:** E006 %1,5.
4. **Açılış izlenmeyi belirliyor** (§3). E003 en çok paylaşılan ama en az izlenen video: içerik çalışıyor, açılış çalışmıyor ([X1](deneyler.md#x1)).

Kitle: Güney Asya, Birleşik Krallık, ABD; İngilizce bilen Müslümanlar ve karşılaştırmalı din meraklıları.

## 2. Süre ve yapı

Hedef **60–120 sn** (outro dahil; kullanıcı kararı 2026-11-02); TikTok gelir programı 60 sn üstünü istiyor. En iyi iki video (E007 61 sn, E009 67 sn) kısa uçta; daha derin konular 80–120 sn'ye uzar, 120 sn üstü gerekçeyle. Yapı süreden bağımsız: 0–2 sn kanca · 2–20 ilk kanıt · 20–35 en çarpıcı bilgi ve paylaşılacak cümle · sonrası ara ödüllerle derinleşme, dürüst mercek, tefekkür, döngü. Hangi uzunluğun daha iyi çalıştığı [X3](deneyler.md#x3)'te ölçülür. Ayrıntı: [docs/03 §3](../docs/03-hikaye-anlatimi.md#3-süre).

## 3. Açılış kuralları

1. **Kare 0 tek ve güçlü bir görüntü**, ekranın yarısından fazlası; boş karanlık alan ya da küçük öğe kalabalığı yok.
2. **0–1 sn'de ortada büyük başlık** (100–160 px, en fazla 6–7 kelime), seslendirmeyle aynı iddia ya da soru; o aralıkta altyazı kapalı.
3. **İlk 0,5 sn'de hareket:** başlık punch'ı, kamera itişi, akan sayı. `qa.py` kare 0 → 0,5 sn farkı 1,2/255'in altını uyarır (yayınlananlar 1,0–6,3; E012 7,1).
4. **İlk cümle somut:** sayı, cesur ama doğru iddia ya da kişili gizem. Ders girişi ve herkesin bildiği hikâye yok.
5. **İlk 3 sn'de küçük yazı ve kutu yok.**

| Bölüm | Kare 0 | İlk 1 sn'de büyük yazı | Hareket | Kanca | IG izlenme |
|---|---|---|---|---|---|
| **E009** | Siyah zeminde iki parlak dalga | 0,5 sn: "TWO FINGERPRINTS" | Dalgalar çiziliyor | Cesur iddia, 2,4 sn | 4.892 |
| **E007** | Gerçek hava fotoğrafı, tam ekran | 2 sn: "−430 METERS" | Altimetre akıyor | Somut sayı, 0,3 sn | 2.645 |
| **E004** | Üç altın daire | Küçük etiketler | Yavaş parlama | Gizem ("three men") | 2.502 |
| E006 | Arapça kelime, kutular, küçük yazı | Yok | Neredeyse durağan | Ders girişi | 1.664 |
| E001 | Mağaradan gece göğü | Yok | Durağan | Bilinen hikâye, kanca 7,4 sn | 1.620 |
| E003 | %70'i boş karanlık gök | Yok | Sayfa kıpırtısı | Güçlü cümle, görüntü taşımıyor | 797 |
| E008 | Arşiv masası, minik başlık | Küçük damga | Az | İyi cümle, kalabalık görüntü | 209 |

**Kanca kalıpları** (`senaryo-yaz` 3 adayda en az ikisini dener):

| Kalıp | Söylenen | Ekranda | Örnek |
|---|---|---|---|
| Kendi kitabından satır | "There is a chapter in the Bible that…" | Kitabın adı + şaşırtıcı fiil | E003 hook B: "THE BIBLE / TELLS ARABIA / TO SING" |
| Somut sayı | Ölçülebilir sayı | Sayı dev, akarak | E007 "−430 METERS" |
| İkili / karşıtlık | "One man, two voices." | İki öğe yan yana | E009 |
| Cesur iddia | "A test no liar would ever take." | İddia ortada, punch | E012 |
| Soru / mit kırma | "Does the Bible name Mecca?" | Soru büyük | E011 |
| Kimin kim olduğu | "They were waiting for three men." | Boş yuvalar | E004 |
| Tek kelime | "The Quran could have said X. It said Y." | İki kelime, biri altın | One Word |

Varyant örneği: E003 hook B ([X1](deneyler.md#x1)), `--props '{"hook":"b"}'`, kare 0 → 0,5 sn farkı 6,7 (yayındaki A: 3,1).

## 4. İçerik hatları

Kitap köprüsü (ana paylaşım hattı), Delil (ikinci paylaşım hattı, en yüksek doğruluk çıtası), One Word (takip hattı), Read It Again (güven hattı), ara sıra hikâye ve coğrafya. Hatların tanımı, yapılanlar ve aday sırası: [docs/05](../docs/05-mucize-katalogu.md). Delil ve karşılaştırmalı din bölümlerinde açık, deyimsiz bir argüman kurulur; argüman soru olarak sunulur, "kanıtladı" denmez.

**Doğruluk farkımız olsun.** Bu türde abartı yaygın; E009 en çok, sonradan düzelttiğimiz cümleleriyle yayıldı. Her bölüm K1/K3/K5'te `dogruluk-denetcisi`'nden geçer.

## 5. Yayın

- **Sıklık:** üst sınır yok, hedef **günde 2 video**; sınırlayan üretim hızı. Yayına hazır bölüm stoku tutulur ([README](README.md#stok)); kalite çıtası ve K kapıları atlanmaz; mekanik işler Antigravity'ye ([docs/02](../docs/02-uretim-hatti.md#i̇ş-bölümü-claude-ve-antigravity)).
- **Saat:** 17:00–19:00 TR test ediliyor ([X2](deneyler.md#x2)); aynı gün iki video en az 4–5 saat arayla, farklı hatlardan.
- **Açıklamanın ilk satırı** kanca cümlesi; "like / follow / share" yok ([metinler](metinler.md#açıklamanın-ilk-satırı)).
- **Kapak:** tek güçlü görsel + 3–5 kelimelik başlık ([docs/08 §8](../docs/08-gorsel-dil.md#8-açılış-kapak-filigran)).
- **Yorumlar:** ilk saatte her yoruma saygılı ve kaynaklı cevap; kaynaklar sabitlenmiş yorumda.
- **Trial Reels:** yeni açılış, kapak ya da süre denemeleri önce takipçi olmayanlara.
- **Collab:** küçük hesap için en büyük kaldıraç ([metinler](metinler.md#collab)).

## 6. Ölçüm

Her video yayından **3 ve 7 gün sonra** [metrikler.csv](metrikler.csv)'ye yeni satır (`olcum_tarihi` ile), sonra `python3 tools/growth_report.py`. Atlama oranı (skip rate) açılış hipotezini doğrudan ölçer. 10–12 videodan sonra bu doküman gözden geçirilir.

## 7. Dış öneriler (Gemini, 2026-11-01)

**Alındı:** paylaşım sinyali, tek zıtlıklı kapak, CTA'sız ilk satır, somut delil formatı (kaynaklıysa), açıklamanın sonunda dürüst bir soru ([X5](deneyler.md#x5)).
**Alınmadı:** "Oxford / bir insan beyni iki üslup üretemez" çerçevesi (E009'u yanlış yapan iddia); *edne'l-ard*'ı tek okumaya indirmek; "send this to…" gibi paylaş/kaydet çağrıları; kaynaksız "30–40 yorumda 20K" iddiası; içki yasağını "tek cümle, anında" diye anlatmak (yasak kademeliydi: 2:219, 4:43, 5:90).
