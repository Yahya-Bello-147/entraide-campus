// L'inscription est réservée aux adresses de l'école.
// Niveau 1 (ici) : message clair sur la page. Niveau 2 : la base refuse aussi
// (supabase/migrations/…_domaines_ecole.sql), même si on contourne la page.

export const DOMAINES_ECOLE = ["mail-esd.com", "mail-esp.com", "ecole-digital.com"];

export const MESSAGE_DOMAINES =
  "L'inscription est réservée aux adresses de l'école : @mail-esd.com, @mail-esp.com et @ecole-digital.com.";

export function adresseEcole(email: string): boolean {
  const morceaux = email.trim().toLowerCase().split("@");
  if (morceaux.length !== 2 || !morceaux[0]) return false;
  return DOMAINES_ECOLE.includes(morceaux[1]);
}
