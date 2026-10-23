import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "./logo";
import { Navigation } from "./navigation";

// Barre du haut. Connecté : la navigation (en haut sur ordinateur, en bas sur téléphone).
export async function EnTete() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <header className="sticky top-0 z-30 border-b border-ligne/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="flex gap-2">
            <Link href="/connexion" className="bouton bouton-contour">
              Connexion
            </Link>
            <Link href="/inscription" className="bouton bouton-principal hidden sm:inline-flex">
              Créer mon compte
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  // Pastille : nombre de demandes reçues qui attendent une réponse.
  const [{ count }, { data: profil }] = await Promise.all([
    supabase
      .from("demandes_contact")
      .select("id", { count: "exact", head: true })
      .eq("destinataire_id", user.id)
      .eq("statut", "en_attente"),
    supabase.from("profils").select("prenom").eq("id", user.id).maybeSingle(),
  ]);

  return <Navigation demandesEnAttente={count ?? 0} prenom={(profil?.prenom as string | undefined) ?? null} />;
}
