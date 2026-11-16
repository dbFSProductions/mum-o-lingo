# Words: Add a word, keyword pictures, drawings, gender

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

#### The field asks "el or la?", and a regenerated picture is ours to replace

Two things reported together, both about Add a word.

**The gender field said "From the article".** That names the *mechanism*; the
question in your head when you file a word is **el or la**, and the answer is
also which colour the picture gets painted. So `GENDERS` carries an `article`
now and the field reads *El — colour it blue* / *La — colour it pink*, with
*El or La — colour it blue or pink* while it cannot tell. The override options
are *Always el* / *Always la*, which is what distinguishes them from the
automatic one when it has worked the answer out.

**And the picture stopped following the card.** *Never overwrite yours* was
measured by "is the box empty" — so the moment we filled it, the next press
treated our own sentence as the user's and kept it. Change the English, press
again, and every field refilled except the picture, which went on describing the
old word. Reported exactly that way.

`lastMade.picture` is the fix: we remember what we put there. Untouched since,
it is ours to replace; edited at all, it is yours and it stays. **The general
shape is worth keeping** — "did the user write this?" cannot be answered by
"is it non-empty" on any field the app also writes to.

#### The colour carries the gender, so the words don't have to

**That is the whole point of the blue and the pink** — and the picture prompt
was never told. So it spent the bridge and the scene on *el* and *la*, encoding
in words the one thing the drawing already says in colour, and the mnemonic paid
twice for it.

`PICTURE_BRIEF` now says it: on a noun, the gender is carried by the colour the
object is painted, so keep the article out of **both** lines and build the
bridge and the scene from the noun itself.

#### Every box the app writes to needs the same question asked of it

*Fill in the rest for me* skipped the completion whenever both language boxes
were full — an optimisation that was exactly wrong, because **after the first
press both boxes are always full**. Change the English and the word never
followed; it sat there answering the question you had just stopped asking.

`lastMade` now holds all four fields, and the rule is the same one the editor's
AI rebuild uses: **whichever side is *yours* is the brief, and the other is
dropped so it gets written again.**

- You edited the English → send the English alone, the word is rewritten.
- You edited the word → send the word alone, the English is rewritten.
- You typed both yourself → nothing of ours to refresh, so no call at all.
- Sounds and picture the same: ours to replace, yours to leave.

**The general rule, now three bugs deep:** *"did the user write this?"* can
never be answered by *"is it non-empty"* on a field the app also writes to, and
it cannot be answered by *"is anything missing"* either. Remember what you
wrote, and compare.

#### "Don't know" is the first option, and the reading goes underneath

The slot read *El or La — colour it blue or pink*, which is **a description of
the other two options sitting where a choice should be** — the list offered
three things and two of them were the same two things. What that slot means is
"I am not telling you; read it off the article", and the honest word for that is
**Don't know**.

What the app has worked out moved *under* the select, as `genderHint`: *Reading
"el" — the picture will be blue.* Feedback, not a fourth thing to weigh up. It
follows both the word box and the select, so choosing an override says what the
override will do.

#### Two bugs the same press produced

- **The `/chat` call carried no language.** `chatContext` builds `languageCode`
  from `phrase.language`, and *Fill in the rest for me* handed it a bare
  `{ text, translation }` — so the Worker refused it with **"Choose a language
  first."** every time, after the first call had already filled the word in.
  The editor's picture button always passed `language`; this one never did.
  **Anything built for `chatContext` needs `language` and `deck` on it**, and
  the object is usually assembled by hand rather than being a real phrase, which
  is exactly why it gets forgotten.
- **A completed word came back as a sentence.** *"dog"* returned **"Un gos."**,
  full stop and all — `/complete-card` writes phrases, because that is what it
  is for. That is not cosmetic: **`genderOf` refuses any text containing
  punctuation**, so the trailing stop silently cost the card its gender, which
  is the one thing this screen exists to get right. Two guards, because either
  alone is thin: the `situation` now says it is a single vocabulary word with
  its article and not a sentence, and `stripTrailingStop` takes the punctuation
  off the end whatever comes back. Only the *end* — an interior comma would mean
  it really was a phrase.

#### An adverb has no article, and the brief said every word did

*Ahora* filed through Add a word came back as **el ahora**. The situation
sent to `/complete-card` said the word was to be *"given with its article"*,
flat, because that line was written to stop *"dog"* coming back as a
sentence — and on a noun it is right. On anything else the model did what it
was told and invented one. That is not cosmetic twice over: the card then
drills a word nobody says, and `genderOf` reads the invented article and
paints an adverb blue.

