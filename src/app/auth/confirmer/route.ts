import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_REINITIALISATION, DUREE_REINITIALISATION_S } from "@/lib/auth/reinitialisation";

// Le lien de l'e-mail « Mot de passe oublié » arrive ici avec un code à usage unique.
// On l'échange contre une session, puis on envoie vers le choix du nouveau mot de passe.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const retour = (chemin: string) => NextResponse.redirect(new URL(chemin, request.nextUrl.origin));

  if (!code) return retour("/mot-de-passe-oublie?erreur=lien");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return retour("/mot-de-passe-oublie?erreur=lien");

  const reponse = retour("/nouveau-mot-de-passe");
  reponse.cookies.set(COOKIE_REINITIALISATION, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_REINITIALISATION_S,
  });
  return reponse;
}
