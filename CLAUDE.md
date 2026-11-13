# Çalışma notları
- Konuşma Türkçe; videodaki metin ve ses İngilizce. Kurallar `docs/` (ve `growth/`) altında; dizin: `docs/README.md`. Yeni bölümden önce `docs/13-hatalar-ve-dersler.md` ön kontrolü + aşağıdaki dersler okunur; burada tekrarlama.
- **Depo = kaynak gerçek.** Claude Project (`signs-in-the-horizon`) kopyadır. Her bölüm bitince AYNI commit'te: kod, `public/ep/<id>/`, `tools/eNNN_audio.py`, `episodes/<id>.md`, bu dosyaya dersler, README bölüm tablosu, `docs/05` + `docs/12` kayıtları, yeni sabit kural varsa ilgili `docs/` dosyası; sonra push, sonra Project kopyalarını güncelle. Yeni bağımlılık → `package.json` / `requirements.txt`. Yeni makinede çalışmayacak mutlak yol/ortam varsayımı yazma (`CHROME`, `SCRATCH` ortam değişkenleri).
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

## Dersler (E018, seslendirmesiz)
- Açık `size` verilen satırlar `fit` ile sınırlanmaz: render sonrası `tools/safezone.py` ile tam çözünürlükte x 180–900 doğrula (hook ve madde listesi 10–30 px taştı).
- Çizimde kefe/kap çocuklarından önce çizilir; yoksa içindeki ağırlıklar gizlenir. Döngüde iki farklı sahne pozunu çapraz geçirme (hayalet çift görüntü): sahneyi son karelerde başlangıç pozuna keyframele, çapraz geçiş mikro olsun.
- ﷺ glifi Cormorant'ta yok: metin `text.json`'dan, Arapça aralığı Amiri Quran ile yaz (`Line`).
- Hadis/olay videosunda dürüst mercek: karşı tarafın itirazını ve sonucu (tahtını korudu) ekranda bırak; çevirilerde "OUR TRANSLATION" çipi.
- Render `--concurrency=2` yazıyı tek/çift karelerde ~1 px kaydırıp titretti (E018); `render.sh` artık 1. Teslim öncesi sabit yazı döneminde kare başına dikey ağırlık merkezi ölç (aralık < 0,1 px olmalı).

## Dersler (E019, ElevenLabs sesli)
- Saat = ElevenLabs kelime zamanları (`public/ep/<id>/words.json`, SRT'den). Üst yazının `out`'u cümlenin son kelime bitişine, `off` pencereleri aynı sınırlara oturur; yoksa sonraki cümlenin ilk kelimeleri ekranda hiçbir yerde olmaz.
- Gemini'nin gömülü yazısı yanlış çıkabilir (eksik "A"): yazıyı yıldız izi kutbu etrafında döndürerek doldur (kutbu, döndürülmüş kopya farkını minimize ederek bul), marka fontuyla yeniden yaz; ışığı 3:4 kırpma içine almak için görseli yukarı kaydır.
- Açık `size` fit'e uymaz: 50 px'lik uzun alt satır 929 px yayıldı; fit() ile sınırla ya da iki satıra böl. `Lines` bileşeninde `size` tavan sayılır.
- Altın ışık sütununun önünde altın yazı okunmaz: fildişi yazı + yerel koyu gölge. Düz sarı katman (%20) koyu lacivert üstünde çamurlu görünür; parlamayı radyal ışıkla, ≥0,9 s'de aç (bir karede ortalama parlaklık 8 birim sıçradı).
- Sürekli ping efekti ekrandaki halka doğumuna bağlanır (t_n = n·gap/v); halka kapalıyken (hapis) ses de susar.

## Dersler (E020, seslendirmesiz, parlak/gündüz)
- Konu öznesini arka plandan `rembg` (isnet-general-use + alpha matting) ile ayırıp yazıyı arkasına koy; ama kanat/gövde harfleri örtmemeli: "BEE" sola yaslandı, kanat ucu yalnız son harfin köşesini örter.
- Döngü dikişi: kare 0'daki vuruş "punch" ölçeği ön gösterimde (t<0) de aynı olmalı, yoksa dikişte kamera sıçrar (dikiş farkı 20 → 6,5; outro dalına Vignette+Grain eklenince 1,2, tipik adım 0,87). Outro dalında da Vignette + Grain + aynı Watermark opaklığı.
- Hex geçişi kare başına ~35 birim ortalama parlaklık sıçratır ama >%60 parlak kare yoktur; 1 sn'de en çok 2 büyük dönüş. `tools/qa_video.py` bunu ölçer.
- Anton `fitText` ile `fontFamily: 'Anton'` ölçülür; `fonts.ts`'e eklenmeden ölçüm yanlış çıkar. Açık Arapça bloğu için kapsayıcı genişliği ≤ 740 px (x 180–900).
- Okuma süresi: tek vuruşta gelen satırlar aynı `out`'a kadar birikir; toplam kelime sayısına göre 1 sn + 0,25 sn/kelime hesapla.
