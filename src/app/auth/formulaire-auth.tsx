"use client";

import { useActionState } from "react";
import type { EtatFormulaire } from "./actions";

type Props = {
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
  libelleBouton: string;
  autocompleteMotDePasse: "new-password" | "current-password";
  aideEmail?: string;
};

export function FormulaireAuth({ action, libelleBouton, autocompleteMotDePasse, aideEmail }: Props) {
  const [etat, formAction, enCours] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="etiquette">
        E-mail
        <input type="email" name="email" required autoComplete="email" placeholder="prenom.nom@mail-esd.com" className="champ" />
        {aideEmail && <span className="text-xs font-normal text-gris">{aideEmail}</span>}
      </label>
      <label className="etiquette">
        Mot de passe
        <input
          type="password"
          name="motDePasse"
          required
          minLength={6}
          autoComplete={autocompleteMotDePasse}
          className="champ"
        />
      </label>

      {etat.erreur && (
        <p role="alert" className="alerte-erreur">
          {etat.erreur}
        </p>
      )}

      <button type="submit" disabled={enCours} className="bouton bouton-principal mt-1 w-full">
        {enCours ? "Patiente…" : libelleBouton}
      </button>
    </form>
  );
}
