# 13 · Hatalar ve Dersler

Yaşanan her hatanın kuralı (`H##`). Ayrıntılı hikâyeler git geçmişinde (2026-11-02 öncesi sürüm). **Her bölümden önce ön kontrol uygulanır; bölüm bitince yeni ders sıradaki numarayla eklenir** (başlık + tek satır kural, gerekirse kuralın tek kaynağına bağlantı).

> Not: E015 sonrası dersler (E015–E020) bu dosyada H## olarak değil, deponun kök `CLAUDE.md` dosyasındaki "Dersler (E0NN)" bölümlerinde tutulur.

## Ön kontrol

**Metin ve doğruluk**
1. Kelime bütçesi yazmadan önce konur, teslimden önce sayılır (~2,7 kelime/sn) → H01.
2. 3 kanca adayı; kanca kelimesi ≤ 3,5 sn; kare 0 küçük ekranda 1 sn'de anlaşılıyor; açılış kuralları ([growth/strateji §3](../growth/strateji.md#3-açılış-kuralları)) → H64, H76.
3. Her sayı, isim ve kurum bir kaynağa bağlı; köprü cümlesi tefsir/hadis/sözlüğe dayanıyorsa asıldan okundu; K1/K3/K5'te `dogruluk-denetcisi` → H80, H84.
4. Arapça yalnızca kaynak JSON'dan; `verse_check.py` OK; kodda Arapça karakter 0 → H39, H81.

