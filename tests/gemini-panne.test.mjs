// « Un plan si ça rate » (diapo 31) : si l'IA est injoignable, on obtient une réponse propre, jamais un plantage.
import { test } from "node:test";
import assert from "node:assert/strict";
import { demanderJSON } from "../src/lib/ia/gemini.ts";

const schema = { type: "OBJECT", properties: { competences: { type: "ARRAY", items: { type: "STRING" } } } };

test("sans clé configurée : réponse « config », sans appel réseau", async () => {
  const sauvegarde = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    assert.deepEqual(await demanderJSON("x", [{ text: "x" }], schema), { ok: false, raison: "config" });
  } finally {
    if (sauvegarde !== undefined) process.env.GEMINI_API_KEY = sauvegarde;
  }
});

test("avec une clé refusée par Google : réponse « indisponible », pas d'erreur", async () => {
  const sauvegarde = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "cle-invalide-pour-le-test";
  try {
    assert.deepEqual(await demanderJSON("x", [{ text: "x" }], schema), { ok: false, raison: "indisponible" });
  } finally {
    if (sauvegarde === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = sauvegarde;
  }
});
