// Persistence. Ported from Xerra and simplified for a one-language course.
//
// Metadata (custom phrases, attempts, progress, settings) lives in
// localStorage as JSON. Audio blobs live in IndexedDB, the only place iOS
// Safari will hold binary data of any size.
//
// Course phrases are NOT stored here — they live in content.js as code, with
// stable ids that attempts reference. Only Mum's own added phrases, her edits
// to course phrases (as overrides), her stars and her results are data. That
// removes Xerra's whole seeding/versioning machinery.
//
// iOS can evict a web app's storage after long disuse. Anything you'd be sad
// to lose should be exported from Settings.

import { COURSE_LANGUAGE, COURSE_PHRASES } from "./content.js";

const KEYS = {
  phrases: "mumolingo.phrases",
  attempts: "mumolingo.attempts",
  progress: "mumolingo.progress",
  settings: "mumolingo.settings",
  favourites: "mumolingo.favourites",
  overrides: "mumolingo.overrides",
  notes: "mumolingo.notes",
  replies: "mumolingo.replies",
  aboutMe: "mumolingo.aboutMe",
};

// The fields an edit can touch. Course phrases are code, so editing one is
// stored as an override keyed by phrase id rather than as a copy — content.js
// stays the source of truth, and a later course revision still reaches every
// phrase Mum hasn't personally changed.
const EDITABLE = [
  "text",
  "translation",
  "focusNote",
  "situation",
  "usageNote",
  /* The keyword-picture pair — see the Palabras unit in content.js. They are
     editable like anything else on a card, and deliberately so: a picture you
     invented yourself outlasts one you were handed, so the course's version is
     a starting point and "Reset to the original" is the way back from a worse
     one. Any card can carry them, not just a Palabras word — Mum can hang a
     picture on a word inside a phrase she keeps losing. */
  "sounds",
  "picture",
  /* And which colour that picture paints the object — see `genderOf` below.
     A course card gets its gender from its own article and needs no override,
     but a card whose article lies (`el agua` is feminine) does, and an override
     that isn't in this list is dropped on save without a word. */
  "gender",
];

/* Cards the assistant writes about Mum's own life, from an English interview.
   They are ordinary cards of hers in every way — they drill, star, score,
   level up, export, edit and delete like anything she typed into Add — so
   this is a name they carry in `deck`, not a flag anything has to test for.
   The one thing it buys is a unit of their own on the path; a card with no
   `deck` at all is a Lo tuyo card, which is every card that predates this. */
export const ABOUT_DECK = "Sobre mí";

/* Level two. A card is read aloud until it has been said well four times;
   after that the drill shows only the English and Mum has to produce the
   Spanish from memory. Trying to remember is the part that makes it stick —
   reading it off the screen a hundredth time doesn't.

   Was two, which turned out to be quick: two good goes on the same morning
   promoted a card that hadn't been away from the screen long enough to have
   been remembered rather than just repeated. Nothing stores the level — it is
   computed live from the attempts — so raising this demotes the cards that
   only just cleared the old line, which is the intended effect and not a
   migration to write. Xerra uses the same number; keep them in step. */
export const RECALL_AFTER = 4;
const RECALL_PASS = 75; // the same "understandable" line the lesson banner uses

/* Dot in a box, or line — the shape of a past sentence, ported from Deb-o-lingo
   (which took it from Xerra). A **dot in a box** is an event with a shut box of
   time round it (*preterite*); a **line** is a stretch of past with no box —
   a habit, a state, a background (*imperfect*); and a **line reaching now** is
   a stretch of time that still has today inside it (*present perfect*). On the
   El pasado lessons the drill asks which shape the sentence is *before* it will
   show the Spanish — deciding from the meaning alone is the thing that
   transfers to speaking, where the decision comes before the words.

   The one association these lessons exist to build is ending ↔ shape — the
   line IS -aba/-ía — so `endings` is not a footnote here the way `term` is:
   the gate prints it in bold on every choice button and the verdict says it
   in big print (`.aspect-endings` in app.css). That emphasis came with the
   feature from Deb-o-lingo; Xerra keeps term and endings on one quiet line.
   One fixed language, so `endings` are plain strings where Xerra keys them by
   locale.

   The two `base` shapes are always offered — dot-or-line is the question every
   past sentence poses — and the present perfect joins only in a lesson that
   actually contains one, so a lesson's contents are load-bearing. */
