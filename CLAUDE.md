# Çalışma notları
- Konuşma Türkçe; videodaki metin ve ses İngilizce. Kurallar projedeki dokümanlarda; burada tekrarlama.
- Cue zamanları `public/ep/<id>/cues.json` (ses ana saat). Animasyon yalnızca kare/zamandan türer (CSS geçişi yok).
- Teslim: `out/<ID>.mp4`, `captions.srt`, `kapak1–3.png` (SendUserFile). Kaynak kod bu depoda kalır; iş bitince commit + push et (geçici ortam silinir).
- Render: `tools/render.sh`, master: `tools/master.py`. Kontrol: bozuk kare taraması, döngü dikişi, `mix_report.py`, anahtar karelere bakış.

## Dersler (E015)
- Ses: sürekli efektleri hece hece kısma ("kıskaç") parçalı duyulur; yavaş zarf + sabit EQ oyuğu kullan, kıskacı yalnız vuruşlara uygula.
- Alt sesi telefon hoparlörü çalmaz: vuruşlara 150–600 Hz gövde ve 3 kHz üstü ekle.
- Mono sesi stereoya kopyalayınca LUFS +3 dB ölçülür.
- Alt yazı `off` pencereleri birleşmeli (çakışırsa geçişte alt yazı sızar). Üst yazı, sonraki cümle başlamadan silinmeli.
- Cormorant rakamları eski tarz ("10" → "ıo"); başlıkta rakam yerine yazı ya da lining-nums.
- Zero-phase (`sosfiltfilt`) bölme kullan; nedensel filtreyle `x - bp(x)` bant içinde enerji bırakır.

## Dersler (E016, seslendirmesiz)
- Saat ses değil vuruş ızgarası (`src/e016/timeline.ts`); kesimler vuruşa oturur, ses betiği aynı zamanları kullanır.
- Okuma süresi: her yazı en az 1 sn + kelime başına 0,25 sn ekranda kalır; ses okumayı hızlandırmıyor.
- quran-json paketindeki Arapça KFGQPC kodlamasıdır (U+0656, U+065E); Amiri Quran'da bozuk çıkar. Ayet metni Quran.com `text_uthmani` olmalı.
- Tam ekran parlak geçiş karesi "flaş" sayılır; opaklığı ≤ 0,6 tut.

## Dersler (E017)
- Gündüz/gece gibi parlaklık değiştiren döngüleri ~3 Hz'den hızlı çevirme; hızlandıkça salınımı daralt (stroboskop etkisi olmasın).
- Açılış yakın plansa kare 0'dan itibaren kamera itişi ekle; küçük nesne hareketi tek başına "ilk 0,5 sn'de hareket" eşiğini geçmez.
- Sahne durumunu `t`'nin saf fonksiyonu yap (`Scene t`): döngü ön gösterimi (t < 0) ve kapaklar aynı bileşeni kullanır.
- Aynı SVG bileşeni ekranda iki kez varsa gradient/clip id'leri benzersiz olmalı (`uid` öneki): `url(#id)` belge genelinde çözülür, ikinci kopya birincinin renklerini alır.
- Temsil anlatan videoda öğeleri sıralamak yetmez: hikâyeyi baştan kur, dönüşümün sebebini göster, dersi son karede açıkça yaz. Videonun kendi kaynağında olmayan ayeti sona ekleme.
- Hayvanlar tanınır çizilmeli (profil, yele, burun, boynuz); "stilize" diye geçme.
