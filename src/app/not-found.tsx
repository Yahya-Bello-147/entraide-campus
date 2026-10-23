import Link from "next/link";
import { Icone } from "./icone";

export default function PageIntrouvable() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-violet/10 text-violet">
        <Icone nom="recherche" taille={30} />
      </span>
      <h1 className="titre mb-3 text-4xl">Introuvable</h1>
      <p className="mb-8 text-gris">Cette page n&apos;existe pas, ou tu n&apos;as pas le droit de la voir.</p>
      <Link href="/annonces" className="bouton bouton-principal">
        Retour aux annonces
      </Link>
    </main>
  );
}
