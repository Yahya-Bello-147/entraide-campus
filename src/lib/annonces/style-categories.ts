// Une couleur et une icône par catégorie, utilisées partout (cartes, filtres, détail).
import type { CategorieAnnonce } from "./valider";

export type StyleCategorie = {
  icone: "appareil" | "video" | "code" | "megaphone" | "accueil" | "voiture" | "sac" | "points";
  pastille: { background: string; color: string }; // fond pâle + texte foncé (contraste ≥ 4.5:1)
  vignette: string; // dégradé de l'icône
};

export const STYLE_CATEGORIES: Record<CategorieAnnonce, StyleCategorie> = {
  photo: {
    icone: "appareil",
    pastille: { background: "#fce7f3", color: "#9d174d" },
    vignette: "linear-gradient(135deg, #f472b6, #db2777)",
  },
  video: {
    icone: "video",
    pastille: { background: "#ede9fe", color: "#5b21b6" },
    vignette: "linear-gradient(135deg, #a78bfa, #7c3aed)",
  },
  dev: {
    icone: "code",
    pastille: { background: "#dbeafe", color: "#1e40af" },
    vignette: "linear-gradient(135deg, #60a5fa, #2563eb)",
  },
  community_management: {
    icone: "megaphone",
    pastille: { background: "#ffedd5", color: "#9a3412" },
    vignette: "linear-gradient(135deg, #fb923c, #ea580c)",
  },
  logement: {
    icone: "accueil",
    pastille: { background: "#d1fae5", color: "#065f46" },
    vignette: "linear-gradient(135deg, #34d399, #059669)",
  },
  covoiturage: {
    icone: "voiture",
    pastille: { background: "#cffafe", color: "#155e75" },
    vignette: "linear-gradient(135deg, #22d3ee, #0891b2)",
  },
  objets: {
    icone: "sac",
    pastille: { background: "#fef3c7", color: "#92400e" },
    vignette: "linear-gradient(135deg, #fbbf24, #d97706)",
  },
  autre: {
    icone: "points",
    pastille: { background: "#f1f5f9", color: "#334155" },
    vignette: "linear-gradient(135deg, #94a3b8, #475569)",
  },
};
