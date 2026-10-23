"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { envoyerMessage } from "../actions";
import { Icone } from "@/app/icone";

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
          rows={1}
          placeholder="Écris ton message…"
          aria-label="Ton message"
          onKeyDown={(e) => {
            // Entrée = envoyer, Maj + Entrée = retour à la ligne.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="champ min-h-12 flex-1 resize-none rounded-3xl"
        />
        <button
          type="submit"
          disabled={enCours}
          aria-label="Envoyer le message"
          className="degrade flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full text-white shadow-[0_6px_16px_rgb(79_70_229/0.35)] transition hover:brightness-110 disabled:opacity-50"
        >
          <Icone nom="envoyer" taille={20} />
        </button>
      </div>
      {etat.erreur && (
        <p role="alert" className="alerte-erreur">
          {etat.erreur}
        </p>
      )}
    </form>
  );
}
