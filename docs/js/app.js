// Mum-o-lingo — the entry point: boot, the render dispatcher, goHome and the one delegated listener on the view.
//
// The drill mechanics (record, analyse, compare, score) are ported from Xerra;
// the shell around them is a Duolingo-style course: a winding path of small
// lessons, a progress bar, result banners, streaks and a celebration screen.
//
// Nothing is locked. Every node is open from the first launch — the ticks and
// the streak record what Mum has done, they don't gate what she may do next.

import { library, settings, progress, aboutMe } from "./store.js";
import { state, stopEverything, view } from "./core.js";
import { renderAbout } from "./about.js";
import { renderAdd, renderAddWord } from "./add.js";
import { renderComplete, renderDrill } from "./drill.js";
import { renderPath } from "./path.js";
import { renderPhrases } from "./phrases.js";
import { renderQuick } from "./quick.js";
import { drawCanvases } from "./score.js";
import { renderSettings } from "./settings.js";

// -------------------------------------------------------------------- tabs

/* There is no tab bar any more. The home screen is the wordmark, four tiles
   and the path, and everything else is reached from it — so this is the way
   back, and every page below prints `homeLink()`.

   Ported from Xerra, where the same four buttons had the same problem: they
   were never peers. Learn was the home screen, Phrases and Add were things you
   do occasionally, Settings rarer still. */
function goHome() {
  stopEverything();
  state.tab = "learn";
  state.stage = "path";
  state.lesson = null;
  state.section = null;
  render();
}

view.addEventListener("click", (event) => {
  if (event.target.closest("[data-go-home]")) return goHome();
  if (event.target.closest("[data-open-settings]")) {
    stopEverything();
    state.tab = "settings";
    render();
    return;
  }
  if (event.target.closest("[data-open-add]")) {
    stopEverything();
    state.tab = "add";
    render();
    return;
  }
  if (event.target.closest("[data-add-word]")) {
    stopEverything();
    state.tab = "add-word";
    render();
  }
});

// ------------------------------------------------------------------ render

export function render() {
  // Sobre mí keeps the tab bar: it is a place you go, not a lesson you are in.
  const inLesson = state.tab === "learn" && (state.stage === "drill" || state.stage === "complete");
  document.body.classList.toggle("in-lesson", inLesson);
  // Scroll to the top only when moving to a different screen. Re-renders of
  // the same screen (the Azure score landing, revealing the translation)
  // must not jump the page — that was hiding the waveform comparison.
  const screen = `${state.tab}:${state.tab === "learn" ? `${state.stage}:${state.section ?? ""}` : ""}`;
  if (screen !== render.lastScreen) window.scrollTo(0, 0);
  render.lastScreen = screen;
  if (state.tab === "learn") {
    if (state.stage === "drill") return renderDrill();
    if (state.stage === "complete") return renderComplete();
    if (state.stage === "about") return renderAbout();
    if (state.section === "phrases") return renderPhrases();
    if (state.section === "quick") return renderQuick();
    return renderPath(state.section);
  }
  if (state.tab === "add") return renderAdd();
  if (state.tab === "add-word") return renderAddWord();
  return renderSettings();
}

// -------------------------------------------------------------------- boot

settings.load();
library.load();
progress.load();
aboutMe.load();
state.showTranslation = settings.showTranslationUpFront;
render();

// Voice list on Safari populates asynchronously.
window.speechSynthesis?.getVoices?.();
window.speechSynthesis?.addEventListener?.("voiceschanged", () => {});

window.addEventListener("resize", () => {
  if (state.tab === "learn" && state.stage === "drill") drawCanvases();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
