// IA n°2 : vérifie qu'une annonce ne contient pas de coordonnées cachées (côté serveur uniquement).
import { demanderJSON } from "./gemini.ts";
import { PROMPT_VERIFICATION_ANNONCE } from "./prompts.ts";
import { lireVerification, type Verification } from "./verification.ts";

const SCHEMA = {
  type: "OBJECT",
  properties: {
    probleme: { type: "BOOLEAN" },
    raisons: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { extrait: { type: "STRING" }, explication: { type: "STRING" } },
        required: ["extrait", "explication"],
      },
    },
  },
  required: ["probleme", "raisons"],
};

// null = l'IA n'a pas pu vérifier (panne, réponse illisible) : on n'empêche pas la publication.
export async function verifierAnnonce(titre: string, description: string, lieu: string | null): Promise<Verification | null> {
  const resultat = await demanderJSON(
    PROMPT_VERIFICATION_ANNONCE,
    [{ text: `ANNONCE À ANALYSER\nTitre : ${titre}\nDescription : ${description}\nLieu : ${lieu ?? "(non précisé)"}` }],
    SCHEMA,
  );
  return resultat.ok ? lireVerification(resultat.texte) : null;
}
