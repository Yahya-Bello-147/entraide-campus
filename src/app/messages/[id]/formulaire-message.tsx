"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { envoyerMessage } from "../actions";

const RAFRAICHIR_MS = 5000;

export function FormulaireMessage({ demandeId }: { demandeId: string }) {
  const [etat, formAction, enCours] = useActionState(envoyerMessage, {});
  const router = useRouter();

  // Les nouveaux messages de l'autre personne arrivent tout seuls, toutes les 5 secondes.
  useEffect(() => {
    const minuteur = setInterval(() => router.refresh(), RAFRAICHIR_MS);
    return () => clearInterval(minuteur);
  }, [router]);

  return (
    <form key={etat.envoi ?? 0} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="demandeId" value={demandeId} />
      <div className="flex gap-2">
        <textarea
          name="contenu"
          defaultValue={etat.brouillon}
          required
          maxLength={1000}
          rows={2}
          placeholder="Écris ton message…"
          aria-label="Ton message"
          onKeyDown={(e) => {
            // Entrée = envoyer, Maj + Entrée = retour à la ligne.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="min-w-0 flex-1 resize-none rounded-xl border-2 border-encre/20 bg-white px-3 py-2 text-base text-encre focus:border-bleu focus:outline-none"
        />
        <button
          type="submit"
          disabled={enCours}
          className="titre self-end rounded-full bg-creme px-5 py-3 text-lg text-encre disabled:opacity-50"
        >
          {enCours ? "…" : "Envoyer"}
        </button>
      </div>
      {etat.erreur && (
        <p role="alert" className="rounded-lg bg-creme px-3 py-2 text-sm font-semibold text-erreur">
          {etat.erreur}
        </p>
      )}
    </form>
  );
}
