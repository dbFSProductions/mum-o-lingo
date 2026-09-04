// Client for the small Cloudflare Worker that keeps the Gemini key off-device.
//
// Shared verbatim with Xerra, and pointed at the same deployed Worker: it takes
// the language from the request, and GitHub Pages serves both apps from the one
// origin its CORS list already allows. Port fixes both ways.

function baseURL(settings) {
  return settings.assistantEndpoint.trim().replace(/\/+$/, "");
}

async function request(path, settings, options = {}) {
  if (!settings.hasAssistant) {
    throw new Error("Add the card assistant address and passcode in Settings first.");
  }

  let response;
  try {
    response = await fetch(`${baseURL(settings)}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.assistantPasscode.trim()}`,
        ...options.headers,
      },
      // The Worker budgets 60s across its retries and its fallback model, so it
      // answers first with a real reason. This deadline is the backstop: without
      // it a stalled request leaves the button spinning forever with no retry.
      signal: AbortSignal.timeout?.(70_000),
    });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw new Error("The card assistant took too long to answer. Try again.");
    }
    throw new Error("Couldn't reach the card assistant. Check its address and your connection.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Card assistant returned ${response.status}.`);
  }
  return payload;
}

export const cardAssistant = {
  test(settings) {
    return request("/health", settings, { method: "GET" });
  },

  complete(draft, settings) {
    return request("/complete-card", settings, {
      method: "POST",
      body: JSON.stringify(draft),
    });
  },

  /* Replies are a separate call on purpose: card generation has to stay the
     small fast one. Putting them in /complete-card once roughly doubled its
     output and pushed it past the Worker's per-attempt timeout, so the Add tab
     spun for a minute and then reported Gemini busy. */
  replies(card, settings) {
    return request("/replies", settings, {
      method: "POST",
      body: JSON.stringify(card),
    });
  },

  /* The Sobre mí interview. Two calls, one conversation: /interview asks the
     next English question, /about-cards turns the whole transcript into cards.
     Split for the same reason replies are split off card generation — writing
     a batch of cards is the big slow call and asking one question is not, so
     they have to be able to fail separately. How many a batch holds is the
     Worker's to decide; this client saves whatever comes back. */
  interview(payload, settings) {
    return request("/interview", settings, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  aboutCards(payload, settings) {
    return request("/about-cards", settings, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /* The keyword picture, drawn. The biggest and slowest thing the Worker
     makes, and the only one that comes back as bytes rather than words — which
     is exactly why it is an endpoint of its own rather than a field on
     something else. See what replies did to /complete-card. */
  picture(payload, settings) {
    return request("/picture", settings, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  chat(payload, settings) {
    return request("/chat", settings, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
