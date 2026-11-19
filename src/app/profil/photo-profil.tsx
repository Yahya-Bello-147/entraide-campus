"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar } from "@/app/ui";
import { Icone } from "@/app/icone";
import { changerPhoto, retirerPhoto, type EtatPhoto } from "./photo-actions";

const COTE = 400; // la photo est enregistrée en 400 × 400

// Redessine la photo dans un carré de 400 × 400 (centrée). Effet voulu : le fichier envoyé est léger,
// et il ne contient plus les métadonnées de l'appareil (lieu GPS, date, modèle de téléphone…).
async function preparerPhoto(fichier: File): Promise<Blob> {
  const image = await createImageBitmap(fichier);
  const cote = Math.min(image.width, image.height);
  const toile = document.createElement("canvas");
  toile.width = COTE;
  toile.height = COTE;
  toile.getContext("2d")!.drawImage(image, (image.width - cote) / 2, (image.height - cote) / 2, cote, cote, 0, 0, COTE, COTE);
  image.close();
  const enBlob = (type: string) => new Promise<Blob | null>((ok) => toile.toBlob(ok, type, 0.85));
  // WebP si le navigateur sait l'écrire, sinon JPEG.
  const webp = await enBlob("image/webp");
  const blob = webp?.type === "image/webp" ? webp : await enBlob("image/jpeg");
  if (!blob) throw new Error("conversion impossible");
  return blob;
}

export function PhotoProfil({ prenom, photo }: { prenom: string | null; photo: string | null }) {
  const champ = useRef<HTMLInputElement>(null);
  const [etat, setEtat] = useState<EtatPhoto>({});
  const [enCours, demarrer] = useTransition();

  function choisir(fichier: File | undefined) {
    if (!fichier) return;
    demarrer(async () => {
      try {
        const blob = await preparerPhoto(fichier);
        const donnees = new FormData();
        donnees.set("photo", new File([blob], "photo", { type: blob.type }));
        setEtat(await changerPhoto(donnees));
      } catch {
        setEtat({ erreur: "Cette image n'a pas pu être lue. Essaie une photo JPG, PNG ou WebP." });
      } finally {
        if (champ.current) champ.current.value = "";
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-gray-700">
        Ma photo <span className="font-normal text-gris">(facultative)</span>
      </p>
      <div className="flex items-center gap-4">
        <span className="rounded-full border-4 border-violet/15">
          <Avatar prenom={prenom} photo={photo} taille={88} />
        </span>
        <div className="flex flex-col items-start gap-1.5">
          <label className={`bouton bouton-principal cursor-pointer px-5 ${enCours ? "pointer-events-none opacity-60" : ""}`}>
            <Icone nom="appareil" taille={17} />
            {enCours ? "Envoi…" : photo ? "Changer ma photo" : "Ajouter ma photo"}
            <input
              ref={champ}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={enCours}
              onChange={(e) => choisir(e.target.files?.[0])}
            />
          </label>
          {photo && (
            <button
              type="button"
              disabled={enCours}
              onClick={() => demarrer(async () => setEtat(await retirerPhoto()))}
              className="px-2 text-sm font-semibold text-indigo hover:underline"
            >
              Retirer ma photo
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gris">JPG, PNG ou WebP. Sans photo, tes initiales s&apos;affichent.</p>
      {etat.erreur && (
        <p role="alert" className="alerte-erreur">
          {etat.erreur}
        </p>
      )}
      {etat.succes && (
        <p role="status" className="alerte-succes flex items-center gap-2">
          <Icone nom="coche" taille={17} />
          {etat.succes}
        </p>
      )}
    </div>
  );
}
