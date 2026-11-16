// Quick: one box, one button, the phrase.

import { COURSE_LANGUAGE } from "./content.js";
import { library, settings, QUICK_DECK } from "./store.js";
import { cardAssistant } from "./card-assistant.js";
import { autosize, esc, homeLink, sayAloud, state, toast, view } from "./core.js";
import { startPractice } from "./drill.js";
import { showPhrase } from "./phrases.js";

/* Quick — the phrase you need in the next thirty seconds.

   Everything else here is practice arranged in advance: a lesson somebody
   wrote, a card you typed in when you had time. This is the other direction.
   You are outside a pharmacy, you do not know how to ask for your medicine,
   and you have about as long as it takes to open the door. One box, one
   button, the phrase, and a Listen you can hit twice on the way in.

   Ported from Xerra. It writes an ordinary card into an ordinary deck —
   QUICK_DECK is a name and nothing more, so what Quick collects drills, stars,
   scores, exports and deletes like anything else. It is saved as it arrives
   rather than on a "keep it" tap, because the failure this guards against is
   the phrase scrolling away while you are talking. "Don't keep it" is the
   undo, and it is one tap. */
export function renderQuick() {
  view.innerHTML = `
    <header class="home-head section-head">
      <div class="wordmark">Quick</div>
      ${homeLink()}
    </header>
    <p class="muted section-intro">One phrase, right now.</p>
    ${
      settings.hasAssistant
        ? `<div class="card">
             <label class="field"><span>What do you need to say, and where?</span>
               <textarea id="quick-ask" lang="en-GB" rows="2"></textarea></label>
             <button class="btn btn-primary" id="quick-go" style="width:100%">Get the phrase</button>
             <div class="notice bad" id="quick-error" hidden></div>
           </div>`
        : `<div class="notice">Quick needs the card builder. Set it up in Settings and this becomes one box
             you can ask for a phrase from.</div>`
    }
    <div id="quick-answer"></div>
    <div id="quick-recent"></div>`;

  document.getElementById("quick-go")?.addEventListener("click", ask);
  paintAnswer();
  paintRecent();

  /* Painted in place rather than through render(), for the reason the drill
     repaints its own star: a re-render here would throw away what you are
     looking at. */
  function paintAnswer() {
    const box = document.getElementById("quick-answer");
    /* Looked up again rather than trusted: the card can be deleted from its own
       phrase sheet while `state.quick` goes on holding the object it was. */
    const phrase = state.quick && library.phraseById(state.quick.id);
    if (!phrase) {
      box.innerHTML = "";
      return;
    }
    box.innerHTML = `
      <div class="card quick-card striped" style="--hue:var(--orange)">
        <p class="quick-phrase" lang="${esc(COURSE_LANGUAGE)}">${esc(phrase.text)}</p>
        <p class="quick-english">${esc(phrase.translation)}</p>
        <button class="btn btn-primary quick-listen" data-quick-say>Listen</button>
        ${phrase.focusNote ? `<div class="focus-note"><strong>Tip</strong><span>${esc(phrase.focusNote)}</span></div>` : ""}
        ${phrase.usageNote ? `<p class="small muted" style="margin:10px 0 0">${esc(phrase.usageNote)}</p>` : ""}
        <p class="small muted quick-kept">Kept in your <b>${esc(QUICK_DECK)}</b> pile.</p>
        <div class="btn-row">
          <button class="btn" data-quick-drill>Practise it</button>
          <button class="link btn-danger" data-quick-drop>Don't keep it</button>
        </div>
      </div>`;

    const say = box.querySelector("[data-quick-say]");
    say.addEventListener("click", () => sayAloud(say, phrase.text));
    box.querySelector("[data-quick-drill]").addEventListener("click", () => {
      const queue = library
        .ownPhrases()
        .filter((p) => p.deck === QUICK_DECK && p.text.trim());
      const at = queue.findIndex((p) => p.id === phrase.id);
      state.quick = null;
      startPractice(at > 0 ? [...queue.slice(at), ...queue.slice(0, at)] : queue);
    });
    box.querySelector("[data-quick-drop]").addEventListener("click", async () => {
      await library.removePhrase(phrase.id);
      state.quick = null;
      paintAnswer();
      paintRecent();
      toast("Thrown away.");
    });
  }

  /* What you have asked for before, newest first — the answer to "what did I
     need yesterday?" belongs on the page where you needed it. */
  function paintRecent() {
    const box = document.getElementById("quick-recent");
    const recent = library
      .ownPhrases()
      .filter((p) => p.deck === QUICK_DECK && p.text.trim() && p.id !== state.quick?.id)
      .slice(-8)
      .reverse();
    if (!recent.length) {
      box.innerHTML = "";
      return;
    }
    box.innerHTML = `
      <div class="section-label">Asked for before</div>
      <div class="rows rows-spaced">
        ${recent
          .map(
            (phrase) => `
              <div class="row striped" style="--hue:var(--orange)">
                <button class="row-open" data-quick-open="${esc(phrase.id)}">
                  <span class="row-main">
                    <span class="row-title">${esc(phrase.text)}</span>
                    <span class="row-sub">${esc(phrase.translation)}</span>
                  </span>
                  <span class="chev">›</span>
                </button>
              </div>`
          )
          .join("")}
      </div>`;
    box.querySelectorAll("[data-quick-open]").forEach((button) =>
      button.addEventListener("click", () => {
        const phrase = library.phraseById(button.dataset.quickOpen);
        if (phrase) showPhrase(phrase);
      })
    );
  }

  async function ask() {
    const field = document.getElementById("quick-ask");
    const line = field.value.trim();
    const button = document.getElementById("quick-go");
    const errorBox = document.getElementById("quick-error");
    if (!line) {
      field.focus();
      return;
    }
    errorBox.hidden = true;
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> Asking\u2026`;
    try {
      /* deck, languageCode and languageName are required by the Worker's
         validateDraft and are not optional here just because this fork has one
         language and Quick has one deck — leaving them off returns 400 "Choose
         a language and deck", which is how this shipped broken. */
      const result = await cardAssistant.complete(
        {
          target: "",
          english: "",
          situation: "",
          ask: line,
          deck: QUICK_DECK,
          languageCode: COURSE_LANGUAGE,
          languageName: "Spanish (Spain)",
        },
        settings
      );
      if (state.section !== "quick") return;
      if (!result.text?.trim()) throw new Error("Nothing came back. Try asking again.");
      state.quick = library.addPhrase({
        text: result.text,
        translation: result.translation || line,
        deck: QUICK_DECK,
        situation: result.situation || null,
        usageNote: result.usageNote || null,
        focusNote: result.focusNote || null,
      });
      field.value = "";
      autosize(field);
      paintAnswer();
      paintRecent();
    } catch (error) {
      if (state.section !== "quick") return;
      errorBox.textContent = error.message;
      errorBox.hidden = false;
    } finally {
      if (state.section === "quick") {
        button.disabled = false;
        button.textContent = "Get the phrase";
      }
    }
  }
}
