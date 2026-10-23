import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { demanderContact } from "@/app/demandes/actions";
import { Icone } from "@/app/icone";
import { Avatar, EtatVide, PastilleCategorie, TitrePage, VignetteCategorie } from "@/app/ui";
import { STYLE_CATEGORIES } from "@/lib/annonces/style-categories";
import { CATEGORIES, TYPES, type CategorieAnnonce, type TypeAnnonce } from "@/lib/annonces/valider";

type Annonce = {
  id: string;
  auteur_id: string;
  type: TypeAnnonce;
  categorie: CategorieAnnonce;
  titre: string;
  description: string;
  prix: number | null;
  lieu: string | null;
  statut: "active" | "pourvue";
  created_at: string;
};

const STATUT_DEMANDE = {
  en_attente: "Demande envoyée",
  acceptee: "Contact accepté",
  refusee: "Demande refusée",
} as const;

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const formatDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

// La recherche ne garde que des lettres, chiffres, espaces et tirets (rien qui puisse
// changer le sens de la requête envoyée à la base).
function nettoyerRecherche(q: unknown) {
  return typeof q === "string"
    ? q.replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 50)
    : "";
}

export default async function PageAnnonces({
  searchParams,
}: {
  searchParams: Promise<{ [cle: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // Filtres : on ne garde que des valeurs connues.
  const { type, categorie, mes, q } = await searchParams;
  const filtreType = typeof type === "string" && Object.hasOwn(TYPES, type) ? type : "";
  const filtreCategorie = typeof categorie === "string" && Object.hasOwn(CATEGORIES, categorie) ? categorie : "";
  const mesAnnonces = mes === "1";
  const recherche = nettoyerRecherche(q);

  let requete = supabase
    .from("annonces")
    .select("id, auteur_id, type, categorie, titre, description, prix, lieu, statut, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filtreType) requete = requete.eq("type", filtreType);
  if (filtreCategorie) requete = requete.eq("categorie", filtreCategorie);
  if (recherche) requete = requete.or(`titre.ilike.%${recherche}%,description.ilike.%${recherche}%`);
  // « Mes annonces » : toutes les miennes, même pourvues. Sinon : seulement les annonces actives.
  requete = mesAnnonces ? requete.eq("auteur_id", user.id) : requete.eq("statut", "active");

  const { data, error } = await requete;
  const annonces = (data ?? []) as Annonce[];

  // Prénom des auteurs + mes demandes déjà envoyées (pour afficher leur statut sur la carte).
  const auteurs = [...new Set(annonces.map((a) => a.auteur_id))];
  const [{ data: profils }, { data: mesDemandes }] = await Promise.all([
    supabase.from("profils").select("id, prenom").in("id", auteurs),
    supabase.from("demandes_contact").select("annonce_id, statut").eq("demandeur_id", user.id),
  ]);
  const prenom = new Map((profils ?? []).map((p) => [p.id as string, p.prenom as string]));
  const statutDemande = new Map(
    (mesDemandes ?? []).map((d) => [d.annonce_id as string, d.statut as keyof typeof STATUT_DEMANDE]),
  );

  // Liens des filtres : chaque pastille garde les autres filtres et change le sien.
  const lien = (changement: Record<string, string>) => {
    const p = new URLSearchParams();
    const valeurs = { type: filtreType, categorie: filtreCategorie, mes: mesAnnonces ? "1" : "", q: recherche, ...changement };
    for (const [cle, valeur] of Object.entries(valeurs)) if (valeur) p.set(cle, valeur);
    const texte = p.toString();
    return texte ? `/annonces?${texte}` : "/annonces";
  };
  const filtreActif = Boolean(filtreType || filtreCategorie || mesAnnonces || recherche);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <TitrePage
        titre={mesAnnonces ? "Mes annonces" : "Annonces"}
        sousTitre={mesAnnonces ? "Toutes tes annonces, y compris celles pourvues ou vendues." : "Ce que les étudiants proposent et cherchent en ce moment."}
        actions={
          <Link href="/annonces/nouvelle" className="bouton bouton-principal hidden md:inline-flex">
            <Icone nom="plus" taille={18} epaisseur={2.5} />
            Publier une annonce
          </Link>
        }
      />

      <form className="carte mb-4 flex items-center gap-2 p-2 pl-4" role="search">
        <Icone nom="recherche" taille={20} className="shrink-0 text-gris" />
        {filtreType && <input type="hidden" name="type" value={filtreType} />}
        {filtreCategorie && <input type="hidden" name="categorie" value={filtreCategorie} />}
        {mesAnnonces && <input type="hidden" name="mes" value="1" />}
        <input
          type="search"
          name="q"
          defaultValue={recherche}
          placeholder="Rechercher : guitare, coloc, MacBook…"
          aria-label="Rechercher une annonce"
          className="min-w-0 flex-1 border-none bg-transparent py-2 text-base outline-none"
        />
        <button type="submit" className="bouton bouton-principal px-4">
          Chercher
        </button>
      </form>

      <div className="mb-3 flex flex-wrap gap-2" aria-label="Type d'annonce">
        <Pastille href={lien({ type: "" })} actif={!filtreType}>Tout</Pastille>
        {Object.entries(TYPES).map(([valeur, libelle]) => (
          <Pastille key={valeur} href={lien({ type: valeur })} actif={filtreType === valeur}>
            {libelle}
          </Pastille>
        ))}
        <span className="mx-1 hidden w-px bg-ligne sm:block" aria-hidden="true" />
        <Pastille href={lien({ mes: mesAnnonces ? "" : "1" })} actif={mesAnnonces}>
          Mes annonces
        </Pastille>
      </div>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Catégorie">
        <Link
          href={lien({ categorie: "" })}
          aria-current={!filtreCategorie ? "page" : undefined}
          className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold transition ${
            !filtreCategorie ? "degrade text-white" : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
          }`}
        >
          Toutes
        </Link>
        {(Object.keys(CATEGORIES) as CategorieAnnonce[]).map((c) => {
          const actif = filtreCategorie === c;
          const style = STYLE_CATEGORIES[c];
          return (
            <Link
              key={c}
              href={lien({ categorie: actif ? "" : c })}
              aria-current={actif ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition ${
                actif ? "ring-2 ring-current" : "opacity-90 hover:opacity-100"
              }`}
              style={style.pastille}
            >
              <Icone nom={style.icone} taille={15} />
              {CATEGORIES[c]}
            </Link>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="alerte-erreur mb-4">
          Impossible de charger les annonces pour le moment. Recharge la page.
        </p>
      )}

      {!error && annonces.length === 0 && (
        <EtatVide
          icone={filtreActif ? "recherche" : "etincelles"}
          titre={filtreActif ? "Aucune annonce ne correspond" : "Publie la première annonce"}
          texte={filtreActif ? "Essaie une autre catégorie ou un autre mot." : "Propose ce que tu sais faire, ou dis ce que tu cherches."}
          action={
            filtreActif ? (
              <Link href="/annonces" className="bouton bouton-secondaire">
                Effacer les filtres
              </Link>
            ) : (
              <Link href="/annonces/nouvelle" className="bouton bouton-principal">
                Publier une annonce
              </Link>
            )
          }
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {annonces.map((annonce) => {
          const estMoi = annonce.auteur_id === user.id;
          const statut = statutDemande.get(annonce.id);
          return (
            <article key={annonce.id} className="carte carte-survol relative flex min-w-0 flex-col p-4">
              <div className="flex gap-3">
                <VignetteCategorie categorie={annonce.categorie} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold leading-snug break-words">
                      <Link href={`/annonces/${annonce.id}`} className="after:absolute after:inset-0 hover:text-indigo">
                        {annonce.titre}
                      </Link>
                    </h2>
                    {annonce.prix !== null && (
                      <span className="shrink-0 font-extrabold text-violet">{formatPrix.format(annonce.prix)}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gris">
                    {TYPES[annonce.type]}
                    {annonce.lieu && ` · ${annonce.lieu}`} · {formatDate.format(new Date(annonce.created_at))}
                  </p>
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-sm break-words text-gray-600">{annonce.description}</p>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                <PastilleCategorie categorie={annonce.categorie} />
                {estMoi && <span className="rounded-full bg-violet/10 px-2.5 py-1 text-xs font-bold text-violet">Mon annonce</span>}
                {annonce.statut === "pourvue" && (
                  <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-bold text-white">
                    {annonce.categorie === "objets" ? "Vendue" : "Pourvue"}
                  </span>
                )}
              </div>

              <div className="relative z-10 mt-4 flex items-center justify-between gap-3 border-t border-ligne pt-3">
                <span className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
                  <Avatar prenom={prenom.get(annonce.auteur_id)} taille={26} />
                  <span className="truncate">{prenom.get(annonce.auteur_id) ?? "Un étudiant"}</span>
                </span>
                {estMoi ? (
                  <Link href={`/annonces/${annonce.id}`} className="text-sm font-bold text-indigo">
                    Gérer
                  </Link>
                ) : statut ? (
                  <Link href="/demandes" className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                    {STATUT_DEMANDE[statut]}
                  </Link>
                ) : (
                  <form action={demanderContact}>
                    <input type="hidden" name="annonceId" value={annonce.id} />
                    <button type="submit" className="rounded-full bg-gray-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-gray-700">
                      Demander le contact
                    </button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function Pastille({ href, actif, children }: { href: string; actif: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={actif ? "page" : undefined}
      className={`rounded-full px-3.5 py-2 text-sm font-bold transition ${
        actif ? "bg-gray-900 text-white" : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
}
