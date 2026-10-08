"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { demanderJSON } from "@/lib/ia/gemini";
import { PROMPT_COMPETENCES_CV } from "@/lib/ia/prompts";
import { lireReponseIA, nettoyerCompetences } from "@/lib/ia/competences";

const TAILLE_MAX = 3 * 1024 * 1024; // 3 Mo

export type EtatAnalyse = { erreur?: string; propositions?: string[] };

// 1) L'IA lit le CV et PROPOSE des compétences. Rien n'est enregistré ici.
//    Le CV n'est ni stocké ni gardé : il est envoyé à l'IA puis oublié.
export async function analyserCV(_etat: EtatAnalyse, formData: FormData): Promise<EtatAnalyse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: "Ta session a expiré. Reconnecte-toi." };

  const fichier = formData.get("cv");
  if (!(fichier instanceof File) || fichier.size === 0) return { erreur: "Choisis un fichier PDF." };
  if (fichier.size > TAILLE_MAX) return { erreur: "Ton CV est trop lourd (3 Mo maximum)." };

  const octets = Buffer.from(await fichier.arrayBuffer());
  // Vérifie que c'est vraiment un PDF (signature « %PDF »), pas seulement son nom.
  if (octets.subarray(0, 4).toString("latin1") !== "%PDF") {
    return { erreur: "Ce fichier n'est pas un PDF. Exporte ton CV en PDF puis réessaie." };
  }

  const resultat = await demanderJSON(
    PROMPT_COMPETENCES_CV,
    [
      { inline_data: { mime_type: "application/pdf", data: octets.toString("base64") } },
      { text: "Voici le CV à analyser." },
    ],
    {
      type: "OBJECT",
      properties: { competences: { type: "ARRAY", items: { type: "STRING" } } },
      required: ["competences"],
    },
  );

  if (!resultat.ok) {
    return {
      erreur:
        "L'IA ne répond pas pour le moment. Réessaie dans quelques minutes, ou ajoute tes compétences à la main ci-dessous.",
    };
  }

  const propositions = lireReponseIA(resultat.texte);
  if (propositions.length === 0) {
    return { erreur: "L'IA n'a trouvé aucune compétence dans ce document. Ajoute-les à la main ci-dessous." };
  }
  return { propositions };
}

export type EtatValidation = { erreur?: string; succes?: boolean };

// 2) La personne a relu et corrigé : c'est seulement maintenant qu'on enregistre.
export async function validerCompetences(_etat: EtatValidation, formData: FormData): Promise<EtatValidation> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: "Ta session a expiré. Reconnecte-toi." };

  const competences = nettoyerCompetences(formData.getAll("competence"));

  const { data: profil } = await supabase.from("profils").select("id").eq("id", user.id).maybeSingle();
  if (!profil) return { erreur: "Enregistre d'abord ton prénom dans le formulaire « Profil »." };

  const { error } = await supabase.from("profils").update({ competences }).eq("id", user.id);
  if (error) return { erreur: "Les compétences n'ont pas pu être enregistrées. Réessaie." };

  revalidatePath("/profil");
  revalidatePath("/annonces");
  return { succes: true };
}
