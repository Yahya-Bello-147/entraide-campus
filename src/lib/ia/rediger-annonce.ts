// IA n°2, rôle RÉDIGER : propose une annonce à partir de quelques mots (côté serveur uniquement).
import { demanderJSON } from "./gemini.ts";
import { PROMPT_REDACTION_ANNONCE } from "./prompts.ts";
import { lireProposition } from "./proposition.ts";
import { CATEGORIES, TYPES, type ChampsAnnonce } from "../annonces/valider.ts";

const SCHEMA = {
  type: "OBJECT",
  properties: {
    type: { type: "STRING", enum: Object.keys(TYPES) },
    categorie: { type: "STRING", enum: Object.keys(CATEGORIES) },
    titre: { type: "STRING" },
    description: { type: "STRING" },
    prix: { type: "NUMBER", nullable: true },
    lieu: { type: "STRING" },
  },
  required: ["type", "categorie", "titre", "description", "prix", "lieu"],
};

// null = l'IA n'a rien pu proposer (panne ou réponse inutilisable) : la personne remplit à la main.
export async function redigerAnnonce(mots: string): Promise<ChampsAnnonce | null> {
  const resultat = await demanderJSON(
    PROMPT_REDACTION_ANNONCE,
    [{ text: `MOTS DE L'ÉTUDIANT : ${mots}` }],
    SCHEMA,
  );
  return resultat.ok ? lireProposition(resultat.texte) : null;
}
