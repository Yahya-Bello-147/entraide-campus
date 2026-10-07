import Link from "next/link";
import { connexion } from "@/app/auth/actions";
import { FormulaireAuth } from "@/app/auth/formulaire-auth";
import { Carte } from "@/app/carte";

export default function PageConnexion() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-10">
      <h1 className="titre mb-6 text-center text-5xl text-creme">Se connecter</h1>
      <Carte onglet="Connexion">
        <FormulaireAuth
          action={connexion}
          libelleBouton="Se connecter"
          autocompleteMotDePasse="current-password"
        />
      </Carte>
      <p className="mt-6 text-center text-sm">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold underline">
          Créer un compte
        </Link>
      </p>
    </main>
  );
}
