import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Carte } from "@/app/carte";

type Demande = {
  id: string;
  demandeur_id: string;
  destinataire_id: string;
  annonces: { titre: string } | null;
};

export default async function PageMessages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // Une conversation par demande acceptée dont on fait partie (la base ne renvoie que celles-là).
  const { data } = await supabase
    .from("demandes_contact")
    .select("id, demandeur_id, destinataire_id, annonces(titre)")
    .eq("statut", "acceptee")
    .order("repondu_le", { ascending: false });
  const demandes = (data ?? []) as unknown as Demande[];

  const autres = demandes.map((d) => (d.demandeur_id === user.id ? d.destinataire_id : d.demandeur_id));
  const ids = demandes.map((d) => d.id);
  const [{ data: profils }, { data: messages }] = await Promise.all([
    supabase.from("profils").select("id, prenom").in("id", autres),
    supabase
      .from("messages")
      .select("demande_id, contenu, auteur_id, created_at")
      .in("demande_id", ids)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);
  const prenom = new Map((profils ?? []).map((p) => [p.id as string, p.prenom as string]));
  const dernier = new Map<string, { contenu: string; auteur_id: string }>();
  for (const m of messages ?? []) if (!dernier.has(m.demande_id)) dernier.set(m.demande_id, m);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <h1 className="titre mb-8 text-5xl text-creme sm:text-6xl">Messages</h1>
      {demandes.length === 0 && (
        <p>
          Pas encore de conversation. Une conversation s&apos;ouvre quand une demande de contact est acceptée (voir{" "}
          <Link href="/demandes" className="font-semibold underline">
            Mes demandes
          </Link>
          ).
        </p>
      )}
      <div className="grid gap-6">
        {demandes.map((d) => {
          const autreId = d.demandeur_id === user.id ? d.destinataire_id : d.demandeur_id;
          const m = dernier.get(d.id);
          return (
            <Link key={d.id} href={`/messages/${d.id}`} className="block">
              <Carte onglet={prenom.get(autreId) ?? "Conversation"}>
                <p className="mb-1 text-sm font-semibold">« {d.annonces?.titre ?? "annonce supprimée"} »</p>
                <p className="truncate text-sm">
                  {m ? `${m.auteur_id === user.id ? "Toi : " : ""}${m.contenu}` : "Aucun message — écris le premier !"}
                </p>
              </Carte>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
