# Mum-o-lingo — working notes

A personal Spanish (es-ES) pronunciation trainer for one specific beginner,
Mum: five-minute lessons, Duolingo-flavoured UI, real pronunciation scoring.
You hear a native model, record yourself, and the app shows where the two
differ. Not for release; the audience is exactly two people, on iPhones.

`README.md` is for the people using it. This file is for whoever works on it.
It is deliberately short: the rules, the map, and an index. The reasoning
behind every feature is in `notes/` — read the relevant file before changing
that feature.

---

## Rules

1. **The phone runs the GitHub Pages build of `main` and nothing else.**
   Deployment is Pages from `main`/`docs`. Work goes in through a pull request
   (use `.github/pull_request_template.md`); until it is on `main` nobody can
   try it.
2. **Bump both version strings on any change under `docs/`**: `VERSION` in
   `docs/js/version.js` (`vNN`) and in `docs/sw.js` (`mumolingo-vNN`). Read
   `main`'s values when you merge and bump past them. A change that ships
   nothing to the phone (this file, `notes/`, `tools/`) needs no bump.
3. **Say the two version numbers** in the pull request and again when you
   report the work done — `js/version.js` first, then `sw.js`'s. Settings →
   *Version* (Running / Installed) is checked against them.
4. **A new file under `docs/js/` must be added to `SHELL` in `docs/sw.js`**,
   or the app breaks offline.
5. **Don't undo the service worker's two guards**: precaching with
   `cache: "reload"`, and network-first navigations. `notes/project.md`.
6. **`docs/js/content.js` is hand-written here** — no generator. **Phrase ids
   are stable** and referenced by saved attempts: never renumber, append
   (array position is what displays). `notes/content.md`.
7. **There is no Worker in this repo.** Every AI call goes to the Worker in
   `dbFSProductions/listen-record-learn`, shared by three apps. It validates
   what it is sent: anything calling `/complete-card` sends `deck`,
   `languageCode` and `languageName`; anything built for `chatContext` needs
   `language` and `deck`. A feature that needs a new endpoint needs a change
   and a deploy over there first.
8. **No build step, no `package.json`, no dependencies in the repo.** Vanilla
   ES modules loaded by the browser. Tooling (Playwright, acorn, ESLint) is
   installed outside it.
9. **Never commit a key.** The Azure key and the assistant passcode live only
   in localStorage. Anything touching Azure or the Worker is tested against
   fakes — say so plainly when reporting.
10. **The three sister apps share one browser origin** (`github.io` paths, not
    subdomains). The `STORE` keys, `DB_NAME`, the cache name in `sw.js` and
    the two cache-prefix reads in the version panel (`settings.js`) are all
    prefixed `mumolingo`; never read or write another prefix.
11. **Run the checks before merging**: `tools/checks/run.sh`. Add to them when
    you add a feature.
12. **Report honestly.** "Passes headless against a fake" is not "works on the
    phone". Name what was not tried.

---

## The map

```
docs/                 The PWA. GitHub Pages serves this folder from main.
  index.html          The shell. All UI is rendered from JS into #view.
  app.css             The one stylesheet. Palette shared with the sister apps.
  sw.js               Service worker: precache list (SHELL) and VERSION.
  js/                 See the table below.
  vendor/             Azure Speech SDK, fonts. Vendored on purpose.
tools/checks/         Headless checks (Playwright). run.sh runs them all.
tools/split-app/      The script and config that split app.js at v29.
notes/                Why things are the way they are. Indexed below.
```

### `docs/js/`

`app.js` was one 4,600-line file until v28. It is now the entry point and one
module per page. Older notes that say "in app.js" mean one of these.

