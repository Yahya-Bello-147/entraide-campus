"use client";

import { useActionState } from "react";
import { changerMotDePasse } from "@/app/auth/mot-de-passe-actions";

export function FormulaireNouveauMotDePasse() {
  const [etat, formAction, enCours] = useActionState(changerMotDePasse, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="etiquette">
        Nouveau mot de passe
        <input type="password" name="motDePasse" required minLength={6} maxLength={72} autoComplete="new-password" className="champ" />
        <span className="text-xs font-normal text-gris">6 caractères minimum.</span>
      </label>
      <label className="etiquette">
        Confirme le mot de passe
        <input type="password" name="confirmation" required minLength={6} maxLength={72} autoComplete="new-password" className="champ" />
      </label>

      {etat.erreur && (
        <p role="alert" className="alerte-erreur">
          {etat.erreur}
        </p>
      )}

      <button type="submit" disabled={enCours} className="bouton bouton-principal mt-1 w-full">
        {enCours ? "Patiente…" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
