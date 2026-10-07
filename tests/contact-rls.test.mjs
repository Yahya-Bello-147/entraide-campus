// Tests de la règle d'or n°1 : « Mes coordonnées ne sont visibles qu'après mon accord. »
// Et des règles sur les demandes de contact et les profils. Contre la vraie base Supabase.
// Comptes C et D réservés aux tests (dans le code : « sam » et « léa ») : Sam et Léa de la démo ne sont pas touchés.

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

let sam; // propose
let lea; // cherche
const annonces = []; // [ { client, id } ] à effacer à la fin

async function publier(qui, titre) {
  const { data, error } = await qui.client
    .from("annonces")
    .insert({ type: "propose", categorie: "photo", titre, description: "Annonce de test automatique." })
    .select("id")
    .single();
  if (error) throw error;
  annonces.push({ client: qui.client, id: data.id });
  return data.id;
}

async function demander(qui, annonceId, champs = {}) {
  return qui.client
    .from("demandes_contact")
    .insert({ annonce_id: annonceId, ...champs })
    .select()
    .single();
}

async function coordonneesDe(lecteur, proprietaire) {
  const { data } = await lecteur.client.from("coordonnees").select("email, telephone").eq("user_id", proprietaire.id);
  return data ?? [];
}

before(async () => {
  sam = await clientConnecte(process.env.TEST_COMPTE_C_EMAIL, process.env.TEST_COMPTE_C_MDP);
  lea = await clientConnecte(process.env.TEST_COMPTE_D_EMAIL, process.env.TEST_COMPTE_D_MDP);

  await sam.client.from("profils").upsert({ id: sam.id, prenom: "Testeur C" });
  await lea.client.from("profils").upsert({ id: lea.id, prenom: "Testeur D" });
  await sam.client.from("coordonnees").upsert({ user_id: sam.id, email: "testeur.c.entraide@gmail.com", telephone: "06 00 00 00 01" });
  await lea.client.from("coordonnees").upsert({ user_id: lea.id, email: "testeur.d.entraide@gmail.com", telephone: "06 00 00 00 02" });

  // Ménage d'éventuels restes d'un test interrompu (les demandes partent avec les annonces).
  await sam.client.from("annonces").delete().like("titre", "%(test contact)%");
  await lea.client.from("annonces").delete().like("titre", "%(test contact)%");
});

after(async () => {
  for (const a of annonces) await a.client.from("annonces").delete().eq("id", a.id);
});

test("1. Sam voit ses propres coordonnées", async () => {
  const c = await coordonneesDe(sam, sam);
  assert.equal(c.length, 1);
  assert.equal(c[0].telephone, "06 00 00 00 01");
});

test("2. Sans demande, Léa ne voit PAS les coordonnées de Sam", async () => {
  assert.deepEqual(await coordonneesDe(lea, sam), []);
});

test("3. Une personne non connectée ne voit ni profils, ni coordonnées, ni demandes", async () => {
  const anonyme = nouveauClient();
  for (const table of ["profils", "coordonnees", "demandes_contact"]) {
    const { data } = await anonyme.from(table).select("*");
    assert.deepEqual(data ?? [], [], `table ${table}`);
  }
});

test("4. Léa demande le contact : en attente, destinataire = Sam (même si elle triche)", async () => {
  const annonceId = await publier(sam, "Photos (test contact) 4");
  // Léa essaie de mettre un faux destinataire : la base le remplace par l'auteur de l'annonce.
  const { data, error } = await demander(lea, annonceId, { destinataire_id: lea.id });
  if (error) {
    // Refus aussi acceptable : le faux destinataire ne doit jamais passer.
    const { data: d2, error: e2 } = await demander(lea, annonceId);
    assert.equal(e2, null);
    assert.equal(d2.destinataire_id, sam.id);
    return;
  }
  assert.equal(data.statut, "en_attente");
  assert.equal(data.destinataire_id, sam.id);
});

test("5. Léa ne peut pas créer une demande déjà « acceptée »", async () => {
  const annonceId = await publier(sam, "Photos (test contact) 5");
  const { data, error } = await demander(lea, annonceId, { statut: "acceptee" });
  assert.equal(data, null);
  assert.ok(error);
});

