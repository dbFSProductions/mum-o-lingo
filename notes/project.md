# The project: lineage, versions, the forks, what is not built

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

## Mum-o-lingo — working notes

A personal Spanish (es-ES) pronunciation trainer for one specific beginner,
Mum: five-minute lessons, Duolingo-flavoured UI, real pronunciation scoring.
Not for release; the audience is exactly two people.

`README.md` is for the people using it. This file is for whoever works on it.

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

- **The composer's dictate buttons.** Xerra has them; here they are gone,
  because Safari has no `SpeechRecognition` and they only ever pointed at the
  keyboard's own microphone. See *The composer has no dictate buttons*.

- **The editor's AI rebuild handles replies differently.** Here `wireEditorAI`
  reports whether the card in the boxes is the assistant's rewrite, and Save
  drops the replies if it is, so the card offers *What might they say back?*
  again. Xerra fetches a replacement set instead and lets Undo restore the
  originals — better, and more moving parts. Either is defensible; don't
  "fix" one into the other without deciding which.
- **Deck list versus path.** Xerra browses by deck with an accordion and a
  merged search page; here everything hangs off the path plus a flat Phrases
  list. Sobre mí is a home tile in both now; behind it, its cards are a deck
  there and `ownPhrases` in a named deck here.
- **The content.** All three courses now differ on purpose. Xerra teaches
  Catalan. Deb-o-lingo teaches Castilian to an American speaker, around her
  week: the doorman, coffee, tapas, *para llevar*. This one teaches Castilian
  to a British speaker, around one specific fortnight (below). Nothing in
  `content.js` should be ported between the three without rewriting the
  focusNotes, which are the pedagogy and are aimed at a different mouth in
  each repo.
- **A fifth unit.** Deb-o-lingo has four everyday units; this has five, because
  the Christmas trip is a fixed occasion with its own vocabulary and deserved
  its own strand rather than being scattered through the others. Both then
  carry Palabras on top.
- **The keyword pictures are in these two and not in Xerra at all.** The
  Palabras unit and the `sounds`/`picture` pair are additive — a unit, two
  fields in `EDITABLE`, one render helper and a hint button — so porting them
  to Xerra is a day's work and mostly writing scenes. The machinery here is
  Deb-o-lingo's, line for line; the pictures deliberately are not.

## v29: app.js split into modules

`app.js` had reached 4,600 lines. At v29 it was split into an entry point and
one module per page, the way Xerra's was at its v130 and Deb-o-lingo's at its
v62, with the same tool (`tools/split-app/split.js`, copied from Xerra's repo)
and this app's own plan (`tools/split-app/mumolingo.config.js`). No behaviour
was meant to change.

- **The tool moves code; it does not rewrite it.** One edit was made by hand
  first, because the tool demanded it: `let recorder` became `state.recorder`,
  since `toggleRecording` in `drill.js` replaces it and an imported `let` is
  read-only. The other two apps made the same change for the same reason.
- **`core.js` imports no page module**, so every page can lean on it at load
  time. `goHome` and `render` live in `app.js` because they need the pages.
- **The two cache-prefix reads a fork must rename are now in `settings.js`**
  (`showVersion`), not `app.js`.
- Checked with `tools/checks/smoke.js` before and after, `node --check`,
  ESLint `no-undef`, a line-for-line comparison against the old file, and an
  upgrade from v28 with its service worker installed, then offline. All of it
  headless, with Azure faked and the Worker stubbed.
