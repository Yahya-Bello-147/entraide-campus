// Palier 3 « Ça matche » : quelles annonces « Je cherche » correspondent à mes compétences ?
// Règle simple et explicable (pas d'IA) : un mot de la compétence dans l'annonce, et la bonne catégorie.

const MOTS_VIDES = new Set([
  "de", "du", "des", "la", "le", "les", "et", "en", "pour", "un", "une", "au", "aux", "avec", "sur",
  "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "par", "dans", "the", "and", "of",
]);

// Mots d'une compétence qui annoncent une catégorie d'annonce.
const CATEGORIES_PAR_MOT: [string, string][] = [
  ["photo", "photo"], ["retouc", "photo"], ["lightroom", "photo"],
  ["video", "video"], ["montag", "video"], ["film", "video"], ["clip", "video"], ["premiere", "video"],
  ["dev", "dev"], ["develop", "dev"], ["web", "dev"], ["html", "dev"], ["css", "dev"], ["react", "dev"],
  ["code", "dev"], ["informat", "dev"], ["site", "dev"], ["javascript", "dev"], ["python", "dev"],
  ["community", "community_management"], ["reseaux", "community_management"], ["instagram", "community_management"],
  ["tiktok", "community_management"], ["social", "community_management"], ["canva", "community_management"],
];

type AnnonceComparable = { titre: string; description: string; categorie: string };
export type Correspondance = { score: number; competences: string[] };

function normaliser(texte: string) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function motsSignificatifs(texte: string) {
  return normaliser(texte)
    .split(" ")
    .filter((m) => m.length >= 3 && !MOTS_VIDES.has(m));
}

// Un mot court doit être identique (« dev » ≠ « devoir ») ; un mot long compte par son début
// (« photographie » ~ « photographe »).
function motCorrespond(motCompetence: string, motsAnnonce: string[]) {
  if (motCompetence.length <= 4) return motsAnnonce.includes(motCompetence);
  const racine = motCompetence.slice(0, 6);
  return motsAnnonce.some((m) => m.startsWith(racine));
}

function categoriesDe(competence: string) {
  const mots = motsSignificatifs(competence);
  return new Set(
    CATEGORIES_PAR_MOT.filter(([debut]) => mots.some((m) => (debut.length <= 4 ? m === debut : m.startsWith(debut)))).map(
      ([, categorie]) => categorie,
    ),
  );
}

export function correspondance(competences: string[], annonce: AnnonceComparable): Correspondance {
  const motsAnnonce = motsSignificatifs(`${annonce.titre} ${annonce.description}`);
  let score = 0;
  const trouvees: string[] = [];

  for (const competence of competences) {
    let points = motsSignificatifs(competence).filter((m) => motCorrespond(m, motsAnnonce)).length;
    if (categoriesDe(competence).has(annonce.categorie)) points += 2;
    if (points > 0) {
      score += points;
      trouvees.push(competence);
    }
  }
  return { score, competences: trouvees };
}

type AnnonceCandidate = AnnonceComparable & { type: string; statut: string; auteur_id: string };

// Les annonces « Je cherche » actives des autres, de la plus pertinente à la moins pertinente.
export function meilleuresCorrespondances<A extends AnnonceCandidate>(
  competences: string[],
  annonces: A[],
  moi: string,
  nombre = 4,
): { annonce: A; competences: string[]; score: number }[] {
  if (competences.length === 0) return [];
  return annonces
    .filter((a) => a.type === "cherche" && a.statut === "active" && a.auteur_id !== moi)
    .map((annonce) => ({ annonce, ...correspondance(competences, annonce) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, nombre);
}
