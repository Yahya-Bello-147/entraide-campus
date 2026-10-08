"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validerAnnonce, type ChampsAnnonce } from "@/lib/annonces/valider";
import { detecterCoordonneesEvidentes } from "@/lib/annonces/coordonnees-evidentes";
import { verifierAnnonce } from "@/lib/ia/verifier-annonce";
import type { Raison } from "@/lib/ia/verification";

// En cas d'erreur, on renvoie aussi ce qui a été tapé pour ne pas vider le formulaire.
export type EtatPublication = {
  erreur?: string;
  valeurs?: ChampsAnnonce;
  // Alerte de l'assistant d'annonce (IA n°2) : la personne corrige, ou publie quand même.
  avertissement?: { raisons: Raison[]; empreinte: string };
};

// Empreinte du texte vérifié par l'IA : « Publier quand même » ne vaut que pour CE texte.
function empreinte(titre: string, description: string, lieu: string | null) {
  return createHash("sha256").update(`${titre}\n${description}\n${lieu ?? ""}`).digest("hex");
}

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
  const { titre, description, lieu } = resultat.annonce;

  // 1) Vérification simple (sans IA) : coordonnées évidentes → refus, toujours.
  const evidentes = detecterCoordonneesEvidentes(`${titre}\n${description}\n${lieu ?? ""}`);
  if (evidentes.length > 0) {
    const liste = evidentes.map((c) => `${c.type} « ${c.extrait} »`).join(", ");
    return {
      erreur: `Retire ces coordonnées de ton annonce : ${liste}. Elles seront partagées seulement après ton accord, via une demande de contact.`,
      valeurs,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: "Ta session a expiré. Reconnecte-toi pour publier.", valeurs };

  // 2) Assistant d'annonce (IA) : coordonnées déguisées → alerte, la personne décide.
  //    Si l'IA est en panne (null), on publie : la vérification simple a déjà été faite.
  const signature = empreinte(titre, description, lieu);
  const dejaConfirme = lire("confirmer") === signature;
  if (!dejaConfirme) {
    const verification = await verifierAnnonce(titre, description, lieu);
    if (verification?.alerte) {
      return { valeurs, avertissement: { raisons: verification.raisons, empreinte: signature } };
    }
  }

  // L'auteur est rempli par la base (auth.uid()) : impossible de publier au nom de quelqu'un d'autre.
  const { error } = await supabase.from("annonces").insert(resultat.annonce);
  if (error) return { erreur: "L'annonce n'a pas pu être publiée. Réessaie dans un instant.", valeurs };

  revalidatePath("/annonces");
  redirect("/annonces");
}
