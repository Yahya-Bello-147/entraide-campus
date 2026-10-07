"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EtatFormulaire = { erreur?: string };

// Traduit les erreurs Supabase en messages clairs pour l'utilisateur.
function messageErreur(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "E-mail ou mot de passe incorrect.";
    case "user_already_exists":
    case "email_exists":
      return "Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.";
    case "weak_password":
      return "Mot de passe trop faible : 6 caractères minimum.";
    case "email_address_invalid":
      return "Cette adresse e-mail n'est pas valide.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Trop d'essais. Patiente quelques minutes puis réessaie.";
    default:
      return "Une erreur est survenue. Réessaie dans un instant.";
  }
}

function lireChamps(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    motDePasse: String(formData.get("motDePasse") ?? ""),
  };
}

export async function inscription(
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const { email, motDePasse } = lireChamps(formData);
  if (!email.includes("@")) return { erreur: "Cette adresse e-mail n'est pas valide." };
  if (motDePasse.length < 6) return { erreur: "Mot de passe trop court : 6 caractères minimum." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password: motDePasse });
  if (error) return { erreur: messageErreur(error.code) };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function connexion(
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const { email, motDePasse } = lireChamps(formData);
  if (!email || !motDePasse) return { erreur: "Remplis l'e-mail et le mot de passe." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
  if (error) return { erreur: messageErreur(error.code) };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function deconnexion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
