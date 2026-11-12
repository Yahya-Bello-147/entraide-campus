// Les 6 campus de l'ESP (l'ancienne ESD est devenue l'ESP ; les adresses @mail-esd.com restent valables).
export const CAMPUS = ["Bordeaux", "Nantes", "Lyon", "Paris", "Toulouse", "Lille"] as const;

export type Campus = (typeof CAMPUS)[number];

// Photo du bâtiment de chaque campus (public/campus/, photos de l'ESP, créditées « Photo : ESP » sur le site).
export function photoCampus(campus: Campus) {
  return `/campus/${campus.toLowerCase()}.jpg`;
}
