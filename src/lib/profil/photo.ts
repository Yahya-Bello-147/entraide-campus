// Photo de profil : vérifications partagées par le site et les tests.

export const TAILLE_MAX_PHOTO = 2 * 1024 * 1024; // 2 Mo, comme l'espace de stockage « photos »

type Format = { extension: "webp" | "jpg" | "png"; type: string };

// On regarde les premiers octets du fichier (sa « signature ») : le nom ou le type annoncé par le
// navigateur peuvent mentir, pas le contenu.
export function formatImage(octets: Uint8Array): Format | null {
  const debut = (...valeurs: number[]) => valeurs.every((v, i) => octets[i] === v);
  if (debut(0xff, 0xd8, 0xff)) return { extension: "jpg", type: "image/jpeg" };
  if (debut(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { extension: "png", type: "image/png" };
  const texte = (de: number, a: number) => String.fromCharCode(...octets.slice(de, a));
  if (octets.length >= 12 && texte(0, 4) === "RIFF" && texte(8, 12) === "WEBP") return { extension: "webp", type: "image/webp" };
  return null;
}

export type ResultatPhoto = { ok: true; format: Format } | { ok: false; erreur: string };

export function verifierPhoto(octets: Uint8Array): ResultatPhoto {
  if (octets.length === 0) return { ok: false, erreur: "Choisis une photo." };
  if (octets.length > TAILLE_MAX_PHOTO) return { ok: false, erreur: "Photo trop lourde : 2 Mo maximum." };
  const format = formatImage(octets);
  if (!format) return { ok: false, erreur: "Ce fichier n'est pas une image JPG, PNG ou WebP." };
  return { ok: true, format };
}

// Adresse publique d'une photo rangée dans l'espace « photos » (null si pas de photo).
export function urlPhoto(chemin: string | null | undefined) {
  if (!chemin) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${chemin}`;
}
