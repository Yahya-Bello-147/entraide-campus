// Lecture de la proposition d'annonce rédigée par l'IA (rôle RÉDIGER de l'assistant).
// Elle ne fait que PRÉ-REMPLIR le formulaire : la personne relit, corrige, puis publie.
import { CATEGORIES, TYPES, type ChampsAnnonce } from "../annonces/valider.ts";

const texte = (valeur: unknown, max: number) =>
  typeof valeur === "string"
    ? valeur.replace(/<[^>]*>/g, "").replace(/[ \t]+/g, " ").trim().slice(0, max)
    : "";

export function lireProposition(reponse: string | undefined): ChampsAnnonce | null {
  if (!reponse) return null;
  let d: Record<string, unknown>;
  try {
    d = JSON.parse(reponse);
  } catch {
    return null;
  }
  if (typeof d !== "object" || d === null) return null;

  const titre = texte(d.titre, 100);
  const description = texte(d.description, 2000);
  if (!titre || !description) return null;

  const prix = typeof d.prix === "number" && Number.isFinite(d.prix) && d.prix >= 0 ? String(d.prix).replace(".", ",") : "";

  return {
    type: typeof d.type === "string" && Object.hasOwn(TYPES, d.type) ? d.type : "propose",
    categorie: typeof d.categorie === "string" && Object.hasOwn(CATEGORIES, d.categorie) ? d.categorie : "autre",
    titre,
    description,
    prix,
    lieu: texte(d.lieu, 100),
  };
}
