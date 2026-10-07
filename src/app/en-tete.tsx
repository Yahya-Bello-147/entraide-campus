import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deconnexion } from "@/app/auth/actions";

// Barre du haut : montre qui est connecté, ou les liens Connexion / Inscription.
export async function EnTete() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex items-center justify-between gap-3 px-4 py-4 text-sm">
      <Link
        href="/"
        className="titre rounded-full border-2 border-white px-4 py-1 text-lg text-white"
      >
        entraide
      </Link>
      {user ? (
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate opacity-90">Connecté : {user.email}</span>
          <form action={deconnexion}>
            <button type="submit" className="whitespace-nowrap font-semibold underline">
              Se déconnecter
            </button>
          </form>
        </div>
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
