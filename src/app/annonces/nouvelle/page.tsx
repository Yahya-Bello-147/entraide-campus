import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Carte } from "@/app/carte";
import { aUnProfilComplet } from "@/lib/profil/profil-complet";
import { FormulaireAnnonce } from "./formulaire-annonce";

export default async function PageNouvelleAnnonce() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");
  if (!(await aUnProfilComplet(supabase, user.id))) redirect("/profil?raison=incomplet");

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-10">
      <h1 className="titre mb-6 text-center text-5xl text-creme">Publier une annonce</h1>
      <Carte onglet="Nouvelle annonce">
        <FormulaireAnnonce />
      </Carte>
    </main>
  );
}