export const ASPECTS = {
  dot: {
    /* Square brackets because the box is shut — against the present perfect's
       round ones, which are a stretch of time still open into now. */
    mark: "[●]",
    label: "A dot in a box",
    gloss: "an event in a time-boxed past",
    term: "preterite (simple past)",
    endings: "-é · -ó · -í — stress at the very end",
    base: true,
  },
  line: {
    mark: "▬▬",
    label: "A line",
    gloss: "a habit, a state, a background",
    term: "imperfect",
    endings: "-aba · -ía — always the line",
    base: true,
  },
  /* A line back in the past, dashed forward into the dot of now; the brackets
     are the stretch of time — today, this week — that still has now inside it.
     That bracket is what chooses it over the preterite in Spain. */
  presentPerfect: {
    mark: "(▬···●)",
    label: "A line reaching now",
    gloss: "in a stretch of time that includes today",
    term: "present perfect",
    endings: "he · has · ha + -ado / -ido — the 'I have gone / eaten' one",
  },
};

/* Which shapes the gate offers: the base pair always, anything else only when
   the queue in front of Mum actually contains it. A choice that is never the
   answer anywhere in the lesson is noise read past every time. */
export function aspectChoices(queue) {
  const inPlay = new Set((queue ?? []).map((p) => p?.aspect).filter((key) => ASPECTS[key]));
  return Object.keys(ASPECTS).filter((key) => ASPECTS[key].base || inPlay.has(key));
}

/* The shape this card asks about — the table entry plus the card's own note
   saying why *this* sentence is that shape. Null for every card without an
   aspect, which is every card outside the El pasado lessons. */
export function aspectOf(phrase) {
  const key = phrase?.aspect;
  if (!key || !ASPECTS[key]) return null;
  return { key, ...ASPECTS[key], note: phrase.aspectNote || null };
}

const DB_NAME = "mumolingo";
/* Bumped to 2 for the pictures store. The upgrade handler creates whatever is
   missing rather than assuming a fresh database, so an existing install keeps
   its recordings and its cached model audio and simply gains the third box. */
const DB_VERSION = 2;
const STORE_MODEL = "modelAudio";
const STORE_RECORDINGS = "recordings";
const STORE_PICTURES = "pictures";