**Görüntü**
5. En az 3–4 fiziksel mekân, kamera yolculuğu, kutu/kart yok; sahne sahne reji planı → H73, H74.
6. Still'ler tam boyutta; Arapça ekranlar büyütülüp harekelere bakıldı; metin sütunu x 180–900 → H13, H17, H59.
7. Her cue'da ekran sesle aynı şeyi söylüyor (`review/cue-sheet.png`) → H51.
8. Kamera hiçbir an görselin kenarını göstermiyor (zoom ≥ 1, merkez sınırı) → [08 §9](08-gorsel-dil.md#9-ai-arka-plan-görselleri).
9. 3 bağımsız kapak, filigran, AI görseller için prompt dosyası → H75, H78, H79.

**Ses ve zamanlama**
10. Ses gelince kritik vuruşlar doğrulandı (ElevenLabs SRT varsa `--srt`; yoksa H69 tablosu + spektrogram) → H09, H69.
11. Dijital sessizlik yok; miks payı konuşma bandında ≥ 18 / 10 dB → H31, H77.

**Render ve QA**
12. Final yalnızca `render_episode.py` ile (tip kontrolü, bozuk kare taraması); uzun render'dan önce kullanıcıya sorulur → H14, H82.
13. `qa.py --glitch --mix ENNN` FAIL'siz; döngü dikişi temiz → H54.

## Metin ve içerik

<a id="h01"></a>**H01 · Senaryo hedef süreyi aştı.** Kelime bütçesini yazmadan önce koy, teslimden önce say.
<a id="h02"></a>**H02 · Şablona aşırı yaslanma.** Şablonlar araçtır; bağlayıcı olan doğruluk ve saygıdır.
<a id="h03"></a>**H03 · "Aynı kelimeler" tam aynı değildi.** Birebir aynı olan Arapça kelimeleri kontrol et; farklı kısmı ayrı renkte göster.
<a id="h04"></a>**H04 · Mealler farklı tefsir görüşleri taşır.** En az iki meal karşılaştır; fark dürüst mercek gerektirebilir.
<a id="h05"></a>**H05 · Sayısı belirsiz grup.** Sayılabilir figürle değil, tek ışık ya da izle göster.
<a id="h40"></a>**H40 · Başka bir yapay zekânın fikri doğrulanmadan kullanılmaz.** Çekirdeği al, her olguyu birincil kaynaktan yeniden doğrula; "yalnızca Kur'an kaydeder" gibi mutlak ifade kurma.
<a id="h64"></a>**H64 · Asıl kanca 7–12. saniyede geliyordu (001, 002).** Kanca kelimesi ≤ 3,5 sn; kare 0 tek başına anlaşılır; 3 kanca adayı tam metinden önce.
<a id="h80"></a>**H80 · Ekrandaki sayılar kaynaksızdı, çalışma yanlış kuruma atfedildi (009).** Ekrana, kapağa, açıklamaya giren her sayı ve kurum kaynağa bağlanır; `dogruluk-denetcisi` K3 ve K5'te zorunlu; değiştirilemeyen hata açıklamaya "Correction:" ile yazılır.
<a id="h84"></a>**H84 · Tefsirin İngilizce kısaltmasındaki çeviri hatası bölümün köprüsü oldu (011).** Köprü, kanca ya da paylaşılacak cümle bir tefsir/hadis/sözlüğe dayanıyorsa o yer Arapça (İbranice) asıldan okunur; "doğrulanacak" diye işaretli kaynak özete ve kancaya girmez.

## Ayet metni ve veri

<a id="h06"></a>**H06 · Quran.com API Python'a 403 döndü.** İstekte User-Agent gönder (`fetch_verse.py`).
<a id="h07"></a>**H07 · Harekesiz eşleşme yanlış alıntıyı aldı.** `verse-spec.json`'da `nth` kullan, çıktıyı gözle oku; ekrandaki her Arapça parça excerpt olarak tanımlansın ki `verse_check` denetlesin.
<a id="h08"></a>**H08 · Mealde dipnot işaretleri kaldı.** `<sup>` içeriğiyle silinir.
<a id="h39"></a>**H39 · Elle yazılan Arapça kaynaktan farklıydı.** Arapça dokümanda ve kodda da kaynaktan kopyalanır.
<a id="h81"></a>**H81 · Arapça hook'u Claude dışında çalışmaz; elle yazılmış Arapça sızdı (009).** Arapça her zaman `VERSES` / `hadith.json`'dan import edilir; kodda Arapça karakter sayısı 0; hadis İngilizcesi çevirmeniyle birebir.

## Ses hizalama

<a id="h09"></a>**H09 · Kritik vuruşlarda ~0,1 sn sapma.** Büyük görsel vuruşları doğrula, `overrides.json`'a yaz; sert ünsüzler en güvenilir çapa.
<a id="h10"></a>**H10 · Büyük model daha iyi değildi.** Hizalamada `small` ile başla.
<a id="h11"></a>**H11 · Whisper duyma hataları.** Doğrulama farkını ElevenLabs hatasıyla karıştırma.
<a id="h41"></a>**H41 · Duraklamadan sonraki kelime ~0,3 sn kaydı.** Kritik kelimede 10 ms alçak/yüksek bant enerjisine bak.
<a id="h42"></a>**H42 · Whisper yumuşak satırı yanlış duydu.** Önce başka modelle yeniden dinlet, sesi suçlamadan önce.
<a id="h43"></a>**H43 · Vurucu ana yeterince sessizlik yoktu.** Senaryoya `{{silence:x}}` koy; ingest ekler ve zamanları kaydırır.
<a id="h56"></a>**H56 · Ingest eski hizalamayı kullanıyordu.** Önbellek ses, metin ve modelin SHA-256'sıyla anahtarlanır.
<a id="h57"></a>**H57 · Yanlış yazılmış işaret kelime sayıldı.** `script_build.py` tanımsız işarette durur; cue adları küçük harf `snake_case`.
<a id="h58"></a>**H58 · Doğrulama transkripsiyonu koca bölümleri atlayabilir.** Boşlukları ses enerjisiyle karşılaştır, gerekirse o aralığı ayrıca yazdır.
<a id="h68"></a>**H68 · `{{silence:x}}` süreyi şişirdi (004).** İlk ingest'ten sonra doğal boşluğu ölç; yeterliyse işareti kaldır.
<a id="h69"></a>**H69 · Duraklama sonrası nazal kelime 350 ms geç hizalandı (004).** `ingest.py`'nin başlangıç tablosundaki > 80 ms farkları spektrogramda onayla; ElevenLabs SRT varsa `--srt` kullan (E012'de stable-ts son kelimeleri yığdı).
<a id="h70"></a>**H70 · Çok sayıda screen-blend parlama kare düşürdü.** Nokta parlamalarında normal karışım; titreme görülürse tek tek kareye bak.
<a id="h71"></a>**H71 · Ayet kartı erken kapandı.** Cümle bittikten sonra ~1 sn tam okunur kalır; sahne penceresi bileşenin fade'inden sonra kapanır.

