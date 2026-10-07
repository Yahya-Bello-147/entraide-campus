import Link from "next/link";
import { inscription } from "@/app/auth/actions";
import { FormulaireAuth } from "@/app/auth/formulaire-auth";

export default function PageInscription() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Créer mon compte</h1>
      <FormulaireAuth
        action={inscription}
        libelleBouton="Créer mon compte"
        autocompleteMotDePasse="new-password"
      />
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="underline">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
