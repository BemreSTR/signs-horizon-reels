# Deneyler

Her deney tek bir değişkeni değiştirir. Hipotez, nasıl ölçüleceği ve karar ölçütü yayından önce yazılır; sonuç geldiğinde aynı satıra işlenir. Bir deneyin sonucu [strateji.md](strateji.md)'yi değiştiriyorsa orası da güncellenir.

| No | Durum | Değişken |
|---|---|---|
| [X1](#x1) | Yüklendi 2026-11-01; ölçüm 11-04 ve 11-08 | E003 açılışı (hook A → hook B) |
| [X2](#x2) | Sıradaki 3 yayında | Yayın saati |
| [X3](#x3) | Sıradaki bölümlerde | Süre (60–75 ve 90–120 sn) |
| [X4](#x4) | Beklemede | Kapak başlığı |
| [X5](#x5) | Sıradaki 3 yayında | Açıklamanın sonunda dürüst bir soru |

<a id="x1"></a>
## X1 · E003 hook B (Trial Reel)

- **Hipotez:** E003'ün düşük izlenmesi içerikten değil açılıştan. Kare 0'da büyük başlık olan sürüm, takipçi olmayanlarda daha düşük atlama oranı ve daha uzun ortalama izleme alır. Paylaşım oranı (%9,5) korunur.
- **Değişen tek şey:** İlk ~5 sn'nin görüntüsü (başlık + o aralıkta altyazı kapalı). Ses, gövde, süre, döngü aynı.
- **Dosya:** `episodes/003-the-desert-sings/out/hook-b/final.mp4` (kapak: aynı klasörde `kapak.png`, 1. saniye).
- **Nasıl:** Instagram'da Trial Reel olarak yükle (yalnızca takipçi olmayanlara gösterilir). Açıklama yayındaki E003 ile aynı. Saat: 17:00–19:00 TR.
- **Ölçüm (3. ve 7. gün):** atlama oranı, ortalama izleme, izlenme, paylaşım/izlenme. Karşılaştırma: yayındaki E003'ün ilk günleri (bilinmiyorsa bugünkü oranları).
- **Yükleme:** 2026-11-01, Trial Reel.
- **Karar:** Atlama oranı belirgin düşük ve ortalama izleme ≥ 27 sn ise hook B ana akışa alınır ve açılış kuralları kalıcı olur. Fark yoksa sorun açılıştan çok konu/saat; X2 ile birlikte yeniden bakılır.
- **Sonuç:** –

<a id="x2"></a>
## X2 · Yayın saati

- **Hipotez:** Kitle Güney Asya + Birleşik Krallık + ABD. 17:00–19:00 TR (Hindistan akşamı, Birleşik Krallık öğleden sonrası) yayınları ilk 24 saatte, gece yarısı TR yayınlarından daha çok izlenir.
- **Nasıl:** Sıradaki 3 yayın 17:00–19:00 TR. `yayin_saati_tr` sütununa yazılır.
- **Ölçüm:** 24 saat ve 3. gün izlenme; Insights'taki "takipçilerinin en aktif olduğu saatler" grafiğinin ekran görüntüsü.
- **Sonuç:** –

<a id="x3"></a>
## X3 · Süre

- **Hipotez:** 60–75 sn'lik bölümler daha yüksek izlenen kısım oranı alır; 90–120 sn'lik bölümler daha çok kaydetme ve paylaşım alır. En iyi iki video (E007 61 sn, E009 67 sn) kısa uçta; ama konuları da farklı, bu yüzden süre ayrı ölçülür.
- **Nasıl:** Hedef aralık 60–120 sn ([strateji §2](strateji.md#2-süre-ve-yapı)); süre konuya göre seçilir, her bölümün süresi metriklerde kayıtlı.
- **Ölçüm:** İzlenen kısım (%), izlenme, paylaşım/izlenme; uzun bölümlerin ortalamasıyla karşılaştırma.
- **Sonuç:** –

<a id="x4"></a>
## X4 · Kapak başlığı

- **Hipotez:** Profil ızgarasında 3–4 kelimelik tek başlıklı kapak, yoğun metinli kapaktan daha çok tıklanır (E007, E009 ↔ E008).
- **Nasıl:** Her bölümün 3 kapağından (H75) birinin bu kurala uyması; hangisinin seçildiği kaydedilir.
- **Ölçüm:** Profil ziyaretinden gelen izlenme (Insights'ta görünüyorsa).
- **Sonuç:** –

<a id="x5"></a>
## X5 · Açıklamanın sonunda soru

- **Hipotez:** Yorumlar 0–4 arasında. Açıklamanın sonuna cevabı tek kelime olmayan, dürüst bir soru eklemek yorumu artırır; yorumlar da dağıtımı.
- **Kurallar:** Soru videonun konusundan doğar, iki tarafa da açıktır, CTA değildir ("comment below", "let me know" yok). Videonun içi değişmez: video tefekkür ve döngüyle biter. Örnek (E003): `Isaiah names Kedar, the sons of Ishmael. Who else could "the villages that Kedar doth inhabit" refer to?`
- **Nasıl:** Sıradaki 3 yayında soru var, sonraki 3'te yok; aynı türden bölümler karşılaştırılır.
- **Ölçüm:** Yorum sayısı (`not` sütununa), izlenme, paylaşım/izlenme. İlk saatte gelen her yoruma cevap verilir ([metinler](metinler.md#yorum-cevapları)).
- **Sonuç:** –

## Sonra denenecekler

- İlk 30 sn'de daha az duraklama: hız zaten 1.20 ([docs/03 §7](../docs/03-hikaye-anlatimi.md#7-tts-ve-elevenlabs)), artırılmaz; bunun yerine açılıştaki `{{silence:x}}` ve `...` sayısı azaltılıp sessizlik ifşa anına saklanır.
- İki parçalı bölüm: uzun bir konuyu 2 × ~62 sn'ye bölüp ikincisini ertesi gün yayınlamak.
