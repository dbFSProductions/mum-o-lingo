# Sobre mí

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

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
- **The tile breaks a rule on purpose.** Every other tile opens a list or a
  path; this one opens the interview, because the interview is the only way
  cards get into the unit, and the page lists the cards. It was a workshop
  node at the head of a unit on the path before it was a square on the home
  screen — see *Home is six tiles* above for why it moved.
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
- **The interview sits above the cards, the way Quick's ask box sits above
  what it made.** Asked for as *"put the about me chat above the about me
  cards … a similar layout to quick"*, and ported from Xerra the same day.
  The page opened on the practise button and every card, with the box you
  talk to underneath — so once there were thirty cards the thing the page
  is *for* was a screen and a half down. Now it reads: the chat card and
  Create, then *Your cards* with its Practise button and the rows. Nothing
  else moved — same ids, same handlers, same `paintLog` — so the assertions
  below hold as they were, plus one on the order: `#about-form` above
  `#about-make` above `#about-practise` above the first `.row`.

Xerra has all of this except the reset-button point, in the same shape. Keep
them in step; the divergences that are deliberate are the deck-vs-unit shape
(it has a deck list, this has a path) and the Spanish name.
