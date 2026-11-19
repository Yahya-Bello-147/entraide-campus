// Une couleur et une icône par catégorie, utilisées partout (cartes, filtres, détail).
import type { CategorieAnnonce } from "./valider";

export type StyleCategorie = {
  icone: "appareil" | "video" | "code" | "megaphone" | "accueil" | "voiture" | "sac" | "points";
  pastille: { background: string; color: string }; // fond pâle + texte foncé (contraste ≥ 4.5:1)
  vignette: string; // dégradé de la tuile (style appli, 19 nov)
  accent: string; // couleur foncée : détails du dessin et ombre de la tuile
};

export const STYLE_CATEGORIES: Record<CategorieAnnonce, StyleCategorie> = {
  photo: {
    icone: "appareil",
    pastille: { background: "#fce7f3", color: "#9d174d" },
    vignette: "linear-gradient(145deg, #ff7a9c, #e11d48)",
    accent: "#e11d48",
  },
  video: {
    icone: "video",
    pastille: { background: "#ede9fe", color: "#5b21b6" },
    vignette: "linear-gradient(145deg, #b388eb, #7c3aed)",
    accent: "#7c3aed",
  },
  dev: {
    icone: "code",
    pastille: { background: "#dbeafe", color: "#1e40af" },
    vignette: "linear-gradient(145deg, #60a5fa, #2563eb)",
    accent: "#2563eb",
  },
  community_management: {
    icone: "megaphone",
    pastille: { background: "#ffedd5", color: "#9a3412" },
    vignette: "linear-gradient(145deg, #fdba74, #ea580c)",
    accent: "#ea580c",
  },
  logement: {
    icone: "accueil",
    pastille: { background: "#d1fae5", color: "#065f46" },
    vignette: "linear-gradient(145deg, #6ee7b7, #059669)",
    accent: "#059669",
  },
  covoiturage: {
    icone: "voiture",
    pastille: { background: "#cffafe", color: "#155e75" },
    vignette: "linear-gradient(145deg, #67e8f9, #0891b2)",
    accent: "#0e7490",
  },
  objets: {
    icone: "sac",
    pastille: { background: "#fef3c7", color: "#92400e" },
    vignette: "linear-gradient(145deg, #fcd34d, #d97706)",
    accent: "#d97706",
  },
  autre: {
    icone: "points",
    pastille: { background: "#f1f5f9", color: "#334155" },
    vignette: "linear-gradient(145deg, #c4b5fd, #8e66b8)",
    accent: "#8e66b8",
  },
};
