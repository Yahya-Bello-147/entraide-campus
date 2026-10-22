// Niveau 2 : la BASE refuse les comptes hors école, même si on contourne la page d'inscription
// (attaque « clé publique » : on parle directement à Supabase).
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const nouveauClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

const unique = () => `essai-domaine-${randomBytes(4).toString("hex")}`;
const motDePasse = randomBytes(12).toString("base64url");

for (const domaine of ["gmail.com", "mail-esd.com.faux-site.fr", "faux-mail-esd.com", "sous.mail-esd.com"]) {
  test(`la base refuse un compte @${domaine}, même sans passer par la page`, async () => {
    const { data, error } = await nouveauClient().auth.signUp({ email: `${unique()}@${domaine}`, password: motDePasse });
    assert.ok(error, "l'inscription aurait dû être refusée");
    assert.equal(data.user, null);
  });
}

test("un compte existant ne peut pas changer son adresse pour une adresse hors école", async () => {
  const client = nouveauClient();
  const { data: connexion, error: e1 } = await client.auth.signInWithPassword({
    email: process.env.TEST_COMPTE_C_EMAIL,
    password: process.env.TEST_COMPTE_C_MDP,
  });
  if (e1) throw e1;
  const avant = connexion.user.email;

  const { error } = await client.auth.updateUser({ email: `${unique()}@gmail.com` });

  const { data } = await client.auth.getUser();
  assert.ok(error, "le changement d'adresse aurait dû être refusé");
  assert.equal(data.user.email, avant, "l'adresse ne doit pas avoir changé");
  assert.ok(!data.user.new_email, "aucun changement d'adresse ne doit être en attente");
});