// ---------------------------------------------------------------- IndexedDB

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_MODEL)) db.createObjectStore(STORE_MODEL);
      if (!db.objectStoreNames.contains(STORE_RECORDINGS)) db.createObjectStore(STORE_RECORDINGS);
      if (!db.objectStoreNames.contains(STORE_PICTURES)) db.createObjectStore(STORE_PICTURES);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function idbPut(store, key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const request = tx.objectStore(store).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function idbDelete(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function idbClear(store) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

/* Blue for masculine, pink for feminine — the gender cue inside a keyword
   picture.

   Every mnemonic system that teaches gendered nouns bakes a fixed cue into the
   scene: Linkword puts a boxer in every masculine one and perfume in every
   feminine one, Fluent Forever puts the two genders in two different rooms.
   Colour is the popular one and it is the weakest of the three as prose — a
   colour is not an event. What rescues it here is that these scenes get
   *drawn*: `picture` is a sentence and the drawing is made from that sentence,
   so "the fork is pink" is a thing the image model can put on the screen and a
   thing you can see in a thumbnail without reading a word.

   What is coloured is the object the word names, never the whole scene. One
   pink fork is a hook; a pink wash over everything competes with the picture it
   is supposed to be marking.

   The gender is read off the card's own article, so no course content had to
   learn about it and a noun typed into the editor gets the cue for free.
   `phrase.gender` overrides that where the article lies. Ported from Xerra,
   whose table covers three languages; this one is Spanish. */
export const GENDERS = {
  m: { label: "masculine", colour: "blue" },
  f: { label: "feminine", colour: "pink" },
};

const ARTICLE_GENDER = new Map([
  ["el", "m"], ["los", "m"], ["un", "m"], ["unos", "m"],
  ["la", "f"], ["las", "f"], ["una", "f"], ["unas", "f"],
]);

/* Feminine nouns that take `el` in the singular because they open on a stressed
   a-: it is *el agua fría*, and a cue that painted the water blue would teach
   the wrong agreement. This is the trap Spanish has where Catalan has `l'` —
   the word whose gender you cannot read off the article in front of it.
   Deliberately the common ones rather than a lexicon: the editor's own field is
   the answer for anything past them. */
const EL_BUT_FEMININE = new Set([
  "agua", "alma", "ala", "arma", "aula", "área", "águila", "hacha", "hambre",
]);

/** "m", "f", or null for a card that isn't a gendered noun. */
export function genderOf(phrase) {
  if (phrase?.gender && GENDERS[phrase.gender]) return phrase.gender;
  const text = (phrase?.text ?? "").trim();
  /* Only a noun phrase is read for its article. "La cuenta, por favor" also
     starts with "la", and a sentence is not a thing with a gender to paint — so
     anything punctuated like a sentence, or longer than an article and a word
     or two, is left alone rather than guessed at. An explicit `gender` above
     overrides this, which is how a card can opt in regardless. */
  const words = text.split(/\s+/);
  if (words.length > 3 || /[.,;:!?¿¡]/.test(text)) return null;
  const gender = ARTICLE_GENDER.get(words[0]?.toLowerCase());
  if (gender === "m" && EL_BUT_FEMININE.has(words[1]?.toLowerCase())) return "f";
  return gender || null;
}

export const audioStore = {
  putModel: (key, blob) => idbPut(STORE_MODEL, key, blob),
  getModel: (key) => idbGet(STORE_MODEL, key),
  putRecording: (key, blob) => idbPut(STORE_RECORDINGS, key, blob),
  getRecording: (key) => idbGet(STORE_RECORDINGS, key),
  deleteRecording: (key) => idbDelete(STORE_RECORDINGS, key),
  clearModelCache: () => idbClear(STORE_MODEL),

  putPicture: (key, blob) => idbPut(STORE_PICTURES, key, blob),
  getPicture: (key) => idbGet(STORE_PICTURES, key),
  deletePicture: (key) => idbDelete(STORE_PICTURES, key),
  clearPictures: () => idbClear(STORE_PICTURES),

  async usage() {
    if (!navigator.storage?.estimate) return null;
    const { usage, quota } = await navigator.storage.estimate();
    return { usage, quota };
  },
};

// ------------------------------------------------------------------ helpers

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Storage write failed", error);
  }
}

/* The one number the app shows and judges by: Mum's weakest word.

   Every aggregate Azure hands back is generous. `pronunciationScore` is the
   worst of them — for a read phrase in a locale without prosody assessment
   (which is every locale but en-US, so es-ES too) it is
   `0.6·s0 + 0.2·s1 + 0.2·s2` over accuracy, fluency and completeness sorted
   lowest first, and completeness is 100 whenever you say all the words while
   fluency on a five-word phrase is nearly always 95+, so two of the three
   slots are pinned near the top. AccuracyScore is generous too, because it is
   a mean over the phrase: say four words well and mangle the fifth and it
   barely moves.

   The doorman doesn't average her. He hears the word she got wrong. So the
   score is the lowest word in the phrase, and a word Azure marks as omitted
   scores zero — not saying it is the worst way of saying it.

   Word detail has been stored on every scored attempt since the first version,
   so this reads back over the whole history without a migration. The
   aggregates are the fallback for an attempt that somehow has no words.

   Same function, same fallbacks as Xerra's. Keep them in step. */
export function attemptScore(attempt) {
  const words = attempt?.words ?? [];
  const scores = words
    .map((word) => (word.errorType === "Omission" ? 0 : word.score))
    .filter((score) => typeof score === "number");
  if (scores.length) return Math.min(...scores);
  return attempt?.accuracy ?? attempt?.overall ?? null;
}

export function uid() {
  return (crypto.randomUUID?.() ?? String(Date.now() + Math.random())).toString();
}

