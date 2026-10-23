import Link from "next/link";
import { inscription } from "@/app/auth/actions";
import { FormulaireAuth } from "@/app/auth/formulaire-auth";
import { CadreAuth } from "@/app/auth/cadre-auth";

export default function PageInscription() {
  return (
    <CadreAuth
      titre="Rejoins CampusLink"
      sousTitre="Réservé aux étudiants et au personnel de l'école."
      pied={
        <>
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-indigo">
            Se connecter
          </Link>
        </>
      }
    >
      <FormulaireAuth
        action={inscription}
        libelleBouton="Créer mon compte"
        autocompleteMotDePasse="new-password"
        aideEmail="Utilise ton adresse de l'école : @mail-esd.com, @mail-esp.com ou @ecole-digital.com."
      />
    </CadreAuth>
  );
}
