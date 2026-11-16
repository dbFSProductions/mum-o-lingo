// Sobre mí: the interview and the cards it writes.

import { COURSE_LANGUAGE } from "./content.js";
import { library, settings, aboutMe, ABOUT_DECK } from "./store.js";
import { cardAssistant } from "./card-assistant.js";
import { armDelete, autosize, esc, normaliseSentence, starButton, state, toast, view } from "./core.js";
import { render } from "./app.js";
import { startPractice } from "./drill.js";
import { showPhrase } from "./phrases.js";

// ---------------------------------------------------------------- sobre mí

/* The interview, and the cards it writes.
 
   Every other card in the app arrives already written — the course in
   content.js, or something typed into Add. These are written *about Mum*, from
   a conversation held entirely in English, because a beginner cannot answer
   questions about her own life in Spanish yet. That is the whole reason it is
   an interview and not a text box: you don't know what is worth saying about
   yourself until something asks, and "tell us about you" in a blank box gets a
   blank box back.
 
   What comes out is ordinary cards of hers. They drill, star, score, level up,
   export, edit and delete exactly like a card from Add, and nothing downstream
   of `library.addPhrase` knows where they came from — `deck` names them so
   they can have a unit of their own on the path, and that is all it does. */
function interviewPayload() {
  return {
    languageCode: COURSE_LANGUAGE,
    languageName: "Spanish (Spain)",
    /* Trimmed to what the Worker will accept anyway. Its 24k body cap is
       checked on the raw request before the validator runs, so a conversation
       that ran all year has to be cut here or the whole call is rejected. */
    history: aboutMe.turns.slice(-16).map((turn) => ({ role: turn.role, text: turn.text.slice(0, 800) })),
    /* What it must not write again, sent as the English — that is what the
       assistant is choosing between, and two cards can say the same thing in
       different Spanish and still be the same card.
 
       120 characters each, and that is not cosmetic: 16 turns at their full
       800 plus 40 translations at the 300 a card may hold comes to 24.8k, over
       the 24k the Worker rejects a body at outright. Enough of a translation to
       recognise it by is all this field is for. */
    existing: aboutCards()
      .slice(-40)
      .map((phrase) => phrase.translation?.slice(0, 120))
      .filter(Boolean),
  };
}

function aboutCards() {
  return library.ownPhrases().filter((p) => p.deck === ABOUT_DECK);
}

