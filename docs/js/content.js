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
  /* El pasado — the shape of a past sentence, before its words.
   *
   * Ported from Deb-o-lingo, which took the mechanism from Xerra. The three
   * shapes and the teaching order are hers; the sentences are not. Hers are
   * written from a life lived in Spain — a job in Chicago, a flat, a week that
   * repeats. Mum's are the trip: coming over from England with Dad, the son
   * they came to see, the market, the fish, the cava, Christmas. Porting the
   * sentences across would have handed her somebody else's past to talk about,
   * which is the one thing these lessons can't afford — you cannot practise
   * saying what happened to you in words about what happened to somebody else.
   *
   * Four lessons, five cards each, and the order is the argument: the line on
   * its own, then the dot on its own, then the one that catches everybody out
   * (today against yesterday), then all three mixed. Each single-shape lesson
   * carries one card of another shape on purpose — a lesson whose name answers
   * its own question trains the lesson, not the grammar.
   *
   * `marked` puts the ending, or the auxiliary pair, in [brackets] so the drill
   * can light it up on the verb itself. It must reduce to `text` exactly. */
  {
    id: "pasado",
    title: "El pasado",
    subtitle: "Dot in a box, line — or reaching now?",
    color: "#ff4b4b",
    colorDark: "#d63d3d",
    lessons: [
      {
        id: "pasado-1",
        title: "The line \u00b7 -aba / -\u00eda",
        phrases: [
          {
            id: "pasado-1-1",
            text: "Trabajaba en una escuela.",
            marked: "Trabaj[aba] en una escuela.",
            infinitive: "trabajar \u2014 to work",
            translation: "I used to work in a school.",
            focusNote:
              "tra-ba-HA-ba, stress on the -HA-. That -aba tail is the sound of the line \u2014 you'll hear it all lesson.",
            aspect: "line",
            aspectNote:
              "No date, no edges \u2014 the -aba on its own says 'used to'. That is the line.",
          },
          {
            id: "pasado-1-2",
            text: "Ven\u00edamos cada verano.",
            marked: "Ven[\u00edamos] cada verano.",
            infinitive: "venir \u2014 to come",
            translation: "We used to come every summer.",
            focusNote:
              "be-N\u00cd-a-mos \u2014 stress on the \u00cd. The v is soft, nearly a b.",
            aspect: "line",
            aspectNote:
              "'Every summer' is a habit with no end put on it. -\u00edamos is the line in the 'we' form.",
          },
          {
            id: "pasado-1-3",
            text: "Mi hijo viv\u00eda en Madrid.",
            marked: "Mi hijo viv[\u00eda] en Madrid.",
            infinitive: "vivir \u2014 to live",
            translation: "My son lived in Madrid.",
            focusNote: "bi-B\u00cd-a \u2014 stress on the \u00cd. Both v's are soft.",
            aspect: "line",
            aspectNote:
              "A stretch of his life with no edges named. Say the year he moved and it would be a dot.",
          },
          {
            id: "pasado-1-4",
            text: "Hac\u00eda mucho fr\u00edo.",
            marked: "Hac[\u00eda] mucho fr\u00edo.",
            infinitive: "hacer \u2014 to do, to make",
            translation: "It was very cold.",
            focusNote: "a-S\u00cd-a \u2014 the h is silent, so it starts on the a.",
            aspect: "line",
            aspectNote:
              "Weather is background, not an event \u2014 the line. Spanish does the weather with hacer.",
          },
          {
            id: "pasado-1-5",
            text: "Ayer compr\u00e9 pescado.",
            marked: "Ayer compr[\u00e9] pescado.",
            infinitive: "comprar \u2014 to buy",
            translation: "Yesterday I bought fish.",
            focusNote:
              "com-PR\u00c9 \u2014 stress right at the end. That final -\u00e9 is the dot, not the line.",
            aspect: "dot",
            aspectNote:
              "The odd one out on purpose. 'Ayer' shuts a box round it, and the ending goes to -\u00e9.",
          },
        ],
      },
      {
        id: "pasado-2",
        title: "The dot in a box \u00b7 -\u00e9 / -\u00f3",
        phrases: [
          {
            id: "pasado-2-1",
            text: "Llegamos el martes.",
            marked: "Lleg[amos] el martes.",
            infinitive: "llegar \u2014 to arrive",
            translation: "We arrived on Tuesday.",
            focusNote: "ye-GA-mos \u2014 the ll is a y. Stress on the GA.",
            aspect: "dot",
            aspectNote:
              "A named day is a shut box, and arriving happens once. A dot.",
          },
          {
            id: "pasado-2-2",
            text: "Anoche cenamos fuera.",
            marked: "Anoche cen[amos] fuera.",
            infinitive: "cenar \u2014 to have dinner",
            translation: "Last night we ate out.",
            focusNote: "se-NA-mos \u2014 stress on the NA. Anoche is a-NO-che.",
            aspect: "dot",
            aspectNote:
              "Last night is finished and has edges. One dinner, one dot.",
          },
          {
            id: "pasado-2-3",
            text: "Mi hijo naci\u00f3 en marzo.",
            marked: "Mi hijo nac[i\u00f3] en marzo.",
            infinitive: "nacer \u2014 to be born",
            translation: "My son was born in March.",
            focusNote: "na-SI\u00d3 \u2014 stress on the very last syllable.",
            aspect: "dot",
            aspectNote:
              "A single moment with a month round it \u2014 nobody is born for a while. -i\u00f3 is the dot in the he/she form.",
          },
          {
            id: "pasado-2-4",
            text: "Fuimos al mercado.",
            marked: "[Fuimos] al mercado.",
            infinitive: "ir \u2014 to go",
            translation: "We went to the market.",
            focusNote: "FUI-mos \u2014 one push, on the FUI.",
            aspect: "dot",
            aspectNote:
              "ir escapes the endings in the dot as well: fuimos. One trip, finished.",
          },
          {
            id: "pasado-2-5",
            text: "\u00c9ramos muy j\u00f3venes.",
            marked: "[\u00c9ramos] muy j\u00f3venes.",
            infinitive: "ser \u2014 to be",
            translation: "We were very young.",
            focusNote:
              "\u00c9-ra-mos \u2014 stress right at the front. The j in j\u00f3venes is the throaty one.",
            aspect: "line",
            aspectNote:
              "The odd one out. ser is the verb that is the line without -aba or -\u00eda \u2014 and being young is a stretch, not a moment.",
          },
        ],
      },
      {
        id: "pasado-3",
        title: "Reaching now \u00b7 he + -ado / -ido",
        phrases: [
          {
            id: "pasado-3-1",
            text: "Hoy he comido pescado.",
            marked: "Hoy [he] com[ido] pescado.",
            infinitive: "comer \u2014 to eat",
            translation: "Today I've eaten fish.",
            focusNote: "e co-MI-do \u2014 the h is silent, so it is just 'e'.",
            aspect: "presentPerfect",
            aspectNote:
              "'Hoy' still has now inside it, so Spain says he comido. Swap in 'ayer' and it becomes com\u00ed.",
          },
          {
            id: "pasado-3-2",
            text: "Ayer com\u00ed pescado.",
            marked: "Ayer com[\u00ed] pescado.",
            infinitive: "comer \u2014 to eat",
            translation: "Yesterday I ate fish.",
            focusNote: "co-M\u00cd \u2014 stress at the very end.",
            aspect: "dot",
            aspectNote:
              "The same meal, one word different. 'Ayer' shuts the box, so the shape changes with it.",
          },
          {
            id: "pasado-3-3",
            text: "Esta ma\u00f1ana hemos ido al mercado.",
            marked: "Esta ma\u00f1ana [hemos] [ido] al mercado.",
            infinitive: "ir \u2014 to go",
            translation: "This morning we've been to the market.",
            focusNote: "E-mos I-do \u2014 both h's silent. Ma\u00f1ana is ma-NYA-na.",
            aspect: "presentPerfect",
            aspectNote:
              "This morning is part of today, and today is not shut yet.",
          },
          {
            id: "pasado-3-4",
            text: "Todav\u00eda no he visto a mi hijo.",
            marked: "Todav\u00eda no [he] [visto] a mi hijo.",
            infinitive: "ver \u2014 to see",
            translation: "I haven't seen my son yet.",
            focusNote:
              "to-da-B\u00cd-a no e BIS-to \u2014 visto is irregular, not 've\u00eddo'.",
            aspect: "presentPerfect",
            aspectNote:
              "'Todav\u00eda' says the stretch is still open \u2014 still now, still waiting.",
          },
          {
            id: "pasado-3-5",
            text: "Esta semana hemos bebido mucho cava.",
            marked: "Esta semana [hemos] beb[ido] mucho cava.",
            infinitive: "beber \u2014 to drink",
            translation: "This week we've drunk a lot of cava.",
            focusNote: "E-mos be-BI-do \u2014 stress on the BI.",
            aspect: "presentPerfect",
            aspectNote:
              "This week has now in it, so the stretch reaches the present.",
          },
        ],
      },
      {
        id: "pasado-4",
        title: "All three \u00b7 tiny ones",
        phrases: [
          {
            id: "pasado-4-1",
            text: "Antes no me gustaba el pescado.",
            marked: "Antes no me gust[aba] el pescado.",
            infinitive: "gustar \u2014 to please, to be liked",
            translation: "I didn't use to like fish.",
            focusNote: "goos-TA-ba \u2014 stress on the TA.",
            aspect: "line",
            aspectNote:
              "'Antes' plus -aba is 'used to'. A state with no edges \u2014 the line.",
          },
          {
            id: "pasado-4-2",
            text: "Hoy he hablado con mi hijo.",
            marked: "Hoy [he] habl[ado] con mi hijo.",
            infinitive: "hablar \u2014 to speak",
            translation: "Today I've spoken to my son.",
            focusNote: "e a-BLA-do \u2014 both h's silent, stress on the BLA.",
            aspect: "presentPerfect",
            aspectNote: "Today is not over, so the stretch still reaches now.",
          },
          {
            id: "pasado-4-3",
            text: "El a\u00f1o pasado vinimos en diciembre.",
            marked: "El a\u00f1o pasado vin[imos] en diciembre.",
            infinitive: "venir \u2014 to come",
            translation: "Last year we came in December.",
            focusNote: "bi-NI-mos \u2014 stress on the NI. A\u00f1o is A-nyo.",
            aspect: "dot",
            aspectNote:
              "Last year is shut and December names the moment inside it. A dot \u2014 against ven\u00edamos, which was the habit.",
          },
          {
            id: "pasado-4-4",
            text: "Siempre \u00edbamos a la playa.",
            marked: "Siempre [\u00edbamos] a la playa.",
            infinitive: "ir \u2014 to go",
            translation: "We always used to go to the beach.",
            focusNote: "\u00cd-ba-mos \u2014 stress right at the front.",
            aspect: "line",
            aspectNote:
              "ir is the other verb that dodges both endings in the line: \u00edbamos. 'Siempre' makes it a habit.",
          },
          {
            id: "pasado-4-5",
            text: "Estuvimos aqu\u00ed dos semanas.",
            marked: "[Estuvimos] aqu\u00ed dos semanas.",
            infinitive: "estar \u2014 to be",
            translation: "We were here for two weeks.",
            focusNote: "es-tu-BI-mos \u2014 stress on the BI.",
            aspect: "dot",
            aspectNote:
              "The one everybody gets wrong. 'Two weeks' sounds long, but it has both ends shut \u2014 length never decides it, edges do.",
          },
        ],
      },
    ],
  },
  /* Palabras — vocabulary by the keyword-picture method.
   *
   * Every other unit teaches a phrase you say. This one teaches single words,
   * and it teaches them the way people who are good at this actually do it:
   * you hear an English sound inside the Spanish word, and you build one
   * ridiculous picture out of that sound and the meaning. `tenedor` sounds
   * like "ten-a-door", so a ten-pound note is pinned to a door with a fork,
   * and the word is never a coin-flip again.
   *
   * Two fields carry it. `sounds` is the bridge — what the word sounds like in
   * English, and nothing else. `picture` is the scene, and it has exactly one
   * job: to contain BOTH the sound and the meaning, so that recalling the
   * picture hands back the word. A picture with the sound in it but not the
   * meaning ("a ten-pound note on a door") is useless; so is a pretty one
   * with neither.
   *
   * Rules for writing more of these:
   *   - Strange beats sensible. The scene should be impossible, or violent, or
   *     rude, or all three. A plausible picture is forgotten by Thursday.
   *   - The sound bridge has to be a sound she already owns in English. Don't
   *     bridge to another Spanish word.
   *   - Never bridge to a sound the word doesn't have. `llave` is not "lava",
   *     however good the picture would be — the mnemonic would teach the
   *     wrong mouth, and a mnemonic that teaches a mispronunciation is worse
   *     than no mnemonic at all. The focusNote still does the real
   *     pronunciation work; the picture only has to get her to the word.
   *   - One picture per word, one sentence long. It's a hook, not a story.
   *
   * The nouns carry their article in `text` — "el tenedor", not "tenedor" —
   * because a noun learnt without its gender has to be learnt twice.
   *
   * Deb-o-lingo has this unit too, and its pictures are deliberately not these
   * ones: hers are dollars and her own week, these are pounds and the trip. */
  {
    id: "palabras",
    title: "Palabras",
    subtitle: "Everyday words, each with a silly picture to hang it on",
    color: "var(--purple)",
    colorDark: "var(--purple-dark)",
    lessons: [
      /* The ids are not in lesson order, and that is on purpose: these lessons
         were re-cut after a cull and the cards kept the ids they were born
         with. Ids are referenced by saved attempts and are never renumbered —
         which lesson a card sits in is free to change, its id is not. */
      {
        id: "palabras-1",
        title: "At the table",
        phrases: [
          {
            id: "palabras-1-1",
            text: "el tenedor",
            translation: "the fork",
            sounds: "ten-a-door",
            picture:
              "A ten-pound note pinned to the front door — and the pin is a fork.",
            focusNote:
              "te-ne-DOR, stress right at the end. Soft d, and the final r is one light tap.",
          },
          {
            id: "palabras-1-2",
            text: "el hielo",
            translation: "the ice",
            sounds: "YELLOW",
            picture:
              "Yellow ice cubes bobbing in your glass of cava. Nobody will say where they came from.",
            focusNote:
              "YE-lo — the h is silent, always, and 'hie' runs together into 'ye'. Never 'hi-elo'.",
          },
          {
            id: "palabras-1-3",
            text: "la copa",
            translation: "the (wine) glass",
            sounds: "COPPER",
            picture:
              "Your cava is served in a copper cup gone green round the rim, and it tastes of pennies.",
            focusNote:
              "KO-pa, two pure short vowels. This is the glass you ask for cava in — 'una copa de cava'.",
          },
          {
            id: "palabras-1-5",
            text: "la cuenta",
            translation: "the bill",
            sounds: "COUNTER",
            picture:
              "The waiter counts your bill out on an enormous wooden abacus at the counter, bead by bead.",
            focusNote:
              "KWEN-ta — 'cue' is one syllable, kwen. Same root as 'count', which is exactly what it is.",
          },
          {
            id: "palabras-3-2",
            text: "el jamón",
            translation: "the ham",
            sounds: "ha! MOAN",
            picture:
              "The whole leg of ham on the counter moans out loud every time the knife goes in, and the man laughs.",
            focusNote:
              "ha-MON, and that j is the throat-clearing one — like the ch in Scottish 'loch'. Stress the MON.",
          },
        ],
      },
      {
        id: "palabras-2",
        title: "The trip",
        phrases: [
          {
            id: "palabras-10-1",
            text: "el avión",
            translation: "the plane",
            sounds: "a BEE ON",
            picture:
              "A bee on the wing of the plane, hanging on grimly the whole way from Gatwick.",
            focusNote:
              "a-BYON — the v is a b, and 'ió' is one syllable. Stress at the end, where the accent is.",
          },
          {
            id: "palabras-10-2",
            text: "la maleta",
            translation: "the suitcase",
            sounds: "MALLET-a",
            picture:
              "You shut the suitcase with a mallet, and the presents inside make a noise you decide to ignore.",
            focusNote:
              "ma-LE-ta, three syllables, stress in the middle.",
          },
          {
            id: "palabras-4-1",
            text: "el regalo",
            translation: "the present",
            sounds: "REGAL",
            picture:
              "A present so regal — gold paper, velvet ribbon — that nobody dares open it, and it sits there all fortnight.",
            focusNote:
              "re-GA-lo, tapped r at the start, stress on GA.",
          },
          {
            id: "palabras-3-4",
            text: "la bolsa",
            translation: "the bag",
            sounds: "BOLSTER",
            picture:
              "You bolster the shopping bag with a sofa cushion so the eggs survive the walk back.",
            focusNote:
              "BOL-sa. Short pure o — no English 'boh-oo' slide. They will ask if you want one.",
          },
          {
            id: "palabras-10-4",
            text: "el paseo",
            translation: "the stroll",
            sounds: "PASS 'ay-oh'",
            picture:
              "On the evening stroll you pass every single person you know, and say 'ay-oh' to each one of them.",
            focusNote:
              "pa-SE-o, three syllables, stress on SE. The evening stroll is a real institution — join in.",
          },
        ],
      },
      {
        id: "palabras-3",
        title: "Words you need every hour",
        phrases: [
          {
            id: "palabras-6-1",
            text: "tener",
            translation: "to have",
            sounds: "a TENNER",
            picture:
              "All you have to your name is one tenner, and you keep patting your pocket to check it is still there.",
            focusNote:
              "te-NER, stress at the end — not like 'tenner', which lands at the front. Tapped r. 'Tengo' is I have.",
          },
          {
            id: "palabras-6-2",
            text: "querer",
            translation: "to want, to love",
            sounds: "care — RARE",
            picture:
              "You want your steak so rare that you care about nothing else, and you say so twice, loudly.",
            focusNote:
              "ke-RER — 'qu' is a plain k, the u is silent, and both r's are single taps. 'Quiero' is I want.",
          },
          {
            id: "palabras-6-4",
            text: "ir",
            translation: "to go",
            sounds: "EAR",
            picture:
              "You go everywhere led by your own ear, dragged along by it like a boy out of a sweet shop.",
            focusNote:
              "One syllable, 'eer'. Two letters, and the most irregular verb in the language — 'voy' is I go.",
          },
          {
            id: "palabras-6-5",
            text: "saber",
            translation: "to know (a fact)",
            sounds: "SABRE",
            picture:
              "You know the answer because there is a sabre held at your throat until you say it out loud.",
            focusNote:
              "sa-BER, tapped r. 'Sé' is I know — one syllable, and nothing like the infinitive.",
          },
          {
            id: "palabras-5-3",
            text: "ahora",
            translation: "now",
            sounds: "an HOUR",
            picture:
              "You ask when, they say 'an hour', and you shout back that you meant NOW. It sounds like 'an hour' and means the opposite.",
            focusNote:
              "a-O-ra. The h is silent, so it is three vowels and a tapped r — ah-OH-ra.",
          },
        ],
      },
      {
        id: "palabras-4",
        title: "Asking questions",
        phrases: [
          {
            id: "palabras-7-1",
            text: "¿dónde?",
            translation: "where?",
            sounds: "DON, all day",
            picture:
              "A mafia don sits in a deckchair at the junction all day, and he is the only one who knows where anything is.",
            focusNote:
              "DON-de, stress the first syllable — that's what the accent is telling you. Soft d at the end.",
          },
          {
            id: "palabras-7-2",
            text: "¿cuándo?",
            translation: "when?",
            sounds: "KWAN DO",
            picture:
              "Your tae kwon do instructor will tell you exactly when the class starts, and never where it is.",
            focusNote:
              "KWAN-do — 'cua' is one syllable, kwan. The accent again means the stress is at the front.",
          },
          {
            id: "palabras-7-3",
            text: "¿cuánto?",
            translation: "how much?",
            sounds: "QUANTITY",
            picture:
              "The fish man weighs the quantity on scales made of ten-pound notes and asks how much you want.",
            focusNote:
              "KWAN-to. Same 'cua' as cuándo, and it really is the quantity word — same Latin root.",
          },
          {
            id: "palabras-7-4",
            text: "¿quién?",
            translation: "who?",
            sounds: "KEN",
            picture:
              "Ken from next door is knocking at midnight in his dressing gown and nobody knows who he is.",
            focusNote:
              "kyen, one syllable. 'qu' is a plain k again, so never 'kwee-en'.",
          },
          {
            id: "palabras-7-5",
            text: "¿por qué?",
            translation: "why?",
            sounds: "poor KAY",
            picture:
              "Poor Kay asks why, right through Christmas dinner, and not one person answers her.",
            focusNote:
              "por-KE, stress on the KE — that accent is doing real work. Without it, 'porque' is *because*.",
          },
        ],
      },
      {
        id: "palabras-5",
        title: "When, and how often",
        phrases: [
          {
            id: "palabras-8-1",
            text: "hoy",
            translation: "today",
            sounds: "OY!",
            picture:
              "Someone leans out of a window and shouts 'OY!' at you — today, and only today, never again.",
            focusNote:
              "One syllable, 'oy'. The h is silent, the way it always is.",
          },
          {
            id: "palabras-8-3",
            text: "ayer",
            translation: "yesterday",
            sounds: "a YEAR",
            picture:
              "Yesterday feels like a whole year ago, because you spent every hour of it in the air getting here.",
            focusNote:
              "a-YER, stress at the end. Two syllables and a tapped r.",
          },
          {
            id: "palabras-8-5",
            text: "tarde",
            translation: "late, afternoon",
            sounds: "TAR day",
            picture:
              "You are late because you stepped in tar on the way out, and the whole afternoon goes on getting free of it.",
            focusNote:
              "TAR-de, soft d. Same word does late and afternoon — 'buenas tardes' is the one you know.",
          },
          {
            id: "palabras-5-1",
            text: "siempre",
            translation: "always",
            sounds: "SEE 'EM PRAY",
            picture:
              "Every time you pass that little church, you see 'em pray. Every time, without fail.",
            focusNote:
              "SYEM-pre — 'sie' is one syllable, syem. Tapped r at the end.",
          },
          {
            id: "palabras-5-2",
            text: "nunca",
            translation: "never",
            sounds: "NOON car",
            picture:
              "The station clock crawls towards noon and stops a minute short. Noon never comes, and nor does the car.",
            focusNote:
              "NUN-ka. Pure u, said 'oo'. Stress the first syllable.",
          },
        ],
      },
      {
        id: "palabras-6",
        title: "Odds and ends",
        phrases: [
          {
            id: "palabras-3-5",
            text: "el dinero",
            translation: "the money",
            sounds: "De Niro",
            picture:
              "Robert De Niro at the fish stall, paying for everyone's shopping in cash, note by note.",
            focusNote:
              "di-NE-ro, stress on NE. Soft d to start, tapped r in the middle.",
          },
          {
            id: "palabras-9-3",
            text: "el dolor",
            translation: "the pain, the ache",
            sounds: "DOH! + LAW",
            picture:
              "Every twinge makes you shout 'doh!' and mutter that there ought to be a law against this much pain.",
            focusNote:
              "do-LOR, stress at the end. English 'dolorous' is the same word wearing a coat.",
          },
          {
            id: "palabras-9-5",
            text: "la receta",
            translation: "the prescription",
            sounds: "RECIPE-a",
            picture:
              "The chemist hands you a recipe instead of a prescription: two eggs, a lemon, and lie down until Thursday.",
            focusNote:
              "re-THE-ta — the Spain c again. It really does mean recipe too, which is why the picture works.",
          },
          {
            id: "palabras-5-5",
            text: "todavía",
            translation: "still, not yet",
            sounds: "TOAD a VIA",
            picture:
              "A toad sitting in the middle of the road, still there an hour later, refusing to move: 'toad-a-VIA!'",
            focusNote:
              "to-da-VEE-a, stress on VEE. Soft d in the middle, and the í is a pure ee.",
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
