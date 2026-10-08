// Nettoyage de la réponse de l'IA : on ne fait jamais confiance au texte renvoyé.

const MAX_COMPETENCES = 10;
const MAX_LONGUEUR = 40;

export function nettoyerCompetences(liste: unknown[]): string[] {
  const vues = new Set<string>();
  const resultat: string[] = [];

  for (const brut of liste) {
    if (typeof brut !== "string") continue;
    const texte = brut
      .replace(/<[^>]*>/g, "") // balises HTML
      .replace(/\s+/g, " ") // retours à la ligne, tabulations
      .trim();
    if (texte.length < 1 || texte.length > MAX_LONGUEUR) continue;

    const cle = texte.toLowerCase();
    if (vues.has(cle)) continue;
    vues.add(cle);
    resultat.push(texte);
    if (resultat.length === MAX_COMPETENCES) break;
  }
  return resultat;
}

// Lit la réponse JSON de l'IA. En cas de réponse illisible : liste vide, jamais d'erreur.
export function lireReponseIA(texte: string | undefined): string[] {
  if (!texte) return [];
  try {
    const donnees = JSON.parse(texte);
    return Array.isArray(donnees?.competences) ? nettoyerCompetences(donnees.competences) : [];
  } catch {
    return [];
  }
}
