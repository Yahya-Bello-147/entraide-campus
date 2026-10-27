"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { deconnexion } from "@/app/auth/actions";
import { Icone, type NomIcone } from "./icone";
import { DecorMenu } from "./illustrations";
import { Logo } from "./logo";
import { Avatar } from "./ui";

type Lien = { href: string; libelle: string; icone: NomIcone; pastille?: number };

function estActif(chemin: string, href: string) {
  if (chemin === "/annonces/nouvelle") return false; // c'est le bouton ＋ « Publier » qui est en avant
  return href === "/" ? chemin === "/" : chemin === href || chemin.startsWith(`${href}/`);
}

function Pastille({ nombre }: { nombre?: number }) {
  if (!nombre) return null;
  return (
    <span className="absolute -top-1.5 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[11px] font-bold text-white">
      {nombre > 9 ? "9+" : nombre}
    </span>
  );
}

// Menu des personnes connectées : barre violette verticale à gauche sur ordinateur,
// petite barre en haut + barre d'onglets en bas sur téléphone et tablette.
export function Navigation({ demandesEnAttente, prenom }: { demandesEnAttente: number; prenom: string | null }) {
  const chemin = usePathname();
  const liens: Lien[] = [
    { href: "/", libelle: "Accueil", icone: "accueil" },
    { href: "/annonces", libelle: "Annonces", icone: "grille" },
    { href: "/demandes", libelle: "Demandes", icone: "boite", pastille: demandesEnAttente },
    { href: "/messages", libelle: "Messages", icone: "message" },
  ];
  const profilActif = estActif(chemin, "/profil");

  return (
    <>
      {/* Ordinateur : la classe barre-gauche décale la page vers la droite (voir layout.tsx). */}
      <aside className="barre-gauche fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden bg-violet px-4 py-6 text-white lg:flex">
        <DecorMenu />
        <div className="relative px-2 pb-7">
          <Logo clair />
        </div>

        <Link
          href="/annonces/nouvelle"
          className="relative mb-5 flex items-center justify-center gap-2 rounded-full bg-rose px-4 py-3 font-extrabold text-white shadow-[0_8px_18px_rgb(0_0_0/0.18)] transition hover:brightness-105 active:scale-[0.98]"
        >
          <Icone nom="plus" taille={18} epaisseur={2.5} />
          Publier une annonce
        </Link>

        <nav aria-label="Menu principal" className="relative flex flex-col gap-1">
          {liens.map((l) => {
            const actif = estActif(chemin, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={actif ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition-colors ${
                  actif ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icone nom={l.icone} taille={20} />
                {l.libelle}
                {l.pastille ? (
                  <span className="ml-auto flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-or px-1.5 text-xs font-extrabold text-encre">
                    {l.pastille > 9 ? "9+" : l.pastille}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto flex flex-col gap-3 border-t border-white/20 pt-4">
          <Link
            href="/profil"
            aria-current={profilActif ? "page" : undefined}
            className={`flex items-center gap-3 rounded-2xl px-2.5 py-2 transition-colors ${
              profilActif ? "bg-white/15" : "hover:bg-white/10"
            }`}
          >
            <span className="rounded-full bg-white p-0.5">
              <Avatar prenom={prenom} taille={36} />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-bold">{prenom ?? "Mon compte"}</span>
              <span className="text-xs text-white/65">Mon profil</span>
            </span>
          </Link>
          <form action={deconnexion}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
            >
              <Icone nom="sortie" taille={17} />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-ligne/60 bg-white/80 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/demandes"
              aria-label={`Demandes${demandesEnAttente ? ` (${demandesEnAttente} en attente)` : ""}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gris hover:bg-black/5"
            >
              <Icone nom="cloche" taille={21} />
              <Pastille nombre={demandesEnAttente} />
            </Link>
            <Link
              href="/profil"
              aria-label="Mon profil"
              className={`rounded-full p-0.5 ${profilActif ? "ring-2 ring-violet" : ""}`}
            >
              <Avatar prenom={prenom} taille={36} />
            </Link>
          </div>
        </div>
      </header>

      <nav
        aria-label="Menu principal"
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-3xl bg-white/90 px-1 py-2 shadow-[0_10px_30px_rgb(17_24_39/0.14)] backdrop-blur-md lg:hidden"
      >
        {liens.slice(0, 2).map((l) => (
          <LienOnglet key={l.href} lien={l} actif={estActif(chemin, l.href)} />
        ))}
        <Link
          href="/annonces/nouvelle"
          aria-label="Publier une annonce"
          className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-rose text-white shadow-[0_10px_24px_rgb(239_71_111/0.4)]"
        >
          <Icone nom="plus" taille={26} epaisseur={2.5} />
        </Link>
        {liens.slice(2).map((l) => (
          <LienOnglet key={l.href} lien={l} actif={estActif(chemin, l.href)} />
        ))}
      </nav>
    </>
  );
}

function LienOnglet({ lien, actif }: { lien: Lien; actif: boolean }) {
  return (
    <Link
      href={lien.href}
      aria-current={actif ? "page" : undefined}
      className={`flex min-w-14 flex-col items-center gap-0.5 px-1 py-1 text-[11px] font-semibold ${
        actif ? "text-violet" : "text-gris"
      }`}
    >
      <span className="relative">
        <Icone nom={lien.icone} taille={22} />
        <Pastille nombre={lien.pastille} />
      </span>
      {lien.libelle}
    </Link>
  );
}
