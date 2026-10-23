import type { ReactNode } from "react";

// Cadre des pages Connexion et Inscription : une carte centrée sur un fond avec halos de couleur.
export function CadreAuth({ titre, sousTitre, children, pied }: { titre: string; sousTitre: string; children: ReactNode; pied: ReactNode }) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <div className="halo -top-24 -left-24 h-80 w-80 bg-violet opacity-25" />
      <div className="halo top-1/3 -right-24 h-72 w-72 bg-bleu opacity-20" />
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