/** Local calendar day as YYYY-MM-DD — streaks care about Mum's days, not UTC's. */
function localDay(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ------------------------------------------------------------------ library
//
// Custom phrases + attempts. Course phrases come in via content.js but share
// the same attempt history, keyed by phrase id.

export const library = {
  customPhrases: [],
  attempts: [],
  favourites: [], // phrase ids — course and custom alike
  overrides: {}, // course phrase id -> the fields Mum has changed
  /* Two more stores keyed by phrase id, for the same reason favourites is one:
     a course phrase is code, so anything Mum accumulates against it has to
     live beside it rather than on it. Neither is an *edit*, so neither belongs
     in `overrides` — an override is a diff against content.js that "Reset to
     the original" throws away, and losing the answer you kept about a phrase
     because you reset its wording would be wrong. */
  notes: {}, // phrase id -> answers kept from a chat
  replies: {}, // phrase id -> what you might hear back

  load() {
    this.customPhrases = readJSON(KEYS.phrases, []);
    this.attempts = readJSON(KEYS.attempts, []);
    this.favourites = readJSON(KEYS.favourites, []);
    this.overrides = readJSON(KEYS.overrides, {});
    this.notes = readJSON(KEYS.notes, {});
    this.replies = readJSON(KEYS.replies, {});
  },

  saveCustom() {
    writeJSON(KEYS.phrases, this.customPhrases);
  },
  saveAttempts() {
    writeJSON(KEYS.attempts, this.attempts);
  },
  saveFavourites() {
    writeJSON(KEYS.favourites, this.favourites);
  },
  saveOverrides() {
    writeJSON(KEYS.overrides, this.overrides);
  },
  saveNotes() {
    writeJSON(KEYS.notes, this.notes);
  },
  saveReplies() {
    writeJSON(KEYS.replies, this.replies);
  },

  /** A stored phrase as the app should see it: edits applied, star, notes and
      replies attached. Everything that reads a phrase goes through here. */
  decorate(phrase) {
    return {
      ...phrase,
      ...(this.overrides[phrase.id] ?? {}),
      favourite: this.favourites.includes(phrase.id),
      notes: this.notes[phrase.id] ?? [],
      replies: this.replies[phrase.id] ?? [],
    };
  },

  coursePhrases() {
    return COURSE_PHRASES.map((p) => this.decorate(p));
  },

  ownPhrases() {
    return this.customPhrases.map((p) => this.decorate(p));
  },

  /** Every phrase — course first, then Mum's own. */
  allPhrases() {
    return [...this.coursePhrases(), ...this.ownPhrases()];
  },

  /** Only the ones there's actually something to say — see captures below. */
  drillable() {
    return this.allPhrases().filter((p) => p.text.trim());
  },

  /* A card can be jotted down in English with the Spanish left blank, to be
     filled in later. It's a real phrase in every other way, but there's
     nothing to speak yet, so it stays out of every drill queue. */
  captures() {
    return this.ownPhrases().filter((p) => !p.text.trim());
  },

  favouritePhrases() {
    return this.allPhrases().filter((p) => p.favourite);
  },

  phraseById(id) {
    return this.allPhrases().find((p) => p.id === id) ?? null;
  },

  isCourse(phraseID) {
    return COURSE_PHRASES.some((p) => p.id === phraseID);
  },

  isEdited(phraseID) {
    return Boolean(this.overrides[phraseID]);
  },

  toggleFavourite(phraseID) {
    const at = this.favourites.indexOf(phraseID);
    if (at === -1) this.favourites.push(phraseID);
    else this.favourites.splice(at, 1);
    this.saveFavourites();
    return at === -1;
  },

  /* Answers kept from a chat, and what you might hear back. Both are stored by
     phrase id and both return the new list rather than mutating anything,
     because a Mum phrase is a *decorated copy* — Xerra can mutate the object
     its queue is holding, and here that object is a copy `decorate()` made.
     So the caller assigns what comes back onto the copy it is holding (the
     card in `lesson.queue`, the phrase the sheet was opened with), which is
     the same fix in a different shape: repaint the card you are looking at,
     don't re-render underneath yourself. */
  keepNote(phraseID, { question, answer }) {
    if (!answer?.trim()) return null;
    const note = { id: uid(), question: question ?? "", answer, keptAt: new Date().toISOString() };
    this.notes[phraseID] = [...(this.notes[phraseID] ?? []), note];
    this.saveNotes();
    return note;
  },

  notesFor(phraseID) {
    return this.notes[phraseID] ?? [];
  },

  forgetNote(phraseID, noteID) {
    const kept = (this.notes[phraseID] ?? []).filter((note) => note.id !== noteID);
    // An empty list is a deleted key, the same way an empty override is.
    if (kept.length) this.notes[phraseID] = kept;
    else delete this.notes[phraseID];
    this.saveNotes();
    return kept;
  },

  setReplies(phraseID, replies) {
    const list = Array.isArray(replies) ? replies : [];
    if (list.length) this.replies[phraseID] = list;
    else delete this.replies[phraseID];
    this.saveReplies();
    return list;
  },

  /* A re-imagined keyword scene.

     Ported from Xerra, where it takes an id and mutates the phrase in the
     library. Here it takes the phrase *object* instead, because a course
     phrase is code: `updatePhrase` already knows how to write one as an
     override and a custom one in place, so the scene goes through it rather
     than through a store of its own. Mutating the object matters for the same
     reason it does over there — the lesson holds decorated copies in
     `lesson.queue`, so the card you re-imagined would otherwise carry on
     showing the scene it was rendered with.

     It writes both halves together because they are one mnemonic — a new scene
     hung off the old sound bridge is a riddle whose answer has moved. A blank
     `sounds` is allowed and clears it; a blank `picture` is refused, since that
     would leave the card with a bridge and nothing on the end of it. */
  setPicture(phrase, { sounds, picture }) {
    if (!phrase || !picture?.trim()) return null;
    phrase.sounds = sounds?.trim() || null;
    phrase.picture = picture.trim();
    this.updatePhrase(phrase);
    return phrase;
  },

  repliesFor(phraseID) {
    return this.replies[phraseID] ?? [];
  },

  addPhrase(phrase) {
    const saved = {
      id: uid(),
      language: COURSE_LANGUAGE,
      createdAt: new Date().toISOString(),
      text: "",
      translation: "",
      situation: null,
      usageNote: null,
      focusNote: null,
      sounds: null,
      picture: null,
      ...phrase,
    };
    this.customPhrases.push(saved);
    this.saveCustom();
    return saved;
  },

  /* One save path for both kinds of phrase. A custom one is rewritten in
     place; a course one becomes an override holding just the changed fields,
     so "reset" is a delete and an untouched phrase carries no storage at all. */
  updatePhrase(phrase) {
    if (this.isCourse(phrase.id)) {
      const original = COURSE_PHRASES.find((p) => p.id === phrase.id);
      const changed = {};
      for (const field of EDITABLE) {
        const value = phrase[field] ?? null;
        if (value !== (original[field] ?? null)) changed[field] = value;
      }
      if (Object.keys(changed).length) this.overrides[phrase.id] = changed;
      else delete this.overrides[phrase.id];
      this.saveOverrides();
      return;
    }

    const index = this.customPhrases.findIndex((p) => p.id === phrase.id);
    if (index === -1) return;
    // The star, the kept notes and the replies all live in their own stores
    // keyed by id, so `decorate()` hangs them on and this takes them back off
    // — writing them into the record would keep a stale second copy that
    // export and import would then carry around.
    const { favourite, notes, replies, ...record } = phrase;
    this.customPhrases[index] = record;
    this.saveCustom();
  },

  /** Drop an edit and go back to what content.js says. */
  resetPhrase(phraseID) {
    delete this.overrides[phraseID];
    this.saveOverrides();
  },

  async removePhrase(phraseID) {
    for (const attempt of this.attemptsFor(phraseID)) {
      await audioStore.deleteRecording(attempt.id);
    }
    // The drawing of its picture goes with it, like the recordings do.
    await audioStore.deletePicture(phraseID);
    this.attempts = this.attempts.filter((a) => a.phraseID !== phraseID);
    this.customPhrases = this.customPhrases.filter((p) => p.id !== phraseID);
    this.favourites = this.favourites.filter((id) => id !== phraseID);
    delete this.notes[phraseID];
    delete this.replies[phraseID];
    this.saveCustom();
    this.saveAttempts();
    this.saveFavourites();
    this.saveNotes();
    this.saveReplies();
  },

  attemptsFor(phraseID) {
    return this.attempts
      .filter((a) => a.phraseID === phraseID)
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  },

  bestScore(phraseID) {
    const scores = this.attemptsFor(phraseID)
      .map(attemptScore)
      .filter((s) => typeof s === "number");
    return scores.length ? Math.max(...scores) : null;
  },

  /* Attempts that counted. A scored attempt counts if it passed; an unscored
     one counts on its own, because with no Azure key there is no score to
     judge it by and a card would otherwise never leave level one. */
  goodAttempts(phraseID) {
    return this.attemptsFor(phraseID).filter(
      (a) => attemptScore(a) == null || attemptScore(a) >= RECALL_PASS
    ).length;
  },

  /** True once the card should be drilled from memory instead of read aloud. */
  recallReady(phraseID) {
    return this.goodAttempts(phraseID) >= RECALL_AFTER;
  },

  /** Good goes still owed before the card turns into a memory question. */
  toRecall(phraseID) {
    return Math.max(0, RECALL_AFTER - this.goodAttempts(phraseID));
  },

  recordAttempt(attempt) {
    this.attempts.push(attempt);
    this.saveAttempts();
  },

  updateAttempt(attempt) {
    const index = this.attempts.findIndex((a) => a.id === attempt.id);
    if (index === -1) return;
    this.attempts[index] = attempt;
    this.saveAttempts();
  },

  async removeAttempt(attemptID) {
    await audioStore.deleteRecording(attemptID);
    this.attempts = this.attempts.filter((a) => a.id !== attemptID);
    this.saveAttempts();
  },

  exportJSON() {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        customPhrases: this.customPhrases,
        attempts: this.attempts,
        favourites: this.favourites,
        overrides: this.overrides,
        notes: this.notes,
        replies: this.replies,
        progress: { lessons: progress.lessons, streak: progress.streak },
        // Not a phrase and not an attempt, but it is what the Sobre mí cards
        // were made out of: restore a backup without it and the assistant
        // starts the life story over, asking what it has already been told.
        aboutMe: aboutMe.turns,
      },
      null,
      2
    );
  },

  importJSON(text) {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.customPhrases) && !Array.isArray(parsed.attempts)) {
      throw new Error("That doesn't look like a Mum-o-lingo backup.");
    }
    this.customPhrases = Array.isArray(parsed.customPhrases) ? parsed.customPhrases : [];
    this.attempts = Array.isArray(parsed.attempts) ? parsed.attempts : [];
    // Older backups predate stars and edits; absent is empty, not an error.
    this.favourites = Array.isArray(parsed.favourites) ? parsed.favourites : [];
    this.overrides = parsed.overrides && typeof parsed.overrides === "object" ? parsed.overrides : {};
    this.notes = parsed.notes && typeof parsed.notes === "object" ? parsed.notes : {};
    this.replies = parsed.replies && typeof parsed.replies === "object" ? parsed.replies : {};
    this.saveCustom();
    this.saveAttempts();
    this.saveFavourites();
    this.saveOverrides();
    this.saveNotes();
    this.saveReplies();
    aboutMe.replace(Array.isArray(parsed.aboutMe) ? parsed.aboutMe : []);
    if (parsed.progress) {
      progress.lessons = parsed.progress.lessons ?? {};
      progress.streak = parsed.progress.streak ?? { count: 0, lastDay: null };
      progress.save();
    }
  },
};

