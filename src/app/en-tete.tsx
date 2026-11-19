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
      // Barre du haut des visiteurs, épurée comme sur la maquette « version pro » (19 nov).
      <header className="relative z-30 h-18">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { href: "/#annonces", libelle: "Annonces" },
              { href: "/#campus", libelle: "Les campus" },
              { href: "/#comment", libelle: "Comment ça marche" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="hidden rounded-full px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-white/70 hover:text-encre lg:inline-flex">
                {l.libelle}
              </Link>
            ))}
            <Link href="/connexion" className="rounded-full px-3 py-2 text-sm font-bold text-encre hover:bg-white/70">
              Connexion
            </Link>
            <Link href="/inscription" className="bouton hidden bg-encre px-5 text-white hover:bg-encre/90 sm:inline-flex">
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
    supabase.from("profils").select("prenom, photo").eq("id", user.id).maybeSingle(),
  ]);

  return (
    <Navigation
      demandesEnAttente={count ?? 0}
      prenom={(profil?.prenom as string | undefined) ?? null}
      photo={(profil?.photo as string | null | undefined) ?? null}
    />
  );
}
