"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validerAnnonce, type ChampsAnnonce } from "@/lib/annonces/valider";

// En cas d'erreur, on renvoie aussi ce qui a été tapé pour ne pas vider le formulaire.
export type EtatPublication = { erreur?: string; valeurs?: ChampsAnnonce };

export async function publierAnnonce(
  _etat: EtatPublication,
  formData: FormData,
): Promise<EtatPublication> {
  const lire = (nom: string) => String(formData.get(nom) ?? "");
  const valeurs: ChampsAnnonce = {
    type: lire("type"),
    categorie: lire("categorie"),
    titre: lire("titre"),
    description: lire("description"),
    prix: lire("prix"),
    lieu: lire("lieu"),
  };
  const resultat = validerAnnonce(valeurs);
  if (!resultat.ok) return { erreur: resultat.erreur, valeurs };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: "Ta session a expiré. Reconnecte-toi pour publier.", valeurs };

  // L'auteur est rempli par la base (auth.uid()) : impossible de publier au nom de quelqu'un d'autre.
  const { error } = await supabase.from("annonces").insert(resultat.annonce);
  if (error) return { erreur: "L'annonce n'a pas pu être publiée. Réessaie dans un instant.", valeurs };

  revalidatePath("/annonces");
  redirect("/annonces");
}
