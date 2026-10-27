"use client";

import { useActionState, useState } from "react";
import { analyserCV, validerCompetences } from "./competences-actions";
import { Icone } from "@/app/icone";

// Étape 1 : déposer le CV. Étape 2 : relire et corriger. Étape 3 : valider.
export function ProfilIA({ competencesActuelles }: { competencesActuelles: string[] }) {
  const [analyse, analyserAction, analyseEnCours] = useActionState(analyserCV, {});
  const propositions = analyse.propositions;

  return (
    <div className="flex flex-col gap-6">
      <form action={analyserAction} className="flex flex-col gap-3">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-violet/30 bg-violet/5 p-5 text-center text-sm font-semibold text-gray-700 transition hover:border-violet/60">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet shadow-sm">
            <Icone nom="televerser" taille={22} />
          </span>
          Ton CV en PDF (3 Mo maximum)
          <input type="file" name="cv" accept="application/pdf,.pdf" required className="max-w-full text-xs font-normal text-gris file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:font-semibold file:text-violet" />
        </label>
        <p className="flex items-start gap-2 text-xs text-gris">
          <Icone nom="cadenas" taille={14} className="mt-px shrink-0" />
          Ton CV est lu par l&apos;IA (Google Gemini) puis oublié : il n&apos;est pas enregistré sur le site.
        </p>
        <button type="submit" disabled={analyseEnCours} className="bouton bouton-principal">
          <Icone nom="etincelles" taille={18} />
          {analyseEnCours ? "L'IA lit ton CV…" : "Proposer mes compétences"}
        </button>
        {analyse.erreur && (
          <p role="alert" className="alerte-erreur">
            {analyse.erreur}
          </p>
        )}
      </form>

      {/* La clé change à chaque nouvelle analyse : la liste repart des propositions de l'IA. */}
      <Relecture
        key={propositions ? propositions.join("|") : "actuelles"}
        initiales={propositions ?? competencesActuelles}
        vientDeLIA={Boolean(propositions)}
      />
    </div>
  );
}

function Relecture({ initiales, vientDeLIA }: { initiales: string[]; vientDeLIA: boolean }) {
  const [liste, setListe] = useState(initiales);
  const [nouvelle, setNouvelle] = useState("");
  const [etat, validerAction, enCours] = useActionState(validerCompetences, {});

  function ajouter() {
    const texte = nouvelle.trim();
    if (!texte || texte.length > 40 || liste.length >= 10) return;
    if (!liste.some((c) => c.toLowerCase() === texte.toLowerCase())) setListe([...liste, texte]);
    setNouvelle("");
  }

  return (
    <form action={validerAction} className="flex flex-col gap-3 border-t border-ligne pt-5">
      <p className={vientDeLIA ? "alerte-succes" : "text-sm font-bold text-gray-700"}>
        {vientDeLIA ? "L'IA propose ces compétences : relis, retire ce qui est faux, ajoute ce qui manque." : "Mes compétences"}
      </p>

      <ul className="flex flex-wrap gap-2">
        {liste.length === 0 && <li className="text-sm text-gris">Aucune compétence pour l&apos;instant.</li>}
        {liste.map((c) => (
          <li key={c} className="flex items-center gap-1 rounded-full bg-violet/10 py-1 pr-1 pl-3 text-sm font-semibold text-violet">
            <input type="hidden" name="competence" value={c} />
            {c}
            <button
              type="button"
              onClick={() => setListe(liste.filter((x) => x !== c))}
              aria-label={`Retirer ${c}`}
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white"
            >
              <Icone nom="croix" taille={14} />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={nouvelle}
          onChange={(e) => setNouvelle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              ajouter();
            }
          }}
          maxLength={40}
          placeholder="Ajouter une compétence"
          aria-label="Ajouter une compétence"
          className="champ flex-1"
        />
        <button type="button" onClick={ajouter} className="bouton bouton-contour">
          <Icone nom="plus" taille={17} />
          Ajouter
        </button>
      </div>

      {etat.erreur && (
        <p role="alert" className="alerte-erreur">
          {etat.erreur}
        </p>
      )}
      {etat.succes && (
        <p role="status" className="alerte-succes flex items-center gap-2">
          <Icone nom="coche" taille={17} />
          Compétences enregistrées
        </p>
      )}

      <button type="submit" disabled={enCours} className="bouton bg-indigo text-white hover:brightness-110">
        {enCours ? "Enregistrement…" : "Valider mes compétences"}
      </button>
    </form>
  );
}
