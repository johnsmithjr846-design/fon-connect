// Généré depuis le programme FonConnect. Ne pas éditer à la main.
import type { LearningPath } from "./types";

export const FON_ALPHABET = [
  {
    "letter": "A a",
    "name": "a",
    "example": "atign (arbre)"
  },
  {
    "letter": "B b",
    "name": "bé",
    "example": "boni (mettre)"
  },
  {
    "letter": "C c",
    "name": "cé",
    "example": "—"
  },
  {
    "letter": "D d",
    "name": "dé",
    "example": "dò (rester)"
  },
  {
    "letter": "Ɖ ɖ",
    "name": "ɖé",
    "example": "ɖo (être)"
  },
  {
    "letter": "E e",
    "name": "é",
    "example": "égbé (aujourd'hui)"
  },
  {
    "letter": "Ɛ ɛ",
    "name": "ɛ́",
    "example": "ɛɛn (oui)"
  },
  {
    "letter": "F f",
    "name": "éf",
    "example": "fifá (blanc)"
  },
  {
    "letter": "G g",
    "name": "gé",
    "example": "gan (heure)"
  },
  {
    "letter": "GB gb",
    "name": "gbé",
    "example": "gbɛkisin (matin)"
  },
  {
    "letter": "H h",
    "name": "há",
    "example": "hun (cœur)"
  },
  {
    "letter": "I i",
    "name": "i",
    "example": "inu (ventre)"
  },
  {
    "letter": "J j",
    "name": "jé",
    "example": "jí (accoucher)"
  },
  {
    "letter": "K k",
    "name": "ká",
    "example": "kanlign (animal)"
  },
  {
    "letter": "KP kp",
    "name": "kpá",
    "example": "kpodó (fermer)"
  },
  {
    "letter": "L l",
    "name": "él",
    "example": "lɛngbɔví (agneau)"
  },
  {
    "letter": "M m",
    "name": "ém",
    "example": "mɛxó (frère aîné)"
  },
  {
    "letter": "N n",
    "name": "én",
    "example": "nukɛn (bouche)"
  },
  {
    "letter": "NY ny",
    "name": "nyé",
    "example": "nyɛ̀vǐ (aiguille)"
  },
  {
    "letter": "O o",
    "name": "ó",
    "example": "o (il/elle)"
  },
  {
    "letter": "Ɔ ɔ",
    "name": "ɔ́",
    "example": "ɔkɔtɔn (cent)"
  },
  {
    "letter": "P p",
    "name": "pé",
    "example": "polisi (police)"
  },
  {
    "letter": "R r",
    "name": "ér",
    "example": "rɛ (dire)"
  },
  {
    "letter": "S s",
    "name": "és",
    "example": "sun (mois)"
  },
  {
    "letter": "T t",
    "name": "té",
    "example": "ta (tête)"
  },
  {
    "letter": "U u",
    "name": "u",
    "example": "un (je)"
  },
  {
    "letter": "V v",
    "name": "vé",
    "example": "vɛ (gorge)"
  },
  {
    "letter": "W w",
    "name": "wé",
    "example": "wè (deux)"
  },
  {
    "letter": "X x",
    "name": "xá",
    "example": "xwe (pluie)"
  },
  {
    "letter": "Y y",
    "name": "yé",
    "example": "yi (aller)"
  },
  {
    "letter": "Z z",
    "name": "zé",
    "example": "zan (nuit)"
  }
] as const;

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "bases",
    index: 1,
    title: "Les bases",
    titleEn: "The basics",
    color: "#2E9B4F",
    lessons: [
      {
        id: "1-1",
        title: "Bonjour ! (Salutations)",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Ah ɖo wɛ", "phonetic": "ah do WE", "fr": "Bonjour", "en": "Hello"}, {"fon": "Gbɛkisin vɔ", "phonetic": "gbeh-ki-SIN vo", "fr": "Bonjour (matin)", "en": "Good morning"}, {"fon": "Hwɛhwɛ vɔ", "phonetic": "hweh-HWE vo", "fr": "Bonsoir", "en": "Good evening"}, {"fon": "Zǎn vɔ", "phonetic": "zan VO", "fr": "Bonne nuit", "en": "Good night"}, {"fon": "Mi yì nú", "phonetic": "mi yi NU", "fr": "Au revoir", "en": "Goodbye"}, {"fon": "A ɖo sɔ a?", "phonetic": "a do SO a", "fr": "Comment vas-tu ?", "en": "How are you?"}, {"fon": "Un ɖo mɔ", "phonetic": "un do MO", "fr": "Je vais bien", "en": "I'm fine"}],
        dialogue: [{"speaker": "A", "fon": "Ah ɖo wɛ ! A ɖo sɔ a?", "fr": "Bonjour ! Comment vas-tu ?"}, {"speaker": "B", "fon": "Un ɖo mɔ. Nǔ ɖo sɔ a?", "fr": "Je vais bien. Et toi ?"}, {"speaker": "A", "fon": "Un ɖo mɔ ɖéɖé.", "fr": "Je vais bien aussi."}, {"speaker": "B", "fon": "Mi yì nú !", "fr": "Au revoir !"}],
        culture: "Chez les Fon, on se salue en s'agenouillant légèrement devant les aînés. Le salut matinal *Gbɛkisin vɔ* vient de *gbɛ* (paix) + *kisin* (matin) + *vɔ* (soit). La paix du matin est un souhait fondamental dans la culture vodun.",
      },
      {
        id: "1-2",
        title: "Je m'appelle... (Présentation)",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Nyikɔ ce ɔ", "phonetic": "nyi-KO che O", "fr": "Je m'appelle...", "en": "My name is..."}, {"fon": "Àzán kplé nǔ wɛ?", "phonetic": "a-ZAN kple nu WE", "fr": "Comment t'appelles-tu ?", "en": "What's your name?"}, {"fon": "Mǐ kplé ... wɛ", "phonetic": "mi kple ... WE", "fr": "Je m'appelle ...", "en": "I am called ..."}, {"fon": "Un jló mɔ we", "phonetic": "un JLO mo WE", "fr": "Enchanté(e)", "en": "Nice to meet you"}, {"fon": "Éh do houé ...", "phonetic": "eh do hou-EH", "fr": "Il/Elle a ... ans", "en": "He/She is ... years old"}, {"fon": "Nǔ ɖo ...", "phonetic": "nu do ...", "fr": "C'est un/une ...", "en": "It is a ..."}],
        dialogue: [{"speaker": "A", "fon": "Àzán kplé nǔ wɛ?", "fr": "Comment t'appelles-tu ?"}, {"speaker": "B", "fon": "Mǐ kplé Kofi wɛ. Àzán kplé nǔ wɛ?", "fr": "Je m'appelle Kofi. Et toi ?"}, {"speaker": "A", "fon": "Mǐ kplé Afi wɛ. Un jló mɔ we !", "fr": "Je m'appelle Afi. Enchantée !"}, {"speaker": "B", "fon": "Un jló mɔ we ɖéɖé !", "fr": "Enchanté moi aussi !"}],
        culture: "Les noms fon ont souvent une signification profonde liée au jour de naissance, aux circonstances de la naissance ou aux souhaits des parents. *Kofi* est un nom Akan emprunté, très répandu au Bénin. Le nom de famille (*tohùn*) se transmet patrilinéairement.",
      },
      {
        id: "1-3",
        title: "Les nombres 1–10",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Ɖokpo", "phonetic": "dok-PO", "fr": "Un", "en": "One"}, {"fon": "Wè", "phonetic": "we", "fr": "Deux", "en": "Two"}, {"fon": "Atɔn", "phonetic": "a-TON", "fr": "Trois", "en": "Three"}, {"fon": "Enɛ", "phonetic": "e-NE", "fr": "Quatre", "en": "Four"}, {"fon": "Atɔ́n", "phonetic": "a-TON (haut)", "fr": "Cinq", "en": "Five"}, {"fon": "Aɖɛ", "phonetic": "a-DE", "fr": "Six", "en": "Six"}, {"fon": "Adú", "phonetic": "a-DU", "fr": "Sept", "en": "Seven"}, {"fon": "Enɛ́n", "phonetic": "e-NEN", "fr": "Huit", "en": "Eight"}, {"fon": "Asɔn", "phonetic": "a-SON", "fr": "Neuf", "en": "Nine"}, {"fon": "Wǒ", "phonetic": "wo", "fr": "Dix", "en": "Ten"}],
        culture: "Le système numérique fon est décimal. Au-delà de 10, on combine : *Wǒ wè* = 20, *Wǒ ɔkɔtɔn* = 1000. Dans les marchés traditionnels, le marchandage se fait souvent en comptant sur les doigts avec des gestes spécifiques.",
      },
      {
        id: "1-4",
        title: "Les couleurs",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Fífá", "phonetic": "fi-FA", "fr": "Blanc", "en": "White"}, {"fon": "Tɔ́", "phonetic": "TO", "fr": "Noir", "en": "Black"}, {"fon": "Tɔvi", "phonetic": "to-VI", "fr": "Rouge", "en": "Red"}, {"fon": "Tɔvi wɛ", "phonetic": "to-VI we", "fr": "Épicé / Piquant", "en": "Spicy (lit. \"rouge\")"}, {"fon": "Nǔ nyɔ", "phonetic": "nu NYO", "fr": "Sucré / Doux", "en": "Sweet"}, {"fon": "Yɔɖo wɛ", "phonetic": "yo-DO we", "fr": "Salé", "en": "Salty"}, {"fon": "Bló", "phonetic": "blo", "fr": "Ouvert / Bleu", "en": "Open / Blue"}],
      },
      {
        id: "1-5",
        title: "L'alphabet fon",
        minutes: 7,
        kind: "alphabet",
        vocab: [],
      },
      {
        id: "1-6",
        title: "Merci et S'il vous plaît",
        minutes: 5,
        kind: "vocab",
        vocab: [{"fon": "Awǒ nú we", "phonetic": "a-WO nu WE", "fr": "Merci", "en": "Thank you"}, {"fon": "Bɔ mi jló", "phonetic": "bo mi JLO", "fr": "S'il vous plaît", "en": "Please"}, {"fon": "Nǔ ɖevo wɛ ɖo mɛ ǎ", "phonetic": "nu DE-vo we do ME a", "fr": "Je vous en prie", "en": "You're welcome"}, {"fon": "Nǔ e hɛn mì nú", "phonetic": "nu e hen mi NU", "fr": "Pardon", "en": "Sorry"}, {"fon": "Mi sɔ nǔ mi", "phonetic": "mi so NU mi", "fr": "Excusez-moi", "en": "Excuse me"}],
      },
      {
        id: "1-7",
        title: "Oui et Non",
        minutes: 5,
        kind: "vocab",
        vocab: [{"fon": "Ɛɛn", "phonetic": "een", "fr": "Oui", "en": "Yes"}, {"fon": "Eǒ", "phonetic": "e-O", "fr": "Non", "en": "No"}, {"fon": "Eǒ, un tuùn ǎ", "phonetic": "e-O un tu-UN a", "fr": "Non, je ne comprends pas", "en": "No, I don't understand"}, {"fon": "Ɛɛn, un tuùn", "phonetic": "een un tu-UN", "fr": "Oui, je comprends", "en": "Yes, I understand"}, {"fon": "A ɖó ... gbè ɖó?", "phonetic": "a do ... gbe DO", "fr": "Parles-tu ... ?", "en": "Do you speak ... ?"}],
      },
      {
        id: "1-8",
        title: "Le temps (jours)",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Égbé", "phonetic": "eg-BE", "fr": "Aujourd'hui", "en": "Today"}, {"fon": "Egbé ɖevo", "phonetic": "eg-BE DE-vo", "fr": "Demain", "en": "Tomorrow"}, {"fon": "Zǎn e jɛ", "phonetic": "zan e JE", "fr": "Hier", "en": "Yesterday"}, {"fon": "Azan", "phonetic": "a-ZAN", "fr": "Jour", "en": "Day"}, {"fon": "Zan", "phonetic": "zan", "fr": "Nuit", "en": "Night"}, {"fon": "Gbada", "phonetic": "gba-DA", "fr": "Soir", "en": "Evening"}, {"fon": "Zanzan", "phonetic": "zan-ZAN", "fr": "Matin", "en": "Morning"}],
        dialogue: [{"speaker": "A", "fon": "Égbé nǔ ɖo?", "fr": "Quel jour sommes-nous aujourd'hui ?"}, {"speaker": "B", "fon": "Égbé Tɛnigbé wɛ.", "fr": "Aujourd'hui c'est lundi."}],
      },
      {
        id: "1-9",
        title: "Le temps (heures)",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Hwenu tɛ ɖo?", "phonetic": "HWE-nu te DO", "fr": "Quelle heure est-il ?", "en": "What time is it?"}, {"fon": "Gan", "phonetic": "gan", "fr": "Heure", "en": "Hour"}, {"fon": "Cɛjunukunxwixwé", "phonetic": "ce-ju-nu-kun-xwi-xwe", "fr": "Minute", "en": "Minute"}, {"fon": "Gan ɖokpo", "phonetic": "gan dok-PO", "fr": "Une heure", "en": "One o'clock"}, {"fon": "Gan wè", "phonetic": "gan we", "fr": "Deux heures", "en": "Two o'clock"}, {"fon": "Sɔgbe", "phonetic": "SOG-be", "fr": "Matin (tôt)", "en": "Early morning"}, {"fon": "Gbada", "phonetic": "gba-DA", "fr": "Après-midi", "en": "Afternoon"}],
      },
      {
        id: "1-10",
        title: "Révision des bases",
        minutes: 8,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "Ah ɖo wɛ ! Àzán kplé nǔ wɛ?", "fr": ""}, {"speaker": "IA", "fon": "Un ɖo mɔ. Nǔ ɖo sɔ a?", "fr": ""}, {"speaker": "IA", "fon": "Égbé gan ɖokpo wɛ. Mi yì nú !", "fr": ""}],
      },
    ],
  },
  {
    id: "quotidien",
    index: 2,
    title: "Vie quotidienne",
    titleEn: "Daily life",
    color: "#1D7FD4",
    lessons: [
      {
        id: "2-1",
        title: "La famille (1)",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Fofo", "phonetic": "fo-FO", "fr": "Père", "en": "Father"}, {"fon": "Na", "phonetic": "na", "fr": "Mère", "en": "Mother"}, {"fon": "Mɛxó", "phonetic": "me-XO", "fr": "Frère aîné", "en": "Elder brother"}, {"fon": "Ɖaxó", "phonetic": "ɖa-XO", "fr": "Sœur aînée", "en": "Elder sister"}, {"fon": "Ví", "phonetic": "VI", "fr": "Enfant", "en": "Child"}, {"fon": "Honton", "phonetic": "hon-TON", "fr": "Ami", "en": "Friend"}, {"fon": "Mɛ ɖevo", "phonetic": "me DE-vo", "fr": "Partenaire / Conjoint", "en": "Partner / Spouse"}],
        dialogue: [{"speaker": "A", "fon": "Fofo ɖo fí?", "fr": "Où est le père ?"}, {"speaker": "B", "fon": "Fofo ɖo xwé mɛ.", "fr": "Le père est à la maison."}, {"speaker": "A", "fon": "Na ɖo fí?", "fr": "Où est la mère ?"}, {"speaker": "B", "fon": "Na ɖo aximɛ.", "fr": "La mère est au marché."}],
      },
      {
        id: "2-2",
        title: "La famille (2)",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Bǎbá", "phonetic": "ba-BA", "fr": "Grand-père", "en": "Grandfather"}, {"fon": "Yɛ́yɛ́", "phonetic": "ye-YE", "fr": "Grand-mère", "en": "Grandmother"}, {"fon": "Tɔ́n", "phonetic": "TON", "fr": "Oncle", "en": "Uncle"}, {"fon": "Tɔ́nnu", "phonetic": "TON-nu", "fr": "Tante", "en": "Aunt"}, {"fon": "Víví", "phonetic": "VI-VI", "fr": "Petit-enfant", "en": "Grandchild"}, {"fon": "Akplɔ́", "phonetic": "ak-PLO", "fr": "Neveu / Nièce", "en": "Nephew / Niece"}, {"fon": "Xɔ́lɔ́", "phonetic": "xo-LO", "fr": "Cousin(e)", "en": "Cousin"}],
      },
      {
        id: "2-3",
        title: "La maison (1)",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Xwé", "phonetic": "xwe", "fr": "Maison", "en": "House"}, {"fon": "Xwéɖokpo", "phonetic": "xwe-dok-PO", "fr": "Chambre", "en": "Room"}, {"fon": "Akɔnukɔ", "phonetic": "a-ko-nu-KO", "fr": "Porte", "en": "Door"}, {"fon": "Akɔnulɛdo", "phonetic": "a-ko-nu-le-DO", "fr": "Fenêtre", "en": "Window"}, {"fon": "Ati", "phonetic": "a-TI", "fr": "Toit", "en": "Roof"}, {"fon": "Nu kɔ xwé", "phonetic": "nu KO xwe", "fr": "Toilettes", "en": "Toilet"}, {"fon": "Nuɖuɖu xwé", "phonetic": "nu-ɖu-ɖu xwe", "fr": "Cuisine", "en": "Kitchen"}],
      },
      {
        id: "2-4",
        title: "La maison (2)",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Agbaza", "phonetic": "ag-BA-za", "fr": "Lit", "en": "Bed"}, {"fon": "Azɔ xwé", "phonetic": "a-ZO xwe", "fr": "Chaise", "en": "Chair"}, {"fon": "Table", "phonetic": "ta-BLE", "fr": "Table", "en": "Table"}, {"fon": "Zogbin", "phonetic": "zog-BIN", "fr": "Lampe", "en": "Lamp"}, {"fon": "Tɔ", "phonetic": "to", "fr": "Eau (courante)", "en": "Water"}, {"fon": "Gbɛtɔ", "phonetic": "gbe-TO", "fr": "Terre / Sol", "en": "Ground / Floor"}, {"fon": "Sisi", "phonetic": "SI-si", "fr": "Ciel", "en": "Sky"}],
      },
      {
        id: "2-5",
        title: "À l'école",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Nǔsɔ xwé", "phonetic": "nu-SO xwe", "fr": "École", "en": "School"}, {"fon": "Nǔtɔ́", "phonetic": "nu-TO", "fr": "Professeur", "en": "Teacher"}, {"fon": "Nǔsɔsɔ", "phonetic": "nu-so-SO", "fr": "Élève / Étudiant", "en": "Student"}, {"fon": "Gbɛ", "phonetic": "gbe", "fr": "Livre", "en": "Book"}, {"fon": "Gbɛtɔ", "phonetic": "gbe-TO", "fr": "Cahier", "en": "Notebook"}, {"fon": "Nǔwlan", "phonetic": "nu-WLAN", "fr": "Leçon", "en": "Lesson"}, {"fon": "Nǔsɔsɔ xwé", "phonetic": "nu-so-SO xwe", "fr": "Classe", "en": "Classroom"}],
        dialogue: [{"speaker": "A", "fon": "A ɖó nǔsɔ xwé ɖó?", "fr": "Vas-tu à l'école ?"}, {"speaker": "B", "fon": "Ɛɛn, un ɖó nǔsɔ xwé ɖó.", "fr": "Oui, je vais à l'école."}, {"speaker": "A", "fon": "Nǔtɔ́ ɖo fí?", "fr": "Où est le professeur ?"}, {"speaker": "B", "fon": "Nǔtɔ́ ɖo nǔsɔsɔ xwé mɛ.", "fr": "Le professeur est dans la classe."}],
      },
      {
        id: "2-6",
        title: "Le travail",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Nǔ wlan", "phonetic": "nu WLAN", "fr": "Travail", "en": "Work"}, {"fon": "Nǔtɔ́", "phonetic": "nu-TO", "fr": "Chef / Manager", "en": "Boss"}, {"fon": "Bɔ xwé", "phonetic": "bo XWE", "fr": "Bureau", "en": "Office"}, {"fon": "Agun xwé", "phonetic": "a-GUN xwe", "fr": "Réunion", "en": "Meeting"}, {"fon": "Akwɛ xó", "phonetic": "a-KWE xo", "fr": "Facture", "en": "Invoice"}, {"fon": "Akwɛ nɔ", "phonetic": "a-KWE no", "fr": "Paiement", "en": "Payment"}, {"fon": "Nǔ wlan xwé", "phonetic": "nu WLAN xwe", "fr": "Lieu de travail", "en": "Workplace"}],
      },
      {
        id: "2-7",
        title: "La nourriture (1)",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Ðu nǔ", "phonetic": "ɖu NU", "fr": "Nourriture", "en": "Food"}, {"fon": "Blɛdi", "phonetic": "BLE-di", "fr": "Pain", "en": "Bread"}, {"fon": "Flo", "phonetic": "flo", "fr": "Viande", "en": "Meat"}, {"fon": "Hwévi", "phonetic": "hwe-VI", "fr": "Poisson", "en": "Fish"}, {"fon": "Azign", "phonetic": "a-ZIGN", "fr": "Arachide", "en": "Peanut"}, {"fon": "Anannan", "phonetic": "a-nan-NAN", "fr": "Ananas", "en": "Pineapple"}, {"fon": "Atiɖi", "phonetic": "a-TI-ɖi", "fr": "Fruit", "en": "Fruit"}],
      },
      {
        id: "2-8",
        title: "La nourriture (2)",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Akasa", "phonetic": "a-KA-sa", "fr": "Pâte de maïs", "en": "Corn dough"}, {"fon": "Wɔ", "phonetic": "wo", "fr": "Sauce", "en": "Sauce"}, {"fon": "Lǎ", "phonetic": "la", "fr": "Huile", "en": "Oil"}, {"fon": "Siga", "phonetic": "SI-ga", "fr": "Sucre", "en": "Sugar"}, {"fon": "Nuɖuɖu", "phonetic": "nu-ɖu-ɖu", "fr": "Repas", "en": "Meal"}, {"fon": "Sɔgbe ðu nǔ", "phonetic": "SOG-be ɖu NU", "fr": "Petit-déjeuner", "en": "Breakfast"}, {"fon": "Hwɛhwɛ ðu nǔ", "phonetic": "hweh-HWE ɖu NU", "fr": "Déjeuner", "en": "Lunch"}],
      },
      {
        id: "2-9",
        title: "Les boissons",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Tɔ", "phonetic": "to", "fr": "Eau", "en": "Water"}, {"fon": "Emu", "phonetic": "E-mu", "fr": "Vin", "en": "Wine"}, {"fon": "Kafé", "phonetic": "ka-FE", "fr": "Café", "en": "Coffee"}, {"fon": "Bière", "phonetic": "BYER", "fr": "Bière", "en": "Beer"}, {"fon": "Tɔvi", "phonetic": "to-VI", "fr": "Jus rouge (bissap)", "en": "Red juice (hibiscus)"}, {"fon": "Tɔfífá", "phonetic": "to-fi-FA", "fr": "Lait", "en": "Milk"}, {"fon": "Emu ɖevo", "phonetic": "E-mu DE-vo", "fr": "Jus", "en": "Juice"}],
      },
      {
        id: "2-10",
        title: "Les animaux (1)",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Kanlign", "phonetic": "kan-LIGN", "fr": "Animal", "en": "Animal"}, {"fon": "Tchoukou", "phonetic": "tchou-KOU", "fr": "Chien", "en": "Dog"}, {"fon": "Hla", "phonetic": "hla", "fr": "Hyène", "en": "Hyena"}, {"fon": "Hɔ̀n", "phonetic": "hon", "fr": "Aigle", "en": "Eagle"}, {"fon": "Wiin", "phonetic": "wi-IN", "fr": "Abeille", "en": "Bee"}, {"fon": "Lɛngbɔví", "phonetic": "leng-bo-VI", "fr": "Agneau", "en": "Lamb"}, {"fon": "Soh kêtêkêtê", "phonetic": "soh ke-te-ke-te", "fr": "Âne", "en": "Donkey"}],
      },
      {
        id: "2-11",
        title: "Les animaux (2)",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Yê / Yêglétété", "phonetic": "ye / ye-gle-te-te", "fr": "Araignée", "en": "Spider"}, {"fon": "Atign", "phonetic": "a-TIGN", "fr": "Arbre", "en": "Tree"}, {"fon": "Azɔn", "phonetic": "a-ZON", "fr": "Serpent", "en": "Snake"}, {"fon": "Akɔn", "phonetic": "a-KON", "fr": "Poulet", "en": "Chicken"}, {"fon": "Hwévi", "phonetic": "hwe-VI", "fr": "Poisson", "en": "Fish"}, {"fon": "Gbɔ", "phonetic": "gbo", "fr": "Chèvre", "en": "Goat"}, {"fon": "Wǔ", "phonetic": "wu", "fr": "Mouton", "en": "Sheep"}],
      },
      {
        id: "2-12",
        title: "Les verbes essentiels (1)",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Yi", "phonetic": "yi", "fr": "Aller", "en": "Go"}, {"fon": "Wâ", "phonetic": "wa", "fr": "Venir", "en": "Come"}, {"fon": "Ðu", "phonetic": "ɖu", "fr": "Manger", "en": "Eat"}, {"fon": "Nǔ", "phonetic": "nu", "fr": "Boire", "en": "Drink"}, {"fon": "Xɔ̀", "phonetic": "xo", "fr": "Acheter", "en": "Buy"}, {"fon": "Jló", "phonetic": "jlo", "fr": "Aimer / Vouloir", "en": "Like / Want"}, {"fon": "Sɔ", "phonetic": "so", "fr": "Savoir / Connaître", "en": "Know"}],
      },
      {
        id: "2-13",
        title: "Les verbes essentiels (2)",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Dhò", "phonetic": "dho", "fr": "Avoir", "en": "Have"}, {"fon": "Dò", "phonetic": "do", "fr": "Rester / Être", "en": "Stay / Be"}, {"fon": "Tâ", "phonetic": "ta", "fr": "Allumer", "en": "Light"}, {"fon": "Kpò", "phonetic": "kpo", "fr": "Fermer", "en": "Close"}, {"fon": "Bló", "phonetic": "blo", "fr": "Ouvrir", "en": "Open"}, {"fon": "Ylɔ", "phonetic": "ylo", "fr": "Appeler", "en": "Call"}, {"fon": "Nɔ", "phonetic": "no", "fr": "Payer", "en": "Pay"}],
      },
      {
        id: "2-14",
        title: "Les adjectifs",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Nyɔ", "phonetic": "nyo", "fr": "Bon / Beau", "en": "Good / Beautiful"}, {"fon": "Nyɔ wɛ", "phonetic": "nyo WE", "fr": "Très bon", "en": "Very good"}, {"fon": "Guégué", "phonetic": "gue-GUE", "fr": "Grand / Beaucoup", "en": "Big / Many"}, {"fon": "Kêtêkêtê", "phonetic": "ke-te-ke-te", "fr": "Petit", "en": "Small"}, {"fon": "Kpɔ́", "phonetic": "kpo", "fr": "Dur / Difficile", "en": "Hard / Difficult"}, {"fon": "Fífá", "phonetic": "fi-FA", "fr": "Clair / Blanc", "en": "Light / White"}, {"fon": "Tɔ́", "phonetic": "TO", "fr": "Foncé / Noir", "en": "Dark / Black"}],
      },
      {
        id: "2-15",
        title: "Révision Vie quotidienne",
        minutes: 8,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "Égbé wɛ, nǔ ɖo sɔ a?", "fr": ""}, {"speaker": "IA", "fon": "A ɖó nǔsɔ xwé ɖó? Fofo ɖo fí?", "fr": ""}, {"speaker": "IA", "fon": "Un jló mɔ we ! Égbé ðu nǔ ɖéɖé wɛ?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ ! Mi yì nú !", "fr": ""}],
      },
    ],
  },
  {
    id: "marche",
    index: 3,
    title: "Marché et achats",
    titleEn: "Market and shopping",
    color: "#E4B301",
    lessons: [
      {
        id: "3-1",
        title: "Au marché (1)",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Aximɛ", "phonetic": "a-xi-ME", "fr": "Marché", "en": "Market"}, {"fon": "Nǔxɔ̀tɔ", "phonetic": "nu-xo-TO", "fr": "Vendeur", "en": "Seller"}, {"fon": "Nǔxɔ̀vi", "phonetic": "nu-xo-VI", "fr": "Vendeuse", "en": "Female seller"}, {"fon": "Nǔxɔ̀", "phonetic": "nu-XO", "fr": "Achat", "en": "Purchase"}, {"fon": "Akwɛ", "phonetic": "a-KWE", "fr": "Prix / Argent", "en": "Price / Money"}, {"fon": "Akouwè", "phonetic": "a-kou-WE", "fr": "Argent (monnaie)", "en": "Money"}, {"fon": "Nǔtɔ́", "phonetic": "nu-TO", "fr": "Marchandise", "en": "Goods"}],
      },
      {
        id: "3-2",
        title: "Au marché (2) — Le marchandage",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Akwɛ tɛnmɛ?", "phonetic": "a-KWE ten-ME", "fr": "Combien ça coûte ?", "en": "How much?"}, {"fon": "Akwɛ lɛ́ɛ ɖó à?", "phonetic": "a-KWE le-EH do A", "fr": "C'est combien ?", "en": "How much is it?"}, {"fon": "Nǔ nyɔ wɛ", "phonetic": "nu NYO WE", "fr": "C'est bon (prix)", "en": "It's a good price"}, {"fon": "Nǔ kpɔ́ wɛ", "phonetic": "nu KPO WE", "fr": "C'est cher", "en": "It's expensive"}, {"fon": "Nǔ kêtêkêtê wɛ", "phonetic": "nu ke-te-ke-te WE", "fr": "C'est bon marché", "en": "It's cheap"}, {"fon": "Bɔ mi jló akwɛ", "phonetic": "bo mi JLO a-KWE", "fr": "Fais-moi un prix", "en": "Give me a price"}, {"fon": "Xɔ̀ mi ɖé", "phonetic": "xo mi DE", "fr": "Achète-moi ça", "en": "Buy this for me"}],
        dialogue: [{"speaker": "Client", "fon": "Ah ɖo wɛ ! Akwɛ tɛnmɛ?", "fr": "Bonjour ! Combien ça coûte ?"}, {"speaker": "Vendeur", "fon": "Akwɛ atɔ́ ɔ.", "fr": "C'est cinq [francs]."}, {"speaker": "Client", "fon": "Nǔ kpɔ́ wɛ ! Bɔ mi jló akwɛ ɖokpo.", "fr": "C'est cher ! Fais-moi un prix."}, {"speaker": "Vendeur", "fon": "Ɛɛn, akwɛ enɛ ɔ.", "fr": "D'accord, c'est quatre."}, {"speaker": "Client", "fon": "Nǔ nyɔ wɛ. Un xɔ̀.", "fr": "C'est bon. Je prends."}],
      },
      {
        id: "3-3",
        title: "Les fruits et légumes",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Atiɖi", "phonetic": "a-TI-ɖi", "fr": "Fruit", "en": "Fruit"}, {"fon": "Atiɖiɖo", "phonetic": "a-ti-ɖi-ɖo", "fr": "Légume", "en": "Vegetable"}, {"fon": "Anannan", "phonetic": "a-nan-NAN", "fr": "Ananas", "en": "Pineapple"}, {"fon": "Oranji", "phonetic": "o-RAN-ji", "fr": "Orange", "en": "Orange"}, {"fon": "Manɖo", "phonetic": "man-ɖo", "fr": "Mangue", "en": "Mango"}, {"fon": "Papai", "phonetic": "pa-PAI", "fr": "Papaye", "en": "Papaya"}, {"fon": "Banan", "phonetic": "ba-NAN", "fr": "Banane", "en": "Banana"}],
      },
      {
        id: "3-4",
        title: "Les vêtements",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Nǔɖo", "phonetic": "nu-ɖo", "fr": "Vêtement", "en": "Clothes"}, {"fon": "Nǔɖoɖokpo", "phonetic": "nu-ɖo-dok-PO", "fr": "Chemise", "en": "Shirt"}, {"fon": "Nǔɖowè", "phonetic": "nu-ɖo-we", "fr": "Pantalon", "en": "Pants"}, {"fon": "Nǔɖoɖaxó", "phonetic": "nu-ɖo-ɖa-XO", "fr": "Robe", "en": "Dress"}, {"fon": "Nǔɖokpɔ́", "phonetic": "nu-ɖo-KPO", "fr": "Chaussures", "en": "Shoes"}, {"fon": "Nǔɖotɔ́", "phonetic": "nu-ɖo-TO", "fr": "Chapeau", "en": "Hat"}, {"fon": "Nǔɖofífá", "phonetic": "nu-ɖo-fi-FA", "fr": "Blanc (vêtement)", "en": "White clothes"}],
      },
      {
        id: "3-5",
        title: "Les objets du quotidien",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Nǔtɔ́", "phonetic": "nu-TO", "fr": "Objet", "en": "Object"}, {"fon": "Gbɛ", "phonetic": "gbe", "fr": "Livre", "en": "Book"}, {"fon": "Monto", "phonetic": "mon-TO", "fr": "Voiture", "en": "Car"}, {"fon": "Telefɔni", "phonetic": "te-le-FO-ni", "fr": "Téléphone", "en": "Phone"}, {"fon": "Zogbin", "phonetic": "zog-BIN", "fr": "Lampe", "en": "Lamp"}, {"fon": "Akɔnukɔ", "phonetic": "a-ko-nu-KO", "fr": "Porte", "en": "Door"}, {"fon": "Gannou", "phonetic": "gan-NOU", "fr": "Assiette", "en": "Plate"}],
      },
      {
        id: "3-6",
        title: "Les quantités",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Ɖokpo", "phonetic": "dok-PO", "fr": "Un (unité)", "en": "One"}, {"fon": "Wè", "phonetic": "we", "fr": "Deux", "en": "Two"}, {"fon": "Guégué", "phonetic": "gue-GUE", "fr": "Beaucoup", "en": "Many"}, {"fon": "Kêtêkêtê", "phonetic": "ke-te-ke-te", "fr": "Peu", "en": "Few"}, {"fon": "Nǔ ɖokpo", "phonetic": "nu dok-PO", "fr": "Un peu", "en": "A little"}, {"fon": "Nǔ guégué", "phonetic": "nu gue-GUE", "fr": "Beaucoup (de)", "en": "A lot (of)"}, {"fon": "Nǔ kpɔ́", "phonetic": "nu KPO", "fr": "Trop", "en": "Too much"}],
      },
      {
        id: "3-7",
        title: "Payer et la monnaie",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Nɔ", "phonetic": "no", "fr": "Payer", "en": "Pay"}, {"fon": "Akwɛ nɔ", "phonetic": "a-KWE no", "fr": "Paiement", "en": "Payment"}, {"fon": "Akwɛ xó", "phonetic": "a-KWE xo", "fr": "Facture", "en": "Invoice"}, {"fon": "Akwɛ lɛ́ɛdo", "phonetic": "a-KWE le-EH-do", "fr": "Monnaie (rendue)", "en": "Change"}, {"fon": "Akouwè", "phonetic": "a-kou-WE", "fr": "Argent", "en": "Money"}, {"fon": "Banki", "phonetic": "BAN-ki", "fr": "Banque", "en": "Bank"}, {"fon": "Nǔ nɔ wɛ", "phonetic": "nu no WE", "fr": "Payé", "en": "Paid"}],
      },
      {
        id: "3-8",
        title: "Commander en ligne",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Nǔxɔ̀ xwé", "phonetic": "nu-xo XWE", "fr": "Boutique", "en": "Shop"}, {"fon": "Nǔxɔ̀ ɖo xwé mɛ", "phonetic": "nu-xo do XWE me", "fr": "Commander en ligne", "en": "Order online"}, {"fon": "Email", "phonetic": "EE-mel", "fr": "Email", "en": "Email"}, {"fon": "Adrɛsi", "phonetic": "a-DRE-si", "fr": "Adresse", "en": "Address"}, {"fon": "Livrezon", "phonetic": "li-vre-ZON", "fr": "Livraison", "en": "Delivery"}, {"fon": "Nǔxɔ̀ lɛ́ɛdo", "phonetic": "nu-xo le-EH-do", "fr": "Commande", "en": "Order"}, {"fon": "Nǔxɔ̀ tɛnmɛ?", "phonetic": "nu-xo ten-ME", "fr": "Où est ma commande ?", "en": "Where is my order?"}],
      },
      {
        id: "3-9",
        title: "Les couleurs des objets",
        minutes: 5,
        kind: "vocab",
        vocab: [{"fon": "Nǔɖo tɔvi", "phonetic": "nu-ɖo to-VI", "fr": "Vêtement rouge", "en": "Red clothes"}, {"fon": "Nǔɖo fífá", "phonetic": "nu-ɖo fi-FA", "fr": "Vêtement blanc", "en": "White clothes"}, {"fon": "Nǔɖo tɔ́", "phonetic": "nu-ɖo TO", "fr": "Vêtement noir", "en": "Black clothes"}, {"fon": "Nǔɖo bló", "phonetic": "nu-ɖo blo", "fr": "Vêtement bleu", "en": "Blue clothes"}, {"fon": "Nǔɖo nyɔ", "phonetic": "nu-ɖo nyo", "fr": "Beau vêtement", "en": "Nice clothes"}, {"fon": "Nǔɖo kpɔ́", "phonetic": "nu-ɖo KPO", "fr": "Vieux vêtement", "en": "Old clothes"}, {"fon": "Nǔɖo yòyò", "phonetic": "nu-ɖo yo-YO", "fr": "Nouveau vêtement", "en": "New clothes"}],
      },
      {
        id: "3-10",
        title: "Révision Marché",
        minutes: 8,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "Ah ɖo wɛ ! A ɖo sɔ a?", "fr": ""}, {"speaker": "IA", "fon": "Un hɛn nǔɖo yòyɔ. Akwɛ tɛnmɛ?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Nɔ mi akwɛ ɔ.", "fr": ""}, {"speaker": "IA", "fon": "Awǒ nú we ! Mi yì nú !", "fr": ""}],
      },
    ],
  },
  {
    id: "restaurant",
    index: 4,
    title: "Restaurant",
    titleEn: "Restaurant",
    color: "#E4761B",
    lessons: [
      {
        id: "4-1",
        title: "Arriver au restaurant",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Ðu nǔ xwé", "phonetic": "ɖu NU xwe", "fr": "Restaurant", "en": "Restaurant"}, {"fon": "Nùkɔ", "phonetic": "nu-KO", "fr": "Entrée", "en": "Entrance"}, {"fon": "Nùlɛdo", "phonetic": "nu-le-DO", "fr": "Sortie", "en": "Exit"}, {"fon": "Azɔ xwé", "phonetic": "a-ZO xwe", "fr": "Table", "en": "Table"}, {"fon": "Azɔn", "phonetic": "a-ZON", "fr": "Chaise", "en": "Chair"}, {"fon": "Menu ɔ, bɔ mi jló", "phonetic": "ME-nu o bo mi JLO", "fr": "Le menu, svp", "en": "The menu, please"}, {"fon": "Nǔtɔ́ ɖo hɛn nú mì", "phonetic": "nu-TO do HEN nu MI", "fr": "J'ai besoin d'un siège", "en": "I need a seat"}],
      },
      {
        id: "4-2",
        title: "Commander (1)",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Un hɛn ...", "phonetic": "un HEN ...", "fr": "Je voudrais ...", "en": "I would like ..."}, {"fon": "Un hɛn ðu nǔ", "phonetic": "un HEN ɖu NU", "fr": "J'ai faim", "en": "I'm hungry"}, {"fon": "Un hɛn nǔ", "phonetic": "un HEN NU", "fr": "J'ai soif", "en": "I'm thirsty"}, {"fon": "Bɔ mi ...", "phonetic": "bo mi ...", "fr": "Donne-moi ...", "en": "Give me ..."}, {"fon": "Nǔ ɖokpo", "phonetic": "nu dok-PO", "fr": "Un peu", "en": "A little"}, {"fon": "Nǔ guégué", "phonetic": "nu gue-GUE", "fr": "Beaucoup", "en": "A lot"}, {"fon": "Ðu nǔ ɖokpo", "phonetic": "ɖu NU dok-PO", "fr": "Un peu de nourriture", "en": "A little food"}],
        dialogue: [{"speaker": "Client", "fon": "Bɔ mi jló, menu ɔ.", "fr": "S'il vous plaît, le menu."}, {"speaker": "Serveur", "fon": "Ɛɛn, nǔ ɖo sɔ a?", "fr": "Oui, que désirez-vous ?"}, {"speaker": "Client", "fon": "Un hɛn hwévi ɖokpo.", "fr": "Je voudrais un peu de poisson."}, {"speaker": "Serveur", "fon": "Nǔ nyɔ. Bɔ mi tɔ ɖokpo?", "fr": "D'accord. Voulez-vous de l'eau ?"}, {"speaker": "Client", "fon": "Ɛɛn, bɔ mi tɔ.", "fr": "Oui, donnez-moi de l'eau."}],
      },
      {
        id: "4-3",
        title: "Commander (2) — Restrictions alimentaires",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Flo ɖevo ǎ", "phonetic": "flo DE-vo a", "fr": "Végétarien", "en": "Vegetarian"}, {"fon": "Nú ɔ hɛn nú mì", "phonetic": "nu O HEN nu MI", "fr": "Je suis allergique à", "en": "I'm allergic to"}, {"fon": "Siga ɖevo ǎ", "phonetic": "SI-ga DE-vo a", "fr": "Sans sucre", "en": "No sugar"}, {"fon": "Lǎ ɖevo ǎ", "phonetic": "la DE-vo a", "fr": "Sans huile", "en": "No oil"}, {"fon": "Tɔvi wɛ", "phonetic": "to-VI WE", "fr": "Épicé", "en": "Spicy"}, {"fon": "Nǔ nyɔ", "phonetic": "nu NYO", "fr": "Sucré", "en": "Sweet"}, {"fon": "Yɔɖo wɛ", "phonetic": "yo-DO WE", "fr": "Salé", "en": "Salty"}],
      },
      {
        id: "4-4",
        title: "Les plats traditionnels",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Akasa", "phonetic": "a-KA-sa", "fr": "Akasa (pâte de maïs)", "en": "Akasa (corn dough)"}, {"fon": "Wɔ", "phonetic": "wo", "fr": "Sauce", "en": "Sauce"}, {"fon": "Wɔ hwévi", "phonetic": "wo hwe-VI", "fr": "Sauce de poisson", "en": "Fish sauce"}, {"fon": "Wɔ flo", "phonetic": "wo flo", "fr": "Sauce de viande", "en": "Meat sauce"}, {"fon": "Wɔ azign", "phonetic": "wo a-ZIGN", "fr": "Sauce d'arachide", "en": "Peanut sauce"}, {"fon": "Ðu nǔ fon", "phonetic": "ɖu NU fon", "fr": "Plat fon traditionnel", "en": "Traditional Fon dish"}, {"fon": "Piron", "phonetic": "pi-RON", "fr": "Piron (igname pilée)", "en": "Pounded yam"}],
        culture: "Le *piron* (igname pilée) avec de la sauce d'arachide est le plat national du Bénin. La cuisine fon privilégie les sauces épaisses servies avec de la pâte (maïs, manioc, igname). Le poisson fumé et l'huile de palme sont des ingrédients incontournables.",
      },
      {
        id: "4-5",
        title: "Les boissons au restaurant",
        minutes: 5,
        kind: "vocab",
        vocab: [{"fon": "Tɔ fífá", "phonetic": "to fi-FA", "fr": "Eau fraîche", "en": "Cold water"}, {"fon": "Tɔ tɔ́", "phonetic": "to TO", "fr": "Eau chaude", "en": "Hot water"}, {"fon": "Emu ɖevo", "phonetic": "E-mu DE-vo", "fr": "Jus frais", "en": "Fresh juice"}, {"fon": "Emu tɔvi", "phonetic": "E-mu to-VI", "fr": "Jus de bissap", "en": "Hibiscus juice"}, {"fon": "Kafé kêtêkêtê", "phonetic": "ka-FE ke-te-ke-te", "fr": "Petit café", "en": "Small coffee"}, {"fon": "Bière tɔ́", "phonetic": "BYER TO", "fr": "Bière noire", "en": "Dark beer"}, {"fon": "Emu nyɔ", "phonetic": "E-mu NYO", "fr": "Bon jus", "en": "Good juice"}],
      },
      {
        id: "4-6",
        title: "Payer et partir",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Akwɛ ɔ, bɔ mi jló", "phonetic": "a-KWE o bo mi JLO", "fr": "L'addition, svp", "en": "The bill, please"}, {"fon": "Un nɔ akwɛ ɔ", "phonetic": "un NO a-KWE o", "fr": "Je paie l'addition", "en": "I'll pay the bill"}, {"fon": "Akwɛ lɛ́ɛdo", "phonetic": "a-KWE le-EH-do", "fr": "La monnaie", "en": "The change"}, {"fon": "Nǔ nɔ wɛ", "phonetic": "nu no WE", "fr": "C'est payé", "en": "It's paid"}, {"fon": "Nyɔ nú", "phonetic": "nyo NU", "fr": "Délicieux", "en": "Delicious"}, {"fon": "Un jló mɔ ðu nǔ ɔ", "phonetic": "un JLO mo ɖu NU o", "fr": "J'ai aimé le repas", "en": "I liked the meal"}, {"fon": "Mi yì nú !", "phonetic": "mi yi NU", "fr": "Au revoir !", "en": "Goodbye !"}],
      },
      {
        id: "4-7",
        title: "Compliments et réclamations",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Nyɔ nú !", "phonetic": "nyo NU", "fr": "C'est délicieux !", "en": "It's delicious !"}, {"fon": "Nǔ nyɔ wɛ ɖéɖé !", "phonetic": "nu NYO WE de-DE", "fr": "C'est vraiment bon !", "en": "It's really good !"}, {"fon": "Nǔ kpɔ́ wɛ", "phonetic": "nu KPO WE", "fr": "C'est trop (salé/fort)", "en": "It's too much"}, {"fon": "Nǔ ɖevo ǎ", "phonetic": "nu DE-vo a", "fr": "Ce n'est pas bon", "en": "It's not good"}, {"fon": "Nǔ e hɛn mì nú", "phonetic": "nu e HEN mi NU", "fr": "Pardon (pour la plainte)", "en": "Sorry (for the complaint)"}, {"fon": "Bɔ mi nǔ ɖevo", "phonetic": "bo mi nu DE-vo", "fr": "Donne-moi autre chose", "en": "Give me something else"}, {"fon": "Nǔtɔ́ ɖo hɛn nú mì", "phonetic": "nu-TO do HEN nu MI", "fr": "J'ai besoin du serveur", "en": "I need the waiter"}],
      },
      {
        id: "4-8",
        title: "Révision Restaurant",
        minutes: 8,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "Ah ɖo wɛ ! Nǔ ɖo sɔ a? Nǔtɔ́ ɖo hɛn nú mì?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. Menu ɔ ɖo fí. A ɖo wɔ hwévi ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Bɔ mi tɔ ɖokpo?", "fr": ""}, {"speaker": "IA", "fon": "Akwɛ ɔ, bɔ mi jló.", "fr": ""}, {"speaker": "IA", "fon": "Awǒ nú we ! Mi yì nú !", "fr": ""}],
      },
    ],
  },
  {
    id: "voyage",
    index: 5,
    title: "Voyage",
    titleEn: "Travel",
    color: "#D62828",
    lessons: [
      {
        id: "5-1",
        title: "Les transports",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Nǔyi xwé", "phonetic": "nu-yi XWE", "fr": "Transport", "en": "Transport"}, {"fon": "Monto", "phonetic": "mon-TO", "fr": "Voiture", "en": "Car"}, {"fon": "Moto", "phonetic": "mo-TO", "fr": "Moto", "en": "Motorcycle"}, {"fon": "Tros", "phonetic": "tros", "fr": "Tro-tro (minibus)", "en": "Minibus"}, {"fon": "Gare", "phonetic": "GA-re", "fr": "Gare", "en": "Train station"}, {"fon": "Fífá xwé", "phonetic": "fi-FA xwe", "fr": "Aéroport", "en": "Airport"}, {"fon": "Bato", "phonetic": "ba-TO", "fr": "Bateau", "en": "Boat"}],
      },
      {
        id: "5-2",
        title: "À l'aéroport",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Fífá xwé", "phonetic": "fi-FA xwe", "fr": "Aéroport", "en": "Airport"}, {"fon": "Bilɛti", "phonetic": "bi-LE-ti", "fr": "Billet", "en": "Ticket"}, {"fon": "Paspɔ", "phonetic": "pas-PO", "fr": "Passeport", "en": "Passport"}, {"fon": "Viza", "phonetic": "VI-za", "fr": "Visa", "en": "Visa"}, {"fon": "Nǔxɔ̀ xwé", "phonetic": "nu-xo XWE", "fr": "Bagages", "en": "Luggage"}, {"fon": "Nǔxɔ̀ tɛnmɛ?", "phonetic": "nu-xo ten-ME", "fr": "Où sont mes bagages ?", "en": "Where is my luggage?"}, {"fon": "Fífá ɖo fí?", "phonetic": "fi-FA do FI", "fr": "Où est l'aéroport ?", "en": "Where is the airport?"}],
      },
      {
        id: "5-3",
        title: "À l'hôtel",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Hɔtɛli", "phonetic": "ho-TE-li", "fr": "Hôtel", "en": "Hotel"}, {"fon": "Xwéɖokpo", "phonetic": "xwe-dok-PO", "fr": "Chambre", "en": "Room"}, {"fon": "Xwéɖokpo ɖokpo", "phonetic": "xwe-dok-PO dok-PO", "fr": "Une chambre", "en": "A room"}, {"fon": "Xwéɖokpo wè", "phonetic": "xwe-dok-PO we", "fr": "Deux chambres", "en": "Two rooms"}, {"fon": "Nǔtɔ́ ɖo hɛn nú mì", "phonetic": "nu-TO do HEN nu MI", "fr": "J'ai besoin d'une chambre", "en": "I need a room"}, {"fon": "Akwɛ tɛnmɛ?", "phonetic": "a-KWE ten-ME", "fr": "Combien par nuit ?", "en": "How much per night?"}, {"fon": "Nɔ mi akwɛ ɔ", "phonetic": "no mi a-KWE o", "fr": "Je paie la chambre", "en": "I'll pay for the room"}],
        dialogue: [{"speaker": "Client", "fon": "Ah ɖo wɛ ! Nǔtɔ́ ɖo hɛn nú mì xwéɖokpo ɖokpo.", "fr": "Bonjour ! J'ai besoin d'une chambre."}, {"speaker": "Réception", "fon": "Ɛɛn, akwɛ tɛnmɛ?", "fr": "Oui, pour combien de nuits ?"}, {"speaker": "Client", "fon": "Xwé ɖokpo. Akwɛ tɛnmɛ?", "fr": "Une nuit. Combien ça coûte ?"}, {"speaker": "Réception", "fon": "Akwɛ wǒ ɔ.", "fr": "C'est dix [mille francs]."}, {"speaker": "Client", "fon": "Nǔ nyɔ wɛ. Un nɔ.", "fr": "C'est bon. Je paie."}],
      },
      {
        id: "5-4",
        title: "Directions (1)",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "...ɖo fí?", "phonetic": "do FI", "fr": "Où est ... ?", "en": "Where is ... ?"}, {"fon": "Ðiɖó wɛ", "phonetic": "di-DO we", "fr": "Tout droit", "en": "Straight ahead"}, {"fon": "Azɔn", "phonetic": "a-ZON", "fr": "Gauche", "en": "Left"}, {"fon": "Atɔn", "phonetic": "a-TON", "fr": "Droite", "en": "Right"}, {"fon": "Kpodo", "phonetic": "kpo-DO", "fr": "Près de", "en": "Near"}, {"fon": "Lɛ́ɛdo", "phonetic": "le-EH-do", "fr": "Loin de", "en": "Far from"}, {"fon": "Ðo ... mɛ", "phonetic": "do ... ME", "fr": "Dans / À", "en": "In / At"}],
      },
      {
        id: "5-5",
        title: "Directions (2)",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Nùkɔ", "phonetic": "nu-KO", "fr": "Entrée", "en": "Entrance"}, {"fon": "Nùlɛdo", "phonetic": "nu-le-DO", "fr": "Sortie", "en": "Exit"}, {"fon": "Bló", "phonetic": "blo", "fr": "Ouvert", "en": "Open"}, {"fon": "Kpò", "phonetic": "kpo", "fr": "Fermé", "en": "Closed"}, {"fon": "Un sɔ́ xwé ǎ", "phonetic": "un SO xwe a", "fr": "Je suis perdu(e)", "en": "I'm lost"}, {"fon": "Bɔ mi jló, ...ɖo fí?", "phonetic": "bo mi JLO do FI", "fr": "Svp, où est ... ?", "en": "Please, where is ... ?"}, {"fon": "Nǔ ɖo sɔ a?", "phonetic": "nu do SO a", "fr": "Tu sais ?", "en": "Do you know?"}],
      },
      {
        id: "5-6",
        title: "Les formalités",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Polisi", "phonetic": "po-LI-si", "fr": "Police", "en": "Police"}, {"fon": "Dɔkta xwé", "phonetic": "dok-TA xwe", "fr": "Pharmacie", "en": "Pharmacy"}, {"fon": "Azɔ xwé", "phonetic": "a-ZO xwe", "fr": "Hôpital", "en": "Hospital"}, {"fon": "Banki", "phonetic": "BAN-ki", "fr": "Banque", "en": "Bank"}, {"fon": "Nǔtɔ́ ɖo hɛn nú mì", "phonetic": "nu-TO do HEN nu MI", "fr": "J'ai besoin de ...", "en": "I need ..."}, {"fon": "Nǔxɔ̀ xwé", "phonetic": "nu-xo XWE", "fr": "Bureau des douanes", "en": "Customs office"}, {"fon": "Nǔsɔsɔ xwé", "phonetic": "nu-so-SO xwe", "fr": "Ambassade", "en": "Embassy"}],
      },
      {
        id: "5-7",
        title: "Réserver",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Nǔxɔ̀ ɖo xwé mɛ", "phonetic": "nu-xo do XWE me", "fr": "Réserver", "en": "Book / Reserve"}, {"fon": "Nǔxɔ̀ lɛ́ɛdo", "phonetic": "nu-xo le-EH-do", "fr": "Réservation", "en": "Reservation"}, {"fon": "Nǔxɔ̀ tɛnmɛ?", "phonetic": "nu-xo ten-ME", "fr": "Où est ma réservation ?", "en": "Where is my booking?"}, {"fon": "Nǔxɔ̀ ɖokpo", "phonetic": "nu-xo dok-PO", "fr": "Une place", "en": "A seat"}, {"fon": "Nǔxɔ̀ wè", "phonetic": "nu-xo we", "fr": "Deux places", "en": "Two seats"}, {"fon": "Nǔxɔ̀ kpò", "phonetic": "nu-xo KPO", "fr": "Complet", "en": "Full / Sold out"}, {"fon": "Nǔxɔ̀ bló", "phonetic": "nu-xo blo", "fr": "Disponible", "en": "Available"}],
      },
      {
        id: "5-8",
        title: "Au guichet",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Un hɛn bilɛti", "phonetic": "un HEN bi-LE-ti", "fr": "J'ai besoin d'un billet", "en": "I need a ticket"}, {"fon": "Bilɛti ɖokpo", "phonetic": "bi-LE-ti dok-PO", "fr": "Un aller simple", "en": "One-way ticket"}, {"fon": "Bilɛti wè", "phonetic": "bi-LE-ti we", "fr": "Un aller-retour", "en": "Round-trip ticket"}, {"fon": "Gan ɖokpo", "phonetic": "gan dok-PO", "fr": "Une heure", "en": "One hour"}, {"fon": "Gan wè", "phonetic": "gan we", "fr": "Deux heures", "en": "Two hours"}, {"fon": "Nǔxɔ̀ tɛnmɛ?", "phonetic": "nu-xo ten-ME", "fr": "Quand part le bus ?", "en": "When does the bus leave?"}, {"fon": "Nǔxɔ̀ ɖo fí?", "phonetic": "nu-xo do FI", "fr": "Où est le guichet ?", "en": "Where is the counter?"}],
      },
      {
        id: "5-9",
        title: "En route",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Yi !", "phonetic": "yi", "fr": "Allons-y !", "en": "Let's go !"}, {"fon": "Dò !", "phonetic": "do", "fr": "Arrête !", "en": "Stop !"}, {"fon": "Káká", "phonetic": "ka-KA", "fr": "Vite !", "en": "Fast !"}, {"fon": "Kêtêkêtê", "phonetic": "ke-te-ke-te", "fr": "Doucement", "en": "Slowly"}, {"fon": "Nǔ nyɔ wɛ", "phonetic": "nu NYO WE", "fr": "C'est bon (on y va)", "en": "It's good (let's go)"}, {"fon": "Nǔ kpɔ́ wɛ", "phonetic": "nu KPO WE", "fr": "C'est loin", "en": "It's far"}, {"fon": "Nǔ kpɔ́ wɛ ɖéɖé", "phonetic": "nu KPO WE de-DE", "fr": "C'est très loin", "en": "It's very far"}],
      },
      {
        id: "5-10",
        title: "Révision Voyage",
        minutes: 8,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "Ah ɖo wɛ ! A ɖo sɔ a? A ɖó fífá xwé ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. Hɔtɛli ɖo fí?", "fr": ""}, {"speaker": "IA", "fon": "Akwɛ tɛnmɛ? Nǔtɔ́ ɖo hɛn nú mì xwéɖokpo?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Mi yì nú !", "fr": ""}],
      },
    ],
  },
  {
    id: "urgences",
    index: 6,
    title: "Urgences",
    titleEn: "Emergencies",
    color: "#8C3FBF",
    lessons: [
      {
        id: "6-1",
        title: "Appeler à l'aide",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Kpɔ́n mi dó!", "phonetic": "kpon mi DO", "fr": "Au secours !", "en": "Help !"}, {"fon": "Kpɔ́n ɖo hɛn nú mì", "phonetic": "kpon do HEN nu MI", "fr": "J'ai besoin d'aide", "en": "I need help"}, {"fon": "Polisi ylɔ!", "phonetic": "po-LI-si YLO", "fr": "Appelez la police !", "en": "Call the police !"}, {"fon": "Ambulance ylɔ!", "phonetic": "am-bu-LANS YLO", "fr": "Appelez une ambulance !", "en": "Call an ambulance !"}, {"fon": "Dɔkta ylɔ!", "phonetic": "dok-TA YLO", "fr": "Appelez un docteur !", "en": "Call a doctor !"}, {"fon": "Fó!", "phonetic": "fo", "fr": "Au feu !", "en": "Fire !"}, {"fon": "Jó!", "phonetic": "jo", "fr": "Arrêtez !", "en": "Stop !"}],
      },
      {
        id: "6-2",
        title: "À l'hôpital",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Azɔ xwé", "phonetic": "a-ZO xwe", "fr": "Hôpital", "en": "Hospital"}, {"fon": "Dɔkta", "phonetic": "dok-TA", "fr": "Docteur", "en": "Doctor"}, {"fon": "Azɔn ɖo nú mì", "phonetic": "a-ZON do nu MI", "fr": "Je suis malade", "en": "I'm sick"}, {"fon": "Nǔtɔ́ ɖo hɛn nú mì", "phonetic": "nu-TO do HEN nu MI", "fr": "J'ai besoin d'un docteur", "en": "I need a doctor"}, {"fon": "Nǔ e hɛn mì nú", "phonetic": "nu e HEN mi NU", "fr": "Ça fait mal", "en": "It hurts"}, {"fon": "Nǔ e hɛn nú mì", "phonetic": "nu e HEN nu MI", "fr": "J'ai mal à ...", "en": "I have pain in ..."}, {"fon": "Nǔ kpɔ́ wɛ", "phonetic": "nu KPO WE", "fr": "C'est grave", "en": "It's serious"}],
        dialogue: [{"speaker": "Patient", "fon": "Kpɔ́n mi dó ! Azɔn ɖo nú mì !", "fr": "Au secours ! Je suis malade !"}, {"speaker": "Infirmier", "fon": "Nǔ e hɛn nú mì?", "fr": "Où as-tu mal ?"}, {"speaker": "Patient", "fon": "Nǔ e hɛn nú mì ta mɛ.", "fr": "J'ai mal à la tête."}, {"speaker": "Infirmier", "fon": "Nǔ nyɔ. Dɔkta ɖo hɛn.", "fr": "D'accord. Le docteur arrive."}],
      },
      {
        id: "6-3",
        title: "Symptômes",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Nǔ e hɛn nú mì ta mɛ", "phonetic": "nu e HEN nu MI ta ME", "fr": "J'ai mal à la tête", "en": "I have a headache"}, {"fon": "Nǔ e hɛn nú mì vɛ mɛ", "phonetic": "nu e HEN nu MI ve ME", "fr": "J'ai mal à la gorge", "en": "I have a sore throat"}, {"fon": "Nǔ e hɛn nú mì hun mɛ", "phonetic": "nu e HEN nu MI hun ME", "fr": "J'ai mal au cœur / J'ai des nausées", "en": "I feel nauseous"}, {"fon": "Nǔ e hɛn nú mì awa mɛ", "phonetic": "nu e HEN nu MI a-wa ME", "fr": "J'ai mal au bras", "en": "My arm hurts"}, {"fon": "Azɔn ɖo nú mì", "phonetic": "a-ZON do nu MI", "fr": "Je suis malade", "en": "I'm sick"}, {"fon": "Azɔn kpɔ́ ɖo nú mì", "phonetic": "a-ZON KPO do nu MI", "fr": "Je suis très malade", "en": "I'm very sick"}, {"fon": "Tɔví ɖo nú mì", "phonetic": "to-VI do nu MI", "fr": "J'ai soif (fièvre)", "en": "I'm thirsty (fever)"}],
      },
      {
        id: "6-4",
        title: "À la pharmacie",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Dɔkta xwé", "phonetic": "dok-TA xwe", "fr": "Pharmacie", "en": "Pharmacy"}, {"fon": "Nǔtɔ́ ɖo hɛn nú mì", "phonetic": "nu-TO do HEN nu MI", "fr": "J'ai besoin de médicaments", "en": "I need medicine"}, {"fon": "Nǔtɔ́ ɖokpo", "phonetic": "nu-TO dok-PO", "fr": "Un médicament", "en": "A medicine"}, {"fon": "Nǔtɔ́ tɔ́", "phonetic": "nu-TO TO", "fr": "Comprimé", "en": "Pill"}, {"fon": "Nǔtɔ́ tɔvi", "phonetic": "nu-TO to-VI", "fr": "Sirop", "en": "Syrup"}, {"fon": "Nǔtɔ́ fífá", "phonetic": "nu-TO fi-FA", "fr": "Pommade", "en": "Ointment"}, {"fon": "Nǔtɔ́ nyɔ", "phonetic": "nu-TO NYO", "fr": "Bon médicament", "en": "Good medicine"}],
      },
      {
        id: "6-5",
        title: "Vol et sécurité",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Awɔvitɔ!", "phonetic": "a-wo-vi-TO", "fr": "Au voleur !", "en": "Thief !"}, {"fon": "Ye ɖu nú mì", "phonetic": "ye ɖu nu MI", "fr": "On m'a volé", "en": "I've been robbed"}, {"fon": "Ye wli adjoto", "phonetic": "ye wli a-djo-to", "fr": "On a attrapé le voleur", "en": "They caught the thief"}, {"fon": "Nǔxɔ̀ xwé", "phonetic": "nu-xo XWE", "fr": "Mes bagages", "en": "My luggage"}, {"fon": "Nǔxɔ̀ ye ɖu", "phonetic": "nu-xo ye ɖu", "fr": "Mes affaires ont été volées", "en": "My things were stolen"}, {"fon": "Polisi ɖo fí?", "phonetic": "po-LI-si do FI", "fr": "Où est la police ?", "en": "Where is the police?"}, {"fon": "Nǔtɔ́ ɖo hɛn nú mì", "phonetic": "nu-TO do HEN nu MI", "fr": "J'ai besoin d'aide", "en": "I need help"}],
      },
      {
        id: "6-6",
        title: "Accident",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Kɔ kpó kpó", "phonetic": "ko KPO kpo", "fr": "Urgence", "en": "Emergency"}, {"fon": "Hwɛ́wuwu", "phonetic": "hweh-WU-wu", "fr": "Danger", "en": "Danger"}, {"fon": "Monto kɔ", "phonetic": "mon-TO ko", "fr": "Accident de voiture", "en": "Car accident"}, {"fon": "Nǔ e hɛn nú mì", "phonetic": "nu e HEN nu MI", "fr": "Je suis blessé", "en": "I'm injured"}, {"fon": "Nǔ e hɛn nú mì kpɔ́", "phonetic": "nu e HEN nu MI KPO", "fr": "Je suis gravement blessé", "en": "I'm seriously injured"}, {"fon": "Ambulance ɖo fí?", "phonetic": "am-bu-LANS do FI", "fr": "Où est l'ambulance ?", "en": "Where is the ambulance?"}, {"fon": "Yì!", "phonetic": "yi", "fr": "Allez-vous-en !", "en": "Go away !"}],
      },
      {
        id: "6-7",
        title: "Perte d'objets",
        minutes: 5,
        kind: "vocab",
        vocab: [{"fon": "Nǔxɔ̀ xwé ye lɛ", "phonetic": "nu-xo XWE ye le", "fr": "J'ai perdu mes affaires", "en": "I lost my things"}, {"fon": "Paspɔ ye lɛ", "phonetic": "pas-PO ye le", "fr": "J'ai perdu mon passeport", "en": "I lost my passport"}, {"fon": "Telefɔni ye lɛ", "phonetic": "te-le-FO-ni ye le", "fr": "J'ai perdu mon téléphone", "en": "I lost my phone"}, {"fon": "Akouwè ye lɛ", "phonetic": "a-kou-WE ye le", "fr": "J'ai perdu mon argent", "en": "I lost my money"}, {"fon": "Nǔxɔ̀ ɖo fí?", "phonetic": "nu-xo do FI", "fr": "Où sont mes affaires ?", "en": "Where are my things?"}, {"fon": "Nǔtɔ́ ɖo hɛn nú mì", "phonetic": "nu-TO do HEN nu MI", "fr": "J'ai besoin d'aide", "en": "I need help"}, {"fon": "Nǔ ɖo sɔ a?", "phonetic": "nu do SO a", "fr": "Tu sais ?", "en": "Do you know?"}],
      },
      {
        id: "6-8",
        title: "Révision Urgences",
        minutes: 8,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "Kpɔ́n mi dó ! Nǔ ɖo sɔ a?", "fr": ""}, {"speaker": "IA", "fon": "Azɔn ɖo nú mì? Nǔ e hɛn nú mì?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. Dɔkta xwé ɖo fí?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Kpɔ́n ɖo hɛn nú mì!", "fr": ""}],
      },
    ],
  },
  {
    id: "conversations",
    index: 7,
    title: "Conversations avec l’IA",
    titleEn: "AI conversations",
    color: "#0FA3A3",
    lessons: [
      {
        id: "7-1",
        title: "Présentation approfondie",
        minutes: 7,
        kind: "ai",
        vocab: [{"fon": "Nǔsɔ xwé", "phonetic": "", "fr": "École", "en": "École"}, {"fon": "Nǔ wlan", "phonetic": "", "fr": "Travail", "en": "Strategy"}, {"fon": "Fofo", "phonetic": "", "fr": "Père", "en": "Père"}, {"fon": "Na", "phonetic": "", "fr": "Mère", "en": "Mère"}, {"fon": "Nǔ ɖo sɔ a?", "phonetic": "", "fr": "Comment vas-tu ?", "en": "Comment vas-tu ?"}],
        aiTurns: [{"speaker": "IA", "fon": "Ah ɖo wɛ ! Àzán kplé nǔ wɛ? Nǔ ɖo sɔ a?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. A ɖó nǔsɔ xwé ɖó? A ɖó nǔ wlan ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Fofo ɖo fí? Na ɖo fí?", "fr": ""}, {"speaker": "IA", "fon": "Un jló mɔ we ! Mi yì nú !", "fr": ""}],
      },
      {
        id: "7-2",
        title: "Parler de soi",
        minutes: 7,
        kind: "ai",
        vocab: [{"fon": "Gan ɖokpo", "phonetic": "", "fr": "Une heure", "en": "Une heure"}, {"fon": "Nǔ wlan ɖo fí", "phonetic": "", "fr": "Où travailles-tu ?", "en": "Où travailles-tu ?"}, {"fon": "Ðu nǔ", "phonetic": "", "fr": "Nourriture", "en": "Nourriture"}, {"fon": "Ðu nǔ ɖéɖé wɛ", "phonetic": "", "fr": "Tu as mangé ?", "en": "Tu as mangé ?"}],
        aiTurns: [{"speaker": "IA", "fon": "Égbé nǔ ɖo sɔ a? A ɖó nǔsɔ xwé ɖó gan ɖokpo?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. A ɖó nǔ wlan ɖó? Nǔ wlan ɖo fí?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Ðu nǔ ɖéɖé wɛ?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ ! Mi yì nú !", "fr": ""}],
      },
      {
        id: "7-3",
        title: "Parler de la famille",
        minutes: 7,
        kind: "ai",
        vocab: [{"fon": "Mɛxó", "phonetic": "", "fr": "Frère aîné", "en": "Elder brother"}, {"fon": "Ví", "phonetic": "", "fr": "Enfant", "en": "Enfant"}, {"fon": "Honton", "phonetic": "", "fr": "Ami", "en": "Friend"}, {"fon": "ɖo fí", "phonetic": "", "fr": "où est", "en": "où est"}],
        aiTurns: [{"speaker": "IA", "fon": "Fofo ɖo fí? Na ɖo fí?", "fr": ""}, {"speaker": "IA", "fon": "Mɛxó ɖo fí? Ví ɖo fí?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Honton ɖo fí?", "fr": ""}, {"speaker": "IA", "fon": "Un jló mɔ we !", "fr": ""}],
      },
      {
        id: "7-4",
        title: "Parler des goûts",
        minutes: 7,
        kind: "ai",
        vocab: [{"fon": "A ɖó ... ɖó", "phonetic": "", "fr": "Aimes-tu ... ?", "en": "Aimes-tu ... ?"}, {"fon": "Hwévi", "phonetic": "", "fr": "Poisson", "en": "Poisson"}, {"fon": "Flo", "phonetic": "", "fr": "Viande", "en": "Meat"}, {"fon": "Tɔvi wɛ", "phonetic": "", "fr": "Épicé", "en": "Spicy"}, {"fon": "Nǔ nyɔ", "phonetic": "", "fr": "Sucré", "en": "Sweet"}],
        aiTurns: [{"speaker": "IA", "fon": "A ɖó hwévi ɖó? A ɖó flo ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. A ɖó tɔvi wɛ ɖó? A ɖó nǔ nyɔ ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. A ɖó bière ɖó? A ɖó kafé ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ !", "fr": ""}],
      },
      {
        id: "7-5",
        title: "Parler du voyage",
        minutes: 7,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "A ɖó fífá xwé ɖó? A ɖó hɔtɛli ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. Akwɛ tɛnmɛ? Nǔxɔ̀ ɖo hɛn a?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. A ɖó gare ɖó? A ɖó monto ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ ! Mi yì nú !", "fr": ""}],
      },
      {
        id: "7-6",
        title: "Parler du travail",
        minutes: 7,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "Nǔ wlan ɖo fí? Nǔtɔ́ ɖo hɛn a?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. A ɖó agun xwé ɖó? A ɖó bɔ xwé ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Nǔ wlan nyɔ wɛ a?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ !", "fr": ""}],
      },
      {
        id: "7-7",
        title: "Parler du marché",
        minutes: 7,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "A ɖó aximɛ ɖó? Akwɛ tɛnmɛ?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. A xɔ̀ nǔtɔ́ ɖéɖé? A xɔ̀ nǔɖo ɖéɖé?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Nǔtɔ́ nyɔ wɛ a?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ !", "fr": ""}],
      },
      {
        id: "7-8",
        title: "Parler du restaurant",
        minutes: 7,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "A ɖó ðu nǔ xwé ɖó? A ɖó wɔ hwévi ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. A ɖó wɔ flo ɖó? A ɖó wɔ azign ɖó?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Akwɛ tɛnmɛ?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ !", "fr": ""}],
      },
      {
        id: "7-9",
        title: "Parler des urgences",
        minutes: 7,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "Nǔ ɖo sɔ a? Azɔn ɖo nú mì?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. Nǔ e hɛn nú mì? Nǔtɔ́ ɖo hɛn a?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Dɔkta xwé ɖo fí?", "fr": ""}, {"speaker": "IA", "fon": "Kpɔ́n ɖo hɛn nú mì !", "fr": ""}],
      },
      {
        id: "7-10",
        title: "Révision Conversations IA",
        minutes: 8,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "Ah ɖo wɛ ! Àzán kplé nǔ wɛ?", "fr": ""}, {"speaker": "IA", "fon": "[réponse contextuelle basée sur l'entrée]", "fr": ""}, {"speaker": "IA", "fon": "[réponse contextuelle]", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ ! Mi yì nú !", "fr": ""}],
      },
    ],
  },
  {
    id: "professionnel",
    index: 8,
    title: "Professionnel",
    titleEn: "Professional",
    color: "#7A5230",
    lessons: [
      {
        id: "8-1",
        title: "Au bureau",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Bɔ xwé", "phonetic": "bo XWE", "fr": "Bureau", "en": "Office"}, {"fon": "Nǔtɔ́", "phonetic": "nu-TO", "fr": "Manager / Chef", "en": "Manager"}, {"fon": "Nǔsɔsɔ", "phonetic": "nu-so-SO", "fr": "Collègue", "en": "Colleague"}, {"fon": "Agun xwé", "phonetic": "a-GUN xwe", "fr": "Réunion", "en": "Meeting"}, {"fon": "Nǔ wlan", "phonetic": "nu WLAN", "fr": "Travail", "en": "Work"}, {"fon": "Nǔ wlan xwé", "phonetic": "nu WLAN xwe", "fr": "Lieu de travail", "en": "Workplace"}, {"fon": "Nǔ wlan ɖokpo", "phonetic": "nu WLAN dok-PO", "fr": "Une tâche", "en": "A task"}],
      },
      {
        id: "8-2",
        title: "La réunion",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Agun xwé", "phonetic": "a-GUN xwe", "fr": "Réunion", "en": "Meeting"}, {"fon": "Nǔsɔ gbɛ", "phonetic": "nu-SO gbe", "fr": "Contrat", "en": "Contract"}, {"fon": "Nǔ sɔ", "phonetic": "nu SO", "fr": "Accord", "en": "Agreement"}, {"fon": "Nǔ wlan", "phonetic": "nu WLAN", "fr": "Stratégie", "en": "Strategy"}, {"fon": "Xó bló", "phonetic": "xo BLO", "fr": "Rapport", "en": "Report"}, {"fon": "Akwɛ gbɛkɔ", "phonetic": "a-KWE gbe-KO", "fr": "Budget", "en": "Budget"}, {"fon": "Hwenu ɖebǔ", "phonetic": "HWE-nu DE-bu", "fr": "Date limite", "en": "Deadline"}],
        dialogue: [{"speaker": "A", "fon": "Agun xwé ɖo hwenu ɖebǔ?", "fr": "La réunion est à quelle heure ?"}, {"speaker": "B", "fon": "Agun xwé ɖo gan wè.", "fr": "La réunion est à deux heures."}, {"speaker": "A", "fon": "Nǔ nyɔ. Xó bló ɖo fí?", "fr": "D'accord. Où est le rapport ?"}, {"speaker": "B", "fon": "Xó bló ɖo bɔ xwé mɛ.", "fr": "Le rapport est au bureau."}, {"speaker": "A", "fon": "Nǔ nyɔ wɛ.", "fr": "C'est bon."}],
      },
      {
        id: "8-3",
        title: "Le contrat",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Nǔsɔ gbɛ", "phonetic": "nu-SO gbe", "fr": "Contrat", "en": "Contract"}, {"fon": "Nǔ sɔ", "phonetic": "nu SO", "fr": "Accord", "en": "Agreement"}, {"fon": "Nǔsɔsɔ", "phonetic": "nu-so-SO", "fr": "Signature", "en": "Signature"}, {"fon": "Nǔsɔsɔ xwé", "phonetic": "nu-so-SO xwe", "fr": "Document", "en": "Document"}, {"fon": "Nǔsɔ bló", "phonetic": "nu-SO blo", "fr": "Ouvrir le contrat", "en": "Open the contract"}, {"fon": "Nǔsɔ kpò", "phonetic": "nu-SO kpo", "fr": "Fermer le contrat", "en": "Close the contract"}, {"fon": "Nǔsɔ nɔ", "phonetic": "nu-SO no", "fr": "Payer le contrat", "en": "Pay the contract"}],
      },
      {
        id: "8-4",
        title: "L'email professionnel",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Email", "phonetic": "EE-mel", "fr": "Email", "en": "Email"}, {"fon": "Email ylɔ", "phonetic": "EE-mel ylo", "fr": "Envoyer un email", "en": "Send an email"}, {"fon": "Email xɔ̀", "phonetic": "EE-mel xo", "fr": "Recevoir un email", "en": "Receive an email"}, {"fon": "Email bló", "phonetic": "EE-mel blo", "fr": "Ouvrir un email", "en": "Open an email"}, {"fon": "Email xó", "phonetic": "EE-mel xo", "fr": "Répondre à un email", "en": "Reply to an email"}, {"fon": "Email nǔtɔ́", "phonetic": "EE-mel nu-TO", "fr": "Pièce jointe", "en": "Attachment"}, {"fon": "Email nǔtɔ́ ɖokpo", "phonetic": "EE-mel nu-TO dok-PO", "fr": "Un fichier", "en": "A file"}],
      },
      {
        id: "8-5",
        title: "La négociation",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Nǔsɔsɔ", "phonetic": "nu-so-SO", "fr": "Négociation", "en": "Negotiation"}, {"fon": "Akwɛ tɛnmɛ?", "phonetic": "a-KWE ten-ME", "fr": "Combien ?", "en": "How much?"}, {"fon": "Akwɛ ɖokpo", "phonetic": "a-KWE dok-PO", "fr": "Un prix", "en": "A price"}, {"fon": "Akwɛ wè", "phonetic": "a-KWE we", "fr": "Deux prix", "en": "Two prices"}, {"fon": "Nǔ nyɔ wɛ", "phonetic": "nu NYO WE", "fr": "Bon prix", "en": "Good price"}, {"fon": "Nǔ kpɔ́ wɛ", "phonetic": "nu KPO WE", "fr": "Prix élevé", "en": "High price"}, {"fon": "Bɔ mi jló akwɛ", "phonetic": "bo mi JLO a-KWE", "fr": "Fais-moi un prix", "en": "Give me a price"}],
        dialogue: [{"speaker": "A", "fon": "Nǔsɔsɔ ɖo hwenu?", "fr": "La négociation est à quelle heure ?"}, {"speaker": "B", "fon": "Nǔsɔsɔ ɖo gan atɔn.", "fr": "La négociation est à trois heures."}, {"speaker": "A", "fon": "Nǔ nyɔ. Akwɛ tɛnmɛ?", "fr": "D'accord. Combien ?"}, {"speaker": "B", "fon": "Akwɛ wǒ ɔ.", "fr": "C'est dix."}, {"speaker": "A", "fon": "Nǔ kpɔ́ wɛ ! Bɔ mi jló.", "fr": "C'est cher ! Fais-moi un prix."}, {"speaker": "B", "fon": "Ɛɛn, akwɛ enɛ ɔ.", "fr": "D'accord, c'est quatre."}, {"speaker": "A", "fon": "Nǔ nyɔ wɛ. Nǔ sɔ !", "fr": "C'est bon. Accord !"}],
      },
      {
        id: "8-6",
        title: "La présentation",
        minutes: 7,
        kind: "vocab",
        vocab: [{"fon": "Nǔsɔsɔ xwé", "phonetic": "nu-so-SO xwe", "fr": "Présentation", "en": "Presentation"}, {"fon": "Nǔtɔ́ ɖokpo", "phonetic": "nu-TO dok-PO", "fr": "Un projet", "en": "A project"}, {"fon": "Nǔ wlan", "phonetic": "nu WLAN", "fr": "Stratégie", "en": "Strategy"}, {"fon": "Xó bló", "phonetic": "xo BLO", "fr": "Rapport", "en": "Report"}, {"fon": "Nǔsɔsɔ bló", "phonetic": "nu-so-SO blo", "fr": "Commencer la présentation", "en": "Start the presentation"}, {"fon": "Nǔsɔsɔ kpò", "phonetic": "nu-so-SO kpo", "fr": "Terminer la présentation", "en": "End the presentation"}, {"fon": "Nǔ nyɔ wɛ", "phonetic": "nu NYO WE", "fr": "C'est bien", "en": "It's good"}],
      },
      {
        id: "8-7",
        title: "Le paiement",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Akwɛ nɔ", "phonetic": "a-KWE no", "fr": "Paiement", "en": "Payment"}, {"fon": "Akwɛ xó", "phonetic": "a-KWE xo", "fr": "Facture", "en": "Invoice"}, {"fon": "Akwɛ lɛ́ɛdo", "phonetic": "a-KWE le-EH-do", "fr": "Monnaie", "en": "Change"}, {"fon": "Banki", "phonetic": "BAN-ki", "fr": "Banque", "en": "Bank"}, {"fon": "Nɔ akwɛ", "phonetic": "no a-KWE", "fr": "Payer", "en": "Pay"}, {"fon": "Nɔ akwɛ ɖokpo", "phonetic": "no a-KWE dok-PO", "fr": "Payer une facture", "en": "Pay a bill"}, {"fon": "Nǔ nɔ wɛ", "phonetic": "nu no WE", "fr": "Payé", "en": "Paid"}],
      },
      {
        id: "8-8",
        title: "Le téléphone",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Telefɔni", "phonetic": "te-le-FO-ni", "fr": "Téléphone", "en": "Phone"}, {"fon": "Telefɔni ylɔ", "phonetic": "te-le-FO-ni ylo", "fr": "Appeler", "en": "Call"}, {"fon": "Telefɔni xɔ̀", "phonetic": "te-le-FO-ni xo", "fr": "Répondre", "en": "Answer"}, {"fon": "Telefɔni kpò", "phonetic": "te-le-FO-ni kpo", "fr": "Raccrocher", "en": "Hang up"}, {"fon": "Telefɔni nǔtɔ́", "phonetic": "te-le-FO-ni nu-TO", "fr": "Message", "en": "Message"}, {"fon": "Telefɔni nǔtɔ́ ylɔ", "phonetic": "te-le-FO-ni nu-TO ylo", "fr": "Envoyer un message", "en": "Send a message"}, {"fon": "Telefɔni nǔtɔ́ xɔ̀", "phonetic": "te-le-FO-ni nu-TO xo", "fr": "Recevoir un message", "en": "Receive a message"}],
      },
      {
        id: "8-9",
        title: "Le planning",
        minutes: 6,
        kind: "vocab",
        vocab: [{"fon": "Hwenu", "phonetic": "HWE-nu", "fr": "Temps / Planning", "en": "Time / Schedule"}, {"fon": "Hwenu ɖebǔ", "phonetic": "HWE-nu DE-bu", "fr": "Date limite", "en": "Deadline"}, {"fon": "Hwenu ɖokpo", "phonetic": "HWE-nu dok-PO", "fr": "Un moment", "en": "A moment"}, {"fon": "Hwenu wè", "phonetic": "HWE-nu we", "fr": "Deux moments", "en": "Two moments"}, {"fon": "Hwenu ɖo fí?", "phonetic": "HWE-nu do FI", "fr": "Quand ?", "en": "When?"}, {"fon": "Hwenu tɛ ɖo?", "phonetic": "HWE-nu te DO", "fr": "Quelle heure est-il ?", "en": "What time is it?"}, {"fon": "Nǔtɔ́ ɖo hwenu?", "phonetic": "nu-TO do HWE-nu", "fr": "À quelle heure ?", "en": "At what time?"}],
      },
      {
        id: "8-10",
        title: "Révision Professionnel",
        minutes: 8,
        kind: "ai",
        vocab: [],
        aiTurns: [{"speaker": "IA", "fon": "Ah ɖo wɛ ! Agun xwé ɖo hwenu?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. Xó bló ɖo fí?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ. Nǔsɔsɔ ɖo hwenu?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ. Akwɛ tɛnmɛ?", "fr": ""}, {"speaker": "IA", "fon": "Nǔ nyɔ wɛ ! Mi yì nú !", "fr": ""}],
      },
    ],
  },
];
