# The drill: the card, asking about it, scoring, level two

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

### The English was the half you had to hunt for

`.drill-translation` was 1rem against the word's 1.55rem, and a full shade
lighter. On a Words card — **Hoy** large, *today* small and grey underneath —
the half you are actually trying to learn was the half you had to look for.
Reported from the phone. It is 1.12rem and one step of weight up now, still
quieter than the word but no longer hiding under it.

## Asking about the card you are practising, and keeping the answer

Getting a card right and not knowing *why* it is right is where practice
stalls. So the lesson carries the same `cardChatPanel` the phrase sheet and the
Add tab use, at the bottom of the page, and an answer worth having can be kept
on the card.

- **Kept per answer, not per conversation.** A chat wanders; the one paragraph
  that explained why it's *me pone* is the part you want under the card next
  time. The button lives inside the answer bubble, and the question that drew
  it is stored with it — an answer with no question in front of it reads like a
  note someone else left.
- **Both halves pick their side of the level-two line, and they pick
  differently.** The printed notes are reference material: out while a question
  is standing *and* out while the meaning is hidden, because a note about a
  card quotes it and always explains it. The ask box shows nothing until you
  type, so it only goes out while the question is standing — but it does have
  to go, because the answer it fetches is built from the card and would
  otherwise be the way round the question.
- **Keeping a note repaints `#drill-notes` in place rather than
  re-rendering.** A `render()` in the drill takes the attempt you are looking
  at off the screen — and throws the conversation away with it.
- **The panel sees the replies, and that needed a Worker change.** They are
  printed under the card she is looking at, so "what does *marchando* mean?"
  is a question about this card — but `validateChat` built its `card` from
  five string fields and dropped everything else, so the tutor was answering
  with no idea what she was pointing at. `card.replies` is now accepted
  (optional, capped at `MAX_REPLIES`, sanitised like any other list) and the
  prompt says what they are. Additive: a card without them sends an empty list
  and the prompt omits the paragraph, so the old Worker and the new client are
  compatible in both directions and the deploy order doesn't matter.
- The sheet is where a note can be dropped again (*Forget this*). The lesson
  prints them and otherwise keeps out of the way.

## The score is your weakest word

Azure has no strictness setting worth having, and every number it returns is
an aggregate. `pronunciationScore` is the worst: for a read phrase in a locale
without prosody assessment — which is every locale but en-US, so es-ES too —
it is `0.6·s0 + 0.2·s1 + 0.2·s2` over accuracy, fluency and completeness
sorted lowest first, and completeness is 100 whenever you say all the words
while fluency on a five-word phrase is nearly always 95+. Two of the three
slots are pinned near the top. `accuracyScore` is a mean over the phrase, so
four good words carry a mangled fifth.

So `attemptScore()` in store.js returns **the lowest word score in the
attempt**, with an `Omission` counting as zero — not saying a word is the
worst way of saying it. The doorman doesn't average Mum; he hears the word she
got wrong. Word detail has been stored on every scored attempt since the first
version, so this reads back over the whole history with no migration; the
aggregates are the fallback for an attempt that somehow has none.

**Know what the bands now mean before you touch them.** `PASS_GREAT` (90) means
*every word in the phrase* cleared 90, and `RECALL_PASS` (75) in store.js means
every word cleared 75, four times over, before a card goes to level two. That is
meant to be hard, and it is a real change in difficulty rather than a bug fix —
the old numbers were 80/60 over Azure's blend, which is roughly 72/50 of actual
worst-word. All four aggregates stay on the card as sub-scores (Azure's own
blend included, labelled), and the card names the weakest word so the dial
points at the chip that earned it.

One thing deliberately left alone: `progress.lessons[].best` still holds
averages recorded under the old scale, so a lesson's stored best can read
higher than anything Mum could score today. Migrating them would mean
inventing numbers; they age out as she repeats lessons.

Xerra scores Catalan through the same call with the same function and the same
constants. Keep them in step.

## Level two: drilling from memory

A card is read aloud until `library.goodAttempts()` reaches `RECALL_AFTER` (4),
then `library.recallReady()` flips it to a memory question: the drill prints
the *English* where the Spanish normally goes and withholds three things, all
of which would answer it — the Spanish text, the `focusNote`, and the
Listen/Slow buttons (the model audio says it out loud). **If you add anything
to the drill card, decide which side of that line it falls on.**

Three flags in `state` carry it: `recall` (this card is a question), `revealed`
(the answer is on screen — always true at level one) and `peeked` (Show me was
used rather than remembering). Recording reveals; so does Show me. Attempts now
carry `mode` — `"listen"`, `"recall"` or `"recall-shown"`. Older attempts have
no `mode`, which reads as `"listen"`, because that is what they were.

An attempt counts toward the four if it scored a pass **or wasn't scored at
all** — with no Azure key there is no score to judge by, and the alternative is
that nothing ever leaves level one on the degraded path.

Deliberately *not* done: peeking doesn't demote a card, and nothing ever comes
back down. Spaced repetition is still the unbuilt feature below, and a decay
rule is the shape it should take, not a special case bolted onto this.

Xerra has the same feature in the same shape — same constants, same flags, same
`mode` values. Keep them in step.
