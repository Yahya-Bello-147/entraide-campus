"use client";

import { useActionState } from "react";
import type { EtatFormulaire } from "./actions";

type Props = {
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
  libelleBouton: string;
  autocompleteMotDePasse: "new-password" | "current-password";
};

export function FormulaireAuth({ action, libelleBouton, autocompleteMotDePasse }: Props) {
  const [etat, formAction, enCours] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Mot de passe
        <input
          type="password"
          name="motDePasse"
          required
          minLength={6}
          autoComplete={autocompleteMotDePasse}
          className="rounded-md border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {etat.erreur && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {etat.erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-foreground px-4 py-2 font-medium text-background disabled:opacity-50"
      >
        {enCours ? "Patiente…" : libelleBouton}
      </button>
    </form>
  );
}
