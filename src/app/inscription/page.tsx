import Link from "next/link";
import { inscription } from "@/app/auth/actions";
import { FormulaireAuth } from "@/app/auth/formulaire-auth";
import { Carte } from "@/app/carte";

export default function PageInscription() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-10">
      <h1 className="titre mb-6 text-center text-5xl text-creme">Créer mon compte</h1>
      <Carte onglet="Inscription">
        <FormulaireAuth
          action={inscription}
          libelleBouton="Créer mon compte"
          autocompleteMotDePasse="new-password"
        />
      </Carte>
      <p className="mt-6 text-center text-sm">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-semibold underline">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
