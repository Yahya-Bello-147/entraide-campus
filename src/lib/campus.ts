// Les 6 campus de l'ESP (l'ancienne ESD est devenue l'ESP ; les adresses @mail-esd.com restent valables).
export const CAMPUS = ["Bordeaux", "Nantes", "Lyon", "Paris", "Toulouse", "Lille"] as const;

export type Campus = (typeof CAMPUS)[number];
