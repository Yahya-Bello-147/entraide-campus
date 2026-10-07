// Tests des règles de sécurité (RLS) de la table « annonces », contre la vraie base Supabase.
// Lancer avec : npm test
// Il faut .env.local (adresse + clé publique) et .env.test.local (les 2 comptes de test).

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function nouveauClient() {
  return createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function clientConnecte(email, motDePasse) {
  const client = nouveauClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password: motDePasse });
  if (error) throw new Error(`Connexion impossible pour ${email} : ${error.message}`);
  return { client, id: data.user.id };
}

const exemple = {
  type: "propose",
  categorie: "photo",
  titre: "Photos pour vos événements (test)",
  description: "Annonce créée par les tests automatiques.",
};

let sam; // compte A : propose
let lea; // compte B : cherche
const annoncesCreees = [];

async function publierParSam(champs = {}) {
  const { data, error } = await sam.client
    .from("annonces")
    .insert({ ...exemple, ...champs })
    .select()
    .single();
  if (data) annoncesCreees.push(data.id);
  return { data, error };
}

before(async () => {
  sam = await clientConnecte(process.env.TEST_COMPTE_A_EMAIL, process.env.TEST_COMPTE_A_MDP);
  lea = await clientConnecte(process.env.TEST_COMPTE_B_EMAIL, process.env.TEST_COMPTE_B_MDP);
});

after(async () => {
  // Ménage : on efface tout ce que les tests ont créé.
  if (annoncesCreees.length) await sam.client.from("annonces").delete().in("id", annoncesCreees);
});

test("1. Une personne non connectée ne voit aucune annonce", async () => {
  await publierParSam();
  const { data, error } = await nouveauClient().from("annonces").select("id");
  assert.equal(error, null);
  assert.deepEqual(data, []);
});

test("2. Sam publie une annonce à son nom", async () => {
  const { data, error } = await publierParSam();
  assert.equal(error, null);
  assert.equal(data.auteur_id, sam.id);
});

test("3. Sam ne peut pas publier au nom de Léa", async () => {
  const { data, error } = await publierParSam({ auteur_id: lea.id });
  assert.equal(data, null);
  assert.ok(error, "l'insertion aurait dû être refusée");
});

test("4. Léa (connectée) voit l'annonce de Sam", async () => {
  const { data: annonce } = await publierParSam();
  const { data, error } = await lea.client.from("annonces").select("id").eq("id", annonce.id);
  assert.equal(error, null);
  assert.equal(data.length, 1);
});

test("5. Léa ne peut pas modifier l'annonce de Sam (règle d'or n°2)", async () => {
  const { data: annonce } = await publierParSam();
  const { data: modifiees } = await lea.client
    .from("annonces")
    .update({ titre: "Piratée par Léa" })
    .eq("id", annonce.id)
    .select();
  assert.deepEqual(modifiees ?? [], []);

  const { data: verif } = await sam.client.from("annonces").select("titre").eq("id", annonce.id).single();
  assert.equal(verif.titre, exemple.titre);
});

test("5 bis. Léa ne peut pas s'approprier l'annonce de Sam", async () => {
  const { data: annonce } = await publierParSam();
  await lea.client.from("annonces").update({ auteur_id: lea.id }).eq("id", annonce.id);
  const { data: verif } = await sam.client.from("annonces").select("auteur_id").eq("id", annonce.id).single();
  assert.equal(verif.auteur_id, sam.id);
});

test("6. Léa ne peut pas supprimer l'annonce de Sam (règle d'or n°2)", async () => {
  const { data: annonce } = await publierParSam();
  await lea.client.from("annonces").delete().eq("id", annonce.id);
  const { data } = await sam.client.from("annonces").select("id").eq("id", annonce.id);
  assert.equal(data.length, 1, "l'annonce de Sam doit toujours exister");
});

test("7. Sam modifie puis supprime sa propre annonce", async () => {
  const { data: annonce } = await publierParSam();
  const { data: modifiee, error } = await sam.client
    .from("annonces")
    .update({ titre: "Titre modifié par Sam" })
    .eq("id", annonce.id)
    .select()
    .single();
  assert.equal(error, null);
  assert.equal(modifiee.titre, "Titre modifié par Sam");

  await sam.client.from("annonces").delete().eq("id", annonce.id);
  const { data } = await sam.client.from("annonces").select("id").eq("id", annonce.id);
  assert.deepEqual(data, []);
});

test("8. Une annonce avec un titre trop court est refusée", async () => {
  const { data, error } = await publierParSam({ titre: "A" });
  assert.equal(data, null);
  assert.ok(error, "l'insertion aurait dû être refusée");
});
