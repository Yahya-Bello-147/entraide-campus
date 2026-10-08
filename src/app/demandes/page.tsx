import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Carte } from "@/app/carte";
import { repondreDemande } from "./actions";

type Demande = {
  id: string;
  statut: "en_attente" | "acceptee" | "refusee";
  demandeur_id: string;
  destinataire_id: string;
  created_at: string;
  annonces: { titre: string } | null;
};

type Coordonnees = { user_id: string; email: string; telephone: string | null };

const STATUTS = { en_attente: "En attente", acceptee: "Acceptée", refusee: "Refusée" } as const;
const formatDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

function BoutonEcrire({ demandeId, prenom }: { demandeId: string; prenom: string }) {
  return (
    <Link
      href={`/messages/${demandeId}`}
      className="titre mt-3 block rounded-full bg-bleu px-4 py-2 text-center text-lg text-creme"
    >
      Écrire à {prenom}
    </Link>
  );
}

function BlocCoordonnees({ c }: { c: Coordonnees | undefined }) {
  if (!c) return <p className="text-sm">Cette personne n&apos;a pas encore renseigné ses coordonnées.</p>;
  return (
    <div className="rounded-xl bg-white p-3 text-sm">
      <p className="mb-1 font-semibold">🔓 Coordonnées</p>
      <p>
        <a href={`mailto:${c.email}`} className="underline">
          {c.email}
        </a>
      </p>
      {c.telephone && (
        <p>
          <a href={`tel:${c.telephone.replace(/[^0-9+]/g, "")}`} className="underline">
            {c.telephone}
          </a>
        </p>
      )}
    </div>
  );
}

function CadenasFerme() {
  return (
    <p className="rounded-xl bg-encre/10 p-3 text-sm font-semibold">🔒 Coordonnées visibles après accord</p>
  );
}

export default async function PageDemandes() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data } = await supabase
    .from("demandes_contact")
    .select("id, statut, demandeur_id, destinataire_id, created_at, annonces(titre)")
    .order("created_at", { ascending: false });
  const demandes = (data ?? []) as unknown as Demande[];

  // Prénoms et coordonnées des autres personnes. La base ne renvoie les coordonnées
  // que si une demande a été acceptée (règle d'or n°1) : rien à filtrer ici.
  const autres = [...new Set(demandes.map((d) => (d.demandeur_id === user.id ? d.destinataire_id : d.demandeur_id)))];
  const [{ data: profils }, { data: coordonnees }] = await Promise.all([
    supabase.from("profils").select("id, prenom").in("id", autres),
    supabase.from("coordonnees").select("user_id, email, telephone").in("user_id", autres),
  ]);
  const prenom = new Map((profils ?? []).map((p) => [p.id as string, p.prenom as string]));
  const coord = new Map(((coordonnees ?? []) as Coordonnees[]).map((c) => [c.user_id, c]));

  const recues = demandes.filter((d) => d.destinataire_id === user.id);
  const envoyees = demandes.filter((d) => d.demandeur_id === user.id);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">
      <h1 className="titre mb-8 text-5xl text-creme sm:text-6xl">Mes demandes</h1>

      <h2 className="titre mb-4 text-3xl text-creme">Reçues</h2>
      {recues.length === 0 && <p className="mb-8">Personne ne t&apos;a encore demandé le contact.</p>}
      <div className="mb-12 grid gap-6 sm:grid-cols-2">
        {recues.map((d) => (
          <Carte key={d.id} onglet={STATUTS[d.statut]}>
            <p className="mb-3">
              <strong>{prenom.get(d.demandeur_id) ?? "Quelqu'un"}</strong> veut te contacter pour ton annonce{" "}
              <strong>« {d.annonces?.titre ?? "supprimée"} »</strong>
              <span className="text-sm"> · {formatDate.format(new Date(d.created_at))}</span>
            </p>
            {d.statut === "en_attente" && (
              <form action={repondreDemande} className="mb-3 flex gap-3">
                <input type="hidden" name="demandeId" value={d.id} />
                <button name="reponse" value="acceptee" className="flex-1 rounded-full bg-bleu px-4 py-2 font-semibold text-creme">
                  Accepter
                </button>
                <button name="reponse" value="refusee" className="flex-1 rounded-full border-2 border-encre px-4 py-2 font-semibold">
                  Refuser
                </button>
              </form>
            )}
            {d.statut === "acceptee" ? (
              <>
                <BlocCoordonnees c={coord.get(d.demandeur_id)} />
                <BoutonEcrire demandeId={d.id} prenom={prenom.get(d.demandeur_id) ?? "cette personne"} />
              </>
            ) : (
              <CadenasFerme />
            )}
          </Carte>
        ))}
      </div>

      <h2 className="titre mb-4 text-3xl text-creme">Envoyées</h2>
      {envoyees.length === 0 && <p>Tu n&apos;as encore demandé aucun contact.</p>}
      <div className="grid gap-6 sm:grid-cols-2">
        {envoyees.map((d) => (
          <Carte key={d.id} onglet={STATUTS[d.statut]}>
            <p className="mb-3">
              Ta demande à <strong>{prenom.get(d.destinataire_id) ?? "l'auteur"}</strong> pour{" "}
              <strong>« {d.annonces?.titre ?? "annonce supprimée"} »</strong>
              <span className="text-sm"> · {formatDate.format(new Date(d.created_at))}</span>
            </p>
            {d.statut === "acceptee" ? (
              <>
                <BlocCoordonnees c={coord.get(d.destinataire_id)} />
                <BoutonEcrire demandeId={d.id} prenom={prenom.get(d.destinataire_id) ?? "cette personne"} />
              </>
            ) : d.statut === "refusee" ? (
              <p className="text-sm font-semibold">Cette personne a refusé la demande.</p>
            ) : (
              <CadenasFerme />
            )}
          </Carte>
        ))}
      </div>
    </main>
  );
}