`SINGLE_WORD_SITUATION` in app.js is the whole of the fix: a noun comes with
its definite article, anything else — adverb, verb, adjective, question
word — comes bare and is never given one. Same line in all three apps.

### Add a word, and where your own words live

The Words section was read-only: Palabras is course content in `content.js`, so
there was no way to add one at all. Now it carries **Add a word**, and what you
add lands in `WORDS_DECK` — an ordinary deck name like `ABOUT_DECK` and
`QUICK_DECK`, buying the same one thing: somewhere of its own to be listed.

- **`unitsFor(section)` returns a list, and Words is why.** That section draws
  the course unit and then **Your words** underneath it, so a word you added is
  where you would go looking for it rather than filed under *Lo tuyo* with your
  phrases. Every other section is one unit; this returns a list so that stays
  true without a special case downstream.
- **`ownUnit` now skips three decks** — Sobre mí, Quick and Words. Each has
  somewhere of its own, and a card in two places is the bug this prevents.

**One side is enough.** You have heard a word and don't know what it means, or
you know the meaning and want the word — whichever you have is enough to start,
and *Fill in the rest for me* does the other side, the gender, the sound bridge
and the scene in one press. Two calls in order: `/complete-card` for the missing
side, then `/chat` for the picture, built from the **completed** word. A picture
you wrote yourself is never overwritten — only `sounds` is taken then. The
gender needs no call at all: it is read off the article, which is why the
completion dispatches an `input` event rather than only setting `.value`.

Ported from Xerra, where the same screen keeps a deck field because its Vocab
is decks you can file into. Here there is one pile, so the field goes.

## A word, a sound and one ridiculous picture

The **Palabras** unit (six lessons, twenty-nine words, purple) is vocabulary by
the keyword method: you hear an English sound inside the Spanish word, and you
build one absurd scene out of that sound and the meaning. `tenedor` sounds like
"ten-a-door", so a ten-pound note is pinned to the front door and the nail is a fork. It is
the request this app was asked for in exactly those words, and it is the one
unit here that teaches single words rather than things you say.

- **Two fields, and the split is load-bearing.** `sounds` is the bridge — what
  the word sounds like in English and nothing else. `picture` is the scene, and
  its one job is to contain **both** the sound and the meaning, so that
  recalling the scene hands back the word. A scene with the sound but not the
  meaning is useless; so is a pretty one with neither. `picture` alone renders;
  `sounds` alone renders nothing, being a riddle with its answer torn off.
- **Never bridge to a sound the word hasn't got.** `llave` is not "lava",
  however good the picture would be. A mnemonic that teaches a mispronunciation
  is worse than no mnemonic, and this app scores pronunciation for a living.
  The `focusNote` still does the real work; the picture only has to get her to
  the word. The rules for writing more of them are in the unit's own comment in
  `content.js`.
- **They are ordinary editable fields, not a new store.** That buys the
  editor, the override diff, Reset, export and import for nothing — and it
  means *any* card can carry a picture, not just a Palabras word, which is
  where most of the value ends up: a picture on the one word inside a phrase
  she keeps losing. Resist making them a special kind of card, for the reason
  Sobre mí gives above.
- **The drill's gates, and the picture takes a third position.** At level one
  it waits behind `showTranslation` like the notes do — the scene names the
  English, so printing it under a hidden meaning would be pointless. At level
  two it is *the point*: the Spanish is being withheld and the picture is the
  road back to it, so it is offered as **Show me the picture** rather than
  shown, above the plain **Show me**.
- **Reaching for the picture is not peeking.** `state.pictured` is its own
  flag and deliberately does not set `peeked`: Show me hands over the answer,
  the picture makes her produce it, and that is the method working exactly as
  intended. The attempt is still filed as `"recall"`. The hint button is tinted
  (`.btn-picture`) and Show me is left plain, because the hierarchy is the
  pedagogy.
- **"Invent a picture for me" goes through `/chat`, and that is not laziness.**
  The Worker lives in Xerra's repo and serves all of these apps, so a feature
  needing a new endpoint needs a deploy over there first. This one needs
  nothing: it is one turn of the same conversation `cardChatPanel` already has,
  with the question written for her instead of by her. The answer is asked for
  as two labelled lines and parsed back into the two boxes; a model that
  ignores the format costs only the split, since the whole reply lands in
  Picture. **Don't "improve" this into a `/complete-card` field or an endpoint
  of its own** without reading what replies did to the Add tab.
- **The scene gets drawn, and only when asked.** `/picture` on the
  Worker turns the `picture` sentence into an image; the drawing is kept in
  IndexedDB by phrase id and shown inside the same block, behind the same
  gates, as the text. It is never fetched on its own initiative, and that is
  the pedagogy rather than the bill: imagining the scene yourself is the
  technique working, and a picture handed over unasked removes the effort that
  makes it stick. The sentence stays the mnemonic; the drawing is for when the
  scene will not come.
