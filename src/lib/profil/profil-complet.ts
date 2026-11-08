import type { SupabaseClient } from "@supabase/supabase-js";

// Un profil est complet quand il a un prénom, un campus ET des coordonnées.
export async function aUnProfilComplet(supabase: SupabaseClient, userId: string) {
  const [{ data: profil }, { data: coordonnees }] = await Promise.all([
    supabase.from("profils").select("campus").eq("id", userId).maybeSingle(),
    supabase.from("coordonnees").select("user_id").eq("user_id", userId).maybeSingle(),
  ]);
  return Boolean(profil?.campus && coordonnees);
}