// ---------------------------------------------------------------- about me
//
/* The English conversation the Sobre mí cards are written from: the
   assistant's questions and Mum's answers, in the order they happened.
 
   Persisted, unlike the card chat panel's history, and that is the whole
   difference between the two. A card chat is a study aside that dies with the
   panel. This one is the material the cards are built from, so it has to
   survive finishing a lesson and coming back, a reload and the weekly
   reinstall — and it is what stops the assistant asking about her job twice.
 
   Kept whole here and trimmed only when sent, so a conversation that ran for
   months still reads back in full on the page. */

export const aboutMe = {
  turns: [],

  load() {
    const stored = readJSON(KEYS.aboutMe, null);
    this.turns = Array.isArray(stored?.turns) ? stored.turns : [];
  },

  save() {
    writeJSON(KEYS.aboutMe, { turns: this.turns });
  },

  add(role, text) {
    const turn = { role: role === "assistant" ? "assistant" : "learner", text: String(text ?? "").trim() };
    if (!turn.text) return null;
    this.turns.push(turn);
    this.save();
    return turn;
  },

  replace(turns) {
    this.turns = turns
      .filter((turn) => turn && typeof turn === "object" && typeof turn.text === "string")
      .map((turn) => ({ role: turn.role === "assistant" ? "assistant" : "learner", text: turn.text }));
    this.save();
  },

  clear() {
    this.turns = [];
    this.save();
  },

  /** Has Mum actually said anything, as opposed to just been asked? */
  get answered() {
    return this.turns.some((turn) => turn.role === "learner");
  },
};

