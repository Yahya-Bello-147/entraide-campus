import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icone } from "@/app/icone";
import { Avatar, EtatVide, TitrePage } from "@/app/ui";
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

const STATUTS = {
  en_attente: { texte: "En attente", style: "bg-amber-100 text-amber-900" },
  acceptee: { texte: "Acceptée", style: "bg-emerald-100 text-emerald-900" },
  refusee: { texte: "Refusée", style: "bg-gray-100 text-gray-700" },
} as const;
const formatDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

function BlocCoordonnees({ c, prenom, demandeId }: { c: Coordonnees | undefined; prenom: string; demandeId: string }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      {c ? (
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950">
          <p className="mb-2 flex items-center gap-1.5 font-bold">
            <Icone nom="cadenasOuvert" taille={16} />
            Coordonnées de {prenom}
          </p>
          <a href={`mailto:${c.email}`} className="flex items-center gap-2 break-all hover:underline">
            <Icone nom="mail" taille={16} className="shrink-0" />
            {c.email}
          </a>
          {c.telephone && (
            <a href={`tel:${c.telephone.replace(/[^0-9+]/g, "")}`} className="mt-1 flex items-center gap-2 hover:underline">
              <Icone nom="telephone" taille={16} className="shrink-0" />
              {c.telephone}
            </a>
          )}
        </div>
      ) : (
        <p className="text-sm text-gris">Cette personne n&apos;a pas encore renseigné ses coordonnées.</p>
      )}
      <Link href={`/messages/${demandeId}`} className="bouton bouton-principal">
        <Icone nom="message" taille={18} />
        Écrire à {prenom}
      </Link>
    </div>
  );
}

function CadenasFerme() {
  return (
    <p className="mt-4 flex items-center gap-2 rounded-2xl bg-gray-50 p-3 text-sm font-semibold text-gray-600">
      <Icone nom="cadenas" taille={16} />
      Coordonnées visibles après accord
    </p>
  );
}

function Statut({ statut }: { statut: Demande["statut"] }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUTS[statut].style}`}>{STATUTS[statut].texte}</span>;
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
  const prenomDe = new Map((profils ?? []).map((p) => [p.id as string, p.prenom as string]));
  const coord = new Map(((coordonnees ?? []) as Coordonnees[]).map((c) => [c.user_id, c]));

  const recues = demandes.filter((d) => d.destinataire_id === user.id);
  const envoyees = demandes.filter((d) => d.demandeur_id === user.id);
  const enAttente = recues.filter((d) => d.statut === "en_attente").length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <TitrePage
        titre="Demandes"
        sousTitre={enAttente ? `${enAttente} demande${enAttente > 1 ? "s" : ""} attend${enAttente > 1 ? "ent" : ""} ta réponse.` : "Les contacts que tu reçois et que tu demandes."}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="min-w-0">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
            <Icone nom="boite" taille={20} className="text-violet" />
            Reçues
          </h2>
          {recues.length === 0 ? (
            <EtatVide icone="boite" titre="Aucune demande reçue" texte="Quand quelqu'un voudra te contacter pour une annonce, sa demande apparaîtra ici." />
          ) : (
            <div className="flex flex-col gap-4">
              {recues.map((d) => {
                const prenom = prenomDe.get(d.demandeur_id) ?? "Quelqu'un";
                return (
                  <article key={d.id} className="carte p-5">
                    <div className="flex items-start gap-3">
                      <Avatar prenom={prenom} taille={42} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold">{prenom}</p>
                          <Statut statut={d.statut} />
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          veut te contacter pour « {d.annonces?.titre ?? "annonce supprimée"} » · {formatDate.format(new Date(d.created_at))}
                        </p>
                      </div>
                    </div>
                    {d.statut === "en_attente" && (
                      <form action={repondreDemande} className="mt-4 flex gap-2">
                        <input type="hidden" name="demandeId" value={d.id} />
                        <button name="reponse" value="acceptee" className="bouton bouton-principal flex-1">
                          Accepter
                        </button>
                        <button name="reponse" value="refusee" className="bouton bouton-secondaire flex-1">
                          Refuser
                        </button>
                      </form>
                    )}
                    {d.statut === "acceptee" ? (
                      <BlocCoordonnees c={coord.get(d.demandeur_id)} prenom={prenom} demandeId={d.id} />
                    ) : d.statut === "en_attente" ? (
                      <CadenasFerme />
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="min-w-0">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
            <Icone nom="envoyer" taille={20} className="text-bleu" />
            Envoyées
          </h2>
          {envoyees.length === 0 ? (
            <EtatVide
              icone="envoyer"
              titre="Aucune demande envoyée"
              texte="Trouve une annonce qui t'intéresse et demande le contact."
              action={
                <Link href="/annonces" className="bouton bouton-principal">
                  Voir les annonces
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              {envoyees.map((d) => {
                const prenom = prenomDe.get(d.destinataire_id) ?? "l'auteur";
                return (
                  <article key={d.id} className="carte p-5">
                    <div className="flex items-start gap-3">
                      <Avatar prenom={prenom} taille={42} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold">{prenom}</p>
                          <Statut statut={d.statut} />
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Ta demande pour « {d.annonces?.titre ?? "annonce supprimée"} » · {formatDate.format(new Date(d.created_at))}
                        </p>
                      </div>
                    </div>
                    {d.statut === "acceptee" ? (
                      <BlocCoordonnees c={coord.get(d.destinataire_id)} prenom={prenom} demandeId={d.id} />
                    ) : d.statut === "refusee" ? (
                      <p className="mt-4 text-sm text-gris">Cette personne a refusé la demande.</p>
                    ) : (
                      <CadenasFerme />
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
