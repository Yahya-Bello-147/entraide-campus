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
    <header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
      <Link href="/" className="font-semibold">
        L&apos;Entraide du Campus
      </Link>
      {user ? (
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-zinc-600 dark:text-zinc-400">
            Connecté : {user.email}
          </span>
          <form action={deconnexion}>
            <button type="submit" className="whitespace-nowrap underline">
              Se déconnecter
            </button>
          </form>
        </div>
      ) : (
        <nav className="flex gap-3">
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
