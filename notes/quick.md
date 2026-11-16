# Quick

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

### Quick, and where its cards live

Ported from Xerra. One box, one button, the phrase, and a Listen you can hit
twice on the way in — for the moment you are outside a pharmacy and have about
as long as it takes to open the door.

- **`QUICK_DECK` is a deck name and nothing more**, exactly like `ABOUT_DECK`,
  and it buys the same one thing: somewhere of its own to be listed.
- **`ownUnit` skips both `ABOUT_DECK` and `QUICK_DECK`.** Without that, a Quick
  card would appear twice — behind its tile and again on the path under *Lo
  tuyo*. That filter is the load-bearing line here.
- **The card is saved as it arrives**, not on a "keep it" tap: the failure this
  guards against is the phrase scrolling away while you are talking. *Don't
  keep it* is the undo, and it is one tap.
- **No Worker change.** It calls the same `/complete-card` the Add page does.

#### Quick has to send its language and its deck

It shipped broken. The port dropped three fields from the `/complete-card`
payload — `deck`, `languageCode` and `languageName` — on the reasoning that
this fork has one language and Quick has one deck, so there was nothing to
choose. The Worker does not agree: `validateDraft` requires all three and
returns **400 "Choose a language and deck."** without them. Every ask failed,
with that message in the error box.

**They are not optional because the value is constant.** The Worker is shared
by three apps and validates the payload it is given, not the payload it could
have inferred. Anything calling `/complete-card` sends them.

**The wider lesson is about the tests, and it is the third time this shape has
bitten.** The suite had thirteen assertions on Quick and every one passed: the
box was there, the button was there, the page rendered, no console errors.
None of them pressed the button, because pressing it meant standing in a
Worker. `page.route` over `/complete-card` costs a few lines and is the whole
difference between "the screen is built" and "the feature works" — so the stub
now validates the payload **the way the Worker does**, and the test fails 9 of
13 against the broken version.

- A DOM assertion proves a control exists.
- A screenshot proves it can be found.
- Only exercising it proves it does anything.
