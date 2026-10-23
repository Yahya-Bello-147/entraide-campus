"use client";

import { useActionState } from "react";
import { enregistrerProfil } from "./actions";
import { Icone } from "@/app/icone";
import type { ChampsProfil } from "@/lib/profil/valider";

export function FormulaireProfil({ initial }: { initial: ChampsProfil }) {
  const [etat, formAction, enCours] = useActionState(enregistrerProfil, {});
  const v = etat.valeurs ?? initial;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="etiquette">
        <span>
          Prénom <span className="font-normal text-gris">(visible sur tes annonces)</span>
        </span>
        <input name="prenom" defaultValue={v.prenom} required maxLength={50} autoComplete="given-name" className="champ" />
      </label>

      <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4">
        <p className="flex items-start gap-2 text-sm font-semibold text-gray-700">
          <Icone nom="cadenas" taille={17} className="mt-px shrink-0 text-violet" />
          Coordonnées : visibles seulement par les personnes dont tu as accepté la demande (ou qui ont accepté la tienne).
        </p>
        <label className="etiquette">
          E-mail de contact
          <input type="email" name="email" defaultValue={v.email} required autoComplete="email" className="champ" />
        </label>
        <label className="etiquette">
          Téléphone (facultatif)
          <input type="tel" name="telephone" defaultValue={v.telephone} autoComplete="tel" className="champ" placeholder="06 12 34 56 78" />
        </label>
      </div>

      {etat.erreur && (
        <p role="alert" className="alerte-erreur">
          {etat.erreur}
        </p>
      )}
      {etat.succes && (
        <p role="status" className="alerte-succes flex items-center gap-2">
          <Icone nom="coche" taille={17} />
          Profil enregistré
        </p>
      )}

      <button type="submit" disabled={enCours} className="bouton bouton-principal">
        {enCours ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
