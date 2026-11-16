// Settings, the version panel and the storage line.

import { COURSE_LANGUAGE, LESSONS } from "./content.js";
import { library, settings, progress, audioStore, VOICES, RECALL_AFTER } from "./store.js";
import { speech } from "./speech.js";
import { cardAssistant } from "./card-assistant.js";
import { VERSION } from "./version.js";
import { esc, homeLink, toast, view } from "./core.js";
import { render } from "./app.js";

// ---------------------------------------------------------------- settings

export function renderSettings() {
  const doneCount = LESSONS.filter((l) => progress.isDone(l.id)).length;

  view.innerHTML = `
    <header class="home-head section-head">
      <div class="wordmark">Settings</div>
      ${homeLink()}
    </header>

    <div class="section-label">Card builder</div>
    <div class="card">
      <label class="field"><span>Address</span>
        <input type="text" id="s-assistant-url" value="${esc(settings.assistantEndpoint)}" autocomplete="off"
               placeholder="The address Fin sent you"></label>
      <label class="field"><span>Shared passcode</span>
        <input type="password" id="s-assistant-passcode" value="${esc(settings.assistantPasscode)}" autocomplete="off"></label>
      <button class="btn btn-primary" id="s-assistant-test" style="width:100%">Save and test</button>
      <div id="s-assistant-result" style="margin-top:10px"></div>
      <p class="tiny muted" style="margin:12px 0 0">
        This is what powers the Add tab. The passcode is the shared app one — not a key of your own.
      </p>
    </div>

    <div class="section-label">Azure voice and scoring</div>
    <div class="card">
      <label class="field"><span>Speech key</span>
        <input type="password" id="s-key" value="${esc(settings.azureKey)}" autocomplete="off" placeholder="Paste the key Fin sent you"></label>
      <label class="field"><span>Region</span>
        <input type="text" id="s-region" value="${esc(settings.azureRegion)}" autocomplete="off" placeholder="northeurope"></label>
      <label class="field"><span>Voice</span>
        <select id="s-voice">
          ${VOICES.map(
            (v) => `<option value="${v.id}" ${v.id === settings.azureVoice ? "selected" : ""}>${esc(v.name)} · ${esc(v.detail)}</option>`
          ).join("")}
        </select></label>
      <button class="btn btn-primary" id="s-test" style="width:100%">Save and test</button>
      <div id="s-test-result" style="margin-top:10px"></div>
      <p class="tiny muted" style="margin:12px 0 0">
        The key is stored only in this browser, on this device. It's what makes the
        scoring and the good voices work.
      </p>
    </div>

    <div class="section-label">Lessons</div>
    <div class="card">
      <label class="field"><span>Slow speed — ${Math.round(settings.slowRate * 100)}%</span>
        <input type="range" id="s-rate" min="0.4" max="0.9" step="0.05" value="${settings.slowRate}"></label>
      <div class="switch-row">
        <span>Show meaning up front</span>
        <input type="checkbox" id="s-translation" ${settings.showTranslationUpFront ? "checked" : ""}>
      </div>
      <div class="switch-row">
        <span>Level 2 — drill from memory</span>
        <input type="checkbox" id="s-recall" ${settings.recallMode ? "checked" : ""}>
      </div>
      <p class="tiny muted" style="margin:8px 0 0">Once you've said a card well ${RECALL_AFTER} times it stops
        showing you the Spanish — you get the English and have to remember it. There's a "Show me" if you're stuck.</p>
      <div class="switch-row">
        <span>Dot in a box, or line — name the shape first</span>
        <input type="checkbox" id="s-aspect" ${settings.aspectGate ? "checked" : ""}>
      </div>
      <p class="tiny muted" style="margin:8px 0 0">On the El pasado lessons the drill shows you the English and asks
        which shape the past is — a dot in a box (<em>-é, -ó</em>), a line (<em>-aba, -ía</em>), or a line reaching
        now (<em>he + -ado</em>) — before it shows the Spanish. Cards outside those lessons never carry a shape, so
        this does nothing to the rest of the course.</p>
    </div>

    <div class="section-label">Audio</div>
    <div class="card">
      <button class="btn" id="s-prefetch" style="width:100%">Download all lesson audio</button>
      <div id="s-prefetch-status" class="tiny muted" style="margin-top:8px"></div>
      <button class="btn btn-danger" id="s-clear" style="width:100%;margin-top:10px">Clear audio cache</button>
      <p class="tiny muted" style="margin:10px 0 0" id="s-usage"></p>
    </div>

    <div class="section-label">Your data</div>
    <div class="card">
      <button class="btn" id="s-export" style="width:100%">Export progress and phrases</button>
      <label class="btn" style="width:100%;margin-top:10px;cursor:pointer">
        Import from a file
        <input type="file" id="s-import" accept="application/json" hidden>
      </label>
      <p class="tiny muted" style="margin:10px 0 0">
        ${doneCount} of ${LESSONS.length} lessons done · ${library.customPhrases.length} own phrase${
          library.customPhrases.length === 1 ? "" : "s"
        } ·
        ${library.favourites.length} favourite${library.favourites.length === 1 ? "" : "s"} ·
        ${library.attempts.length} recordings. iOS can clear a web app's storage if it
        goes unused for a long time, so export once in a while.
      </p>
    </div>

    <div class="section-label">Version</div>
    <div class="card">
      <div class="version-row">
        <span>Running</span>
        <strong id="s-running">${esc(VERSION)}</strong>
      </div>
      <div class="version-row">
        <span>Installed</span>
        <strong id="s-installed">…</strong>
      </div>
      <p class="tiny muted" id="s-version-note" style="margin:10px 0 0"></p>
      <button class="btn" id="s-update" style="width:100%;margin-top:10px">Check for an update</button>
    </div>

    <p class="tiny muted center" style="margin-top:22px">mum·o·lingo — made for Mum, with love (and a parrot)</p>`;

  document.getElementById("s-rate").oninput = (event) => {
    settings.slowRate = Number(event.target.value);
    settings.save();
    event.target.parentElement.querySelector("span").textContent = `Slow speed — ${Math.round(settings.slowRate * 100)}%`;
  };

  document.getElementById("s-translation").onchange = (event) => {
    settings.showTranslationUpFront = event.target.checked;
    settings.save();
  };

  document.getElementById("s-aspect").onchange = (event) => {
    settings.aspectGate = event.target.checked;
    settings.save();
  };

  document.getElementById("s-recall").onchange = (event) => {
    settings.recallMode = event.target.checked;
    settings.save();
  };

  document.getElementById("s-assistant-test").onclick = async () => {
    settings.assistantEndpoint = document.getElementById("s-assistant-url").value.trim();
    settings.assistantPasscode = document.getElementById("s-assistant-passcode").value.trim();
    settings.save();

    const box = document.getElementById("s-assistant-result");
    if (!settings.hasAssistant) {
      box.innerHTML = `<div class="notice">Enter the address and the shared passcode.</div>`;
      return;
    }
    box.innerHTML = `<p class="small muted"><span class="spinner"></span> Testing…</p>`;
    try {
      const result = await cardAssistant.test(settings);
      box.innerHTML = `<div class="notice good">Card builder connected${result.model ? ` · ${esc(result.model)}` : ""}.</div>`;
    } catch (error) {
      box.innerHTML = `<div class="notice bad">${esc(error.message)}</div>`;
    }
  };

  document.getElementById("s-voice").onchange = (event) => {
    settings.azureVoice = event.target.value;
    settings.save();
  };

  document.getElementById("s-test").onclick = async () => {
    settings.azureKey = document.getElementById("s-key").value.trim();
    settings.azureRegion = document.getElementById("s-region").value.trim();
    settings.azureVoice = document.getElementById("s-voice").value;
    settings.save();

    const box = document.getElementById("s-test-result");
    if (!settings.hasAzure) {
      box.innerHTML = `<div class="notice">No key set — the browser voice will be used, without comparison or scoring.</div>`;
      return;
    }
    box.innerHTML = `<p class="small muted"><span class="spinner"></span> Testing…</p>`;
    try {
      await speech.synthesise("Hola", COURSE_LANGUAGE, settings);
      box.innerHTML = `<div class="notice good">Azure is working. New audio will use ${esc(settings.azureVoice)}.</div>`;
    } catch (error) {
      box.innerHTML = `<div class="notice bad">${esc(speech.lastError ?? error.message)}</div>`;
    }
  };

  document.getElementById("s-prefetch").onclick = async () => {
    const status = document.getElementById("s-prefetch-status");
    if (!settings.hasAzure) {
      status.textContent = "Needs an Azure key.";
      return;
    }
    await speech.prefetch(library.drillable(), settings, (done, total) => {
      status.textContent = `${done} / ${total}`;
    });
    status.textContent = "Done — every lesson now works offline.";
    showUsage();
  };

  document.getElementById("s-clear").onclick = async () => {
    await audioStore.clearModelCache();
    toast("Cached model audio cleared. Recordings are untouched.");
    showUsage();
  };

  document.getElementById("s-export").onclick = () => {
    const blob = new Blob([library.exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mumolingo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  document.getElementById("s-import").onchange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      library.importJSON(await file.text());
      toast("Imported.");
      render();
    } catch (error) {
      toast(`Import failed: ${error.message}`);
    }
  };

  showUsage();
  showVersion();

  document.getElementById("s-update").onclick = async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> Checking…`;
    try {
      const registration = await navigator.serviceWorker?.getRegistration?.();
      // Asks the network for sw.js regardless of how fresh the browser thinks
      // its copy is. If a new one is there it installs and takes over, and the
      // two numbers above go out of step until the page is reloaded.
      await registration?.update();
    } catch {
      // Offline, or no worker — showVersion says what it can see either way.
    }
    button.disabled = false;
    button.textContent = "Check for an update";
    await showVersion({ checked: true });
  };
}

/* Two numbers, because "is the fix in?" and "has the phone caught up?" are
   different questions, and having only one of them is what makes a stale app
   so confusing. "Running" is the version of the JavaScript executing right
   now; "Installed" is what the service worker has in its cache, read back from
   the cache name. They match in the steady state. After a deploy the installed
   one moves first, and the gap between them is the reload still owed. */
async function showVersion({ checked = false } = {}) {
  const installedEl = document.getElementById("s-installed");
  const note = document.getElementById("s-version-note");
  if (!installedEl || !note) return;

  let installed = null;
  try {
    const keys = await caches.keys();
    installed = keys.filter((key) => key.startsWith("mumolingo-")).sort().pop() ?? null;
  } catch {
    installed = null;
  }
  const short = installed ? installed.replace(/^mumolingo-/, "") : null;

  installedEl.textContent = short ?? "not cached";
  note.className = "tiny muted";
  if (!short) {
    note.textContent =
      "No offline copy yet — the app is coming straight from the network, so it's always current.";
    return;
  }
  if (short === VERSION) {
    note.textContent = checked ? "Up to date." : "Up to date — this is the newest version on this phone.";
    return;
  }
  note.className = "tiny";
  note.innerHTML = `A newer version (${esc(short)}) is installed but isn't running yet. Reload to finish updating.
    <button class="link" id="s-reload" style="padding:0 0 0 4px">Reload now</button>`;
  document.getElementById("s-reload").onclick = () => location.reload();
}

async function showUsage() {
  const el = document.getElementById("s-usage");
  if (!el) return;
  const usage = await audioStore.usage();
  el.textContent = usage
    ? `Using ${(usage.usage / 1e6).toFixed(1)} MB of roughly ${(usage.quota / 1e6).toFixed(0)} MB available.`
    : "";
}
