"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validerAnnonce, type AnnonceValidee, type ChampsAnnonce } from "@/lib/annonces/valider";
import { detecterCoordonneesEvidentes } from "@/lib/annonces/coordonnees-evidentes";
import { verifierAnnonce } from "@/lib/ia/verifier-annonce";
import { redigerAnnonce } from "@/lib/ia/rediger-annonce";
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

type Controle =
  | { ok: true; annonce: AnnonceValidee; valeurs: ChampsAnnonce; supabase: Awaited<ReturnType<typeof createClient>> }
  | { ok: false; etat: EtatPublication };

// Les MÊMES contrôles pour publier ET pour modifier : sinon on pourrait publier une annonce propre,
// puis la modifier pour y glisser son numéro (et contourner la règle d'or n°1).
async function controlerAnnonce(formData: FormData): Promise<Controle> {
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
  if (!resultat.ok) return { ok: false, etat: { erreur: resultat.erreur, valeurs } };
  const { titre, description, lieu } = resultat.annonce;

  // 1) Vérification simple (sans IA) : coordonnées évidentes → refus, toujours.
  const evidentes = detecterCoordonneesEvidentes(`${titre}\n${description}\n${lieu ?? ""}`);
  if (evidentes.length > 0) {
    const liste = evidentes.map((c) => `${c.type} « ${c.extrait} »`).join(", ");
    return {
      ok: false,
      etat: {
        erreur: `Retire ces coordonnées de ton annonce : ${liste}. Elles seront partagées seulement après ton accord, via une demande de contact.`,
        valeurs,
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, etat: { erreur: "Ta session a expiré. Reconnecte-toi.", valeurs } };

  // 2) Assistant d'annonce (IA) : coordonnées déguisées → alerte, la personne décide.
  //    Si l'IA est en panne (null), on continue : la vérification simple a déjà été faite.
  const signature = empreinte(titre, description, lieu);
  if (lire("confirmer") !== signature) {
    const verification = await verifierAnnonce(titre, description, lieu);
    if (verification?.alerte) {
      return { ok: false, etat: { valeurs, avertissement: { raisons: verification.raisons, empreinte: signature } } };
    }
  }
  return { ok: true, annonce: resultat.annonce, valeurs, supabase };
}

export async function publierAnnonce(_etat: EtatPublication, formData: FormData): Promise<EtatPublication> {
  const controle = await controlerAnnonce(formData);
  if (!controle.ok) return controle.etat;

  // L'auteur est rempli par la base (auth.uid()) : impossible de publier au nom de quelqu'un d'autre.
  const { error } = await controle.supabase.from("annonces").insert(controle.annonce);
  if (error) return { erreur: "L'annonce n'a pas pu être publiée. Réessaie dans un instant.", valeurs: controle.valeurs };

  revalidatePath("/annonces");
  redirect("/annonces");
}

// Modifier : seul l'auteur peut (la base le garantit). Si ce n'est pas le sien, rien n'est modifié.
export async function modifierAnnonce(
  annonceId: string,
  _etat: EtatPublication,
  formData: FormData,
): Promise<EtatPublication> {
  const controle = await controlerAnnonce(formData);
  if (!controle.ok) return controle.etat;

  const { data, error } = await controle.supabase
    .from("annonces")
    .update(controle.annonce)
    .eq("id", annonceId)
    .select("id");
  if (error || !data?.length) {
    return { erreur: "L'annonce n'a pas pu être modifiée. Réessaie dans un instant.", valeurs: controle.valeurs };
  }

  revalidatePath("/annonces");
  revalidatePath(`/annonces/${annonceId}`);
  redirect(`/annonces/${annonceId}`);
}

// Marquer « pourvue » ou la réactiver. Seul l'auteur peut (la base le garantit).
export async function changerStatut(formData: FormData) {
  const annonceId = String(formData.get("annonceId") ?? "");
  const statut = formData.get("statut") === "pourvue" ? "pourvue" : "active";
  const supabase = await createClient();
  await supabase.from("annonces").update({ statut }).eq("id", annonceId);
  revalidatePath("/annonces");
  revalidatePath(`/annonces/${annonceId}`);
  if (formData.get("retour") === "detail") redirect(`/annonces/${annonceId}`);
}

// Supprimer (après confirmation). Seul l'auteur peut (la base le garantit).
// Les demandes et conversations liées sont supprimées avec l'annonce : la page de confirmation le dit.
export async function supprimerAnnonce(formData: FormData) {
  const annonceId = String(formData.get("annonceId") ?? "");
  const supabase = await createClient();
  await supabase.from("annonces").delete().eq("id", annonceId);
  revalidatePath("/annonces");
  revalidatePath("/demandes");
  revalidatePath("/messages");
  redirect("/annonces?mes=1");
}

export type EtatRedaction = { erreur?: string; proposition?: ChampsAnnonce; numero?: number };

// Rôle RÉDIGER de l'assistant : l'IA propose, la personne relit et modifie avant de publier.
export async function proposerAnnonce(precedent: EtatRedaction, formData: FormData): Promise<EtatRedaction> {
  const numero = (precedent.numero ?? 0) + 1;
  const mots = String(formData.get("mots") ?? "").trim();
  if (mots.length < 3) return { erreur: "Écris au moins quelques mots.", numero };
  if (mots.length > 300) return { erreur: "Quelques mots suffisent (300 caractères maximum).", numero };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: "Ta session a expiré. Reconnecte-toi.", numero };

  const proposition = await redigerAnnonce(mots);
  if (!proposition) {
    return { erreur: "L'assistant ne répond pas pour le moment. Remplis le formulaire à la main ci-dessous.", numero };
  }
  return { proposition, numero };
}
