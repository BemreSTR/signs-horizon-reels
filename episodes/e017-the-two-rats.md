# E017 · The Two Rats

Seslendirmesiz motion graphics, 60,0 sn (57 + 3 sn outro), 100 BPM ızgara. Hat: Risale · tefekkür.

## Kaynak
Said Nursi, Sözler, **Sekizinci Söz** (iki kardeş temsili). Metinden doğrulananlar:
- "altmış arşın derinliğinde susuz bir kuyu", içinde ejderha, üstte arslan; tutunulan ağaç "bir incir ağacıdır"; "İki fare, biri beyaz biri siyah" ağacın iki kökünü kemirir.
- Tevil: kuyu = "beden-i insan ve zaman-ı hayat"; arslan = ecel/ölüm; ejderhanın ağzı = kabir; ağaç = ömür müddeti; iki fare = gece ve gündüz.
- Bahtiyar kardeşin okuması: arslan "musahhar bir at" / "munis bir hizmetkâr"; kabir "zindandan bir bahçeye açılan bir kapı".

Ayet: 103:1–3 (el-Asr), `public/ep/e017/verse.json`. **Ayet eşleştirmesi bizim seçimimiz**; Sekizinci Söz'ün başındaki ayetler 2:255 ve 3:19'dur. Arapça Tanzil Uthmani (iskelet quran-json ile karşılaştırıldı); yayından önce `verse_check`.
İnsan tasviri yok: kuyudaki adam bir ışık noktası.

## Kurgu
| sn | Sahne | Yazı |
|---|---|---|
| 0–3 | Yakın plan: iki fare kökleri kemiriyor | TWO RATS ARE EATING YOUR LIFE. |
| 3–9 | Geri çekiliş: kuyu | A MAN HANGS IN A WELL, HOLDING A FIG TREE. |
| 9–15 | Üstte arslan, altta ejderha | ABOVE: A LION. · BELOW: A DRAGON. |
| 15–24 | Gündüz/gece dönüşümlü kemirme | AND THE TWO RATS NEVER STOP. · THE WHITE RAT IS THE DAY. · THE BLACK RAT IS THE NIGHT. |
| 24–32,4 | Tevil | THE TREE: YOUR LIFETIME. · THE LION: DEATH. · THE DRAGON'S MOUTH: THE GRAVE. · THE ONE WHO HANGS THERE: YOU. |
| 32,4–37,8 | Hızlanma, dal gıcırdar | NO ONE HAS EVER STOPPED THEM. |
| 37,8–48 | İki kardeş | SAID NURSI: TWO BROTHERS FELL INTO THIS WELL. · ONE SAW ONLY TERROR. · THE OTHER LOOKED AGAIN. · THE LION: A TAMED HORSE. · THE GRAVE: A DOOR TO A GARDEN. |
| 48–57 | 103:1–3 | Saheeh International |

## Üretim
```bash
tools/render.sh E017 && python3 tools/e017_audio.py && python3 tools/master.py E017 60
for c in E017Cover1 E017Cover2 E017Cover3; do node tools/stills.mjs $c out/covers 0; done
```

## Yayın metni
Two rats are eating your life. One is white. One is black.

It is an old parable, and Said Nursi (1877–1960) retells it in The Words (8th Word): a man hangs in a well, holding a fig tree. A lion waits above, a dragon below, and two rats gnaw at the roots. The white rat is the day. The black rat is the night. The tree is your lifetime.

Nursi's point is the second brother. He falls into the same well and reads it differently: death is a tamed horse, and the grave is a door that opens from a prison onto a garden.

Qur'an 103:1–3: "By time, indeed, mankind is in loss, except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience." (Saheeh International)

Same well, two readings. What decides which brother you are?

Sources (pinned comment): Said Nursi, Sözler / The Words, Eighth Word (our summary and translation from the Turkish) · Qur'an 103:1–3.
