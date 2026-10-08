// Lecture de la proposition d'annonce rédigée par l'IA (rôle RÉDIGER de l'assistant).
// La proposition sert à PRÉ-REMPLIR le formulaire : on la rend toujours utilisable, jamais dangereuse.
import { test } from "node:test";
import assert from "node:assert/strict";
import { lireProposition } from "../src/lib/ia/proposition.ts";

const json = (o) => JSON.stringify(o);

test("une proposition correcte donne les champs du formulaire", () => {
  const p = lireProposition(
    json({ type: "propose", categorie: "objets", titre: "MacBook Pro 14 M3 Pro", description: "Très bon état.", prix: 2000, lieu: "Bordeaux" }),
  );
  assert.deepEqual(p, {
    type: "propose",
    categorie: "objets",
    titre: "MacBook Pro 14 M3 Pro",
    description: "Très bon état.",
    prix: "2000",
    lieu: "Bordeaux",
  });
});

test("type ou catégorie inconnus → valeurs sûres par défaut", () => {
  const p = lireProposition(json({ type: "vend", categorie: "armes", titre: "Un titre", description: "Texte" }));
  assert.equal(p.type, "propose");
  assert.equal(p.categorie, "autre");
});

test("textes trop longs raccourcis, balises retirées", () => {
  const p = lireProposition(
    json({ type: "cherche", categorie: "logement", titre: "<b>" + "T".repeat(150) + "</b>", description: "D".repeat(2500) }),
  );
  assert.ok(p.titre.length <= 100 && !p.titre.includes("<b>"));
  assert.ok(p.description.length <= 2000);
});

test("prix absent, négatif ou bizarre → champ vide ; lieu absent → vide", () => {
  for (const prix of [null, -5, "gratuit", undefined]) {
    assert.equal(lireProposition(json({ type: "propose", categorie: "dev", titre: "Site web", description: "x", prix })).prix, "");
  }
  assert.equal(lireProposition(json({ type: "propose", categorie: "dev", titre: "Site web", description: "x" })).lieu, "");
});

test("un prix décimal est gardé avec une virgule (format français)", () => {
  assert.equal(lireProposition(json({ type: "propose", categorie: "objets", titre: "Poêle", description: "x", prix: 12.5 })).prix, "12,5");
});

test("réponse illisible ou sans titre ni description → null (l'IA n'a rien proposé d'utile)", () => {
  assert.equal(lireProposition("pas du JSON"), null);
  assert.equal(lireProposition(json({ type: "propose" })), null);
  assert.equal(lireProposition(undefined), null);
});
