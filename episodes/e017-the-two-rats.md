# E017 · The Two Rats (v2)

Seslendirmesiz motion graphics, 85,2 sn (82,2 + 3 sn outro), 100 BPM ızgara. Hat: Risale · tefekkür.

**Ders (tek cümle):** Aynı kuyu, aynı arslan, aynı fareler; farkı yapan iman.

v1 (60 sn) neden olmadı: temsilin öğelerini sıraladı ama hikâyeyi ve dersi anlatmadı; iki kardeş tek cümleyle geçti, dönüşümün sebebi yoktu, sona temsille bağı bizim kurduğumuz bir ayet eklendi. Arslan ve ejderha tanınmıyordu.

## Kaynak
Said Nursi, Sözler, **Sekizinci Söz**. Metinden doğrulananlar:
- Çölde arslandan kaçış; "altmış arşın derinliğinde susuz bir kuyu"; tutunulan ağaç incir ağacı; "iki fare, biri beyaz biri siyah" iki kökü kemirir; altta ejderha.
- Tevil: kuyu = "beden-i insan ve zaman-ı hayat"; ağaç = ömür müddeti; iki fare = gece ve gündüz; arslan = ecel; ejderhanın ağzı = kabir.
- Birinci kardeş: "Ne ölüyor ki kurtulsun, ne de yaşıyor, böylece azap çekiyor."
- İkinci kardeş: "Öyle ise bu işlerde bir tılsım vardır." … "beni tecrübe ediyor, bir maksat için beni bir yere sevk edip davet ediyor." O yerin hâkimine seslenir; kapı açılır.
- Sonuç: ejderhanın ağzı bahçeye açılan kapıya, arslan "musahhar bir at"a döner. Tılsımın anahtarı iman ("Yâ Allah, Lâ ilâhe illallah").

Ekrandaki İngilizce ifadeler Türkçe asıldan **bizim çevirimiz ve özetimiz**. Videoda ayet yok (v1'deki 103:1–3 çıkarıldı; Sekizinci Söz'ün kendi ayetleri 2:255 ve 3:19).
İnsan tasviri yok: adam bir ışık noktası.

## Kurgu
| sn | Sahne | Yazı |
|---|---|---|
| 0–3 | Yakın plan: iki fare kökleri kemiriyor | TWO RATS ARE EATING YOUR LIFE. |
| 3–9,6 | Geri çekiliş; ışık noktası arslandan kaçar, kuyuya atlar, ağaca tutunur | A MAN RUNS FROM A LION. · HE JUMPS INTO A WELL AND CATCHES A TREE. |
| 9,6–16,2 | Yukarı, aşağı, kökler | ABOVE, THE LION WAITS. · BELOW, A DRAGON. · AND TWO RATS GNAW THE ROOTS. |
| 16,2–19,8 | | THIS IS NOT A FAIRY TALE. IT IS YOU. |
| 19,8–34,2 | Tevil, altı çift | THE WELL: YOUR BODY, YOUR TIME. · THE TREE: YOUR LIFESPAN. · THE WHITE RAT: THE DAY. · THE BLACK RAT: THE NIGHT. · THE LION: DEATH. · THE DRAGON'S MOUTH: THE GRAVE. |
| 34,2–39,6 | Günler hızlanır, dal gıcırdar | NO ONE HAS EVER STOPPED THE RATS. |
| 39,6–45,6 | Aynı kuyu iki kez, yan yana | TWO BROTHERS FELL INTO THIS SAME WELL. |
| 45,6–55,2 | Sol kuyu | THE FIRST SAW ONLY ENEMIES. · NEITHER DYING NOR LIVING, HE HUNG THERE IN TERROR. |
| 55,2–67,2 | Sağ kuyu; altın iplikler her şeyi tek noktaya bağlar | THE SECOND THOUGHT: "ALL THIS IS CONNECTED. THERE IS A SECRET HERE." · "SOMEONE IS TESTING ME, AND CALLING ME." · SO HE CALLED OUT TO HIM. |
| 67,2–75,6 | Sağ kuyuda dönüşüm | THE DRAGON'S MOUTH BECAME A DOOR TO A GARDEN. · THE LION BECAME A TAMED HORSE. |
| 75,6–81,3 | İki kuyu yan yana | SAME WELL. SAME LION. SAME RATS. · THE DIFFERENCE WAS FAITH. |

## Üretim
```bash
tools/render.sh E017 && python3 tools/e017_audio.py && python3 tools/master.py E017 85.2
for c in E017Cover1 E017Cover2 E017Cover3; do node tools/stills.mjs $c out/covers 0; done
```

## Yayın metni
Two rats are eating your life. One is white. One is black.

Said Nursi (1877–1960) tells it in The Words (8th Word). A man runs from a lion, jumps into a well and catches a tree. The lion waits above. A dragon waits below. Two rats gnaw at the roots.

The well is your body and your time. The tree is your lifespan. The white rat is the day, the black rat is the night. The lion is death, and the dragon's mouth is the grave.

Two brothers fall into this same well. The first sees only enemies, and hangs there in terror. The second thinks: all this is connected, someone is testing me and calling me. He calls out, and the dragon's mouth becomes a door to a garden.

Same well. Same lion. Same rats. Which brother are you?

Sources (pinned comment): Said Nursi, Sözler / The Words, Eighth Word (our summary and translation from the Turkish). The Eighth Word opens with Qur'an 2:255 and 3:19.
