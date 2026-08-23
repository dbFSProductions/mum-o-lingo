// Mum-o-lingo course content. Hand-written — this file IS the source of truth
// (like Mum-o-lingo, which this is a fork of: no Swift twin, no generator).
//
// The course is Castilian Spanish (es-ES) and it is built around one specific
// fortnight: Mum and Dad flying out at Christmas, a fish restaurant, a market
// counter, and cava — which is the only thing Mum drinks, so the wine unit is
// a cava unit. The focusNotes are written for a British English speaker, so
// they lean on British vowels ("cat", not "father") and on the habits that
// actually trip one up in Spain: the ce/ci/z 'th', b=v, the soft d, the tapped
// r, and the silent h.
//
// Shape: units → lessons → phrases. A lesson is five phrases — one cup of tea's
// worth. Phrase ids are stable and referenced by saved attempts, so never
// renumber existing ones; append instead.

export const COURSE_LANGUAGE = "es-ES";

export const COURSE = [
  {
    id: "saludos",
    title: "Saludos",
    subtitle: "Arriving, and meeting people",
    color: "#58cc02",
    colorDark: "#46a302",
    lessons: [
      {
        id: "saludos-1",
        title: "Good morning",
        phrases: [
          {
            id: "saludos-1-1",
            text: "Buenos días.",
            translation: "Good morning.",
            focusNote:
              "Pure vowels: BWE-nos DEE-as. Spanish vowels never slide the way English ones do — 'días' is two crisp syllables, not 'dee-uhz'.",
          },
          {
            id: "saludos-1-2",
            text: "Buenas tardes.",
            translation: "Good afternoon / evening.",
            focusNote:
              "The 'd' in 'tardes' is soft — tongue tip against the top teeth, closer to the 'th' in 'this' than to an English 'd'. Used from about 2pm until dark.",
          },
          {
            id: "saludos-1-3",
            text: "¿Cómo está?",
            translation: "How are you? (formal)",
            focusNote:
              "Stress lands hard on -TÁ. This is the polite 'usted' form — the right one for anyone behind a counter until they switch first.",
          },
          {
            id: "saludos-1-4",
            text: "Muy bien, gracias. ¿Y usted?",
            translation: "Very well, thanks. And you?",
            focusNote:
              "'Muy' is one syllable: mwee. And here's the Spain sound — 'gracias' is GRA-thyas, with the 'th' of 'think'. Say it and you sound like you're in Madrid, not Mexico.",
          },
          {
            id: "saludos-1-5",
            text: "¡Hasta luego!",
            translation: "See you later!",
            focusNote:
              "The h is completely silent: AS-ta LWE-go. Everyone says this, all day, to everyone — it's the standard goodbye, not a promise to return.",
          },
        ],
      },
      {
        id: "saludos-2",
        title: "Meeting people",
        phrases: [
          {
            id: "saludos-2-1",
            text: "Encantada.",
            translation: "Pleased to meet you.",
            focusNote:
              "The -a ending is because you're a woman saying it — Dad would say 'encantado'. Don't swallow the middle: en-can-TA-da, four even beats.",
          },
          {
            id: "saludos-2-2",
            text: "Me llamo Katrina.",
            translation: "My name's Katrina.",
            focusNote:
              "'ll' in Spain is a 'y' sound: me YA-mo. Your name survives intact in Spanish — ka-TREE-na, stress in the middle, and that r is a single quick tap rather than an English one.",
          },
          {
            id: "saludos-2-3",
            text: "Este es mi marido, John.",
            translation: "This is my husband, John.",
            focusNote:
              "The r in 'marido' is a single quick tap — like the middle of 'butter' said fast — and both d's are soft. Don't be startled when it comes back at you as 'Yon': a Spanish j is made in the throat, so his name is one they'll reach for carefully.",
          },
          {
            id: "saludos-2-4",
            text: "Somos de Inglaterra.",
            translation: "We're from England.",
            focusNote:
              "The double rr is the rolled one — hold it and let it buzz. A single r here would be a different sound; this is the one word in the phrase worth practising alone.",
          },
          {
            id: "saludos-2-5",
            text: "Estamos aquí por Navidad.",
            translation: "We're here for Christmas.",
            focusNote:
              "'aquí' is a-KEE — the qu is just a k, no 'w' sound. 'Navidad' ends on that soft d again, so light it almost disappears.",
          },
        ],
      },
      {
        id: "saludos-3",
        title: "Being polite",
        phrases: [
          {
            id: "saludos-3-1",
            text: "Por favor.",
            translation: "Please.",
            focusNote:
              "The v is a b — 'favor' is fa-BOR. Spanish makes no distinction between b and v at all, which feels wrong for weeks and then stops feeling like anything.",
          },
          {
            id: "saludos-3-2",
            text: "Muchas gracias.",
            translation: "Thank you very much.",
            focusNote:
              "'Muchas' has the ch of 'church', not a k. Then the 'th' again in gracias. Two words, both very common, both worth getting exactly right.",
          },
          {
            id: "saludos-3-3",
            text: "Lo siento, no hablo mucho español.",
            translation: "Sorry, I don't speak much Spanish.",
            focusNote:
              "Silent h again in 'hablo'. The ñ in 'español' is the 'ny' of 'onion'. This is the single most useful sentence in the app — it buys patience.",
          },
          {
            id: "saludos-3-4",
            text: "¿Puede repetir, por favor?",
            translation: "Could you say that again, please?",
            focusNote:
              "Two tapped r's in 'repetir', and the stress is on the last syllable: re-pe-TIR. Let your voice rise at the end — that's what makes it a question.",
          },
          {
            id: "saludos-3-5",
            text: "Más despacio, por favor.",
            translation: "Slower, please.",
            focusNote:
              "des-PA-thyo — that c before i is the 'th' sound. Better than asking someone to repeat at the same speed, which is the usual outcome.",
          },
        ],
      },
    ],
  },
  {
    id: "cava",
    title: "El cava",
    subtitle: "A glass, a toast, and a bottle of water",
    color: "#1cb0f6",
    colorDark: "#1899d6",
    lessons: [
      {
        id: "cava-1",
        title: "Ordering cava",
        phrases: [
          {
            id: "cava-1-1",
            text: "Una copa de cava, por favor.",
            translation: "A glass of cava, please.",
            focusNote:
              "'cava' is KA-ba — that v is a b, same as in 'favor'. A 'copa' is a stemmed glass; ask for a 'vaso' and you may get a tumbler.",
          },
          {
            id: "cava-1-2",
            text: "¿Qué cava tienen?",
            translation: "What cava do you have?",
            focusNote:
              "'Qué' is just KEH. 'tienen' is TYE-nen — the ie is one gliding syllable, not two. Stress on the first syllable, so the question doesn't sound like 'tienen?'.",
          },
          {
            id: "cava-1-3",
            text: "Bien frío, por favor.",
            translation: "Nice and cold, please.",
            focusNote:
              "'frío' has the accent on the i, which breaks it into two syllables: FREE-o. The r is a single tap straight after the f — the hardest little cluster in this lesson.",
          },
          {
            id: "cava-1-4",
            text: "Una botella para los dos.",
            translation: "A bottle for the two of us.",
            focusNote:
              "bo-TE-ya, with the 'y' sound for ll. Both o's stay round and short — Spanish has no 'oh-oo' glide at the end of a word.",
          },
          {
            id: "cava-1-5",
            text: "Yo solo bebo cava.",
            translation: "I only drink cava.",
            focusNote:
              "Both b's in 'bebo' are soft between vowels — lips barely touching, closer to a v made with both lips. Saying 'yo' at all is emphatic here, which is exactly what you want.",
          },
        ],
      },
      {
        id: "cava-2",
        title: "A toast",
        phrases: [
          {
            id: "cava-2-1",
            text: "¡Salud!",
            translation: "Cheers!",
            focusNote:
              "sa-LOO(d) — the final d is so soft it nearly vanishes, and in Spain most people let it. Glasses touch, eyes meet, then drink.",
          },
          {
            id: "cava-2-2",
            text: "¡Feliz Navidad!",
            translation: "Merry Christmas!",
            focusNote:
              "That final z is the 'th' sound: fe-LEETH. It's the giveaway between Spain and everywhere else, and this is the phrase you'll say most in December.",
          },
          {
            id: "cava-2-3",
            text: "Por la familia.",
            translation: "To the family.",
            focusNote:
              "fa-MI-lia — stress in the middle, and the -lia is one quick syllable. A short toast that always lands.",
          },
          {
            id: "cava-2-4",
            text: "Está muy bueno.",
            translation: "It's very good.",
            focusNote:
              "'bueno' starts BWE-, one syllable. 'Está' for how something tastes right now — 'es bueno' would be a claim about cava in general.",
          },
          {
            id: "cava-2-5",
            text: "Otra copa, por favor.",
            translation: "Another glass, please.",
            focusNote:
              "'Otra' — no 'an' needed, the word already means 'another'. Single tapped r, and keep the first o short: O-tra.",
          },
        ],
      },
      {
        id: "cava-3",
        title: "Wine, water and the bill",
        phrases: [
          {
            id: "cava-3-1",
            text: "Una botella de agua, sin gas.",
            translation: "A bottle of still water.",
            focusNote:
              "'agua' is A-gwa. 'Sin gas' is how you ask for still — say nothing and you may well get sparkling.",
          },
          {
            id: "cava-3-6",
            text: "Para John, una copa de vino tinto.",
            translation: "A glass of red wine for John.",
            focusNote:
              "BEE-no TEEN-to — v as b again, and 'tinto' is the word for red wine; ask for 'vino rojo' and you'll get a puzzled look. House red by the glass is 'un tinto de la casa'.",
          },
          {
            id: "cava-3-2",
            text: "Para mi marido, una cerveza.",
            translation: "A beer for my husband.",
            focusNote:
              "ther-BE-tha — both the c and the z are 'th' in Spain, so this one word has it twice. Worth saying slowly a few times.",
          },
          {
            id: "cava-3-3",
            text: "Yo no, gracias.",
            translation: "Not for me, thanks.",
            focusNote:
              "Short and complete. The 'yo' does the work of 'for me' — you don't need anything longer to turn something down.",
          },
          {
            id: "cava-3-4",
            text: "Ya está, gracias.",
            translation: "That's us, thanks.",
            focusNote:
              "ya es-TÁ — stress on the last syllable. It means 'that's it, we're done', and it's what you say when someone offers a top-up you don't want.",
          },
          {
            id: "cava-3-5",
            text: "¿Me cobra, por favor?",
            translation: "Could I settle up, please?",
            focusNote:
              "KO-bra, tapped r. More natural in a bar than asking for 'la cuenta' — you're asking the person to charge you rather than fetch a piece of paper.",
          },
        ],
      },
    ],
  },
  {
    id: "restaurante",
    title: "El restaurante",
    subtitle: "A fish supper, ordered properly",
    color: "#ff9600",
    colorDark: "#e08600",
    lessons: [
      {
        id: "restaurante-1",
        title: "Getting a table",
        phrases: [
          {
            id: "restaurante-1-1",
            text: "Una mesa para dos, por favor.",
            translation: "A table for two, please.",
            focusNote:
              "MEH-sa — the e is the 'e' of 'bed', short and open. The whole phrase is one calm line; no need to raise your voice at the end.",
          },
          {
            id: "restaurante-1-2",
            text: "Tenemos una reserva.",
            translation: "We have a booking.",
            focusNote:
              "re-SER-ba — v as b again. 'Tenemos' is 'we have'; the -emos ending is the one that means 'we', and it turns up everywhere this fortnight.",
          },
          {
            id: "restaurante-1-3",
            text: "¿Hay que esperar?",
            translation: "Is there a wait?",
            focusNote:
              "'Hay' is just 'eye' — silent h. es-pe-RAR ends on a tapped r with the stress on it, which is where English speakers usually trail off.",
          },
          {
            id: "restaurante-1-4",
            text: "¿Podemos sentarnos fuera?",
            translation: "Can we sit outside?",
            focusNote:
              "FWE-ra, one syllable then a tap. Spanish stacks the 'ourselves' onto the end of the verb — 'sentarnos' is one word, said as one word.",
          },
          {
            id: "restaurante-1-5",
            text: "La carta, por favor.",
            translation: "The menu, please.",
            focusNote:
              "'Carta' is the menu; 'menú' usually means the set lunch. Tapped r, and keep the first a bright and short.",
          },
        ],
      },
      {
        id: "restaurante-2",
        title: "Ordering fish",
        phrases: [
          {
            id: "restaurante-2-1",
            text: "¿Cuál es el pescado del día?",
            translation: "What's the fish of the day?",
            focusNote:
              "KWAL, one syllable. pes-KA-do with a soft d. This is the question that gets you the good answer in any fish restaurant.",
          },
          {
            id: "restaurante-2-2",
            text: "¿Está fresco el pescado?",
            translation: "Is the fish fresh?",
            focusNote:
              "FRES-ko — that fr cluster with a tapped r again. Nobody minds being asked; in a proper fish place they rather enjoy it.",
          },
          {
            id: "restaurante-2-3",
            text: "Para mí, la lubina.",
            translation: "I'll have the sea bass.",
            focusNote:
              "loo-BEE-na, with the b soft between vowels. 'Para mí' with the accent — that written accent is what makes it 'me' rather than 'my'.",
          },
          {
            id: "restaurante-2-4",
            text: "A la plancha, por favor.",
            translation: "Grilled, please.",
            focusNote:
              "PLAN-cha, ch as in 'church'. It means cooked on a hot flat griddle, and it's how you want most Spanish fish.",
          },
          {
            id: "restaurante-2-5",
            text: "¿Lleva muchas espinas?",
            translation: "Does it have a lot of bones?",
            focusNote:
              "YEH-ba — ll as 'y', v as b, both rules in one small word. 'Espinas' are fish bones specifically; 'huesos' are the ones in meat.",
          },
        ],
      },
      {
        id: "restaurante-3",
        title: "Finishing up",
        phrases: [
          {
            id: "restaurante-3-1",
            text: "Está buenísimo.",
            translation: "It's absolutely delicious.",
            focusNote:
              "bwe-NEE-si-mo — the -ísimo ending is a proper compliment, much warmer than 'bueno'. Land the stress on the NEE and let the rest run.",
          },
          {
            id: "restaurante-3-2",
            text: "¿Nos trae más pan?",
            translation: "Could you bring us more bread?",
            focusNote:
              "TRA-e is two syllables. The tr is a tapped r straight after the t — English 'tr' is one sound, Spanish is two, and that's the whole difference.",
          },
          {
            id: "restaurante-3-3",
            text: "Nada de postre, gracias.",
            translation: "No dessert, thanks.",
            focusNote:
              "NA-da with a very soft middle d. 'Postre' ends in that tr cluster again — POS-tre, not 'poster'.",
          },
          {
            id: "restaurante-3-4",
            text: "La cuenta, por favor.",
            translation: "The bill, please.",
            focusNote:
              "KWEN-ta, one gliding first syllable. In a sit-down restaurant this is the phrase; in a bar, '¿me cobra?' from the cava unit is more natural.",
          },
          {
            id: "restaurante-3-5",
            text: "Todo estaba estupendo.",
            translation: "It was all wonderful.",
            focusNote:
              "es-tu-PEN-do. 'Estaba' is the past — you're telling them the meal was lovely on the way out, which is exactly when to say it.",
          },
        ],
      },
    ],
  },
  {
    id: "mercado",
    title: "El mercado",
    subtitle: "Fish, cheese, ham and chicken",
    color: "#ce82ff",
    colorDark: "#a568cc",
    lessons: [
      {
        id: "mercado-1",
        title: "The fish counter",
        phrases: [
          {
            id: "mercado-1-1",
            text: "¿Qué pescado tiene hoy?",
            translation: "What fish have you got today?",
            focusNote:
              "'hoy' is 'oy' — silent h once more. Opening with a question rather than an order is what gets you the fishmonger's opinion.",
          },
          {
            id: "mercado-1-2",
            text: "Medio kilo de gambas, por favor.",
            translation: "Half a kilo of prawns, please.",
            focusNote:
              "ME-dyo, two syllables. 'Gambas' has a hard g. Spain buys by the kilo, so 'medio kilo' is the everyday amount.",
          },
          {
            id: "mercado-1-3",
            text: "¿Me lo limpia, por favor?",
            translation: "Could you clean it for me, please?",
            focusNote:
              "LIM-pya. This is the ask that saves you the whole job at home — gutted, scaled, and filleted if you want it.",
          },
          {
            id: "mercado-1-4",
            text: "Esas dos, las de ahí.",
            translation: "Those two, the ones there.",
            focusNote:
              "'ahí' is a-EE — silent h in the middle, stress on the i. Pointing is completely acceptable and this is the sentence that goes with the finger.",
          },
          {
            id: "mercado-1-5",
            text: "¿A cuánto está el bacalao?",
            translation: "How much is the cod?",
            focusNote:
              "ba-ka-LA-o — four syllables, and the last two are separate vowels, not a diphthong. 'A cuánto está' is the market way of asking a price by weight.",
          },
        ],
      },
      {
        id: "mercado-2",
        title: "Cheese and ham",
        phrases: [
          {
            id: "mercado-2-1",
            text: "Cien gramos de queso manchego.",
            translation: "A hundred grams of Manchego.",
            focusNote:
              "'Cien' is THYEN — c before i, so the 'th'. 'Queso' is KE-so, the qu just a k. A hundred grams is a normal, unembarrassing amount to ask for.",
          },
          {
            id: "mercado-2-2",
            text: "¿Me da un poco para probar?",
            translation: "Could I try a little?",
            focusNote:
              "pro-BAR — tapped r twice, stress on the end. Expected behaviour at a cheese counter, not cheek.",
          },
          {
            id: "mercado-2-3",
            text: "Jamón serrano, cortado fino.",
            translation: "Serrano ham, sliced thin.",
            focusNote:
              "The j is a throaty h, from the back — ha-MON, harder than English 'h'. Then the rolled rr in 'serrano'. Two of the hardest Spanish sounds in one order.",
          },
          {
            id: "mercado-2-4",
            text: "Un poco más, por favor.",
            translation: "A little more, please.",
            focusNote:
              "MAS with the accent — say it firmly. This is what you use while they're still slicing, so it needs to arrive quickly.",
          },
          {
            id: "mercado-2-5",
            text: "Así está bien.",
            translation: "That's just right.",
            focusNote:
              "a-SEE es-TA byen. The counterpart to the last one — it's what stops the slicing. Learn the pair together.",
          },
        ],
      },
      {
        id: "mercado-3",
        title: "Chicken, and paying",
        phrases: [
          {
            id: "mercado-3-1",
            text: "Un pollo entero, por favor.",
            translation: "A whole chicken, please.",
            focusNote:
              "PO-yo — ll as 'y' again, and nothing like the English 'pollo' you may have heard. 'Entero' has a single tapped r.",
          },
          {
            id: "mercado-3-2",
            text: "¿Me lo corta en trozos?",
            translation: "Could you cut it into pieces?",
            focusNote:
              "TRO-thos — tr as two sounds, and z as 'th'. The butcher will do it in about four seconds and it's free.",
          },
          {
            id: "mercado-3-3",
            text: "No, nada más, gracias.",
            translation: "No, that's everything, thanks.",
            focusNote:
              "The answer to '¿algo más?', which is what they'll ask you. Having the reply ready is the difference between a transaction and a stall.",
          },
          {
            id: "mercado-3-4",
            text: "¿Cuánto es todo?",
            translation: "How much is that altogether?",
            focusNote:
              "KWAN-to es TO-do, with that soft d in the middle of 'todo'. Short, and it works at every stall in the building.",
          },
          {
            id: "mercado-3-5",
            text: "¿Puedo pagar con tarjeta?",
            translation: "Can I pay by card?",
            focusNote:
              "tar-HE-ta — the j is the throaty h again. Worth asking at a market: plenty of stalls are cash only, and the answer is quick.",
          },
        ],
      },
    ],
  },
  {
    id: "navidad",
    title: "La Navidad",
    subtitle: "Arriving with Dad, for Christmas",
    color: "#ff4b4b",
    colorDark: "#e04343",
    lessons: [
      {
        id: "navidad-1",
        title: "Just landed",
        phrases: [
          {
            id: "navidad-1-1",
            text: "Venimos de Inglaterra.",
            translation: "We've come from England.",
            focusNote:
              "be-NEE-mos — v as b, and that -imos ending is 'we' again. The rolled rr in 'Inglaterra' is the one to lean into.",
          },
          {
            id: "navidad-1-2",
            text: "Estamos aquí dos semanas.",
            translation: "We're here for two weeks.",
            focusNote:
              "No word for 'for' — Spanish just states the length. se-MA-nas, stress in the middle.",
          },
          {
            id: "navidad-1-3",
            text: "Venimos a ver a nuestro hijo.",
            translation: "We've come to see our son.",
            focusNote:
              "'hijo' is EE-ho — silent h at the front, throaty j in the middle. 'Nuestro' is NWES-tro, one gliding first syllable then a tap.",
          },
          {
            id: "navidad-1-4",
            text: "¿Dónde está la parada de taxis?",
            translation: "Where's the taxi rank?",
            focusNote:
              "DON-de es-TA — the question word takes the accent. 'Parada' is a stopping place, used for buses and taxis alike.",
          },
          {
            id: "navidad-1-5",
            text: "Estoy un poco cansada.",
            translation: "I'm a bit tired.",
            focusNote:
              "-ada because you're a woman saying it; Dad would say 'cansado'. 'Estoy' not 'soy' — it's how you are now, not what you're like.",
          },
        ],
      },
      {
        id: "navidad-2",
        title: "Christmas greetings",
        phrases: [
          {
            id: "navidad-2-1",
            text: "¡Feliz Navidad y feliz año nuevo!",
            translation: "Merry Christmas and happy new year!",
            focusNote:
              "'año' is A-nyo — with a plain n it's a very different and much ruder word, so the ñ genuinely matters here.",
          },
          {
            id: "navidad-2-2",
            text: "Felices fiestas.",
            translation: "Season's greetings.",
            focusNote:
              "fe-LEE-thes — the c before e is the 'th'. Useful for anyone whose Christmas you can't assume: shopkeepers, neighbours, the postman.",
          },
          {
            id: "navidad-2-3",
            text: "Es nuestra primera Navidad aquí.",
            translation: "It's our first Christmas here.",
            focusNote:
              "pri-ME-ra, tapped r's front and middle. Say this and people will tell you what happens next — it's an invitation to be looked after.",
          },
          {
            id: "navidad-2-4",
            text: "¿Qué se come aquí en Nochebuena?",
            translation: "What do people eat here on Christmas Eve?",
            focusNote:
              "no-che-BWE-na, ch as in 'church'. Christmas Eve dinner is the big one in Spain, rather than Christmas Day lunch.",
          },
          {
            id: "navidad-2-5",
            text: "Un regalito para ti.",
            translation: "A little something for you.",
            focusNote:
              "re-ga-LEE-to — the -ito ending makes it small and affectionate, and takes the weight out of handing something over.",
          },
        ],
      },
      {
        id: "navidad-3",
        title: "At the table",
        phrases: [
          {
            id: "navidad-3-1",
            text: "¿Nos sentamos?",
            translation: "Shall we sit down?",
            focusNote:
              "sen-TA-mos. Spanish uses the plain present for a suggestion — no extra word for 'shall', just the rise at the end.",
          },
          {
            id: "navidad-3-2",
            text: "¿Me pasas el pan, por favor?",
            translation: "Could you pass the bread, please?",
            focusNote:
              "'Pasas' is the informal 'you' — right for family and for the table, where 'usted' would sound stiff.",
          },
          {
            id: "navidad-3-3",
            text: "Está todo riquísimo.",
            translation: "It's all absolutely delicious.",
            focusNote:
              "rri-KEE-si-mo — starts on the rolled r even though it's written single, because it's the first letter. The best thing to say to whoever cooked.",
          },
          {
            id: "navidad-3-4",
            text: "No puedo más, de verdad.",
            translation: "I couldn't manage another thing, honestly.",
            focusNote:
              "ber-DAD — v as b, tapped r, and a final d soft to the point of vanishing. You will need this one, repeatedly.",
          },
          {
            id: "navidad-3-5",
            text: "Gracias por todo.",
            translation: "Thank you for everything.",
            focusNote:
              "The 'th' in gracias one last time. Three words, and the right ones for the end of any evening you've been fed at.",
          },
        ],
      },
    ],
  },
];

// Flat lookups, built once.
export const LESSONS = COURSE.flatMap((unit) =>
  unit.lessons.map((lesson) => ({ ...lesson, unit }))
);

export const COURSE_PHRASES = LESSONS.flatMap((lesson) =>
  lesson.phrases.map((p) => ({ ...p, language: COURSE_LANGUAGE, lessonId: lesson.id }))
);

export function lessonById(id) {
  return LESSONS.find((l) => l.id === id) ?? null;
}
