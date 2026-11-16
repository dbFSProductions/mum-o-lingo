// Every page opens, the main route through each is walked, and nothing
// throws. Run this after any change: a missing import or a renamed function
// shows up here as a console error.
//
// Azure is a fake SDK and the card assistant is a stub (see lib.js), so this
// says the screens are wired, not that either service works.
const { open, stubWorker, fakeAzure, tally, STORE } = require("./lib.js");
const { ok, done } = tally("smoke");

const CARD = {
  text: "¿Tiene una mesa para dos?", translation: "Do you have a table for two?",
  situation: "At a restaurant door", usageNote: "Polite and usual.", focusNote: "Soft d in dos.",
  reviewNote: "Tidied the question.",
};
const WORKER_ROUTES = {
  "/complete-card": (body) => (/single vocabulary word|window/i.test(JSON.stringify(body))
    ? { ...CARD, text: "la ventana.", translation: "the window" } : CARD),
  "/replies": { replies: [{ text: "Sí, pasen.", translation: "Yes, come in." }, { text: "Está completo.", translation: "We're full." }] },
  "/chat": (body) => (/SOUNDS|sounds like/i.test(JSON.stringify(body))
    ? { reply: "SOUNDS: ven-tanner\nPICTURE: A tanner called Ven climbs in through the window." }
    : { reply: "Because that is how it is said." }),
  "/interview": { reply: "Where do you live?" },
  "/about-cards": { cards: [{ ...CARD, text: "Vivo en Barcelona.", translation: "I live in Barcelona." }] },
};

