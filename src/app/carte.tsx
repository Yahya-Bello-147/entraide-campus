import type { ReactNode } from "react";

// Carte bleu clair avec un onglet en haut à droite (comme « Étape 1 » sur l'affiche).
export function Carte({ onglet, children }: { onglet: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="titre -mb-px self-end rounded-t-2xl bg-cyan px-5 pt-3 pb-1 text-xl text-encre">
        {onglet}
      </div>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tr-none bg-cyan p-5 text-encre">
        {children}
      </div>
    </div>
  );
}
