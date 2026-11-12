"""E018 captions.srt: the on-screen text (silent video), cue times mirror src/e018/timeline.ts."""
import sys
q = [  # t0, ans, truce, inf, out
    (22.2, 1.8, None, 2.8, 7.2), (30.0, 1.8, 2.8, 6.6, 9.6), (40.2, 1.8, None, 2.8, 6.6), (47.4, 1.8, None, 2.8, 6.6)]
QT = [
    ("Did you ever accuse him of lying before his claim?", "No.", "Heraclius reasons: a man who never lied about people will not lie about Allah."),
    ("Does he ever break his word?", "No.", "Heraclius reasons: “Messengers never betray.”"),
    ("Who follows him: the nobles, or the weak?", "The weak.", "Heraclius reasons: the weak are the followers of messengers."),
    ("Does anyone leave his religion out of resentment?", "No.", "Heraclius reasons: such is faith when its sweetness mixes with the heart."),
]
cues = [
    (0.0, 2.9, "A Christian emperor put the enemy of Muhammad ﷺ on trial."),
    (3.2, 6.2, "Jerusalem. Emperor Heraclius receives a letter from Arabia. [Sahih al-Bukhari 7 · our translation]"),
    (6.6, 9.4, "Its writer claims to be a prophet."),
    (9.8, 13.0, "He summons the man’s fiercest enemy: Abu Sufyan."),
    (13.6, 16.9, "Behind him, his men: “If he lies, say so.”"),
    (17.4, 21.8, "Abu Sufyan, later: “I would have lied. I was ashamed to be called a liar.”"),
]
for (t0, ans, truce, inf, out), (qq, a, i) in zip(q, QT):
    cues.append((t0, t0 + ans, qq))
    cues.append((t0 + ans, t0 + (truce if truce else inf), a))
    if truce:
        cues.append((t0 + truce, t0 + inf - 0.3, "“We are at truce. Who knows what he will do?”"))
    cues.append((t0 + inf + 0.2, t0 + out, i))
t5 = 54.6
cues += [
    (t5, t5 + 1.8, "What does he command you?"),
    (t5 + 1.8, t5 + 3.6, "Worship Allah alone."),
    (t5 + 3.6, t5 + 5.4, "Nothing beside Him."),
    (t5 + 5.4, t5 + 9.0, "Prayer, truthfulness, chastity, family ties."),
]
V, L, F = 64.2, 73.8, 81.0
cues += [
    (V + 0.6, V + 4.2, "The emperor’s verdict: “He will soon rule the ground under my feet.”"),
    (V + 4.8, V + 9.2, "“If I could reach him, I would wash his feet.”"),
    (L + 0.2, L + 3.0, "His court erupted. He kept his throne."),
    (L + 3.4, L + 6.9, "The enemy on the stand later entered Islam."),
    (F + 0.2, F + 3.3, "The witness was an enemy. The judge was a Christian emperor."),
    (F + 3.9, F + 7.0, "Now ask the same questions yourself."),
]
cues.sort()
def ts(x):
    ms = round(x * 1000); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
out = []
for n, (a, b, tx) in enumerate(cues, 1):
    if n < len(cues): b = min(b, cues[n][0] - 0.02)
    out.append(f"{n}\n{ts(a)} --> {ts(b)}\n{tx}\n")
open(sys.argv[1], "w", encoding="utf-8").write("\n".join(out))
print(len(cues), "cues")
