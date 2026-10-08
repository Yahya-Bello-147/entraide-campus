// Vérification simple (sans IA) : les coordonnées évidentes dans une annonce sont repérées.
// C'est le filet de sécurité qui marche même si l'IA est en panne.
import { test } from "node:test";
import assert from "node:assert/strict";
import { detecterCoordonneesEvidentes } from "../src/lib/annonces/coordonnees-evidentes.ts";

const types = (texte) => detecterCoordonneesEvidentes(texte).map((d) => d.type);

test("une annonce normale ne déclenche rien", () => {
  assert.deepEqual(types("Photos pour vos événements, 20 € l'heure, disponible le week-end. Promo 2025."), []);
});

test("repère un numéro de téléphone français, quel que soit le format", () => {
  for (const numero of ["06 12 34 56 78", "0612345678", "06.12.34.56.78", "06-12-34-56-78", "+33 6 12 34 56 78", "+336 12 34 56 78"]) {
    assert.deepEqual(types(`Appelle-moi au ${numero} !`), ["téléphone"], numero);
  }
});

test("repère une adresse e-mail", () => {
  assert.deepEqual(types("Écris-moi : sam.photo@gmail.com"), ["e-mail"]);
});

test("repère un lien (http, www, ou domaine connu)", () => {
  assert.deepEqual(types("Voir https://leboncoin.fr/profil/123"), ["lien"]);
  assert.deepEqual(types("Mon book : www.sam-photo.fr"), ["lien"]);
  assert.deepEqual(types("Tout est sur leboncoin.fr/profil/abc"), ["lien"]);
});

test("ne confond pas un prix ou une date avec un numéro", () => {
  assert.deepEqual(types("Prix : 2000 €, acheté le 12/11/2023, 36 Go de RAM, 1 To"), []);
});

test("renvoie l'extrait trouvé pour l'afficher à la personne", () => {
  const [d] = detecterCoordonneesEvidentes("Mon numéro : 06 12 34 56 78.");
  assert.equal(d.extrait, "06 12 34 56 78");
});
