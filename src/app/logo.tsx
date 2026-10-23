import Link from "next/link";
import { Icone } from "./icone";

// Logo CampusLink : une vignette en dégradé avec deux maillons, et le nom.
export function Logo({ clair = false }: { clair?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="CampusLink, accueil">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${
          clair ? "border border-white/40 bg-white/20" : "degrade"
        }`}
      >
        <Icone nom="lien" taille={19} epaisseur={2.3} />
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${clair ? "text-white" : "text-encre"}`}>
        CampusLink
      </span>
    </Link>
  );
}
