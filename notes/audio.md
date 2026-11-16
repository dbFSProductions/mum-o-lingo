# Audio: Listen, the trim, playback levelling

Moved word for word out of `CLAUDE.md` at v29, when `app.js` was split into
modules. It is the history and the reasoning as written at the time: where it
says "in app.js" it now means one of the modules listed in `CLAUDE.md`. Add
new reasoning at the end.

---

### Listen has to say when nothing came out

Ported from Xerra (#51), where it was reported as *"we broke the listen button
everywhere"* — and the audio path turned out to be untouched. What was missing
was any way for the app to say so. Three silent failures, all of which look
identical to a dead button:

- **The browser voice takes an utterance and never says it.** iOS offers a
  Spanish voice, accepts `speak()`, returns nothing and throws nothing. So
  `browserSpeech.speak` now takes an `onSilent` callback and fires it when the
  utterance has neither started nor queued after 800ms, and both callers say
  so out loud. With an Azure key this path is never reached, which is why the
  message names that as the fix.
- **A database that will not open took the whole card off the screen.**
  `speech.isCached` is the first await in `loadPhrase` — before the drill has
  rendered anything — and it read IndexedDB unguarded, so a blocked version
  upgrade or evicted storage threw there and left an empty view. A question
  about whether to show a spinner must never be able to do that; unknown is
  now "no". `modelAudio`'s cache read was outside its try for the same reason
  and is now inside it: a cache you cannot read is a reason to synthesise, not
  to give up. Failing to *keep* the result costs the offline copy and nothing
  else.
- **Assigning a stale voice can throw**, which came out of the click handler as
  nothing at all. The default voice for the utterance's `lang` beats silence.

The drill has always printed *Using the browser voice…* when there is no Azure
key, and `speech.lastError` when Azure refuses. **Those two lines are the first
thing to read when playback is reported dead** — between them and the new toast,
every silent path now names itself.

`speech.js` is a straight copy of Xerra's fix; `app.js` differs only in taking
this fork's single course language. Keep all three in step.

## The trim, and why it has to be one detector

`speechBounds` finds where the speech is, and the picture, the sound and the
pacing note all ask it. That is the whole of the fix, and the history is why it
has to stay that way:

- **A fixed threshold silently stops working in a real room.** 0.015 RMS over
  256-sample frames is right in a quiet one. `autoGainControl` is off, so a fan
  or traffic puts the room itself over the line, the scan calls the first frame
  speech, and nothing is trimmed at all — indistinguishable from the feature
  having been reverted. Measured here, before the port: a 1.2 s lead-in of room
  noise at 0.02 RMS in front of 1.5 s of speech reported **3.3 s**, the whole
  untrimmed clip.
- **Which made the pacing note lie.** A 1.50 s take against a 1.40 s model
  measured **2.36×** and told Mum to "try running the words together more" —
  scolding her for the pause before she started talking. It now reads 1.05×,
  which is "nicely matched".
- **The room is read from the quietest frames (2nd percentile), not the quiet
  tenth.** A TTS clip is speech almost end to end, so its tenth percentile
  lands inside a syllable and sets the line above the dips between them, which
  shortens the *model's* measured length and inflates every ratio.
- **Both ways of being wrong must be "trim less".** The threshold is capped
  well under the voice (`voice * 0.35`) so a loud room can't drag `room * 3` up
  to the speech's own level and start eating syllables.
- **Three frames in a row at each end**, so a click or the stop button isn't
  the first word or the last one.
- **The tail is padded, not cut close.** `TAIL_PAD` (0.25 s) is what saves a
  final consonant, whose release sits under the line that found the word.
  "¿Cuántos?" heard as "¿cuánto?" is a different question. Playback trims the
  front only and leaves the tail alone entirely.
- **The duration is measured between the bounds, not across the padded
  window** — counting the pad would make every recording read a fifth slower
  than it is.

The fallback, for a clip the bounds can't judge (under eight frames, all room,
or all voice), is the old fixed-threshold scan, which is why a synthetic 150 Hz
tone still passes through untouched and still reads 150 Hz.

### One knock used to cancel the whole boost

`forPlayback` lifts a quiet recording to roughly TTS loudness so that You and
the model can be compared by ear. It very nearly didn't, and the way it failed
is worth knowing:

- **A 20 ms transient decided the gain for the whole clip.** The tap of a thumb
  reaching for stop, a knock on the table, a plosive into the mic — louder than
  anything Mum said. It set `peak`, so `0.98 / peak` pinned the gain at ~1.0,
  `gain > 1.1` came out false, and **no boost was applied at all**. It also sat
  inside the trimmed region, so it dragged the average level up and asked for
  less gain to begin with. Measured on a synthetic take needing 2.9× to reach
  TTS level: one click took it to 1.0×, and playback came out exactly as faint
  as it was recorded while the model played at full volume.
