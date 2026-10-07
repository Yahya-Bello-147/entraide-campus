import Link from "next/link";
import { connexion } from "@/app/auth/actions";
import { FormulaireAuth } from "@/app/auth/formulaire-auth";

export default function PageConnexion() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Se connecter</h1>
      <FormulaireAuth
        action={connexion}
        libelleBouton="Se connecter"
        autocompleteMotDePasse="current-password"
      />
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="underline">
          Créer un compte
        </Link>
      </p>
    </main>
  );
}