| file | what is in it |
|---|---|
| `app.js` | Entry point. Boot (loads every store), `render()` — the dispatcher that picks a page from `state` — `goHome()`, and the one delegated click listener on `#view`. |
| `core.js` | Shared by everything: `view`, `state`, `player`, `esc`, `toast`, sheets, `armDelete`, `sayAloud`, `noVoice`, `starButton`, `homeLink`, `stopEverything`, `normaliseSentence`, `PASS_GREAT` / `PASS_OK`, the icons and the parrot. **Imports no page module.** |
| `path.js` | The home tiles and the path: `renderPath(section)`, `TILE_UNITS`, `PRACTICE`, `SECTION_TITLES`, the generated units (Lo tuyo, Sobre mí, Your words), `pathUnits` / `unitsFor` / `allUnits`, `findLesson`. |
| `drill.js` | `startLesson`, `startPractice`, `loadPhrase`, `renderDrill`, level two, the past-tense gate, recording, the banner, `deletePhrase`, `renderComplete`. |
| `score.js` | After an attempt: the comparison, the score card, the waveform and pitch canvases. |
| `ask.js` | `cardChatPanel` (the ask box in the drill, the sheet and the Add review), `chatContext`, the kept notes. |
| `replies.js` | "What might they say back?": showing, fetching and keeping replies. |
| `pictures.js` | Keyword mnemonics: the picture block, the gender cue and field, drawings, the picture prompts, Imagine it again. |
| `add.js` | Add a word (`renderAddWord`) and Add a card (`renderAdd`). |
| `quick.js` | Quick: the ask box and the card it saves. |
| `phrases.js` | All Phrases, the phrase sheet (`showPhrase`), the editor (`editPhrase`) and its AI rebuild. |
| `about.js` | Sobre mí: the interview and the cards it writes. |
| `settings.js` | Settings, the version panel, the storage line. |
| `store.js` | All persisted data and its rules: `library`, `settings`, `progress`, `aboutMe`, `attemptScore`, `ASPECTS`, `genderOf`, IndexedDB. |
| `speech.js` | Azure synthesis and scoring, the browser-voice fallback. Same behaviour in all three apps. |
| `audio.js` | Recorder, Player, the speech detector, waveform and pitch analysis. **Verbatim copy in all three apps.** |
| `card-assistant.js` | The client for every Worker endpoint. |
| `content.js` | `COURSE` (units → lessons → phrases). Hand-written, and the one file that is wholly this app's own. |
| `version.js` | `VERSION`. |

To find where something lives: `grep -n "function name" docs/js/*.js`.

---

## How the app is put together

- **One render loop.** `state` (in `core.js`) says where you are; `render()`
  (in `app.js`) reads it and calls one `renderX()`, which replaces
  `view.innerHTML` and wires its own listeners. To navigate: set `state`,
  call `render()`.
- **`state.tab`** is `learn`, `add`, `add-word` or `settings` (there is no
  tab bar; the name is historical). Inside `learn`, **`state.stage`** is
  `path`, `drill`, `complete` or `about`, and **`state.section`** is which
  tile you are behind: `null` for home, `practice`, `words`, `past`,
  `phrases`, `quick`. `state.lesson` is the queue being drilled.
- **Tiles are a filter over one path renderer.** `renderPath(section)` draws
  home, Practice, Words and The Past; there is deliberately no second renderer.
- **Course content is code; what Mum does to it is data beside it**, keyed by
  phrase id: her own cards, overrides (a diff of edited fields), favourites,
  attempts, progress, notes, replies, the interview. Read a
  phrase through `library.decorate()` or her edit is invisible.
- **Cards made by features are ordinary cards** carrying a deck name
  (`ABOUT_DECK`, `QUICK_DECK`, `WORDS_DECK`). No flags, no special kinds.
- **Storage** is `localStorage` (`mumolingo.*`) and IndexedDB for blobs
  (recordings, cached model audio, drawings). Export / import in Settings is
  the only backup: if you add a store, add it to both.

---

## Things that have already bitten — check these first

- **`hidden` loses to `display`.** An element whose CSS sets `display: flex`
  needs its own `[hidden] { display: none }` rule (the `.sheet` trap).
- **Never add a listener to `view` inside a render function.** `view` is never
  replaced, so it multiplies. Listeners go on elements the render just made,
  or in the one delegated listener in `app.js`.
- **The lesson queue holds decorated copies, not ids.** After
  `library.setReplies` / `keepNote` the caller assigns the result back onto
  the copy it holds; `setPicture` and `deletePhrase` reach the queue for the
  same reason.
- **Do not call `render()` to update something small in the drill.** It takes
  the attempt and the chat off the screen. Repaint the one element.
- **A value another module must change goes on `state`.** An imported `let` is
  read-only; that is why the recorder is `state.recorder`.
- **`core.js` must not import a page module.** Page modules import each other
  and `app.js` freely (cycles are fine for functions called later), but a
  top-level `const` that needs another page module's `const` at load time
  throws "Cannot access before initialization". The smoke check catches it.
- **A field missing from `EDITABLE` in `store.js` is dropped on save without a
  word** when a course card is edited.
- **"Did the user write this?" cannot be answered by "is it non-empty"** on a
  field the app also writes to. Remember what the app wrote and compare.
- **Stale service worker.** "My change didn't apply" is nearly always this:
  both version strings bumped? The checks run with the worker blocked.
- **Anything added to the drill card must pick a side of the gate.** While a
  question stands (level two, the shape gate) nothing that gives
  the answer may show — Listen, the tip, notes, replies, the ask box.
- **iOS only.** Chromium is where the checks run, not where the app lives.
  Safari has no `SpeechRecognition`, may accept a browser-voice utterance and
  never say it, and may not encode WebP.
- **A DOM assertion proves a control exists; a screenshot proves it can be
  found; only exercising it proves it does anything.** Stub the Worker with
  `page.route` and press the button.

---

## Design decisions to keep

Each has a full argument in `notes/`. Do not reverse one without reading it.

- **The score is the weakest word in the attempt** (`attemptScore`), not any
  Azure aggregate.
