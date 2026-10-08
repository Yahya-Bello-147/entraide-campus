import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormulaireMessage } from "./formulaire-message";

type Message = { id: string; auteur_id: string; contenu: string; created_at: string };

const formatHeure = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function PageConversation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // La base ne renvoie la demande que si on en fait partie : sinon, page introuvable.
  const { data: demande } = await supabase
    .from("demandes_contact")
    .select("id, statut, demandeur_id, destinataire_id, annonces(titre)")
    .eq("id", id)
    .maybeSingle();
  if (!demande || demande.statut !== "acceptee") notFound();

  const autreId = demande.demandeur_id === user.id ? demande.destinataire_id : demande.demandeur_id;
  const [{ data: profil }, { data: messages }] = await Promise.all([
    supabase.from("profils").select("prenom").eq("id", autreId).maybeSingle(),
    supabase
      .from("messages")
      .select("id, auteur_id, contenu, created_at")
      .eq("demande_id", id)
      .order("created_at", { ascending: true })
      .limit(500),
  ]);
  const prenom = (profil?.prenom as string | undefined) ?? "l'autre personne";
  const titre = (demande.annonces as unknown as { titre: string } | null)?.titre ?? "annonce supprimée";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <Link href="/messages" className="mb-4 text-sm font-semibold underline">
        ← Toutes mes conversations
      </Link>
      <h1 className="titre text-4xl text-creme sm:text-5xl">{prenom}</h1>
      <p className="mb-6 text-sm">À propos de « {titre} » · 🔒 visible seulement par vous deux</p>

      <div className="mb-4 flex flex-1 flex-col gap-3 rounded-2xl bg-cyan p-4 text-encre">
        {(messages ?? []).length === 0 && (
          <p className="text-sm">Aucun message pour l&apos;instant. Écris le premier !</p>
        )}
        {((messages ?? []) as Message[]).map((m) => {
          const deMoi = m.auteur_id === user.id;
          return (
            <div key={m.id} className={`flex flex-col ${deMoi ? "items-end" : "items-start"}`}>
              <p
                className={`max-w-[85%] rounded-2xl px-4 py-2 break-words whitespace-pre-line ${
                  deMoi ? "rounded-br-sm bg-bleu text-white" : "rounded-bl-sm bg-white"
                }`}
              >
                {m.contenu}
              </p>
              <span className="mt-1 text-xs opacity-70">{formatHeure.format(new Date(m.created_at))}</span>
            </div>
          );
        })}
      </div>

      <FormulaireMessage demandeId={id} />
    </main>
  );
}
