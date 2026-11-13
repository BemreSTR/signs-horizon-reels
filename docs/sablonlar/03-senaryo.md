# Senaryo · Bölüm NNN · <Konu>

> Şablon → `episodes/NNN-slug/03-senaryo.md`. Kurallar: [03 §5–8](../03-hikaye-anlatimi.md#5-yazım-dili-i̇ngilizce). Örnek: `episodes/e019/03-senaryo.md` (güncel depo).
> Ses: Emin (PVC) · Eleven v4 · hız 1.20. Hedef: <süre> sn, <kelime> kelime. Asıl kanca kelimesi: `<cue>`. Paylaşılacak cümle: ¶<n>.

## Metin

### B0 · Kanca (0–3 sn)
> Ekranda kare 0'dan: <BAŞLIK>. Altyazı bu aralıkta kapalı.

¶1 {{hook}}<İlk cümle; kanca kelimesinde cue:> {{<kanca>}}<kelime>…{{hook_end<}}

### B1–B4 · <beat adı> (<sn aralığı>)
> <sahnede ne görünüyor>

¶2 {{<cue>}}<metin>. {{silence:0.5}}

### B5 · İfşa
¶<n> {{<cue>}}<paylaşılacak cümle>{{<cue>_end<}}

### B6 · Dürüst mercek
¶<n> {{<cue>}}<1–2 cümle>

### B7 · Yankı ve döngü
¶<n> {{final}}<son cümle, açılışa bağlanır>{{end<}}

## Notlar
- Alıntılar ve kaynakları (`verse.json`, `kjv.json`, `hadith.json`); kısaltılan alıntılar.
- Dürüstlük: hangi cümle hangi kaynağa atfedildi; açıklamaya girecek notlar.
- Telaffuz: yeni özel isimler ([03 §7](../03-hikaye-anlatimi.md#7-tts-ve-elevenlabs)).
- Kelime sayısı ve tahmini süre: elle say (~2,7 kelime/sn); eski `script_build.py` bu depoda yok.
