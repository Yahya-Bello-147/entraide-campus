"use client";

import { useActionState } from "react";
import type { EtatFormulaire } from "./actions";

type Props = {
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
  libelleBouton: string;
  autocompleteMotDePasse: "new-password" | "current-password";
};

const styleChamp =
  "rounded-lg border-2 border-encre/20 bg-white px-3 py-2 text-base text-encre focus:border-bleu focus:outline-none";

export function FormulaireAuth({ action, libelleBouton, autocompleteMotDePasse }: Props) {
  const [etat, formAction, enCours] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-semibold">
        E-mail
        <input type="email" name="email" required autoComplete="email" className={styleChamp} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Mot de passe
        <input
          type="password"
          name="motDePasse"
          required
          minLength={6}
          autoComplete={autocompleteMotDePasse}
          className={styleChamp}
        />
      </label>

      {etat.erreur && (
        <p role="alert" className="text-sm font-semibold text-erreur">
          {etat.erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="titre rounded-full bg-bleu px-4 py-3 text-lg text-creme disabled:opacity-50"
      >
        {enCours ? "Patiente…" : libelleBouton}
      </button>
    </form>
  );
}