## Render ortamı

<a id="h12"></a>**H12 · Paketli headless Chrome takılıyor.** Sistem Chrome'u (`scripts/chrome.sh`); yeni kurulumda smoke render.
<a id="h13"></a>**H13 · `--scale=0.5` ile still bozuk.** Tam boyutta render et, sonra küçült.
<a id="h14"></a>**H14 · GPU döşeme bozulması.** `glitch_scan.py` + `render_episode.py` otomatik yeniden render.
<a id="h15"></a>**H15 · Kare aralığı ve dosya adları.** Kare dizisi için `--sequence`; dosyaları tamsayı kare numarasıyla eşleştir.
<a id="h16"></a>**H16 · Bellek baskısı.** Final render'dan önce Studio'yu kapat.
<a id="h44"></a>**H44 · CSS `background-image` yüklenmesi beklenmez.** Dokular `<Img>` ile.
<a id="h55"></a>**H55 · Final video tam aralıklı çıkıyordu.** Çıktı `yuv420p`, `color_range=tv`, `bt709` olmalı (`render_episode.py`).
<a id="h60"></a>**H60 · Başka oturumun Studio'su 3000'i tutuyordu.** Render komutları `--port=3456`.
<a id="h82"></a>**H82 · Tip hataları render'ı durdurmadı (009).** `render_episode.py` ve `qa.py` önce `tsc` çalıştırır; sahne zamanları `cue()` ile.
<a id="h85"></a>**H85 · Taslakta bozuk kareler kullanıcıya gitti (014).** Taslak modu da döşeme taramasını yapar ve bozuk kareleri yeniden çizer (`render_episode.py` `fix_glitches`).

## Görsel ve kod

