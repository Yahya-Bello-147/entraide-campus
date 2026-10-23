import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { demanderContact } from "@/app/demandes/actions";
import { changerStatut } from "../actions";
import { Icone } from "@/app/icone";
import { Avatar, PastilleCategorie, VignetteCategorie } from "@/app/ui";
import { TYPES, type CategorieAnnonce, type TypeAnnonce } from "@/lib/annonces/valider";

const STATUT_DEMANDE = {
  en_attente: { texte: "Demande envoyée, en attente de réponse", icone: "horloge" },
  acceptee: { texte: "Demande acceptée : voir les coordonnées", icone: "cadenasOuvert" },
  refusee: { texte: "Demande refusée", icone: "croix" },
} as const;

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
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
    supabase.from("profils").select("prenom, competences").eq("id", annonce.auteur_id).maybeSingle(),
    supabase.from("demandes_contact").select("statut").eq("annonce_id", id).eq("demandeur_id", user.id).maybeSingle(),
  ]);
  const libellePourvue = annonce.categorie === "objets" ? "vendue" : "pourvue";
  const prenom = (profil?.prenom as string | undefined) ?? "Un étudiant";
  const competences = ((profil?.competences as string[] | undefined) ?? []).slice(0, 5);
  const statut = maDemande ? STATUT_DEMANDE[maDemande.statut as keyof typeof STATUT_DEMANDE] : null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/annonces" className="mb-5 inline-flex items-center gap-1 self-start text-sm font-semibold text-gris hover:text-encre">
        <Icone nom="retour" taille={18} />
        Toutes les annonces
      </Link>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="carte min-w-0 p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <PastilleCategorie categorie={annonce.categorie as CategorieAnnonce} />
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">{TYPES[annonce.type as TypeAnnonce]}</span>
            {pourvue && (
              <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-bold text-white">
                {libellePourvue[0].toUpperCase() + libellePourvue.slice(1)}
              </span>
            )}
            {estAuteur && <span className="rounded-full bg-violet/10 px-2.5 py-1 text-xs font-bold text-violet">Mon annonce</span>}
          </div>
          <div className="flex items-start gap-4">
            <VignetteCategorie categorie={annonce.categorie as CategorieAnnonce} taille={60} />
            <div className="min-w-0">
              <h1 className="titre text-2xl break-words sm:text-3xl">{annonce.titre}</h1>
              {annonce.prix !== null && <p className="mt-1 text-2xl font-extrabold text-violet">{formatPrix.format(annonce.prix)}</p>}
            </div>
          </div>
          <p className="mt-6 leading-relaxed break-words whitespace-pre-line text-gray-700">{annonce.description}</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-ligne pt-5 text-sm text-gris">
            {annonce.lieu && (
              <span className="flex items-center gap-1.5">
                <Icone nom="epingle" taille={16} />
                {annonce.lieu}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Icone nom="horloge" taille={16} />
              Publiée le {formatDate.format(new Date(annonce.created_at))}
            </span>
          </div>
        </article>

        <aside className="flex min-w-0 flex-col gap-5">
          <div className="carte p-5">
            <div className="flex items-center gap-3">
              <Avatar prenom={prenom} taille={48} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gris">Publiée par</p>
                <p className="truncate text-lg font-bold">{prenom}</p>
              </div>
            </div>
            {competences.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {competences.map((c) => (
                  <span key={c} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="carte flex flex-col gap-3 p-5">
            {estAuteur ? (
              <>
                <Link href={`/annonces/${id}/modifier`} className="bouton bouton-principal">
                  <Icone nom="crayon" taille={18} />
                  Modifier
                </Link>
                <form action={changerStatut}>
                  <input type="hidden" name="annonceId" value={id} />
                  <input type="hidden" name="statut" value={pourvue ? "active" : "pourvue"} />
                  <button type="submit" className="bouton bouton-contour w-full">
                    <Icone nom={pourvue ? "fleche" : "coche"} taille={18} />
                    {pourvue ? "Remettre en ligne" : `Marquer comme ${libellePourvue}`}
                  </button>
                </form>
                <Link href={`/annonces/${id}/supprimer`} className="bouton text-sm text-erreur hover:bg-red-50">
                  <Icone nom="poubelle" taille={17} />
                  Supprimer l&apos;annonce
                </Link>
              </>
            ) : statut ? (
              <Link href="/demandes" className="flex items-center gap-2 rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                <Icone nom={statut.icone} taille={18} />
                {statut.texte}
              </Link>
            ) : pourvue ? (
              <p className="rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-700">
                Cette annonce est {libellePourvue} : elle ne reçoit plus de demande.
              </p>
            ) : (
              <>
                <form action={demanderContact}>
                  <input type="hidden" name="annonceId" value={id} />
                  <button type="submit" className="bouton bouton-principal w-full">
                    Demander le contact
                  </button>
                </form>
                <p className="flex items-start gap-2 text-xs text-gris">
                  <Icone nom="cadenas" taille={15} className="mt-px shrink-0" />
                  {prenom} verra ta demande. Vos coordonnées seront partagées seulement si {prenom} accepte.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
