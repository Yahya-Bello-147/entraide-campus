// Lecture de la réponse de l'IA « assistant d'annonce » : on ne fait jamais confiance au texte renvoyé.
import { test } from "node:test";
import assert from "node:assert/strict";
import { lireVerification } from "../src/lib/ia/verification.ts";

test("aucun problème → pas d'alerte", () => {
  assert.deepEqual(lireVerification('{"probleme":false,"raisons":[]}'), { alerte: false, raisons: [] });
});

test("problème signalé → alerte avec les raisons nettoyées", () => {
  const r = lireVerification(
    '{"probleme":true,"raisons":[{"extrait":"  zéro six douze ","explication":"Numéro de téléphone écrit en lettres."}]}',
  );
  assert.equal(r.alerte, true);
  assert.deepEqual(r.raisons, [{ extrait: "zéro six douze", explication: "Numéro de téléphone écrit en lettres." }]);
});

test("au maximum 3 raisons, textes raccourcis, balises retirées", () => {
  const raison = { extrait: "<b>" + "x".repeat(200) + "</b>", explication: "y".repeat(500) };
  const r = lireVerification(JSON.stringify({ probleme: true, raisons: [raison, raison, raison, raison, raison] }));
  assert.equal(r.raisons.length, 3);
  assert.ok(r.raisons[0].extrait.length <= 80 && !r.raisons[0].extrait.includes("<b>"));
  assert.ok(r.raisons[0].explication.length <= 200);
});

test("problème signalé sans raison lisible → alerte quand même, avec une explication générique", () => {
  const r = lireVerification('{"probleme":true,"raisons":"n\'importe quoi"}');
  assert.equal(r.alerte, true);
  assert.equal(r.raisons.length, 1);
});

test("réponse illisible → null (on considère que l'IA n'a pas pu vérifier)", () => {
  assert.equal(lireVerification("pas du JSON"), null);
  assert.equal(lireVerification('{"autre":1}'), null);
  assert.equal(lireVerification(undefined), null);
});
