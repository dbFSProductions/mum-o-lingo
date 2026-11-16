// The home tiles and the path: units, sections, lessons, and the nodes at the end of the course.

import { COURSE, LESSONS, lessonById } from "./content.js";
import { library, settings, progress, ABOUT_DECK, QUICK_DECK, WORDS_DECK } from "./store.js";
import {
  COG_SVG, STAR_SVG, esc, flameSVG, homeLink, parrotSVG, shuffle, state, stopEverything, toast, view,
} from "./core.js";
import { render } from "./app.js";
import { startLesson, startPractice } from "./drill.js";

// -------------------------------------------------------------------- path

/* Mum's own cards ride the path as a unit of their own, chunked into
   lesson-sized bites like the course units. The chunking follows creation
   order, so adding a card extends the last lesson or starts a new one and the
   earlier ids stay put; deleting one can reshuffle membership, which only
   costs a completion tick on a lesson she made herself. */
const OWN_UNIT_ID = "propias";
const ABOUT_UNIT_ID = "sobre-mi";
const OWN_LESSON_SIZE = 5;

/** Chunk a run of her own cards into lesson-sized bites, in creation order. */
function chunkLessons(phrases, prefix, name) {
  const lessons = [];
  for (let at = 0; at < phrases.length; at += OWN_LESSON_SIZE) {
    const number = lessons.length + 1;
    lessons.push({
      id: `${prefix}-${number}`,
      title: phrases.length <= OWN_LESSON_SIZE ? name : `${name} ${number}`,
      phrases: phrases.slice(at, at + OWN_LESSON_SIZE),
    });
  }
  return lessons;
}

/** Her own cards, minus the ones the interview wrote — those get their own
    unit below, so the two lists can't shuffle each other's lesson ids. */
function ownUnit() {
  /* Sobre mí and Quick both have somewhere of their own to be listed, so a
     card of theirs on the path here would be the same card in two places. */
  const phrases = library
    .ownPhrases()
    .filter(
      (p) => p.text.trim() && p.deck !== ABOUT_DECK && p.deck !== QUICK_DECK && p.deck !== WORDS_DECK
    );
  if (!phrases.length) return null;

  return {
    id: OWN_UNIT_ID,
    title: "Lo tuyo",
    subtitle: "The cards you made yourself",
    color: "var(--purple)",
    colorDark: "var(--purple-dark)",
    lessons: chunkLessons(phrases, "own", "Your cards"),
  };
}

/* Sobre mí — cards the assistant wrote about Mum's own life. It is not on
   the path any more: it has a square of its own on the home screen, which
   opens the interview and lists the cards, so `pathUnits` leaves it out. It is
   still a unit, because Repaso's pool and the lesson lookup read `allUnits`
   and a card the interview wrote should still turn up in a mix. */
function aboutUnit() {
  const phrases = library.ownPhrases().filter((p) => p.text.trim() && p.deck === ABOUT_DECK);
  if (!phrases.length && !settings.hasAssistant) return null;

  return {
    id: ABOUT_UNIT_ID,
    title: ABOUT_DECK,
    subtitle: phrases.length
      ? "Your own life, in Spanish"
      : "Tell it about you and it writes the cards",
    color: "var(--green)",
    colorDark: "var(--green-dark)",
    lessons: chunkLessons(phrases, "about", "About you"),
  };
}

/** The course units plus the two generated ones, in path order. */
/* The two course units that are reached through a tile instead of the path.

   El pasado and Palabras are not "next" in any sense — they are a grammar
   drill and a vocabulary pile you dip into, and strung out along the winding
   path they buried the everyday lessons under twenty more nodes you were never
   working through in order. Behind a tile they are one tap and the path goes
   back to being the thing you are actually progressing along.

   They are still ordinary units: same shape, same lessons, same progress ticks,
   drawn by the same `renderPath`. Only where you reach them changed. */
const TILE_UNITS = { past: "pasado", words: "palabras" };

/* The course path is a section like the others now, rather than the thing the
   home screen *is*. Home is four tiles and the Phrases button; the winding
   path — Saludos through Mézclalo — lives one tap in, behind Practice.

   Named rather than spelled inline because three places test for it and a
   typo in any of them would silently draw an empty path. */
const PRACTICE = "practice";

/* What a section is called, and it is deliberately not the unit's own title.
   The Palabras unit is called Palabras in content.js and stays that way — but
   "Words" is what it is called on the way in, and a tile saying Words that
   opens a page saying Palabras is two names for one place. One table, read by
   both the tile and the section head. */
