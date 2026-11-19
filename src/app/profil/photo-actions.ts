"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifierPhoto } from "@/lib/profil/photo";

export type EtatPhoto = { erreur?: string; succes?: string };

// La photo arrive déjà réduite (400 × 400) et sans métadonnées (lieu, appareil…) : le navigateur la redessine.
// Ici on revérifie tout : on ne fait jamais confiance au navigateur.
export async function changerPhoto(formData: FormData): Promise<EtatPhoto> {
  const fichier = formData.get("photo");
  if (!(fichier instanceof File)) return { erreur: "Choisis une photo." };
  const octets = new Uint8Array(await fichier.arrayBuffer());
  const verification = verifierPhoto(octets);
  if (!verification.ok) return { erreur: verification.erreur };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: "Ta session a expiré. Reconnecte-toi." };

  const { data: profil } = await supabase.from("profils").select("photo").eq("id", user.id).maybeSingle();
  if (!profil) return { erreur: "Enregistre d'abord tes informations (prénom, campus), puis ajoute ta photo." };

  // Un nouveau nom à chaque fois : la nouvelle photo s'affiche tout de suite, sans ancienne copie en cache.
  const chemin = `${user.id}/${Date.now()}.${verification.format.extension}`;
  const { error: erreurEnvoi } = await supabase.storage
    .from("photos")
    .upload(chemin, octets, { contentType: verification.format.type, upsert: false });
  if (erreurEnvoi) return { erreur: "La photo n'a pas pu être envoyée. Réessaie dans un instant." };

  const { error } = await supabase.from("profils").update({ photo: chemin }).eq("id", user.id);
  if (error) {
    await supabase.storage.from("photos").remove([chemin]);
    return { erreur: "La photo n'a pas pu être enregistrée. Réessaie dans un instant." };
  }
  if (profil.photo) await supabase.storage.from("photos").remove([profil.photo as string]);

  revalidatePath("/", "layout");
  return { succes: "Photo enregistrée" };
}

export async function retirerPhoto(): Promise<EtatPhoto> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: "Ta session a expiré. Reconnecte-toi." };

  const { data: profil } = await supabase.from("profils").select("photo").eq("id", user.id).maybeSingle();
  if (!profil?.photo) return {};
  const { error } = await supabase.from("profils").update({ photo: null }).eq("id", user.id);
  if (error) return { erreur: "La photo n'a pas pu être retirée. Réessaie dans un instant." };
  await supabase.storage.from("photos").remove([profil.photo as string]);

  revalidatePath("/", "layout");
  return { succes: "Photo retirée" };
}
