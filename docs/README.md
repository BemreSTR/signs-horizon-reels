# docs · Doküman dizini

Bu klasör Claude Project `signs-in-the-horizon` içindeki kural dokümanlarının depodaki kopyasıdır. **Depo kaynak gerçektir**; Project'e kopyalanır. Çakışma varsa sıralama: kök [`CLAUDE.md`](../CLAUDE.md) (en yeni dersler) › bu klasör › Project.

## Değişmez ilkeler

1. **Doğruluk ve saygı her şeyin üstünde** ([04](04-icerik-dogrulugu.md)): ayet metni kaynaktan, her isim/sayı/kurum kaynaklı, abartı ("science proves") yok, dürüst mercek var.
2. **Tasvir yasağı:** peygamber, melek, Allah çizilmez (ışık figürü/siluet dahil); insan yüzü yok; sayısı belirsiz grup tek ışıkla ([08 §10](08-gorsel-dil.md#10-i̇nsanlar-ve-kutsal-olan)).
3. **CTA yok** (abone ol, beğen, paylaş, yorum yap); açıklamanın ilk satırı kanca ([growth/metinler](../growth/metinler.md)).
4. **İlk saniye:** kare 0 tek güçlü özne, ortada büyük başlık, ilk 0,5 sn'de hareket ([growth/strateji §3](../growth/strateji.md#3-açılış-kuralları)).
5. **Yapay zekâ görsel/ses beyanı** her yüklemede işaretlenir; AI ile tilavet yok, kimsenin sesi klonlanmaz.
6. **Kodla animasyon:** her kare zamanın saf fonksiyonu (CSS geçişi yok); döngü dikişi temiz ([10 §3](10-teknik-mimari.md#3-cue-tabanlı-zaman-çizelgesi), H54).

## İçindekiler

| Dosya | Konu |
|---|---|
| [02-uretim-hatti.md](02-uretim-hatti.md) | Aşamalar, K0–K5 kapıları, kontrol listeleri, revizyon |
| [03-hikaye-anlatimi.md](03-hikaye-anlatimi.md) | Beat yapısı, süre/kelime bütçesi, yazım dili, ElevenLabs, cue sözdizimi |
| [04-icerik-dogrulugu.md](04-icerik-dogrulugu.md) | İddia türleri, kanıt seviyeleri, kırmızı çizgiler, araştırma dosyası |
| [05-mucize-katalogu.md](05-mucize-katalogu.md) | Konu havuzu: yapılanlar, seriler, adaylar, kullanılmayacaklar |
| [08-gorsel-dil.md](08-gorsel-dil.md) | Görsel dil (renk, tipografi, hareket, güvenli alan, ayet, kapak, filigran) |
| [09-ses-tasarimi.md](09-ses-tasarimi.md) | Ses katmanları, miks hedefleri, görsel olay → ses eşlemesi |
| [10-teknik-mimari.md](10-teknik-mimari.md) | Remotion mimarisi, determinizm, hizalama, render tuzakları (eski düzen notlarıyla) |
| [12-yol-haritasi.md](12-yol-haritasi.md) | Kararlar (D2–D10) ve bölüm kaydı |
| [13-hatalar-ve-dersler.md](13-hatalar-ve-dersler.md) | H01–H89 + **her bölümden önce ön kontrol** |
| [brand/kimlik.md](brand/kimlik.md), [brand/tokens.json](brand/tokens.json) | Marka kimliği, profil metinleri, renk/yazı/hareket değerleri |
| [sablonlar/](sablonlar) | `01-arastirma-dosyasi`, `02-hikaye-plani`, `03-senaryo` şablonları |
| [schemas/timing.schema.json](schemas/timing.schema.json) | words/cues/segments/pauses biçimleri |
| [notlar/](notlar) | Dış kaynak notları |

## Eski düzen ↔ bu depo

Dokümanlar ilk olarak E001–E014'ü üreten **eski depoda** ("kuranmucizeleri2", macOS, Remotion `studio/` alt klasöründe) yazıldı. Bu depo E015'ten beri **ayrı** ve Remotion **kökte**:

| Dokümanda geçen | Bu depoda |
|---|---|
| `studio/src/...`, `studio/public/...` | `src/...`, `public/...` |
| `tools/render_episode.py`, `qa.py`, `ingest.py`, `script_build.py`, `publish_pack.py`, `growth_report.py`, `verse_check.py` | Yok. Karşılıkları: `tools/render.sh`, `master.py`, `qa_video.py`, `safezone.py`, `stills.mjs`, `align.py`/`build_timing.py`/`e019_srt.py`, `eNNN_audio.py`, `sfxlib.py` |
| `episodes/NNN-slug/` (araştırma, hikâye, senaryo, yayın) | `episodes/eNNN-slug.md` (tek notta plan + kaynak + dürüst mercek + teslim); sesli bölümde `episodes/eNNN-slug/` klasörü |
| `studio/scripts/safe-zone-scan.js` | `tools/safezone.py` |
| `--concurrency=2` | `--concurrency=1` (E018) |
| Müzik yasağı/izni ve ses | Müzik serbest; ses prosedürel numpy (`sfxlib.py`) |

Eski depoda kalan, buraya **taşınmayanlar:** `episodes/adaylar/` (aday taslaklar), E001–E014 kaynakları, `acilislar/*.jpg` kontak görselleri, eski kök README/CLAUDE (Project'te "kuranmucizeleri2" düzenini anlatan sürümler; bu depodaki `README.md` ve `CLAUDE.md` bunların yerine geçer).

Bu depoda **H## yerine** E015–E020 dersleri kök `CLAUDE.md`'dedir. İki liste birlikte okunur: ön kontrol ([13](13-hatalar-ve-dersler.md)) + `CLAUDE.md` dersleri.

## Güncelleme kuralı

Yeni ders → `CLAUDE.md` (bölüm başlığıyla); kalıcı bir sürece/kurala dönüşürse ilgili `docs/` dosyası. Yeni bölüm → `docs/05` ve `docs/12` tablolarına satır, `episodes/` notu, README bölüm tablosu. Project kopyaları aynı gün güncellenir.
