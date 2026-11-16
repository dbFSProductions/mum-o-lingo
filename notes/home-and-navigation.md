# Home, the tiles, the path and the page heads

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

## The home screen: a wordmark, six tiles, and the path

The tab bar is gone. Four buttons for four things that were never peers —
Learn was the home screen, Phrases and Add things you do occasionally, Settings
rarer still. Ported from Xerra, where the same bar had the same problem.

- **The header carries the brand and the two controls.** The parrot at 34px
  beside the wordmark, then the streak and a cog. The big parrot stays in the
  greeting card below: one is the logo, the other is the mascot talking to you.
- **The cog is a toothed cog, not the spoked circle the tab bar used**, and it
  sits on a tinted disc. Under the word *Settings* the old mark read fine;
  alone on a header it reads as a brightness icon, and on Xerra it was reported
  as simply not being findable. Fixed there first, ported already fixed.
- **Every page below home prints `homeLink()`** — *‹ Home* — behind one
  delegated listener on `view`, so a page only has to print the link.

### Home is six tiles; the path is one tap in

The first cut put the tiles *above* the path, so the home screen was still the
winding course with four squares on top of it. Now home is the header, the
greeting and six tiles, and nothing else — the path lives behind **Practice**.

- **`PRACTICE` is a section like the others**, not a special case of "no
  section". Three places test for it, which is why it is a named constant: a
  typo in any of them draws an empty path rather than erroring.
- **Sobre mí is a square, not a unit on the path.** It was a unit led by a
  workshop node that opened the interview — and buried under Mézclalo it was
  the last thing on the longest page, for a deck that is not a lesson you work
  through any more than the past tense is. So the tile does what the node did:
  it opens the interview page, which lists the cards. `pathUnits` leaves
  `ABOUT_UNIT_ID` out alongside `TILE_UNITS`; `allUnits` keeps it, so Repaso's
  pool and `findLesson` still see the cards. It is the one tile carrying
  `data-about` rather than `data-section`, because it opens a page and not a
  path, and it is green — the one strong colour the other five don't use.
  **It is always shown**, unlike the unit, which stayed away with no assistant
  and no cards: a tile that comes and goes leaves a hole in a grid, so the
  tile says *Needs the card builder* instead and the page it opens links to
  Settings. All Phrases still lists the cards under their own label, because
  that page is every card. Ported from Xerra, where the same row came out of
  Decks the same day.
- **Sobre mí sits where The Past was, and The Past went down beside Phrases.**
  The order is Practice, Words, Sobre mí, Quick, The Past, Phrases. Asked for
  from the phone; the two you reach for most belong on the top two rows.
- **Phrases is a square too, and that is what makes six.** It was `.tile-wide`,
  a button across the bottom on the argument that the whole library outranks a
  slice of it; five squares and a strip read worse than six squares, and the
  argument was never strong. `.tile-wide` is gone with it.
- **`SECTION_TITLES` is what a section is called on the way in, and it is
  deliberately not the unit's own title.** The Palabras unit is still called
  Palabras in `content.js`; **Words** is what the tile says and what the page
  says once you are in it. A tile reading Words that opens a page reading
  Palabras is two names for one place, and that is exactly what the first cut
  did. One table, read by both the tile and the section head — change a name
  there and both follow.
- **Mézclalo moved with the path.** It is the end of the course, so it belongs
  behind Practice rather than on a home screen that no longer shows lessons.

### Every list wears a colour, and Home is in the same place everywhere

Ported from Xerra the day it landed there, asked for as *"mum-o and Deb-o now
look dull without all the colours"*. Words and The Past were never dull — they
are the path's own units, banners and all — so what changed is the pages that
listed white rows under grey labels.

- **Phrases groups its rows under a one-row banner in the group's colour**
  (`group()` in `renderPhrases`, `.list-banner` in app.css), with the rows
  under it striped in the same colour (`.row.striped`) and spaced out as
  cards (`.rows-spaced`) rather than fused into one list. A course lesson
  takes its unit's `color` off the path, so a lesson looks the same here as
  its banner does there; Favourites are gold and Sobre mí green, as their
  tiles are; own phrases are blue; a jotted-down capture is orange, the
  colour of the Add page it is waiting to be finished on. Gold takes dark
  lettering, as the tile does. The colours are set inline (`--hue`,
  `--hue-dark`, `--hue-on`) because a unit's colour is a hex in `content.js`
  rather than a palette variable.
- **Quick's answer card and its *Asked for before* rows are striped in
  Quick's orange, and Sobre mí's cards in its green.** Same stripe, same
  spaced rows.
- **Every page below Home opens with the same `home-head section-head` —
  the title where the wordmark goes and *‹ Home* beside it.** Phrases,
  Settings and Add had the link on a line above an `h1`, and Sobre mí had a
  ✕ in a lesson bar: four pages, three shapes of the same control. Reported
  as the Home button being different in Sobre mí. `.page-back`,
  `.list-intro`, `.about-head` and `.about-lede` went with it; Sobre mí
  keeps its `#about-back` id and handler.

Xerra's version of this also paints its deck rows as filled banners and its
print sheet; neither has a counterpart here, since this app has no deck list
and no print page.

### El pasado and Palabras came off the path

`TILE_UNITS` is the whole of it: those two units are reached through a tile
instead of the path.

- **They were never "next".** One is a grammar drill, the other a vocabulary
  pile you dip into — neither is a thing you work through in order. Strung out
  along the winding path they buried the everyday lessons under twenty more
  nodes, so the path stopped reading as progress.
- **They are still ordinary units.** Same shape, same lessons, same progress
  ticks, drawn by the same `renderPath` — `section` simply filters which units
  it draws. **There is deliberately no second renderer**: a copy would drift,
  and the first thing to drift would be the node states.
- **`pathUnits()` and `unitFor(section)` answer two different questions.** The
  first is what the path draws, the second is what one tile opens. Mixing them
  up is how a unit ends up in both places or neither.
- **A tile whose unit is empty is not shown.** `tiles()` filters on the count,
  so a fork without one of these units gets three tiles rather than a dead
  square.

### Adding is something you do to a section

The Phrases page carries *Add a card*; there is no Add destination of its own
any more. Palabras and El pasado offer nothing to add, because in this fork they
are course content — unlike Xerra, where Vocab is decks you can file into and
therefore has an *Add a word*.
