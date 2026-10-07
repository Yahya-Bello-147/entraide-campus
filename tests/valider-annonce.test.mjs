// Tests de la vérification d'un formulaire d'annonce (avant envoi à la base).
import { test } from "node:test";
import assert from "node:assert/strict";
import { validerAnnonce } from "../src/lib/annonces/valider.ts";

const valide = {
  type: "propose",
  categorie: "photo",
  titre: "Photos pour vos événements",
  description: "Je couvre vos soirées et vos événements d'asso.",
  prix: "",
  lieu: "",
};

test("une annonce correcte est acceptée et nettoyée", () => {
  const r = validerAnnonce({ ...valide, titre: "  Photos pour vos événements  ", lieu: " Bordeaux " });
  assert.equal(r.ok, true);
  assert.equal(r.annonce.titre, "Photos pour vos événements");
  assert.equal(r.annonce.lieu, "Bordeaux");
  assert.equal(r.annonce.prix, null);
});

test("le prix est facultatif, mais converti en nombre s'il est rempli", () => {
  const r = validerAnnonce({ ...valide, categorie: "objets", prix: "2000" });
  assert.equal(r.ok, true);
  assert.equal(r.annonce.prix, 2000);
});

test("un prix avec une virgule est accepté (12,50)", () => {
  const r = validerAnnonce({ ...valide, prix: "12,50" });
  assert.equal(r.ok, true);
  assert.equal(r.annonce.prix, 12.5);
});

test("un type inconnu est refusé", () => {
  const r = validerAnnonce({ ...valide, type: "vend" });
  assert.equal(r.ok, false);
  assert.match(r.erreur, /Je propose ou Je cherche/);
});

test("une catégorie inconnue est refusée", () => {
  const r = validerAnnonce({ ...valide, categorie: "armes" });
  assert.equal(r.ok, false);
  assert.match(r.erreur, /catégorie/i);
});

test("un titre de moins de 3 caractères est refusé", () => {
  const r = validerAnnonce({ ...valide, titre: "  A " });
  assert.equal(r.ok, false);
  assert.match(r.erreur, /titre/i);
});

test("un titre de plus de 100 caractères est refusé", () => {
  const r = validerAnnonce({ ...valide, titre: "x".repeat(101) });
  assert.equal(r.ok, false);
  assert.match(r.erreur, /titre/i);
});

test("une description vide est refusée", () => {
  const r = validerAnnonce({ ...valide, description: "   " });
  assert.equal(r.ok, false);
  assert.match(r.erreur, /description/i);
});

test("un prix négatif ou qui n'est pas un nombre est refusé", () => {
  assert.equal(validerAnnonce({ ...valide, prix: "-5" }).ok, false);
  assert.equal(validerAnnonce({ ...valide, prix: "gratuit" }).ok, false);
});
