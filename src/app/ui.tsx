import type { ReactNode } from "react";
import { Icone } from "./icone";
import { STYLE_CATEGORIES } from "@/lib/annonces/style-categories";
import { CATEGORIES, type CategorieAnnonce } from "@/lib/annonces/valider";

// Couleurs d'avatar, choisies d'après le prénom (toujours la même pour une personne).
const COULEURS_AVATAR = [
  { background: "#ede9fe", color: "#5b21b6" },
  { background: "#fce7f3", color: "#9d174d" },
  { background: "#dbeafe", color: "#1e40af" },
  { background: "#d1fae5", color: "#065f46" },
  { background: "#ffedd5", color: "#9a3412" },
];

export function Avatar({ prenom, taille = 36 }: { prenom?: string | null; taille?: number }) {
  const nom = (prenom ?? "").trim() || "?";
  const index = [...nom].reduce((somme, c) => somme + c.charCodeAt(0), 0) % COULEURS_AVATAR.length;
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold"
      style={{ width: taille, height: taille, fontSize: taille * 0.4, ...COULEURS_AVATAR[index] }}
    >
      {nom[0].toUpperCase()}
    </span>
  );
}

export function PastilleCategorie({ categorie }: { categorie: CategorieAnnonce }) {
  const style = STYLE_CATEGORIES[categorie];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
      style={style.pastille}
    >
      <Icone nom={style.icone} taille={14} />
      {CATEGORIES[categorie]}
    </span>
  );
}

export function VignetteCategorie({ categorie, taille = 54 }: { categorie: CategorieAnnonce; taille?: number }) {
  const style = STYLE_CATEGORIES[categorie];
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-2xl text-white"
      style={{ width: taille, height: taille, backgroundImage: style.vignette }}
    >
      <Icone nom={style.icone} taille={Math.round(taille * 0.48)} />
    </span>
  );
}

// En-tête de page : grand titre + sous-titre facultatif + actions à droite.
export function TitrePage({
  titre,
  sousTitre,
  actions,
}: {
  titre: string;
  sousTitre?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="titre text-3xl text-indigo sm:text-4xl">{titre}</h1>
        {sousTitre && <p className="mt-1 text-gris">{sousTitre}</p>}
      </div>
      {actions}
    </div>
  );
}

// État vide : une invitation, pas une excuse.
export function EtatVide({
  icone,
  titre,
  texte,
  action,
}: {
  icone: Parameters<typeof Icone>[0]["nom"];
  titre: string;
  texte: string;
  action?: ReactNode;
}) {
  return (
    <div className="carte flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/10 text-violet">
        <Icone nom={icone} taille={26} />
      </span>
      <p className="text-lg font-bold">{titre}</p>
      <p className="max-w-sm text-sm text-gris">{texte}</p>
      {action}
    </div>
  );
}
