// Vérifie et nettoie les champs d'une annonce avant de l'envoyer à la base.
// Les mêmes limites sont imposées dans la base (voir supabase/migrations) : ceci sert à afficher un message clair.

export const TYPES = {
  propose: "Je propose",
  cherche: "Je cherche",
} as const;

export const CATEGORIES = {
  photo: "Photo",
  video: "Vidéo",
  dev: "Dev",
  community_management: "Community management",
  logement: "Logement / coloc",
  covoiturage: "Covoiturage",
  objets: "Objets / vente",
  autre: "Autre",
} as const;

export type TypeAnnonce = keyof typeof TYPES;
export type CategorieAnnonce = keyof typeof CATEGORIES;

export type AnnonceValidee = {
  type: TypeAnnonce;
  categorie: CategorieAnnonce;
  titre: string;
  description: string;
  prix: number | null;
  lieu: string | null;
};

export type ChampsAnnonce = Record<
  "type" | "categorie" | "titre" | "description" | "prix" | "lieu",
  string
>;

export type ResultatValidation =
  | { ok: true; annonce: AnnonceValidee }
  | { ok: false; erreur: string };

export function validerAnnonce(champs: ChampsAnnonce): ResultatValidation {
  const titre = champs.titre.trim();
  const description = champs.description.trim();
  const lieu = champs.lieu.trim();
  const prixTexte = champs.prix.trim().replace(",", ".");

  if (!Object.hasOwn(TYPES, champs.type)) {
    return { ok: false, erreur: "Choisis Je propose ou Je cherche." };
  }
  if (!Object.hasOwn(CATEGORIES, champs.categorie)) {
    return { ok: false, erreur: "Choisis une catégorie dans la liste." };
  }
  if (titre.length < 3 || titre.length > 100) {
    return { ok: false, erreur: "Le titre doit faire entre 3 et 100 caractères." };
  }
  if (description.length < 1 || description.length > 2000) {
    return { ok: false, erreur: "La description doit faire entre 1 et 2000 caractères." };
  }
  if (lieu.length > 100) {
    return { ok: false, erreur: "Le lieu doit faire 100 caractères maximum." };
  }

  let prix: number | null = null;
  if (prixTexte !== "") {
    prix = Number(prixTexte);
    if (!Number.isFinite(prix) || prix < 0) {
      return { ok: false, erreur: "Le prix doit être un nombre positif (ex. 20 ou 12,50)." };
    }
  }

  return {
    ok: true,
    annonce: {
      type: champs.type as TypeAnnonce,
      categorie: champs.categorie as CategorieAnnonce,
      titre,
      description,
      prix,
      lieu: lieu || null,
    },
  };
}
