import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icone } from "@/app/icone";
import { TitrePage } from "@/app/ui";
import { FormulaireAnnonce } from "../../nouvelle/formulaire-annonce";
import { modifierAnnonce } from "../../actions";

export default async function PageModifierAnnonce({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: annonce } = await supabase
    .from("annonces")
    .select("id, auteur_id, type, categorie, titre, description, prix, lieu")
    .eq("id", id)
    .maybeSingle();
  // Pas l'auteur → page introuvable (et la base refuserait de toute façon la modification).
  if (!annonce || annonce.auteur_id !== user.id) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <Link href={`/annonces/${id}`} className="mb-4 inline-flex items-center gap-1 self-start text-sm font-semibold text-gris hover:text-encre">
        <Icone nom="retour" taille={18} />
        Retour à l&apos;annonce
      </Link>
      <TitrePage titre="Modifier l'annonce" sousTitre="Les mêmes vérifications qu'à la publication s'appliquent." />
      <FormulaireAnnonce
          action={modifierAnnonce.bind(null, id)}
          avecAssistant={false}
          libelleBouton="Enregistrer les modifications"
          initial={{
            type: annonce.type,
            categorie: annonce.categorie,
            titre: annonce.titre,
            description: annonce.description,
            prix: annonce.prix === null ? "" : String(annonce.prix).replace(".", ","),
            lieu: annonce.lieu ?? "",
          }}
        />
    </main>
  );
}
