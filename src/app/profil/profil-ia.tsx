"use client";

import { useActionState, useState } from "react";
import { analyserCV, validerCompetences } from "./competences-actions";

const styleChamp =
  "rounded-lg border-2 border-encre/20 bg-white px-3 py-2 text-base text-encre focus:border-bleu focus:outline-none";

// Étape 1 : déposer le CV. Étape 2 : relire et corriger. Étape 3 : valider.
export function ProfilIA({ competencesActuelles }: { competencesActuelles: string[] }) {
  const [analyse, analyserAction, analyseEnCours] = useActionState(analyserCV, {});
  const propositions = analyse.propositions;

  return (
    <div className="flex flex-col gap-5">
      <form action={analyserAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-encre/40 bg-white/60 p-4 text-sm font-semibold">
          📄 Ton CV en PDF (3 Mo maximum)
          <input type="file" name="cv" accept="application/pdf,.pdf" required className="text-sm font-normal" />
        </label>
        <p className="text-xs">
          Ton CV est lu par l&apos;IA (Google Gemini) puis oublié : il n&apos;est pas enregistré sur le site.
        </p>
        <button
          type="submit"
          disabled={analyseEnCours}
          className="titre rounded-full bg-bleu px-4 py-3 text-lg text-creme disabled:opacity-50"
        >
          {analyseEnCours ? "L'IA lit ton CV…" : "Proposer mes compétences"}
        </button>
        {analyse.erreur && (
          <p role="alert" className="text-sm font-semibold text-erreur">
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
    <form action={validerAction} className="flex flex-col gap-3">
      <p className="text-sm font-semibold">
        {vientDeLIA
          ? "🤖 L'IA propose ces compétences : relis, retire ce qui est faux, ajoute ce qui manque."
          : "Mes compétences"}
      </p>

      <ul className="flex flex-wrap gap-2">
        {liste.length === 0 && <li className="text-sm">Aucune compétence pour l&apos;instant.</li>}
        {liste.map((c) => (
          <li key={c} className="flex items-center gap-1 rounded-full bg-creme px-3 py-1 text-sm font-semibold">
            <input type="hidden" name="competence" value={c} />
            {c}
            <button
              type="button"
              onClick={() => setListe(liste.filter((x) => x !== c))}
              aria-label={`Retirer ${c}`}
              className="ml-1 rounded-full px-1 text-erreur"
            >
              ✕
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
          className={`${styleChamp} min-w-0 flex-1`}
        />
        <button type="button" onClick={ajouter} className="rounded-full border-2 border-encre px-4 font-semibold">
          Ajouter
        </button>
      </div>

      {etat.erreur && (
        <p role="alert" className="text-sm font-semibold text-erreur">
          {etat.erreur}
        </p>
      )}
      {etat.succes && (
        <p role="status" className="text-sm font-semibold">
          ✅ Compétences enregistrées.
        </p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="titre rounded-full bg-encre px-4 py-3 text-lg text-creme disabled:opacity-50"
      >
        {enCours ? "Enregistrement…" : "Valider mes compétences"}
      </button>
    </form>
  );
}
