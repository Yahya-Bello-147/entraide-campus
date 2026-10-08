// Lecture de la réponse de l'IA « assistant d'annonce » (vérification des coordonnées cachées).

export type Raison = { extrait: string; explication: string };
export type Verification = { alerte: boolean; raisons: Raison[] };

const nettoyer = (valeur: unknown, max: number) =>
  typeof valeur === "string"
    ? valeur.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max)
    : "";

// Renvoie null si la réponse est illisible : on fait alors comme si l'IA n'avait pas pu vérifier.
export function lireVerification(texte: string | undefined): Verification | null {
  if (!texte) return null;
  let donnees: unknown;
  try {
    donnees = JSON.parse(texte);
  } catch {
    return null;
  }
  if (typeof donnees !== "object" || donnees === null || typeof (donnees as { probleme?: unknown }).probleme !== "boolean") {
    return null;
  }
  const { probleme, raisons } = donnees as { probleme: boolean; raisons?: unknown };
  if (!probleme) return { alerte: false, raisons: [] };

  const liste = (Array.isArray(raisons) ? raisons : [])
    .map((r) => ({ extrait: nettoyer(r?.extrait, 80), explication: nettoyer(r?.explication, 200) }))
    .filter((r) => r.explication)
    .slice(0, 3);

  return {
    alerte: true,
    raisons: liste.length
      ? liste
      : [{ extrait: "", explication: "L'annonce semble contenir un moyen de te contacter directement." }],
  };
}
