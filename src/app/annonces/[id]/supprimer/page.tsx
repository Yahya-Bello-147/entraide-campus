import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Carte } from "@/app/carte";
import { changerStatut, supprimerAnnonce } from "../../actions";

// Confirmation avant suppression : on prévient si des conversations vont disparaître,
// et on propose plutôt « Marquer comme pourvue », qui les garde.
export default async function PageSupprimerAnnonce({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: annonce } = await supabase
    .from("annonces")
    .select("id, auteur_id, titre, categorie, statut")
    .eq("id", id)
    .maybeSingle();
  if (!annonce || annonce.auteur_id !== user.id) notFound();

  const { count } = await supabase
    .from("demandes_contact")
    .select("id", { count: "exact", head: true })
    .eq("annonce_id", id)
    .eq("statut", "acceptee");
  const conversations = count ?? 0;
  const libellePourvue = annonce.categorie === "objets" ? "vendue" : "pourvue";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
      <h1 className="titre mb-6 text-center text-5xl text-creme">Supprimer ?</h1>
      <Carte onglet="Confirmation">
        <p className="mb-4">
          Tu vas supprimer définitivement l&apos;annonce <strong>« {annonce.titre} »</strong>.
        </p>

        {conversations > 0 && (
          <div role="alert" className="mb-4 rounded-xl border-2 border-erreur bg-white p-4 text-sm">
            <p className="mb-1 font-bold">
              ⚠️ Attention : {conversations} conversation{conversations > 1 ? "s" : ""} liée
              {conversations > 1 ? "s" : ""} à cette annonce {conversations > 1 ? "seront supprimées" : "sera supprimée"}.
            </p>
            <p>
              Si l&apos;annonce est simplement terminée, marque-la plutôt comme {libellePourvue} : la conversation sera
              gardée.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {conversations > 0 && annonce.statut === "active" && (
            <form action={changerStatut}>
              <input type="hidden" name="annonceId" value={id} />
              <input type="hidden" name="statut" value="pourvue" />
              <input type="hidden" name="retour" value="detail" />
              <button type="submit" className="titre w-full rounded-full bg-bleu px-4 py-2 text-lg text-creme">
                Marquer comme {libellePourvue}
              </button>
            </form>
          )}
          <form action={supprimerAnnonce}>
            <input type="hidden" name="annonceId" value={id} />
            <button type="submit" className="titre w-full rounded-full bg-erreur px-4 py-2 text-lg text-white">
              {conversations > 0 ? "Supprimer quand même" : "Supprimer"}
            </button>
          </form>
          <Link href={`/annonces/${id}`} className="text-center text-sm font-semibold underline">
            Annuler
          </Link>
        </div>
      </Carte>
    </main>
  );
}
