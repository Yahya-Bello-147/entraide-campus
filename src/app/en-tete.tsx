import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navigation } from "./navigation";

// Barre du haut : menu si connecté, sinon Connexion / Inscription.
export async function EnTete() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Link
        href="/"
        className="titre rounded-full border-2 border-white px-5 py-1.5 text-xl text-white sm:text-2xl"
      >
        entraide
      </Link>
      {user ? (
        <Navigation />
      ) : (
        <nav className="flex gap-2 sm:gap-3">
          <Link
            href="/connexion"
            className="titre rounded-full border-2 border-white px-4 py-2 text-base text-white hover:bg-white/15 sm:px-5 sm:text-lg"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="titre rounded-full bg-creme px-4 py-2 text-base text-encre sm:px-5 sm:text-lg"
          >
            Inscription
          </Link>
        </nav>
      )}
    </header>
  );
}