<a id="h86"></a>**H86 · Kamera plakanın dışına çıktı, siyah boşluk kaldı (014).** `CameraRig` hedefi zoom `z`'ye göre sınır içinde: x ∈ [540/z, 1080 − 540/z], y ∈ [960/z, 1920 − 960/z], nefes payıyla. Dönen plakada ölçek ≥ cos θ + (1920/1080)·sin θ.
<a id="h87"></a>**H87 · İç içe maskeli ölçek geçişi oval leke ve çerçeve kenarı gösterdi (014).** Ölçek zincirinde her plaka kareyi doldurur (≥ 1,03×) ve uzaklaşırken bir sonraki üstünde çözülür; maske ve küçülen kare yok.
<a id="h88"></a>**H88 · Teslim edilen görsellerin adları kaymıştı (014).** Görseller gelince kontak sayfası ve md5 ile içerik kontrol edilir; studio'ya gösterdiği şeyin adıyla kopyalanır, kullanıcının dosyalarına dokunulmaz.
<a id="h89"></a>**H89 · SVG bulanıklığı ölçekli path'in içinde kuşu kareye çevirdi (014).** Filtre ölçeksiz bir `<g>`'ye konur; `stdDeviation` path'in `scale`'iyle çarpılır. Kuş siluetinde oran: geniş kanat, kısa gövde (uçak gibi okunmasın).
<a id="h17"></a>**H17 · Arapça harekeler kırpıldı.** `inline-block` + cömert padding; ayet ekranını tam çözünürlükte kontrol et.
<a id="h18"></a>**H18 · Alt harekeler alttaki satıra değdi.** Yerini H46 ve H62 aldı.
<a id="h19"></a>**H19 · Altyazı dev metinle çakıştı.** Altyazı anlık zamana göre de gizlenir.
<a id="h20"></a>**H20 · Güvenli alan aşıldı.** Yerini H59 aldı.
<a id="h59"></a>**H59 · Metinler sağ butonların altına giriyordu.** Kritik metin x 180–900 (`TEXT_COLUMN`); `safe-zone-scan.js` ile kontrol.
<a id="h21"></a>**H21 · Zaman atlamasında flaş riski.** Büyük alanda saniyede 3'ten fazla parlaklık sıçraması yok; hızlandıkça ışık ortalamaya karışır.
<a id="h22"></a>**H22 · Mağara "çıkartma" gibi duruyordu.** Asimetrik şekil, kenar ışığı, doku, alan derinliği.
<a id="h23"></a>**H23 · Güneş/ay izleri dikey çizgi gibi.** Daha geniş ve alçak yaylar.
<a id="h24"></a>**H24 · Açılışta ay görünmüyordu.** Gök cisminin kadrajdaki yerinden geriye zamanı hesapla.
<a id="h25"></a>**H25 · Sayı geçişinde çift görüntü.** Eski öğe çıkmadan yenisi girmez.
<a id="h26"></a>**H26 · Parşömen açılışı bulanık ışık topu gibiydi.** Daha hızlı ve keskin açılış.
<a id="h27"></a>**H27 · Şehir silüeti sırtla aynı renkteydi.** Uzak silüet arka plandan bir ton açık.
<a id="h28"></a>**H28 · Dolgu silüetler kaba.** Çizilerek beliren altın çizgi sanatı.
<a id="h29"></a>**H29 · Sahne geçişinde kesik.** Her sahne kendi arka planını da fade ile açar.
<a id="h30"></a>**H30 · Küçük kod hataları.** Her sahne fonksiyonunu küçük bir zaman tablosuyla gözden geçir; sonraki faz öncekinin bittiği durumdan başlar.
<a id="h45"></a>**H45 · Birleşme noktasındaki ışık Allah'ı temsil ediyormuş gibi okunabilirdi.** "Tek Tanrı" fikri bir nesneyle gösterilmez.
<a id="h46"></a>**H46 · Kesra meal satırına değdi.** Arapça satır üstünden meal satırı üstüne ≥ 2,5 × yazı boyutu.
<a id="h47"></a>**H47 · CSS 3D perspektifli düzlemler.** Düzlem derinliği perspektif mesafesini aşmaz.
<a id="h48"></a>**H48 · Aynı mekânın iki açısı çapraz geçişte çift ufuk yaptı.** Aynı mekânda kamera hareketi kullan.
<a id="h49"></a>**H49 · Birbirini götüren formül terimleri.** Formülü üç zaman değeriyle hesapla; dönüşlerde ölçek ≥ 0,35.
<a id="h51"></a>**H51 · Görüntü anlatılan olayla çelişti.** Her cümle için "bu anda ekranda ne var?" sorusunu cue'larla yanıtla.
<a id="h52"></a>**H52 · Açıklama gerektiren simge işe yaramadı.** Simge bir saniyede tanınmalı.
<a id="h53"></a>**H53 · Bozuk kare tarayıcısı üç türü kaçırdı.** Kısa dönem, boş kare ve zamansal aykırı değerler de taranır.
<a id="h54"></a>**H54 · Döngüye eklenen her şey döngüyü korumalı.** Outro açılış karesinden çıkar ve ona döner; döngü saati toplam kareden hesaplanır.
<a id="h61"></a>**H61 · Harita poligonu kırpılınca yarımada kayboldu.** Bölgesel haritada kıyı çizgisi konturu.
<a id="h62"></a>**H62 · Esreler alttaki İngilizceye değdi.** Arapça satırın altında ≥ 0,4 × yazı boyutu boşluk.
<a id="h63"></a>**H63 · Kapak karesine altyazı yandı.** Kapaklar bağımsız tasarlanır (H75).
<a id="h65"></a>**H65 · Çıplak kelime indeksi sessizce kayardı.** `wordAt(i, 'beklenen')`; tek an için cue.
<a id="h66"></a>**H66 · Refactor'u piksel farkıyla doğrulamak yanılttı.** Eşdeğerlik kanonik DOM hash'i ve ses stemiyle ölçülür.
<a id="h67"></a>**H67 · Dokular tek paylaşılan RNG ile üretiliyordu.** Her dokunun kendi seed'i; yayınlanmış bölümlerin dokuları yeniden üretilmez.

