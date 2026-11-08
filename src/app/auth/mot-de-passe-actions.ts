"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { messageErreur } from "@/lib/auth/messages";
import {
  COOKIE_REINITIALISATION,
  reinitialisationRecente,
  validerNouveauMotDePasse,
} from "@/lib/auth/reinitialisation";

export type EtatMotDePasse = { erreur?: string; envoye?: boolean };

// Étape 1 : envoyer l'e-mail avec le lien. Même réponse que le compte existe ou non,
// pour que personne ne puisse s'en servir pour savoir quelles adresses ont un compte.
export async function demanderReinitialisation(_etat: EtatMotDePasse, formData: FormData): Promise<EtatMotDePasse> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@") || email.length > 254) return { erreur: "Cette adresse e-mail n'est pas valide." };

  // Le lien de l'e-mail revient sur ce site. Supabase refuse toute adresse absente de sa liste autorisée.
  const entetes = await headers();
  const origine = `${entetes.get("x-forwarded-proto") ?? "https"}://${entetes.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origine}/auth/confirmer` });
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { erreur: messageErreur(error.code) };
  }
  return { envoye: true };
}

// Étape 2 : choisir le nouveau mot de passe, seulement en arrivant par le lien de l'e-mail.
export async function changerMotDePasse(_etat: EtatMotDePasse, formData: FormData): Promise<EtatMotDePasse> {
  const motDePasse = String(formData.get("motDePasse") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  const resultat = validerNouveauMotDePasse(motDePasse, confirmation);
  if (!resultat.ok) return { erreur: resultat.erreur };

  const cookieStore = await cookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !cookieStore.has(COOKIE_REINITIALISATION) || !reinitialisationRecente(user.recovery_sent_at)) {
    return { erreur: "Ce lien a expiré. Redemande un e-mail depuis « Mot de passe oublié ? »." };
  }

  const { error } = await supabase.auth.updateUser({ password: motDePasse });
  if (error?.code === "same_password") return { erreur: "Choisis un mot de passe différent de l'ancien." };
  if (error) return { erreur: messageErreur(error.code) };

  cookieStore.delete(COOKIE_REINITIALISATION);
  revalidatePath("/", "layout");
  redirect("/");
}
