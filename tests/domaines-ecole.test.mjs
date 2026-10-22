// Niveau 1 : l'inscription est réservée aux adresses de l'école (vérification sur la page).
import { test } from "node:test";
import assert from "node:assert/strict";
import { adresseEcole, DOMAINES_ECOLE } from "../src/lib/auth/domaines.ts";

test("les 3 domaines de l'école sont autorisés", () => {
  assert.deepEqual(DOMAINES_ECOLE, ["mail-esd.com", "mail-esp.com", "ecole-digital.com"]);
  assert.equal(adresseEcole("yahya.bello@mail-esd.com"), true);
  assert.equal(adresseEcole("yahya.bello@mail-esp.com"), true);
  assert.equal(adresseEcole("prof.dupont@ecole-digital.com"), true);
});

test("les majuscules et les espaces autour ne gênent pas", () => {
  assert.equal(adresseEcole("  Yahya.Bello@MAIL-ESP.com "), true);
});

test("une adresse personnelle est refusée", () => {
  assert.equal(adresseEcole("yahya@gmail.com"), false);
  assert.equal(adresseEcole("yahya@outlook.fr"), false);
});

test("les domaines pièges sont refusés", () => {
  for (const piege of [
    "pirate@mail-esd.com.faux-site.fr",
    "pirate@faux-mail-esd.com",
    "pirate@sous.mail-esd.com",
    "pirate@mail-esd.co",
    "pirate@mail-esd.com@gmail.com",
    "mail-esd.com",
    "@mail-esd.com",
    "",
  ]) {
    assert.equal(adresseEcole(piege), false, piege);
  }
});
