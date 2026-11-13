# E015 · The Open Check · Üretim notları (2026-11-04, v2)

Çıktı: `final.mp4` (1080×1920, 30 fps, 49,9 sn = 46,9 sn anlatım+kuyruk + 3 sn marka outro), `kapak1–3.png`, `captions.srt`, Remotion kaynağı. Kod: `src/E015.tsx`, `src/scenes/`; ses: `tools/sfx_mix.py`; zamanlama: `tools/align.py` + `tools/build_timing.py`.

## v2 düzeltmeleri (kullanıcı geri bildirimi)
- **Alt yazı sızıntısı:** `CAPTION_OFF` pencereleri üst üste bindiğinde fade'leri kesişip alt yazıyı kısa süre gösteriyordu (30,4 ve 37,9 sn). `Captions` artık dokunan/çakışan pencereleri birleştiriyor; pencereler 28,2–32,75 ve 36,05–41,95 olarak birleşik.
- **Üst yazıların çakışması:** "I ACCEPT YOUR FAITH." 30,08–30,36'da, "NEVER WALKED THROUGH IT." 37,5–37,82'de silinir; bir sonraki cümlenin ilk kelimesinden (30,41 / 37,90) önce ekran temizdir.
- **16–20 sn sesi:** tıkırtılar konuşma hecelerine göre kırpılıyordu (maskeleme kıskacı sürekli sesleri hece hece kısıyordu). Yerine tek parça `accel_travel`: yavaş adımlardan hızlanan titreşime, parlayan havaya yükselen darbe dizisi (2,4→34 Hz), 15,3–19,42 sn; her yıl kapısında yüksek bir "ting". Sürekli yataklar (rüzgâr, koro, bu efekt) artık hece değil cümle zarfını izleyen yavaş kısma + sabit EQ oyuğu kullanıyor; kıskaç yalnız vuruşlarda.

## Görsel tasarım kararları
- Planın "karar matrisi" kutuları yerine fiziksel dünya: bazalt masa + balmumu mühür → Mekke gece göğü + 111:3 → 3.600 günlük yol (her 120 birimde bir yıl kapısı) → uçta açık kapı. Kapı 'open' (31,66 sn) kelimesinde tam açılır, eşik 'never' (36,13 sn) kelimesinde yanar, kimse geçmez.
- İnsan/peygamber tasviri yok; tek ışık noktası (kor) kameranın önünde ilerler.
- Arapça yalnızca `verse.json` (111:3 excerpt `decree`) ve marka dosyasından (41:53); meal Saheeh International.
- Döngü: outro kare 0'daki masaya iner, Desk bileşeni negatif zamanı kabul eder; son kare → kare 0 farkı açılış karelerinin farkıyla aynı düzeyde.
- Kapaklar bağımsız kompozisyon (`Cover1–3`): mühür+başlık / kapı+"ONE SENTENCE TO DESTROY ISLAM" / 111:3+"WHY DIDN'T HE JUST LIE?". Başlıklar 3–5 kelime, y 240–1680 içinde.

## Ses tasarımı (hepsi sentezlendi, `tools/sfx_mix.py`, tohumlar sabit)
| Cue (sn) | Ses |
|---|---|
| 0,00 | başlık vuruşu |
| 0,9–2,8 | gerilim yükselişi → 'destroyed' 2,82: sub-boom + balmumu çatlağı + altın toz |
| 3,9–4,8 | yukarı tilt whoosh |
| 4,3→ | rüzgâr + düşük koro akoru (Mekke) |
| ~6,0 | ayet mürekkep şimmeri; 'burn' / 'blazing' kelimelerinde alev süpürmesi + çan, kor çıtırtısı |
| 12,68 'condemned' | taş damga vuruşu; 'alive' 13,81'de iki kalp atışı |
| 14,35–14,95 | ters şişme + yumuşak darbe (ışık sızıntısı) |
| 15,3–19,42 | hızlanan ilerleme efekti + 9 yıl kapısı "ting"i (kamera eğrisinden türetilmiş); 'days'te kilit, sonra nefes tutma |
| 19,98 | varış darbesi + hush |
| 21,03 / 22,57 | 'army' / 'sword' taş vuruşları, kılıç tınısı |
| 26,0–26,75 | dört kelime için dört çan |
| 28,4–30,0 | 'I accept your faith' altın tutuşma şimmerleri |
| 30,4–31,7 | taş kapı sürtünmesi + ışık seli; 'open' 31,66 darbesi |
| 32–37,4 | kor çıtırtısı yatağı, 'never' 36,13'te çan + darbe, sonra hush |
| 40,06 'key' | küçük altın tınısı; 41,8–42,6 aşağı tilt |
| 45,03 | son 'destroyed' |
| 47,0–49,9 | marka outro (whoosh, ters şişme, yumuşak darbe, şimmer, alt şişme) |
- Sürekli yatak (D1/A1 + hava, periyodik: başı ve sonu aynı). Vuruşlar anlatım altında kısılır; konuşma bandı (300 Hz–4 kHz) için ≥ 11 dB pay veren maskeleme kıskacı.
- Boomlara orta bant gövdesi eklendi: salt alt bas telefon hoparlöründe duyulmaz.
- Ölçüm: master −13,9 LUFS, TP −1,9 dBTP; konuşma bandı payı medyan 27,5 dB, en zayıf %10 = 15,4 dB (eşik 18 / 10). Kulakla dinleme (H38) kullanıcıda.

## Açık noktalar
- Süre 45–50 sn (istek); proje stratejisi 60–120 sn diyor ([growth/strateji](../growth/strateji.md) §2).
- `02-hikaye.md` "4 kelime" örneği ("I believe, you are wrong") sesle uyuşmuyor; ses/video "I accept your faith" (4 kelime) kullanıyor.
- "10 yıl / 3.600 gün" ve M.S. 613–14 → 624 yaklaşık; ekranda "≈ ten years" ve "c." ile verildi.
- Ebû Leheb'in ölümü Bedir'den hemen sonra (Şevval, H. 2); videoda sadece yıl aralığı.
- Yayında "synthetic content" beyanı işaretlenecek.
