"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { aUnProfilComplet } from "@/lib/profil/profil-complet";

async function utilisateurConnecte() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");
  return { supabase, user };
}

// Léa demande le contact de l'auteur d'une annonce.
// Le destinataire est rempli par la base : on n'envoie que l'annonce.
export async function demanderContact(formData: FormData) {
  const { supabase, user } = await utilisateurConnecte();
  if (!(await aUnProfilComplet(supabase, user.id))) redirect("/profil?raison=incomplet");

  const annonceId = String(formData.get("annonceId") ?? "");
  await supabase.from("demandes_contact").insert({ annonce_id: annonceId });

  revalidatePath("/annonces");
  revalidatePath("/demandes");
}

// Sam accepte ou refuse. La base vérifie que c'est bien lui le destinataire.
export async function repondreDemande(formData: FormData) {
  const { supabase } = await utilisateurConnecte();
  const demandeId = String(formData.get("demandeId") ?? "");
  const reponse = formData.get("reponse") === "acceptee" ? "acceptee" : "refusee";

  await supabase.from("demandes_contact").update({ statut: reponse }).eq("id", demandeId);

  revalidatePath("/demandes");
  revalidatePath("/annonces");
}
