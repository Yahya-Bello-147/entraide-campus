import { Carte } from "./carte";

const etapes = [
  {
    onglet: "Étape 1",
    titre: "Crée ton compte",
    points: ["Un seul compte pour proposer et chercher", "Dépose ton CV : l'IA propose tes compétences"],
  },
  {
    onglet: "Étape 2",
    titre: "Publie une annonce",
    points: ["Je propose : photo, vidéo, dev, objets…", "Je cherche : une coloc, un covoiturage…"],
  },
  {
    onglet: "Étape 3",
    titre: "Demande le contact",
    points: ["L'auteur accepte ou refuse", "Les coordonnées n'apparaissent qu'après accord"],
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:py-16">
      <section className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <p className="text-center text-lg leading-tight sm:text-right sm:text-2xl">
          Propose ce que
          <br />
          tu sais faire
        </p>
        <h1 className="titre text-center text-6xl text-creme sm:text-8xl">
          L&apos;Entraide
          <br />
          du Campus
        </h1>
        <p className="text-center text-lg leading-tight sm:text-left sm:text-2xl">
          trouve ce dont
          <br />
          tu as besoin
        </p>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {etapes.map((etape) => (
          <Carte key={etape.onglet} onglet={etape.onglet}>
            <h2 className="mb-3 text-lg font-bold">{etape.titre}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {etape.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Carte>
        ))}
      </section>
    </main>
  );
}
