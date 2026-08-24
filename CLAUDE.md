# Mum-o-lingo — working notes

A personal Spanish (es-ES) pronunciation trainer for one specific beginner,
Mum: five-minute lessons, Duolingo-flavoured UI, real pronunciation scoring.
Not for release; the audience is exactly two people.

`README.md` is for the people using it. This file is for whoever works on it.

---

## Lineage: this is a fork of Deb-o-lingo, which is a fork of Xerra

There are now three of these. `dbFSProductions/listen-record-learn` ("Xerra",
Catalan) came first; `dbFSProductions/deb-o-lingo` forked it for Castilian
Spanish; this repo forked *that* for a second Spanish learner. The engine is
one codebase living in three places, so almost every "keep them in step" note
below is now a three-way instruction rather than a two-way one.

| File | Relationship to the other two |
|---|---|
| `docs/js/audio.js` | **Verbatim copy in all three.** Recording, playback, the speech detector, the waveform and the pitch tracker. Change one, change the others, and re-verify numerically (below). |
| `docs/js/speech.js` | Same behaviour everywhere. Port bug fixes all ways. |
| `docs/js/store.js` | Deb-o-lingo's, with the storage prefix changed — see the next section, which is the one thing a new fork must not get wrong. |
| `docs/js/app.js` | Deb-o-lingo's, with the name and the cache prefix changed. The path, lessons, banners and celebration are its shape; the drill, canvas and scoring internals came from Xerra originally. |
| `docs/js/card-assistant.js` | Copied from Deb-o-lingo, and therefore *behind* Xerra, which has grown call timing (`aiLog` + a Settings panel, its PR #29). Don't "fix" the three back into agreement without porting that deliberately. It talks to the **same deployed Worker** as the other two: the Worker takes the language per request, and Pages serves all three from the one `github.io` origin its CORS list already allows, so **this app needed no Worker change at all**. There is no `worker/` directory here — the code lives in Xerra's repo. |
| `docs/js/version.js` | Same file, own numbering. Reset to v1 here, because nobody has an old cache of this app. |
| `docs/js/content.js` | **Hand-written here, and the only file that is genuinely this app's own.** No Swift twin, no generator. Deb's course and Mum's course share a shape and nothing else — see *Content model*. |
| `docs/app.css` | Shared palette. Change a colour here and change it in the other two. |
| `docs/icons/` | Reused unchanged: the parrot carries no lettering, so it needed no rework. |

## The three apps share one browser origin

This is the trap, and it is invisible until two of these are on one phone.
GitHub Pages project sites are *paths*, not subdomains — all three live on
`https://dbfsproductions.github.io`, so `localStorage`, IndexedDB and the
CacheStorage are **one shared pot**. A fork that only changes the visible name
quietly shares Mum's progress, attempts, cards, interview transcript and Azure
key with Deb's.

So a fork has to rename four things, and the fourth is the one people miss:

1. The nine `STORE` keys in `store.js` (`mumolingo.*`).
2. `DB_NAME` in `store.js`.
3. `VERSION` in `sw.js`, whose value is also the cache name (`mumolingo-v1`).
4. **The two cache-prefix reads in `app.js`'s version panel** —
   `keys.filter((key) => key.startsWith("mumolingo-"))` and the matching
   `replace(/^mumolingo-/, "")`. Miss these and Settings → *Version* reads the
   sibling app's cache and reports a number this app never had, which is
   precisely the confusion that panel exists to prevent.

The export filename in `app.js` carries the name too, so a backup says which
app it came from.

Xerra gotchas that still apply here: the `.sheet` `display:flex` vs `hidden`
trap (comment preserved in app.css), service-worker staleness (bump **both**
`VERSION`s — `sw.js` and `js/version.js` — when shipping changed assets), and
never commit an Azure key — it lives only in localStorage, entered in Settings.

### Two version strings, bumped together

`VERSION` in `sw.js` and `VERSION` in `docs/js/version.js` aren't derived from
each other — `sw.js` is a classic worker and can't import an ES module, and
inlining one into the other needs the build step this app deliberately doesn't
have. Settings shows both instead, as *Running* (the executing JavaScript) and
*Installed* (read back from `caches.keys()`), so forgetting one shows up as two
different numbers on the screen rather than silently. That panel is also the
answer to "is the fix in, or has the phone not caught up?" — after a deploy the
installed number moves first, and the gap is the reload still owed.

**Say the two numbers out loud whenever you hand work over.** Every pull
request and every merge should end with the pair written out — `js/version.js`
first, then `sw.js`'s — because Settings → *Version* is the only way to tell
"the fix is in" from "the phone hasn't caught up", and that check is worthless
without knowing what number to expect. So: state them in the PR body, and state
them again when reporting a change as done. Mum should never have to go and
read the diff to find out what she's looking for.
`.github/pull_request_template.md` has a slot for them so the PR half is
structural rather than a thing to remember.

Bumping it is necessary and was once not sufficient. The install handler used
to precache with `cache.add(url)`, whose fetch goes through the browser's own
HTTP cache — and Pages serves everything `max-age=600`. So for ten minutes
after a deploy, a brand-new version's cache could be filled with pre-deploy
copies of some files and post-deploy copies of others, and cache-first then
served that mix until the *next* version bump, with no amount of reloading
fixing it. (That is Xerra's story; this repo shipped the fix before it
happened here.) Precaching now uses `new Request(url, { cache: "reload" })` so
a version's cache is all of one version, and navigations are network-first
(cache only as the offline fallback) so the HTML can never be staler than the
scripts it names. **Don't undo either one for "fewer requests."**

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

## What is data, and what is code

`content.js` is code and stays the source of truth. Everything Mum does to it
is stored beside it, keyed by phrase id:

| localStorage key | Holds |
|---|---|
| `mumolingo.phrases` | Her own cards — from the Add tab or written by hand. |
| `mumolingo.overrides` | Her edits to *course* phrases, as a diff of changed fields only. Empty diff = key deleted, so "Reset to the original" is a delete and an untouched phrase costs no storage. |
| `mumolingo.favourites` | Starred phrase ids, course and custom alike. |
| `mumolingo.attempts` | Recordings and scores (audio blobs live in IndexedDB). |
| `mumolingo.progress` | Completed lessons + streak. |
| `mumolingo.notes` | Answers she kept from a card chat, by phrase id. |
| `mumolingo.replies` | What she might hear back, by phrase id. |
| `mumolingo.aboutMe` | The Sobre mí interview transcript (not keyed by phrase). |

`library.decorate()` is what merges an override, the star flag, the kept notes
and the replies onto a stored phrase — anything that reads a phrase for display
or for drilling must go through it, or Mum's edit will be invisible in that one
place. Export/import carries all seven stores plus the transcript.

**Notes and replies are not edits, so they are not overrides.** An override is
a diff against content.js that "Reset to the original" throws away; losing the
answer Mum kept about a phrase because she reset its wording would be wrong.
They get their own stores for the same reason favourites does: a course phrase
is code and can't carry anything.

**`decorate()` hands back a copy, and that is the one thing to watch.** Xerra
mutates the phrase object its queue is holding (`setReplies`, `keepNote`); here
the queue is holding a copy, so `library.setReplies`/`keepNote` write the store
and the *caller* assigns the result back onto the copy it has
(`phrase.replies = …`, `phrase.notes = …`). Same fix in a different shape:
repaint the card you're looking at, never `render()` underneath yourself —
a render in the drill takes the attempt off the screen and the chat with it.
`updatePhrase` strips `favourite`, `notes` and `replies` back off before
saving, so a stale second copy can't ride along in export.

**Only Mum's own cards can be deleted.** `library.removePhrase()` takes the
card, its attempts and its recordings, and the phrase sheet offers it — armed,
so it takes two taps (`armDelete()`, shared with the editor's copy). A course
card has no delete: it's code, and deleting one would mean inventing yet
another "hidden ids" store. The sheet says so rather than leaving Mum hunting
for a button that isn't there. If hiding course cards is ever wanted, that's
the design to have, not a `removePhrase` that silently does nothing.

Her own cards ride the path as a generated unit, **Lo tuyo**, chunked five to a
lesson in creation order (`own-1`, `own-2`, …). The ids are stable as cards are
appended; deleting one can reshuffle membership, which costs at most a
completion tick on a lesson she made herself. Cards the interview wrote are
chunked the same way into a second unit (`about-1`, …) — the two lists are
separate so neither can shuffle the other's lesson ids.

### Editing a card, and the AI rebuild

The edit sheet has a **Rebuild the rest with AI** button (only when the card
assistant is configured). It calls the same `/complete-card` the Add tab does —
**the Worker is unchanged**, which matters because it lives in Xerra's repo and
serves both apps.

The one piece of judgement is which side gets sent. Change the Spanish but not
the English and the two now disagree; sending both would ask the assistant to
reconcile a contradiction. So `wireEditorAI` snapshots the fields when the
sheet opens and sends only the side that was actually edited, dropping the
other as if it had been left blank on the Add tab. Change both, or neither, and
both go. Nothing is written until Save — for a course card that means no
override is created — and the review notice carries an Undo that puts the
snapshot back.

The lesson bar has an **EDIT** button for the card she has just heard and
realised isn't how she'd say it. `editPhrase(phrase, onSaved)` takes a callback
for it: the lesson queue holds decorated copies and the model audio is cached
by text, so the fixed card has to go back into `lesson.queue` and be reloaded —
a re-render alone would keep the old text's audio.

Xerra has both in the same shape. Keep them in step.

---

## What they might say back

A card carries `replies` — two or three things a person actually says in
answer, each with its English and a play button. Saying your line well is half
of it; the half that strands you is the answer.

- **They have their own Worker endpoint, `/replies`, and that is not a detail.**
  In Xerra they were briefly extra fields on `/complete-card` and it took the
  Add tab down: a required array of objects on top of the six string fields
  roughly doubled the output, a Flash model already shedding load took longer
  than the Worker's per-attempt timeout to produce it, and the button spun for
  a minute before reporting Gemini busy. **Card generation must stay the small,
  fast call it is.** Don't move replies back into the card payload to save a
  request.
- **The Add tab never waits for them.** `askForReplies()` is fired after the
  card is on screen and is never awaited, so the card lands at its old speed,
  Save is enabled immediately, and a failure here costs nothing but the
  section. `repliesToken` guards against a slow set landing after "Try again".
- **The whole course predates the field**, so *What might they say back?*
  offers to go and get some — on the phrase sheet **and in the lesson**, since
  the moment you want them is the moment you have just said the line and
  wondered what happens next.
- **They are held back harder than anything else in the drill.** A situation is
  a clue; "we're full, about twenty minutes" is the answer to the question a
  level-two card is asking you to produce. So `drillReplies` stays out entirely
  while a question is standing, as well as while the meaning is hidden — and
  the *offer* sits behind the same gate as the replies it would fill in.
- Replies play through `speech.modelAudio`, which keys its cache on the text,
  so a reply heard once is available offline like any phrase. `sayAloud` is the
  shared one-tap behaviour: stop whatever is playing, Azure audio if there's a
  key, browser voice if there isn't, busy flag on the button itself so several
  can sit on one screen.

### Situation is the first box in the composer

The Add tab asks for the situation *above* the Spanish and English boxes, and
that ordering is the point rather than a layout preference. It is the field the
completion is built from — where you are and who you are talking to is what
decides what a person would actually say — and it is the thing the other apps
skip. Underneath the two language boxes it read as a footnote to them and got
left blank; above them it is the question being asked. The "or" divider still
belongs to the pair below it, and *Generate again*'s hint still puts the cursor
here, which now means the top of the card rather than the bottom.

It stays labelled **(optional)**, honestly: `completeCard` needs Spanish or
English, so a situation on its own can't build a card.

### The Add review reads in one direction

Preview line, then what the assistant did and why, then the way back if that
isn't what she meant, then the fields, the replies, and the two ways out. The
order is the argument: everything above the fields is *about the card she is
looking at*, and everything she might do about it is a link inside one sentence
rather than a button competing with Save.

- **The review note was above the preview and the Undo was inside it.** So the
  explanation sat above the thing it explained, and the one control that
  withdraws the whole completion was a bare word in a yellow box at the top of
  the panel — nowhere near "Generate again", which is the other half of the
  same thought. Both are now directly under the card: the note, then *Not what
  you meant? **Change the situation, Spanish or English** above, then
  **generate again**. Or **undo** to get your own words back.*
- **`before` and `undoCompletion` moved up to `renderAdd`'s scope.** Undo is
  wired once now, with the rest of the page, instead of being injected into the
  review note's innerHTML on every completion.
- **Two ways out, and practise is the primary.** *Save and add another* keeps
  her here with an empty form; *Save and practise now* saves the card and drops
  her straight into it — `startPractice([saved])`, the same one-card queue the
  phrase sheet's "Practise now" already starts. A card saved and never drilled
  is where this app leaks, so the drill is the green one.

Deb-o-lingo has this in the same shape — it is the same file with the names
changed, and this was ported from there. Xerra has it too, with one difference
that follows from its decks: its "practise now" starts the card's whole deck
positioned at the new card rather than a queue of one, because it has a deck to
carry on through.

### The Add review says the card out loud, and can be sent back

A generated card used to be checkable only by reading it. The review opens with
a **preview line** — the phrase, its English and a play button in the Add tab's
orange — built out of the same parts as a reply because it does the same job
one step up.

- **The preview reads the field, not a snapshot of the completion.** The
  Spanish stays editable right up until Save, and a preview saying something
  other than what is in the box would be worse than no preview.
- **"Try again" is now "Generate again", and the way back to the inputs is
  spelled out.** It always re-read the composer fields; the trouble was that
  they are at the top of the page and it is at the bottom, so on a phone they
  are never on screen together and it read as "roll the dice again". The hint
  scrolls the composer into view and puts the cursor in Situation — usually the
  field that needed to be clearer.
- **Undo withdraws the whole completion.** The completion overwrites all three
  inputs with its corrected versions, so re-steering it meant editing the
  assistant's rewrite of your own words. Undo puts the raw three back, hides
  the review and the chat, and bumps `repliesToken` — a reply still in flight
  answers a card that no longer exists. The review note is always shown (with
  a fallback line), because a completion with no `reviewNote` would otherwise
  leave the hint under it hanging on nothing.
- The two review buttons **stack** rather than sharing a row: at 390px both
  wrap onto a second line and go 70px tall.

Xerra has all of this in the same shape. Keep them in step.

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

## Sobre mí: cards the app writes about Mum

Every other card arrives already written — content.js, or something typed into
Add. These are written *about her*, from an interview held entirely in English,
and they are the answer to "AI-generated content from life context".

- **Why an interview and not a text box.** You don't know what is worth saying
  about yourself until something asks. A blank box captioned "tell us about
  you" gets a blank box back; a question about where you live gets an answer,
  and the answer suggests the next question. The box was the cheaper build and
  it would not have worked.
- **English throughout, and that is the point.** Mum cannot describe her own
  life in Spanish yet — that is the thing the unit is being built to fix.
  `lang="en-US"` on the answer box so the iOS keyboard's dictation types the
  right language into it.
- **What comes out is ordinary cards of hers.** They drill, star, score, level
  up, export, edit and delete exactly like a card from Add, and nothing
  downstream of `library.addPhrase` knows where they came from. `ABOUT_DECK`
  is a name they carry in `deck` and nothing more; the one thing it buys is a
  unit of their own on the path. Resist giving them a flag — the moment they
  are a special *kind* of phrase, every list in the app has to learn about them.
- **The workshop node breaks a rule on purpose.** Every other node on the path
  drills; this one opens the interview, because the interview is the only way
  cards get into the unit. It is also the only node that shows *before its unit
  has anything in it* — "the first time you open it, it asks about you" needs
  something to open. With no card assistant configured the whole unit stays
  away, since it could never hold anything.
- **Two endpoints, not one, and for the established reason.** `/interview` asks
  the next question, `/about-cards` turns the transcript into a batch of them.
  Writing a batch is the big slow call and asking one question is not, so they
  have to be able to fail separately — the same argument that moved replies off
  `/complete-card`. **Both are additive on the Worker, which lives in Xerra's
  repo: `/complete-card`, `/chat` and `/replies` were unchanged, so Sobre mí
  required no Worker edit.**
- **The Worker owns how these calls behave, and it can change under this app.**
  Xerra's #29 put `/interview` and `/chat` on a smaller, faster model with a
  10s timeout, and cut `/about-cards` down. None of that needed a line here,
  which is the arrangement working as intended — but it does mean "the chat
  answers got worse" may be a Worker change rather than anything in this repo.
  `GEMINI_FAST_MODEL = GEMINI_MODEL` in Xerra's `wrangler.toml` undoes the
  model half.
- **How many cards a batch holds is the Worker's business, not this app's.**
  `makeCards` saves whatever comes back, so the number is free to change over
  there without a line changing here — and it does: Xerra tuned it down when
  `/about-cards` turned out to be the slowest call it makes, since the cost is
  almost entirely the length of what it writes. Don't pin the number in this
  file or in a test; "tell it more, get more" is the flow either way.
- **The transcript is persisted; the card chat's history is not.** That is the
  whole difference between `aboutMe` in store.js and `cardChatPanel`'s local
  array. A card chat is a study aside that dies with the panel. This one is the
  material the cards are built from, so it has to survive a lesson, a reload
  and the weekly reinstall — and it is what stops the assistant asking about
  her job twice. It rides in export/import with the phrases.
- **A question that arrives after she has left is still saved.** `nextQuestion`
  writes the reply to the transcript whether or not the page is still on
  screen, and only the repaint is guarded. The guard is `log.isConnected`, not
  a lookup by id: a `render()` puts a *new* log in the document, so an id
  lookup succeeds while the handles in the closure are stale, and the spinner
  gets painted onto a detached node.
- **`interviewPayload` caps are load-bearing, not cosmetic.** 16 turns at 800
  characters plus 40 existing translations at 120 is what fits under the
  Worker's 24k body cap, which is checked on the raw request *before* its
  validator runs — go over and the whole call is rejected with no way to tell
  why.
- **No review step before saving, unlike Add.** There is no half-remembered
  phrase being corrected here, so there is nothing to check the assistant's
  reading against — and approving a batch of cards one at a time would be the
  longest screen in the app. A wrong one is edited or deleted from the phrase
  sheet.
- **Duplicates are dropped client-side as well as discouraged in the prompt.**
  A model asked twice about the same life will eventually write the same
  sentence; `normaliseSentence` already ignores case, accents and punctuation,
  so "Vivo en Madrid." and "vivo en madrid" are one card.
- **Clearing the interview is armed, and leaves the cards alone.** It is the
  only way back from a conversation that went somewhere she didn't mean. The
  cards it already wrote are ordinary cards; deleting those is the phrase
  sheet's job. The button appears the moment there is a transcript rather than
  on the next full render — Xerra still has that gap, and it is worth porting
  back.

Xerra has all of this except the last point, in the same shape. Keep them in
step; the divergences that are deliberate are the deck-vs-unit shape (it has a
deck list, this has a path) and the Spanish name.

---

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

---

## The trim, and why it has to be one detector

`speechBounds` finds where the speech is, and the picture, the sound and the
pacing note all ask it. That is the whole of the fix, and the history is why it
has to stay that way:

- **A fixed threshold silently stops working in a real room.** 0.015 RMS over
  256-sample frames is right in a quiet one. `autoGainControl` is off, so a fan
  or traffic puts the room itself over the line, the scan calls the first frame
  speech, and nothing is trimmed at all — indistinguishable from the feature
  having been reverted. Measured here, before the port: a 1.2 s lead-in of room
  noise at 0.02 RMS in front of 1.5 s of speech reported **3.3 s**, the whole
  untrimmed clip.
- **Which made the pacing note lie.** A 1.50 s take against a 1.40 s model
  measured **2.36×** and told Mum to "try running the words together more" —
  scolding her for the pause before she started talking. It now reads 1.05×,
  which is "nicely matched".
- **The room is read from the quietest frames (2nd percentile), not the quiet
  tenth.** A TTS clip is speech almost end to end, so its tenth percentile
  lands inside a syllable and sets the line above the dips between them, which
  shortens the *model's* measured length and inflates every ratio.
- **Both ways of being wrong must be "trim less".** The threshold is capped
  well under the voice (`voice * 0.35`) so a loud room can't drag `room * 3` up
  to the speech's own level and start eating syllables.
- **Three frames in a row at each end**, so a click or the stop button isn't
  the first word or the last one.
- **The tail is padded, not cut close.** `TAIL_PAD` (0.25 s) is what saves a
  final consonant, whose release sits under the line that found the word.
  "¿Cuántos?" heard as "¿cuánto?" is a different question. Playback trims the
  front only and leaves the tail alone entirely.
- **The duration is measured between the bounds, not across the padded
  window** — counting the pad would make every recording read a fifth slower
  than it is.

The fallback, for a clip the bounds can't judge (under eight frames, all room,
or all voice), is the old fixed-threshold scan, which is why a synthetic 150 Hz
tone still passes through untouched and still reads 150 Hz.

### One knock used to cancel the whole boost

`forPlayback` lifts a quiet recording to roughly TTS loudness so that You and
the model can be compared by ear. It very nearly didn't, and the way it failed
is worth knowing:

- **A 20 ms transient decided the gain for the whole clip.** The tap of a thumb
  reaching for stop, a knock on the table, a plosive into the mic — louder than
  anything Mum said. It set `peak`, so `0.98 / peak` pinned the gain at ~1.0,
  `gain > 1.1` came out false, and **no boost was applied at all**. It also sat
  inside the trimmed region, so it dragged the average level up and asked for
  less gain to begin with. Measured on a synthetic take needing 2.9× to reach
  TTS level: one click took it to 1.0×, and playback came out exactly as faint
  as it was recorded while the model played at full volume.
- **It is a cliff, not a slope**, which is why it reads as "playback seems to
  have got quieter" rather than as a bug: the same voice in the same room is
  boosted on the go with no knock in it and not on the go with one.
- **`voiceLevels` reads both numbers from the frames that are plausibly
  voice.** Anything over four times the 90th-percentile frame is a knock, not a
  word — twelve dB above a loud vowel is not something a person does
  mid-phrase — and it is left out of both the average and the peak.
- **What overshoots is soft-limited, not allowed to veto.** `softLimit` bends
  everything above a 0.7 knee towards a 0.98 ceiling with `tanh`, whose slope
  is 1 at zero, so the curve meets the straight part cleanly and nothing below
  the knee is touched. The rare transient saturates instead of clipping into a
  square-edged buzz. The limiter only runs when there is a boost to catch: a
  clip that is merely being trimmed comes through sample for sample.
- **Both halves self-level, and that is the point.** The model goes through
  `forPlayback` too, so recording and model are both normalised to
  `TARGET_RMS` and end up matching each other whatever that constant is. The
  bug was never the constant — it was one of the two being silently skipped.

#### And then the boost only ever went one way

Fixing the knock got the recording up to `TARGET_RMS` and it was *still* the
quieter of the two, because the bullet above was a description of the intent
rather than of the code: `boosting = gain > 1.1` meant a clip already above the
line was passed through at whatever level it arrived at. Only recordings are
ever below the line, so only recordings were ever touched, and the model went
out at Azure's loudness — which is not a constant: three synthetic TTS clips
came out 5.9 dB apart from each other, with the recording pinned below all
three.

- **Levelling is symmetric now**: `gain > 1.1 || gain < 0.9`, so a loud TTS
  clip is brought *down* to the line as well. That is what makes the constant
  not matter, which is what the bullet above always claimed. Only a boost runs
  through `softLimit` — turning a clip down can't clip.
- **`TARGET_RMS` is 0.16 rather than 0.12**, chosen so the model barely moves
  and the recording comes up to meet it, rather than the whole app getting
  quieter to meet the recording. `MAX_BOOST` is 12 rather than 8 so a genuinely
  faint take can still reach the new line; the boost only ever runs on quiet
  clips, and it lifts the room with the voice, which is the accepted cost of
  hearing yourself at all.
- **A plosive no longer holds the gain back, but only just.** The peak cap was
  `CEILING / headroom` — the same "one sample decides the phrase" shape as the
  knock, worth about a decibel on a take with a hard *p* in it. It is
  `CEILING * OVERSHOOT / headroom` now, and `OVERSHOOT` is **1.25 and not 2**:
  see the crest-factor note below for why that number and not a rounder one.
- **`voiceLevels` has a floor as well as a lid.** It averaged every frame below
  the knock line, pauses included — and a recording pauses while a TTS clip is
  speech end to end, so the same measurement meant two different things on the
  two halves. Frames under a fifth of the 90th-percentile frame are now out of
  the number too, so both are read over the words.

#### Crest factor is the variable, and a sine has none

This shipped as v18, was reported as having killed playback outright, was
reverted the same day, and went back in unchanged apart from `OVERSHOOT` when
the silence turned out to have been the phone's volume. Two things are worth
keeping out of that.

The first is that **the checks that passed it were built on summed sinusoids,
whose crest factor — peak over the level of the words — is about 1.6.** Speech
is 4 to 8, a TTS clip nearer 3, and crest is precisely what a peak cap is
about: the cap binds once the crest exceeds `CEILING * OVERSHOOT / TARGET_RMS`.
A sine clip is therefore the one signal that can never exercise the line being
moved. Anything touching the gain here wants a clip with a speech-like crest,
which means a glottal pulse train through a few formants, not a sum of sines —
and better still, a real exported recording and a real Azure clip, which is the
one thing none of these tests has ever had.

The second is the sweep that set `OVERSHOOT`, measured on clips built to a
given crest, reading the level the words come out at and how much of the clip
the limiter bends:

| crest | `OVERSHOOT` 1 | 1.25 | 1.5 | 2 |
|---|---|---|---|---|
| 4 | 0.160 | 0.160 | 0.160 | 0.160 |
| 6 | 0.160 | 0.160 | 0.160 | 0.160 |
| 8 | 0.143 | 0.167 | 0.167 | 0.167 |
| 12 | 0.093 | 0.116 | 0.138 | 0.166 |

Under 0.22% of samples are bent anywhere in that table, so 2 was not the
disaster it looked like when the app appeared to be dead — but 1.25 reaches the
line on everything speech-shaped and leaves the limiter catching transients
rather than reshaping vowels, so 1.25 is what shipped.

**Check this numerically, never by recording in a quiet room** — a quiet room
is the case the old scan already handled, which is exactly why the bug survived
so long. See *Running and checking*.

---

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

---

## Running and checking

```bash
cd docs && python3 -m http.server 8765   # http://127.0.0.1:8765
```

Playwright against that URL beats clicking through. Worth asserting: no
console errors on boot, the path shows 15 course nodes + Repaso with **nothing
locked** (`.node.locked` should never match), the deepest lesson opens straight
away with `.drill-text` populated, an edit to a course phrase drills as edited
and Reset puts it back, a starred phrase raises the Favourites node, a saved
card appears in Phrases *and* in Lo tuyo, and completion writes progress +
lights the streak.

For level two, seed `mumolingo.attempts` with four passing attempts on a known
phrase id and assert the drill shows the *English* in `.drill-text`, carries a
`.level-badge`, and has no `#listen` and no `.focus-note`; then that `#show-me`
brings all three back. Recording can be driven headlessly with Chromium's
`--use-fake-device-for-media-stream` (plus `--use-fake-ui-for-media-stream`),
which is enough to check the reveal-on-record and the stored `mode`. Anything touching Azure or the card assistant can't be
covered — no key and no passcode in the repo, ever.

With the assistant stubbed (Playwright's `page.route` over the Worker's paths),
also worth asserting. For replies: `#drill-get-replies` is offered on a card
without them and absent while a level-two question stands, a successful fetch
paints `.drill-replies` with working `[data-say]` buttons, `#p-get-replies` on
the sheet removes itself once they land, and the Add review shows them without
Save ever having waited. For the chat: `#drill-chat` is there at level one and
absent while a question stands, `.chat-keep` puts a `.kept-note` under the card
and flips to `Kept on the card ✓`, `Forget this` on the sheet removes it, and
the posted `card.replies` carries whatever is on screen — from the sheet, from
the lesson, and from the Add tab once `askForReplies` has landed — with an
empty list for a card that has none.
For Sobre mí: `#about-open` is on the path before the unit has cards and the
whole unit is absent with no assistant configured, opening it fires exactly one
`/interview` by itself, `#about-make` is disabled until a learner turn exists,
a batch containing a punctuation-only repeat adds one fewer than it returned,
the made cards are ordinary phrases with `deck === "Sobre mí"` that appear as
`[data-lesson^="about-"]` on the path, the transcript survives a reload without
a second `/interview`, and `#about-reset` takes two taps and leaves the cards
alone. For the version panel: `#s-running` and `#s-installed` agree after a
clean install. Two smoke scripts covering all of that live in the session
scratchpad rather than the repo — there's no test runner here on purpose.

For the weakest-word score, `attemptScore` is worth driving straight at the
module: five words with a 61 among them returns 61 and not Azure's 93, an
`Omission` returns 0, no word detail falls back to `accuracy` and then to
`overall`, and an unscored attempt stays null. Then that it reaches the screen
— two seeded attempts scoring 93-with-a-61-in-it must *not* reach level two,
the attempt rows must read 61, and the phrase row's best must be the best
worst-word. The score card itself can be driven for real: `--use-fake-device-
for-media-stream` plus replacing `scoring.score` on the module object (app.js
holds the same object, so the stub reaches it) gets you a `.dial-value` of 61,
an `Azure 93` sub-score beside it, and the "your weakest word, “leche”" line.

**The trim is the one thing to check numerically, and it needs no microphone.**
Build synthetic clips in the page — room noise at a chosen RMS, then a
150 Hz tone with syllable-rate amplitude modulation, then a tail — encode them
as WAVs and call `analyse()` on them through Playwright. What the numbers must
say: the reported duration is the speech alone at 0.001, 0.02 *and* 0.05 RMS of
room noise; a 1.50 s take against a 1.40 s model reads ~1.05× and not 2.2×; a
TTS-shaped clip (speech end to end) isn't shortened; a quiet high burst after
the last vowel still has energy in the last tenth of the drawn envelope; and a
plain 150 Hz tone comes back untrimmed at 150 Hz. Reverting audio.js and
re-running is what proves the test has teeth — the old code fails four of those
and passes the tone.

The playback levelling is checked the same way and also needs no microphone —
but **build the clips out of glottal pulses through a few formants, not out of
sinusoids.** A sine's crest factor is about 1.6 where speech is 4 to 8, and the
peak cap this all turns on is a crest-factor question, so a sine test passes
changes that a voice would fail; that is how v18 shipped. Measure the RMS over
the *words* (the frames between a fifth and four times the 90th-percentile
frame — not the loudest window, which would measure the burst).

What the numbers must say: the same take with and without a 20 ms
0.9-amplitude burst in it lands within a decibel of itself; a take and a
TTS-level clip land within a decibel of *each other*, which is the check that
matters and the one the complaint was about; three model clips 9 dB apart on
the way in come out level; a faint take reaches the line; no sample exceeds
0.98; a clip already at the line comes back as the very same blob; and at a
speech-like crest the limiter bends well under half a per cent of the samples.
Before the knock fix the tapped one came back at 1.0× gain; before the
symmetric fix the three model clips came back 5.9 dB apart.

For the Add review: the preview line follows an edit to the Spanish box, a
blank `reviewNote` still gets a notice, `#edit-inputs`
focuses `#add-situation`, `#try-again` posts the edited situation, and
`#undo-complete` restores all three raw inputs and re-hides `#card-preview`
and `#add-chat`. Its order is worth asserting on directly: the review card's
children are the preview line, `#review-note`, `.regen-hint`, the two fields,
`#result-replies` and the button row, in that order, with `#try-again` and
`#undo-complete` both inside the hint. `#save-another` leaves her on Add with
an empty form and the card saved; `#save-practise` puts `.drill-text` on screen
showing the card just made. Pick a phrase for that test that is *not* already
in the course — the duplicate check reads `allPhrases()`, so "Otra, por favor."
is refused before it ever saves.

Anything touching Azure's real endpoint still can't be covered — no key in the
repo, ever.

Deployment is GitHub Pages from `main`/`docs`. All paths are relative, so it
works from a subpath. Bump **both** `VERSION`s (`sw.js` and `js/version.js`)
when shipping changes or the phone will keep the old build — and Settings will
tell you which one you forgot.

---

## Deliberately not built yet (v2 ideas)

- **"Say it your way"** — the requested next feature: Mum attempts her own
  guess at how to say something, the app transcribes it (Azure STT), and
  explains — kindly — what a native would say instead, especially word-order
  habits carried over from British English (adjective placement, "¿Puedo
  tener...?" → "¿Me pone...?", unnecessary subject pronouns, etc.). Needs
  design: probably free-recording against a *situation* prompt rather than a
  fixed phrase, plus a small rules/examples table for common EN→ES transfer
  errors.
- Spaced repetition beyond the simple Repaso shuffle. Level two is the first
  half of it — cards get harder once known — but nothing decays, so a card
  learned in March is still "level 2, done" in August. A decay rule (and a
  demotion when a level-2 card is peeked at or failed) is the next step, and it
  belongs here rather than as a special case inside the drill.
- Xerra's Practice tab groups a deck's rows with a progress meter and an
  average. Mum's path shows per-lesson bests instead; if free-practice ever
  needs more shape than Repaso + Favourites, that's the pattern to port.
- More units as Mum's world grows (pharmacy, taxi, phone calls).

### Where the three forks still differ

Nothing is waiting to be ported now. What's left is deliberate:

- **The editor's AI rebuild handles replies differently.** Here `wireEditorAI`
  reports whether the card in the boxes is the assistant's rewrite, and Save
  drops the replies if it is, so the card offers *What might they say back?*
  again. Xerra fetches a replacement set instead and lets Undo restore the
  originals — better, and more moving parts. Either is defensible; don't
  "fix" one into the other without deciding which.
- **Deck list versus path.** Xerra browses by deck with an accordion and a
  merged search page; here everything hangs off the path plus a flat Phrases
  list. Sobre mí is the visible consequence: a deck row there, a unit with a
  workshop node here.
- **The content.** All three courses now differ on purpose. Xerra teaches
  Catalan. Deb-o-lingo teaches Castilian to an American speaker, around her
  week: the doorman, coffee, tapas, *para llevar*. This one teaches Castilian
  to a British speaker, around one specific fortnight (below). Nothing in
  `content.js` should be ported between the three without rewriting the
  focusNotes, which are the pedagogy and are aimed at a different mouth in
  each repo.
- **A fifth unit.** Deb-o-lingo has four; this has five, because the Christmas
  trip is a fixed occasion with its own vocabulary and deserved its own strand
  rather than being scattered through the others.
