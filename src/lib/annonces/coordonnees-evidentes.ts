// Vérification simple, SANS IA : repère les coordonnées évidentes dans le texte d'une annonce.
// Filet de sécurité de la règle d'or n°1, qui marche même si l'IA est en panne.

export type CoordonneeTrouvee = { type: "téléphone" | "e-mail" | "lien" | "réseau social"; extrait: string };

const MOTIFS: { type: CoordonneeTrouvee["type"]; motif: RegExp }[] = [
  // 06 12 34 56 78, 0612345678, 06.12.34.56.78, +33 6 12 34 56 78, +336…
  { type: "téléphone", motif: /(?:\+33\s?|0033\s?|\b0)[1-9](?:[\s.-]?\d{2}){4}\b/g },
  { type: "e-mail", motif: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g },
  // http(s)://…, www.…, ou un domaine courant suivi d'un chemin ou seul (leboncoin.fr, sam-photo.com…)
  {
    type: "lien",
    motif: /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:fr|com|net|org|io|me|co|be|eu)(?:\/\S*)?\b/gi,
  },
  // Ajouté après une faiblesse trouvée en test : quand l'IA est indisponible, ceci reste bloqué.
  // Un réseau social SUIVI d'un pseudo (« mon snap c'est sam.crepes », « insta : @sam »).
  // Une simple mention (« montage pour TikTok et Instagram ») ne déclenche rien.
  {
    type: "réseau social",
    motif:
      /\b(?:snap(?:chat)?|insta(?:gram)?|whats ?app|discord|telegram|tik ?tok|linkedin|facebook|twitter)\b[^\n.,;!?()]{0,25}?(?:@[\w.]{3,}|[a-z0-9][\w#-]*[._#][\w.#-]+)/gi,
  },
  // Un numéro de portable écrit en lettres (« zéro six douze… »).
  { type: "téléphone", motif: /\bz[ée]ro[\s-]+(?:six|sept)\b/gi },
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
