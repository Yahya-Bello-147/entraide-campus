// Vérification simple, SANS IA : repère les coordonnées évidentes dans le texte d'une annonce.
// Filet de sécurité de la règle d'or n°1, qui marche même si l'IA est en panne.

export type CoordonneeTrouvee = { type: "téléphone" | "e-mail" | "lien"; extrait: string };

const MOTIFS: { type: CoordonneeTrouvee["type"]; motif: RegExp }[] = [
  // 06 12 34 56 78, 0612345678, 06.12.34.56.78, +33 6 12 34 56 78, +336…
  { type: "téléphone", motif: /(?:\+33\s?|0033\s?|\b0)[1-9](?:[\s.-]?\d{2}){4}\b/g },
  { type: "e-mail", motif: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g },
  // http(s)://…, www.…, ou un domaine courant suivi d'un chemin ou seul (leboncoin.fr, sam-photo.com…)
  {
    type: "lien",
    motif: /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:fr|com|net|org|io|me|co|be|eu)(?:\/\S*)?\b/gi,
  },
];

export function detecterCoordonneesEvidentes(texte: string): CoordonneeTrouvee[] {
  const trouvees: CoordonneeTrouvee[] = [];
  let reste = texte;
  for (const { type, motif } of MOTIFS) {
    for (const correspondance of reste.matchAll(motif)) {
      trouvees.push({ type, extrait: correspondance[0].replace(/[.,;:!?)]+$/, "") });
    }
    // On retire ce qui a été trouvé pour ne pas compter un e-mail aussi comme lien.
    reste = reste.replace(motif, " ");
  }
  return trouvees;
}
