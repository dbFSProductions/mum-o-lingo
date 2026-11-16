// Add a word and Add a card.

import { COURSE_LANGUAGE } from "./content.js";
import { library, settings, WORDS_DECK } from "./store.js";
import { cardAssistant } from "./card-assistant.js";
import {
  autosize, autosizeAll, esc, homeLink, normaliseSentence, sayAloud, state, stopEverything,
  stripTrailingStop, toast, view,
} from "./core.js";
import { render } from "./app.js";
import { cardChatPanel, chatContext } from "./ask.js";
import { startPractice } from "./drill.js";
import { PICTURE_REQUEST, genderField, genderHint, parsePicture, reimagineRequest } from "./pictures.js";
import { repliesBlock, wireReplies } from "./replies.js";

// ----------------------------------------------------------------- phrases

/* Add a word — the vocabulary composer, and the thing the app could not do
   until now.

   `/complete-card` writes a *phrase*: a situation, a usage note, a
   pronunciation tip, replies. There was no way to author `sounds` and
   `picture` at all — they arrived with the seed content, or you added a phrase
   and then reached for the editor's "Invent a picture for me" on a card that
   already existed. So the Words section was read-only in practice, which is a
   strange thing for a section to be in an app whose whole point is that you
   add what you personally keep losing.

   It is deliberately not a second Add tab with a type picker at the top. You
   press "Add a word" from inside Words, so the kind is already decided by the
   time the form opens, and the form asks only what a word needs.

   Almost all of it is parts that already existed: `composerField`,
   `genderField`, `deckField`, and the editor's own picture call. It uses the
   editor's field ids (`f-text`, `f-translation`, `f-sounds`, `f-picture`) so
   `wirePictureAI` works here verbatim rather than being copied — which is why
   that function now optional-chains the boxes a word hasn't got. */
