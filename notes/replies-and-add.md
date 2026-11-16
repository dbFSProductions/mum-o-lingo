# Replies, and the Add page

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

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
- **Every reply offers *Keep as a card*.** A reply is a phrase somebody
  actually says, and the one you keep hearing is the one you will want to be
  able to say — so the way from "I like this one" to a card of your own is one
  tap, on the reply, rather than retyping it into Add. `keepReply` in app.js is
  the whole of it: the reply's text and English become the card, the phrase it
  answers is written into the situation (that is exactly what a situation is
  for), no focusNote because nobody has written one — the editor's AI rebuild
  is there for that. It lands with your other cards under Lo tuyo whatever the
  card it answered was: a reply to a Quick phrase is not a Quick phrase, and a
  reply to a Sobre mí card is not about you. *Kept as a card ✓* is read off
  `allPhrases()` at render (`replyKept`), so it survives a re-render and a
  reload, and a duplicate is refused on the button rather than in a toast.
  `wireReplies` takes a `source` read at the tap, not at wiring, because on the
  Add review the phrase box is still being edited. Ported from Xerra.
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

### The composer has no dictate buttons

Each of the three boxes used to carry a green microphone beside its label,
running the Web Speech API's recogniser into the field. They are gone, and the
reason is that on the one device that matters they never worked: Safari does
not implement `SpeechRecognition`, so on Mum's phone every one of them fell
through to a toast saying *use the microphone on the keyboard instead* — a
button whose whole job was to point at a different button.

What does the work now is `lang` on the textarea, which was already there:
`es-ES` on the Spanish box and `en-US` on the other two, so the keyboard's own
dictation key types the right language into whichever box has the cursor. That
is the same arrangement Sobre mí's answer box has always relied on. The
situation box gained an explicit `lang="en-US"` in the same change, since it had
been leaning on the page default.

Removed with them: `micIcon`, `startDictation`, `state.dictation` and its abort
in `stopEverything`, the `.dictate` rules and the `dictation-pulse` keyframes.
`.field-head` went too — it existed to put a label and a button on one line, and
with the button gone the composer's labels are styled by `.add-card .field > label`
instead. The boxes stay `div.field` rather than `label.field`, because the
composer's spacing comes from the "or" divider and `label.field`'s bottom margin
would break it.

**Xerra still has the buttons.** That is now a deliberate divergence rather than
a port waiting to happen; don't bring them back as a "keep them in step" fix.

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
