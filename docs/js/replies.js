// "What might they say back?": the replies block under a card, fetching them, and keeping one as a card.

import { COURSE_LANGUAGE } from "./content.js";
import { library, settings } from "./store.js";
import { cardAssistant } from "./card-assistant.js";
import { esc, normaliseSentence, sayAloud, toast } from "./core.js";

/* -------------------------------------------------------------- replies */

/* "You might hear back" — two or three things a person actually says in reply,
   each with its English and a Listen button. Saying your line well is half of
   it; the half that strands you is the answer, so these are for the ear, not
   just the page.

   Rendered in three places (the Add review, the phrase sheet and under the
   drill) from the one function, so they read the same everywhere. Ported from
   Xerra with the same markup — keep the two in step. */
/* Each reply offers *Keep as a card*. A reply is a phrase somebody actually
   says, and the one you keep hearing is the one you will want to be able to
   say — so the way from "I like this one" to a card of its own is one tap,
   here, rather than retyping it into Add. A reply already in the library says
   *Kept ✓* instead, read off the library at render so it survives a re-render
   and a second visit. Ported from Xerra. */
export function repliesBlock(replies, title = "You might hear back", keepable = true) {
  if (!replies?.length) return "";
  return `
    <div class="section-label">${esc(title)}</div>
    <ul class="replies">
      ${replies
        .map((reply, i) => {
          const kept = keepable && replyKept(reply);
          return `
        <li class="reply">
          <button class="reply-play" data-say="${i}" aria-label="Listen to this reply">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>
          </button>
          <span class="reply-main">
            <span class="reply-text">${esc(reply.text)}</span>
            <span class="reply-translation">${esc(reply.translation)}</span>
            ${
              keepable
                ? `<button class="link reply-keep" data-keep="${i}" ${kept ? "disabled" : ""}>${
                    kept ? "Kept as a card ✓" : "Keep as a card"
                  }</button>`
                : ""
            }
          </span>
        </li>`;
        })
        .join("")}
    </ul>`;
}

function replyKept(reply) {
  const key = normaliseSentence(reply.text ?? "");
  return Boolean(key) && library.allPhrases().some((p) => normaliseSentence(p.text) === key);
}

/* One tap from a reply to a card of your own. The reply's text and English are
   the card; the phrase it answers is written into the situation, because that
   is exactly what a situation is for — where you would hear this. It lands
   with your other cards, under Lo tuyo, whatever the card it answered was: a
   reply to a Quick phrase is not a Quick phrase and a reply to a Sobre mí card
   is not about you. No focusNote, because nobody has written one; the editor's
   AI rebuild is there for that. Refuses a duplicate the way Add does, but says
   so on the button rather than in a toast, since the button is what you were
   looking at. */
function keepReply(reply, source, button) {
  const text = reply.text?.trim();
  const translation = reply.translation?.trim();
  if (!text || !translation) return;
  const flip = () => {
    button.disabled = true;
    button.textContent = "Kept as a card ✓";
  };
  if (replyKept(reply)) {
    flip();
    toast("That one is already in your cards.");
    return;
  }
  const said = source?.()?.text?.trim();
  library.addPhrase({
    text,
    translation,
    situation: said ? `Something you might hear after saying “${said}”.` : null,
  });
  flip();
  toast("Added to your cards — it's on the path under Lo tuyo.");
}

/* The replies go through the same Azure voice and the same audio cache as the
   card itself — modelAudio keys on the text, so a reply heard once is there
   offline afterwards. No key, and the browser voice reads it instead. */
export function wireReplies(root, replies, source = null) {
  root?.querySelectorAll("[data-say]").forEach((button) =>
    button.addEventListener("click", () => {
      const reply = replies[Number(button.dataset.say)];
      if (reply) sayAloud(button, reply.text, "Couldn't play that reply.");
    })
  );
  /* `source` is read at the tap, not at wiring: on the Add review the phrase
     box is still being edited. */
  root?.querySelectorAll("[data-keep]").forEach((button) =>
    button.addEventListener("click", () => {
      const reply = replies[Number(button.dataset.keep)];
      if (reply) keepReply(reply, source, button);
    })
  );
}

/* Replies for a card that hasn't got any — the whole course, and anything
   added before this existed. Its own endpoint, so asking for them can never
   slow down or fail a card generation, and so the card itself is never
   rewritten behind your back. */
export async function fetchReplies(phrase) {
  const result = await cardAssistant.replies(
    {
      text: phrase.text,
      translation: phrase.translation,
      situation: phrase.situation ?? "",
      deck: "Mum-o-lingo",
      languageCode: COURSE_LANGUAGE,
      languageName: "Spanish (Spain)",
    },
    settings
  );
  const replies = library.setReplies(phrase.id, Array.isArray(result.replies) ? result.replies : []);
  /* The caller is holding a decorated *copy* — the card in `lesson.queue`, the
     phrase the sheet was opened with — so the copy has to be brought up to
     date too, or what comes back lands on the store and not on the card being
     looked at. Xerra mutates the stored object instead; same fix, different
     shape. */
  phrase.replies = replies;
  return replies;
}
