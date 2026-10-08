"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EtatMessage = { erreur?: string; brouillon?: string; envoi?: number };

// La base vérifie que la demande est acceptée et que l'on en fait partie (règle d'or n°3).
export async function envoyerMessage(precedent: EtatMessage, formData: FormData): Promise<EtatMessage> {
  const demandeId = String(formData.get("demandeId") ?? "");
  const contenu = String(formData.get("contenu") ?? "").trim();
  const envoi = (precedent.envoi ?? 0) + 1;

  if (contenu.length < 1) return { erreur: "Ton message est vide.", envoi };
  if (contenu.length > 1000) return { erreur: "Ton message est trop long (1000 caractères maximum).", brouillon: contenu, envoi };

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({ demande_id: demandeId, contenu });
  if (error) {
    return { erreur: "Le message n'a pas pu être envoyé. Réessaie dans un instant.", brouillon: contenu, envoi };
  }

  revalidatePath(`/messages/${demandeId}`);
  revalidatePath("/messages");
  return { envoi };
}