- **The drawing is its own endpoint, its own model and its own failure.** An
  image is the biggest, slowest thing the Worker produces, so it earns an
  endpoint for the reason replies did — see what putting them on
  `/complete-card` cost. It gets 40s rather than the 25s sized for a card.
  **This one did need a Worker change**, unlike everything else in this unit —
  the Worker lives in Xerra's repo and `worker/**` is on a deploy trigger, so
  merging it there ships it for all three apps at once.
- **It draws through Replicate, on Gemini's own image model.** The first
  shipped version called Gemini's API directly and had never actually drawn
  anything — written from the API reference against a response nobody had seen,
  since there is no Gemini key in any of these repos. The Replicate path was
  checked end to end on the real Palabras cards before it shipped.
  Which model was the surprise. Diffusion models don't honour "no lettering"
  and they draw any word you name them, so flux-schnell captioned *el tenedor*
  with **"el tenddor"** and ideogram wrote the Spanish out in a speech bubble.
  A misspelling of the word being taught is worse than no picture — the same
  argument as *never bridge to a sound the word hasn't got*, one layer down.
  `google/nano-banana-2` is Gemini's image model reached through Replicate, so
  it follows the instruction and **`buildPicturePrompt` did not change.** The
  table in `worker/README.md` is what to re-read before swapping it for
  something cheaper.
- **Nothing in this repo changed when the provider did.** Replicate answers
  with a URL rather than bytes, so the Worker fetches the file and base64s it;
  what arrives here is still `{ image: { data, mimeType } }`. No client change
  and **no version bump** — `sw.js` and `js/version.js` are for changed assets,
  and none changed. Provider is chosen by which credential the Worker holds
  (`REPLICATE_API_TOKEN`), deliberately not as a fallback chain: an unverified
  path underneath a verified one turns "the drawing failed" into two possible
  stories. Unsetting the token is the way back to the Gemini path.
- **Third IndexedDB store, so `DB_VERSION` went to 2.** The upgrade handler
  creates whatever is missing, so an existing install keeps its recordings and
  cached audio and gains the box. Drawings are not in the export, for the same
  reason recordings aren't: blobs stay on the device, and a restored backup
  offers to draw them again.
- **Blue for masculine, pink for feminine, painted on the object the word
  names.** Every mnemonic system that teaches gendered nouns bakes a fixed cue
  into the scene — Linkword puts a boxer in every masculine one and perfume in
  every feminine one, Fluent Forever puts the two genders in two different
  rooms — and colour is the popular one. It is also the weakest of the three as
  *prose*, because a colour is not an event; what rescues it here is that these
  scenes get **drawn**, and a pink fork is legible in a thumbnail without
  reading a word. One object is coloured, never the whole scene: a wash over
  everything competes with the picture it is supposed to be marking.
- **The gender is read off the card's own article**, so no course content had
  to learn about it and a noun typed into the editor gets the cue for free.
  `genderOf` in store.js is the one reader. It refuses to guess at anything
  that isn't a noun phrase — *La cuenta, por favor* also starts with *la* — so
  a sentence, a verb, an adverb or a question word is left alone rather than
  mislabelled, which is most of this unit outside A la mesa and En la calle.
