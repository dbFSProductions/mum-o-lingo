// The ask panel (`cardChatPanel`) the drill, the phrase sheet and the Add review share, and the notes kept from it.

import { COURSE_LANGUAGE } from "./content.js";
import { settings } from "./store.js";
import { cardAssistant } from "./card-assistant.js";
import { autosize, esc, toast } from "./core.js";

/* Answers kept from a chat, printed back under the card they were kept on.
   Reference material like the situation, and held back on the same terms: a
   note about a card quotes it and always explains it. */
export function notesBlock(notes, { deletable = false } = {}) {
  if (!notes?.length) return "";
  return `
    <div class="section-label">Notes you kept</div>
    <div class="kept-notes">
      ${notes
        .map(
          (note) => `
        <div class="kept-note">
          ${note.question ? `<strong>${esc(note.question)}</strong>` : ""}
          <span>${esc(note.answer)}</span>
          ${deletable ? `<button class="link btn-danger" data-note="${esc(note.id)}">Forget this</button>` : ""}
        </div>`
        )
        .join("")}
    </div>`;
}

export function chatContext(phrase) {
  return {
    languageCode: COURSE_LANGUAGE,
    languageName: "Spanish (Spain)",
    deck: "Mum-o-lingo",
    card: {
      text: phrase.text,
      translation: phrase.translation,
      situation: phrase.situation ?? "",
      usageNote: phrase.usageNote ?? "",
      focusNote: phrase.focusNote ?? "",
      /* The replies are printed under the card she is looking at, so a
         question about one of them is a question about this card. Without
         them the assistant was answering "what does «marchando» mean?" with
         no idea what she was pointing at. */
      replies: phrase.replies ?? [],
    },
  };
}

/* Chat about a card, shown under the drill card, under a finished card on Add
   and on the phrase sheet. History lives only as long as the panel does — it's
   a study aside, not a stored transcript. getContext runs per question, so
   edits count. `onKeep` is what turns an answer into something that stays. */
export function cardChatPanel(host, title, getContext, { onKeep = null } = {}) {
  const history = [];
  let busy = false;

  host.innerHTML = `
    <div class="section-label">${esc(title)}</div>
    <div class="card chat-card">
      <div class="chat-log" hidden></div>
      <form class="chat-form">
        <textarea rows="1" aria-label="${esc(title)}"></textarea>
        <button class="btn btn-primary" type="submit">Ask</button>
      </form>
      <div class="notice bad chat-error" hidden></div>
    </div>`;
  host.hidden = false;

  const log = host.querySelector(".chat-log");
  const form = host.querySelector(".chat-form");
  const input = form.querySelector("textarea");
  autosize(input);
  const send = form.querySelector("button");
  const errorBox = host.querySelector(".chat-error");

  /* An answer worth keeping goes onto the card. Delegated, because renderLog
     rewrites the whole log on every turn. Kept per answer rather than per
     conversation: a chat wanders, and the one paragraph that finally explained
     the subjunctive is the part worth having under the card next time — and
     the question that drew it is stored with it, because an answer with no
     question in front of it reads like a note someone else left. */
  log.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-keep]");
    if (!button || !onKeep) return;
    const at = Number(button.dataset.keep);
    const answer = history[at];
    if (!answer || answer.kept) return;
    answer.kept = Boolean(onKeep({ question: history[at - 1]?.text ?? "", answer: answer.text }));
    renderLog();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      ask();
    }
  });

  async function ask() {
    const question = input.value.trim();
    if (!question || busy) return;
    if (!settings.hasAssistant) {
      toast("Set the card builder up in Settings first.");
      return;
    }

    history.push({ role: "user", text: question });
    input.value = "";
    autosize(input);
    errorBox.hidden = true;
    setBusy(true);
    renderLog();
    try {
      const result = await cardAssistant.chat({ ...getContext(), history }, settings);
      history.push({ role: "assistant", text: result.reply });
    } catch (error) {
      // Put the question back so a retry is one tap, not a retype.
      history.pop();
      input.value = question;
      autosize(input);
      errorBox.textContent = error.message;
      errorBox.hidden = false;
    } finally {
      setBusy(false);
      renderLog();
    }
  }

  function setBusy(value) {
    busy = value;
    send.disabled = value;
  }

  function renderLog() {
    log.hidden = !history.length && !busy;
    log.innerHTML =
      history
        .map(
          (turn, i) => `<div class="chat-msg ${turn.role === "user" ? "user" : "assistant"}">${esc(turn.text)}${
            onKeep && turn.role === "assistant"
              ? turn.kept
                ? `<span class="chat-kept">Kept on the card ✓</span>`
                : `<button class="link chat-keep" data-keep="${i}">Keep on the card</button>`
              : ""
          }</div>`
        )
        .join("") +
      (busy ? `<div class="chat-msg assistant chat-thinking"><span class="spinner"></span></div>` : "");
    log.scrollTop = log.scrollHeight;
  }
}
