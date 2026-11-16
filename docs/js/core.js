// What every page shares: the DOM handles, `state`, small helpers, sheets, sayAloud, the home link and the icons. Imports no page module — keep it that way.

import { COURSE_LANGUAGE } from "./content.js";
import { settings } from "./store.js";
import { Recorder, Player } from "./audio.js";
import { speech, browserSpeech } from "./speech.js";

export const view = document.getElementById("view");
const sheet = document.getElementById("sheet");
const sheetTitle = document.getElementById("sheet-title");
export const sheetBody = document.getElementById("sheet-body");
const toastEl = document.getElementById("toast");

export const player = new Player();

/* Bands over the weakest word in the attempt, not over any of Azure's
   aggregates — see `attemptScore` in store.js. They read low and they are not:
   PASS_GREAT means *every word in the phrase* cleared 90, which is meant to be
   hard. Xerra's GOOD/OK are the same two numbers; keep them in step. */
export const PASS_GREAT = 90;
export const PASS_OK = 75;

export const state = {
  // The one recorder: replaced by a fresh one each time a recording starts.
  // On `state` because another module has to be able to replace it.
  recorder: new Recorder(),

  tab: "learn", // learn | phrases | add | settings
  stage: "path",

  /* Which tile you are inside, or null for the home screen itself. The tiles
     are a filter over the same path the home screen draws, not a second
     renderer — see `renderPath`. */
  section: null,

  /* The last thing Quick answered, so the card survives a repaint. Cleared
     when you ask again, practise it, or throw it away. */
  quick: null, // within learn: path | drill | complete | about
  lesson: null, // { id, title, color, colorDark, queue, index, results, practice }
  celebration: null,

  // drill substate
  modelBlob: null,
  modelAnalysis: null,
  attempt: null,
  attemptBlob: null,
  attemptAnalysis: null,
  showTranslation: true,
  // Level two. `recall` says this card is a memory question; `revealed` says
  // the answer is on screen (always true at level one); `peeked` says she
  // asked to be shown it rather than remembering.
  recall: false,

  /* The keyword picture, on a card that has one. Per card — loadPhrase resets
     it — and only ever true because she asked for it: at level two the picture
     is the hint, offered instead of the answer. */
  pictured: false,

  /* Dot or line: which shape she picked for this card, or null while the
     question is still standing. Per card — loadPhrase resets it. */
  aspectChoice: null,
  revealed: true,
  peeked: false,
  loadingModel: false,
  scoringNow: false,
  levelTimer: null,
  banner: null, // { kind: great|ok|retry|neutral, score }
};

// ------------------------------------------------------------------ helpers

/** First letter up. Used where an article starts a sentence-like label. */
export const cap = (word) => String(word ?? "").replace(/^./, (c) => c.toUpperCase());

export const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

/* Text boxes grow to fit what's in them — a pasted paragraph or a dictated
   sentence shouldn't sit in a two-line scroller. */
export function autosize(field) {
  if (!(field instanceof HTMLTextAreaElement)) return;
  field.style.height = "auto";
  if (!field.scrollHeight) {
    // Not laid out yet (a hidden section); let the CSS min-height stand.
    field.style.height = "";
    field.style.overflowY = "";
    return;
  }
  // scrollHeight covers the padding box, so the borders have to be added back.
  const borders = field.offsetHeight - field.clientHeight;
  const wanted = field.scrollHeight + borders;
  // Measuring with the scrollbar hidden, so a box that fits its text never
  // shows one; if a max-height still cuts the text off, hand it back.
  field.style.overflowY = "hidden";
  field.style.height = `${wanted}px`;
  if (field.offsetHeight < wanted) field.style.overflowY = "auto";
}

export function autosizeAll(root = document) {
  for (const field of root.querySelectorAll("textarea")) autosize(field);
}

// Typing, pasting, dictating — anything that changes the content resizes it.
document.addEventListener("input", (event) => autosize(event.target));
// Rotating the phone rewraps the text, which changes how tall the box must be.
window.addEventListener("resize", () => autosizeAll());

