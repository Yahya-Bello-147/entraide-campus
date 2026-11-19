import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { repondreDemande } from "./demandes/actions";
import { Icone, type NomIcone } from "./icone";
import { DecorBandeau } from "./illustrations";
import { Avatar, PastilleCategorie, VignetteCategorie } from "./ui";
import { TYPES, type CategorieAnnonce, type TypeAnnonce } from "@/lib/annonces/valider";
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

// Étape 3 : ce que voit un visiteur, via la fonction limitée « annonces_apercu » (jamais l'auteur ni la description).
type AnnonceApercu = {
  titre: string;
  categorie: CategorieAnnonce;
  type: TypeAnnonce;
  prix: number | null;
  campus: string | null;
  created_at: string;
};

function ilYa(date: string) {
  const jours = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return "hier";
  return `il y a ${jours} jours`;
}

async function Accueil() {
  const supabase = await createClient();
  const [{ data }, { data: nombre }] = await Promise.all([
    supabase.rpc("annonces_apercu"),
    supabase.rpc("nombre_annonces_actives"),
  ]);
  const apercu = (data ?? []) as AnnonceApercu[];
  const nombreAnnonces = typeof nombre === "number" ? nombre : null;

  return (
    <main className="flex flex-1 flex-col">
      {/* Accueil « version pro » (maquette validée le 19 nov) : texte à gauche, scène 3D à droite, bandes qui défilent. */}
      <section className="relative overflow-hidden bg-[radial-gradient(1200px_600px_at_85%_15%,#f3e3fb_0%,transparent_60%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-12 lg:pb-20">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="flex items-center rounded-2xl bg-white px-5 py-3.5 shadow-[0_10px_26px_rgb(63_34_110/0.12)]">
                <Image src="/esp-logo-nouveau.png" alt="ESP" width={986} height={441} priority sizes="120px" className="h-9 w-auto sm:h-11" />
              </span>
              <span className="text-sm leading-snug font-bold text-gray-600">
                Le site d&apos;entraide
                <br />
                des étudiants des 6 campus
              </span>
            </div>
            <h1 className="titre text-5xl leading-[0.98] tracking-[-0.045em] sm:text-7xl">
              L&apos;entraide
              <br />
              entre étudiants
              <br />
              de <span className="bg-gradient-to-r from-violet to-rose bg-clip-text text-transparent">l&apos;ESP.</span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-gray-600">
              Photo, vidéo, dev, coloc, covoiturage… Propose ce que tu sais faire, trouve qui peut t&apos;aider sur ton campus.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/inscription" className="bouton bouton-principal px-7 py-3.5 text-base">
                Créer mon compte ESP →
              </Link>
              <a href="#annonces" className="bouton bouton-contour px-6 py-3.5 text-base">
                Voir les annonces
              </a>
            </div>
            <p className="-mt-2 text-sm text-gris">
              Avec ton adresse <span className="whitespace-nowrap">@mail-esp.com</span> ou{" "}
              <span className="whitespace-nowrap">@mail-esd.com</span>
            </p>
            <dl className="mt-2 flex flex-wrap gap-x-9 gap-y-3">
              {nombreAnnonces !== null && <ChiffreAccueil libelle="annonces en ligne" valeur={String(nombreAnnonces)} />}
              <ChiffreAccueil libelle="campus ESP" valeur={String(CAMPUS.length)} />
              <ChiffreAccueil libelle="coordonnées protégées" valeur="100 %" />
            </dl>
          </div>
          <SceneAnnonces />
        </div>
      </section>

      {/* Deux bandes qui défilent (décoratives : le même texte est lisible plus bas dans la page). */}
      <div aria-hidden="true" className="relative -mx-6 mb-12 overflow-hidden py-3 select-none">
        <div className="-rotate-2 bg-encre py-3.5 text-white">
          <div className="defile flex w-max">
            {[0, 1].map((n) => (
              <span key={n} className="flex">
                {["Photo", "Vidéo", "Dev", "Community management", "Coloc", "Covoiturage", "Objets"].map((mot) => (
                  <span key={mot} className="flex items-center text-2xl font-extrabold sm:text-3xl">
                    <span className="px-5">{mot}</span>
                    <span className="text-or">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 rotate-[1.5deg] bg-violet py-2.5 text-white">
          <div className="defile-inverse flex w-max">
            {[0, 1].map((n) => (
              <span key={n} className="flex">
                {CAMPUS.map((c) => (
                  <span key={c} className="flex items-center text-lg font-extrabold sm:text-xl">
                    <span className="px-5">ESP {c}</span>
                    <span className="text-or">●</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {apercu.length > 0 && (
        <section id="annonces" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 pt-4 pb-10 sm:px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-wider text-violet uppercase">En ce moment</p>
              <h2 className="titre mt-1 text-3xl text-indigo sm:text-4xl">Les dernières annonces sur les campus ESP</h2>
              <p className="mt-2 text-gris">
                Un aperçu de ce que les étudiants proposent et cherchent. Connecte-toi pour tout voir et contacter.
              </p>
            </div>
            <Link href="/connexion" className="bouton bouton-principal px-6">
              Voir toutes les annonces
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apercu.map((a) => (
              <li key={`${a.created_at}-${a.titre}`} className="carte flex min-w-0 flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <VignetteCategorie categorie={a.categorie} taille={48} />
                  <p className="min-w-0 font-bold leading-snug break-words">{a.titre}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <PastilleCategorie categorie={a.categorie} />
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">{TYPES[a.type]}</span>
                  {a.prix !== null && (
                    <span className="rounded-full bg-indigo/10 px-2.5 py-1 text-xs font-bold text-indigo">{formatPrix.format(a.prix)}</span>
                  )}
                  {a.campus && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet/10 px-2.5 py-1 text-xs font-bold text-violet">
                      <Icone nom="epingle" taille={12} />
                      ESP {a.campus}
                    </span>
                  )}
                </div>
                <p className="mt-auto flex items-center gap-2 border-t border-ligne pt-3 text-sm text-gris">
                  <span className="h-6 w-6 rounded-full bg-gray-200" aria-hidden="true" />
                  Un étudiant de l&apos;ESP · {ilYa(a.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

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

function ChiffreAccueil({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <div>
      <dt className="sr-only">{libelle}</dt>
      <dd className="text-3xl font-extrabold">{valeur}</dd>
      <dd className="text-sm font-semibold text-gris" aria-hidden="true">
        {libelle}
      </dd>
    </div>
  );
}

// Décor de l'accueil : des cartes du site inclinées en 3D qui flottent (grand écran seulement).
function SceneAnnonces() {
  const carte = "absolute rounded-[22px] bg-white p-4 shadow-[0_30px_60px_rgb(63_34_110/0.28),0_6px_14px_rgb(63_34_110/0.12)]";
  return (
    <div aria-hidden="true" className="scene-3d relative hidden h-[480px] select-none lg:block">
      <div className="absolute top-12 left-14 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_35%_35%,#c7aee0,#8e66b8)] opacity-55 blur-[2px]" />
      <div className={`${carte} flotte-1 top-6 left-0 w-[300px]`}>
        <div className="flex items-center gap-3">
          <VignetteCategorie categorie="photo" taille={44} />
          <div>
            <p className="font-bold">Shooting portrait pour ton book</p>
            <p className="mt-1 flex gap-1.5">
              <PastilleCategorie categorie="photo" />
              <span className="rounded-full bg-violet/10 px-2 py-0.5 text-xs font-bold text-violet">ESP Lyon</span>
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-ligne pt-3">
          <span className="text-xs text-gris">Léa · Photographie</span>
          <span className="rounded-full bg-rose px-3 py-1.5 text-xs font-bold text-white">Demander le contact</span>
        </div>
      </div>
      <div className={`${carte} flotte-2 top-48 left-44 w-[290px]`}>
        <div className="flex items-center gap-3">
          <VignetteCategorie categorie="dev" taille={44} />
          <div>
            <p className="font-bold">Aide sur mon site React</p>
            <p className="mt-1 flex gap-1.5">
              <PastilleCategorie categorie="dev" />
              <span className="rounded-full bg-violet/10 px-2 py-0.5 text-xs font-bold text-violet">ESP Paris</span>
            </p>
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-violet/10 px-3 py-2 text-xs font-bold text-indigo">Tu peux aider ! Ça correspond à tes compétences.</p>
      </div>
      <div className={`${carte} flotte-3 top-[350px] left-8 flex w-[270px] items-center gap-3`}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-succes/15 text-succes">
          <Icone nom="cadenasOuvert" taille={18} />
        </span>
        <div>
          <p className="text-sm font-bold">Sam a accepté ta demande</p>
          <p className="text-xs font-bold text-succes">Coordonnées débloquées</p>
        </div>
      </div>
    </div>
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
    ? await supabase.from("profils").select("id, prenom, campus, photo").in("id", ids)
    : { data: [] };
  const prenomDe = new Map((profils ?? []).map((p) => [p.id as string, p.prenom as string]));
  const photoDe = new Map((profils ?? []).map((p) => [p.id as string, p.photo as string | null]));

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
                      <Avatar prenom={prenomDe.get(d.demandeur_id)} photo={photoDe.get(d.demandeur_id)} taille={40} />
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
                        <Avatar prenom={autre} photo={photoDe.get(autreDe.get(m.demande_id)!)} taille={42} />
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
            Annonces récentes des autres étudiants{deMonCampus.length > 0 ? ` · à ${campus}` : ""}
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
