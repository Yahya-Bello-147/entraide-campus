-- Palier 2 : la messagerie. Règle d'or n°3 : une conversation n'est lisible que par ses deux participants.
-- Une conversation = une demande de contact ACCEPTÉE (entre le demandeur et l'auteur de l'annonce).

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  demande_id uuid not null references public.demandes_contact (id) on delete cascade,
  auteur_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contenu text not null check (char_length(btrim(contenu)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index messages_demande_created_idx on public.messages (demande_id, created_at);

alter table public.messages enable row level security;

-- Lire : seulement les deux participants d'une demande acceptée.
create policy "Messages : lecture par les deux participants"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.demandes_contact d
      where d.id = demande_id
        and d.statut = 'acceptee'
        and (select auth.uid()) in (d.demandeur_id, d.destinataire_id)
    )
  );

-- Écrire : à son propre nom, seulement dans une demande acceptée dont on fait partie.
create policy "Messages : envoi par un participant"
  on public.messages for insert to authenticated
  with check (
    auteur_id = (select auth.uid())
    and exists (
      select 1 from public.demandes_contact d
      where d.id = demande_id
        and d.statut = 'acceptee'
        and (select auth.uid()) in (d.demandeur_id, d.destinataire_id)
    )
  );

-- Pas de règle de modification ni de suppression : un message envoyé ne change plus.
