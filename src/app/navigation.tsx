"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { deconnexion } from "@/app/auth/actions";
import { Icone, type NomIcone } from "./icone";
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

// Menu des personnes connectées : barre en haut sur ordinateur, barre d'onglets en bas sur téléphone.
export function Navigation({ demandesEnAttente, prenom }: { demandesEnAttente: number; prenom: string | null }) {
  const chemin = usePathname();
  const liens: Lien[] = [
    { href: "/", libelle: "Accueil", icone: "accueil" },
    { href: "/annonces", libelle: "Annonces", icone: "grille" },
    { href: "/demandes", libelle: "Demandes", icone: "boite", pastille: demandesEnAttente },
    { href: "/messages", libelle: "Messages", icone: "message" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ligne/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />

          <nav aria-label="Menu principal" className="hidden items-center gap-1 lg:flex">
            {liens.map((l) => {
              const actif = estActif(chemin, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={actif ? "page" : undefined}
                  className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    actif ? "bg-violet/10 text-violet" : "text-gris hover:bg-black/5 hover:text-encre"
                  }`}
                >
                  <span className="relative">
                    <Icone nom={l.icone} taille={18} />
                    <Pastille nombre={l.pastille} />
                  </span>
                  {l.libelle}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/annonces/nouvelle" className="bouton bouton-principal hidden lg:inline-flex">
              <Icone nom="plus" taille={18} epaisseur={2.5} />
              Publier
            </Link>
            <Link
              href="/demandes"
              aria-label={`Demandes${demandesEnAttente ? ` (${demandesEnAttente} en attente)` : ""}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gris hover:bg-black/5 lg:hidden"
            >
              <Icone nom="cloche" taille={21} />
              <Pastille nombre={demandesEnAttente} />
            </Link>
            <Link
              href="/profil"
              aria-label="Mon profil"
              className={`rounded-full p-0.5 ${estActif(chemin, "/profil") ? "ring-2 ring-violet" : ""}`}
            >
              <Avatar prenom={prenom} taille={36} />
            </Link>
            <form action={deconnexion} className="hidden lg:block">
              <button
                type="submit"
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-gris hover:bg-black/5 hover:text-encre"
              >
                <Icone nom="sortie" taille={20} />
              </button>
            </form>
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
          className="degrade -mt-8 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_10px_24px_rgb(79_70_229/0.4)]"
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
