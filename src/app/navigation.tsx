"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { deconnexion } from "@/app/auth/actions";

const LIENS = [
  { href: "/annonces", libelle: "Annonces" },
  { href: "/demandes", libelle: "Mes demandes" },
  { href: "/profil", libelle: "Mon profil" },
];

const styleBouton =
  "titre rounded-full px-4 py-2 text-base whitespace-nowrap transition-colors sm:px-5 sm:text-lg";

// Menu des personnes connectées : la page en cours est en crème.
export function Navigation() {
  const chemin = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
      {LIENS.map(({ href, libelle }) => {
        const actif = chemin === href || chemin.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={actif ? "page" : undefined}
            className={`${styleBouton} ${
              actif ? "bg-creme text-encre" : "border-2 border-white text-white hover:bg-white/15"
            }`}
          >
            {libelle}
          </Link>
        );
      })}
      <form action={deconnexion}>
        <button
          type="submit"
          className="rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 underline hover:text-white"
        >
          Se déconnecter
        </button>
      </form>
    </nav>
  );
}
