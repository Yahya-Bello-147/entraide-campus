import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Carte } from "@/app/carte";
import { FormulaireProfil } from "./formulaire-profil";

export default async function PageProfil({
  searchParams,
}: {
  searchParams: Promise<{ [cle: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const [{ data: profil }, { data: coordonnees }, { raison }] = await Promise.all([
    supabase.from("profils").select("prenom").eq("id", user.id).maybeSingle(),
    supabase.from("coordonnees").select("email, telephone").eq("user_id", user.id).maybeSingle(),
    searchParams,
  ]);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-10">
      <h1 className="titre mb-6 text-center text-5xl text-creme">Mon profil</h1>
      {raison === "incomplet" && !(profil && coordonnees) && (
        <p role="alert" className="mb-6 rounded-xl bg-creme p-4 font-semibold text-encre">
          Complète d&apos;abord ton profil : ton prénom s&apos;affichera sur tes annonces et tes
          coordonnées seront partagées après accord.
        </p>
      )}
      <Carte onglet="Profil">
        <FormulaireProfil
          initial={{
            prenom: profil?.prenom ?? "",
            email: coordonnees?.email ?? user.email ?? "",
            telephone: coordonnees?.telephone ?? "",
          }}
        />
      </Carte>
    </main>
  );
}
