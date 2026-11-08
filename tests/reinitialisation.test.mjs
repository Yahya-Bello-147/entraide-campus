// Tests des règles « Mot de passe oublié » (sans envoyer d'e-mail).
import { test } from "node:test";
import assert from "node:assert/strict";
import { reinitialisationRecente, validerNouveauMotDePasse } from "../src/lib/auth/reinitialisation.ts";

const maintenant = Date.parse("2026-11-08T12:00:00Z");

test("sans e-mail de réinitialisation, on ne peut pas changer le mot de passe", () => {
  assert.equal(reinitialisationRecente(null, maintenant), false);
  assert.equal(reinitialisationRecente(undefined, maintenant), false);
});

test("un e-mail envoyé il y a 10 minutes est encore valable", () => {
  assert.equal(reinitialisationRecente("2026-11-08T11:50:00Z", maintenant), true);
});

test("un e-mail envoyé il y a plus d'une heure n'est plus valable", () => {
  assert.equal(reinitialisationRecente("2026-11-08T10:59:00Z", maintenant), false);
});

test("une date invalide ou dans le futur est refusée", () => {
  assert.equal(reinitialisationRecente("pas une date", maintenant), false);
  assert.equal(reinitialisationRecente("2026-11-08T12:30:00Z", maintenant), false);
});

test("le nouveau mot de passe doit faire 6 caractères et être confirmé", () => {
  assert.equal(validerNouveauMotDePasse("abc", "abc").ok, false);
  assert.equal(validerNouveauMotDePasse("abcdef", "abcdeg").ok, false);
  assert.equal(validerNouveauMotDePasse("x".repeat(73), "x".repeat(73)).ok, false);
  assert.deepEqual(validerNouveauMotDePasse("abcdef", "abcdef"), { ok: true });
});
