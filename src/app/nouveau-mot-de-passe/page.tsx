import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { CadreAuth } from "@/app/auth/cadre-auth";
import { COOKIE_REINITIALISATION, reinitialisationRecente } from "@/lib/auth/reinitialisation";
import { FormulaireNouveauMotDePasse } from "./formulaire-nouveau";

// Accessible seulement en arrivant par le lien de l'e-mail « Mot de passe oublié ».
export default async function PageNouveauMotDePasse() {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    cookieStore,
  ] = await Promise.all([supabase.auth.getUser(), cookies()]);
  const autorise = Boolean(user && cookieStore.has(COOKIE_REINITIALISATION) && reinitialisationRecente(user.recovery_sent_at));

  return (
    <CadreAuth
      titre="Nouveau mot de passe"
      sousTitre={autorise ? `Pour le compte ${user!.email}` : "Ce lien n'est plus valable."}
      pied={
        <Link href="/connexion" className="font-semibold text-indigo">
          ← Retour à la connexion
        </Link>
      }
    >
      {autorise ? (
        <FormulaireNouveauMotDePasse />
      ) : (
        <div className="flex flex-col gap-4 text-sm text-gray-700">
          <p>Pour changer ton mot de passe, il faut passer par le lien reçu par e-mail (valable une heure).</p>
          <Link href="/mot-de-passe-oublie" className="bouton bouton-principal w-full">
            Recevoir un nouveau lien
          </Link>
        </div>
      )}
    </CadreAuth>
  );
}
