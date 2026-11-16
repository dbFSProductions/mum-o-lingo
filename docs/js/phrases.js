// All Phrases, the phrase sheet, and the editor with its AI rebuild.

import { COURSE, COURSE_LANGUAGE } from "./content.js";
import { library, settings, audioStore, ABOUT_DECK, attemptScore, aspectOf } from "./store.js";
import { cardAssistant } from "./card-assistant.js";
import {
  armDelete, autosizeAll, closeSheet, esc, homeLink, openSheet, player, scoreColour, sheetBody,
  starButton, state, toast, view,
} from "./core.js";
import { render } from "./app.js";
import { cardChatPanel, chatContext, notesBlock } from "./ask.js";
import { deletePhrase, startPractice } from "./drill.js";
import { genderField, pictureBlock, wirePicture, wirePictureAI } from "./pictures.js";
import { fetchReplies, repliesBlock, wireReplies } from "./replies.js";

export function renderPhrases() {
  const all = library.allPhrases();
  const captures = library.captures();

  view.innerHTML = `
    <header class="home-head section-head">
      <div class="wordmark">Phrases</div>
      ${homeLink()}
    </header>
    <p class="muted section-intro">${all.length} card${all.length === 1 ? "" : "s"} — the whole course plus your own,
      all of it open.</p>
    <button class="btn section-add" data-open-add>Add a card</button>
    <label class="field"><input type="search" id="search" placeholder="Search"></label>
    <div id="phrase-list"></div>`;

  const search = document.getElementById("search");
  search.addEventListener("input", () => paint(search.value.trim().toLowerCase()));
  paint("");

  function paint(query) {
    const match = (phrase) =>
      !query ||
      phrase.text.toLowerCase().includes(query) ||
      phrase.translation.toLowerCase().includes(query) ||
      (phrase.situation ?? "").toLowerCase().includes(query) ||
      (phrase.usageNote ?? "").toLowerCase().includes(query) ||
      (phrase.focusNote ?? "").toLowerCase().includes(query) ||
      // Searching "fork" should find el tenedor even though the card says
      // "the fork" nowhere except inside its picture.
      (phrase.picture ?? "").toLowerCase().includes(query) ||
      (phrase.sounds ?? "").toLowerCase().includes(query);

    const sections = [];

    // Order: what she starred, then what still needs finishing, then her own
    // cards, then the course in its own order.
    const starred = library.favouritePhrases().filter(match);
    if (starred.length) {
      sections.push(group("Favourites", starred, "var(--gold)", "var(--gold-dark)", "#4b4b4b"));
    }

    const pending = captures.filter(match);
    if (pending.length) {
      sections.push(group("Jotted down — needs the Spanish", pending, "var(--orange)", "var(--orange-dark)"));
    }

    const own = library
      .ownPhrases()
      .filter((p) => p.text.trim() && p.deck !== ABOUT_DECK)
      .filter(match);
    if (own.length) {
      sections.push(group("Mum's own phrases", own, "var(--blue)", "var(--blue-dark)"));
    }

    const about = library
      .ownPhrases()
      .filter((p) => p.text.trim() && p.deck === ABOUT_DECK)
      .filter(match);
    if (about.length) {
      sections.push(group(esc(ABOUT_DECK), about, "var(--green)", "var(--green-dark)"));
    }

    for (const unit of COURSE) {
      for (const lesson of unit.lessons) {
        const inLesson = lesson.phrases
          .map((p) => library.decorate({ ...p, language: COURSE_LANGUAGE }))
          .filter(match);
        if (!inLesson.length) continue;
        sections.push(group(`${esc(unit.title)} · ${esc(lesson.title)}`, inLesson, unit.color, unit.colorDark));
      }
    }

    const list = document.getElementById("phrase-list");
    list.innerHTML = sections.join("") || `<div class="empty"><p>Nothing matches.</p></div>`;

    list.querySelectorAll("[data-phrase]").forEach((button) =>
      button.addEventListener("click", () => {
        const phrase = library.phraseById(button.dataset.phrase);
        if (phrase) showPhrase(phrase);
      })
    );

    // A capture has nothing to say yet, so it opens straight into the editor.
    list.querySelectorAll("[data-edit]").forEach((button) =>
      button.addEventListener("click", () => editPhrase(library.phraseById(button.dataset.edit)))
    );

    // Repaint rather than flipping the one button: a starred phrase shows in
    // the Favourites section as well as its lesson, and both stars must agree.
    list.querySelectorAll("[data-fav]").forEach((button) =>
      button.addEventListener("click", () => {
        library.toggleFavourite(button.dataset.fav);
        paint(query);
      })
    );
  }

  /* Each group wears a colour, the way every deck in Xerra does: a one-row
     banner in the group's colour, then rows striped with it. A course lesson
     takes its unit's colour off the path, so a lesson looks the same here as
     its banner does there; Favourites are gold and Sobre mí green, as their
     tiles are; own phrases are blue, and a jotted-down capture takes the
     orange of the Add page it is still waiting to be finished on. Gold takes
     dark lettering, as the tile does. */
  function group(title, phrases, hue, hueDark, on = "#ffffff") {
    return `
      <div class="list-banner" style="--hue:${hue};--hue-dark:${hueDark};--hue-on:${on}">
        <span class="list-banner-name">${title}</span>
        <span class="list-banner-count">${phrases.length}</span>
      </div>
      <div class="rows rows-spaced">${phrases.map((p) => rowFor(p, hue)).join("")}</div>`;
  }

  function rowFor(phrase, hue) {
    const capture = !phrase.text.trim();
    const best = library.bestScore(phrase.id);
    return `
      <div class="row striped" style="--hue:${hue}">
        ${starButton(phrase)}
        <button class="row-open"
                ${capture ? `data-edit="${esc(phrase.id)}"` : `data-phrase="${esc(phrase.id)}"`}>
          <span class="row-main">
            <span class="row-title">${esc(phrase.text || phrase.translation || "Untitled")}</span><br>
            <span class="row-sub">${esc(phrase.text ? phrase.translation : "Tap to add the Spanish")}</span>
          </span>
          ${best != null ? `<strong style="color:${scoreColour(best)};font-variant-numeric:tabular-nums">${Math.round(best)}</strong>` : ""}
          <span class="chev">›</span>
        </button>
      </div>`;
  }
}

