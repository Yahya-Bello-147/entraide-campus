import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { repondreDemande } from "./demandes/actions";
import { Icone, type NomIcone } from "./icone";
import { DecorBandeau, IllustrationAccueil, VaguesAccueil } from "./illustrations";
import { Avatar, PastilleCategorie, VignetteCategorie } from "./ui";
import type { CategorieAnnonce } from "@/lib/annonces/valider";
import { meilleuresCorrespondances } from "@/lib/annonces/correspondance";
import { CAMPUS, photoCampus } from "@/lib/campus";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? <TableauDeBord userId={user.id} /> : <Accueil />;
}

/* ───────────── Avant connexion ───────────── */

const ETAPES: { icone: NomIcone; titre: string; texte: string; couleur: string }[] = [
  { icone: "utilisateur", titre: "Crée ton compte ESP", texte: "Ton CV remplit ton profil grâce à l'IA.", couleur: "#ede9fe" },
  { icone: "plus", titre: "Publie une annonce", texte: "Je propose ou je cherche, en une minute.", couleur: "#dbeafe" },
  { icone: "cadenas", titre: "Échange en confiance", texte: "Tes coordonnées restent cachées jusqu'à ton accord.", couleur: "#fce7f3" },
];

function Accueil() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Remonte sous la barre du haut (transparente) pour que la vague passe derrière le menu. */}
      <section className="relative -mt-18 overflow-hidden pt-18">
        <VaguesAccueil />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pt-10 pb-24 sm:px-6 lg:grid-cols-[1fr_1fr] lg:pt-14 lg:pb-32">
          <div className="flex flex-col gap-5">
            <span className="self-start rounded-full bg-white px-3.5 py-2 text-xs font-extrabold text-violet shadow-sm sm:text-sm">
              Pour les étudiants de l&apos;ESP · 6 campus
            </span>
            <div className="relative mt-2 self-start">
              <h1 className="titre text-5xl leading-none text-indigo uppercase sm:text-7xl sm:whitespace-nowrap">
                L&apos;ESP qui
                <br />
                s&apos;entraide
              </h1>
              <span className="absolute -top-1 -right-24 hidden h-[78px] w-[78px] items-center justify-center rounded-full bg-or text-center text-sm leading-tight font-extrabold text-encre shadow-md sm:flex">
                6
                <br />
                campus
              </span>
            </div>
            <div>
              <p className="max-w-md text-lg leading-relaxed text-gray-700">
                Propose ce que tu sais faire, trouve ce dont tu as besoin, entre étudiants de ton campus.
              </p>
              <p className="mt-2 text-sm text-gris">Photo · Vidéo · Dev · Coloc · Covoiturage · Objets</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/inscription" className="bouton bouton-principal px-7">
                Créer mon compte ESP
              </Link>
              <Link href="/connexion" className="bouton font-bold text-indigo hover:bg-white/60">
                Se connecter →
              </Link>
            </div>
            <p className="-mt-2 text-sm text-gris">
              Avec ton adresse <span className="whitespace-nowrap">@mail-esp.com</span> ou{" "}
              <span className="whitespace-nowrap">@mail-esd.com</span>
            </p>
          </div>
          <IllustrationAccueil className="mx-auto w-full max-w-md lg:max-w-none" />
        </div>
      </section>

      <section id="campus" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 pt-4 pb-6 sm:px-6">
        <p className="text-sm font-bold tracking-wider text-violet uppercase">Les campus</p>
        <h2 className="titre mt-1 mb-6 text-3xl text-indigo sm:text-4xl">6 campus, une seule communauté ESP</h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {CAMPUS.map((c) => (
            <li key={c} className="carte overflow-hidden">
              <div className="relative h-32 sm:h-44">
                <Image
                  src={photoCampus(c)}
                  alt={`Le campus ESP de ${c}`}
                  fill
                  sizes="(min-width: 1024px) 360px, 50vw"
                  className="object-cover"
                />
                <CreditPhoto />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className="text-lg font-extrabold text-indigo">{c}</span>
                <span className="rounded-full bg-violet/10 px-2.5 py-1 text-xs font-bold text-violet">ESP {c}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="comment" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-12 sm:px-6">
        <p className="mb-4 text-sm font-bold tracking-wider text-violet uppercase">Comment ça marche</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {ETAPES.map((e) => (
            <div key={e.titre} className="carte flex items-center gap-4 p-5 sm:flex-col sm:items-start">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-violet"
                style={{ background: e.couleur }}
              >
                <Icone nom={e.icone} taille={24} />
              </span>
              <div>
                <p className="font-bold">{e.titre}</p>
                <p className="mt-1 text-sm text-gris">{e.texte}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto bg-violet px-4 py-5 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-sm">
          <b className="text-base">CampusLink · l&apos;entraide des étudiants de l&apos;ESP</b>
          <span className="text-white/85">{CAMPUS.join(" · ")}</span>
        </div>
      </footer>
    </main>
  );
}

/* ───────────── Connecté : le tableau de bord ───────────── */

type DemandeRecue = { id: string; demandeur_id: string; annonces: { titre: string } | null };
type AnnonceRecente = {
  id: string;
  auteur_id: string;
  titre: string;
  categorie: CategorieAnnonce;
  type: string;
  prix: number | null;
  lieu: string | null;
};

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const formatJour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

async function TableauDeBord({ userId }: { userId: string }) {
  const supabase = await createClient();

  const [
    { data: profil },
    { data: mesAnnonces },
    { data: recues },
    { data: acceptees },
    { data: recentes },
    { data: recherches },
  ] =
    await Promise.all([
      supabase.from("profils").select("prenom, competences, campus").eq("id", userId).maybeSingle(),
      supabase.from("annonces").select("statut").eq("auteur_id", userId),
      supabase
        .from("demandes_contact")
        .select("id, demandeur_id, annonces(titre)")
        .eq("destinataire_id", userId)
        .eq("statut", "en_attente")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("demandes_contact")
        .select("id, demandeur_id, destinataire_id")
        .eq("statut", "acceptee"),
      supabase
        .from("annonces")
        .select("id, auteur_id, titre, categorie, type, prix, lieu")
        .eq("statut", "active")
        .neq("auteur_id", userId)
        .order("created_at", { ascending: false })
        .limit(30),
      // Les « Je cherche » des autres, à comparer avec mes compétences (palier 3).
      supabase
        .from("annonces")
        .select("id, titre, description, categorie, type, statut, auteur_id, prix, lieu")
        .eq("type", "cherche")
        .eq("statut", "active")
        .neq("auteur_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  const mesCompetences = ((profil?.competences as string[] | undefined) ?? []);
  const suggestions = meilleuresCorrespondances(
    mesCompetences,
    (recherches ?? []) as (AnnonceRecente & { description: string; statut: string; auteur_id: string })[],
    userId,
    3,
  );

  const demandes = (recues ?? []) as unknown as DemandeRecue[];
  const conversations = acceptees ?? [];
  const autreDe = new Map(
    conversations.map((d) => [d.id as string, (d.demandeur_id === userId ? d.destinataire_id : d.demandeur_id) as string]),
  );

  // Derniers messages reçus (de l'autre personne) dans mes conversations.
  const { data: messages } = conversations.length
    ? await supabase
        .from("messages")
        .select("demande_id, contenu, auteur_id, created_at")
        .in("demande_id", [...autreDe.keys()])
        .neq("auteur_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };
  const derniers: { demande_id: string; contenu: string }[] = [];
  for (const m of messages ?? []) {
    if (!derniers.some((d) => d.demande_id === m.demande_id)) derniers.push(m);
    if (derniers.length === 2) break;
  }

  const auteursRecents = ((recentes ?? []) as AnnonceRecente[]).map((a) => a.auteur_id);
  const ids = [
    ...new Set([
      ...demandes.map((d) => d.demandeur_id),
      ...derniers.map((m) => autreDe.get(m.demande_id)!),
      ...auteursRecents,
    ]),
  ];
  const { data: profils } = ids.length
    ? await supabase.from("profils").select("id, prenom, campus").in("id", ids)
    : { data: [] };
  const prenomDe = new Map((profils ?? []).map((p) => [p.id as string, p.prenom as string]));

  const actives = (mesAnnonces ?? []).filter((a) => a.statut === "active").length;
  const pourvues = (mesAnnonces ?? []).filter((a) => a.statut === "pourvue").length;
  const prenom = (profil?.prenom as string | undefined) ?? null;
  const campus = CAMPUS.find((c) => c === profil?.campus) ?? null;

  // Annonces récentes : d'abord celles de mon campus (étape 2), sinon celles de tous les campus.
  const campusDe = new Map((profils ?? []).map((p) => [p.id as string, p.campus as string | null]));
  const toutesRecentes = (recentes ?? []) as AnnonceRecente[];
  const deMonCampus = campus ? toutesRecentes.filter((a) => campusDe.get(a.auteur_id) === campus) : [];
  const recentesAffichees = (deMonCampus.length > 0 ? deMonCampus : toutesRecentes).slice(0, 4);

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-violet text-white md:rounded-b-[2.5rem] lg:m-5 lg:rounded-[2rem]">
        <DecorBandeau avecIllustration={!campus} />
        {campus && (
          // La photo de mon campus en « carte postale », à la place de l'ordinateur (grand écran).
          <div className="absolute top-1/2 right-10 hidden h-40 w-60 -translate-y-1/2 rotate-3 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-[0_12px_28px_rgb(0_0_0/0.2)] lg:block">
            <Image src={photoCampus(campus)} alt={`Le campus ESP de ${campus}`} fill sizes="240px" className="object-cover" />
            <CreditPhoto />
          </div>
        )}
        <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 sm:pt-10">
          <div className="flex flex-wrap items-center gap-2.5">
            {campus ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-violet">
                <Icone nom="epingle" taille={14} className="text-rose" />
                ESP {campus}
              </span>
            ) : (
              <Link href="/profil" className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-bold hover:bg-white/30">
                <Icone nom="epingle" taille={14} />
                Choisis ton campus
              </Link>
            )}
            <p className="text-sm text-white/75 first-letter:uppercase">{formatJour.format(new Date())}</p>
          </div>
          <h1 className="titre mt-1 text-3xl sm:text-4xl">Bonjour {prenom ?? "et bienvenue"} !</h1>
          <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
            <Chiffre valeur={actives} libelle={actives > 1 ? "annonces actives" : "annonce active"} />
            <Chiffre valeur={pourvues} libelle={pourvues > 1 ? "pourvues ou vendues" : "pourvue ou vendue"} />
            <Chiffre valeur={conversations.length} libelle={conversations.length > 1 ? "contacts" : "contact"} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          {!prenom && (
            <Link href="/profil" className="carte carte-survol flex items-center gap-4 p-5">
              <span className="degrade flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white">
                <Icone nom="utilisateur" taille={22} />
              </span>
              <span className="flex-1">
                <span className="block font-bold">Complète ton profil</span>
                <span className="block text-sm text-gris">Il faut un prénom, ton campus et des coordonnées pour publier et contacter.</span>
              </span>
              <Icone nom="fleche" taille={20} className="text-gris" />
            </Link>
          )}

          <section className="carte p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Demandes en attente</h2>
              {demandes.length > 0 && (
                <span className="rounded-full bg-rose px-2.5 py-0.5 text-xs font-bold text-white">{demandes.length}</span>
              )}
            </div>
            {demandes.length === 0 ? (
              <p className="text-sm text-gris">Aucune demande à traiter pour l&apos;instant.</p>
            ) : (
              <ul className="flex flex-col gap-5">
                {demandes.map((d) => (
                  <li key={d.id} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar prenom={prenomDe.get(d.demandeur_id)} taille={40} />
                      <p className="text-sm text-gray-700">
                        <b className="text-encre">{prenomDe.get(d.demandeur_id) ?? "Quelqu'un"}</b> veut te contacter pour «{" "}
                        {d.annonces?.titre ?? "ton annonce"} »
                      </p>
                    </div>
                    <form action={repondreDemande} className="flex gap-2">
                      <input type="hidden" name="demandeId" value={d.id} />
                      <button name="reponse" value="acceptee" className="bouton bouton-principal flex-1">
                        Accepter
                      </button>
                      <button name="reponse" value="refusee" className="bouton bouton-secondaire flex-1">
                        Refuser
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="carte p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Derniers messages</h2>
              <Link href="/messages" className="text-sm font-semibold text-indigo">
                Tout voir
              </Link>
            </div>
            {derniers.length === 0 ? (
              <p className="text-sm text-gris">Pas encore de message. Une conversation s&apos;ouvre après une demande acceptée.</p>
            ) : (
              <ul className="flex flex-col">
                {derniers.map((m) => {
                  const autre = prenomDe.get(autreDe.get(m.demande_id)!);
                  return (
                    <li key={m.demande_id}>
                      <Link
                        href={`/messages/${m.demande_id}`}
                        className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-black/[0.03]"
                      >
                        <Avatar prenom={autre} taille={42} />
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold">{autre ?? "Conversation"}</span>
                          <span className="block truncate text-sm text-gris">{m.contenu}</span>
                        </span>
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-bleu" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Link
            href="/annonces/nouvelle"
            className="carte-survol flex items-center gap-4 rounded-[20px] bg-violet/10 p-5 text-violet"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-violet">
              <Icone nom="etincelles" taille={22} />
            </span>
            <span className="flex-1 font-semibold">Décris ton annonce en quelques mots, l&apos;assistant la rédige pour toi</span>
            <Icone nom="fleche" taille={20} />
          </Link>

          <section className="carte p-5">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-or text-encre">
                <Icone nom="etincelles" taille={17} />
              </span>
              Tu peux aider
            </h2>
            <p className="mt-1 mb-4 text-sm text-gris">Les demandes qui correspondent à tes compétences.</p>
            {mesCompetences.length === 0 ? (
              <Link href="/profil" className="flex items-center gap-3 rounded-2xl bg-violet/10 p-4 text-sm font-semibold text-violet">
                <Icone nom="televerser" taille={20} className="shrink-0" />
                <span className="flex-1">Dépose ton CV dans ton profil : l&apos;IA trouve tes compétences, et on te montre où tu peux aider.</span>
                <Icone nom="fleche" taille={18} />
              </Link>
            ) : suggestions.length === 0 ? (
              <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                Aucune demande ne correspond à tes compétences pour l&apos;instant. On te préviendra ici dès qu&apos;il y en a une.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {suggestions.map(({ annonce: a, competences }) => (
                  <li key={a.id}>
                    <Link href={`/annonces/${a.id}`} className="flex items-center gap-3 rounded-2xl border border-ligne p-3 transition hover:border-violet/40 hover:bg-violet/5">
                      <VignetteCategorie categorie={a.categorie} taille={44} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{a.titre}</span>
                        <span className="mt-1 flex flex-wrap gap-1">
                          {competences.slice(0, 2).map((c) => (
                            <span key={c} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                              {c}
                            </span>
                          ))}
                        </span>
                      </span>
                      <Icone nom="fleche" taille={18} className="shrink-0 text-gris" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Annonces récentes : sur toute la largeur, en bas du tableau de bord. */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">
            Annonces récentes{deMonCampus.length > 0 ? ` · à ${campus}` : ""}
          </h2>
          <Link href="/annonces" className="text-sm font-semibold text-indigo">
            Toutes les annonces
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {recentesAffichees.map((a) => (
            <Link key={a.id} href={`/annonces/${a.id}`} className="carte carte-survol flex min-w-0 items-center gap-3 p-3.5">
              <VignetteCategorie categorie={a.categorie} taille={48} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{a.titre}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gris">
                  <PastilleCategorie categorie={a.categorie} />
                  {a.lieu && <span className="truncate">{a.lieu}</span>}
                </span>
              </span>
              {a.prix !== null && <span className="shrink-0 font-extrabold text-violet">{formatPrix.format(a.prix)}</span>}
            </Link>
          ))}
        </div>
        {recentesAffichees.length === 0 && <p className="text-sm text-gris">Aucune nouvelle annonce pour le moment.</p>}
      </section>
    </main>
  );
}

// Les photos des campus viennent de l'ESP : on l'indique sur chaque photo.
function CreditPhoto() {
  return (
    <span className="absolute right-2 bottom-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white">
      Photo : ESP
    </span>
  );
}

function Chiffre({ valeur, libelle }: { valeur: number; libelle: string }) {
  return (
    // Au premier plan : fond assez opaque et flou derrière, pour que la vague ne passe pas à travers.
    <div className="relative rounded-2xl border border-white/30 bg-[#a17fcb]/90 p-3 shadow-sm backdrop-blur-sm">
      <p className="text-2xl font-extrabold">{valeur}</p>
      <p className="text-xs leading-tight text-white/85">{libelle}</p>
    </div>
  );
}
