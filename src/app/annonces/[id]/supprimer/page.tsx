import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icone } from "@/app/icone";
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
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="carte w-full max-w-md p-6 text-center sm:p-8">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-erreur">
          <Icone nom="poubelle" taille={26} />
        </span>
        <h1 className="titre text-2xl">Supprimer cette annonce ?</h1>
        <p className="mt-2 text-gris">
          « {annonce.titre} » sera supprimée définitivement.
        </p>

        {conversations > 0 && (
          <div role="alert" className="mt-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-left text-sm text-amber-950">
            <p className="mb-1 font-bold">
              Attention : {conversations} conversation{conversations > 1 ? "s" : ""} liée{conversations > 1 ? "s" : ""} à cette annonce{" "}
              {conversations > 1 ? "seront supprimées" : "sera supprimée"}.
            </p>
            <p>Si l&apos;annonce est simplement terminée, marque-la plutôt comme {libellePourvue} : la conversation sera gardée.</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {conversations > 0 && annonce.statut === "active" && (
            <form action={changerStatut}>
              <input type="hidden" name="annonceId" value={id} />
              <input type="hidden" name="statut" value="pourvue" />
              <input type="hidden" name="retour" value="detail" />
              <button type="submit" className="bouton bouton-principal w-full">
                Marquer comme {libellePourvue}
              </button>
            </form>
          )}
          <form action={supprimerAnnonce}>
            <input type="hidden" name="annonceId" value={id} />
            <button type="submit" className="bouton bouton-danger w-full">
              {conversations > 0 ? "Supprimer quand même" : "Supprimer"}
            </button>
          </form>
          <Link href={`/annonces/${id}`} className="bouton bouton-secondaire">
            Annuler
          </Link>
        </div>
      </div>
    </main>
  );
}
