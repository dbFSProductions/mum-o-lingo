// The drill: starting a lesson or a practice queue, loading a card, the card itself, level two, the past-tense gate, recording, the banner and the lesson's end.

import { COURSE_LANGUAGE } from "./content.js";
import {
  library, settings, progress, audioStore, uid, RECALL_AFTER, attemptScore, ASPECTS, aspectOf,
  aspectChoices,
} from "./store.js";
import { Recorder, analyse } from "./audio.js";
import { speech, browserSpeech, scoring } from "./speech.js";
import {
  PASS_GREAT, PASS_OK, closeSheet, esc, flameSVG, noVoice, parrotSVG, player, scoreColour, shuffle,
  state, stopEverything, toast, view,
} from "./core.js";
import { render } from "./app.js";
import { cardChatPanel, chatContext, notesBlock } from "./ask.js";
import { editPhrase } from "./phrases.js";
import { pictureBlock, wirePicture } from "./pictures.js";
import { fetchReplies, repliesBlock, wireReplies } from "./replies.js";
import { drawCanvases, renderComparison, wireComparison } from "./score.js";

export function startLesson(lesson) {
  stopEverything();
  state.lesson = {
    id: lesson.id,
    title: lesson.title,
    color: lesson.unit.color,
    colorDark: lesson.unit.colorDark,
    // Through decorate() so an edited course phrase drills as edited.
    queue: lesson.phrases.map((p) => library.decorate({ language: COURSE_LANGUAGE, ...p })),
    index: 0,
    results: [],
    practice: false,
  };
  state.stage = "drill";
  loadPhrase();
}

/* Repaso draws from everything drillable — the whole course and Mum's own
   cards. It used to be limited to lessons already completed; with nothing
   locked there is nothing to hold back. */
export function startPractice(queueOverride = null) {
  stopEverything();
  const pool = queueOverride ?? shuffle(library.drillable()).slice(0, 7);
  if (!pool.length) {
    toast("Nothing to practise yet.");
    return;
  }
  state.lesson = {
    id: "practice",
    title: "Repaso",
    color: "var(--blue)",
    colorDark: "var(--blue-dark)",
    queue: pool,
    index: 0,
    results: [],
    practice: true,
  };
  state.stage = "drill";
  loadPhrase();
}

// ------------------------------------------------------------------- drill

function currentPhrase() {
  return state.lesson?.queue[state.lesson.index] ?? null;
}

/* Deleting a card has to reach the lesson, because the queue holds the phrase
   *objects* (decorated copies at that) rather than their ids: `removePhrase`
   takes the card out of the library and leaves the lesson showing it, with the
   progress bar still counting it — the tap reads as the delete button having
   stopped working. Both delete buttons come through `deletePhrase`.

   The card she is looking at stays the card she is looking at: the index
   follows the current phrase to its new position, and only moves when the
   current phrase is the one being deleted, in which case the next card slides
   into its place. False means there is nothing left to show. */
function dropFromQueue(phraseID) {
  const lesson = state.lesson;
  if (!lesson) return false;
  const at = lesson.queue.findIndex((p) => p.id === phraseID);
  if (at === -1) return false;
  const current = currentPhrase();
  lesson.queue = lesson.queue.filter((p) => p.id !== phraseID);
  if (!lesson.queue.length) return false;
  const stayingPut = current && current.id !== phraseID
    ? lesson.queue.findIndex((p) => p.id === current.id)
    : -1;
  lesson.index = stayingPut === -1 ? Math.min(at, lesson.queue.length - 1) : stayingPut;
  return true;
}

/* The one delete, shared by the phrase sheet and the editor. Deleting the last
   card of a lesson leaves it rather than sitting on an empty drill. */
