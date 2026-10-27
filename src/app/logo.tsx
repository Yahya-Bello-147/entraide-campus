import Link from "next/link";
import { Icone } from "./icone";

// Logo CampusLink : une vignette avec deux maillons, et le nom (version claire pour la barre bleue).
export function Logo({ clair = false }: { clair?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="CampusLink, accueil">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          clair ? "bg-white text-violet" : "degrade text-white"
        }`}
      >
        <Icone nom="lien" taille={19} epaisseur={2.3} />
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${clair ? "text-white" : "text-indigo"}`}>
        CampusLink
      </span>
    </Link>
  );
}
