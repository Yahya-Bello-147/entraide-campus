"use client";

import { useActionState } from "react";
import { proposerAnnonce, publierAnnonce, type EtatPublication, type EtatRedaction } from "../actions";
import { Icone } from "@/app/icone";
import { STYLE_CATEGORIES } from "@/lib/annonces/style-categories";
import { CATEGORIES, TYPES, type CategorieAnnonce, type ChampsAnnonce } from "@/lib/annonces/valider";

type Etat = EtatPublication & { essai?: number; moment?: number };
type EtatProposition = EtatRedaction & { moment?: number };

async function proposerEtDater(precedent: EtatProposition, formData: FormData): Promise<EtatProposition> {
  return { ...(await proposerAnnonce(precedent, formData)), moment: Date.now() };
}

const DESCRIPTIONS_TYPE: Record<string, string> = {
  propose: "Un service, une compétence ou un objet à vendre",
  cherche: "Tu as besoin d'un coup de main ou d'un objet",
};

type Props = {
  // Publier (par défaut) ou modifier une annonce existante (action liée à son identifiant).
  action?: (etat: EtatPublication, formData: FormData) => Promise<EtatPublication>;
  initial?: ChampsAnnonce;
  libelleBouton?: string;
  avecAssistant?: boolean;
};

export function FormulaireAnnonce({
  action = publierAnnonce,
  initial,
  libelleBouton = "Publier l'annonce",
  avecAssistant = true,
}: Props) {
  // Chaque réponse porte un numéro d'essai : le formulaire est reconstruit avec ce qui a été tapé.
  // (Sinon le navigateur vide le choix de catégorie après une erreur et bloque l'envoi suivant.)
  const [etat, formAction, enCours] = useActionState(async (precedent: Etat, formData: FormData): Promise<Etat> => {
    const resultat = await action(precedent, formData);
    return { ...resultat, essai: (precedent.essai ?? 0) + 1, moment: Date.now() };
  }, {});
  const [redaction, proposerAction, redactionEnCours] = useActionState(proposerEtDater, {});

  // Le formulaire reprend la réponse la plus récente : la proposition de l'IA, ou ce qui a été tapé.
  const propositionPlusRecente = Boolean(redaction.proposition) && (redaction.moment ?? 0) > (etat.moment ?? 0);
  const v = propositionPlusRecente ? redaction.proposition : (etat.valeurs ?? initial);

  return (
    <div className="flex flex-col gap-5">
      {avecAssistant && (
        <form action={proposerAction} className="flex flex-col gap-3 rounded-[20px] bg-violet/10 p-5">
          <label className="flex flex-col gap-2 text-sm font-bold text-violet">
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-violet">
                <Icone nom="etincelles" taille={18} />
              </span>
              Décris ton annonce en quelques mots, l&apos;assistant la rédige pour toi
            </span>
            <input name="mots" maxLength={300} placeholder="vends macbook m3 pro 2000€ bordeaux" className="champ font-normal" />
          </label>
          <button type="submit" disabled={redactionEnCours} className="bouton self-start bg-indigo text-white hover:brightness-110">
            <Icone nom="etincelles" taille={17} />
            {redactionEnCours ? "L'assistant rédige…" : "Rédiger avec l'assistant"}
          </button>
          {redaction.erreur && (
            <p role="alert" className="alerte-erreur">
              {redaction.erreur}
            </p>
          )}
          {propositionPlusRecente && (
            <p role="status" className="alerte-succes">
              Proposition prête ci-dessous : relis et modifie ce que tu veux avant de publier.
            </p>
          )}
        </form>
      )}

      <form key={`${etat.essai ?? 0}-${redaction.numero ?? 0}`} action={formAction} className="carte flex flex-col gap-7 p-5 sm:p-7">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 flex items-center gap-2 text-base font-extrabold">
            <Numero n={1} /> Je propose ou je cherche ?
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(TYPES).map(([valeur, libelle], i) => (
              <label
                key={valeur}
                className="flex cursor-pointer flex-col gap-1 rounded-2xl border-2 border-ligne p-4 transition hover:border-violet/40 has-[:checked]:border-violet has-[:checked]:bg-violet/5"
              >
                <input type="radio" name="type" value={valeur} defaultChecked={v ? v.type === valeur : i === 0} className="sr-only" />
                <span className="font-bold">{libelle}</span>
                <span className="text-sm text-gris">{DESCRIPTIONS_TYPE[valeur]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col">
          <legend className="mb-3 flex items-center gap-2 text-base font-extrabold">
            <Numero n={2} /> Catégorie
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(CATEGORIES) as CategorieAnnonce[]).map((c, i) => {
              const style = STYLE_CATEGORIES[c];
              return (
                <label
                  key={c}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-ligne px-2 py-3 text-center text-sm font-semibold transition hover:border-violet/40 has-[:checked]:border-violet has-[:checked]:bg-violet/5"
                >
                  <input type="radio" name="categorie" value={c} required={i === 0} defaultChecked={v?.categorie === c} className="sr-only" />
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundImage: style.vignette }}
                    aria-hidden="true"
                  >
                    <Icone nom={style.icone} taille={20} />
                  </span>
                  {CATEGORIES[c]}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 flex items-center gap-2 text-base font-extrabold">
            <Numero n={3} /> Les détails
          </legend>
          <label className="etiquette">
            Titre
            <input name="titre" defaultValue={v?.titre} required minLength={3} maxLength={100} className="champ" placeholder="Photos pour vos événements" />
          </label>
          <label className="etiquette">
            Description
            <textarea
              name="description"
              defaultValue={v?.description}
              required
              maxLength={2000}
              rows={5}
              className="champ resize-y"
              placeholder="Ce que tu proposes ou ce que tu cherches, en quelques lignes."
            />
          </label>
          <p className="flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gris">
            <Icone nom="cadenas" taille={16} className="mt-px shrink-0" />
            Ne mets ni téléphone, ni e-mail, ni lien de profil : tes coordonnées ne seront montrées qu&apos;après ton accord.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="etiquette min-w-0">
              Prix (facultatif)
              <input name="prix" defaultValue={v?.prix} inputMode="decimal" className="champ" placeholder="20" />
            </label>
            <label className="etiquette min-w-0">
              Lieu (facultatif)
              <input name="lieu" defaultValue={v?.lieu} maxLength={100} className="champ" placeholder="Bordeaux centre" />
            </label>
          </div>
        </fieldset>

        {etat.erreur && (
          <p role="alert" className="alerte-erreur">
            {etat.erreur}
          </p>
        )}

        {etat.avertissement && (
          <div role="alert" className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="mb-2 flex items-center gap-2 font-bold">
              <Icone nom="etincelles" taille={18} />
              L&apos;assistant d&apos;annonce a repéré un moyen de te contacter directement :
            </p>
            <ul className="mb-3 list-disc space-y-1 pl-5">
              {etat.avertissement.raisons.map((r, i) => (
                <li key={i}>
                  {r.extrait && <strong>« {r.extrait} » : </strong>}
                  {r.explication}
                </li>
              ))}
            </ul>
            <p className="mb-3">
              Tes coordonnées seront partagées <strong>seulement après ton accord</strong>. Corrige le texte ci-dessus, ou
              publie quand même si c&apos;est voulu.
            </p>
            <button type="submit" name="confirmer" value={etat.avertissement.empreinte} disabled={enCours} className="bouton bouton-contour">
              Publier quand même
            </button>
          </div>
        )}

        <button type="submit" disabled={enCours} className="bouton bouton-principal w-full py-3.5 text-base">
          {enCours ? "Vérification…" : libelleBouton}
        </button>
      </form>
    </div>
  );
}

function Numero({ n }: { n: number }) {
  return (
    <span className="degrade flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white" aria-hidden="true">
      {n}
    </span>
  );
}
