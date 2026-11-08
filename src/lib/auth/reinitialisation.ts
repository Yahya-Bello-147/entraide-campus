// « Mot de passe oublié » : règles partagées par les pages et les tests.

// Le cookie posé quand on arrive par le lien reçu par e-mail (15 minutes pour choisir le nouveau mot de passe).
export const COOKIE_REINITIALISATION = "reinit_mdp";
export const DUREE_REINITIALISATION_S = 15 * 60;

// Le lien de l'e-mail ne vaut qu'une heure : au-delà, on redemande un e-mail.
const DUREE_LIEN_MS = 60 * 60 * 1000;

// Vrai si un e-mail de réinitialisation a été envoyé à ce compte il y a moins d'une heure.
// La date vient de Supabase (recovery_sent_at), pas du navigateur : impossible de la falsifier.
export function reinitialisationRecente(recoverySentAt: string | null | undefined, maintenant = Date.now()) {
  if (!recoverySentAt) return false;
  const envoi = new Date(recoverySentAt).getTime();
  return Number.isFinite(envoi) && maintenant - envoi >= 0 && maintenant - envoi < DUREE_LIEN_MS;
}

export type ResultatNouveauMotDePasse = { ok: true } | { ok: false; erreur: string };

export function validerNouveauMotDePasse(motDePasse: string, confirmation: string): ResultatNouveauMotDePasse {
  if (motDePasse.length < 6) return { ok: false, erreur: "Mot de passe trop court : 6 caractères minimum." };
  if (motDePasse.length > 72) return { ok: false, erreur: "Mot de passe trop long : 72 caractères maximum." };
  if (motDePasse !== confirmation) return { ok: false, erreur: "Les deux mots de passe ne sont pas identiques." };
  return { ok: true };
}