// ----------------------------------------------------------------- progress
//
// Which lessons are done, and the daily streak. A lesson counts as completed
// the moment its last phrase is passed; repeating a lesson keeps the best
// average score. The streak counts consecutive local days with at least one
// completed lesson.

export const progress = {
  lessons: {},
  streak: { count: 0, lastDay: null },

  load() {
    const stored = readJSON(KEYS.progress, {});
    this.lessons = stored.lessons ?? {};
    this.streak = stored.streak ?? { count: 0, lastDay: null };
  },

  save() {
    writeJSON(KEYS.progress, { lessons: this.lessons, streak: this.streak });
  },

  isDone(lessonId) {
    return Boolean(this.lessons[lessonId]);
  },

  /**
   * Record a finished lesson. Returns { streakGrew } so the completion
   * screen knows whether to celebrate the flame.
   */
  completeLesson(lessonId, averageScore) {
    const entry = this.lessons[lessonId] ?? { completedAt: null, best: null, times: 0 };
    entry.completedAt = new Date().toISOString();
    entry.times += 1;
    if (averageScore != null && (entry.best == null || averageScore > entry.best)) {
      entry.best = Math.round(averageScore);
    }
    this.lessons[lessonId] = entry;

    const today = localDay();
    const yesterday = localDay(new Date(Date.now() - 86400000));
    let streakGrew = false;
    if (this.streak.lastDay !== today) {
      this.streak.count = this.streak.lastDay === yesterday ? this.streak.count + 1 : 1;
      this.streak.lastDay = today;
      streakGrew = true;
    }

    this.save();
    return { streakGrew };
  },

  /** The live streak — zero if the chain is already broken. */
  currentStreak() {
    const today = localDay();
    const yesterday = localDay(new Date(Date.now() - 86400000));
    if (this.streak.lastDay === today || this.streak.lastDay === yesterday) {
      return this.streak.count;
    }
    return 0;
  },

  /** True if today's lesson is still owed — drives the home-screen nudge. */
  owedToday() {
    return this.streak.lastDay !== localDay();
  },
};

