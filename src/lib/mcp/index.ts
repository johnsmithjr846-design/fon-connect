import { auth, defineMcp } from "@lovable.dev/mcp-js";
import translateTextTool from "./tools/translate-text";
import searchPhrasebookTool from "./tools/search-phrasebook";
import listLessonsTool from "./tools/list-lessons";
import myProgressTool from "./tools/my-progress";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "fon-connect",
  title: "Fon Connect",
  version: "0.1.0",
  instructions:
    "Outils FonConnect pour la langue fon (fongbe, Bénin) : traduction fon/français/anglais, guide de conversation, parcours de leçons et progression de l'utilisateur connecté.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [translateTextTool, searchPhrasebookTool, listLessonsTool, myProgressTool],
});
