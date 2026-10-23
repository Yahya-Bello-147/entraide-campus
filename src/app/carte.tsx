import type { ReactNode } from "react";

// Carte blanche qui flotte. L'« onglet » devient une petite étiquette en haut de la carte.
export function Carte({
  onglet,
  children,
  className = "",
}: {
  onglet?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`carte min-w-0 p-5 ${className}`}>
      {onglet && (
        <p className="mb-3 text-xs font-bold tracking-wider text-violet uppercase">{onglet}</p>
      )}
      {children}
    </div>
  );
}
