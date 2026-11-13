# Marka Kimliği · Signs in the Horizon

Kanal adı **Signs in the Horizon** (karar D6, 2026-10-24). Bu dosya adın anlamını, profil metinlerini, dosyaları ve kullanım kurallarını toplar. Renk ve yazı değerleri: [tokens.json](tokens.json), görsel dil: [08](../08-gorsel-dil.md).

## İsim
- Kaynak: Fussilet 41:53, «سَنُرِيهِمْ ءَايَـٰتِنَا فِى ٱلْـَٔافَاقِ وَفِىٓ» (metin `assets/brand/verse.json`'dan). Saheeh International: *"We will show them Our signs in the horizons and within themselves until it becomes clear to them that it is the truth."*
- Ayette kelime çoğul (*horizons*); kanal adı tekil kullanılır. Ayet alıntılanırken çevirinin kendisi (çoğul) yazılır.
- Anlamı: Kanal ayetleri ufukta, denizde, gökte ve zamanda gösterir. Logo bu fikrin kendisidir.

## Kullanıcı adları
| Platform | Önerilen | Yedek |
|---|---|---|
| YouTube | `@signsinthehorizon` | `@signs.in.the.horizon` |
| Instagram | `@signsinthehorizon` | `@signs.in.the.horizon` |
| TikTok (ileride) | `@signsinthehorizon` | `@signsinthehorizon_` |

> Bu adların boş olup olmadığı doğrulanmadı; kanal açılırken kontrol edilmeli. İki platformda aynı ad kullanılmalı.

## Logo
- **İşaret:** Kavisli ince bir ufuk çizgisinin üstünde yükselen tek bir altın ışık noktası (nur), altında suya düşen ince yansıması. Videoların imza motifi olan nur noktasıyla aynıdır.
- **Yazı:** "Signs in the *Horizon*", Cormorant Garamond italik 500. Fildişi, "Horizon" altın (#E6C377).
- **Slogan:** `SHORT CINEMATIC REFLECTIONS ON THE QUR'AN` (IBM Plex Mono 500, geniş harf aralığı, sis rengi #A9A6B4).
- **Kurallar:**
  - İşaret yalnızca gece zemininde (#05070C) ya da şeffaf zeminde kullanılır; beyaz zemine konmaz.
  - Nur noktasının etrafına başka şekil eklenmez, rengi değiştirilmez.
  - İşaret Allah'ı temsil etmez: yalnızca "ufukta beliren işaret" fikridir (bkz. [13 · H45](../13-hatalar-ve-dersler.md#h45)).
  - Videolar devasa logolarla veya selamla açılmaz; kancaya (hook) odaklanılır. Ancak sosyal medya platformlarında (Reels, Shorts, TikTok) içerik hırsızlığını ve izinsiz kırpıp yeniden yüklemeleri önlemek için her videoda güvenli, engelsiz bir köşede (varsayılan: sol üst `x: 80, y: 130`) küçük, soluk ve zarif `@signsinthehorizon` filigranı (watermark) yer alır (bkz. [13 · H79](../13-hatalar-ve-dersler.md#h79) ve `studio/src/brandkit/Watermark.tsx`).

## Dosyalar (`assets/brand/`)
| Dosya | Boyut | Nereye |
|---|---|---|
| `profile_1080.png` | 1080×1080 | YouTube profil resmi, Instagram profil fotoğrafı (daire kırpımına göre tasarlandı) |
| `youtube_banner_2560x1440.png` | 2560×1440 | YouTube kanal kapağı. Ayet, ad, ışık ve slogan 1546×423 güvenli alanın içinde |
| `ig_highlight_episodes.png`, `ig_highlight_sources.png`, `ig_highlight_about.png` | 1080×1920 | Instagram öne çıkan hikâye kapakları (Bölümler, Kaynaklar, Hakkında) |
| `stories/about_01.png` … `about_07.png` | 1080×1920 | "Hakkında" öne çıkan hikâyesinin 7 kartı (metinler aşağıda) |
| `cover_e001.png`, `cover_e002.png`, `cover_e003.png` | 1080×1920 | Reels kapakları. Başlık Instagram'ın 3:4 ızgara kırpımı (y 240–1680) içinde; konu karede alttaysa `place: 'sky'` (E003) |
| `lockup_2000x1200.png`, `lockup_transparent.png` | 2000×1200 | Logo + ad + slogan (belge, sunum, web) |
| `logo-mark.svg`, `logo-mark-night.svg` | vektör | İşaretin vektör hâli (şeffaf / gece zeminli) |
| `outro_3s.mp4` | 1080×1920, 3 sn | Tek başına marka imzası (sesli) |

Hepsi kodla üretilir: `studio/src/brandkit/BrandKit.tsx` (Remotion kompozisyonları `BrandMark`, `BrandBanner`, `BrandLockup`, `BrandHighlight`, `BrandCover`). Yeniden üretmek için `studio` klasöründe:

```bash
npx remotion still BrandMark ../assets/brand/profile_1080.png
```

Hikâye kartları: `npx remotion still BrandStory ../assets/brand/stories/about_01.png --props='{"card":0}'` (kart 0–6).

## Outro (marka imzası, 3 sn)
- **Neden outro, intro değil:** İlk 3 saniye kancaya ayrılmıştır; videolar logo ya da selamla açılmaz ([03](../03-hikaye-anlatimi.md)).
- **Döngüyü bozmaz:** Outro bölümün açılış karesinden çıkar ve aynı kareye döner. Video baştan başladığında geçiş görünmez. E002'de deniz hareketi outro boyunca da sürer ve döngü başına kesintisiz bağlanır.
- **Akış:**
  - 0,1–0,9 sn: Açılış karesindeki ışık (E002: açık yolun başındaki nokta, E001: ay) yükselir ve ortaya gelir.
  - 0,85 sn: Ufka değer; ufuk iki yana yayılır.
  - 1,0–1,7 sn: Işık güneş gibi doğar.
  - 1,2 sn: 41:53'ün ilk dört kelimesi mürekkeple açılır.
  - 1,4 sn: "Signs in the Horizon" harf harf belirir, "Horizon" üzerinden bir ışık geçer.
  - 2,4–2,95 sn: Her şey çekilir ve açılış karesi geri gelir.
- **Ses:** Yükselirken hava sesi, inişe doğru ters şişme, inişte yumuşak darbe ve parıltı, alttan sıcak şişme. Bölümün kapanış yatağı outro boyunca kısılır, döngü noktasında açılıştaki seviyeye döner.
- **Kod:** `studio/src/brandkit/Outro.tsx`. Bölüm kompozisyonlarında `outro` özelliği varsayılan olarak açık. Outro'suz döngü sürümü için `--props='{"outro":false}'`.
- **Tek başına dosya:** `assets/brand/outro_3s.mp4` (gece zemini, −16 LUFS). Fragman, hikâye ve gönderilerde kullanılır.

## Profil metinleri

**YouTube · kanal adı:** `Signs in the Horizon`

**YouTube · açıklama:**
```
"We will show them Our signs in the horizons and within themselves…" (Qur'an 41:53)

Signs in the Horizon makes short, cinematic reflections on the Qur'an: one verse, one story, told carefully.

Every Arabic verse is taken from Quran.com and shown with its translation (Saheeh International). Every claim has a source in the description, and where scholars differ, we say so.

No clickbait. The verse, the story, and a moment to reflect.
```

**YouTube · anahtar kelimeler:** `Quran, Qur'an, Quran reflection, Quran stories, tafsir, ayah, Islam, Muslim, Islamic shorts, Quran verses`

**Instagram · ad alanı (aranabilir):** `Signs in the Horizon | Qur'an`

**Instagram · biyografi (150 karakter sınırı, 115 karakter):**
```
Signs in the horizons and within ourselves (41:53)
Short cinematic reflections on the Qur'an
Sources in every video
```

**Instagram · kategori:** Education (Eğitim)

## Hikâye öne çıkanı: Hakkında (2026-11-02)

Profili ziyaret edenlere kanalın kim olduğunu, neden var olduğunu ve nasıl çalıştığını anlatan 7 kart. Dosyalar `assets/brand/stories/about_01–07.png`, kod `studio/src/brandkit/Story.tsx` (kompozisyon `BrandStory`).

- **Görünüm:** Dokulu parşömen (kodla çizilir: tane, lif, leke, küf noktaları, yanık kenar). Yazı EB Garamond: başlık italik, metin düz, etiketler küçük büyük harf; vurgu kelimesi el yazması kırmızısı (#8E2F1C), metin mürekkep tonları.
- **Kitle:** Tek Tanrı'ya inanan herkes ve arayanlar; Müslümanlar, Hristiyanlar, Yahudiler, şüpheciler.
- **Çağrı:** Videolarda CTA yok; bu öne çıkanda yalnızca 7. kartta "Follow" çağrısı var (kullanıcı kararı).
- **Ayet:** Her iki alıntı 41:53'ün Saheeh International çevirisinden, `public/brand/verse.json`'dan kodla alınır.

**01 · Who we are**
> **Signs in the *Horizon***
> "We will show them Our signs in the horizons and within themselves until it becomes clear to them that it is the truth." (Qur'an 41:53)
> Our name comes from a promise in the Qur'an.
> The universe is a book. Every atom, every star, every living cell is a letter in it. We try to read it together.

**02 · Why we exist**
> **Faith is under *pressure.***
> In our age, many people lose their faith. Not because the evidence failed them, but because of two things: doubts that claim to come from science, and the quiet pull of a life without accountability.
> We believe the answer is not louder voices. It is clearer evidence.

**03 · What we answer**
> **Three questions. *One truth.***
> Does God exist? A universe this ordered points to One who orders it.
> Is He One? A world this unified points to One Maker.
> Has He spoken? The Qur'an and the life of Muhammad, peace be upon him, invite us to test them.
> Every film answers one part of these questions.

**04 · Who we speak to**
> **To everyone who believes in One God, and everyone *still searching.***
> Muslims who want firmer ground under their faith.
> Christians and Jews: we begin with what we share: Abraham's God, Moses, Jesus, the One Creator.
> Seekers and sceptics: you don't need to agree with us. Just look at the evidence with an open mind.

**05 · How we work**
> **Evidence first. *Always.***
> Our sources: the Qur'an, authentic hadith, classical scholars, history, archaeology, science and earlier scriptures.
> Our method: one question, one argument, step by step, following the rules of logic.
> No exaggeration. No "science proves" headlines. Just evidence you can check yourself.

**06 · Our rule**
> **Nothing *made up.***
> Every claim has a source, listed under every video.
> Where scholars differ, we say so.
> When we get something wrong, we correct it in public.
> Truth does not need decoration. It only needs to be shown honestly.

**07 · Join us**
> **Walk this road *with us.***
> Follow to see every new film.
> Share one with someone who has questions, or someone whose faith needs strength.
> Save the ones that moved you. Watch them again.
> "Is it not sufficient concerning your Lord that He is, over all things, a Witness?" (Qur'an 41:53)

## Bölüm başına yayın düzeni
- Başlık: Cormorant'ın sesiyle, soru ya da ironi taşıyan kısa bir cümle (ör. "What Pharaoh said under the water"). Büyük harfle bağırmak, emoji ve "MUST WATCH" yok.
- Kapak: 3 bağımsız kapak ([08 §8](../08-gorsel-dil.md#8-açılış-kapak-filigran)); Reels kapağı gerekirse `BrandCover` ile.
- Açıklama: Bölümün `04-yayin.md` dosyası. Ayetler, meal kredisi, kaynaklar. CTA yok.
- Yapay zekâ seslendirme beyanı her platformda kontrol edilir.
