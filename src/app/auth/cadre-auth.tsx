import type { ReactNode } from "react";

// Cadre des pages Connexion et Inscription : une carte blanche centrée sur le fond gris chaud.
export function CadreAuth({ titre, sousTitre, children, pied }: { titre: string; sousTitre: string; children: ReactNode; pied: ReactNode }) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="titre text-3xl sm:text-4xl">{titre}</h1>
          <p className="mt-2 text-gris">{sousTitre}</p>
        </div>
        <div className="carte p-6 sm:p-8">{children}</div>
        <p className="mt-6 text-center text-sm text-gris">{pied}</p>
      </div>
    </main>
  );
}