- **It is a cliff, not a slope**, which is why it reads as "playback seems to
  have got quieter" rather than as a bug: the same voice in the same room is
  boosted on the go with no knock in it and not on the go with one.
- **`voiceLevels` reads both numbers from the frames that are plausibly
  voice.** Anything over four times the 90th-percentile frame is a knock, not a
  word — twelve dB above a loud vowel is not something a person does
  mid-phrase — and it is left out of both the average and the peak.
- **What overshoots is soft-limited, not allowed to veto.** `softLimit` bends
  everything above a 0.7 knee towards a 0.98 ceiling with `tanh`, whose slope
  is 1 at zero, so the curve meets the straight part cleanly and nothing below
  the knee is touched. The rare transient saturates instead of clipping into a
  square-edged buzz. The limiter only runs when there is a boost to catch: a
  clip that is merely being trimmed comes through sample for sample.
- **Both halves self-level, and that is the point.** The model goes through
  `forPlayback` too, so recording and model are both normalised to
  `TARGET_RMS` and end up matching each other whatever that constant is. The
  bug was never the constant — it was one of the two being silently skipped.

#### And then the boost only ever went one way

Fixing the knock got the recording up to `TARGET_RMS` and it was *still* the
quieter of the two, because the bullet above was a description of the intent
rather than of the code: `boosting = gain > 1.1` meant a clip already above the
line was passed through at whatever level it arrived at. Only recordings are
ever below the line, so only recordings were ever touched, and the model went
out at Azure's loudness — which is not a constant: three synthetic TTS clips
came out 5.9 dB apart from each other, with the recording pinned below all
three.

- **Levelling is symmetric now**: `gain > 1.1 || gain < 0.9`, so a loud TTS
  clip is brought *down* to the line as well. That is what makes the constant
  not matter, which is what the bullet above always claimed. Only a boost runs
  through `softLimit` — turning a clip down can't clip.
- **`TARGET_RMS` is 0.16 rather than 0.12**, chosen so the model barely moves
  and the recording comes up to meet it, rather than the whole app getting
  quieter to meet the recording. `MAX_BOOST` is 12 rather than 8 so a genuinely
  faint take can still reach the new line; the boost only ever runs on quiet
  clips, and it lifts the room with the voice, which is the accepted cost of
  hearing yourself at all.
- **A plosive no longer holds the gain back, but only just.** The peak cap was
  `CEILING / headroom` — the same "one sample decides the phrase" shape as the
  knock, worth about a decibel on a take with a hard *p* in it. It is
  `CEILING * OVERSHOOT / headroom` now, and `OVERSHOOT` is **1.25 and not 2**:
  see the crest-factor note below for why that number and not a rounder one.
- **`voiceLevels` has a floor as well as a lid.** It averaged every frame below
  the knock line, pauses included — and a recording pauses while a TTS clip is
  speech end to end, so the same measurement meant two different things on the
  two halves. Frames under a fifth of the 90th-percentile frame are now out of
  the number too, so both are read over the words.

#### Crest factor is the variable, and a sine has none

This shipped as v18, was reported as having killed playback outright, was
reverted the same day, and went back in unchanged apart from `OVERSHOOT` when
the silence turned out to have been the phone's volume. Two things are worth
keeping out of that.

The first is that **the checks that passed it were built on summed sinusoids,
whose crest factor — peak over the level of the words — is about 1.6.** Speech
is 4 to 8, a TTS clip nearer 3, and crest is precisely what a peak cap is
about: the cap binds once the crest exceeds `CEILING * OVERSHOOT / TARGET_RMS`.
A sine clip is therefore the one signal that can never exercise the line being
moved. Anything touching the gain here wants a clip with a speech-like crest,
which means a glottal pulse train through a few formants, not a sum of sines —
and better still, a real exported recording and a real Azure clip, which is the
one thing none of these tests has ever had.

The second is the sweep that set `OVERSHOOT`, measured on clips built to a
given crest, reading the level the words come out at and how much of the clip
the limiter bends:

| crest | `OVERSHOOT` 1 | 1.25 | 1.5 | 2 |
|---|---|---|---|---|
| 4 | 0.160 | 0.160 | 0.160 | 0.160 |
| 6 | 0.160 | 0.160 | 0.160 | 0.160 |
| 8 | 0.143 | 0.167 | 0.167 | 0.167 |
| 12 | 0.093 | 0.116 | 0.138 | 0.166 |

Under 0.22% of samples are bent anywhere in that table, so 2 was not the
disaster it looked like when the app appeared to be dead — but 1.25 reaches the
line on everything speech-shaped and leaves the limiter catching transients
rather than reshaping vowels, so 1.25 is what shipped.

**Check this numerically, never by recording in a quiet room** — a quiet room
is the case the old scan already handled, which is exactly why the bug survived
so long. See *Running and checking*.
