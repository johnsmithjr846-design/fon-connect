# Correction de l'erreur de l'assistant IA

## Problème constaté
L'assistant IA « Ayi » retourne immédiatement un message d'erreur lorsqu'on lui pose une question. L'appel à `/api/chat` renvoie un événement `error` avec le texte générique `An error occurred.`.

## Diagnostic
Le code utilise le modèle `google/gemini-3.6-flash` dans 5 endroits. Ce modèle n'existe pas chez Lovable AI Gateway (pas de version 3.6 de Gemini Flash), ce qui provoque un échec silencieux côté SDK `ai` et un message d'erreur générique en streaming.

## Objectifs du plan
1. Remplacer le modèle invalide par un modèle supporté par Lovable AI Gateway.
2. Centraliser le choix du modèle par défaut pour éviter les incohérences futures.
3. Améliorer l'affichage de l'erreur côté client pour que l'utilisateur comprenne si le service est indisponible.
4. Vérifier que l'assistant et le traducteur répondent correctement après le changement.

## Détails techniques
- Modèle cible : `openai/gpt-4o-mini` (rapide, économique, supporté par le gateway Lovable).
- Fichiers à modifier :
  - `src/lib/ai-gateway.server.ts` : ajouter `export const DEFAULT_LLM_MODEL = "openai/gpt-4o-mini" ;`.
  - `src/routes/api/chat.ts` : utiliser `DEFAULT_LLM_MODEL`.
  - `src/routes/api/lesson-chat.ts` : utiliser `DEFAULT_LLM_MODEL`.
  - `src/lib/translate.functions.ts` : utiliser `DEFAULT_LLM_MODEL`.
  - `src/lib/mcp/tools/translate-text.ts` : utiliser `DEFAULT_LLM_MODEL`.
  - `src/lib/explore.functions.ts` : utiliser `DEFAULT_LLM_MODEL`.
- UI : dans `src/routes/assistant.tsx`, afficher le texte de l'erreur réelle (si `error` contient un message) à la place du message figé actuel.
- Validation : appel `curl` sur `/api/chat` + test du traducteur + `bunx tsc --noEmit`.
