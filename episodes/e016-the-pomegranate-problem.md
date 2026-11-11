# E016 · The Pomegranate Problem

Seslendirmesiz motion graphics, 49,8 sn (46,8 + 3 sn outro), 100 BPM ızgara (1 vuruş = 0,6 sn). Hat: Delil · Risale.

## İddia
Said Nursi'nin akıl yürütmesi (Sözler, 22. Söz, 2. Makam, 9. Lem'a): her şey Bir'e verilirse her şey tek şey kadar kolay; sebeplere verilirse tek şey her şey kadar zor. **Kanıt değil, argüman olarak sunulur.**

> "Cenab-ı Hakk'a isnad edilse bütün eşya, bir tek şey gibi bir suhulet peyda eder. Eğer esbaba isnad edilse her bir şey, bütün eşya kadar suubet peyda eder."
> "Eğer gayet mebzuliyetle elimize geçen şu sanatlı meyveler, Vâhid-i Ehad'in malı olmazsa … bütün dünyayı verse idik, bir tek narı yiyemezdik."

Ekrandaki İngilizce alıntı **bizim çevirimiz** (Vahide çevirisiyle karşılaştırılmadı). Ayet: 39:62, `public/ep/e016/verse.json` (Quran.com Uthmani; iskelet Tanzil ile karşılaştırıldı; yayından önce `verse_check`).

## Kurgu
| sn | Sahne | Yazı |
|---|---|---|
| 0–3 | Nar + fiyat makarası | ONE POMEGRANATE · A COIN → … → THE WHOLE WORLD |
| 3–7,2 | Nar açılır, bir taneye dalış | A CLAIM BY SAID NURSI. · HERE IS HIS REASONING. |
| 7,2–17,4 | Tek kökten ışık ağacı, 144 meyve | ONE CENTRE. ONE LAW. · A THOUSAND FRUITS, AS EASY AS ONE. |
| 17,4–24 | Geri çekiliş: bütün bahar | A WHOLE SPRING, AS EASY AS ONE FRUIT. |
| 24–35,4 | Kök söner; her meyve kendi ağacını ister | NOW REMOVE THE ONE. · EVERY FRUIT NOW NEEDS ITS OWN TREE. · THE WHOLE WORLD |
| 35,4–40,8 | Alıntı | "If these fruits did not belong to the One, we could not eat a single pomegranate, even if we gave the whole world." |
| 40,8–46,8 | 39:62 | Saheeh International |

Sayaç ("EACH FRUIT COSTS") rakam değil kelime kullanır: ALMOST NOTHING → A WHOLE TREE → THE WHOLE WORLD.

## Üretim
```bash
tools/render.sh E016 && python3 tools/e016_audio.py && python3 tools/master.py E016 49.8
for c in E016Cover1 E016Cover2 E016Cover3; do node tools/stills.mjs $c out/covers 0; done
```

## Yayın metni
One pomegranate should cost the whole world. Here is why it doesn't.

Said Nursi (1877–1960) argued it this way in The Words (22nd Word): if everything is attributed to One Maker, all things become as easy as a single thing. If they are attributed to scattered causes, a single thing becomes as hard as everything.

"If these fruits did not belong to the One, we could not eat a single pomegranate, even if we gave the whole world."

Qur'an 39:62: "Allah is the Creator of all things, and He is, over all things, Disposer of affairs." (Saheeh International)

This is an argument, not a laboratory result. A tree makes a thousand fruits from one root and one law. What would it take to make just one fruit without the tree?

Sources (pinned comment): Said Nursi, Sözler / The Words, 22nd Word, Second Station, Ninth Flash (quotation: our translation from the Turkish) · Qur'an 39:62.
