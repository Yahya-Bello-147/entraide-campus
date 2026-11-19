// Tests de la vérification du formulaire « Mon profil ».
import { test } from "node:test";
import assert from "node:assert/strict";
import { validerProfil } from "../src/lib/profil/valider.ts";

const valide = { prenom: "Sam", email: "sam@exemple.fr", telephone: "", campus: "Lyon", presentation: "" };

test("un profil correct est accepté et nettoyé", () => {
  const r = validerProfil({
    prenom: "  Sam ",
    email: " Sam@Exemple.fr ",
    telephone: " 06 12 34 56 78 ",
    campus: "Lyon",
    presentation: "  Passionné   de photo. ",
  });
  assert.equal(r.ok, true);
  assert.deepEqual(r.profil, {
    prenom: "Sam",
    email: "sam@exemple.fr",
    telephone: "06 12 34 56 78",
    campus: "Lyon",
    presentation: "Passionné de photo.",
  });
});

test("le téléphone est facultatif", () => {
  const r = validerProfil(valide);
  assert.equal(r.ok, true);
  assert.equal(r.profil.telephone, null);
});

test("le format +33 est accepté", () => {
  assert.equal(validerProfil({ ...valide, telephone: "+33 6 12 34 56 78" }).ok, true);
});

test("un prénom vide est refusé", () => {
  const r = validerProfil({ ...valide, prenom: "   " });
  assert.equal(r.ok, false);
  assert.match(r.erreur, /prénom/i);
});

test("un prénom de plus de 50 caractères est refusé", () => {
  assert.equal(validerProfil({ ...valide, prenom: "x".repeat(51) }).ok, false);
});

test("un e-mail sans arobase est refusé", () => {
  const r = validerProfil({ ...valide, email: "sam.exemple.fr" });
  assert.equal(r.ok, false);
  assert.match(r.erreur, /e-mail/i);
});

test("un téléphone avec des lettres est refusé", () => {
  const r = validerProfil({ ...valide, telephone: "zéro six douze" });
  assert.equal(r.ok, false);
  assert.match(r.erreur, /téléphone/i);
});

test("le campus est obligatoire", () => {
  const r = validerProfil({ ...valide, campus: "" });
  assert.equal(r.ok, false);
  assert.match(r.erreur, /campus/);
});

test("un campus hors des 6 campus ESP est refusé", () => {
  assert.equal(validerProfil({ ...valide, campus: "Marseille" }).ok, false);
  assert.equal(validerProfil({ ...valide, campus: "lyon" }).ok, false);
});

test("la présentation est facultative et limitée à 160 caractères", () => {
  assert.equal(validerProfil(valide).profil.presentation, null);
  assert.equal(validerProfil({ ...valide, presentation: "x".repeat(160) }).ok, true);
  assert.equal(validerProfil({ ...valide, presentation: "x".repeat(161) }).ok, false);
});

test("une présentation avec un numéro ou un pseudo de réseau social est refusée", () => {
  assert.equal(validerProfil({ ...valide, presentation: "Écris-moi au 06 12 34 56 78" }).ok, false);
  assert.equal(validerProfil({ ...valide, presentation: "Mon insta : @sam.photo" }).ok, false);
});
