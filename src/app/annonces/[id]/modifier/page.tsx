import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Carte } from "@/app/carte";
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
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-10">
      <Link href={`/annonces/${id}`} className="mb-4 text-sm font-semibold underline">
        ← Retour à l&apos;annonce
      </Link>
      <h1 className="titre mb-6 text-center text-5xl text-creme">Modifier l&apos;annonce</h1>
      <Carte onglet="Modification">
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
      </Carte>
    </main>
  );
}
