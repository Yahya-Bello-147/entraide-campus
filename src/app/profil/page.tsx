import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deconnexion } from "@/app/auth/actions";
import { DecorBandeau } from "@/app/illustrations";
import { Icone } from "@/app/icone";
import { Avatar } from "@/app/ui";
import { FormulaireProfil } from "./formulaire-profil";
import { ProfilIA } from "./profil-ia";

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
    supabase.from("profils").select("prenom, competences").eq("id", user.id).maybeSingle(),
    supabase.from("coordonnees").select("email, telephone").eq("user_id", user.id).maybeSingle(),
    searchParams,
  ]);
  const prenom = (profil?.prenom as string | undefined) ?? null;

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-violet text-white md:rounded-b-[2.5rem] lg:m-5 lg:rounded-[2rem]">
        <DecorBandeau />
        <div className="relative mx-auto flex max-w-5xl items-center gap-4 px-4 pt-8 pb-12 sm:px-6">
          <span className="rounded-full border-2 border-white/40 p-1">
            <Avatar prenom={prenom} taille={64} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="titre truncate text-3xl">{prenom ?? "Mon profil"}</h1>
            <p className="truncate text-sm text-white/80">{user.email}</p>
          </div>
          <form action={deconnexion}>
            <button type="submit" className="bouton border border-white/40 bg-white/15 text-white hover:bg-white/25">
              <Icone nom="sortie" taille={18} />
              <span className="hidden sm:inline">Se déconnecter</span>
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          {raison === "incomplet" && !(profil && coordonnees) && (
            <p role="alert" className="alerte-erreur">
              Complète d&apos;abord ton profil : ton prénom s&apos;affichera sur tes annonces et tes coordonnées seront partagées
              après accord.
            </p>
          )}
          <section className="carte p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-extrabold">Mes informations</h2>
            <FormulaireProfil
              initial={{
                prenom: profil?.prenom ?? "",
                email: coordonnees?.email ?? user.email ?? "",
                telephone: coordonnees?.telephone ?? "",
              }}
            />
          </section>
        </div>

        <section className="carte min-w-0 p-5 sm:p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold">
            <span className="degrade flex h-8 w-8 items-center justify-center rounded-xl text-white">
              <Icone nom="etincelles" taille={17} />
            </span>
            Mes compétences
          </h2>
          <p className="mb-5 text-sm text-gris">Dépose ton CV : l&apos;IA propose tes compétences, tu les relis et tu valides.</p>
          <ProfilIA competencesActuelles={(profil?.competences as string[] | undefined) ?? []} />
        </section>
      </div>
    </main>
  );
}
