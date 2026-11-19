// Étape 3 : l'aperçu des annonces pour les visiteurs non connectés, contre la vraie base Supabase.
// Le visiteur ne doit voir que le titre, la catégorie, le type, le prix, le campus et la date.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const visiteur = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const COLONNES_AUTORISEES = ["campus", "categorie", "created_at", "prix", "titre", "type"];

test("un visiteur reçoit au plus 6 annonces, avec seulement les colonnes autorisées", async () => {
  const { data, error } = await visiteur.rpc("annonces_apercu");
  assert.equal(error, null);
  assert.ok(data.length <= 6);
  for (const ligne of data) {
    assert.deepEqual(Object.keys(ligne).sort(), COLONNES_AUTORISEES);
  }
});

test("un visiteur ne peut toujours pas lire la table des annonces (ni description, ni auteur)", async () => {
  const { data } = await visiteur.from("annonces").select("id, auteur_id, description").limit(5);
  assert.deepEqual(data ?? [], []);
});

test("un visiteur ne peut toujours pas lire les profils ni les coordonnées", async () => {
  const { data: profils } = await visiteur.from("profils").select("id, prenom").limit(5);
  const { data: coordonnees } = await visiteur.from("coordonnees").select("email, telephone").limit(5);
  assert.deepEqual(profils ?? [], []);
  assert.deepEqual(coordonnees ?? [], []);
});

test("un visiteur peut connaître le nombre d'annonces actives, et seulement ce nombre", async () => {
  const { data, error } = await visiteur.rpc("nombre_annonces_actives");
  assert.equal(error, null);
  assert.equal(typeof data, "number");
  assert.ok(data >= 0);
});
