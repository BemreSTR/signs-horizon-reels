# 08 · Görsel Dil

Kanalın sanat yönetimi; görsel kuralların tek kaynağı. Sayısal değerlerin makine kopyası: [brand/tokens.json](brand/tokens.json) (kodda `brand/tokens.ts`: `C`, `FONT`, `TEXT_COLUMN`, `TYPE_FROM_004`).

> Depo notu: bu doküman eski "studio/" düzeninden gelir. Bu depoda Remotion kodu kökte `src/` altındadır; `studio/src/...` yollarını `src/...` diye oku. Bölüm bazlı güncel pratikler kök `CLAUDE.md` ve `episodes/*.md` dosyalarındadır.

## 1. Konsept ve sinematik dünya

**"Gece ve Nur":** her video karanlığın içinde bir ışığın gizli olanı açığa çıkarmasıdır. Zemin mavimsi, dokulu bir gece (asla `#000`); ışık altın. **Nur noktası** imza motifidir: kancada odak, geçişte yol alan ışık, ifşada parlama, son karede tek nokta. Her bölüm konusuna göre bir **dünya aksanı** seçer.

**Sinematik dünya zorunluluğu (H73):**
- Her bölümde en az **3–4 fiziksel mekân / kamera perspektifi** (`scenes/S1…Sn.tsx`) ve gerçek bir kamera yolculuğu: dıştan içe dalış, ölçek değişimi, yukarıdan aşağıya iniş. Referans: E001 (mağara POV, şehir, dağa kaçış, zaman atlaması), E002 (yarılan deniz, sahil, tapınak, sualtı), E012 (kumullar, 7. yy mescit, ova).
- Bir kavram, kelime farkı ya da tarihsel olay **çerçeveli bilgi kartlarıyla** (`Card`, `Badge`, kutulu diyagram, "telemetri" yazıları) anlatılmaz; mekânla, ışıkla, mimariyle gösterilir.
- Döngü, kameranın aynı yerde durması demek değildir: yolculuk yapılır, yalnızca son sahne açılış karesine döner.
- `x 180–900` sınırı yalnızca okunacak metin içindir; dünya, manzara ve atmosfer bütün 1080×1920 kanvası doldurur.
- Hikâye planında her sahne için mekân, kamera (`CameraRig` waypoint'leri), kod katmanları, tipografi, geçiş ve ses tanımlanır (H74, [sablonlar/02](sablonlar/02-hikaye-plani.md)).

**Kaynak kimliği:** Kitab-ı Mukaddes ve tarih = parşömen; hadis = fildişi kâğıt; Kur'an = gece göğünde altın. İzleyici metnin türünü dokusundan tanır.

## 2. Renk

| Token | Hex | Kullanım |
|---|---|---|
| `night950` / `900` / `800` / `700` | `#05070C` `#0A0E19` `#121A2B` `#1C2740` | Zemin, katmanlar, çizgiler |
| `gold300` / `400` / `500` / `700` | `#F3DDA2` `#E6C377` `#CFA24E` `#8A6A2C` | Parlama, vurgu kelimesi, ana altın, ikincil |
| `ivory` | `#F4EFE4` | Ana metin (asla `#FFF`) |
| `mist` | `#A9A6B4` | İkincil metin, künye |
| `parchment200` / `400`, `ink` | `#EADBB8` `#CDB07A` `#2A1D10` | Tarihî sahne zemini ve mürekkep |

Dünya aksanları (bölüm başına bir tane): ocean `#0B2A3C`/`#5FB3C9`, desert `#3A2414`/`#E29A55`, cosmos `#141B3D`/`#8FA8FF`, ember `#3B120C`/`#E2603A`, verdant `#0F2A22`/`#4FB08A`. Oran kabaca %70 gece, %20 aksan, %10 altın ve fildişi.

> E020 (parlak/gündüz serisi) bu paletin dışına bilinçli çıktı (bal sarısı `#FFB400`, mürekkep `#0E0B07`, krem `#FFFDF5`; Anton + Barlow Condensed): bkz. `src/e020/tokens.ts` ve `episodes/e020-that-bee-is-a-she.md`.

## 3. Tipografi

| Rol | Font | Boyut (1080 genişlikte) |
|---|---|---|
| Kahraman kelime / açılış başlığı | Cormorant Garamond 700 (`FONT.display`) | 100–220 px |
| Başlık / ara başlık | Cormorant Garamond 600 | 64–96 px |
| Destek metni, etiket | Inter 600 (`FONT.body`) | ≥ 44 px önemli metin, ≥ 26 px her metin |
| Altyazı | Inter 600 | 60 px, en çok 2 satır (`TYPE_FROM_004.caption`) |
| Veri, sayaç, künye | IBM Plex Mono 500 (`FONT.mono`) | künye 26–28 px, harf aralığı 0.18em |
| **Ayet (Arapça)** | **Amiri Quran** (`FONT.quran`) | 56–104 px, satır yüksekliği ≥ 1.8 |

Kurallar: karede en çok üç font ailesi; ayet yalnızca Amiri Quran ile; sembol ≥ 32 px, çizgi ≥ 3 px; metin her zaman zeminden net ayrışır (gölge ya da koyu gradyan, kutu değil).

## 4. Hareket

Easing (`lib/anim.ts` → `EASE`): `glide` girişler, `camera` kamera, `inOut` geçişler; doğrusal yalnızca sabit kamera kayması ve sayaçlarda. Kurallar: her sahne nefes alır (kamera %2–6 yaklaşır ya da kayar, partikül ve ışık durmaz); her an tek odak; görsel giriş kelimeden 2–3 kare önce; büyük nesne yavaş, küçük hızlı; hızlı bölümün ardından yavaş an; aynı giriş animasyonu sahnede en çok iki kez.

Geçişler (`kit/transitions.ts`): `nurWipe`, `diveThrough`, `inkReveal`, `lightLeak`, `crossfade` ve sert kesme. Gösterişli geçiş perde sınırlarında ve 20 sn'de en çok bir kez; ayet ekranına giriş ve çıkış yalnızca sakin geçişlerle.

## 5. Güvenli alan

Kanvas 1080×1920. **Kritik metin x 180–900 (`TEXT_COLUMN`), y 220–1480**; açılış başlığı ortada (y 400–1500). Altyazı bandı y ~1220–1440, başka metinle paylaşılmaz. Sağda ~180 px platform butonları, altta y > 1480 açıklama alanı. Kontrol: `studio/scripts/safe-zone-scan.js` (H59; bu depoda `tools/safezone.py`) ve tam boyutta still'ler.

## 6. Ayet sunumu

1. Ortam sakinleşir: arka plan kısılır, kamera kayması yarıya iner.
2. Arapça üstte, ortalı, Amiri Quran, fildişi; anahtar kelime altın. Metin yalnızca `verse.json` / excerpt'lerden (`VERSES`, `EXCERPTS`).
3. Sağdan sola yumuşak mürekkep maskesiyle belirir (1,2–2 sn).
4. Meal altta, Cormorant italik ~40–50 px; künye çipi `QUR'AN 3:61 · SAHEEH INTERNATIONAL`.
5. Arapça satırın altında ≥ 0,4 × yazı boyutu boşluk; Arapça satırın üstünden meal satırının üstüne ≥ 2,5 × yazı boyutu (H46, H62). Uzun ayet anlam gruplarına göre satırlara bölünür (`arabicLines`).
6. Okunma süresi en az 1 sn + kelime başına 0,25 sn; cümle bittikten sonra ~1 sn tam okunur kalır (H71).

**Ayet metnine yasak:** glitch, sarsıntı, renk kayması, bükme, aynalama, ters çevirme, kırpma, zıplama. İzin verilen: fade, yumuşak parıltı, ≤ %3 yavaş ölçek, tek seferlik ışık süpürmesi.

Ortak bileşen: `kit/ScriptureCards.tsx` → `QuranVerseStage` (bu kuralları uygular), `components/Typography.tsx` → `ArabicLine`, `RefChip`.

## 7. Altyazı

Inter 600, 60 px, en çok 2 satır, metin sütununda; söylenmemiş kelimeler soluk, aktif kelime `gold300` (`components/Captions.tsx`, sayfalar `createTikTokStyleCaptions`, 900 ms). Ekranda aynı sözler büyük yazılıyken (ayet, alıntı, başlık) `OFF` pencereleriyle kapanır; anlık zamana göre de gizlenir (H19). Platforma ayrıca `captions.srt` yüklenir.

## 8. Açılış, kapak, filigran

**Açılış (H76):** İlk karede metin varsa ekranın ortasında, büyük (100–160 px), yüksek kontrastlı ve mümkünse bir punch/slam mikro-animasyonla açılır; punch kare 0'dan ~0,12 sn önce başlar ki kare 0'da okunsun ve döngü kuyruğu ona aksın. Açılışın 5 kuralı ve örnekler: [growth/strateji §3](../growth/strateji.md#3-açılış-kuralları).

**Kapaklar (H75):** Video karesinden alınmaz; her bölümde 3 bağımsız kapak: `out/kapak1.png` (çatışma / zıtlık), `kapak2.png` (kahraman nesne + büyük soru ya da gerçek), `kapak3.png` (kanıt, belge ya da sarsıcı soru). Başlık en çok 3–5 kelime, Instagram 3:4 kırpımında (y 240–1680) ve ~180×320 boyutunda okunur; "miracle" yok. En güçlüsü `out/kapak.png` olur. Kod: `eNNN/covers/`.

**Filigran (H79):** Her videoda `@signsinthehorizon`, üst-sol (`top: 130, left: 80`), IBM Plex Mono 16–18 px, harf aralığı 0.18em, fildişi, opaklık ~0.36, hafif gölge. Bileşen: `brandkit/Watermark.tsx`.

## 9. AI arka plan görselleri

Video üretim modelleri kullanılmaz; statik arka plan mateleri (Gemini, NanoBanana, Midjourney) serbest ve teşvik edilir (H78). Görsel gerekiyorsa senaryoyla birlikte `images/imageprompts.md` verilir; her promptta: hedef dosya adı (`episodes/NNN-slug/images/1-ad.jpeg`), sahnedeki rolü, 9:16 sinematik İngilizce prompt, `no people, no faces, no text` (gerekirse `no buildings`). Remotion'da görsel statik bırakılmaz: `CameraRig` ile kayma ve zoom, üstünde ışık ve kod katmanları; kamera hiçbir noktada görselin kenarını göstermez (zoom ≥ 1 ve `|x−540| ≤ 540(1−1/z)`, `|y−960| ≤ 960(1−1/z)`).

## 10. İnsanlar ve kutsal olan

Peygamberler, melekler ve Allah hiçbir biçimde tasvir edilmez (siluet ve ışık figürü dahil); "tek Tanrı" fikri bir nesneyle gösterilmez (H45). İnsan yüzü yok. İnsanlar gerekiyorsa yalnızca **ışık noktaları** (kervan, kamp, kalabalık); sayısı belirsiz gruplar sayılabilir figürle değil tek ışık ya da izle (H05). Simge bir saniyede tanınmalı (H52). Kâbe ve mescit görüntüleri dekor olarak kullanılmaz.

## 11. Yasaklar

Tek arka plan + akan yazı ve kutu kalıbı; slayt/infografik estetiği; neon mor-camgöbeği ve gökkuşağı gradyanlar; glassmorphism kartlar; anlamsız dönen 3B nesneler ve jenerik "teknoloji HUD"u; her şeyin zıpladığı ya da lineer kaydığı hareket; her metne daktilo efekti; emoji ve ham stok ikon; `#000` / `#FFF`; kontrastsız metin; hilal-yıldız klişesi; ayeti arka plan deseni olarak kullanmak; Arapça hattı ters, aynalı ya da kırpık göstermek.