- **`el agua` is the one Spanish word class the article lies about.** Feminine
  nouns opening on a stressed a- take *el* in the singular — it is *el agua
  fría* — so `EL_BUT_FEMININE` in store.js corrects the common ones and
  `phrase.gender` overrides anything past them. This is what Xerra's `l'`
  problem looks like over here: the word whose gender you cannot read off the
  article in front of it. Deliberately a short list rather than a lexicon.
- **`gender` had to be added to `EDITABLE`, and that is the fork-specific
  half.** A course card's edits are stored as an override of the fields in that
  list, and a field missing from it is dropped on save without a word — so the
  editor's new select looked like it worked and changed nothing. Xerra has no
  such list, its phrases being ordinary rows, so this is the one part of the
  port that isn't a copy.
- **The colour is carried by a swatch dot, not by the lettering.** Neither
  `--blue` nor a pink of the same weight clears 4.5:1 as small text, and a cue
  you have to decode from the shade of the type is a worse cue than one that
  says *pink* out loud. The line reads as an instruction — *Paint the fork pink
  in the scene* — because that is a thing you do to the scene you are already
  imagining, where "feminine · pink" would be a second thing to memorise beside
  it. `--pink` is new in the palette and Xerra has the same variable.
- **The Worker needed no change**, because Xerra shipped the optional `gender`
  paragraph in `buildPicturePrompt` with its own copy of this. Sending the
  field is all this app had to do, and a card with no gender to draw sends `""`
  and gets the prompt it always got.
- **Draw it again is offered wherever a drawing is, the drill included.** What
  comes back is one roll of a stochastic model and *that isn't it* is the
  commonest thought on seeing it, so the redo belongs where you are looking at
  the picture — which is mid-drill, not on the phrase sheet. The sheet keeps
  **Remove the drawing**: throwing one away is tidying up, not trying again.
  A failed redraw repaints the drawing you had rather than the offer — the blob
  is still in the store, so showing *Draw this for me* would be a fright and a
  lie at once.
- **What comes back is shrunk before it is kept** — 512px, WebP where the
  browser will encode it. A full-size render per word would outweigh the rest
  of the app on a phone whose storage iOS is willing to evict.
- **`outputImageOf` on the Worker reads the response forgivingly, and that is
  not sloppiness** — though it is now only on the *fallback* path, and nothing
  on the Replicate path calls it. There is no Gemini key in any of these repos
  and no image fixture to replay, so that path could not be exercised before it
  was deployed; it accepts the bytes from `output_image` or from a
  `model_output` step, under either spelling of the field names. If Google
  moves them, that function is the fix and *"the model drew nothing"* on the
  phone is what points at it.
- **Two output shapes on the Replicate side, and the difference is invisible
  until it 500s.** `nano-banana-2` answers with a bare URL string;
  `flux-schnell` answers with an array of them. The Worker takes either.
- **It sits in the editor, not on the sheet.** One implementation, reachable
  from the phrase sheet's Edit and from the lesson's EDIT alike, and it lands
  where the result can be rewritten — which matters, because a picture
  Mum invents herself outlasts one she was handed. Nothing is written until
  Save.
- **Purple is the colour, and it was already spoken for.** Purple is what
  memory looks like in this app: the level-two badge, Lo tuyo. `--purple-ink`
  is new and is purple *as lettering*, on the `--amber` precedent — `--purple`
  is a fill and vanishes as small text on white.

The other fork has this unit too, with the same code and deliberately different
pictures: hers are pounds and the Christmas trip, Deb's are dollars and her own week. Port the machinery, never the scenes — a picture is
aimed at one mouth and one life, the same way a focusNote is.

### Imagine it again

Ported from Xerra (#49). A redraw is for a picture that came out wrong; this is
for one that was never right — a bridge you don't hear in the word, or a scene
that simply doesn't stick, which is the failure that actually costs you the
word. Until now the only way out of it was Edit, *Invent a picture for me*,
Save: four taps and a screenful of small print away from the moment you notice,
which is mid-lesson with the card in front of you.

- **It sits at the foot of the picture block**, in both places a picture is
  shown, next to the drawing's own *Draw it again*. The two act on different
  things: that row acts on the picture you are looking at, this on the sentence
  the whole block is.
- **Nothing is confirmed first and the old scene is offered back in one tap.**
  What comes back is one roll of a model and may well be worse, and a course
  scene was written for one mouth and one life. One step back, not a history:
  roll twice and a second undo would be restoring a scene already rejected.
- **The undo sits in the row, not inside the sentence announcing the new
  scene**, so a second roll failing doesn't take the way back off the screen
  with the message it was written into.
- **An existing drawing is left alone and said to be stale.** Deleting it
  destroys something you may still want; keeping quiet about it leaves a
  drawing of a scene that no longer exists.
- **It goes through `/chat`, not `/picture`.** `/picture` draws a scene, it
  doesn't write one — and a new endpoint would mean a Worker deploy that serves
  all three apps. `reimagineRequest` is the same brief with the rejected scene
  named in the *middle* of it, since an instruction arriving after "nothing
  before or after them" invites a third line. It asks for a new bridge only
  where the word honestly offers one: on a word with one honest English sound
  in it, insisting on a new bridge is insisting on a wrong one.
- **The editor's button learned the same thing.** On a card that already has a
  scene it reads *Imagine another one* and sends the rejected one, so it can no
  longer hand back the scene you pressed it to escape. It reads the scene out of
  the boxes rather than off the phrase, because the boxes are what the card is
  about to become.

**One divergence from Xerra, and it is the storage model.** Over there
`setPicture` takes an id and mutates the phrase in the library. Here a course
phrase is code, so it takes the phrase *object* and goes through
`updatePhrase`, which already knows how to write a course phrase as an override
and a custom one in place. It still mutates the object, for the same reason
Xerra's does: the lesson holds decorated copies in `lesson.queue`, so the card
you re-imagined would otherwise carry on showing the scene it was rendered with.
