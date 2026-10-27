import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "./logo";
import { Navigation } from "./navigation";

// Barre du haut. Connecté : la navigation (menu à gauche sur ordinateur, en bas sur téléphone).
export async function EnTete() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      // Transparente et haute de 4,5 rem : sur l'accueil, la vague violette passe derrière.
      <header className="relative z-30 h-18">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
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