- **Nothing is locked.** Ticks and the streak record; they never gate.
- **Level two is read off the attempts** (four good goes), and nothing
  demotes.
- **The answer is withheld until you commit**: the Spanish at level two, the
  sentence behind the shape gate.
- **The course is built round one fortnight** — the Christmas trip — and the
  El pasado sentences are Mum's own past, not Deb's.
- **Big Worker outputs get their own endpoint.** `/complete-card` stays small
  and fast; replies, the interview, the batch of cards and the drawing are
  separate calls that can fail separately.
- **Nothing is drawn unasked.** Imagining the scene is the method.
- **Port the machinery between the forks, never the scenes or focusNotes** —
  they are aimed at one mouth and one life.
- **Check audio changes numerically**, on clips with a speech-like crest
  factor, never by recording in a quiet room. `notes/audio.md`.

---

## Running and checking

```bash
cd docs && python3 -m http.server 8765 --bind 127.0.0.1   # http://127.0.0.1:8765
tools/checks/run.sh            # every headless check; serves docs/ itself
tools/checks/run.sh smoke      # one of them
```

`tools/checks/` needs Playwright installed globally (it is not a repo
dependency); `run.sh` sets `NODE_PATH` to the global npm root.

- `smoke.js` walks every page — a lesson with a recording scored by a fake
  Azure, Words and Add a word, the shape gate behind The Past, Sobre mí,
  Quick, All Phrases and the editor, Add a card, Settings —
  and fails on any console error. Run it after every change: a missing import
  shows up here.
- `lib.js` has the helpers: `open()` (a fresh phone-sized page, service worker
  blocked, settings seeded under `mumolingo.settings`), `stubWorker()` (answer
  the card assistant), `fakeAzure` (a stand-in Speech SDK), `toneWav()`,
  `tally()`.

**When you add or change a feature, add a check for it** as
`tools/checks/<feature>.js`. What older features were asserted on is in prose
in `notes/checks-history.md`; turn the relevant list into a script when you
next touch that feature.

A static check worth running after moving code between modules (ESLint
installed outside the repo): the `no-undef` rule over `docs/js` must report
nothing.

---

## The sister apps

`dbFSProductions/listen-record-learn` (Xerra, Catalan) came first and holds
the shared Worker; `deb-o-lingo` forked it; this app forked that. `audio.js`
is the same file in all three, `speech.js` the same behaviour, the palette the
same values. Xerra was split into modules at its v130, Deb-o-lingo at its v62
and this app at v29; the module lists differ because the pages do. `notes/project.md` has the lineage
and the deliberate divergences.

---

## Notes index

Read the file before changing the feature. Each is the history and reasoning
as it was written at the time, newest additions at the end.

| file | read it before touching |
|---|---|
| `notes/project.md` | Lineage, the shared origin and what a fork must rename, the two version strings, what is not built, where the forks differ. |
| `notes/home-and-navigation.md` | The header, the six tiles, the path, sections, list colours, page heads. |
| `notes/content.md` | `COURSE`: the trip it is built round, ids, lesson size, focusNotes. |
| `notes/data-and-editing.md` | The stores, overrides, `decorate()`, deleting, the editor and its AI rebuild. |
| `notes/drill.md` | The drill card, the ask panel and kept notes, the weakest-word score, level two. |
| `notes/grammar.md` | El pasado: the dot-or-line gate, its colours, its sentences. |
| `notes/vocab-pictures.md` | Palabras, Add a word, keyword pictures, drawings, gender, Imagine it again. |
| `notes/replies-and-add.md` | Replies, the composer, the Add review. |
| `notes/quick.md` | Quick, and what `/complete-card` must be sent. |
| `notes/about-me.md` | Sobre mí: the interview and its cards. |
| `notes/audio.md` | Listen's silent failures, the trim, playback levelling, crest factor. |
| `notes/checks-history.md` | What each feature was asserted on when it shipped. |

**Keep this file short.** When you finish a piece of work, add the reasoning
to the end of the right `notes/` file and, only if a rule, the map or the
state below changed, update this one.

---

## State

- **v29 / `mumolingo-v29`** — `js/version.js` first, `sw.js` second.
- Home is six tiles: Practice, Words, Sobre mí, Quick, The Past, All Phrases;
  plus the streak and the cog.
- The course is five units behind Practice (Saludos, El cava, El restaurante,
  El mercado, La Navidad), El pasado (four lessons) behind The Past, and
  Palabras (six lessons, twenty-nine words) behind Words.
- Azure (key on the phone) does voices and scoring. The shared Worker does
  every AI call and the drawings.
- v29 was a refactor with no intended change in behaviour: `app.js` split
  into modules, checks added under `tools/checks/`, these notes reorganised.
- Not here, though Deb-o-lingo has them: Review, quiet mode, Prizes, Match,
  Stories. Not built anywhere: "Say it your way". `notes/project.md`.
