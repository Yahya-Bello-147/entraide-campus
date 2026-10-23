import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TitrePage } from "@/app/ui";
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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <TitrePage titre="Publier une annonce" sousTitre="En une minute. Tu pourras la modifier ensuite." />
      <FormulaireAnnonce />
    </main>
  );
}
