import type { ReactNode } from "react";
import type { CategorieAnnonce } from "@/lib/annonces/valider";

// Les dessins pleins des catégories (maquette « icônes style appli » validée le 19 nov).
// Dessinés en blanc sur la tuile en dégradé ; « accent » = la couleur foncée de la catégorie pour les détails.
export function GlyphCategorie({ categorie, taille, accent }: { categorie: CategorieAnnonce; taille: number; accent: string }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 32 32" className="relative drop-shadow-[0_2px_2px_rgb(0_0_0/0.18)]">
      {DESSINS[categorie](accent)}
    </svg>
  );
}

const DESSINS: Record<CategorieAnnonce, (accent: string) => ReactNode> = {
  photo: (a) => (
    <>
      <path d="M11 7h10l2 3h3a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3h3z" fill="#fff" />
      <circle cx="16" cy="18" r="5.2" fill={a} />
      <circle cx="16" cy="18" r="2.6" fill="#fff" opacity=".9" />
      <circle cx="24.5" cy="13.5" r="1.3" fill={a} />
    </>
  ),
  video: (a) => (
    <>
      <rect x="3" y="8" width="19" height="16" rx="4" fill="#fff" />
      <path d="M22 14l7-4v12l-7-4z" fill="#fff" />
      <path d="M10 12.5v7l6-3.5z" fill={a} />
    </>
  ),
  dev: (a) => (
    <>
      <rect x="3" y="6" width="26" height="20" rx="4" fill="#fff" />
      <rect x="3" y="6" width="26" height="5" rx="2.5" fill={a} opacity=".18" />
      <path d="M12 15l-3.5 3.5L12 22M20 15l3.5 3.5L20 22M17.5 14l-3 9" stroke={a} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  community_management: () => (
    <>
      <path d="M5 13h4l13-6v18L9 19H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" fill="#fff" />
      <path d="M9 19l2 7h4l-2-7z" fill="#fff" opacity=".85" />
      <path d="M25 12.5a5 5 0 0 1 0 7" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  ),
  logement: (a) => (
    <>
      <path d="M16 4 3 14.5h3.5V27h19V14.5H29z" fill="#fff" />
      <rect x="13" y="18" width="6" height="9" rx="1.5" fill={a} />
      <rect x="20" y="6" width="3" height="5" fill="#fff" />
    </>
  ),
  covoiturage: (a) => (
    <>
      <path d="M7 14l2.5-6h13L25 14h1a3 3 0 0 1 3 3v5H3v-5a3 3 0 0 1 3-3z" fill="#fff" />
      <path d="M10.5 9.5h11l1.6 4.5H8.9z" fill={a} opacity=".2" />
      <circle cx="9" cy="23" r="3.2" fill={a} />
      <circle cx="23" cy="23" r="3.2" fill={a} />
    </>
  ),
  objets: (a) => (
    <>
      <path d="M6 10h20l-1.5 16a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" fill="#fff" />
      <path d="M11.5 13V9a4.5 4.5 0 0 1 9 0v4" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="11.5" cy="14" r="1.4" fill={a} />
      <circle cx="20.5" cy="14" r="1.4" fill={a} />
    </>
  ),
  autre: () => <path d="M16 5l2.6 7.4L26 15l-7.4 2.6L16 25l-2.6-7.4L6 15l7.4-2.6z" fill="#fff" />,
};
