// Vérifie et nettoie le formulaire « Mon profil ». Mêmes limites que dans la base.

export type ChampsProfil = Record<"prenom" | "email" | "telephone", string>;

export type ProfilValide = { prenom: string; email: string; telephone: string | null };

export type ResultatProfil = { ok: true; profil: ProfilValide } | { ok: false; erreur: string };

const FORMAT_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const FORMAT_TELEPHONE = /^[0-9 +().-]{6,20}$/;

export function validerProfil(champs: ChampsProfil): ResultatProfil {
  const prenom = champs.prenom.trim();
  const email = champs.email.trim().toLowerCase();
  const telephone = champs.telephone.trim();

  if (prenom.length < 1 || prenom.length > 50) {
    return { ok: false, erreur: "Ton prénom doit faire entre 1 et 50 caractères." };
  }
  if (email.length > 254 || !FORMAT_EMAIL.test(email)) {
    return { ok: false, erreur: "Cette adresse e-mail n'est pas valide." };
  }
  if (telephone && !FORMAT_TELEPHONE.test(telephone)) {
    return { ok: false, erreur: "Le téléphone ne doit contenir que des chiffres (ex. 06 12 34 56 78)." };
  }

  return { ok: true, profil: { prenom, email, telephone: telephone || null } };
}
