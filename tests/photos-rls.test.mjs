// Tests des règles de l'espace « photos » (photos de profil), contre la vraie base Supabase.
// Chacun ne peut ajouter, remplacer ou supprimer que les fichiers de SON dossier.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const nouveauClient = () => createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });

async function clientConnecte(email, motDePasse) {
  const client = nouveauClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password: motDePasse });
  if (error) throw new Error(`Connexion impossible pour ${email} : ${error.message}`);
  return { client, id: data.user.id };
}

// Une toute petite image JPEG valide (1 × 1 pixel).
const JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AN//Z",
  "base64",
);

let c; // compte C
let d; // compte D
const fichiersCrees = [];

before(async () => {
  c = await clientConnecte(process.env.TEST_COMPTE_C_EMAIL, process.env.TEST_COMPTE_C_MDP);
  d = await clientConnecte(process.env.TEST_COMPTE_D_EMAIL, process.env.TEST_COMPTE_D_MDP);
});

// Le compte C ne sert qu'aux tests : on vide tout son dossier à la fin.
after(async () => {
  const { data } = await c.client.storage.from("photos").list(c.id);
  const restants = [...new Set([...fichiersCrees, ...(data ?? []).map((f) => `${c.id}/${f.name}`)])];
  if (restants.length) await c.client.storage.from("photos").remove(restants);
});

test("je peux envoyer une photo dans MON dossier", async () => {
  const chemin = `${c.id}/${Date.now()}.jpg`;
  const { error } = await c.client.storage.from("photos").upload(chemin, JPEG, { contentType: "image/jpeg" });
  assert.equal(error, null);
  fichiersCrees.push(chemin);
});

test("je ne peux PAS envoyer une photo dans le dossier de quelqu'un d'autre", async () => {
  const { error } = await c.client.storage.from("photos").upload(`${d.id}/${Date.now()}.jpg`, JPEG, { contentType: "image/jpeg" });
  assert.notEqual(error, null);
});

test("un visiteur non connecté ne peut rien envoyer", async () => {
  const { error } = await nouveauClient().storage.from("photos").upload(`${c.id}/${Date.now()}.jpg`, JPEG, { contentType: "image/jpeg" });
  assert.notEqual(error, null);
});

test("je ne peux PAS supprimer la photo de quelqu'un d'autre", async () => {
  const chemin = `${c.id}/${Date.now()}-a-garder.jpg`;
  await c.client.storage.from("photos").upload(chemin, JPEG, { contentType: "image/jpeg" });
  fichiersCrees.push(chemin);
  await d.client.storage.from("photos").remove([chemin]);
  // Le fichier est toujours là : son adresse publique répond encore.
  const reponse = await fetch(`${url}/storage/v1/object/public/photos/${chemin}`);
  assert.equal(reponse.status, 200);
});

test("un fichier qui n'est pas une image est refusé par l'espace photos", async () => {
  const { error } = await c.client.storage
    .from("photos")
    .upload(`${c.id}/${Date.now()}.html`, Buffer.from("<script>alert(1)</script>"), { contentType: "text/html" });
  assert.notEqual(error, null);
});

test("personne ne peut lister les photos des autres", async () => {
  const { data } = await d.client.storage.from("photos").list(c.id);
  assert.deepEqual(data ?? [], []);
});

test("je peux supprimer MA photo (pour la changer ou la retirer)", async () => {
  const chemin = `${c.id}/${Date.now()}-a-supprimer.jpg`;
  await c.client.storage.from("photos").upload(chemin, JPEG, { contentType: "image/jpeg" });
  const { data, error } = await c.client.storage.from("photos").remove([chemin]);
  assert.equal(error, null);
  assert.equal(data.length, 1);
  const reponse = await fetch(`${url}/storage/v1/object/public/photos/${chemin}`);
  assert.notEqual(reponse.status, 200);
});
