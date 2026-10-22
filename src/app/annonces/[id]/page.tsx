import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Carte } from "@/app/carte";
import { demanderContact } from "@/app/demandes/actions";
import { changerStatut } from "../actions";
import { CATEGORIES, TYPES, type CategorieAnnonce, type TypeAnnonce } from "@/lib/annonces/valider";

const STATUT_DEMANDE = {
  en_attente: "Demande envoyée · en attente",
  acceptee: "Demande acceptée · voir les coordonnées",
  refusee: "Demande refusée",
} as const;

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const formatDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function PageAnnonce({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: annonce } = await supabase
    .from("annonces")
    .select("id, auteur_id, type, categorie, titre, description, prix, lieu, statut, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!annonce) notFound();

  const estAuteur = annonce.auteur_id === user.id;
  const pourvue = annonce.statut === "pourvue";
  const [{ data: profil }, { data: maDemande }] = await Promise.all([
    supabase.from("profils").select("prenom").eq("id", annonce.auteur_id).maybeSingle(),
    supabase.from("demandes_contact").select("statut").eq("annonce_id", id).eq("demandeur_id", user.id).maybeSingle(),
  ]);
  const libellePourvue = annonce.categorie === "objets" ? "vendue" : "pourvue";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10">
      <Link href="/annonces" className="mb-4 text-sm font-semibold underline">
        ← Toutes les annonces
      </Link>

      <Carte onglet={TYPES[annonce.type as TypeAnnonce]}>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-creme px-2 py-1">{CATEGORIES[annonce.categorie as CategorieAnnonce]}</span>
          {pourvue && <span className="rounded-full bg-encre px-2 py-1 text-white">{libellePourvue[0].toUpperCase() + libellePourvue.slice(1)}</span>}
          {estAuteur && <span className="rounded-full bg-bleu px-2 py-1 text-white">Mon annonce</span>}
        </div>
        <h1 className="titre mb-3 text-3xl break-words sm:text-4xl">{annonce.titre}</h1>
        <p className="mb-4 break-words whitespace-pre-line">{annonce.description}</p>
        <p className="text-sm font-semibold">
          {annonce.prix !== null && <span>{formatPrix.format(annonce.prix)} · </span>}
          {annonce.lieu && <span>{annonce.lieu} · </span>}
          <span className="font-normal">publiée le {formatDate.format(new Date(annonce.created_at))}</span>
        </p>
        <p className="mt-1 text-sm">par {(profil?.prenom as string | undefined) ?? "un étudiant"}</p>

        <div className="mt-6 flex flex-col gap-3">
          {estAuteur ? (
            <>
              <Link
                href={`/annonces/${id}/modifier`}
                className="titre rounded-full bg-bleu px-4 py-2 text-center text-lg text-creme"
              >
                Modifier
              </Link>
              <form action={changerStatut}>
                <input type="hidden" name="annonceId" value={id} />
                <input type="hidden" name="statut" value={pourvue ? "active" : "pourvue"} />
                <button type="submit" className="titre w-full rounded-full border-2 border-encre px-4 py-2 text-lg">
                  {pourvue ? "Remettre en ligne" : `Marquer comme ${libellePourvue}`}
                </button>
              </form>
              <Link
                href={`/annonces/${id}/supprimer`}
                className="rounded-full px-4 py-2 text-center text-sm font-semibold text-erreur underline"
              >
                Supprimer l&apos;annonce
              </Link>
            </>
          ) : maDemande ? (
            <Link href="/demandes" className="block rounded-full bg-white px-4 py-2 text-center font-semibold">
              {STATUT_DEMANDE[maDemande.statut as keyof typeof STATUT_DEMANDE]}
            </Link>
          ) : pourvue ? (
            <p className="rounded-full bg-encre/10 px-4 py-2 text-center font-semibold">
              Cette annonce est {libellePourvue} : plus de nouvelle demande.
            </p>
          ) : (
            <form action={demanderContact}>
              <input type="hidden" name="annonceId" value={id} />
              <button type="submit" className="titre w-full rounded-full bg-encre px-4 py-2 text-lg text-white">
                Demander le contact
              </button>
            </form>
          )}
        </div>
      </Carte>
    </main>
  );
}
