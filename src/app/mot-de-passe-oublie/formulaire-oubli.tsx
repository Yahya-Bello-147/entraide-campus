"use client";

import { useActionState } from "react";
import { demanderReinitialisation } from "@/app/auth/mot-de-passe-actions";
import { Icone } from "@/app/icone";

export function FormulaireOubli() {
  const [etat, formAction, enCours] = useActionState(demanderReinitialisation, {});

  if (etat.envoye) {
    return (
      <div role="status" className="flex flex-col gap-3 text-sm text-gray-700">
        <p className="alerte-succes flex items-center gap-2">
          <Icone nom="mail" taille={17} />
          C&apos;est envoyé.
        </p>
        <p>
          Si un compte existe avec cette adresse, tu vas recevoir un e-mail avec un lien. Pense à regarder dans les
          spams. Ouvre le lien <b>dans ce même navigateur</b> : il est valable une heure.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="etiquette">
        E-mail
        <input type="email" name="email" required autoComplete="email" placeholder="prenom.nom@mail-esd.com" className="champ" />
      </label>

      {etat.erreur && (
        <p role="alert" className="alerte-erreur">
          {etat.erreur}
        </p>
      )}

      <button type="submit" disabled={enCours} className="bouton bouton-principal mt-1 w-full">
        {enCours ? "Patiente…" : "Recevoir le lien"}
      </button>
    </form>
  );
}
