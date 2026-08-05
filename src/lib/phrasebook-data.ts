export type PhraseEntry = {
  fon: string;
  fr: string;
  en: string;
  phonetic?: string;
};

export type PhraseCategory = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  entries: PhraseEntry[];
};

export const PHRASEBOOK: PhraseCategory[] = [
  {
    id: "salutations",
    title: "Salutations",
    titleEn: "Greetings",
    description: "Ouvrir la conversation avec respect au Bénin.",
    entries: [
      { fon: "A fɔ́n gánjí à ?", fr: "Bonjour (le matin)", en: "Good morning", phonetic: "a fon gan-dji a" },
      { fon: "Kúabɔ̀", fr: "Bienvenue", en: "Welcome", phonetic: "kou-a-bo" },
      { fon: "A ɖo gánjí à ?", fr: "Comment vas-tu ?", en: "How are you?", phonetic: "a do gan-dji a" },
      { fon: "Un ɖo mɔ", fr: "Je vais bien", en: "I'm fine", phonetic: "oun do mon" },
      { fon: "Ódabɔ̀", fr: "Au revoir", en: "Goodbye", phonetic: "o-da-bo" },
      { fon: "Zǎn ɖagbe", fr: "Bonne nuit", en: "Good night", phonetic: "zan da-gbé" },
      { fon: "Nɛ̌ xwédó towe ka ɖe ?", fr: "Comment va ta famille ?", en: "How is your family?", phonetic: "nè khwé-do to-wé ka dè" },
    ],
  },
  {
    id: "politesse",
    title: "Politesse",
    titleEn: "Courtesy",
    description: "Les formules indispensables du quotidien.",
    entries: [
      { fon: "Awǎnú", fr: "Merci", en: "Thank you", phonetic: "a-wa-nou" },
      { fon: "Awǎnú tawun", fr: "Merci beaucoup", en: "Thank you very much", phonetic: "a-wa-nou ta-woun" },
      { fon: "Kɛnklɛn", fr: "S'il te plaît", en: "Please", phonetic: "kèn-klèn" },
      { fon: "Kɛnklɛn, jó nú mì", fr: "Pardon, excuse-moi", en: "Sorry, excuse me", phonetic: "kèn-klèn, dyo nou mi" },
      { fon: "Ɛɛn", fr: "Oui", en: "Yes", phonetic: "èèn" },
      { fon: "Éeo", fr: "Non", en: "No", phonetic: "é-é-o" },
      { fon: "Un se mɔ̌ ǎ", fr: "Je ne comprends pas", en: "I don't understand", phonetic: "oun sé mon a" },
      { fon: "Ðɔ xó blɛblɛ", fr: "Parle lentement", en: "Speak slowly", phonetic: "do kho blè-blè" },
    ],
  },
  {
    id: "presentation",
    title: "Se présenter",
    titleEn: "Introducing yourself",
    description: "Dire qui vous êtes et d'où vous venez.",
    entries: [
      { fon: "Nɛ̌ nyikɔ towe nyí ?", fr: "Comment t'appelles-tu ?", en: "What is your name?", phonetic: "nè nyi-ko to-wé nyi" },
      { fon: "Nyikɔ ce nyí…", fr: "Je m'appelle…", en: "My name is…", phonetic: "nyi-ko tché nyi" },
      { fon: "Un gosin Falansé", fr: "Je viens de France", en: "I come from France", phonetic: "oun go-sin fa-lan-sé" },
      { fon: "Un ɖo Kutɔnu", fr: "Je suis à Cotonou", en: "I am in Cotonou", phonetic: "oun do kou-to-nou" },
      { fon: "Un ɖò fɔngbè kplɔ́n wɛ", fr: "J'apprends le fon", en: "I am learning Fon", phonetic: "oun do fon-gbè klon wè" },
      { fon: "A nɔ ɖɔ glɛnsigbe à ?", fr: "Parles-tu anglais ?", en: "Do you speak English?", phonetic: "a no do glèn-si-gbé a" },
    ],
  },
  {
    id: "nombres",
    title: "Nombres",
    titleEn: "Numbers",
    description: "Compter au marché et dans les transports.",
    entries: [
      { fon: "Ðokpó", fr: "Un (1)", en: "One (1)", phonetic: "do-kpo" },
      { fon: "Wè", fr: "Deux (2)", en: "Two (2)", phonetic: "wè" },
      { fon: "Atɔn", fr: "Trois (3)", en: "Three (3)", phonetic: "a-ton" },
      { fon: "Ɛnɛ", fr: "Quatre (4)", en: "Four (4)", phonetic: "è-nè" },
      { fon: "Atɔɔn", fr: "Cinq (5)", en: "Five (5)", phonetic: "a-to-on" },
      { fon: "Ayizɛ́n", fr: "Six (6)", en: "Six (6)", phonetic: "a-yi-zèn" },
      { fon: "Tɛnwe", fr: "Sept (7)", en: "Seven (7)", phonetic: "tèn-wé" },
      { fon: "Tantɔn", fr: "Huit (8)", en: "Eight (8)", phonetic: "tan-ton" },
      { fon: "Tɛnnɛ", fr: "Neuf (9)", en: "Nine (9)", phonetic: "tèn-nè" },
      { fon: "Wǒ", fr: "Dix (10)", en: "Ten (10)", phonetic: "wo" },
    ],
  },
  {
    id: "marche",
    title: "Marché & achats",
    titleEn: "Market & shopping",
    description: "Négocier à Dantokpa comme un habitué.",
    entries: [
      { fon: "Nabí wɛ ?", fr: "Combien ça coûte ?", en: "How much is it?", phonetic: "na-bi wè" },
      { fon: "Axi ɔ vɛ́ dín", fr: "C'est trop cher", en: "It's too expensive", phonetic: "a-khi o vé din" },
      { fon: "Ðe axi ɔ kpɛɖé", fr: "Baisse un peu le prix", en: "Lower the price a little", phonetic: "dé a-khi o kpè-dé" },
      { fon: "Un jló na xɔ", fr: "Je veux acheter", en: "I want to buy", phonetic: "oun dylo na kho" },
      { fon: "Axi", fr: "Le marché", en: "The market", phonetic: "a-khi" },
      { fon: "Akwɛ́", fr: "L'argent", en: "Money", phonetic: "a-kwé" },
      { fon: "Un jló ǎ", fr: "Je n'en veux pas", en: "I don't want it", phonetic: "oun dylo a" },
    ],
  },
  {
    id: "transport",
    title: "Transport",
    titleEn: "Getting around",
    description: "Zémidjan, taxi et orientation en ville.",
    entries: [
      { fon: "Zɛmidjan", fr: "Taxi-moto", en: "Motorbike taxi", phonetic: "zé-mi-djan" },
      { fon: "Kplá mì yì…", fr: "Emmène-moi à…", en: "Take me to…", phonetic: "kpla mi yi" },
      { fon: "Fitɛ… ɖè ?", fr: "Où se trouve… ?", en: "Where is…?", phonetic: "fi-tè… dè" },
      { fon: "Nɔ te fí", fr: "Arrête-toi ici", en: "Stop here", phonetic: "no té fi" },
      { fon: "Zɔn blɛblɛ", fr: "Roule doucement", en: "Drive slowly", phonetic: "zon blè-blè" },
      { fon: "Ali ɔ lín à ?", fr: "Est-ce loin ?", en: "Is it far?", phonetic: "a-li o lin a" },
    ],
  },
  {
    id: "restauration",
    title: "Manger & boire",
    titleEn: "Food & drink",
    description: "Commander un repas béninois.",
    entries: [
      { fon: "Sìn", fr: "De l'eau", en: "Water", phonetic: "sin" },
      { fon: "Nùɖuɖu", fr: "De la nourriture", en: "Food", phonetic: "nou-dou-dou" },
      { fon: "Mɔ̀lìnkún", fr: "Du riz", en: "Rice", phonetic: "mo-lin-koun" },
      { fon: "Un ɖo xovɛ́ sìn wɛ", fr: "J'ai faim", en: "I am hungry", phonetic: "oun do kho-vé sin wè" },
      { fon: "Sìn ɖo hu mì wɛ", fr: "J'ai soif", en: "I am thirsty", phonetic: "sin do hou mi wè" },
      { fon: "É víví tawun", fr: "C'est délicieux", en: "It's delicious", phonetic: "é vi-vi ta-woun" },
      { fon: "Ma dó tɛn kpɔ́n ǎ", fr: "Pas trop pimenté", en: "Not too spicy", phonetic: "ma do tèn kpon a" },
    ],
  },
  {
    id: "hebergement",
    title: "Hébergement",
    titleEn: "Accommodation",
    description: "À l'hôtel ou chez l'habitant.",
    entries: [
      { fon: "Xɔ", fr: "Une chambre", en: "A room", phonetic: "kho" },
      { fon: "Un jló xɔ ɖokpó", fr: "Je voudrais une chambre", en: "I would like a room", phonetic: "oun dylo kho do-kpo" },
      { fon: "Sìn ɖo à ?", fr: "Y a-t-il de l'eau ?", en: "Is there water?", phonetic: "sin do a" },
      { fon: "Zogbɛ́n ɔ nɔ kú à ?", fr: "L'électricité coupe-t-elle ?", en: "Does the power go out?", phonetic: "zo-gbén o no kou a" },
      { fon: "Zǎn nabí wɛ ?", fr: "Combien pour une nuit ?", en: "How much per night?", phonetic: "zan na-bi wè" },
    ],
  },
  {
    id: "urgence",
    title: "Santé & urgence",
    titleEn: "Health & emergency",
    description: "Les phrases à connaître en cas de problème.",
    entries: [
      { fon: "Gɔ́ alɔ nú mì !", fr: "Aide-moi !", en: "Help me!", phonetic: "go a-lo nou mi" },
      { fon: "Un ɖo azɔn jɛ", fr: "Je suis malade", en: "I am sick", phonetic: "oun do a-zon dyè" },
      { fon: "Dotóoxwé", fr: "L'hôpital", en: "The hospital", phonetic: "do-to-o-khwé" },
      { fon: "Ylɔ́ dotóo", fr: "Appelle un médecin", en: "Call a doctor", phonetic: "ylo do-to-o" },
      { fon: "Ylɔ́ kponɔ lɛ", fr: "Appelle la police", en: "Call the police", phonetic: "ylo kpo-no lè" },
      { fon: "Fí ɖo wǔ nú mì", fr: "J'ai mal ici", en: "It hurts here", phonetic: "fi do wou nou mi" },
      { fon: "Un bú ali", fr: "Je suis perdu", en: "I am lost", phonetic: "oun bou a-li" },
    ],
  },
  {
    id: "temps",
    title: "Temps & repères",
    titleEn: "Time & bearings",
    description: "Se repérer dans la journée.",
    entries: [
      { fon: "Égbé", fr: "Aujourd'hui", en: "Today", phonetic: "é-gbé" },
      { fon: "Sɔ", fr: "Demain", en: "Tomorrow", phonetic: "so" },
      { fon: "Sɔ́gbe", fr: "Hier", en: "Yesterday", phonetic: "so-gbé" },
      { fon: "Dìn", fr: "Maintenant", en: "Now", phonetic: "din" },
      { fon: "Zǎn", fr: "La nuit", en: "The night", phonetic: "zan" },
      { fon: "Kéze", fr: "Le jour", en: "The day", phonetic: "ké-zé" },
    ],
  },
];

export const PHRASEBOOK_ENTRIES: PhraseEntry[] = PHRASEBOOK.flatMap((c) => c.entries);
