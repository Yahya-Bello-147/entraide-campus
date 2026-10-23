import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icone } from "@/app/icone";
import { Avatar } from "@/app/ui";
import { ListeConversations } from "../liste-conversations";
import { FormulaireMessage } from "./formulaire-message";

type Message = { id: string; auteur_id: string; contenu: string; created_at: string };

const formatHeure = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

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
    .select("id, statut, demandeur_id, destinataire_id, annonce_id, annonces(titre)")
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <div className="grid flex-1 gap-5 md:grid-cols-[340px_minmax(0,1fr)]">
        <div className="carte hidden min-w-0 overflow-hidden md:block">
          <ListeConversations userId={user.id} actifId={id} />
        </div>

        <section className="carte flex min-h-[70vh] min-w-0 flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b border-ligne px-4 py-3">
            <Link href="/messages" aria-label="Toutes mes conversations" className="flex h-10 w-10 items-center justify-center rounded-xl text-gris hover:bg-black/5 md:hidden">
              <Icone nom="retour" taille={22} />
            </Link>
            <Avatar prenom={prenom} taille={42} />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-extrabold">{prenom}</h1>
              <Link href={`/annonces/${demande.annonce_id}`} className="block truncate text-xs font-semibold text-violet hover:underline">
                À propos de « {titre} »
              </Link>
            </div>
            <span className="hidden items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 sm:flex">
              <Icone nom="cadenas" taille={13} />
              Privé
            </span>
          </header>

          <div className="flex flex-1 flex-col gap-3 bg-gray-50/70 p-4">
            {(messages ?? []).length === 0 && (
              <p className="m-auto max-w-xs text-center text-sm text-gris">
                Aucun message pour l&apos;instant. Dis bonjour à {prenom} !
              </p>
            )}
            {((messages ?? []) as Message[]).map((m) => {
              const deMoi = m.auteur_id === user.id;
              return (
                <div key={m.id} className={`flex flex-col ${deMoi ? "items-end" : "items-start"}`}>
                  <p
                    className={`max-w-[85%] rounded-3xl px-4 py-2.5 break-words whitespace-pre-line shadow-sm ${
                      deMoi ? "degrade rounded-br-md text-white" : "rounded-bl-md bg-white text-encre"
                    }`}
                  >
                    {m.contenu}
                  </p>
                  <span className="mt-1 px-1 text-xs text-gris">{formatHeure.format(new Date(m.created_at))}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-ligne bg-white p-3">
            <FormulaireMessage demandeId={id} />
          </div>
        </section>
      </div>
    </main>
  );
}
