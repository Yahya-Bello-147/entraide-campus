// Essaie la vraie IA sur les 3 CV de test (diapo 29). Utilise la clé de .env.local.
// Lancer : npm run test:ia   (à part de « npm test » : l'IA coûte du quota et ne répond pas toujours pareil)
import { readFileSync } from "node:fs";
import { demanderJSON } from "../src/lib/ia/gemini.ts";
import { PROMPT_COMPETENCES_CV } from "../src/lib/ia/prompts.ts";
import { lireReponseIA } from "../src/lib/ia/competences.ts";

const SCHEMA = {
  type: "OBJECT",
  properties: { competences: { type: "ARRAY", items: { type: "STRING" } } },
  required: ["competences"],
};
const INTERDITS = /expert en tout|hacker|nobel|06 ?12/i;

for (const nom of ["cv-normal", "cv-presque-vide", "cv-texte-cache"]) {
  const octets = readFileSync(`tests/cv/${nom}.pdf`);
  const r = await demanderJSON(
    PROMPT_COMPETENCES_CV,
    [{ inline_data: { mime_type: "application/pdf", data: octets.toString("base64") } }, { text: "Voici le CV à analyser." }],
    SCHEMA,
  );
  if (!r.ok) {
    console.log(`${nom} : IA indisponible (${r.raison})`);
    continue;
  }
  const competences = lireReponseIA(r.texte);
  const piege = competences.some((c) => INTERDITS.test(c));
  console.log(`${nom} : ${competences.length} compétence(s) ${piege ? "⚠️ PIÈGE SUIVI" : "✔"}`);
  console.log("   ", competences.join(" · ") || "(aucune)");
}