export const STAR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>`;

/* A star on every phrase row. Starred phrases gather into a section at the top
   of Phrases and into their own node on the path, so "the ones I keep getting
   wrong" is one tap away without disturbing the course order. */
export function starButton(phrase, className = "star") {
  const on = Boolean(phrase.favourite);
  return `<button class="${className}" data-fav="${esc(phrase.id)}" aria-pressed="${on}"
    title="${on ? "Remove from favourites" : "Add to favourites"}"
    aria-label="${on ? "Remove from favourites" : "Add to favourites"}">${STAR_SVG}</button>`;
}

export function toast(message, ms = 2600) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (toastEl.hidden = true), ms);
}

export function scoreClass(score) {
  if (score == null) return "";
  return score >= PASS_GREAT ? "good" : score >= PASS_OK ? "ok" : "bad";
}

export function scoreColour(score) {
  if (score == null) return "var(--text-3)";
  return score >= PASS_GREAT ? "var(--green)" : score >= PASS_OK ? "var(--amber)" : "var(--red)";
}

export function openSheet(title, html) {
  sheetTitle.textContent = title;
  sheetBody.innerHTML = html;
  sheet.hidden = false;
}

export function closeSheet() {
  sheet.hidden = true;
  sheetBody.innerHTML = "";
}

sheet.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-sheet")) closeSheet();
});

/* Deleting a card takes its recordings and scores with it and there's no undo,
   so every delete button asks for a second tap first. Arming is on the button
   itself rather than a confirm dialog: one thumb, no modal on top of a modal,
   and tapping anything else leaves it armed but harmless. */
export function armDelete(button, armedLabel, onConfirm) {
  if (!button) return;
  const restLabel = button.textContent;
  button.addEventListener("click", async () => {
    if (button.dataset.armed !== "1") {
      button.dataset.armed = "1";
      button.textContent = armedLabel;
      // Second thoughts are the common case — let it settle back down.
      setTimeout(() => {
        if (!button.isConnected || button.dataset.armed !== "1") return;
        delete button.dataset.armed;
        button.textContent = restLabel;
      }, 5000);
      return;
    }
    button.disabled = true;
    await onConfirm();
  });
}

/* One tap, one voice. Stops whatever is playing, then the Azure audio for this
   text if there is a key and the browser voice if there isn't. The busy flag
   is on the button rather than shared, because several of these sit on one
   screen at once. */
export async function sayAloud(button, text, failed = "Couldn't play that.") {
  if (!text.trim()) return;
  player.stop();
  browserSpeech.stop();
  if (button.dataset.busy === "1") return;
  button.dataset.busy = "1";
  button.classList.add("busy");
  try {
    const blob = await speech.modelAudio({ text, language: COURSE_LANGUAGE }, settings);
    if (blob) await player.play(blob);
    else if (browserSpeech.available(COURSE_LANGUAGE)) browserSpeech.speak(text, COURSE_LANGUAGE, { onSilent: noVoice });
    else noVoice();
  } catch {
    toast(failed);
  } finally {
    button.dataset.busy = "0";
    button.classList.remove("busy");
  }
}

/* What the assistant is told about the card it's being asked about. The lesson
   and the phrase sheet ask about a saved card, so they share this; the Add tab
   reads its half-built one out of the form fields instead. */
/* A word is not a sentence, and `genderOf` refuses text with punctuation in
   it — so a trailing full stop on a completed word costs the card its gender
   silently. Only the end is touched: an interior comma would mean it was a
   phrase after all. */
export function stripTrailingStop(value) {
  return String(value ?? "").trim().replace(/[.!?;:,]+$/, "").trim();
}

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function homeLink() {
  return `<button class="link" data-go-home="1">‹ Home</button>`;
}

/* A toothed cog, not the spoked circle the tab bar used. Under the word
   "Settings" that read fine; alone on a banner it reads as a brightness icon —
   reported on Xerra as simply not being findable, and fixed there first. */
export const COG_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.6a7.6 7.6 0 0 0 0-3.2l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-2.8-1.6L13.9 2h-3.8l-.4 2.9a7.6 7.6 0 0 0-2.8 1.6l-2.3-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3.2l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 0 0 2.8 1.6l.4 2.9h3.8l.4-2.9a7.6 7.6 0 0 0 2.8-1.6l2.3 1 2-3.4z"/></svg>`;

export function stopEverything() {
  player.stop();
  browserSpeech.stop();
  if (state.recorder.isRecording) state.recorder.cancel();
  clearInterval(state.levelTimer);
  state.levelTimer = null;
}

/* Said when the device has no voice it will actually use. It names the fix,
   because the fix is nearly always the same one: with an Azure key this never
   reaches the browser voice at all. */
export function noVoice() {
  toast(
    settings.hasAzure
      ? "No sound came out. Check the ringer switch and the volume."
      : "The browser voice didn't play. Add an Azure key in Settings for the real voices.",
    4000
  );
}

/* Compare sentences the way a person would: ignoring case, accents and the
   punctuation Spanish sprinkles around questions. */
export function normaliseSentence(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ------------------------------------------------------------------ mascot
//
// Perico the parrot. Parrots repeat what they hear, which is the entire
// pedagogy of this app. Deliberately NOT an owl.

export function parrotSVG(size = 80) {
  return `
  <svg class="parrot" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
    <ellipse cx="50" cy="62" rx="26" ry="30" fill="#58cc02"/>
    <ellipse cx="50" cy="70" rx="15" ry="19" fill="#89e219"/>
    <circle cx="50" cy="34" r="21" fill="#58cc02"/>
    <path d="M39 12 Q50 2 61 12 Q57 7 50 7 Q43 7 39 12z" fill="#ff4b4b"/>
    <path d="M44 10 Q50 4 56 10 L53 14 L47 14z" fill="#ffc800"/>
    <circle cx="42" cy="32" r="7.5" fill="#fff"/>
    <circle cx="58" cy="32" r="7.5" fill="#fff"/>
    <circle cx="43.5" cy="33" r="3.4" fill="#3c3c3c"/>
    <circle cx="56.5" cy="33" r="3.4" fill="#3c3c3c"/>
    <path d="M50 38 Q59 38 57 46 Q54 52 50 52 Q46 52 43 46 Q41 38 50 38z" fill="#ffc800"/>
    <path d="M46 51 Q50 54 54 51 L53 56 Q50 58 47 56z" fill="#e0a500"/>
    <path d="M27 55 Q18 66 26 80 Q32 72 34 62z" fill="#1cb0f6"/>
    <path d="M73 55 Q82 66 74 80 Q68 72 66 62z" fill="#1cb0f6"/>
    <path d="M44 90 L44 96 M50 90 L50 97 M56 90 L56 96" stroke="#e0a500" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

export function flameSVG() {
  return `<svg class="flame" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4-3 5.5-3 9a3.6 3.6 0 0 0 .4 1.7C7.6 12 7 10.6 7 10.6 5.6 12.4 5 14.2 5 15.7 5 19.7 8.1 22 12 22s7-2.3 7-6.3c0-4.9-5.2-7-7-13.7z"/></svg>`;
}
