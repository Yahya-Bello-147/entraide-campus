// Tests du nettoyage de la réponse de l'IA (profil depuis le CV).
// L'IA peut répondre n'importe quoi : on ne garde que des compétences propres.
import { test } from "node:test";
import assert from "node:assert/strict";
import { nettoyerCompetences, lireReponseIA } from "../src/lib/ia/competences.ts";

test("garde une liste propre telle quelle (espaces retirés)", () => {
  assert.deepEqual(nettoyerCompetences(["  Photo ", "Retouche", "Vidéo"]), ["Photo", "Retouche", "Vidéo"]);
});

test("retire les doublons, même avec une casse différente", () => {
  assert.deepEqual(nettoyerCompetences(["Photo", "photo", "PHOTO ", "Vidéo"]), ["Photo", "Vidéo"]);
});

test("retire les vides, les non-textes et les compétences de plus de 40 caractères", () => {
  assert.deepEqual(nettoyerCompetences(["", "   ", 42, null, "x".repeat(41), "Dev"]), ["Dev"]);
});

test("garde au maximum 10 compétences", () => {
  const liste = Array.from({ length: 14 }, (_, i) => `Compétence ${i}`);
  assert.equal(nettoyerCompetences(liste).length, 10);
});

test("retire les caractères de mise en forme (balises, retours à la ligne)", () => {
  assert.deepEqual(nettoyerCompetences(["<b>Photo</b>", "Retouche\nphoto"]), ["Photo", "Retouche photo"]);
});

test("lit une réponse JSON correcte de l'IA", () => {
  assert.deepEqual(lireReponseIA('{"competences":["Photo","Retouche"]}'), ["Photo", "Retouche"]);
});

test("une réponse illisible ou mal formée donne une liste vide (jamais d'erreur)", () => {
  assert.deepEqual(lireReponseIA("ceci n'est pas du JSON"), []);
  assert.deepEqual(lireReponseIA('{"autre":"chose"}'), []);
  assert.deepEqual(lireReponseIA('{"competences":"Photo"}'), []);
  assert.deepEqual(lireReponseIA(undefined), []);
});
