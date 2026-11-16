# El pasado: the dot-or-line gate

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

### The shapes are coloured; the choices still are not

The gate was black and white until you answered — reported as looking broken
or unfinished. **The reason it had no colour is still good**: a coloured
*choice* reads as the recommended one, and the only colour on that screen was
meant to arrive with the verdict.

So the colour is on **the mark**, not on the button — one hue per shape, given
to every choice at once. That is a legend rather than a recommendation, and it
is the reason this doesn't undo the earlier decision.

- **Dot is orange, line is blue, a line reaching now is purple**, and the same
  colour follows the shape into the verdict and onto the phrase sheet, so the
  picture and the colour get learned together.
- **The tint behind the mark is mixed from `currentColor`**, so a new shape is
  one `.shape-*` line and nothing else.
- The phrase sheet's block already sits on a tint, so the mark keeps its colour
  and drops the second background there.

## Dot in a box, or line: El pasado

Ported from Deb-o-lingo, which took the mechanism from Xerra. On the El pasado
lessons the drill shows Mum the English and asks **which shape the past is**
before it will show her the Spanish — a **dot in a box** (an event with a shut
box of time round it), a **line** (a habit, a state, a background), or a **line
reaching now** (a stretch of time that still has today inside it).

That order is the whole feature. Reading the sentence first and then being told
what tense it is teaches you to recognise endings you have already been given.
Deciding first, from the meaning alone, is the thing that transfers to actually
speaking, where the decision comes before the words every time.

- **`ASPECTS` in store.js is the table and `aspectOf` is the one reader.**
  Three shapes, not Xerra's five — the same reduced cut Deb-o-lingo took, and
  for the same reason: `both` and the pluperfect wait until there is a lesson
  that needs them.
- **`aspectChoices(queue)` decides what the gate offers**, and it is not the
  whole table. The two `base` shapes are always there — dot-or-line is the
  question every past sentence poses — and the present perfect joins only in a
  lesson that actually contains one. So **a lesson's contents are
  load-bearing**, and the instruction line follows: two choices ask *Dot in a
  box, or line?*, three ask *Which shape?*.
- **The endings are the loud part**, as in Deb-o-lingo and unlike Xerra. Ending
  ↔ shape is the one association these lessons exist to build, so `endings`
  rides every choice button in bold and the verdict prints it big on a gold
  tint. The grammar-book term stays small and italic: on the screen every time,
  never the thing she is asked for.
- **`marked` lights the ending up on the verb itself.** The text with the
  ending — or the auxiliary pair — in `[brackets]`, rendered as a gold letter
  shade by `drillSpanish`. It must reduce to `text` exactly or the plain text is
  used, which is what keeps an edited card showing its edit (an override
  changes `text`, not `marked`) and makes a typo in the marks cost only the
  highlight.
- **The gate is a whole screen**, not a strip above the card. EDIT goes while
  the question stands, because the editor prints the sentence she is being
  asked to think about; the quit and the progress bar stay.
- **Nothing is persisted.** No per-shape tally, no demotion. A wrong answer
  tells her what it was, why, and moves her on to say the sentence. Same call
  Deb-o-lingo and Xerra make, for the same reason: a memory of which shapes she
  gets wrong is a decay rule wanting to be designed, not a counter bolted on.
- **It stacks above level two.** The gate never shows Spanish, so the card
  becomes whatever it was going to be only after the shape is named. The
  `aspectNote` waits behind a level-two question — it explains this sentence by
  quoting Spanish at her — while the term and the endings stay, since a hint
  about the ending is what naming the shape is *for*.
- **`settings.aspectGate` turns the question off.** Cards outside El pasado
  carry no `aspect`, so `aspectOf` is null for the rest of the course and the
  switch does nothing to them.

### The sentences are Mum's, and that is the point

**The three shapes and the teaching order are Deb-o-lingo's; the sentences are
not.** Hers are written from a life lived in Spain — a job in Chicago, a flat, a
week that repeats. Mum's are the trip: coming over from England with Dad, the
son they came to see, the market, the fish, the cava, Christmas. Porting the
sentences across would have handed her somebody else's past to talk about,
which is the one thing these lessons cannot afford — you cannot practise saying
what happened to you in words about what happened to somebody else.

Four lessons, five cards each, and the order is the argument: the line on its
own, the dot on its own, then the one that catches everybody out (today against
yesterday), then all three mixed.

- **Each single-shape lesson carries one card of another shape on purpose.** A
  lesson whose name answers its own question trains the lesson, not the grammar.
- **`pasado-3` is built round a minimal pair** — *hoy he comido pescado* against
  *ayer comí pescado*. Same meal, one word different, and the time word is the
  whole of what decides the shape. Breaking that pair up costs the lesson its
  point.
- **The Spanish here is Spain-specific**, like Deb-o-lingo's: Latin American
  Spanish would use the preterite across most of the present-perfect side.
- **`estuvimos aquí dos semanas` is the hard case**, in deliberately. Two weeks
  sounds long, but both ends are shut — length never decides it, edges do.
