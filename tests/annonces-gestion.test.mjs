// Gérer ses annonces : statut « Pourvue », et ce que la base autorise ou refuse.
// Comptes réservés aux tests : C (« sam », auteur) et D (« léa »).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const nouveauClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

async function clientConnecte(lettre) {
  const client = nouveauClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: process.env[`TEST_COMPTE_${lettre}_EMAIL`],
    password: process.env[`TEST_COMPTE_${lettre}_MDP`],
  });
  if (error) throw new Error(`Connexion impossible (compte ${lettre}) : ${error.message}`);
  return { client, id: data.user.id };
}

let sam, lea;
const annonces = [];

async function publier(titre = "Objet (test gestion)") {
  const { data, error } = await sam.client
    .from("annonces")
    .insert({ type: "propose", categorie: "objets", titre, description: "Test automatique." })
    .select("id, statut")
    .single();
  if (error) throw error;
  annonces.push(data.id);
  return data;
}

const statutDe = async (id) =>
  (await sam.client.from("annonces").select("statut").eq("id", id).single()).data?.statut;

before(async () => {
  [sam, lea] = await Promise.all([clientConnecte("C"), clientConnecte("D")]);
  await sam.client.from("annonces").delete().like("titre", "%(test gestion)%");
});

after(async () => {
  if (annonces.length) await sam.client.from("annonces").delete().in("id", annonces);
});

test("1. Une nouvelle annonce est « active » par défaut", async () => {
  assert.equal((await publier()).statut, "active");
});

test("2. Sam marque son annonce « pourvue », puis la réactive", async () => {
  const { id } = await publier();
  assert.equal((await sam.client.from("annonces").update({ statut: "pourvue" }).eq("id", id)).error, null);
  assert.equal(await statutDe(id), "pourvue");
  await sam.client.from("annonces").update({ statut: "active" }).eq("id", id);
  assert.equal(await statutDe(id), "active");
});

test("3. Léa ne peut pas marquer l'annonce de Sam comme pourvue", async () => {
  const { id } = await publier();
  await lea.client.from("annonces").update({ statut: "pourvue" }).eq("id", id);
  assert.equal(await statutDe(id), "active");
});

test("4. Un statut inconnu est refusé par la base", async () => {
  const { id } = await publier();
  assert.ok((await sam.client.from("annonces").update({ statut: "supprimee" }).eq("id", id)).error);
});

test("5. La base refuse une demande de contact sur une annonce pourvue", async () => {
  const { id } = await publier();
  await sam.client.from("annonces").update({ statut: "pourvue" }).eq("id", id);
  const { data, error } = await lea.client.from("demandes_contact").insert({ annonce_id: id }).select().single();
  assert.equal(data, null);
  assert.ok(error, "la demande aurait dû être refusée");
});

test("6. Une annonce réactivée accepte de nouveau les demandes", async () => {
  const { id } = await publier();
  await sam.client.from("annonces").update({ statut: "pourvue" }).eq("id", id);
  await sam.client.from("annonces").update({ statut: "active" }).eq("id", id);
  const { error } = await lea.client.from("demandes_contact").insert({ annonce_id: id });
  assert.equal(error, null);
});

test("7. Une conversation déjà ouverte continue après « pourvue »", async () => {
  const { id } = await publier();
  const { data: demande } = await lea.client.from("demandes_contact").insert({ annonce_id: id }).select("id").single();
  await sam.client.from("demandes_contact").update({ statut: "acceptee" }).eq("id", demande.id);
  await sam.client.from("annonces").update({ statut: "pourvue" }).eq("id", id);
  const { error } = await lea.client.from("messages").insert({ demande_id: demande.id, contenu: "Merci pour la vente !" });
  assert.equal(error, null);
});
