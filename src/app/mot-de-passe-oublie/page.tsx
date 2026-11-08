import Link from "next/link";
import { CadreAuth } from "@/app/auth/cadre-auth";
import { FormulaireOubli } from "./formulaire-oubli";

export default async function PageMotDePasseOublie({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return (
    <CadreAuth
      titre="Mot de passe oublié ?"
      sousTitre="Entre ton adresse : on t'envoie un lien pour en choisir un nouveau."
      pied={
        <Link href="/connexion" className="font-semibold text-indigo">
          ← Retour à la connexion
        </Link>
      }
    >
      {erreur === "lien" && (
        <p role="alert" className="alerte-erreur mb-4">
          Ce lien ne fonctionne plus (déjà utilisé, expiré, ou ouvert dans un autre navigateur). Redemande un e-mail
          ci-dessous.
        </p>
      )}
      <FormulaireOubli />
    </CadreAuth>
  );
}