export async function deletePhrase(phrase) {
  stopEverything();
  const drilling = state.stage === "drill" && Boolean(state.lesson);
  const queued = Boolean(state.lesson?.queue.some((p) => p.id === phrase.id));
  await library.removePhrase(phrase.id);
  const carryOn = dropFromQueue(phrase.id);
  closeSheet();
  toast("Card deleted.");
  if (drilling && carryOn) loadPhrase();
  else if (drilling && queued) quitLesson();
  else render();
}

async function loadPhrase() {
  const phrase = currentPhrase();
  state.modelBlob = null;
  state.modelAnalysis = null;
  state.attempt = null;
  state.attemptBlob = null;
  state.attemptAnalysis = null;
  state.banner = null;
  state.showTranslation = settings.showTranslationUpFront;
  state.recall = Boolean(settings.recallMode && phrase && library.recallReady(phrase.id));
  state.revealed = !state.recall;
  state.peeked = false;
  state.pictured = false;
  state.aspectChoice = null;
  scoring.lastError = null;
  window.scrollTo(0, 0);
  if (!phrase) return render();

  state.loadingModel = settings.hasAzure && !(await speech.isCached(phrase, settings));
  render();

  /* Guarded even though modelAudio now swallows its own failures: this is the
     one await between showing the spinner and taking it away, and a throw here
     leaves "Generating audio…" on the screen for as long as the card is. */
  let blob = null;
  try {
    blob = await speech.modelAudio(phrase, settings);
  } catch {
    blob = null;
  }
  state.loadingModel = false;
  if (currentPhrase()?.id !== phrase.id) return; // moved on while we waited
  state.modelBlob = blob;
  if (blob) {
    try {
      state.modelAnalysis = await analyse(blob);
    } catch {
      state.modelAnalysis = null;
    }
  }
  if (state.stage === "drill") render();
}

