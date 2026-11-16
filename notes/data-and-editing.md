# What is data and what is code; editing and deleting

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

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

**The keyword pictures *are* edits, and that is the whole reason they cost no
new store.** A picture is a field on a card like `focusNote` is — `sounds` and
`picture` are in `EDITABLE`, so writing one over a course word is an override,
"Reset to the original" is the way back from a worse one, and a word she wrote
from scratch carries it in `mumolingo.phrases` with everything else. Compare
notes and replies below, which are the opposite case and needed stores of their
own.

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

**Deleting reaches the lesson too, and that is what the fix was.** The queue
holds decorated *copies*, not ids, so `removePhrase` on its own took the card
out of the library and left the lesson showing it with the bar still counting
it — reported in Xerra as "delete phrase has stopped working", which is exactly
what it looks like: the sheet closes, the card is gone from storage, and there
it still is. `deletePhrase(phrase)` is the one delete now — the phrase sheet's
armed button and the editor's both call it, and the editor's *is* the lesson's,
since the lesson bar's EDIT is what opens it. `dropFromQueue` is the half that
reaches the lesson: the card Mum is looking at stays the card Mum is looking at,
the index only moves when the current card is the one deleted (the next slides
into its place), and an emptied queue quits the lesson rather than leaving an
empty drill.

Worth asserting with three own cards seeded: deleting the one in view from EDIT
puts the next card in `.drill-text`, deleting the only card in a lesson puts the
path back, and the sheet's delete still takes two taps. Xerra has the same fix
in the same shape.

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
