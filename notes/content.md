# The content model

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

## Content model

`content.js` exports `COURSE`: units → lessons → phrases. Rules:

The course is built around one fortnight rather than a general syllabus: Mum
and Dad flying out for Christmas, a fish restaurant, a market run for fish,
cheese, ham and chicken, and cava — the only thing Mum drinks, which is why
the drinks unit is a cava unit and not a coffee one. Five units of three
lessons, five phrases each bar one: **Saludos**, **El cava**,
**El restaurante**, **El mercado**, **La Navidad**. When the trip is over,
that fifth unit is the one to replace.

The cards name real people — Katrina, and John, who drinks red wine and beer.
That is why `cava-3` carries six phrases rather than five: neither of his
drinks was worth dropping to hold the count. Its extra card is **`cava-3-6`,
sitting second in reading order** — array position is what displays, ids are
append-only, so a card added later does not have to sit last on screen. If the
names ever change, they are in `saludos-2-2`, `saludos-2-3` and `cava-3-6`.

- **Phrase ids are stable and referenced by saved attempts.** Never renumber;
  append.
- The **Palabras** cards carry `sounds` and `picture` — see *A word, a sound
  and one ridiculous picture* below. Both are editable fields, so they are
  hers to rewrite and any card may have them, not only a Palabras word. A
  third, `gender`, decides whether the picture paints that word's object blue
  or pink; it is almost always read off the article instead and is written on a
  card only where the article lies.
- A lesson is ~5 phrases — one cup of tea. Keep them that size.
- Every phrase has a `focusNote` written for a **British** English speaker
  learning **Castilian** Spanish — soft d's, silent h, b=v, the 'th' in
  ce/ci/z, tapped r. The notes are the pedagogy, not decoration.
- If Mum's target ever shifts to Latin American Spanish, the focusNotes need
  rewriting (no 'th'), not just the voice — `VOICES` in store.js is
  deliberately es-ES only, and `settings.load()` resets any voice not in
  that list, so add new voices there when the content is ready for them.

Progress (`mumolingo.progress` in localStorage): completed lessons with best
average, and a streak counted in *local* days.

**Nothing is locked.** Every node on the path is open from first launch; the
ticks and the streak record what Mum has done, they don't gate what she may do
next. The old sequential unlocking and its "Unlock all" testing toggle are
gone — don't reintroduce gating as a "fix" for the path looking uniformly
available.
