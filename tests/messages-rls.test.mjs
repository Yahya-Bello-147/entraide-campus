// Tests de la règle d'or n°3 : « Une conversation n'est lisible que par ses deux participants. »
// Comptes réservés aux tests : C (« sam », auteur), D (« léa », demandeuse), E (« intrus »).

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const nouveauClient = () =>
  createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });

async function clientConnecte(lettre) {
  const client = nouveauClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: process.env[`TEST_COMPTE_${lettre}_EMAIL`],
    password: process.env[`TEST_COMPTE_${lettre}_MDP`],
  });
  if (error) throw new Error(`Connexion impossible (compte ${lettre}) : ${error.message}`);
  return { client, id: data.user.id };
}

let sam, lea, intrus;
const annonces = [];

// Crée une annonce de Sam + une demande de Léa, avec le statut voulu.
async function conversation(statut) {
  const { data: annonce, error } = await sam.client
    .from("annonces")
    .insert({ type: "propose", categorie: "photo", titre: `Photos (test messages) ${statut}`, description: "Test automatique." })
    .select("id")
    .single();
  if (error) throw error;
  annonces.push(annonce.id);
  const { data: demande } = await lea.client.from("demandes_contact").insert({ annonce_id: annonce.id }).select("id").single();
  if (statut !== "en_attente") {
    await sam.client.from("demandes_contact").update({ statut }).eq("id", demande.id);
  }
  return demande.id;
}

const ecrire = (qui, demandeId, contenu, champs = {}) =>
  qui.client.from("messages").insert({ demande_id: demandeId, contenu, ...champs }).select().single();

const lire = async (qui, demandeId) => {
  const { data } = await qui.client.from("messages").select("contenu, auteur_id").eq("demande_id", demandeId);
  return data ?? [];
};

before(async () => {
  [sam, lea, intrus] = await Promise.all([clientConnecte("C"), clientConnecte("D"), clientConnecte("E")]);
  await sam.client.from("annonces").delete().like("titre", "%(test messages)%");
});

after(async () => {
  if (annonces.length) await sam.client.from("annonces").delete().in("id", annonces);
});

test("1. Après accord, Sam et Léa s'écrivent et lisent toute la conversation", async () => {
  const id = await conversation("acceptee");
  assert.equal((await ecrire(sam, id, "Salut Léa, c'est pour quelle date ?")).error, null);
  assert.equal((await ecrire(lea, id, "Le 12 décembre !")).error, null);
  assert.equal((await lire(sam, id)).length, 2);
  assert.equal((await lire(lea, id)).length, 2);
});

test("2. Un intrus connecté ne peut PAS lire la conversation", async () => {
  const id = await conversation("acceptee");
  await ecrire(sam, id, "Message privé");
  assert.deepEqual(await lire(intrus, id), []);
  const { data } = await intrus.client.from("messages").select("contenu");
  assert.ok(!(data ?? []).some((m) => m.contenu === "Message privé"), "aucun message d'autrui, même sans filtre");
});

test("3. Un intrus ne peut PAS écrire dans la conversation", async () => {
  const id = await conversation("acceptee");
  const { data, error } = await ecrire(intrus, id, "Coucou je m'incruste");
  assert.equal(data, null);
  assert.ok(error);
});

test("4. Une personne non connectée ne lit aucun message", async () => {
  const id = await conversation("acceptee");
  await ecrire(sam, id, "Bonjour");
  const { data } = await nouveauClient().from("messages").select("*");
  assert.deepEqual(data ?? [], []);
});

test("5. Pas de message tant que la demande est en attente", async () => {
  const id = await conversation("en_attente");
  assert.ok((await ecrire(lea, id, "Alors, tu acceptes ?")).error);
  assert.ok((await ecrire(sam, id, "Je réfléchis")).error);
});

test("6. Pas de message après un refus", async () => {
  const id = await conversation("refusee");
  assert.ok((await ecrire(lea, id, "Pourquoi ?")).error);
});

test("7. Léa ne peut pas écrire au nom de Sam", async () => {
  const id = await conversation("acceptee");
  const { data, error } = await ecrire(lea, id, "Je suis Sam (pas vraiment)", { auteur_id: sam.id });
  assert.equal(data, null);
  assert.ok(error);
});

test("8. Un message envoyé ne peut être ni modifié ni supprimé", async () => {
  const id = await conversation("acceptee");
  const { data: message } = await ecrire(sam, id, "Original");
  await sam.client.from("messages").update({ contenu: "Modifié" }).eq("id", message.id);
  await lea.client.from("messages").delete().eq("id", message.id);
  const contenus = (await lire(sam, id)).map((m) => m.contenu);
  assert.deepEqual(contenus, ["Original"]);
});

test("9. Message vide ou trop long refusé", async () => {
  const id = await conversation("acceptee");
  assert.ok((await ecrire(sam, id, "   ")).error);
  assert.ok((await ecrire(sam, id, "x".repeat(1001))).error);
});
