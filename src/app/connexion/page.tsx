import Link from "next/link";
import { connexion } from "@/app/auth/actions";
import { FormulaireAuth } from "@/app/auth/formulaire-auth";
import { CadreAuth } from "@/app/auth/cadre-auth";

export default function PageConnexion() {
  return (
    <CadreAuth
      titre="Content de te revoir"
      sousTitre="Connecte-toi pour retrouver tes annonces et tes messages."
      pied={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-indigo">
            Créer un compte
          </Link>
        </>
      }
    >
      <FormulaireAuth action={connexion} libelleBouton="Se connecter" autocompleteMotDePasse="current-password" />
      <p className="mt-4 text-center text-sm">
        <Link href="/mot-de-passe-oublie" className="font-semibold text-indigo hover:underline">
          Mot de passe oublié ?
        </Link>
      </p>
    </CadreAuth>
  );
}