export function renderDrill() {
  const lesson = state.lesson;
  const phrase = currentPhrase();
  if (!lesson || !phrase) {
    state.stage = "path";
    return render();
  }

  // Replacing the view's innerHTML makes iOS Safari clamp the scroll position
  // to the top (e.g. when the Azure score lands mid-read), so put it back.
  const scrollY = window.scrollY;

  const total = lesson.queue.length;
  const filled = lesson.index + (state.banner ? 1 : 0);
  const pct = Math.round((filled / total) * 100);
  const hasModel = Boolean(state.modelBlob);
  // Still being asked: the Spanish, the tip and the model audio are all
  // withheld, because any of the three answers the question.
  const asking = state.recall && !state.revealed;

  /* Dot or line: on a card that carries a shape, the lesson asks Mum to name
     it before it will show her the sentence. The gate never shows Spanish, so
     it stacks cleanly above level two — the card becomes whatever it was going
     to be only after the shape is named. EDIT goes while the question stands
     (the editor prints the sentence she is being asked to think about); the
     quit and the bar stay. */
  const shape = settings.aspectGate ? aspectOf(phrase) : null;
  const gating = Boolean(shape) && !state.aspectChoice;

  if (gating) {
    view.innerHTML = `
      <div class="lesson-top">
        <button class="quit" id="quit" aria-label="Quit lesson">✕</button>
        <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
        <span class="link muted-link" style="visibility:hidden">EDIT</span>
      </div>
      ${aspectGateBody(phrase)}`;
    document.getElementById("quit").onclick = quitLesson;
    view.querySelectorAll("[data-aspect]").forEach((button) => {
      button.onclick = () => {
        /* Answering re-renders the whole drill, which is safe here in a way it
           isn't after recording: the gate stands before any attempt exists, so
           there is nothing on screen for a render() to throw away. */
        state.aspectChoice = button.dataset.aspect;
        render();
      };
    });
    window.scrollTo(0, scrollY);
    return;
  }

  view.innerHTML = `
    <div class="lesson-top">
      <button class="quit" id="quit" aria-label="Quit lesson">✕</button>
      <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
      <button class="link muted-link" id="drill-edit">EDIT</button>
    </div>

    <p class="instruction">${
      asking
        ? "From memory — how do you say this?"
        : state.recall && state.attempt
        ? "Here's the phrase — how close were you?"
        : "Listen, then say it out loud"
    }</p>

    ${aspectVerdict(shape, state.aspectChoice, asking)}

    <div class="card drill-card">
      ${state.recall ? `<div class="level-badge">Level 2 · from memory</div>` : ""}
      ${
        asking
          ? `<p class="drill-text recall-prompt">${esc(phrase.translation)}</p>
             ${phrase.situation ? `<p class="drill-translation">${esc(phrase.situation)}</p>` : ""}
             <p class="tiny muted" style="margin:10px 0 0">Say it in Spanish, then you'll see it.</p>`
          : `<p class="drill-text">${drillSpanish(phrase)}</p>
             ${
               state.showTranslation
                 ? `<p class="drill-translation">${esc(phrase.translation)}</p>`
                 : `<button class="link" id="reveal" style="padding-left:0">Show meaning</button>`
             }
             ${
               /* The verb's dictionary form, said quietly — she should know
                  what the -aba is hanging off. Behind showTranslation, since
                  "to work" is half the meaning she asked to hide. */
               phrase.infinitive && state.showTranslation
                 ? `<p class="infinitive-line tiny muted">${esc(phrase.infinitive)}</p>`
                 : ""
             }
             ${
               phrase.focusNote
                 ? `<div class="focus-note"><strong>Tip</strong><span>${esc(phrase.focusNote)}</span></div>`
                 : ""
             }
             ${
               state.peeked
                 ? `<p class="tiny muted" style="margin:10px 0 0">Shown, not remembered — it'll come round again.</p>`
                 : ""
             }`
      }
    </div>

    ${drillPicture(phrase, asking)}

    ${
      asking
        ? `<button class="btn btn-big" id="show-me" style="margin-top:0">👀 Show me</button>`
        : `<div class="btn-row">
             <button class="btn btn-primary" id="listen">🔊 Listen</button>
             <button class="btn" id="slow">🐢 Slow</button>
           </div>`
    }
    ${
      asking
        ? ""
        : state.loadingModel
        ? `<p class="small muted" style="margin-top:10px"><span class="spinner"></span> Generating audio…</p>`
        : !hasModel && settings.hasAzure && speech.lastError
        ? `<div class="notice bad" style="margin-top:10px">${esc(speech.lastError)}</div>`
        : !hasModel
        ? `<div class="notice" style="margin-top:10px">Using the browser voice. Comparison and scoring need an Azure key.</div>`
        : ""
    }

    <div class="record-wrap">
      <button class="record" id="record" aria-label="Record">
        <span class="record-ring" id="ring"></span>
        <svg viewBox="0 0 24 24" id="record-icon"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/><path d="M19 11a7 7 0 0 1-14 0" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 18v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      </button>
      <p class="small muted" id="record-label">${
        state.attempt
          ? "Recorded! Compare below, or tap to try again"
          : asking
          ? "Tap, say it in Spanish, tap again"
          : "Tap, say it, tap again"
      }</p>
      ${state.banner ? "" : `<button class="link muted-link" id="skip">SKIP</button>`}
    </div>

    <div id="comparison">${state.attempt ? renderComparison() : ""}</div>

    ${state.banner ? renderBanner() : ""}

    ${drillReplies(phrase, asking)}
    <div id="drill-notes">${drillNotes(phrase, asking)}</div>
    ${
      /* Asking about the card she has just said is half of practising it — she
         gets it right and still wants to know what `pone` is doing there. The
         box shows nothing until she types, but the answer it fetches is built
         from the card, so it stays out while a level-two question is standing:
         it would be a way round the question. */
      settings.hasAssistant && !asking ? `<section id="drill-chat" hidden></section>` : ""
    }`;

  document.getElementById("quit").onclick = quitLesson;

  /* Editing from inside the lesson, for the card you have just heard and
     realised is not how you'd say it. The queue holds decorated copies and the
     model audio is cached by text, so the fixed card has to go back into the
     queue and be reloaded rather than just re-rendered. */
  document.getElementById("drill-edit").onclick = () => {
    stopEverything();
    editPhrase(phrase, (updated) => {
      if (!updated) return;
      lesson.queue = lesson.queue.map((p) => (p.id === updated.id ? updated : p));
      loadPhrase();
    });
  };
  document.getElementById("reveal")?.addEventListener("click", () => {
    state.showTranslation = true;
    render();
  });
  document.getElementById("listen")?.addEventListener("click", () => playModel(1));
  document.getElementById("slow")?.addEventListener("click", () => playModel(settings.slowRate));
  document.getElementById("record").onclick = toggleRecording;
  /* The picture, asked for rather than shown. Re-rendering is safe here for
     the same reason it is safe on a gate: while the question is standing there
     is no attempt on the screen for a render() to throw away. */
  document.getElementById("picture-hint")?.addEventListener("click", () => {
    state.pictured = true;
    render();
  });
  document.getElementById("show-me")?.addEventListener("click", () => {
    state.revealed = true;
    state.peeked = true;
    render();
    playModel(1);
  });
  document.getElementById("skip")?.addEventListener("click", () => {
    stopEverything();
    advance({ skipped: true, score: null });
  });
  document.getElementById("banner-retry")?.addEventListener("click", () => {
    stopEverything();
    state.attempt = null;
    state.attemptBlob = null;
    state.attemptAnalysis = null;
    state.banner = null;
    window.scrollTo(0, 0);
    render();
  });
  document.getElementById("banner-continue")?.addEventListener("click", () => {
    stopEverything();
    advance({ skipped: false, score: state.attempt ? attemptScore(state.attempt) : null });
  });

  wirePicture(view, phrase);

  wireReplies(view.querySelector(".drill-replies"), phrase.replies ?? [], () => phrase);

  /* Fetching them mid-lesson. The card is repainted in place rather than
     through render(), which would take the attempt she is looking at off the
     screen — and fetchReplies writes them onto the queue's copy of the card,
     so what comes back is on the card being practised, not on a copy of it. */
  document.getElementById("drill-get-replies")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const errorBox = document.getElementById("drill-replies-error");
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> Asking…`;
    errorBox.hidden = true;
    try {
      const replies = await fetchReplies(phrase);
      const card = view.querySelector(".drill-replies");
      // Moved on, or the card was edited out from under it, while we waited.
      if (!card || currentPhrase()?.id !== phrase.id) return;
      if (!replies.length) {
        errorBox.className = "notice";
        errorBox.textContent = "Nothing much gets said back to this one.";
        errorBox.hidden = false;
        button.remove();
        return;
      }
      card.innerHTML = repliesBlock(replies);
      wireReplies(card, replies, () => phrase);
    } catch (error) {
      errorBox.className = "notice bad";
      errorBox.textContent = error.message;
      errorBox.hidden = false;
      button.disabled = false;
      button.textContent = "What might they say back?";
    }
  });

  /* The same panel the phrase sheet and the Add tab use, with somewhere to put
     an answer. Keeping one repaints the notes section in place rather than
     re-rendering: a render() here would take the attempt she is looking at off
     the screen, and would throw the conversation away with it. */
  const chatHost = document.getElementById("drill-chat");
  if (chatHost) {
    cardChatPanel(chatHost, "Ask about this card", () => chatContext(phrase), {
      onKeep: ({ question, answer }) => {
        const note = library.keepNote(phrase.id, { question, answer });
        if (!note) return false;
        // The queue holds a decorated copy, so it has to be told as well.
        phrase.notes = library.notesFor(phrase.id);
        document.getElementById("drill-notes").innerHTML = drillNotes(phrase, asking);
        toast("Kept on the card.");
        return true;
      },
    });
  }

  if (state.attempt) wireComparison();
  drawCanvases();

  window.scrollTo(0, scrollY);
}

/* The picture, and which side of the level-two line it falls on — which is
   neither of the sides everything else in the drill takes.

   At level one it is reference material like the tip, so it waits behind the
   meaning: the scene names the English, and hiding the translation and then
   printing "a fork nailed to a door" would be pointless.

   At level two it is the whole point of the unit. The Spanish is being
   withheld and the picture is the road back to it, so it is offered as a
   button rather than shown — and reaching for it is NOT peeking. Show me hands
   over the answer; the picture makes her produce it, which is the method
   working exactly as intended. So it leaves `peeked` alone, and once she has
   asked, it stays on the card for the rest of the go. */
function drillPicture(phrase, asking) {
  if (!phrase.picture?.trim()) return "";
  if (asking && !state.pictured) {
    return `<button class="btn btn-picture" id="picture-hint" style="width:100%;margin-bottom:12px">🧠 Show me the picture</button>`;
  }
  if (!asking && !state.showTranslation && !state.pictured) return "";
  return `<div class="card picture-card">${pictureBlock(phrase)}</div>`;
}

/* What she'd hear back, and — for a card that hasn't got any — the offer to go
   and find out. The whole course predates the field, and the moment she wants
   them is the moment she has just said the line and wondered what happens
   next, so the offer belongs here and not only on the phrase sheet.

   Two gates, and they are the ones the drill card already uses. Out while the
   meaning is hidden, and out while a level-two question is standing — a
   situation is a clue, but "we're full, about twenty minutes" is the answer to
   the question she is being asked to produce. The offer sits behind the same
   gate as the replies it would fill in: pressing it puts three answers and
   their English on the screen, so it can't be on the near side of a line the
   replies themselves are on the far side of. */
function drillReplies(phrase, asking) {
  if (!state.showTranslation || asking) return "";
  if (phrase.replies?.length) return `<div class="card drill-replies">${repliesBlock(phrase.replies)}</div>`;
  if (!settings.hasAssistant || !phrase.text.trim()) return "";
  return `
    <div class="card drill-replies">
      <button class="btn btn-primary" id="drill-get-replies" style="width:100%">What might they say back?</button>
      <div id="drill-replies-error" class="notice bad" hidden></div>
    </div>`;
}

/* Answers she kept from a chat, printed back under the card. Reference
   material, behind the same two gates: a note about a card quotes it and
   always explains it. */
function drillNotes(phrase, asking) {
  if (!state.showTranslation || asking || !phrase.notes?.length) return "";
  return `<div class="card drill-notes">${notesBlock(phrase.notes)}</div>`;
}

function quitLesson() {
  stopEverything();
  state.lesson = null;
  state.stage = "path";
  render();
}

function advance(result) {
  const lesson = state.lesson;
  lesson.results.push({ phraseId: currentPhrase()?.id, ...result });
  if (lesson.index < lesson.queue.length - 1) {
    lesson.index++;
    loadPhrase();
    return;
  }
  finishLesson();
}

function finishLesson() {
  const lesson = state.lesson;
  const scores = lesson.results.map((r) => r.score).filter((s) => typeof s === "number");
  const average = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  let streakGrew = false;
  if (!lesson.practice) {
    ({ streakGrew } = progress.completeLesson(lesson.id, average));
  }

  state.celebration = {
    title: lesson.practice ? "¡Repaso completado!" : "¡Lección completada!",
    phrases: lesson.queue.length,
    average,
    streak: progress.currentStreak(),
    streakGrew,
    practice: lesson.practice,
  };
  state.stage = "complete";
  render();
}

function renderBanner() {
  const banner = state.banner;
  const kinds = {
    great: {
      cls: "great",
      head: "¡Genial!",
      sub: "A native would follow you without blinking. Tap Listen again, then You, to hear the two of you back to back.",
    },
    ok: {
      cls: "ok",
      head: "¡Bien!",
      sub: "Solid. The tinted words above could use another listen — tap Listen again to compare.",
    },
    retry: {
      cls: "retry",
      head: "Casi…",
      sub: "Tap Listen again above, then You, and copy the rhythm.",
    },
    neutral: {
      cls: "neutral",
      head: "How did that feel?",
      sub: "Compare the two waveforms above, then carry on.",
    },
    scoring: {
      cls: "neutral",
      head: "Scoring…",
      sub: "Azure is listening to your attempt.",
    },
  };
  const k = kinds[banner.kind] ?? kinds.neutral;

  /* From memory, the news isn't "your accent was close" — it's whether she
     produced the right words at all, which is what the score and the "Heard:"
     line below actually answer. */
  const recalled = state.recall && banner.kind !== "scoring";
  const head = recalled && !state.peeked && banner.kind === "great" ? "¡De memoria!" : k.head;
  const sub = !recalled
    ? k.sub
    : state.peeked
    ? "You had a look at this one, so it'll come round again. Listen and copy it now."
    : banner.kind === "retry"
    ? "Check the phrase above against what you said — Heard: below tells you what came out."
    : banner.kind === "neutral"
    ? "The phrase is above now. Tap Listen again, then You, and see whether you had it."
    : "Remembered it. Tap Listen again, then You, to check the two against each other.";

  return `
    <div class="banner ${k.cls}">
      <div class="banner-text">
        <div class="banner-head">${head}${banner.score != null ? ` · ${Math.round(banner.score)}` : ""}</div>
        <div class="banner-sub">${sub}</div>
      </div>
      <div class="banner-buttons">
        ${banner.kind === "scoring" ? `<span class="spinner"></span>` : `
        <button class="btn btn-ghost" id="banner-retry">Retry</button>
        <button class="btn btn-primary" id="banner-continue">Continue</button>`}
      </div>
    </div>`;
}

/* Listen. Azure's clip if we have it, the browser's voice if we don't — and a
   word either way when nothing comes out, which is the part that was missing.
   A button that plays no sound and says nothing is indistinguishable from a
   broken one, and on iOS the browser voice fails exactly that way. */
function playModel(rate) {
  const phrase = currentPhrase();
  if (!phrase) return;
  if (state.modelBlob) {
    player.play(state.modelBlob, { rate }).catch(() => toast("Couldn't play that clip."));
  } else if (browserSpeech.available(phrase.language)) {
    browserSpeech.speak(phrase.text, phrase.language, { rate, onSilent: noVoice });
  } else {
    noVoice();
  }
}

async function toggleRecording() {
  const button = document.getElementById("record");
  const label = document.getElementById("record-label");

  if (state.recorder.isRecording) {
    clearInterval(state.levelTimer);
    state.levelTimer = null;
    button.classList.remove("recording");
    label.textContent = "Working on it…";
    const result = await state.recorder.stop();
    if (!result) {
      label.textContent = "Too short — try again";
      return;
    }
    await handleRecording(result);
    return;
  }

  stopEverything();
  state.recorder = new Recorder();
  try {
    await state.recorder.start();
  } catch (error) {
    toast(
      String(error?.name) === "NotAllowedError"
        ? "Microphone blocked. Allow it in Safari's site settings."
        : "Couldn't start recording."
    );
    return;
  }

  button.classList.add("recording");
  const ring = document.getElementById("ring");
  state.levelTimer = setInterval(() => {
    const level = state.recorder.level();
    if (ring) ring.style.transform = `scale(${1 + level * 0.35})`;
    if (label) label.textContent = `Recording… ${state.recorder.elapsed().toFixed(1)}s`;
  }, 60);
}

async function handleRecording({ blob, duration }) {
  const phrase = currentPhrase();
  if (!phrase) return;

  // The question is over the moment she has answered it — the phrase, the tip
  // and Listen all come back now so she can check herself against the model.
  const wasAsked = state.recall;
  const peeked = state.peeked;
  state.revealed = true;

  const attempt = {
    id: uid(),
    phraseID: phrase.id,
    recordedAt: new Date().toISOString(),
    duration,
    // How it was drilled. Older attempts have no mode; they were all read
    // off the screen, which is what "listen" means.
    mode: !wasAsked ? "listen" : peeked ? "recall-shown" : "recall",
    overall: null,
    accuracy: null,
    fluency: null,
    completeness: null,
    transcript: null,
    words: [],
    engine: "Not scored",
  };

  await audioStore.putRecording(attempt.id, blob);
  library.recordAttempt(attempt);
  state.attempt = attempt;
  state.attemptBlob = blob;

  try {
    state.attemptAnalysis = await analyse(blob);
  } catch {
    state.attemptAnalysis = null;
  }

  state.scoringNow = settings.hasAzure;
  state.banner = settings.hasAzure ? { kind: "scoring", score: null } : { kind: "neutral", score: null };
  render();

  if (!settings.hasAzure) {
    announceLevelUp(phrase);
    return;
  }

  const result = await scoring.score(blob, phrase, settings);
  state.scoringNow = false;
  if (state.attempt?.id !== attempt.id) return;
  if (result) {
    Object.assign(attempt, result);
    library.updateAttempt(attempt);
    state.attempt = attempt;
    const score = attemptScore(attempt);
    state.banner = {
      kind: score >= PASS_GREAT ? "great" : score >= PASS_OK ? "ok" : "retry",
      score,
    };
  } else {
    state.banner = { kind: "neutral", score: null };
  }
  render();
  announceLevelUp(phrase);
}

/* Say so the once, on the go that tips a card over. Silent if the card was
   already a memory question, or if recall is switched off in Settings. */
function announceLevelUp(phrase) {
  if (state.recall || !settings.recallMode) return;
  if (library.goodAttempts(phrase.id) !== RECALL_AFTER) return;
  toast("¡Nivel 2! Next time you'll say this one from memory.", 3600);
}

/* The Spanish with its tense machinery lit up. `marked` on an El pasado card
   is the text with the ending — or the auxiliary pair — in [brackets], and it
   renders as a gold highlight on the drill card, so the -aba, the -é or the
   `he ido` is seen on the verb itself rather than only read about in the
   verdict. The brackets must reduce to the text exactly, or the plain text is
   used instead — which is what keeps an edited card showing its edit (the
   override changes `text`, not `marked`) and what makes a typo in the marks
   cost only the highlight. */
function drillSpanish(phrase) {
  const marked = phrase.marked;
  if (marked && marked.replace(/[\[\]]/g, "") === phrase.text) {
    return esc(marked)
      .replace(/\[/g, `<span class="ending-mark">`)
      .replace(/\]/g, "</span>");
  }
  return esc(phrase.text);
}

/* Dot or line, asked before the sentence is on the screen. The card gives her
   the English and the shapes are the whole of what she can do with it — no way
   past the question except answering it, which is the point: the decision has
   to happen before the words do, not after she has already read the ending.

   The endings ride every choice button in bold and the verdict prints them in
   big print, because ending ↔ shape is the association these lessons exist to
   build — this is what's being drilled, not the phrases. The grammar-book term
   stays small and italic underneath: on the screen every time, never the thing
   she is asked for. */
function aspectGateBody(phrase) {
  const choices = aspectChoices(state.lesson?.queue);
  /* Two buttons and the question names them both; the moment a lesson puts the
     present perfect on the table, "Dot in a box, or line?" is literally the
     wrong question — neither answer is on offer — so it widens. */
  const question = choices.length > 2 ? "Which shape?" : "Dot in a box, or line?";
  return `
    <p class="instruction">${question}</p>

    <div class="card drill-card">
      <p class="drill-text recall-prompt">${esc(phrase.translation)}</p>
      <p class="tiny muted" style="margin:10px 0 0">Decide the shape first. The Spanish comes after — with its ending.</p>
    </div>

    <div class="aspect-choices">
      ${choices
        .map((key) => [key, ASPECTS[key]])
        .map(
          ([key, aspect]) => `
        <button class="aspect-choice" data-aspect="${key}">
          <span class="aspect-mark shape-${key}">${aspect.mark}</span>
          <span class="aspect-choice-body">
            <strong>${esc(aspect.label)}</strong>
            <span class="aspect-gloss">${esc(aspect.gloss)}</span>
            <span class="aspect-endings">${esc(aspect.endings)}</span>
            <span class="aspect-term">${esc(aspect.term)}</span>
          </span>
        </button>`
        )
        .join("")}
    </div>`;
}

/* What she picked, what it was, and the ending in big print — directly above
   the sentence, so the page reads shape first, then the words that have it.
   The note is the one part that waits behind a level-two question: it explains
   this particular sentence by quoting Spanish, often the very form she is
   being asked to produce. It comes back the moment the card is revealed. */
function aspectVerdict(shape, choice, asking) {
  if (!shape || !choice) return "";
  const right = choice === shape.key;
  const picked = ASPECTS[choice];
  const mine = picked?.label.toLowerCase() ?? "something else";
  const theirs = shape.label.toLowerCase();
  return `
    <div class="card aspect-verdict ${right ? "right" : "wrong"}">
      <span class="aspect-mark shape-${shape.key}">${shape.mark}</span>
      <span class="aspect-verdict-body">
        <strong>${right ? `Yes — ${esc(theirs)}` : `Not quite — ${esc(theirs)}, not ${esc(mine)}`}</strong>
        <span class="aspect-endings">${esc(shape.endings)}</span>
        <span class="aspect-term">${esc(shape.term)}</span>
        ${asking || !shape.note ? "" : `<span class="aspect-why">${esc(shape.note)}</span>`}
      </span>
    </div>`;
}

// ------------------------------------------------------------- celebration

export function renderComplete() {
  const c = state.celebration;
  if (!c) {
    state.stage = "path";
    return render();
  }

  const confetti = Array.from({ length: 36 }, (_, i) => {
    const colors = ["var(--green)", "var(--blue)", "var(--gold)", "var(--orange)", "var(--purple)"];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.9;
    const duration = 2 + Math.random() * 1.6;
    const size = 6 + Math.random() * 7;
    return `<span class="confetto" style="left:${left}%;width:${size}px;height:${size * 0.5}px;background:${colors[i % colors.length]};animation-delay:${delay}s;animation-duration:${duration}s"></span>`;
  }).join("");

  view.innerHTML = `
    <div class="confetti">${confetti}</div>
    <div class="complete">
      ${parrotSVG(120)}
      <h1 class="complete-title">${esc(c.title)}</h1>
      <div class="stat-row">
        <div class="stat" style="--stat:var(--blue)">
          <div class="stat-label">Phrases</div>
          <div class="stat-value">${c.phrases}</div>
        </div>
        ${
          c.average != null
            ? `<div class="stat" style="--stat:${scoreColour(c.average)}">
                 <div class="stat-label">Average</div>
                 <div class="stat-value">${c.average}</div>
               </div>`
            : ""
        }
        <div class="stat ${c.streakGrew ? "grew" : ""}" style="--stat:var(--orange)">
          <div class="stat-label">Streak</div>
          <div class="stat-value">${flameSVG()} ${c.streak}</div>
        </div>
      </div>
      ${c.streakGrew ? `<p class="small" style="color:var(--orange);font-weight:800">Streak extended — see you tomorrow at 6:30.</p>` : ""}
      <button class="btn btn-primary btn-big" id="complete-continue">Continue</button>
    </div>`;

  document.getElementById("complete-continue").onclick = () => {
    state.celebration = null;
    state.lesson = null;
    state.stage = "path";
    render();
  };
}