// ----------------------------------------------------------------- settings

const DEFAULT_SETTINGS = {
  azureKey: "",
  azureRegion: "northeurope",
  azureVoice: "es-ES-ElviraNeural",
  assistantEndpoint: "",
  assistantPasscode: "",
  slowRate: 0.65,
  showTranslationUpFront: true,
  recallMode: true,
  aspectGate: true,
};

export const settings = {
  ...DEFAULT_SETTINGS,

  load() {
    Object.assign(this, DEFAULT_SETTINGS, readJSON(KEYS.settings, {}));
    // A saved voice that's no longer offered (the retired es-MX experiments)
    // falls back to the default rather than lingering invisibly.
    if (!VOICES.some((v) => v.id === this.azureVoice)) {
      this.azureVoice = DEFAULT_SETTINGS.azureVoice;
    }
  },

  save() {
    const { load, save, hasAzure, hasAssistant, ...data } = this;
    writeJSON(KEYS.settings, data);
  },

  get hasAzure() {
    return Boolean(this.azureKey?.trim() && this.azureRegion?.trim());
  },

  get hasAssistant() {
    return Boolean(this.assistantEndpoint?.trim() && this.assistantPasscode?.trim());
  },
};

// Course voices — Castilian only, to match the focusNotes (Spain 'th',
// soft d's, vosotros-free politeness). If Mum's target ever shifts to Latin
// American Spanish, the content needs rewriting first; add voices then.
export const VOICES = [
  { id: "es-ES-ElviraNeural", name: "Elvira", detail: "Spain · Female" },
  { id: "es-ES-AlvaroNeural", name: "Álvaro", detail: "Spain · Male" },
];
