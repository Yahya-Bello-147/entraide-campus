import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Carte } from "@/app/carte";
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
  created_at: string;
};

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const formatDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

const styleFiltre =
  "rounded-full border-2 border-white bg-bleu px-3 py-2 text-sm font-semibold text-white";

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
  const { type, categorie } = await searchParams;
  const filtreType = typeof type === "string" && Object.hasOwn(TYPES, type) ? type : "";
  const filtreCategorie =
    typeof categorie === "string" && Object.hasOwn(CATEGORIES, categorie) ? categorie : "";

  let requete = supabase
    .from("annonces")
    .select("id, auteur_id, type, categorie, titre, description, prix, lieu, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filtreType) requete = requete.eq("type", filtreType);
  if (filtreCategorie) requete = requete.eq("categorie", filtreCategorie);

  const { data, error } = await requete;
  const annonces = (data ?? []) as Annonce[];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="titre text-5xl text-creme sm:text-6xl">Annonces</h1>
        <Link
          href="/annonces/nouvelle"
          className="titre rounded-full bg-creme px-5 py-3 text-lg text-encre"
        >
          + Publier une annonce
        </Link>
      </div>

      <form className="mb-8 flex flex-wrap gap-3">
        <select name="type" defaultValue={filtreType} className={styleFiltre} aria-label="Type">
          <option value="">Tout</option>
          {Object.entries(TYPES).map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
        <select name="categorie" defaultValue={filtreCategorie} className={styleFiltre} aria-label="Catégorie">
          <option value="">Toutes les catégories</option>
          {Object.entries(CATEGORIES).map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-encre">
          Filtrer
        </button>
        {(filtreType || filtreCategorie) && (
          <Link href="/annonces" className="self-center text-sm underline">
            Effacer les filtres
          </Link>
        )}
      </form>

      {error && (
        <p role="alert" className="font-semibold">
          Impossible de charger les annonces pour le moment. Recharge la page.
        </p>
      )}

      {!error && annonces.length === 0 && (
        <p className="text-lg">Aucune annonce pour l&apos;instant. Sois le premier à publier !</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {annonces.map((annonce) => (
          <Carte key={annonce.id} onglet={TYPES[annonce.type]}>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-creme px-2 py-1">{CATEGORIES[annonce.categorie]}</span>
              {annonce.auteur_id === user.id && (
                <span className="rounded-full bg-bleu px-2 py-1 text-white">Mon annonce</span>
              )}
            </div>
            <h2 className="mb-2 text-lg font-bold break-words">{annonce.titre}</h2>
            <p className="mb-3 line-clamp-4 text-sm break-words whitespace-pre-line">{annonce.description}</p>
            <p className="text-sm font-semibold">
              {annonce.prix !== null && <span>{formatPrix.format(annonce.prix)} · </span>}
              {annonce.lieu && <span>{annonce.lieu} · </span>}
              <span className="font-normal">{formatDate.format(new Date(annonce.created_at))}</span>
            </p>
          </Carte>
        ))}
      </div>
    </main>
  );
}
