"use client";

import { useActionState } from "react";
import { publierAnnonce } from "../actions";
import { CATEGORIES, TYPES } from "@/lib/annonces/valider";

const styleChamp =
  "rounded-lg border-2 border-encre/20 bg-white px-3 py-2 text-base text-encre focus:border-bleu focus:outline-none";

export function FormulaireAnnonce() {
  const [etat, formAction, enCours] = useActionState(publierAnnonce, {});
  const v = etat.valeurs;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <fieldset className="flex gap-3">
        <legend className="mb-1 text-sm font-semibold">Type</legend>
        {Object.entries(TYPES).map(([valeur, libelle], i) => (
          <label
            key={valeur}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-encre/20 bg-white px-3 py-2 font-semibold has-[:checked]:border-bleu has-[:checked]:bg-bleu has-[:checked]:text-creme"
          >
            <input type="radio" name="type" value={valeur} defaultChecked={v ? v.type === valeur : i === 0} className="sr-only" />
            {libelle}
          </label>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1 text-sm font-semibold">
        Catégorie
        <select name="categorie" required defaultValue={v?.categorie ?? ""} className={styleChamp}>
          <option value="" disabled>
            Choisis une catégorie
          </option>
          {Object.entries(CATEGORIES).map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold">
        Titre
        <input name="titre" defaultValue={v?.titre} required minLength={3} maxLength={100} className={styleChamp} placeholder="Ex. Photos pour vos événements" />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold">
        Description
        <textarea name="description" defaultValue={v?.description} required maxLength={2000} rows={5} className={styleChamp} placeholder="Ce que tu proposes ou ce que tu cherches, en quelques lignes." />
      </label>

      <p className="text-xs">
        Ne mets ni téléphone, ni e-mail, ni lien de profil : tes coordonnées ne seront montrées qu&apos;après ton accord.
      </p>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
          Prix (facultatif)
          <input name="prix" defaultValue={v?.prix} inputMode="decimal" className={styleChamp} placeholder="Ex. 20" />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
          Lieu (facultatif)
          <input name="lieu" defaultValue={v?.lieu} maxLength={100} className={styleChamp} placeholder="Ex. Bordeaux centre" />
        </label>
      </div>

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
        {enCours ? "Publication…" : "Publier l'annonce"}
      </button>
    </form>
  );
}