export function renderAddWord() {
  const defaultDeck = WORDS_DECK;

  view.innerHTML = `
    <header class="home-head section-head">
      <div class="wordmark">Add a word</div>
      ${homeLink()}
    </header>
    <p class="muted add-intro">Put in the word <em>or</em> the English — whichever you have — and the rest can be
      filled in for you: the other side, the gender, the sound it hides, and a scene to hang it on. Write your own
      picture if you have a better one.</p>

    ${
      settings.hasAssistant
        ? ""
        : `<div class="notice add-setup">Without the card assistant you can still add the word and write your own
             picture — the invent button needs the Worker address and passcode.
             <button class="link" id="open-assistant-settings">Set it up</button></div>`
    }

    <div class="card add-card">
      <div class="field">
        <div class="field-head">
          <label for="f-text">The word</label>
        </div>
        <textarea id="f-text" rows="1" lang="${COURSE_LANGUAGE}" autocapitalize="none"></textarea>
      </div>

      <div class="field">
        <div class="field-head">
          <label for="f-translation">English</label>
        </div>
        <textarea id="f-translation" rows="1" lang="en-GB" autocapitalize="none"></textarea>
      </div>

      ${genderField(null, "f-gender")}

      ${
        settings.hasAssistant
          ? `<button class="btn btn-primary" id="word-fill" style="width:100%;margin-bottom:10px">Fill in the rest for me</button>`
          : ""
      }
      <div id="f-picture-note" class="notice" hidden></div>

      <label class="field"><span>Sounds like</span>
        <textarea id="f-sounds" rows="2"></textarea></label>
      <label class="field"><span>Picture</span>
        <textarea id="f-picture" rows="3"></textarea></label>
      <p class="tiny muted" style="margin:-6px 0 12px">Describe your own scene here and it will be kept — a picture
        you invented outlasts one you were handed. Leave it empty and one will be made for you.</p>

      

      <div class="btn-row">
        <button class="btn" id="word-save">Save and add another</button>
        <button class="btn btn-primary" id="word-practise">Save and practise now</button>
      </div>
      <div id="word-error" class="notice bad" hidden></div>
    </div>`;

  document.getElementById("open-assistant-settings")?.addEventListener("click", () => {
    stopEverything();
    state.tab = "settings";
    render();
  });

  wireWordFill();

  /* "Fill in the rest for me" — one press for the whole card.

     It replaced a picture-only button, which could not run until both language
     boxes were filled and so made you do the app's job before it would help.
     Two calls, in order, because they answer different questions and the second
     needs the first's answer:

     1. `/complete-card` for the missing side. Whichever box you left empty is
        what it fills — the word from the English, or the English from the word.
        Skipped entirely when both are already there, so a card you typed out in
        full costs one call rather than two.
     2. `/chat` for the sound bridge and the scene, exactly as the editor asks
        for them, using the *completed* word rather than what was in the box —
        a bridge built from a blank is nothing.

     **A picture you wrote yourself is never overwritten.** Only `sounds` is
     taken in that case, which is the one thing you cannot reasonably work out
     and the reason the whole call still runs. The gender needs no call at all:
     it is read off the article once the word is in the box. */
  function wireWordFill() {
    const button = document.getElementById("word-fill");
    if (!button) return;
    const noteBox = document.getElementById("f-picture-note");
    const soundsField = document.getElementById("f-sounds");
    const pictureField = document.getElementById("f-picture");
    const englishField = document.getElementById("f-translation");
    /* What we last put in each box, so a second press can tell its own
       handiwork from yours. Per screen — a fresh Add a word starts empty.

       The picture was the first field to need this, and the word was the next:
       skipping the completion "because both boxes are full" meant that once we
       had filled the word in, changing the English never changed it back. Every
       box the app writes to needs the same question asked of it, and **the
       answer is never "is it non-empty"**. */
    const lastMade = { word: "", english: "", sounds: "", picture: "" };

    button.onclick = async () => {
      const had = { text: textField.value.trim(), english: englishField.value.trim() };
      if (!had.text && !had.english) {
        noteBox.className = "notice bad";
        noteBox.textContent = `Put in the Spanish word or its English first — either will do.`;
        noteBox.hidden = false;
        return;
      }
      /* Whether the scene in the box is one you wrote or one we last wrote.

         "Never overwrite yours" was measured by "is the box empty", so the
         moment we filled it the next press treated our own sentence as yours
         and kept it — change the English, press again, and every field refilled
         except the picture, which went on describing the old word. So we
         remember what we put there: untouched since, it is ours to replace;
         edited at all, it is yours and it stays. */
      const inBox = pictureField.value.trim();
      const mine = inBox && inBox !== lastMade.picture ? inBox : "";
      button.disabled = true;
      button.innerHTML = `<span class="spinner"></span> Working on it…`;
      noteBox.hidden = true;
      try {
        let word = had.text;
        let english = had.english;

        /* Which side is *yours*: typed or edited by you, rather than left as we
           last wrote it. Whichever side is yours is the brief; the other is
           dropped so the completion writes it again from what you changed.

           Same judgement the editor's AI rebuild makes about which side to
           send — change the Spanish but not the English and sending both would
           ask the assistant to reconcile a contradiction. */
        const yoursWord = word && word !== lastMade.word ? word : "";
        const yoursEnglish = english && english !== lastMade.english ? english : "";
        // Nothing of ours left to refresh, and nothing missing: no call needed.
        const settled = yoursWord && yoursEnglish;

        if (!settled) {
          const result = await cardAssistant.complete(
            {
              target: yoursWord || (yoursEnglish ? "" : word),
              english: yoursEnglish || (yoursWord ? "" : english),
              /* It is a vocabulary card, not a phrase, and /complete-card
                 writes phrases by default — it came back with "Un gos." for
                 "dog". That matters beyond looking odd: `genderOf` refuses any
                 text carrying punctuation, so a trailing full stop silently
                 costs the card its gender. */
              /* The article is asked for on a noun and only on a noun. It was
                 "given with its article" flat, and the model obeyed: "ahora"
                 came back as "el ahora", which is not a word anybody says —
                 and `genderOf` then read the invented article and painted an
                 adverb blue. */
              situation: SINGLE_WORD_SITUATION,
              deck: WORDS_DECK,
              languageCode: COURSE_LANGUAGE,
              languageName: "Spanish (Spain)",
            },
            settings
          );
          // The page can be gone by now — you left while it was thinking.
          if (!document.getElementById("f-text")) return;
          // Belt and braces on the same point: a word never ends in a stop.
          word = stripTrailingStop(result.text) || word;
          english = stripTrailingStop(result.translation) || english;
          textField.value = word;
          englishField.value = english;
          lastMade.word = word;
          lastMade.english = english;
          textField.dispatchEvent(new Event("input"));
        }

        const { reply } = await cardAssistant.chat(
          {
            /* `language` and `deck` are what chatContext turns into
               languageCode/languageName, and the Worker refuses the call
               without them — "Choose a language first." Every press got as far
               as filling the word and then failed. */
            ...chatContext({
              text: word,
              translation: english,
              language: COURSE_LANGUAGE,
              deck: WORDS_DECK,
              replies: [],
            }),
            history: [{ role: "user", text: mine ? reimagineRequest({ sounds: "", picture: mine }) : PICTURE_REQUEST }],
          },
          settings
        );
        if (!document.getElementById("f-picture")) return;
        const made = parsePicture(reply);
        // Same question of the sounds box: ours to replace, yours to leave.
        const inSounds = soundsField.value.trim();
        const yoursSounds = inSounds && inSounds !== lastMade.sounds;
        if (made.sounds && !yoursSounds) {
          soundsField.value = made.sounds;
          lastMade.sounds = made.sounds;
        }
        // Yours stays yours; ours is replaced, and an empty box is filled.
        if (!mine && made.picture) {
          pictureField.value = made.picture;
          lastMade.picture = made.picture;
        }
        autosize(soundsField);
        autosize(pictureField);
        autosizeAll(view);
        noteBox.className = "notice";
        noteBox.textContent = mine
          ? "Have a look — your picture was kept, and it only counts once you Save."
          : "Have a look — change anything that isn't yours, and it only counts once you Save.";
        noteBox.hidden = false;
      } catch (error) {
        noteBox.className = "notice bad";
        noteBox.textContent = error.message;
        noteBox.hidden = false;
      } finally {
        button.disabled = false;
        button.textContent = "Fill in the rest for me";
      }
    };
  }

  /* The gender select's first option reads the article off the word, so it has
     to follow the box rather than being decided once at render — you have not
     typed the word yet when this is drawn. */
  const textField = document.getElementById("f-text");
  const genderSelect = document.getElementById("f-gender");
  textField.addEventListener("input", () => {
    paintGenderHint();
  });

  genderSelect.addEventListener("change", paintGenderHint);

  function paintGenderHint() {
    const hint = view.querySelector('[data-gender-hint="f-gender"]');
    if (hint) hint.textContent = genderHint(textField.value, genderSelect.value);
  }

  document.getElementById("word-save").onclick = () => saveWord({ practise: false });
  document.getElementById("word-practise").onclick = () => saveWord({ practise: true });

  function saveWord({ practise }) {
    const errorBox = document.getElementById("word-error");
    const text = textField.value.trim();
    const translation = document.getElementById("f-translation").value.trim();
    const picture = document.getElementById("f-picture").value.trim();
    const deck = WORDS_DECK;

    const fail = (message) => {
      errorBox.textContent = message;
      errorBox.hidden = false;
    };
    errorBox.hidden = true;

    /* One side is enough. The scene needs both, but *filling in* the missing
       one is what the assistant is for — insisting on both up front made you do
       the app's job before it would take the card. A picture is optional too:
       file the word now, hang something on it later. */
    if (!text && !translation) {
      return fail(`Put in the Spanish word or its English — either will do.`);
    }
    const duplicate =
      text &&
      library.allPhrases().some((phrase) => normaliseSentence(phrase.text) === normaliseSentence(text));
    if (duplicate) return fail("That word is already in the library.");

    const saved = library.addPhrase({
      text,
      translation,
      deck,
      gender: genderSelect.value || null,
      sounds: document.getElementById("f-sounds").value.trim() || null,
      picture: picture || null,
    });

    if (practise) {
      stopEverything();
      const queue = library.ownPhrases().filter((p) => p.deck === WORDS_DECK && p.text.trim());
      const at = queue.findIndex((p) => p.id === saved.id);
      state.tab = "learn";
      state.section = null;
      toast("Added to your words.");
      startPractice(at > 0 ? [...queue.slice(at), ...queue.slice(0, at)] : queue);
      return;
    }
    renderAddWord();
    toast("Added to your words. Next one?");
  }
}

