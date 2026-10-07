import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deconnexion } from "@/app/auth/actions";

// Barre du haut : liens de navigation si connecté, sinon Connexion / Inscription.
export async function EnTete() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm">
      <Link
        href="/"
        className="titre rounded-full border-2 border-white px-4 py-1 text-lg text-white"
      >
        entraide
      </Link>
      {user ? (
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold">
          <Link href="/annonces" className="underline">
            Annonces
          </Link>
          <Link href="/demandes" className="underline">
            Mes demandes
          </Link>
          <Link href="/profil" className="underline">
            Mon profil
          </Link>
          <form action={deconnexion}>
            <button type="submit" className="whitespace-nowrap underline opacity-80">
              Se déconnecter
            </button>
          </form>
        </nav>
      ) : (
        <nav className="flex gap-4 font-semibold">
          <Link href="/connexion" className="underline">
            Connexion
          </Link>
          <Link href="/inscription" className="underline">
            Inscription
          </Link>
        </nav>
      )}
    </header>
  );
}
