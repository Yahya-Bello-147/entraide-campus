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
    </CadreAuth>
  );
}
