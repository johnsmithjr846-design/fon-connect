# Mode vocal FonConnect

Objectif : parler au lieu d'écrire, et écouter au lieu de lire — sur le traducteur et sur l'assistant Ayi.

## Ce qui sera construit

### 1. Traducteur vocal (`/traducteur`)
- Bouton micro : l'utilisateur parle, l'audio est transcrit puis inséré dans la zone de saisie et traduit.
- Bouton haut-parleur sur le résultat : lecture à voix haute de la traduction.
- États clairs : « Enregistrement… », « Transcription… », « Lecture… », plus messages d'erreur explicites (micro refusé, enregistrement vide, quota IA).

### 2. Assistant Ayi vocal (`/assistant`)
- Bouton micro à côté du champ de message : dicter au lieu de taper (la transcription remplit le champ, l'utilisateur peut corriger avant d'envoyer).
- Bouton d'écoute sur chaque réponse d'Ayi.
- Option « mains libres » : lecture automatique de la réponse dès qu'elle est terminée, activable/désactivable et mémorisée dans le navigateur.

### 3. Voix pour le fon
Aucune voix de synthèse n'existe pour le fon. Comme convenu, on utilise une **voix approchée** : le texte fon est converti en une graphie phonétique adaptée au français, puis lu par une voix de synthèse guidée par des consignes de prononciation. Un petit avertissement discret indique que la prononciation est approximative et qu'un enregistrement par des locuteurs natifs viendra plus tard.

Le français, lui, est lu avec une prononciation correcte.

## Détails techniques

- **Enregistrement** : capture PCM via Web Audio, encodage WAV 16 kHz mono côté client (fiable sur Safari/iOS, contrairement à MediaRecorder). Garde-fous : refus des blobs quasi vides.
- **Transcription** : route serveur `src/routes/api/transcribe.ts` (multipart) → Lovable AI `/v1/audio/transcriptions` avec `openai/gpt-4o-transcribe`, streaming SSE pour un affichage progressif. Pour le fon, on laisse la détection automatique et on repasse le texte brut dans le traducteur.
- **Synthèse** : route serveur `src/routes/api/speech.ts` → Lovable AI `/v1/audio/speech` en SSE PCM, lecture progressive côté client via AudioContext.
- **Fon → audio** : le texte fon est d'abord transformé en graphie phonétique (réutilisation du champ `phonetic` déjà renvoyé par le traducteur ; pour l'assistant, extraction des prononciations entre parenthèses ou passage rapide par le modèle), puis envoyé à la synthèse avec des instructions de diction.
- **Client** : hooks partagés `src/hooks/useVoiceRecorder.ts` et `src/hooks/useSpeech.ts`, plus des composants `MicButton` / `SpeakButton` réutilisés par les deux pages.
- **Découpage** : textes longs découpés en segments avant synthèse pour éviter les limites du modèle.
- Aucune donnée audio n'est stockée : tout transite en mémoire, rien en base.

## Hors périmètre pour cette étape

Conversation vocale continue en temps réel (sans appuyer sur un bouton), enregistrements par locuteurs natifs, mode urgence vocal, et téléchargement des audios — étapes suivantes possibles.
