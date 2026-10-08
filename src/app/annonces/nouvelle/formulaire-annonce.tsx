"use client";

import { useActionState } from "react";
import { proposerAnnonce, publierAnnonce, type EtatPublication, type EtatRedaction } from "../actions";
import { CATEGORIES, TYPES } from "@/lib/annonces/valider";

const styleChamp =
  "rounded-lg border-2 border-encre/20 bg-white px-3 py-2 text-base text-encre focus:border-bleu focus:outline-none";

type Etat = EtatPublication & { essai?: number; moment?: number };
type EtatProposition = EtatRedaction & { moment?: number };

// Chaque réponse porte un numéro d'essai : le formulaire est reconstruit avec ce qui a été tapé.
// (Sinon le navigateur vide le menu « Catégorie » après une erreur et bloque l'envoi suivant.)
async function publierEtNumeroter(precedent: Etat, formData: FormData): Promise<Etat> {
  const resultat = await publierAnnonce(precedent, formData);
  return { ...resultat, essai: (precedent.essai ?? 0) + 1, moment: Date.now() };
}

async function proposerEtDater(precedent: EtatProposition, formData: FormData): Promise<EtatProposition> {
  return { ...(await proposerAnnonce(precedent, formData)), moment: Date.now() };
}

export function FormulaireAnnonce() {
  const [etat, formAction, enCours] = useActionState(publierEtNumeroter, {});
  const [redaction, proposerAction, redactionEnCours] = useActionState(proposerEtDater, {});

  // Le formulaire reprend la réponse la plus récente : la proposition de l'IA, ou ce qui a été tapé.
  const propositionPlusRecente = Boolean(redaction.proposition) && (redaction.moment ?? 0) > (etat.moment ?? 0);
  const v = propositionPlusRecente ? redaction.proposition : etat.valeurs;

  return (
    <div className="flex flex-col gap-6">
      <form action={proposerAction} className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-encre/40 bg-white/60 p-4">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          ✨ Décris ton annonce en quelques mots, l&apos;assistant la rédige pour toi
          <input
            name="mots"
            maxLength={300}
            placeholder="Ex. vends macbook m3 pro 2000€ bordeaux"
            className={styleChamp}
          />
        </label>
        <button
          type="submit"
          disabled={redactionEnCours}
          className="titre self-start rounded-full bg-encre px-4 py-2 text-base text-creme disabled:opacity-50"
        >
          {redactionEnCours ? "L'assistant rédige…" : "Rédiger avec l'assistant"}
        </button>
        {redaction.erreur && (
          <p role="alert" className="text-sm font-semibold text-erreur">
            {redaction.erreur}
          </p>
        )}
        {propositionPlusRecente && (
          <p role="status" className="text-sm font-semibold">
            🤖 Proposition prête ci-dessous : relis et modifie ce que tu veux avant de publier.
          </p>
        )}
      </form>

      <form key={`${etat.essai ?? 0}-${redaction.numero ?? 0}`} action={formAction} className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-semibold">
            Prix (facultatif)
            <input name="prix" defaultValue={v?.prix} inputMode="decimal" className={`${styleChamp} w-full min-w-0`} placeholder="Ex. 20" />
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-semibold">
            Lieu (facultatif)
            <input name="lieu" defaultValue={v?.lieu} maxLength={100} className={`${styleChamp} w-full min-w-0`} placeholder="Ex. Bordeaux centre" />
          </label>
        </div>

        {etat.erreur && (
          <p role="alert" className="text-sm font-semibold text-erreur">
            {etat.erreur}
          </p>
        )}

        {etat.avertissement && (
          <div role="alert" className="rounded-xl border-2 border-erreur bg-white p-4 text-sm">
            <p className="mb-2 font-bold">🤖 L&apos;assistant d&apos;annonce a repéré un moyen de te contacter directement :</p>
            <ul className="mb-3 list-disc space-y-1 pl-5">
              {etat.avertissement.raisons.map((r, i) => (
                <li key={i}>
                  {r.extrait && <strong>« {r.extrait} » : </strong>}
                  {r.explication}
                </li>
              ))}
            </ul>
            <p className="mb-3">
              Tes coordonnées seront partagées <strong>seulement après ton accord</strong>. Corrige le texte ci-dessus
              puis clique sur « Publier l&apos;annonce », ou publie quand même si c&apos;est voulu.
            </p>
            <button
              type="submit"
              name="confirmer"
              value={etat.avertissement.empreinte}
              disabled={enCours}
              className="rounded-full border-2 border-encre px-4 py-2 font-semibold disabled:opacity-50"
            >
              Publier quand même
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={enCours}
          className="titre rounded-full bg-bleu px-4 py-3 text-lg text-creme disabled:opacity-50"
        >
          {enCours ? "Vérification et publication…" : "Publier l'annonce"}
        </button>
      </form>
    </div>
  );
}
