// Appel à Gemini, UNIQUEMENT côté serveur : la clé GEMINI_API_KEY (variable Vercel « Secret »)
// n'est jamais envoyée au navigateur.

if (typeof window !== "undefined") {
  throw new Error("gemini.ts ne doit jamais être chargé dans le navigateur.");
}

// Modèle principal, puis modèle de secours plus léger si le premier est saturé ou en panne.
const MODELES = ["gemini-flash-latest", "gemini-flash-lite-latest"];
const DELAI_MAX_MS = 25_000;

export type ResultatGemini = { ok: true; texte: string } | { ok: false; raison: "config" | "indisponible" };

type Partie = { text: string } | { inline_data: { mime_type: string; data: string } };

export async function demanderJSON(
  instructions: string,
  parties: Partie[],
  schema: object,
): Promise<ResultatGemini> {
  const cle = process.env.GEMINI_API_KEY;
  if (!cle) return { ok: false, raison: "config" };

  for (const modele of MODELES) {
    try {
      const reponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modele}:generateContent`,
        {
          method: "POST",
          headers: { "x-goog-api-key": cle, "content-type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: instructions }] },
            contents: [{ role: "user", parts: parties }],
            generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.2 },
          }),
          signal: AbortSignal.timeout(DELAI_MAX_MS),
        },
      );
      if (!reponse.ok) continue; // saturé (503), quota (429)… on essaie le modèle suivant
      const donnees = await reponse.json();
      const texte = donnees?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof texte === "string") return { ok: true, texte };
    } catch {
      // délai dépassé ou réseau : modèle suivant
    }
  }
  return { ok: false, raison: "indisponible" };
}
