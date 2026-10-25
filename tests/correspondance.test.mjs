// Palier 3 « Ça matche » : une annonce « Je cherche » correspond-elle à mes compétences ?
import { test } from "node:test";
import assert from "node:assert/strict";
import { correspondance, meilleuresCorrespondances } from "../src/lib/annonces/correspondance.ts";

const annonce = (titre, description, categorie = "autre", extra = {}) => ({ id: titre, titre, description, categorie, ...extra });

test("une compétence présente dans le titre correspond (accents et majuscules ignorés)", () => {
  const r = correspondance(["Photographie événementielle"], annonce("Cherche un PHOTOGRAPHE pour notre gala", "Samedi soir."));
  assert.ok(r.score > 0);
  assert.deepEqual(r.competences, ["Photographie événementielle"]);
});

test("la catégorie compte aussi : « Montage vidéo » correspond à une annonce Vidéo", () => {
  const r = correspondance(["Montage vidéo"], annonce("Besoin d'aide pour un clip", "Pour l'asso de danse.", "video"));
  assert.ok(r.score > 0);
  assert.deepEqual(r.competences, ["Montage vidéo"]);
});

test("aucune correspondance : score nul", () => {
  const r = correspondance(["Photographie", "Retouche Lightroom"], annonce("Cherche studio centre Bordeaux", "Loyer max 500 €.", "logement"));
  assert.equal(r.score, 0);
  assert.deepEqual(r.competences, []);
});

test("les petits mots ne déclenchent rien (« de », « pour », « et »)", () => {
  const r = correspondance(["Gestion de projet"], annonce("Cherche quelqu'un pour la gestion de mon déménagement", "Cartons et camion.", "autre"));
  // « gestion » est un vrai mot commun, mais « de » ne doit pas compter à lui seul
  assert.ok(r.score <= 1);
});

test("un mot de la compétence doit être un mot entier ou son début (« dev » ≠ « devoir »)", () => {
  const r = correspondance(["Dev"], annonce("Aide pour un devoir de maths", "Niveau L1.", "autre"));
  assert.equal(r.score, 0);
});

test("meilleuresCorrespondances : seulement les « Je cherche » actifs des autres, triés par score", () => {
  const annonces = [
    annonce("Cherche photographe pour gala", "Photo de soirée", "photo", { type: "cherche", statut: "active", auteur_id: "lea" }),
    annonce("Je propose des photos", "Photographe amateur", "photo", { type: "propose", statut: "active", auteur_id: "lea" }),
    annonce("Cherche photographe (pourvue)", "", "photo", { type: "cherche", statut: "pourvue", auteur_id: "lea" }),
    annonce("Cherche photographe (la mienne)", "", "photo", { type: "cherche", statut: "active", auteur_id: "moi" }),
    annonce("Cherche monteur vidéo", "Clip", "video", { type: "cherche", statut: "active", auteur_id: "tom" }),
    annonce("Cherche coloc", "", "logement", { type: "cherche", statut: "active", auteur_id: "tom" }),
  ];
  const r = meilleuresCorrespondances(["Photographie", "Retouche photo", "Montage vidéo"], annonces, "moi", 5);
  assert.deepEqual(
    r.map((x) => x.annonce.titre),
    ["Cherche photographe pour gala", "Cherche monteur vidéo"],
  );
});

test("sans compétences : aucune suggestion", () => {
  assert.deepEqual(meilleuresCorrespondances([], [annonce("Cherche photographe", "", "photo", { type: "cherche", statut: "active", auteur_id: "x" })], "moi"), []);
});
