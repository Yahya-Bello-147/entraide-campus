import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/app/ui";

type Demande = {
  id: string;
  demandeur_id: string;
  destinataire_id: string;
  annonces: { titre: string } | null;
};

const formatHeure = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

// La liste des conversations (une par demande acceptée dont on fait partie : la base ne renvoie que celles-là).
export async function ListeConversations({ userId, actifId }: { userId: string; actifId?: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("demandes_contact")
    .select("id, demandeur_id, destinataire_id, annonces(titre)")
    .eq("statut", "acceptee")
    .order("repondu_le", { ascending: false });
  const demandes = (data ?? []) as unknown as Demande[];

  const autres = demandes.map((d) => (d.demandeur_id === userId ? d.destinataire_id : d.demandeur_id));
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
  const dernier = new Map<string, { contenu: string; auteur_id: string; created_at: string }>();
  for (const m of messages ?? []) if (!dernier.has(m.demande_id)) dernier.set(m.demande_id, m);

  if (demandes.length === 0) {
    return (
      <p className="p-5 text-sm text-gris">
        Pas encore de conversation. Une conversation s&apos;ouvre quand une demande de contact est acceptée (voir{" "}
        <Link href="/demandes" className="font-semibold text-indigo">
          Demandes
        </Link>
        ).
      </p>
    );
  }

  return (
    <ul className="flex flex-col p-2">
      {demandes.map((d) => {
        const autre = prenom.get(d.demandeur_id === userId ? d.destinataire_id : d.demandeur_id);
        const m = dernier.get(d.id);
        const actif = d.id === actifId;
        return (
          <li key={d.id}>
            <Link
              href={`/messages/${d.id}`}
              aria-current={actif ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${actif ? "bg-violet/10" : "hover:bg-black/[0.03]"}`}
            >
              <Avatar prenom={autre} taille={44} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-bold">{autre ?? "Conversation"}</span>
                  {m && <span className="shrink-0 text-xs text-gris">{formatHeure.format(new Date(m.created_at))}</span>}
                </span>
                <span className="block truncate text-xs font-semibold text-violet">{d.annonces?.titre ?? "annonce supprimée"}</span>
                <span className="block truncate text-sm text-gris">
                  {m ? `${m.auteur_id === userId ? "Toi : " : ""}${m.contenu}` : "Aucun message, écris le premier"}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