const SECTION_TITLES = {
  [PRACTICE]: { title: "Practice", sub: "Lesson by lesson, in order" },
  past: { title: "The Past", sub: "Name the shape, then say it" },
  words: { title: "Words", sub: "A word, a sound, a picture" },
};

/* Words you added yourself, as a unit under the course's Palabras. It is the
   same shape as `ownUnit` and chunked the same way — the Words section shows
   the course unit and then this one, so a word you added is where you would
   look for it rather than filed under "Lo tuyo" with your phrases. */
function myWordsUnit() {
  const phrases = library.ownPhrases().filter((p) => p.text.trim() && p.deck === WORDS_DECK);
  if (!phrases.length) return null;
  return {
    id: "mis-palabras",
    title: "Your words",
    subtitle: "The ones you added",
    color: "var(--purple)",
    colorDark: "var(--purple-dark)",
    lessons: chunkLessons(phrases, "words", "Your words"),
  };
}

/* What a section draws. Words is the one that is two units rather than one,
   which is why this returns a list and `renderPath` spreads it. */
function unitsFor(section) {
  if (section === PRACTICE) return pathUnits();
  if (section === "words") return [unitFor("words"), myWordsUnit()].filter(Boolean);
  return [unitFor(section)].filter(Boolean);
}

function unitFor(section) {
  const id = TILE_UNITS[section];
  return id ? allUnits().find((unit) => unit.id === id) ?? null : null;
}

/** The units the path itself draws — everything not behind a tile. Sobre mí
    is behind one too, though not through TILE_UNITS: its tile opens the
    interview page rather than a path. */
function pathUnits() {
  const behind = new Set([...Object.values(TILE_UNITS), ABOUT_UNIT_ID]);
  return allUnits().filter((unit) => !behind.has(unit.id));
}

function allUnits() {
  return [...COURSE, ownUnit(), aboutUnit()].filter(Boolean);
}

/** Lesson lookup that knows about the generated lessons too. */
function findLesson(id) {
  const course = lessonById(id);
  if (course) return course;
  for (const unit of [ownUnit(), aboutUnit()]) {
    const lesson = unit?.lessons.find((l) => l.id === id);
    if (lesson) return { ...lesson, unit };
  }
  return null;
}

function firstOpenLesson() {
  return LESSONS.map((l) => l.id).find((id) => !progress.isDone(id)) ?? null;
}

/* The home screen, and the two tiles that are the same path filtered.

   `section` null is home: the wordmark, the four tiles, then the everyday
   path. `section` "past" or "words" is one unit drawn on its own, by this same
   function — deliberately not a second renderer, because a copy would drift
   and the first thing to drift would be the node states. */
