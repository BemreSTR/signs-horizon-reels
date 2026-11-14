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

## Dersler (E021, seslendirmesiz, hikâye + dürüst mercek)
- `tools/render.sh` Chrome'u bulamayınca `set -e` + `ls` jokeri yüzünden **sessizce** çıkıyordu (log boş, çıkış 0); düzeltildi. Render sonrası log'da `Encoded N/N` görmeden bitti sayma.
- Satır uzunluğu: 20–25 karakterlik satırlar `fit` ile ~45–55 px'e iner; ayet çevirisi gibi uzun metni ≤ 20 karakterlik satırlara böl, vurgu cümlelerini tek başına büyük koy.
- Perde/ekran çizimi: tam boy dikey şeritler "ışık huzmesi" gibi okunur. Altın çubuk + yatayda yumuşatılmış (mask) kumaş + dalgalı etek kullan; üst yazının arkasına girmesin (çubuk y ≈ 790).
- Küçük ölçekte (uzak hurma, s < 0.5) kenar çizgisi kalınlığını ölçekle (`1.3*s`), yoksa uzak nesne tel kafes gibi parlar.
- Döngü: kamera itişi t = 0'da başlamasın; yakınlaştırma t < 0 öncesinden doğrusal sürsün (hız sıçraması yok) ve halka doğumları ön gösterim zamanlarını (−4…−1) da içersin. Dikiş farkı outro'nun son karelerindeki normal fark düzeyindeyse (1,4 ≈ 1,5) sorun yok; tipik adım yavaş sahnede 0,4.
- Ses: yatak (drone) frekanslarını 1/döngü katlarına kilitle (`round(f*70)/70`), dikişte tık olmaz. `curve()` bütün parça uzunluğunda; yerel katman için `under(sig, t0, noktalar)`.
- Olay-ses eşlemesi: halka doğumu = perdeli ping, kasılma = alçak atım, gövde sarsıntısı = vuruş, hurma düşüşü = düşüş süresi (`sqrt(2Δ/g)`) kadar sonra yumuşak iniş. Çizelgedeki sabitler (`PULSES`, `SHAKES`, `FALLS`, `RINGS`) ses betiğinde aynen yinelenir; değişirse ikisi birlikte.
- Hassas an (ölümü temenni, 19:23): ayet metni olarak, tefsirdeki bağlamıyla ver; yalnız metinsel gözlem ekle ("sonraki âyet: üzülme"), yorum ve çağrı ekleme. Tefsir İngilizce okunduysa bölüm notunda "Arapça/basılı teyit" bayrağı açık kalır.

## Dersler (E022, seslendirmesiz, Risale-i Nur + ayet)
- Kaynak dürüstlüğü: Risale alıntısı Türkçe asıldan, tam yer adıyla (Onuncu Söz, İkinci Hakikat) ve "SAID NURSI · TURKISH MUSLIM SCHOLAR" künyesiyle; çeviri "OUR TRANSLATION". Ahiret basamağı gibi alıntılayamadığın adımı alıntı gibi yazma, "step toward the hereafter" diye özetle. Nüshalar arası farklı örnekleri (tavuk/tavşan) atla; basılı nüsha teyidi bölüm notunda bayrak olarak kalır.
- Dürüst mercek yalnız "kanıt değil" demekle bitmez: karşı açıklamayı (biyologlar bakımı evrimle açıklar) ve yazarın aynı olguyu nasıl okuduğunu iki ayrı satırda göster.
- Çok sahneli tek çekim: kamera = dünya merkezi + log-uzay zoom, katmanlar paralaks (0,25/0,5/1). Pencereye yaklaşıp içeriye girmek için iç mekânı ayrı bileşen yap, pencerede clip'le; zoom 6× iken iç mekân zaten ekranı doldurur.
- Hayvan siluetinde (dişi aslan, yavru) kenar ışığı (amber çizgi) + göz parıltısı, yavruda kısa burun; yoksa iki siyah leke "tanınmaz" okunur.
- `tools/sfxlib.py` NOTE tablosunda `B` ve `G#` yoktu (`KeyError`); eklendi. Yeni nota adı kullanmadan tabloyu kontrol et.
- Ses: olay çizelgesini (MILK, THREADS) ses betiğinde aynen yinele; müzik kutusu ninnisi gibi melodik katmanı sahnenin süresine (beşik 23,4–28,0) yasla, ilk 2,9 sn minör → hediyeden sonra majör üçlü. Premix −14,6 LUFS, master −14,0/TP −1,0.
- Teslim öncesi: `safezone.py` küçük puntolu çipte bile 9 px taştı (size 21 → 19); uzun çipleri `fit` ile ya da ≤ 19 px yap. Kare başına centroid ölçümünde pencereyi satır girişlerinden ≥ 1 sn sonra aç (stagger fade-in 0,03 s/harf), yoksa yanlış "titreme" ölçülür.
- Arka plan render'i: `cmd &` kabuk çağrısı bitince bile süreç yaşadı, ama bildirim "tamamlandı" der; gerçek bitiş `Encoded N/N` + log'daki `EXIT 0` satırıdır.