test("6. On ne peut pas se demander le contact à soi-même", async () => {
  const annonceId = await publier(lea, "Coloc (test contact) 6");
  const { data, error } = await demander(lea, annonceId);
  assert.equal(data, null);
  assert.ok(error);
});

test("7. Pas deux fois la même demande", async () => {
  const annonceId = await publier(sam, "Photos (test contact) 7");
  assert.equal((await demander(lea, annonceId)).error, null);
  assert.ok((await demander(lea, annonceId)).error);
});

test("8. Léa ne peut pas accepter sa propre demande", async () => {
  const annonceId = await publier(sam, "Photos (test contact) 8");
  const { data: demande } = await demander(lea, annonceId);
  const { data } = await lea.client
    .from("demandes_contact")
    .update({ statut: "acceptee" })
    .eq("id", demande.id)
    .select();
  assert.deepEqual(data ?? [], []);
  assert.deepEqual(await coordonneesDe(lea, sam), [], "les coordonnées doivent rester cachées");
});

test("9. Sam ne peut changer que le statut (pas le demandeur ni l'annonce)", async () => {
  const annonceId = await publier(sam, "Photos (test contact) 9");
  const { data: demande } = await demander(lea, annonceId);
  const { error } = await sam.client
    .from("demandes_contact")
    .update({ demandeur_id: sam.id })
    .eq("id", demande.id);
  assert.ok(error, "modifier le demandeur doit être refusé");
});

test("10. Si Sam refuse, Léa ne voit toujours pas ses coordonnées", async () => {
  const annonceId = await publier(sam, "Photos (test contact) 10");
  const { data: demande } = await demander(lea, annonceId);
  const { error } = await sam.client.from("demandes_contact").update({ statut: "refusee" }).eq("id", demande.id);
  assert.equal(error, null);
  assert.deepEqual(await coordonneesDe(lea, sam), []);
});

test("11. Si Sam accepte, chacun voit les coordonnées de l'autre", async () => {
  const annonceId = await publier(sam, "Photos (test contact) 11");
  const { data: demande } = await demander(lea, annonceId);
  assert.deepEqual(await coordonneesDe(lea, sam), [], "avant l'accord : caché");

  const { data: reponse, error } = await sam.client
    .from("demandes_contact")
    .update({ statut: "acceptee" })
    .eq("id", demande.id)
    .select()
    .single();
  assert.equal(error, null);
  assert.ok(reponse.repondu_le, "la date de réponse est remplie");

  assert.equal((await coordonneesDe(lea, sam))[0]?.telephone, "06 00 00 00 01");
  assert.equal((await coordonneesDe(sam, lea))[0]?.telephone, "06 00 00 00 02");
});

test("12. Une fois répondue, une demande ne peut plus changer", async () => {
  const annonceId = await publier(sam, "Photos (test contact) 12");
  const { data: demande } = await demander(lea, annonceId);
  await sam.client.from("demandes_contact").update({ statut: "refusee" }).eq("id", demande.id);
  const { data } = await sam.client
    .from("demandes_contact")
    .update({ statut: "acceptee" })
    .eq("id", demande.id)
    .select();
  assert.deepEqual(data ?? [], []);
});

test("13. Léa ne peut modifier ni le prénom ni les coordonnées de Sam", async () => {
  await lea.client.from("profils").update({ prenom: "Piraté" }).eq("id", sam.id);
  await lea.client.from("coordonnees").update({ telephone: "06 66 66 66 66" }).eq("user_id", sam.id);
  const { data: profil } = await sam.client.from("profils").select("prenom").eq("id", sam.id).single();
  assert.equal(profil.prenom, "Testeur C");
  assert.equal((await coordonneesDe(sam, sam))[0].telephone, "06 00 00 00 01");
});

test("14. Léa ne peut pas créer de coordonnées au nom de Sam", async () => {
  const { error } = await lea.client
    .from("coordonnees")
    .insert({ user_id: sam.id, email: "pirate@exemple.fr" });
  assert.ok(error);
});