export function renderPath(section = null) {
  const streak = progress.currentStreak();
  const owed = progress.owedToday();
  const doneCount = LESSONS.filter((l) => progress.isDone(l.id)).length;
  const current = firstOpenLesson();
  const favourites = library.favouritePhrases().filter((p) => p.text.trim());

  const greeting =
    streak > 0 && !owed
      ? `Racha de ${streak} día${streak === 1 ? "" : "s"} — ¡ya está hecho lo de hoy!`
      : streak > 0
      ? `Racha de ${streak} día${streak === 1 ? "" : "s"} — keep it alive: one little lesson.`
      : doneCount > 0
      ? "One lesson starts a new streak."
      : "¡Hola, Mum! Five minutes. One cup of tea. Let's go.";

  // The nodes wind left–centre–right like a certain owl's path.
  const offsets = [0, -1, 1];
  let nodeIndex = 0;

  const units = (section ? unitsFor(section) : [])
    .map((unit) => {
      const nodes = unit.lessons
        .map((lesson) => {
          const done = progress.isDone(lesson.id);
          const isCurrent = lesson.id === current;
          const offset = offsets[nodeIndex++ % offsets.length];
          const best = progress.lessons[lesson.id]?.best;

          const icon = done
            ? `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            : `<svg viewBox="0 0 24 24"><path d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3-5.7-3.1-5.7 3.1 1.2-6.3L2.8 9.3l6.4-.8z"/></svg>`;

          return `
          <div class="node-slot" style="--offset:${offset}">
            ${isCurrent ? `<div class="node-callout">START</div>` : ""}
            <button class="node ${done ? "done" : "open"} ${isCurrent ? "current" : ""}"
                    data-lesson="${esc(lesson.id)}"
                    style="--node:${done ? "var(--gold)" : unit.color};--node-dark:${done ? "var(--gold-dark)" : unit.colorDark}"
                    aria-label="${esc(lesson.title)}">
              ${icon}
            </button>
            <div class="node-title">${esc(lesson.title)}${best != null ? ` · <strong>${best}</strong>` : ""}</div>
          </div>`;
        })
        .join("");

      return `
      <section class="unit">
        <div class="unit-banner" style="--unit:${unit.color};--unit-dark:${unit.colorDark}">
          <div class="unit-name">${esc(unit.title)}</div>
          <div class="unit-sub">${esc(unit.subtitle)}</div>
        </div>
        <div class="path">${nodes}</div>
      </section>`;
    })
    .join("");

  const unit = section ? unitFor(section) : null;
  const named = SECTION_TITLES[section];
  const sectionTitle = named?.title ?? unit?.title ?? "";
  const sectionSub = named?.sub ?? unit?.subtitle ?? "";

  view.innerHTML = `
    ${
      section
        ? `<header class="home-head section-head">
             <div class="wordmark">${esc(sectionTitle)}</div>
             ${homeLink()}
           </header>`
        : `<header class="home-head">
             <div class="brand">${parrotSVG(34)}<span class="wordmark">mum·o·lingo</span></div>
             <div class="head-controls">
               <button class="streak ${streak > 0 ? "lit" : ""}" id="streak" aria-label="Streak">
                 ${flameSVG()}<span>${streak}</span>
               </button>
               <button class="head-gear" data-open-settings aria-label="Settings">${COG_SVG}</button>
             </div>
           </header>`
    }

    ${
      section
        ? sectionSub
          ? `<p class="muted section-intro">${esc(sectionSub)}</p>`
          : ""
        : `<div class="mascot-card">
             ${parrotSVG(74)}
             <div class="bubble">${esc(greeting)}</div>
           </div>

           ${tiles()}`
    }

    ${section === "words" && settings.hasAssistant ? `<button class="btn section-add" data-add-word>Add a word</button>` : ""}

    ${units}

    ${section !== PRACTICE ? "" : `
    <section class="unit">
      <div class="unit-banner mix-banner" style="--unit:var(--blue);--unit-dark:var(--blue-dark)">
        <div class="unit-name">Mézclalo</div>
        <div class="unit-sub">Practise across everything you've got</div>
      </div>
      <div class="path">
        <div class="node-slot" style="--offset:${favourites.length ? -1 : 0}">
          <button class="node open practice" id="practice"
                  style="--node:var(--blue);--node-dark:var(--blue-dark)" aria-label="Repaso">
            <svg viewBox="0 0 24 24"><path d="M7 8v8M4.5 9.5v5M17 8v8M19.5 9.5v5M7 12h10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
          </button>
          <div class="node-title">Repaso — mix it all up</div>
        </div>
        ${
          favourites.length
            ? `<div class="node-slot" style="--offset:1">
                 <button class="node open" id="starred"
                         style="--node:var(--gold);--node-dark:var(--gold-dark)" aria-label="Favourites">
                   ${STAR_SVG}
                 </button>
                 <div class="node-title">Favourites · <strong>${favourites.length}</strong></div>
               </div>`
            : ""
        }
      </div>
    </section>`}

    ${section || settings.hasAzure ? "" : `<div class="notice" style="margin-top:8px">Without an Azure key you can listen with the
      browser's voice, but the waveform comparison and scoring won't run.
      <button class="link" data-open-settings>Add the key in Settings</button></div>`}`;

  view.querySelectorAll("[data-section]").forEach((button) =>
    button.addEventListener("click", () => {
      stopEverything();
      state.section = button.dataset.section;
      render();
    })
  );

  view.querySelectorAll("[data-lesson]").forEach((button) =>
    button.addEventListener("click", () => {
      const lesson = findLesson(button.dataset.lesson);
      if (lesson) startLesson(lesson);
    })
  );

  /* The one tile that opens a page rather than a list: Sobre mí leads to the
     interview that fills it, and its cards are listed there. */
  view.querySelectorAll("[data-about]").forEach((button) =>
    button.addEventListener("click", () => {
      stopEverything();
      state.stage = "about";
      render();
    })
  );

  const practice = document.getElementById("practice");
  if (practice) practice.onclick = () => startPractice();

  document.getElementById("starred")?.addEventListener("click", () =>
    startPractice(shuffle([...favourites]))
  );

  document.getElementById("streak")?.addEventListener("click", () =>
    toast(
      streak > 0
        ? `${streak} day${streak === 1 ? "" : "s"} in a row. One lesson a day keeps it burning.`
        : "Finish a lesson to light the flame."
    )
  );

  /* The six ways in. Counted from the course rather than hardcoded, so a tile
     says how much is behind it and Quick says whether it has ever been used.

     Phrases, Quick and Sobre mí are pages; Past and Palabras are units taken
     off the path — see TILE_UNITS. Add is not a tile, because adding is
     something you do to a section rather than a place: the Phrases page
     carries it.

     Sobre mí used to be a unit on the path, led by a workshop node that opened
     the interview. A deck the app writes about you is not a lesson you work
     through any more than the past tense is, and buried under Mézclalo it was
     the last thing on the longest page. So it is a square now, and the square
     does what the node did. Green, the one strong colour the other five don't
     use; it is the only tile that carries `data-about` rather than
     `data-section`, because it opens a page and not a path. It is always
     shown — a tile that comes and goes leaves a hole in a grid — and with no
     assistant it says so, and its page names Settings as the fix.

     The order is Practice, Words, Sobre mí, Quick, The Past, Phrases. Sobre mí
     took The Past's place on the second row because it is asked for far more
     often than a grammar drill is, and the two you reach for should be above
     the fold; The Past moved down beside Phrases rather than out.

     Phrases came in off the bottom row to make the sixth square. It was a
     wide button across the foot of the grid, on the argument that the whole
     library outranks a slice of it; five squares and a strip read worse than
     six squares, and the argument was never strong. */
  function tiles() {
    const about = library.ownPhrases().filter((p) => p.deck === ABOUT_DECK && p.text.trim()).length;
    const count = (id) => {
      const found = allUnits().find((u) => u.id === id);
      return found ? found.lessons.reduce((n, l) => n + l.phrases.length, 0) : 0;
    };
    const asked = library.ownPhrases().filter((p) => p.deck === QUICK_DECK && p.text.trim()).length;
    const rows = [
      { key: PRACTICE, title: SECTION_TITLES[PRACTICE].title, blurb: SECTION_TITLES[PRACTICE].sub, colour: "blue",
        count: `${pathUnits().reduce((n, u) => n + u.lessons.reduce((m, l) => m + l.phrases.length, 0), 0)} phrases`,
        mark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M6 10.5V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5"/></svg>` },
      { key: "words", title: SECTION_TITLES.words.title, blurb: SECTION_TITLES.words.sub, colour: "purple",
        count: `${count("palabras")} words`,
        mark: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M3 16l5-4 4 3 3-2 6 5"/></svg>` },
      { key: "about", title: ABOUT_DECK, blurb: "Cards written about you", colour: "green",
        count: about
          ? `${about} card${about === 1 ? "" : "s"} about you`
          : settings.hasAssistant
          ? "Tell it about you"
          : "Needs the card builder",
        mark: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></svg>` },
      { key: "quick", title: "Quick", blurb: "A phrase you need right now", colour: "orange",
        count: asked ? `${asked} asked for` : "Ask for one",
        mark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>` },
      { key: "past", title: SECTION_TITLES.past.title, blurb: SECTION_TITLES.past.sub, colour: "gold",
        count: `${count("pasado")} phrases`,
        mark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17h16"/><circle cx="8" cy="17" r="2.5"/><path d="M13 17V7h6"/></svg>` },
      { key: "phrases", title: "All Phrases", blurb: "Every card, searchable", colour: "blue",
        count: `${library.drillable().length} cards`,
        mark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h10"/></svg>` },
    ].filter((tile) => !TILE_UNITS[tile.key] || count(TILE_UNITS[tile.key]));

    return `
      <div class="tiles">
        ${rows
          .map(
            (tile) => `
          <button class="tile tile-${tile.colour}" ${
            tile.key === "about" ? `data-about="1"` : `data-section="${tile.key}"`
          }>
            <span class="tile-mark" aria-hidden="true">${tile.mark}</span>
            <span class="tile-title">${esc(tile.title)}</span>
            <span class="tile-blurb">${esc(tile.blurb)}</span>
            <span class="tile-count">${esc(tile.count)}</span>
          </button>`
          )
          .join("")}
      </div>`;
  }
}
