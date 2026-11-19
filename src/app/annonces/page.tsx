import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { demanderContact } from "@/app/demandes/actions";
import { Icone } from "@/app/icone";
import { Avatar, EtatVide, VignetteCategorie } from "@/app/ui";
import { STYLE_CATEGORIES } from "@/lib/annonces/style-categories";
import { CATEGORIES, TYPES, type CategorieAnnonce, type TypeAnnonce } from "@/lib/annonces/valider";
import { CAMPUS } from "@/lib/campus";

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
  const [{ type, categorie, mes, q, campus: choixCampus, tri }, { data: moi }] = await Promise.all([
    searchParams,
    supabase.from("profils").select("campus").eq("id", user.id).maybeSingle(),
  ]);
  const filtreType = typeof type === "string" && Object.hasOwn(TYPES, type) ? type : "";
  const filtreCategorie = typeof categorie === "string" && Object.hasOwn(CATEGORIES, categorie) ? categorie : "";
  const mesAnnonces = mes === "1";
  const recherche = nettoyerRecherche(q);
  const ordre = typeof tri === "string" && Object.hasOwn(TRIS, tri) ? (tri as keyof typeof TRIS) : "recent";
  // Campus : par défaut le mien ; ?campus=tous pour les 6 ; ?campus=Lyon pour un autre campus.
  const monCampus = CAMPUS.find((c) => c === moi?.campus) ?? null;
  const tousLesCampus = choixCampus === "tous";
  const autreCampus = CAMPUS.find((c) => c === choixCampus) ?? null;
  const filtreCampus = mesAnnonces || tousLesCampus ? null : (autreCampus ?? monCampus);

  // Les auteurs du campus choisi (le campus est sur le profil de l'auteur, pas sur l'annonce).
  const { data: auteursDuCampus } = filtreCampus
    ? await supabase.from("profils").select("id").eq("campus", filtreCampus)
    : { data: null };

  let requete = supabase
    .from("annonces")
    .select("id, auteur_id, type, categorie, titre, description, prix, lieu, statut, created_at")
    .order(ordre === "recent" ? "created_at" : "prix", {
      ascending: ordre === "prix-croissant",
      nullsFirst: false,
    })
    .limit(100);
  if (filtreType) requete = requete.eq("type", filtreType);
  if (filtreCategorie) requete = requete.eq("categorie", filtreCategorie);
  if (auteursDuCampus) requete = requete.in("auteur_id", auteursDuCampus.map((p) => p.id as string));
  if (recherche) requete = requete.or(`titre.ilike.%${recherche}%,description.ilike.%${recherche}%`);
  // « Mes annonces » : toutes les miennes, même pourvues. Sinon : seulement les annonces actives.
  requete = mesAnnonces ? requete.eq("auteur_id", user.id) : requete.eq("statut", "active");

  const { data, error } = await requete;
  const annonces = (data ?? []) as Annonce[];

  // Prénom des auteurs + mes demandes déjà envoyées (pour afficher leur statut sur la carte).
  const auteurs = [...new Set(annonces.map((a) => a.auteur_id))];
  const [{ data: profils }, { data: mesDemandes }] = await Promise.all([
    supabase.from("profils").select("id, prenom, competences, campus, photo").in("id", auteurs),
    supabase.from("demandes_contact").select("annonce_id, statut").eq("demandeur_id", user.id),
  ]);
  const prenom = new Map((profils ?? []).map((p) => [p.id as string, p.prenom as string]));
  const photoAuteur = new Map((profils ?? []).map((p) => [p.id as string, p.photo as string | null]));
  const campusAuteur = new Map((profils ?? []).map((p) => [p.id as string, p.campus as string | null]));
  // Les 2 premières compétences validées de l'auteur (profil IA, palier 3), affichées sur la carte.
  const competences = new Map(
    (profils ?? []).map((p) => [p.id as string, ((p.competences as string[] | null) ?? []).slice(0, 2)]),
  );
  const statutDemande = new Map(
    (mesDemandes ?? []).map((d) => [d.annonce_id as string, d.statut as keyof typeof STATUT_DEMANDE]),
  );

  // Liens des filtres : chaque filtre garde les autres et change le sien.
  const lien = (changement: Record<string, string>) => {
    const p = new URLSearchParams();
    const valeurs = {
      type: filtreType,
      categorie: filtreCategorie,
      mes: mesAnnonces ? "1" : "",
      q: recherche,
      campus: tousLesCampus ? "tous" : (autreCampus ?? ""),
      tri: ordre === "recent" ? "" : ordre,
      ...changement,
    };
    for (const [cle, valeur] of Object.entries(valeurs)) if (valeur) p.set(cle, valeur);
    const texte = p.toString();
    return texte ? `/annonces?${texte}` : "/annonces";
  };
  const filtreActif = Boolean(filtreType || filtreCategorie || mesAnnonces || recherche || filtreCampus);
  const libelleCampus = mesAnnonces
    ? "Tous mes campus"
    : tousLesCampus || !filtreCampus
      ? "Tous les campus"
      : filtreCampus === monCampus
        ? `Mon campus · ${filtreCampus}`
        : `ESP ${filtreCampus}`;

  return (
    // Page Annonces « version pro » (maquette validée le 19 nov) : filtres rangés sur 2 lignes, cartes 3D au survol.
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6 lg:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="titre text-3xl">{mesAnnonces ? "Mes annonces" : "Annonces"}</h1>
          <p className="mt-1 text-gris">
            {mesAnnonces ? "Toutes tes annonces, y compris celles pourvues ou vendues." : "Ce que les étudiants proposent et cherchent en ce moment."}
          </p>
        </div>
        <Link href="/annonces/nouvelle" className="bouton bouton-principal hidden rounded-xl md:inline-flex">
          <Icone nom="plus" taille={18} epaisseur={2.5} />
          Publier une annonce
        </Link>
      </header>

      <form className="carte flex items-center gap-2 p-2 pl-4" role="search">
        <Icone nom="recherche" taille={20} className="shrink-0 text-gris" />
        {filtreType && <input type="hidden" name="type" value={filtreType} />}
        {filtreCategorie && <input type="hidden" name="categorie" value={filtreCategorie} />}
        {mesAnnonces && <input type="hidden" name="mes" value="1" />}
        {(tousLesCampus || autreCampus) && <input type="hidden" name="campus" value={tousLesCampus ? "tous" : autreCampus!} />}
        {ordre !== "recent" && <input type="hidden" name="tri" value={ordre} />}
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

      {/* Ligne 1 : type, campus, tri et « Mes annonces ». */}
      <div className="flex flex-wrap items-center gap-2.5">
        <nav aria-label="Type d'annonce" className="flex rounded-xl border border-ligne bg-white p-1">
          {[["", "Tout"], ...Object.entries(TYPES)].map(([valeur, libelle]) => (
            <Link
              key={valeur || "tout"}
              href={lien({ type: valeur })}
              aria-current={filtreType === valeur ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-sm font-bold transition ${
                filtreType === valeur ? "bg-encre text-white" : "text-gray-600 hover:bg-violet/5"
              }`}
            >
              {libelle}
            </Link>
          ))}
        </nav>

        {!mesAnnonces && (
          <Menu libelle={libelleCampus} pastille>
            {monCampus && <OptionMenu href={lien({ campus: "" })} actif={filtreCampus === monCampus && !autreCampus}>Mon campus · {monCampus}</OptionMenu>}
            <OptionMenu href={lien({ campus: "tous" })} actif={tousLesCampus || !filtreCampus}>Tous les campus</OptionMenu>
            {CAMPUS.filter((c) => c !== monCampus).map((c) => (
              <OptionMenu key={c} href={lien({ campus: c })} actif={autreCampus === c}>
                ESP {c}
              </OptionMenu>
            ))}
          </Menu>
        )}

        <div className="hidden flex-1 lg:block" />

        <Menu libelle={`Trier : ${TRIS[ordre]}`}>
          {(Object.keys(TRIS) as (keyof typeof TRIS)[]).map((t) => (
            <OptionMenu key={t} href={lien({ tri: t === "recent" ? "" : t })} actif={ordre === t}>
              {TRIS[t]}
            </OptionMenu>
          ))}
        </Menu>

        <Link
          href={lien({ mes: mesAnnonces ? "" : "1", campus: "" })}
          aria-current={mesAnnonces ? "page" : undefined}
          className="flex items-center gap-2.5 rounded-xl border border-ligne bg-white px-3.5 py-2.5 text-sm font-bold"
        >
          <span className={`relative h-5 w-9 rounded-full transition ${mesAnnonces ? "bg-violet" : "bg-gray-200"}`} aria-hidden="true">
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${mesAnnonces ? "left-[18px]" : "left-0.5"}`} />
          </span>
          Mes annonces
        </Link>
      </div>

      {/* Ligne 2 : les catégories, en tuiles de même taille. */}
      <nav aria-label="Catégorie" className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pt-1 pb-3 sm:mx-0 sm:px-0">
        <TuileCategorie href={lien({ categorie: "" })} actif={!filtreCategorie} libelle="Toutes">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-violet to-rose text-white shadow-[0_8px_16px_rgb(142_102_184/0.35)]">
            <Icone nom="grille" taille={22} />
          </span>
        </TuileCategorie>
        {(Object.keys(CATEGORIES) as CategorieAnnonce[]).map((c) => (
          <TuileCategorie key={c} href={lien({ categorie: filtreCategorie === c ? "" : c })} actif={filtreCategorie === c} libelle={LIBELLES_COURTS[c]}>
            <VignetteCategorie categorie={c} taille={44} />
          </TuileCategorie>
        ))}
      </nav>

      {error && (
        <p role="alert" className="alerte-erreur">
          Impossible de charger les annonces pour le moment. Recharge la page.
        </p>
      )}

      {!error && annonces.length > 0 && (
        <p className="text-sm font-semibold text-gris">
          <b className="text-encre">
            {annonces.length} annonce{annonces.length > 1 ? "s" : ""}
          </b>
          {filtreCampus ? ` à ${filtreCampus}` : mesAnnonces ? "" : " sur les 6 campus"}
        </p>
      )}

      {!error && annonces.length === 0 && (
        <EtatVide
          icone={filtreActif ? "recherche" : "etincelles"}
          titre={filtreActif ? "Aucune annonce ne correspond" : "Publie la première annonce"}
          texte={
            filtreCampus
              ? `Rien pour l'instant à ${filtreCampus} avec ces filtres : regarde les autres campus.`
              : filtreActif
                ? "Essaie une autre catégorie ou un autre mot."
                : "Propose ce que tu sais faire, ou dis ce que tu cherches."
          }
          action={
            filtreCampus ? (
              <Link href={lien({ campus: "tous" })} className="bouton bouton-secondaire">
                Voir tous les campus
              </Link>
            ) : filtreActif ? (
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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {annonces.map((annonce) => {
          const estMoi = annonce.auteur_id === user.id;
          const statut = statutDemande.get(annonce.id);
          const style = STYLE_CATEGORIES[annonce.categorie];
          return (
            <article
              key={annonce.id}
              className={`carte-3d relative flex min-w-0 flex-col overflow-hidden rounded-[20px] border bg-white shadow-[0_6px_18px_rgb(142_102_184/0.08)] ${
                estMoi ? "border-violet ring-2 ring-violet" : "border-ligne"
              }`}
            >
              {/* Bande du haut : couleur de la catégorie, étiquettes et prix. */}
              <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: style.pastille.background }}>
                <VignetteCategorie categorie={annonce.categorie} taille={44} />
                <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold" style={{ color: style.pastille.color }}>
                    {CATEGORIES[annonce.categorie]}
                  </span>
                  {estMoi ? (
                    <span className="rounded-full bg-violet px-2.5 py-0.5 text-xs font-bold text-white">Mon annonce</span>
                  ) : (
                    <span className="rounded-full bg-encre px-2.5 py-0.5 text-xs font-bold text-white">{TYPES[annonce.type]}</span>
                  )}
                  {annonce.statut === "pourvue" && (
                    <span className="rounded-full bg-indigo px-2.5 py-0.5 text-xs font-bold text-white">
                      {annonce.categorie === "objets" ? "Vendue" : "Pourvue"}
                    </span>
                  )}
                </div>
                {annonce.prix !== null && (
                  <span className="shrink-0 rounded-xl bg-white px-2.5 py-1 font-extrabold shadow-sm">{formatPrix.format(annonce.prix)}</span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-lg leading-snug font-bold break-words">
                  <Link href={`/annonces/${annonce.id}`} className="after:absolute after:inset-0 hover:text-indigo">
                    {annonce.titre}
                  </Link>
                </h2>
                <p className="mt-1.5 line-clamp-2 break-words text-gray-600">{annonce.description}</p>
                {(competences.get(annonce.auteur_id) ?? []).length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {(competences.get(annonce.auteur_id) ?? []).map((c) => (
                      <span key={c} className="rounded-full bg-succes/10 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        {c}
                      </span>
                    ))}
                  </p>
                )}

                <div className="relative z-10 mt-auto flex items-center gap-2 border-t border-ligne pt-3 [margin-top:max(1rem,auto)]">
                  <Avatar prenom={prenom.get(annonce.auteur_id)} photo={photoAuteur.get(annonce.auteur_id)} taille={30} />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <Link href={`/etudiants/${annonce.auteur_id}`} className="font-bold hover:underline">
                      {estMoi ? "Moi" : (prenom.get(annonce.auteur_id) ?? "Un étudiant")}
                    </Link>
                    <span className="text-gris">
                      {campusAuteur.get(annonce.auteur_id) && ` · ESP ${campusAuteur.get(annonce.auteur_id)}`} · {formatDate.format(new Date(annonce.created_at))}
                    </span>
                  </span>
                  {estMoi ? (
                    <Link href={`/annonces/${annonce.id}`} className="shrink-0 rounded-xl border border-ligne px-3 py-1.5 text-sm font-bold text-violet hover:bg-violet/5">
                      Gérer
                    </Link>
                  ) : statut ? (
                    <Link href="/demandes" className="shrink-0 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                      {STATUT_DEMANDE[statut]}
                    </Link>
                  ) : (
                    <form action={demanderContact} className="shrink-0">
                      <input type="hidden" name="annonceId" value={annonce.id} />
                      <button type="submit" className="rounded-xl bg-rose px-3 py-1.5 text-sm font-bold text-white hover:brightness-110">
                        Contacter
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

const TRIS = { recent: "Plus récentes", "prix-croissant": "Prix croissant", "prix-decroissant": "Prix décroissant" } as const;

const LIBELLES_COURTS: Record<CategorieAnnonce, string> = {
  photo: "Photo",
  video: "Vidéo",
  dev: "Dev",
  community_management: "Comm.",
  logement: "Logement",
  covoiturage: "Covoit.",
  objets: "Objets",
  autre: "Autre",
};

function TuileCategorie({ href, actif, libelle, children }: { href: string; actif: boolean; libelle: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={actif ? "page" : undefined}
      className={`flex w-[92px] shrink-0 flex-col items-center gap-2 rounded-2xl border-2 bg-white px-1.5 py-3 text-sm font-bold transition hover:-translate-y-0.5 sm:w-auto sm:flex-1 ${
        actif ? "border-violet bg-violet/5 text-indigo" : "border-transparent text-gray-700 shadow-[0_4px_12px_rgb(142_102_184/0.08)]"
      }`}
    >
      {children}
      {libelle}
    </Link>
  );
}

// Petit menu déroulant sans JavaScript (élément <details>).
function Menu({ libelle, pastille = false, children }: { libelle: string; pastille?: boolean; children: React.ReactNode }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-ligne bg-white px-3.5 py-2.5 text-sm font-bold select-none [&::-webkit-details-marker]:hidden">
        {pastille && <span className="h-2 w-2 rounded-full bg-rose" aria-hidden="true" />}
        {libelle}
        <Icone nom="fleche" taille={14} className="rotate-90 text-gris transition group-open:-rotate-90" />
      </summary>
      <div className="absolute z-20 mt-2 flex min-w-52 flex-col rounded-2xl border border-ligne bg-white p-1.5 shadow-[0_16px_40px_rgb(63_34_110/0.18)]">
        {children}
      </div>
    </details>
  );
}

function OptionMenu({ href, actif, children }: { href: string; actif: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={actif ? "page" : undefined}
      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${actif ? "bg-violet/10 text-indigo" : "text-gray-700 hover:bg-violet/5"}`}
    >
      {children}
      {actif && <Icone nom="coche" taille={15} />}
    </Link>
  );
}
