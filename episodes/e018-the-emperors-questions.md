# E018 · The Emperor's Questions

Seslendirmesiz motion graphics, 92,4 sn (89,4 + 3 sn outro), 100 BPM ızgara (1 vuruş = 0,6 sn). Hat: Hz. Muhammed ﷺ'ın peygamberliği · Hıristiyanlara davet. Hook: A ("A CHRISTIAN EMPEROR PUT THE ENEMY OF MUHAMMAD ﷺ ON TRIAL.").

**Ders (tek cümle):** Düşmanın şahitliği, hasmın olmayan bir hükümdarın sorularıyla tartıldı; sorular videonun sonunda izleyiciye geri verilir.

## Kaynak
Sahih el-Buhari, hadis 1 ve **7** (Herakleios hadisi, İbn Abbas rivayeti, Ebu Süfyan'dan). Metinden doğrulananlar:
- Kayser Heraclius, Kudüs'te (İlya) mektubu alır; Kureyş kervanı Şam'dadır; Ebu Süfyan ve adamları çağrılır; adamları arkasında durur: "Yalan söylerse yalanlayın."
- Ebu Süfyan, sonradan: "Allah'a yemin olsun, arkadaşlarımın beni yalancı demesinden utanmasaydım yalan söylerdim."
- Sorular (ekrandaki beş): peygamberlik iddiasından önce yalanla itham ettiniz mi (hayır) · ahdini bozar mı (hayır; Ebu Süfyan: "ama onunla bir ateşkesteyiz, ne yapacağını bilmiyoruz") · ona asillerden mi zayıflardan mı uyuyor (zayıflar) · dinine girenlerden hoşnutsuzlukla çıkan var mı (hayır) · size ne emrediyor (yalnız Allah'a kulluk, ona ortak koşmamak, namaz, doğruluk, iffet, akrabalık bağı).
- Herakleios'un çıkarımları: "İnsanlara yalan söylemeyen, Allah'a yalan söylemez." · "Peygamberler ihanet etmez." · "Zayıflar peygamberlerin takipçileridir." · "İmanın tadı kalbe karışınca böyledir."
- Hüküm: "Söylediğin doğruysa, ayaklarımın altındaki yeri yakında o ele geçirecek." · "Ona ulaşabileceğimi bilseydim, zahmeti göze alır ve ayaklarını yıkardım."
- Dürüst mercek: sarayda sesler yükselir; anlatının devamında Roma ileri gelenleri tepki gösterince Herakleios geri adım atar ve tahtını korur. Hadis onun açıkça Müslüman olduğunu aktarmaz; videoda da bunu iddia etmiyoruz. Ebu Süfyan sonradan (Mekke'nin fethinde) Müslüman olur.

Ekrandaki İngilizce **bizim çevirimiz ve özetimiz** (kaynak çipi: SAHIH AL-BUKHARI 7 · OUR TRANSLATION). Ateşkes sözü bilerek dahil: Ebu Süfyan'ın tek "kötüleme" denemesi buydu; hadiste Herakleios bu söze takılmadan sorulara devam eder. Hasmın bile bir şey ekleyemediğini saklamak yerine gösteriyoruz. Videoda ayet yok. ﷺ glifi `public/ep/e018/text.json`'dan, Amiri Quran ile yazılır.

İnsan tasviri yok: Kayser boş taht + taç; Ebu Süfyan ve adamları ışık noktaları; Peygamber ﷺ hiç çizilmez, yalnız mektup ve isim.

## Görsel dil
- Bizans salonu (kemerli pencereler, ışık hüzmeleri, mor halı), tahtta haç ve minder üstünde taç. Tacın parıltısı = Kayser'in ikna olma derecesi.
- Terazi: sol kefede ağır taş "IMPOSTOR?" (iddia baştan yalan sayılır), sağ kefeye her cevapta bir altın ağırlık düşer "MESSENGER?". Ebu Süfyan'ın ateşkes sözü sol kefeye gri bir çakıl düşürür; ağırlık yine de sağa yatar.
- Final: beş soru, her birinin yanında boş kesikli cevap çizgisi ve nabız gibi atan ışık.

## Kurgu
| sn | Sahne | Yazı |
|---|---|---|
| 0–3 | Taht, kamera itişi | A CHRISTIAN EMPEROR PUT THE ENEMY OF MUHAMMAD ﷺ ON TRIAL. |
| 3–9,4 | Mektup ve mühür | JERUSALEM. EMPEROR HERACLIUS RECEIVES A LETTER FROM ARABIA. · ITS WRITER CLAIMS TO BE A PROPHET. |
| 9,8–13 | Kervan (8 ışık) | HE SUMMONS THE MAN'S FIERCEST ENEMY: ABU SUFYAN. |
| 13,6–21,8 | Adamları arkada; itiraf | BEHIND HIM, HIS MEN: "IF HE LIES, SAY SO." · ABU SUFYAN, LATER: "I WOULD HAVE LIED. I WAS ASHAMED TO BE CALLED A LIAR." |
| 22,2–64 | Beş soru: soru → cevap → Heraclius'un çıkarımı → terazide ağırlık | Q1–Q5 |
| 64,2–73 | Hüküm, taç parlar | "HE WILL SOON RULE THE GROUND UNDER MY FEET." · "IF I COULD REACH HIM, I WOULD WASH HIS FEET." |
| 73,8–80 | Dürüst mercek | HIS COURT ERUPTED. HE KEPT HIS THRONE. · THE ENEMY ON THE STAND LATER ENTERED ISLAM. |
| 81–88,8 | Final, döngüye dönüş | THE WITNESS WAS AN ENEMY. THE JUDGE WAS A CHRISTIAN EMPEROR. · NOW ASK THE SAME QUESTIONS YOURSELF. |
| 88,8–92,4 | Marka outro, döngü | |

Saat vuruş ızgarası (`src/e018/timeline.ts`); okuma süresi: yazı başına ≥ 1 sn + kelime başına 0,25 sn.

## Üretim
```bash
tools/render.sh E018 && python3 tools/e018_audio.py && python3 tools/master.py E018 92.4
python3 tools/e018_srt.py out/E018/captions.srt
python3 tools/safezone.py out/E018_silent.mp4 4.6 26.5 61.0 82.5 87.0   # x 180–900
for c in E018Cover1 E018Cover2 E018Cover3; do node tools/stills.mjs $c out/covers 0; done   # → out/E018/kapak1–3.png
```
Seslendirme sonradan eklenecekse: ses betiği `timeline.ts` zamanlarını kullanmalı (her soru bloğu 6,6–9,6 sn; cevap +1,8 sn).

## Kontrol notları
- Bozuk kare / parlama taraması temiz (kareler arası en büyük ışık sıçraması 0,015; tam ekran parlak kare yok), döngü dikişi 0,006 (tipik 0,001).
- İlk render'da hook (x 149–923) ve Q5 madde listesi (x 166–910) yazı sütunundan taştı; boyutlar küçültülüp yeniden render edildi.
- Ses: −14 LUFS, TP −1,2; bant dengesi E016/E017 ile benzer. Seslendirme yok; sonradan eklenirse ses betiği `timeline.ts` zamanlarına oturmalı.

## Yayın metni
A Christian emperor put the enemy of Muhammad ﷺ on trial.

Around 628, Emperor Heraclius received a letter from Arabia. Its writer claimed to be a prophet. By chance, the man's fiercest enemy, Abu Sufyan, was in town. Heraclius had him brought in, and told Abu Sufyan's men to call him out if he lied.

Abu Sufyan later said: "I would have lied. I was only ashamed to be called a liar."

Five questions:
1. Did you ever accuse him of lying before his claim? No.
2. Does he ever break his word? No. (Abu Sufyan added: "We are at truce. Who knows what he will do?")
3. Who follows him, the nobles or the weak? The weak.
4. Does anyone leave his religion out of resentment? No.
5. What does he command you? To worship Allah alone, to join nothing with Him, prayer, truthfulness, chastity, family ties.

Heraclius's reasoning: a man who never lied about people would not lie about Allah. Messengers never betray. The weak are the followers of messengers. Such is faith when its sweetness mixes with the heart.

His verdict: "He will soon rule the ground under my feet. If I could reach him, I would wash his feet."

The honest part: his court erupted, and he kept his throne. The enemy on the stand later entered Islam.

Now ask the same five questions yourself.

Source (pinned comment): Sahih al-Bukhari 7 (also 1). Our translation and summary.
