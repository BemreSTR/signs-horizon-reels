# E020 · That Bee Is a She (Nahl 16:68–69)

Seslendirmesiz, 38,0 sn (35,0 içerik + 3 sn marka outro), 120 BPM ızgara (1 vuruş = 0,5 s). Parlak gündüz görünümü (bal sarısı / siyah / beyaz, Anton + Barlow Condensed, altıgen geçişler): kanalın gece-altın dilinden bilinçli olarak ayrı. Görseller kullanıcının Gemini fotoğrafları (AI üretimi), hareket ve yazı Remotion'da.

**İddia cümlesi:** Bal arısı toplayıcıları dişidir; Kur'an 16:68–69 arıya dişil ikinci tekil emirle seslenir (ittakhidhī, kulī, fasluki, rabbiki). Arapçada *naḥl* toplu isimdir ve dişil işlenebilir; video "Kur'an önceden bildirdi" demez, ikisini yan yana koyar ve "WE CLAIM NOTHING MORE" der.

## Kaynaklar (K1, 13 Kas 2026)
- Ayet metni: Quran.com `text_uthmani` (api.quran.com, 16:68 tam; 16:69 yalnız ilk yan cümle) → `public/ep/e020/verse.json`. Yayından önce verse_check yeniden.
- Dilbilgisi: Kurtubî, *el-Câmi*, 16:68 (Cevherî'den): "والنحل يؤنث في لغة أهل الحجاز"; kelime erkek ve dişi arıyı kapsar. quran.ksu.edu.sa sayfasından okundu; **basılı nüshadan teyit edilmeli**. (Mearif-ul-Kur'an bu konuya girmiyor.)
- Biyoloji: SARE *Bee Biology* (erkekler toplamaz; polen sepeti, balmumu bezi, iğne yok; toplayıcılar dişi işçiler) · National Geographic, honey bee jobs (işçiler dişi, erkekler ~%10 ve çalışmaz).
- Çeviriler bize ait; ekranda "OUR TRANSLATION" çipi.

## Kurgu (saniye)
| sn | Fotoğraf | Yazı |
|---|---|---|
| 0–3 | hero (çiçekte arı), kare 0'dan itiş; "THAT BEE" arının arkasında | THAT BEE / IS A SHE. |
| 3–6 | çayır | FORAGING HONEYBEES / ARE FEMALE. |
| 6–8,5 | erkek arı kesiti, bal sarısı poster | THE MALES / DON'T FORAGE. |
| 8,5–10,5 | petekte işçiler | EVERY WORKER / IS FEMALE. |
| 10,5–14 | siyah, altıgen alan | ٱلنَّحْلِ · HOW DOES THE QUR'AN SPEAK TO THE BEE? · QUR'AN 16:68–69 |
| 14–23 | siyah | üç ayet parçası, fiil sarı, "FEMININE FORM" + çeviri |
| 23–28 | bölünmüş ekran | AL-QURTUBI: "NAHL" IS FEMININE IN HIJAZI ARABIC · GRAMMAR TREATS "BEES" AS FEMININE. · WORKER BEES ARE FEMALE. · WE CLAIM NOTHING MORE. |
| 28–31 | bal akışı | "A DRINK OF VARYING COLORS." (16:69, OUR TRANSLATION) |
| 31–34,8 | petek hücresi → dalış | THE SMALLEST WORKER IS ADDRESSED AS "YOU." |
| 34,8–35 | hex geçişi hook karesine iner | (döngü) |
| 35–38 | marka outro | |

## Dürüst mercek
- Dilbilgisi tek başına dişil kipleri açıklayabilir; biyoloji bağımsız olarak toplayıcıların dişi olduğunu söyler. Video ikisini ayrı tutar.
- "Her arı dişi" denmez: bombus ve yalnız arıların erkekleri çiçeğe konar. Yalnız *bal arısı toplayıcıları*.
- Görseller AI üretimi; açıklamada belirtilir.

## Kapaklar
`out/E020/kapak1–3.png` (`src/e020/Covers.tsx`, videonun kendi kareleri): 1 THAT BEE / IS A SHE. · 2 THE MALES / DON'T FORAGE. · 3 THE SMALLEST WORKER IS ADDRESSED AS "YOU."

## Teslim (13 Kas 2026)
- `out/E020.mp4` 1080×1920, 30 fps, 38,0 sn, −14,0 LUFS / TP −1,1. Kod: `src/e020/{timeline,tokens,Hex,Type,E020,Covers}.tsx`; ses: `tools/e020_audio.py` (kök = kanat vuruşu ~232 Hz = Sib; her vuruşta kuru "slam": 150–600 Hz gövde + 3 kHz üstü; hex geçişi = karo tıkırtıları; ayet = fiil başına yükselen Sib–Re–Fa; dürüst mercekte neredeyse sessiz; kuyrukta vızıltı kare 0 vuruşuna büyür); kontrol: `tools/qa_video.py` (bozuk/donuk kare yok, >%60 parlak kare yok, 1 sn’de ≤2 büyük parlaklık dönüşü, döngü dikişi 1,23 / tipik 0,87).
- Arı kesitleri: `rembg` (isnet-general-use + alpha matting) → `public/ep/e020/{hero,drone}_cut.png`.
