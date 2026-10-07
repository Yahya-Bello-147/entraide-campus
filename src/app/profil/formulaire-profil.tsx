"use client";

import { useActionState } from "react";
import { enregistrerProfil } from "./actions";
import type { ChampsProfil } from "@/lib/profil/valider";

const styleChamp =
  "rounded-lg border-2 border-encre/20 bg-white px-3 py-2 text-base text-encre focus:border-bleu focus:outline-none";

export function FormulaireProfil({ initial }: { initial: ChampsProfil }) {
  const [etat, formAction, enCours] = useActionState(enregistrerProfil, {});
  const v = etat.valeurs ?? initial;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Prénom <span className="font-normal">(visible sur tes annonces)</span>
        <input name="prenom" defaultValue={v.prenom} required maxLength={50} autoComplete="given-name" className={styleChamp} />
      </label>

      <div className="rounded-xl bg-white/60 p-4">
        <p className="mb-3 text-sm font-semibold">
          🔒 Coordonnées : visibles seulement par les personnes dont tu as accepté la demande
          (ou qui ont accepté la tienne).
        </p>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            E-mail de contact
            <input type="email" name="email" defaultValue={v.email} required autoComplete="email" className={styleChamp} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Téléphone (facultatif)
            <input type="tel" name="telephone" defaultValue={v.telephone} autoComplete="tel" className={styleChamp} placeholder="Ex. 06 12 34 56 78" />
          </label>
        </div>
      </div>

      {etat.erreur && (
        <p role="alert" className="text-sm font-semibold text-erreur">
          {etat.erreur}
        </p>
      )}
      {etat.succes && (
        <p role="status" className="text-sm font-semibold">
          ✅ Profil enregistré.
        </p>
      )}

      <button type="submit" disabled={enCours} className="titre rounded-full bg-bleu px-4 py-3 text-lg text-creme disabled:opacity-50">
        {enCours ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