export function renderAbout() {
  const cards = aboutCards().filter((p) => p.text.trim());
  let asking = false;
  let making = false;
  let armed = false;

  view.innerHTML = `
    <header class="home-head section-head">
      <div class="wordmark">${esc(ABOUT_DECK)}</div>
      <button class="link" id="about-back">‹ Home</button>
    </header>
    <p class="muted section-intro">${
      cards.length
        ? `${cards.length} card${cards.length === 1 ? "" : "s"} written from what you've told it.`
        : "Answer a few questions in English and it'll write you cards about your own life."
    }</p>

    ${
      /* The interview goes first and the cards it wrote go under it, the way
         Quick keeps its ask box on top and lists what it made underneath. The
         page is the workshop, and the box you talk to is what it is for; the
         cards are the record of what it has made so far. With thirty cards
         the box was a screen and a half down, which is the wrong place for
         the thing you came to do. Ported from Xerra. */
      settings.hasAssistant
        ? `<div class="section-label">${cards.length ? "Tell it more" : "Tell it about you"}</div>
           <div class="card chat-card">
             <div class="chat-log" id="about-log" hidden></div>
             <form class="chat-form" id="about-form">
               <textarea rows="1" id="about-answer" lang="en-US" autocapitalize="sentences"
                         aria-label="Your answer"></textarea>
               <button class="btn btn-primary" type="submit" id="about-send">Send</button>
             </form>
             <div class="notice bad" id="about-error" hidden></div>
             <div class="chat-foot" id="about-foot" hidden>
               <button class="link btn-danger" id="about-reset">Start the conversation again</button>
             </div>
           </div>
           <button class="btn btn-primary" id="about-make">
             ${cards.length ? "Make more cards from this" : "Create cards"}
           </button>
           <p class="tiny muted">Answer a few questions, then let it write the phrases. Come back and tell it
           more whenever you like — they're all here, behind the ${esc(ABOUT_DECK)} square.</p>`
        : `<div class="section-label">Heads up</div>
           <div class="notice">These cards are written by the card builder, so it needs its address and
           passcode. <button class="link" data-open-settings>Add them in Settings</button> and come back.</div>`
    }

    ${
      cards.length
        ? `<div class="section-label">Your cards</div>
           <button class="btn btn-primary btn-big" id="about-practise" style="width:100%;margin-bottom:12px">Practise these ${cards.length}</button>
           <div class="rows rows-spaced">
             ${cards
               .map(
                 (phrase) => `
                   <div class="row striped" style="--hue:var(--green)">
                     ${starButton(phrase)}
                     <button class="row-open" data-phrase="${esc(phrase.id)}">
                       <span class="row-main">
                         <span class="row-title">${esc(phrase.text)}</span><br>
                         <span class="row-sub">${esc(phrase.translation)}</span>
                       </span>
                       <span class="chev">›</span>
                     </button>
                   </div>`
               )
               .join("")}
           </div>`
        : ""
    }`;

  document.getElementById("about-back").onclick = () => {
    state.stage = "path";
    render();
  };
  document.getElementById("about-practise")?.addEventListener("click", () =>
    startPractice(cards.slice())
  );
  view.querySelectorAll("[data-phrase]").forEach((button) =>
    button.addEventListener("click", () => {
      const phrase = library.phraseById(button.dataset.phrase);
      if (phrase) showPhrase(phrase);
    })
  );
  view.querySelectorAll("[data-fav]").forEach((button) =>
    button.addEventListener("click", () => {
      library.toggleFavourite(button.dataset.fav);
      render();
    })
  );

  if (!settings.hasAssistant) return;

  const log = document.getElementById("about-log");
  const errorBox = document.getElementById("about-error");
  const input = document.getElementById("about-answer");
  const send = document.getElementById("about-send");
  const make = document.getElementById("about-make");

  document.getElementById("about-form").addEventListener("submit", (event) => {
    event.preventDefault();
    answer();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      answer();
    }
  });
  make.addEventListener("click", makeCards);

  /* Clearing it is armed, the same two taps deleting a card takes — it is the
     only way back from a conversation that went somewhere she didn't mean. The
     cards it already wrote are left alone: they are ordinary cards now, and
     deleting those is the phrase sheet's job. */
  armDelete(document.getElementById("about-reset"), "Tap again to clear the conversation", () => {
    aboutMe.clear();
    render();
  });

  paintLog();
  /* The first question arrives on its own. "The first time you open it, it
     asks about you" is the feature — a chat that opens with an empty box and
     waits is the blank page this exists to avoid. */
  if (!aboutMe.turns.length) nextQuestion();

  function paintLog() {
    const busy = asking || making;
    log.hidden = !aboutMe.turns.length && !busy;
    /* Shown the moment there is a conversation to clear, rather than waiting
       for the next full render — answering a question only repaints the log,
       so the way out would otherwise not appear until she left and came back.
       (Xerra still has that gap; worth porting this back.) */
    document.getElementById("about-foot").hidden = !aboutMe.turns.length;
    log.innerHTML =
      aboutMe.turns
        .map(
          (turn) =>
            `<div class="chat-msg ${turn.role === "learner" ? "user" : "assistant"}">${esc(turn.text)}</div>`
        )
        .join("") +
      (busy ? `<div class="chat-msg assistant chat-thinking"><span class="spinner"></span></div>` : "");
    log.scrollTop = log.scrollHeight;
  }

  function setBusy() {
    send.disabled = asking || making;
    make.disabled = asking || making || !aboutMe.answered;
    make.innerHTML = making
      ? `<span class="spinner"></span> Writing cards…`
      : cards.length
      ? "Make more cards from this"
      : "Create cards";
    paintLog();
  }

  /* Asked for on its own after every answer, so the conversation keeps moving
     without a "next question" button to press. A failure here leaves the
     transcript intact — the answer is already saved, and Try again asks again
     rather than making her retype it. */
  async function nextQuestion() {
    if (asking) return;
    asking = true;
    errorBox.hidden = true;
    setBusy();
    try {
      const result = await cardAssistant.interview(interviewPayload(), settings);
      /* Saved whether or not the page is still on screen. The transcript is
         persistent, so a question fetched while she was in a lesson is waiting
         when she comes back — throwing it away would mean paying for the call
         twice. `isConnected` rather than a lookup by id: a render() puts a
         *new* log in the document, and only this one being detached means
         these handles are stale. */
      aboutMe.add("assistant", result.reply);
    } catch (error) {
      if (!log.isConnected) return;
      errorBox.className = "notice bad";
      errorBox.innerHTML = `${esc(error.message)} <button class="link" id="about-retry">Try again</button>`;
      errorBox.hidden = false;
      document.getElementById("about-retry").addEventListener("click", () => nextQuestion());
    } finally {
      asking = false;
      if (log.isConnected) setBusy();
    }
  }

  function answer() {
    const text = input.value.trim();
    if (!text || asking || making) return;
    aboutMe.add("learner", text);
    input.value = "";
    autosize(input);
    setBusy();
    nextQuestion();
  }

  /* The transcript, turned into cards and saved straight away. No review step,
     unlike Add: there is no half-remembered phrase being corrected here, so
     there is nothing to check the assistant's reading against — and a batch of
     cards to approve one at a time would be the longest screen in the app. They land
     as ordinary cards, so a wrong one is edited or deleted from the phrase
     sheet like any other. */
  async function makeCards() {
    if (making || asking) return;
    if (!aboutMe.answered) {
      toast("Answer a question or two first.");
      return;
    }
    making = true;
    errorBox.hidden = true;
    setBusy();
    try {
      const result = await cardAssistant.aboutCards(interviewPayload(), settings);

      const existing = new Set(library.allPhrases().map((phrase) => normaliseSentence(phrase.text)));
      const fresh = [];
      for (const card of Array.isArray(result.cards) ? result.cards : []) {
        const key = normaliseSentence(card.text ?? "");
        // The prompt is told what it has already written, but a model asked
        // twice about the same life will eventually say the same sentence.
        if (!key || existing.has(key)) continue;
        existing.add(key);
        fresh.push(card);
      }

      if (!fresh.length) {
        if (!log.isConnected) return;
        errorBox.className = "notice";
        errorBox.textContent =
          "Nothing new came back this time. Tell it something else about yourself and try again.";
        errorBox.hidden = false;
        return;
      }

      for (const card of fresh) {
        library.addPhrase({
          text: card.text,
          translation: card.translation,
          deck: ABOUT_DECK,
          situation: card.situation || null,
          usageNote: null,
          focusNote: card.focusNote || null,
        });
      }
      /* Said back into the conversation rather than only as a toast. The next
         question is built from this transcript, so the assistant has to know
         it has already written them — and it answers "how do I get more?" in
         the one place the question occurs to you. */
      aboutMe.add(
        "assistant",
        `I've written ${fresh.length} card${fresh.length === 1 ? "" : "s"} from that, and they're behind your ${ABOUT_DECK} square now. Tell me more whenever you like and I'll write some more.`
      );
      // The cards are saved above regardless; only the telling about it needs
      // the page to still be here.
      if (!log.isConnected) return;
      toast(`${fresh.length} card${fresh.length === 1 ? "" : "s"} added. ¡Olé!`);
      render();
    } catch (error) {
      if (!log.isConnected) return;
      errorBox.className = "notice bad";
      errorBox.textContent = error.message;
      errorBox.hidden = false;
    } finally {
      making = false;
      // A successful run has just re-rendered the page; these handles belong
      // to the old one, and painting a spinner onto a detached node is the bug
      // where the button comes back disabled for no visible reason.
      if (log.isConnected) setBusy();
    }
  }
}
