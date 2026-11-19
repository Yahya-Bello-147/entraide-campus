import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { demanderContact } from "@/app/demandes/actions";
import { Icone } from "@/app/icone";
import { DecorBandeau } from "@/app/illustrations";
import { Avatar, PastilleCategorie, VignetteCategorie } from "@/app/ui";
import { TYPES, type CategorieAnnonce, type TypeAnnonce } from "@/lib/annonces/valider";

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const formatMois = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

type AnnonceProfil = { id: string; titre: string; categorie: CategorieAnnonce; type: TypeAnnonce; prix: number | null };

// La page « profil » d'un étudiant, vue par les autres. Jamais ses coordonnées (règle d'or n°1) :
// on ne lit ici que la table « profils » (pas « coordonnees ») et ses annonces actives.
export default async function PageEtudiant({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const [{ data: profil }, { data: annonces }, { data: mesDemandes }] = await Promise.all([
    supabase.from("profils").select("prenom, campus, presentation, photo, competences, created_at").eq("id", id).maybeSingle(),
    supabase
      .from("annonces")
      .select("id, titre, categorie, type, prix")
      .eq("auteur_id", id)
      .eq("statut", "active")
      .order("created_at", { ascending: false }),
    supabase.from("demandes_contact").select("annonce_id").eq("demandeur_id", user.id),
  ]);
  if (!profil) notFound();

  const estMoi = id === user.id;
  const prenom = profil.prenom as string;
  const competences = (profil.competences as string[] | null) ?? [];
  const dejaDemande = new Set((mesDemandes ?? []).map((d) => d.annonce_id as string));
  const liste = (annonces ?? []) as AnnonceProfil[];

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-violet text-white md:rounded-b-[2.5rem] lg:m-5 lg:rounded-[2rem]">
        <DecorBandeau />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-5 px-4 pt-8 pb-14 sm:flex-row sm:items-center sm:px-6">
          <span className="self-start rounded-full border-4 border-white sm:self-center">
            <Avatar prenom={prenom} photo={profil.photo as string | null} taille={112} />
          </span>
          <div className="min-w-0">
            <h1 className="titre truncate text-4xl">{prenom}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {profil.campus && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-violet">
                  <Icone nom="epingle" taille={14} className="text-rose" />
                  ESP {profil.campus as string}
                </span>
              )}
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                Membre depuis {formatMois.format(new Date(profil.created_at as string))}
              </span>
            </div>
            {profil.presentation && (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed break-words">« {profil.presentation as string} »</p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="carte p-5">
            <h2 className="mb-3 text-sm font-extrabold tracking-wider text-indigo uppercase">Ses compétences</h2>
            {competences.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {competences.map((c) => (
                  <span key={c} className="rounded-full bg-violet/10 px-3 py-1 text-sm font-semibold text-indigo">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gris">Pas encore de compétences indiquées.</p>
            )}
          </section>
          {estMoi ? (
            <Link href="/profil" className="bouton bouton-principal">
              <Icone nom="crayon" taille={18} />
              Modifier mon profil
            </Link>
          ) : (
            <p className="carte flex items-start gap-3 bg-violet/5 p-5 text-sm leading-relaxed">
              <Icone nom="cadenas" taille={20} className="mt-0.5 shrink-0 text-violet" />
              Ses coordonnées restent cachées. Elles apparaissent seulement quand {prenom} accepte ta demande de contact.
            </p>
          )}
        </div>

        <section className="carte min-w-0 p-5">
          <h2 className="mb-4 text-sm font-extrabold tracking-wider text-indigo uppercase">
            {estMoi ? "Mes annonces" : "Ses annonces"}
          </h2>
          {liste.length === 0 ? (
            <p className="text-sm text-gris">Aucune annonce en ce moment.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {liste.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-ligne p-3">
                  <VignetteCategorie categorie={a.categorie} taille={46} />
                  <Link href={`/annonces/${a.id}`} className="min-w-0 flex-1 hover:text-indigo">
                    <span className="block font-bold break-words">{a.titre}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gris">
                      <PastilleCategorie categorie={a.categorie} />
                      {TYPES[a.type]}
                      {a.prix !== null && ` · ${formatPrix.format(a.prix)}`}
                    </span>
                  </Link>
                  {!estMoi &&
                    (dejaDemande.has(a.id) ? (
                      <Link href="/demandes" className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                        Demande envoyée
                      </Link>
                    ) : (
                      <form action={demanderContact}>
                        <input type="hidden" name="annonceId" value={a.id} />
                        <button type="submit" className="rounded-full bg-rose px-3.5 py-2 text-xs font-bold text-white hover:brightness-110">
                          Demander le contact
                        </button>
                      </form>
                    ))}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