## Ses

<a id="h31"></a>**H31 · Efektler kritik kelimeleri bastırdı.** Efekt veriyolunda sidechain ducking, `*_vo` varyantları; konuşma bandında medyan ≥ 18 dB, alt %10 ≥ 10 dB.
<a id="h32"></a>**H32 · Tam bant ölçüm yanılttı.** Anlaşılırlık 300 Hz–4 kHz bandında ölçülür.
<a id="h33"></a>**H33 · Fısıltılı son cümle ortamda kayboldu.** Yumuşak satırlarda yatağı ayrıca kıs; açılış ve kapanış yatağı aynı seviye.
<a id="h34"></a>**H34 · Döngü noktasında tık riski.** 30 ms kenar fade.
<a id="h35"></a>**H35 · `public/`'e inceleme görseli konmuştu.** `public/` yalnızca render varlıkları içindir.
<a id="h50"></a>**H50 · `mix_check` konuşma bandında ölçer.** Tam bant için `--full`.
<a id="h77"></a>**H77 · Dijital sessizlik yok.** Kesintisiz yatak; duraklamada yataklar çekilir, sıfıra inmez ([09 §1](09-ses-tasarimi.md#1-i̇lkeler)).
<a id="h83"></a>**H83 · Ses görselleştiricisi gerçek kaydı yansıtmıyordu (010).** Spektrum ölçülmüş veriden (`audio_features.py`); sessizlikte eğri çizilmez; sessizlik ve bilinen tonla doğrula.

## Süreç

<a id="h36"></a>**H36 · Ortam kontrolü geç yapıldı.** Yeni projede ilk iş smoke render ve tek still.
<a id="h37"></a>**H37 · Uzun işleri beklerken sleep zinciri.** Uzun işler arka planda; bitişi bildirimle izlenir.
<a id="h38"></a>**H38 · Ses kulakla doğrulanamaz.** Ölçümle raporlanır; final dinlemesi kullanıcıda (K5).
<a id="h72"></a>**H72 · `04-yayin.md` eksikti.** Her zaman `publish_pack.py` ile `publish.json`'dan üretilir; `qa.py` denetler.
<a id="h73"></a>**H73 · Videolar "tek arka plan + kutu" kalıbına kaydı (004–006).** Her bölümde 3–4 mekân ve kamera yolculuğu; kural: [08 §1](08-gorsel-dil.md#1-konsept-ve-sinematik-dünya).
<a id="h74"></a>**H74 · Yüzeysel kurgu planı durağan video doğurdu.** Her sahne için mekân, kamera, kod katmanları, tipografi, geçiş ve ses yazılır ([sablonlar/02](sablonlar/02-hikaye-plani.md)).
<a id="h75"></a>**H75 · Rastgele kareden kapak tıklanmayı düşürür.** 3 bağımsız kapak ([08 §8](08-gorsel-dil.md#8-açılış-kapak-filigran)).
<a id="h76"></a>**H76 · İlk karede büyük, ortada, net metin ve punch.** Kural: [08 §8](08-gorsel-dil.md#8-açılış-kapak-filigran), [growth/strateji §3](../growth/strateji.md#3-açılış-kuralları).
<a id="h78"></a>**H78 · Statik AI görseller serbest; prompt ve dosya adı verilir.** Kural: [08 §9](08-gorsel-dil.md#9-ai-arka-plan-görselleri).
<a id="h79"></a>**H79 · Her videoda `@signsinthehorizon` filigranı.** Kural: [08 §8](08-gorsel-dil.md#8-açılış-kapak-filigran).