export function showPhrase(phrase) {
  const attempts = library.attemptsFor(phrase.id);
  const scores = [...attempts].reverse().map(attemptScore).filter((score) => score != null);

  // A running read on the attempts, so the list says something rather than
  // just listing dates.
  let trend = "";
  if (scores.length >= 2) {
    const change = scores[scores.length - 1] - scores[0];
    trend =
      change >= 5
        ? `Up ${Math.round(change)} points since your first go. ¡Bien!`
        : change <= -5
        ? `Down ${Math.round(Math.abs(change))} points — worth slowing it back down.`
        : `Holding steady around ${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}.`;
  }

  openSheet(
    phrase.text,
    `<div class="sheet-lede">
       <p class="muted">${esc(phrase.translation)}</p>
       ${starButton(phrase)}
     </div>
     <div class="level-line">
       <span class="level-badge">Level ${library.recallReady(phrase.id) ? "2" : "1"}</span>
       <span class="tiny muted">${
         library.recallReady(phrase.id)
           ? "Drilled from memory — you get the English and say the Spanish."
           : `${library.toRecall(phrase.id)} more good ${
               library.toRecall(phrase.id) === 1 ? "go" : "goes"
             } and this one turns into a memory question.`
       }</span>
     </div>
     ${
       /* The shape stated flat, with no gate and no verdict, even when the
          drill's question is switched off: the sheet is where she looks a card
          up rather than being tested on it. */
       aspectOf(phrase)
         ? `<div class="phrase-aspect">
              <span class="aspect-mark shape-${aspectOf(phrase).key}">${aspectOf(phrase).mark}</span>
              <span class="aspect-verdict-body">
                <strong>${esc(aspectOf(phrase).label)}</strong>
                <span class="aspect-endings">${esc(aspectOf(phrase).endings)}</span>
                <span class="aspect-term">${esc(aspectOf(phrase).term)}${phrase.infinitive ? ` · ${esc(phrase.infinitive)}` : ""}</span>
                ${aspectOf(phrase).note ? `<span class="aspect-why">${esc(aspectOf(phrase).note)}</span>` : ""}
              </span>
            </div>`
         : ""
     }
     ${
       /* Stated flat, where she is looking a word up rather than being asked
          for it — so no hint button and no waiting for anything. */
       pictureBlock(phrase, "margin:12px 0 4px")
     }
     ${phrase.situation ? `<div class="phrase-context"><strong>Situation</strong><span>${esc(phrase.situation)}</span></div>` : ""}
     ${phrase.usageNote ? `<div class="phrase-context"><strong>How it's used</strong><span>${esc(phrase.usageNote)}</span></div>` : ""}
     ${phrase.focusNote ? `<div class="focus-note" style="margin:12px 0 14px"><strong>Tip</strong><span>${esc(phrase.focusNote)}</span></div>` : ""}
     <div class="btn-row" style="margin-bottom:14px">
       <button class="btn btn-primary" id="p-practise">Practise now</button>
       <button class="btn" id="p-edit">Edit</button>
     </div>
     <section id="p-replies" style="margin-bottom:14px">${repliesBlock(phrase.replies)}</section>
     ${
       // The course predates replies, so a card without them offers to go and
       // get some rather than just not having the section.
       !phrase.replies?.length && settings.hasAssistant && phrase.text.trim()
         ? `<button class="btn" id="p-get-replies" style="width:100%;margin-bottom:14px">What might they say back?</button>
            <div id="p-replies-error" class="notice bad" hidden></div>`
         : ""
     }
     <section id="p-notes" style="margin-bottom:14px"></section>
     <section id="p-chat" hidden style="margin-bottom:14px"></section>
     ${trend ? `<div class="notice good" style="margin-bottom:12px">${esc(trend)}</div>` : ""}
     ${
       attempts.length
         ? `<div class="section-label">Attempts</div>
            <div class="rows">${attempts
              .map(
                (attempt) => `
              <div class="row" style="cursor:default">
                <button class="link" data-play="${attempt.id}" style="font-size:1.3rem;padding:0 4px">▶</button>
                <span class="row-main">
                  <span class="row-title">${new Date(attempt.recordedAt).toLocaleString([], {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}</span>
                </span>
                ${attemptScore(attempt) != null
                  ? `<strong style="color:${scoreColour(attemptScore(attempt))};font-variant-numeric:tabular-nums">${Math.round(attemptScore(attempt))}</strong>`
                  : ""}
                <button class="link btn-danger" data-delete="${attempt.id}">Delete</button>
              </div>`
              )
              .join("")}</div>`
         : `<p class="tiny muted">No attempts yet.</p>`
     }
     ${
       library.isCourse(phrase.id)
         ? `<p class="tiny muted center" style="margin:16px 0 0">This one's part of the course, so it stays put.
              You can edit it, or reset your edit, from Edit above.</p>`
         : `<button class="btn btn-danger" id="p-delete" style="width:100%;margin-top:16px">Delete card</button>`
     }`
  );

  armDelete(document.getElementById("p-delete"), "Tap again to delete for good", () =>
    deletePhrase(phrase)
  );

  document.getElementById("p-practise").onclick = () => {
    closeSheet();
    state.tab = "learn";
    startPractice([phrase]);
  };

  document.getElementById("p-edit").onclick = () => {
    closeSheet();
    editPhrase(phrase);
  };

  sheetBody.querySelector("[data-fav]")?.addEventListener("click", () => {
    library.toggleFavourite(phrase.id);
    showPhrase(library.phraseById(phrase.id) ?? phrase);
    render();
  });

  if (settings.hasAssistant) {
    cardChatPanel(document.getElementById("p-chat"), "Ask about this card", () => chatContext(phrase), {
      onKeep: ({ question, answer }) => {
        if (!library.keepNote(phrase.id, { question, answer })) return false;
        phrase.notes = library.notesFor(phrase.id);
        paintNotes();
        return true;
      },
    });
  }

  /* The sheet is where a kept note can be got rid of again — the lesson prints
     them and otherwise keeps out of the way of the card being practised. */
  function paintNotes() {
    const box = document.getElementById("p-notes");
    if (!box) return;
    box.innerHTML = notesBlock(phrase.notes, { deletable: true });
    box.querySelectorAll("[data-note]").forEach((button) =>
      button.addEventListener("click", () => {
        phrase.notes = library.forgetNote(phrase.id, button.dataset.note);
        paintNotes();
      })
    );
  }
  paintNotes();

  wirePicture(sheetBody, phrase, { controls: true });

  wireReplies(document.getElementById("p-replies"), phrase.replies ?? [], () => phrase);

  document.getElementById("p-get-replies")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const errorBox = document.getElementById("p-replies-error");
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> Asking…`;
    errorBox.hidden = true;
    try {
      const replies = await fetchReplies(phrase);
      if (!document.getElementById("p-get-replies")) return; // sheet closed
      if (!replies.length) {
        errorBox.className = "notice";
        errorBox.textContent = "Nothing much gets said back to this one.";
        errorBox.hidden = false;
        button.remove();
        return;
      }
      const section = document.getElementById("p-replies");
      section.innerHTML = repliesBlock(replies);
      wireReplies(section, replies, () => phrase);
      button.remove();
    } catch (error) {
      errorBox.className = "notice bad";
      errorBox.textContent = error.message;
      errorBox.hidden = false;
      button.disabled = false;
      button.textContent = "What might they say back?";
    }
  });

  sheetBody.querySelectorAll("[data-play]").forEach((button) =>
    button.addEventListener("click", async () => {
      const blob = await audioStore.getRecording(button.dataset.play);
      if (blob) player.play(blob);
      else toast("That recording's audio is missing.");
    })
  );
  sheetBody.querySelectorAll("[data-delete]").forEach((button) =>
    button.addEventListener("click", async () => {
      await library.removeAttempt(button.dataset.delete);
      showPhrase(phrase);
    })
  );
}

/* One editor for every phrase. Mum's own cards are rewritten in place; a
   course card is stored as an override, so Reset puts content.js back. */
export function editPhrase(phrase, onSaved = null) {
  const course = phrase ? library.isCourse(phrase.id) : false;

  openSheet(
    phrase ? "Edit phrase" : "New phrase",
    `<label class="field"><span>Spanish — leave empty to jot the English down for later</span>
       <textarea id="f-text">${esc(phrase?.text ?? "")}</textarea></label>
     <label class="field"><span>English</span>
       <textarea id="f-translation">${esc(phrase?.translation ?? "")}</textarea></label>
     <label class="field"><span>Situation (optional)</span>
       <textarea id="f-situation">${esc(phrase?.situation ?? "")}</textarea></label>
     <label class="field"><span>How it's used (optional)</span>
       <textarea id="f-usage">${esc(phrase?.usageNote ?? "")}</textarea></label>
     <label class="field"><span>Tip (optional)</span>
       <textarea id="f-note" placeholder="What to listen for">${esc(phrase?.focusNote ?? "")}</textarea></label>
     <label class="field"><span>Sounds like (optional)</span>
       <textarea id="f-sounds" placeholder="The English hiding inside it">${esc(phrase?.sounds ?? "")}</textarea></label>
     <label class="field"><span>Picture it (optional)</span>
       <textarea id="f-picture" placeholder="One daft scene with the sound AND the meaning in it">${esc(
         phrase?.picture ?? ""
       )}</textarea></label>
     ${genderField(phrase)}
     ${
       settings.hasAssistant
         ? `<button class="btn" id="f-picture-ai" style="width:100%;margin-bottom:10px">${
             phrase?.picture?.trim() ? "Imagine another one" : "Invent a picture for me"
           }</button>`
         : ""
     }
     <div id="f-picture-note" class="notice" hidden></div>
     <p class="tiny muted" style="margin:0 0 12px">A word sticks when it is hooked to something ridiculous —
       tenedor is a ten-pound note pinned to a door with a fork. The stranger the better, and one you make up
       yourself beats one you were handed.</p>
     ${
       settings.hasAssistant
         ? `<button class="btn" id="f-ai" style="width:100%;margin-bottom:10px">Rebuild the rest with AI</button>
            <div id="f-ai-note" class="notice" hidden></div>
            <p class="tiny muted" style="margin:0 0 12px">Change the Spanish and this rewrites the meaning, the
              situation and the tip to match. Nothing is saved until you tap Save.</p>`
         : ""
     }
     <div class="btn-row">
       <button class="btn" data-close-sheet>Cancel</button>
       <button class="btn btn-primary" id="f-save">Save</button>
     </div>
     ${
       course
         ? library.isEdited(phrase.id)
           ? `<button class="btn" id="f-reset" style="width:100%;margin-top:10px">Reset to the original</button>
              <p class="tiny muted" style="margin:10px 0 0">This is a course card — your version is saved over it,
                and Reset brings the original back.</p>`
           : `<p class="tiny muted" style="margin:12px 0 0">This is a course card. Your edit is saved over it and
                can be reset later.</p>`
         : phrase
         ? `<button class="btn btn-danger" id="f-delete" style="width:100%;margin-top:10px">Delete card</button>`
         : ""
     }`
  );

  autosizeAll(sheetBody);
  const editorAI = wireEditorAI(phrase);
  wirePictureAI();

  document.getElementById("f-save").onclick = () => {
    const text = document.getElementById("f-text").value.trim();
    const translation = document.getElementById("f-translation").value.trim();
    if (!text && !translation) {
      toast("Add the Spanish or the English — either will do.");
      return;
    }
    const data = {
      text,
      translation,
      situation: document.getElementById("f-situation").value.trim() || null,
      usageNote: document.getElementById("f-usage").value.trim() || null,
      focusNote: document.getElementById("f-note").value.trim() || null,
      sounds: document.getElementById("f-sounds").value.trim() || null,
      picture: document.getElementById("f-picture").value.trim() || null,
      gender: document.getElementById("f-gender").value || null,
    };
    if (phrase) {
      library.updatePhrase({ ...phrase, ...data });
      /* A rebuild rewrites the whole card, so the replies it had answered the
         card it used to be — "coming right up" is no answer to a phrase that
         is now about something else. Dropped rather than refetched: the card
         offers *What might they say back?* again, and that costs a tap instead
         of a call nobody asked for. A plain edit keeps them. */
      if (editorAI?.rebuilt()) library.setReplies(phrase.id, []);
    } else library.addPhrase(data);
    closeSheet();
    if (onSaved) onSaved(phrase ? library.phraseById(phrase.id) : null);
    render();
  };

  document.getElementById("f-reset")?.addEventListener("click", () => {
    library.resetPhrase(phrase.id);
    closeSheet();
    render();
  });

  /* Deleting from the editor is the lesson's delete as well — it is what the
     lesson bar's EDIT button opens — so it goes through the shared one, which
     takes the card out of the queue on the way. */
  armDelete(document.getElementById("f-delete"), "Tap again to delete for good", () =>
    deletePhrase(phrase)
  );
}

/* "Rebuild the rest with AI" — the same /complete-card call the Add tab makes,
   pointed at a card that already exists. Change 'un cortado' to 'un café solo'
   and the English, the situation, the usage note and the tip all follow,
   instead of the card having to be deleted and written again.

   Which fields get sent matters. Editing the Spanish but not the English
   leaves the two disagreeing, and sending both would ask the assistant to
   reconcile a contradiction. So whichever side was actually edited is the one
   sent; the untouched side is dropped, exactly as if it had been left blank on
   the Add tab. Change both, or neither, and both go. */
function wireEditorAI(phrase) {
  const button = document.getElementById("f-ai");
  if (!button) return null;

  // Whether the card in the boxes is the assistant's rewrite or Mum's own
  // typing — what Save consults before deciding the replies are stale.
  let rebuilt = false;

  const field = (id) => document.getElementById(id);
  const before = {
    text: field("f-text").value,
    translation: field("f-translation").value,
    situation: field("f-situation").value,
    usage: field("f-usage").value,
    note: field("f-note").value,
  };
  const noteBox = document.getElementById("f-ai-note");

  const restore = () => {
    for (const [id, value] of [
      ["f-text", before.text], ["f-translation", before.translation],
      ["f-situation", before.situation], ["f-usage", before.usage], ["f-note", before.note],
    ]) field(id).value = value;
    rebuilt = false;
    noteBox.hidden = true;
    autosizeAll(sheetBody);
  };

  button.addEventListener("click", async () => {
    const target = field("f-text").value.trim();
    const english = field("f-translation").value.trim();
    if (!target && !english) {
      toast("Write something in Spanish or English first.");
      return;
    }

    const targetEdited = target !== before.text.trim();
    const englishEdited = english !== before.translation.trim();
    const onlyOneSide = targetEdited !== englishEdited;

    const label = button.textContent;
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> Rebuilding…`;
    noteBox.hidden = true;
    try {
      const result = await cardAssistant.complete(
        {
          target: onlyOneSide && englishEdited ? "" : target,
          english: onlyOneSide && targetEdited ? "" : english,
          situation: field("f-situation").value.trim(),
          deck: "Mum-o-lingo",
          languageCode: COURSE_LANGUAGE,
          languageName: "Spanish (Spain)",
        },
        settings
      );
      // The sheet may have been closed while it was thinking.
      if (!field("f-text")) return;

      field("f-text").value = result.text;
      field("f-translation").value = result.translation;
      field("f-situation").value = result.situation;
      field("f-usage").value = result.usageNote;
      field("f-note").value = result.focusNote;
      rebuilt = true;
      autosizeAll(sheetBody);

      noteBox.className = "notice";
      noteBox.innerHTML = `${esc(result.reviewNote || "Rebuilt. Check it over, then Save.")}
        <button class="link" id="f-ai-undo" style="padding:0 0 0 4px">Undo</button>`;
      noteBox.hidden = false;
      document.getElementById("f-ai-undo").addEventListener("click", restore);
    } catch (error) {
      noteBox.className = "notice bad";
      noteBox.textContent = error.message;
      noteBox.hidden = false;
    } finally {
      if (document.getElementById("f-ai")) {
        button.disabled = false;
        button.textContent = label;
      }
    }
  });

  return { rebuilt: () => rebuilt };
}
