# What each feature was asserted on when it shipped

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

## Running and checking

```bash
cd docs && python3 -m http.server 8765   # http://127.0.0.1:8765
```

Playwright against that URL beats clicking through. Worth asserting: no
console errors on boot, the path shows 21 course nodes + Repaso with **nothing
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
For Sobre mí: `[data-about]` is a home tile before the unit has cards and is
still there with no assistant configured, reading *Needs the card builder* and
opening a page that links to Settings; there is no `#about-open` and no
`[data-lesson^="about-"]` on the path, seeded or not; home has six `.tile`s and
no `.tile-wide`; with an assistant, opening the tile fires exactly one
`/interview` by itself, `#about-make` is disabled until a learner turn exists,
a batch containing a punctuation-only repeat adds one fewer than it returned,
the made cards are ordinary phrases with `deck === "Sobre mí"` that the Sobre mí
page lists and All Phrases lists too, the transcript survives a reload without
a second `/interview`, and `#about-reset` takes two taps and leaves the cards
alone. For the version panel: `#s-running` and `#s-installed` agree after a
clean install. Two smoke scripts covering all of that live in the session
scratchpad rather than the repo — there's no test runner here on purpose.

For the keyword pictures: `palabras-1` opens on "el tenedor" with a
`.picture-note` carrying its `.picture-sounds`, and no `#picture-hint`;
`saludos-1` has neither; with *Show the meaning up front* off the picture waits
for `#reveal` alongside the translation. Seed four passing attempts on
`palabras-1-1` and the same card offers `#picture-hint` with no `.picture-note`
— pressing it paints the picture while `.drill-text` still reads *the fork*,
`#listen` is still absent and the "Shown, not remembered" line is still off the
card, which is the assertion that says peeking and picturing are different
things. Searching Phrases for `ten-a-door` finds the word by its `sounds`
alone; the sheet prints `.picture-note` flat; editing it writes an override
holding `picture` and `sounds` and nothing else, the lesson drills the edited
scene, and Reset empties the store. With `/chat` stubbed: the two labelled
lines land in `#f-sounds` and `#f-picture`, an unlabelled reply lands whole in
`#f-picture`, half a card refuses with a toast, a 503 is reported in
`#f-picture-note` with the boxes untouched, and Cancel writes nothing.

With `/picture` stubbed: no draw button at all with no assistant configured;
`.picture-draw` is offered on a card with a scene and nothing is fetched until
it is pressed; one press paints `.picture-image` from a blob URL; a reload
shows it again with no second call; the blob in the `pictures` store is an
image and smaller than what was sent; the sheet's `[data-undraw]` takes it out
of storage and puts the offer back; and a 503 lands in `.picture-art-error`
with the offer still there. For the gender cue: `el tenedor` reads *Paint the
fork blue* with a `.gender-dot.gender-m` and `la cuchara` reads *pink* with
`.gender-f`; `genderOf` returns null for *La cuenta, por favor*, for `tener`,
for `¿dónde?` and for `hoy`, and `f` for `el agua`, which is the assertion
`EL_BUT_FEMININE` exists for; the drawn request carries `card.gender`;
`#f-gender` opens on *From the article — masculine* and picking Feminine
repaints the line **and survives the save**, which is the one that fails if
`gender` is left out of `EDITABLE`. For the redraw: `[data-redraw]` is in the
drill as well as the sheet and `[data-undraw]` only in the sheet, a 503 on a
redraw leaves `.picture-image` on screen with the error beside it and the
button still offered, and the next good one clears it. The Worker half now has a committed test rather
than a scratchpad one — `worker/tools/picture-test.mjs` in Xerra's repo, which
drives `worker.fetch` with `globalThis.fetch` stubbed and needs no key, no
network and no money. It covers the Replicate request shape, both output
shapes, the base64 chunking, the error mapping (402 out of credit, 404 wrong
model, 429 rate-limited, a prediction still running at 45s), and that pulling
`REPLICATE_API_TOKEN` puts it back on the Gemini path. Whether the picture is
any *good* is the other tool, `worker/tools/draw-one.mjs`, which spends a cent
and writes a file to look at.

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

For the Add review: `.dictate` and `[data-dictate]` match nothing anywhere in
the app and the three boxes still carry their `lang` (`es-ES`, `en-US`,
`en-US`), the preview line follows an edit to the Spanish box, a
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
