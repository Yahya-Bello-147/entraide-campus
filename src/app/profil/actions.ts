"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validerProfil, type ChampsProfil } from "@/lib/profil/valider";

export type EtatProfil = { erreur?: string; succes?: boolean; valeurs?: ChampsProfil };

export async function enregistrerProfil(_etat: EtatProfil, formData: FormData): Promise<EtatProfil> {
  const lire = (nom: string) => String(formData.get(nom) ?? "");
  const valeurs: ChampsProfil = { prenom: lire("prenom"), email: lire("email"), telephone: lire("telephone") };
  const resultat = validerProfil(valeurs);
  if (!resultat.ok) return { erreur: resultat.erreur, valeurs };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: "Ta session a expiré. Reconnecte-toi.", valeurs };

  const { prenom, email, telephone } = resultat.profil;
  const { error: erreurProfil } = await supabase.from("profils").upsert({ id: user.id, prenom });
  const { error: erreurCoordonnees } = await supabase
    .from("coordonnees")
    .upsert({ user_id: user.id, email, telephone, updated_at: new Date().toISOString() });
  if (erreurProfil || erreurCoordonnees) {
    return { erreur: "Le profil n'a pas pu être enregistré. Réessaie dans un instant.", valeurs };
  }

  revalidatePath("/", "layout");
  return { succes: true, valeurs: { prenom, email, telephone: telephone ?? "" } };
}
