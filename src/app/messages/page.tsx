import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icone } from "@/app/icone";
import { TitrePage } from "@/app/ui";
import { ListeConversations } from "./liste-conversations";

export default async function PageMessages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <TitrePage titre="Messages" sousTitre="Tes conversations, visibles seulement par vous deux." />
      <div className="grid flex-1 gap-5 md:grid-cols-[340px_minmax(0,1fr)]">
        <div className="carte min-w-0 overflow-hidden">
          <ListeConversations userId={user.id} />
        </div>
        <div className="carte hidden flex-col items-center justify-center gap-3 p-10 text-center md:flex">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/10 text-violet">
            <Icone nom="message" taille={26} />
          </span>
          <p className="font-bold">Choisis une conversation</p>
          <p className="max-w-xs text-sm text-gris">Les messages arrivent tout seuls, toutes les 5 secondes.</p>
        </div>
      </div>
    </main>
  );
}