/* The situation the Add-a-word screen sends to /complete-card. It is a brief
   for a single vocabulary word, and the article is conditional on purpose:
   said flat, "with its article" makes the model bolt one onto anything —
   "el ahora", "la siempre" — and the word is then wrong on the card and
   wrongly gendered underneath it. */
const SINGLE_WORD_SITUATION =
  "A single vocabulary word for a flashcard, not a sentence. If the word is a noun, give it with its definite article. If it is anything else — an adverb, a verb, an adjective, a question word — give the bare word and never invent an article for it.";

// --------------------------------------------------------------------- add
//
// The AI card builder, ported from Xerra. Mum types whatever she can remember
// — in Spanish, in English, or a mangled mix — and the Worker returns a
// corrected card with the meaning, the setting and a pronunciation tip. The
// Gemini key never leaves Cloudflare; this app only holds the shared passcode.

export function renderAdd() {
  /* Not a form field, so it lives here rather than in the DOM: whatever the
     last completion's replies came back as, saved with the card and replaced
     by the next "Try again". The token guards against a slow set landing after
     a different card has been asked for. */
  let replies = [];
  let repliesToken = 0;
  /* What she typed, kept raw, so the review's Undo can put her own words back.
     The completion overwrites all three inputs with its corrected versions,
     and "be clearer about the situation" is much easier to do from what she
     wrote than from the assistant's rewrite of it. Held out here rather than
     inside completeCard because Undo is now part of the review's own hint line
     and is wired once, not rebuilt per completion. */
  let before = null;

  /* Situation is the first box in the composer, not the last. It is what the
     rest of the card is built from — the assistant reads it to decide what a
     person would actually say — and under the two language boxes it read as an
     afterthought and got skipped. It stays labelled optional because it is:
     completeCard still needs Spanish or English, so this box on its own can't
     build a card. */
  view.innerHTML = `
    <header class="home-head section-head">
      <div class="wordmark">Add a card</div>
      ${homeLink()}
    </header>
    <p class="muted add-intro">Start with the situation — it's what the rest of the card is built from.
      Then write whatever you remember, in Spanish or English, and Perico's clever cousin
      will fix it up.</p>

    ${
      settings.hasAssistant
        ? ""
        : `<div class="notice add-setup">The card builder needs its address and passcode.
             <button class="link" id="open-assistant-settings">Set it up</button></div>`
    }

    <div class="card add-card">
      <div class="field situation-field">
        <label for="add-situation">Situation <span class="muted">(optional)</span></label>
        <textarea id="add-situation" rows="2" lang="en-US"></textarea>
      </div>

      ${composerField("add-target", "Spanish", COURSE_LANGUAGE, true)}
      <div class="language-divider"><span>or</span></div>
      ${composerField("add-english", "English", "en-US", true)}

      <button class="btn btn-primary btn-big add-complete" id="complete-card">Build the card</button>
      <div id="add-error" class="notice bad" hidden></div>
    </div>

    <section id="card-preview" hidden>
      <div class="section-label">Check it over</div>
      <div class="card add-card">
        <div class="preview-line">
          <button class="reply-play" id="preview-say" aria-label="Listen to this card">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>
          </button>
          <span class="reply-main">
            <span class="reply-text" id="preview-text"></span>
            <span class="reply-translation" id="preview-translation"></span>
          </span>
        </div>
        <div id="review-note" class="notice"></div>
        <p class="tiny muted regen-hint">Not what you meant?
          <button class="link" id="edit-inputs">Change the situation, Spanish or English</button>
          above, then <button class="link" id="try-again">generate again</button>.
          Or <button class="link" id="undo-complete">undo</button> to get your own words back.</p>
        <label class="field"><span>How it's used</span>
          <textarea id="result-usage" rows="3"></textarea></label>
        <label class="field"><span>Pronunciation tip</span>
          <textarea id="result-focus" rows="3"></textarea></label>
        <section id="result-replies"></section>
        <div class="btn-row">
          <button class="btn" id="save-another">Save and add another</button>
          <button class="btn btn-primary" id="save-practise">Save and practise now</button>
        </div>
      </div>
    </section>

    <section id="add-chat" hidden></section>

    <div class="card">
      <p class="tiny muted" style="margin:0">
        Saved cards join <strong>Lo tuyo</strong> on the path, five to a lesson, and show up in Repaso.
      </p>
    </div>`;

  autosizeAll(view);

  document.getElementById("open-assistant-settings")?.addEventListener("click", () => {
    state.tab = "settings";
    render();
  });

  const completeButton = document.getElementById("complete-card");
  const tryAgain = document.getElementById("try-again");
  completeButton.addEventListener("click", completeCard);
  tryAgain.addEventListener("click", completeCard);
  document.getElementById("undo-complete").addEventListener("click", undoCompletion);
  document.getElementById("save-another").addEventListener("click", () => saveCard({ practise: false }));
  document.getElementById("save-practise").addEventListener("click", () => saveCard({ practise: true }));

  /* Hear the card before committing to it. Same button and same voice as a
     reply, one size up, and it reads the *field* rather than a snapshot of the
     completion — the Spanish stays editable right up until Save, and a preview
     saying something other than what's in the box would be worse than none. */
  document.getElementById("preview-say").addEventListener("click", (event) => {
    const text = document.getElementById("add-target").value.trim();
    if (!text) return toast("There's no Spanish to say yet.");
    sayAloud(event.currentTarget, text, "Couldn't play the card.");
  });

  // Both boxes stay live, so the preview line follows what she types into them.
  for (const id of ["add-target", "add-english"])
    document.getElementById(id).addEventListener("input", paintPreview);

  /* The fields "generate again" re-reads are at the top of the page and it is
     down here, and on a phone they are never on screen together — so it read
     as "roll the dice again" rather than "I'll use what you change". This
     scrolls the composer back into view and puts the cursor in Situation,
     which is usually the field that needed to be clearer. */
  document.getElementById("edit-inputs").addEventListener("click", () => {
    document.querySelector(".add-card").scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("add-situation").focus({ preventScroll: true });
  });

  function paintPreview() {
    document.getElementById("preview-text").textContent =
      document.getElementById("add-target").value.trim() || "No Spanish yet";
    document.getElementById("preview-translation").textContent =
      document.getElementById("add-english").value.trim();
  }

  async function completeCard() {
    const target = document.getElementById("add-target").value.trim();
    const english = document.getElementById("add-english").value.trim();
    if (!target && !english) {
      toast("Write something in Spanish or English first.");
      return;
    }
    if (!settings.hasAssistant) {
      toast("Set the card builder up in Settings first.");
      return;
    }

    before = {
      target: document.getElementById("add-target").value,
      english: document.getElementById("add-english").value,
      situation: document.getElementById("add-situation").value,
    };

    setAddBusy(true);
    const errorBox = document.getElementById("add-error");
    errorBox.hidden = true;
    try {
      const result = await cardAssistant.complete(
        {
          target,
          english,
          situation: document.getElementById("add-situation").value.trim(),
          deck: "Mum-o-lingo",
          languageCode: COURSE_LANGUAGE,
          languageName: "Spanish (Spain)",
        },
        settings
      );
      // She may have wandered off to another tab while it thought.
      if (state.tab !== "add") return;

      document.getElementById("add-target").value = result.text;
      document.getElementById("add-english").value = result.translation;
      document.getElementById("add-situation").value = result.situation;
      document.getElementById("result-usage").value = result.usageNote;
      document.getElementById("result-focus").value = result.focusNote;
      paintPreview();

      /* What the assistant did and why, directly under the card it did it to —
         it is what she reads to decide whether this card is right, so it sits
         with the card rather than at the top of the panel. Always shown, with
         a fallback line: a completion that came back with no reviewNote would
         otherwise leave the hint below it hanging on nothing. */
      document.getElementById("review-note").textContent =
        result.reviewNote || "Built from what you typed. Check it over, then save it.";
      document.getElementById("card-preview").hidden = false;
      // Sized after unhiding — a display:none box has no height to measure.
      autosizeAll(view);
      askForReplies();

      // A fresh panel per card: a new card means a new conversation.
      cardChatPanel(document.getElementById("add-chat"), "Ask about this card", () => ({
        languageCode: COURSE_LANGUAGE,
        languageName: "Spanish (Spain)",
        deck: "Mum-o-lingo",
        card: {
          text: document.getElementById("add-target").value.trim(),
          translation: document.getElementById("add-english").value.trim(),
          situation: document.getElementById("add-situation").value.trim(),
          usageNote: document.getElementById("result-usage").value.trim(),
          focusNote: document.getElementById("result-focus").value.trim(),
          // Whatever askForReplies has landed by the time she asks — the card
          // on screen is the card the question is about.
          replies,
        },
      }));
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.hidden = false;
    } finally {
      setAddBusy(false);
    }

  }

  /* Undo withdraws the whole completion, not just the wording: the usage note,
     the tip and the replies all answered the card being taken back. She is
     left with what she typed, in the boxes she typed it in. */
  function undoCompletion() {
    if (!before) return;
    document.getElementById("add-target").value = before.target;
    document.getElementById("add-english").value = before.english;
    document.getElementById("add-situation").value = before.situation;
    // A reply still in flight now answers a card that no longer exists.
    repliesToken++;
    replies = [];
    document.getElementById("card-preview").hidden = true;
    document.getElementById("add-chat").hidden = true;
    paintPreview();
    autosizeAll(view);
    document.querySelector(".add-card").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* Two ways out of a finished card, because there are two things she might be
     doing. Writing down a run of phrases in one sitting wants the form back,
     empty; jotting the one she has just been stuck on wants to go and say it.
     Practise is the primary — the point of the card is saying it, and a card
     saved and never drilled is where this app leaks. */
  function saveCard({ practise }) {
    const text = document.getElementById("add-target").value.trim();
    const translation = document.getElementById("add-english").value.trim();
    if (!text || !translation) {
      toast("It needs the Spanish and the English before saving.");
      return;
    }
    const duplicate = library
      .allPhrases()
      .some((phrase) => normaliseSentence(phrase.text) === normaliseSentence(text));
    if (duplicate) {
      toast("That one's already in Phrases.");
      return;
    }

    const saved = library.addPhrase({
      text,
      translation,
      situation: document.getElementById("add-situation").value.trim() || null,
      usageNote: document.getElementById("result-usage").value.trim() || null,
      focusNote: document.getElementById("result-focus").value.trim() || null,
    });
    // Replies are stored beside the card by id, like her stars and her edits,
    // because a course card is code and can't carry them either.
    library.setReplies(saved.id, replies);

    if (practise) {
      // The card she just wrote, straight away — the same one-card queue the
      // phrase sheet's "Practise now" starts.
      state.tab = "learn";
      toast("Saved to Lo tuyo. ¡Olé!");
      startPractice([library.phraseById(saved.id) ?? saved]);
      return;
    }
    renderAdd();
    toast("Saved to Lo tuyo. ¿Otra?");
  }

  /* Fired after the card is on screen and never awaited. Card generation used
     to carry the replies, which roughly doubled its output and pushed it past
     the Worker's per-attempt timeout — the Add tab spun for a minute and then
     said Gemini was busy. Now the card lands at its old speed, Save is ready
     immediately, and a failure here costs nothing but the section. */
  function askForReplies() {
    const box = document.getElementById("result-replies");
    const token = ++repliesToken;
    replies = [];
    box.innerHTML = `<p class="tiny muted"><span class="spinner"></span> Asking what you'd hear back…</p>`;

    cardAssistant
      .replies(
        {
          text: document.getElementById("add-target").value.trim(),
          translation: document.getElementById("add-english").value.trim(),
          situation: document.getElementById("add-situation").value.trim(),
          deck: "Mum-o-lingo",
          languageCode: COURSE_LANGUAGE,
          languageName: "Spanish (Spain)",
        },
        settings
      )
      .then((result) => {
        const current = document.getElementById("result-replies");
        if (token !== repliesToken || !current) return;
        replies = Array.isArray(result.replies) ? result.replies : [];
        current.innerHTML = replies.length
          ? repliesBlock(replies)
          : `<p class="tiny muted">Nothing much gets said back to this one.</p>`;
        wireReplies(current, replies, () => ({ text: document.getElementById("add-target")?.value }));
      })
      .catch(() => {
        const current = document.getElementById("result-replies");
        if (token !== repliesToken || !current) return;
        current.innerHTML =
          `<p class="tiny muted">Couldn't fetch what you'd hear back — the card is fine to save, and the phrase sheet can ask again later.</p>`;
      });
  }

  /* Both buttons run the same completion, and after the first one the review's
     is the one she is looking at — so it gets its own spinner rather than just
     greying out while a button off the top of the screen does the talking. */
  function setAddBusy(busy) {
    completeButton.disabled = busy;
    tryAgain.disabled = busy;
    completeButton.innerHTML = busy ? `<span class="spinner"></span> Building…` : "Build the card";
    // A link inside a sentence now, so it says its piece in lower case and
    // keeps the sentence readable while it spins.
    tryAgain.innerHTML = busy ? `<span class="spinner"></span> generating…` : "generate again";
  }
}

/* `lang` on the box is what dictation runs on now: it is what tells the phone
   keyboard's own microphone which language to type, so the Spanish box takes
   Spanish and the English one takes English without the app owning a button.
   The in-app dictate buttons that used to sit beside these labels are gone —
   see the note in CLAUDE.md before adding them back. */
function composerField(id, label, locale, required = false) {
  return `<div class="field">
    <label for="${id}">${esc(label)}${required ? "" : ` <span class="muted">(optional)</span>`}</label>
    <textarea id="${id}" rows="3" lang="${locale}" autocapitalize="sentences"></textarea>
  </div>`;
}