(async () => {
  const { browser, page, errors } = await open({
    settings: { azureKey: "k" },
    init: fakeAzure,
    args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
  });
  const calls = await stubWorker(page, WORKER_ROUTES);
  const called = (path) => calls.filter((c) => c.path === path).length;
  const home = async () => { await page.goto(page.url().split("#")[0]); await page.waitForSelector(".tile"); };
  const text = (selector) => page.textContent(selector);
  const stored = (key) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), `${STORE}.${key}`);
  const closeSheet = () => page.click("#sheet button[data-close-sheet]");

  // Home: the header, the week strip and the tiles.
  await page.waitForSelector(".tile");
  const tiles = (await page.$$(".tile")).length;
  ok(tiles >= 6, `home has its tiles (${tiles})`);
  ok(await page.$(".wordmark"), "wordmark");
  ok(await page.$("[data-open-settings]"), "the cog");
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= 390), "home does not scroll sideways");

  // Practice: the path, a lesson, the drill and everything hung off it.
  await page.click('[data-section="practice"]');
  await page.waitForSelector("[data-lesson]");
  ok(!(await page.$(".node.locked")), "nothing on the path is locked");
  await page.click("[data-lesson]");
  await page.waitForSelector(".drill-text");
  await page.waitForTimeout(1200); // the model audio settles and re-renders
  await page.click("#listen");
  await page.click("#slow");
  await page.click("#drill-get-replies");
  await page.waitForSelector(".drill-replies [data-say]");
  await page.click(".drill-replies [data-say]");
  await page.click(".drill-replies [data-keep]");
  await page.fill("#drill-chat textarea", "Why?");
  await page.click('#drill-chat button[type="submit"]');
  await page.waitForSelector("#drill-chat .chat-keep");
  await page.click("#drill-chat .chat-keep");
  await page.waitForSelector("#drill-notes .kept-note");
  await page.click("#drill-edit");
  await page.waitForSelector("#f-text");
  await closeSheet();

  // Record against the fake microphone; the fake Azure scores it 95.
  await page.click("#record");
  await page.waitForSelector("#record.recording");
  await page.waitForTimeout(700);
  await page.click("#record");
  await page.waitForSelector(".dial-value");
  ok((await text(".dial-value")).trim() === "95", "the fake score reaches the dial");
  ok((await stored("attempts")).length === 1, "one attempt is stored");
  ok(await page.$("#wave-you"), "the comparison is drawn");
  await page.$eval("#play-you", (b) => b.click()); // the banner sits over it
  await page.click("#banner-continue");
  await page.waitForSelector("#skip");

  // Skip through the rest of the lesson.
  for (let i = 0; i < 4; i++) await page.click("#skip");
  await page.waitForSelector("#complete-continue");
  await page.click("#complete-continue");
  await page.waitForSelector("[data-lesson]");
  ok(Object.keys((await stored("progress")).lessons || {}).length === 1, "the lesson is ticked");

  // The end of the path: Repaso, and quitting a drill.
  await page.click("#practice");
  await page.waitForSelector(".drill-text");
  await page.click("#quit");
  await page.waitForSelector("[data-lesson]");

  // Words: a picture card, and Add a word filled in by the assistant.
  await home();
  await page.click('[data-section="words"]');
  await page.waitForSelector("[data-lesson]");
  await page.click("[data-lesson]");
  await page.waitForSelector(".picture-note");
  ok(await page.$(".gender-dot"), "a noun carries its gender cue");
  await page.click("#quit");
  await page.click("[data-add-word]");
  await page.waitForSelector("#word-fill");
  await page.fill("#f-translation", "window");
  await page.click("#word-fill");
  await page.waitForFunction(() => document.getElementById("f-picture").value.length > 0);
  ok((await page.inputValue("#f-text")) === "la ventana", "Add a word: the word comes back without its full stop");
  await page.click("#word-save");
  ok((await stored("phrases")).some((p) => p.text === "la ventana"), "the word is saved");

  // The Past: the shape gate comes before the drill.
  await home();
  await page.click('[data-section="past"]');
  await page.waitForSelector("[data-lesson]");
  await page.click("[data-lesson]");
  await page.waitForSelector(".aspect-choice");
  await page.click(".aspect-choice");
  await page.waitForSelector(".aspect-verdict");
  ok(await page.$("#record"), "the drill follows the gate");
  await page.click("#quit");

  // Sobre mí: the interview asks by itself, an answer, a batch of cards.
  await home();
  await page.click("[data-about]");
  await page.waitForSelector("#about-form");
  await page.waitForFunction(() => /Where do you live/.test(document.getElementById("about-log").textContent));
  await page.fill("#about-answer", "In Barcelona.");
  await page.click("#about-send");
  await page.waitForFunction(() => !document.getElementById("about-make").disabled);
  await page.click("#about-make");
  await page.waitForSelector("#about-practise");
  ok(called("/about-cards") === 1, "Sobre mí asked for its cards once");
  await page.click("#about-back");
  await page.waitForSelector(".tile");

  // Quick: ask, get the phrase, it is saved as it arrives.
  await page.click('[data-section="quick"]');
  await page.waitForSelector("#quick-ask");
  await page.fill("#quick-ask", "a table for two");
  await page.click("#quick-go");
  await page.waitForSelector("#quick-answer [data-say], #quick-answer button");
  ok((await stored("phrases")).some((p) => p.text === CARD.text), "Quick saves the card as it arrives");

  // All Phrases: search, the sheet, the editor; then Add a card to the review.
  await home();
  await page.click('[data-section="phrases"]');
  await page.waitForSelector("#phrase-list [data-phrase]");
  await page.fill("#search", "por favor");
  await page.click("#phrase-list [data-phrase]");
  await page.waitForSelector("#p-edit");
  await page.click("#p-edit");
  await page.waitForSelector("#f-save");
  await closeSheet();
  await page.click("[data-open-add]");
  await page.waitForSelector("#add-situation");
  await page.fill("#add-situation", "At the baker's");
  await page.fill("#add-english", "A loaf of bread, please");
  await page.click("#complete-card");
  await page.waitForSelector("#card-preview:not([hidden])");
  await page.waitForSelector("#result-replies [data-say]");
  await page.click("#undo-complete");
  ok((await page.inputValue("#add-english")) === "A loaf of bread, please", "Undo puts her own words back");

  // Settings: the panels and the version pair.
  await home();
  await page.click("[data-open-settings]");
  await page.waitForSelector("#s-voice");
  ok(/^v\d+$/.test((await text("#s-running")).trim()), "Settings shows the running version");
  await page.click("#s-aspect");
  await page.click("#s-aspect");
  await page.click("[data-go-home]");
  await page.waitForSelector(".tile");

  await done(browser, errors);
})().catch((error) => { console.log("smoke: crashed —", error.message.split("\n").slice(0, 3).join(" ")); process.exit(1); });
