import Link from "next/link";

export default function PageIntrouvable() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="titre mb-4 text-6xl text-creme">Introuvable</h1>
      <p className="mb-8 text-lg">
        Cette page n&apos;existe pas, ou tu n&apos;as pas le droit de la voir.
      </p>
      <Link href="/annonces" className="titre rounded-full bg-creme px-6 py-3 text-xl text-encre">
        Retour aux annonces
      </Link>
    </main>
  );
}
