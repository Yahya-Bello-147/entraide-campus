-- Palier 1 : profils, coordonnées protégées, demandes de contact.

-- ─── Profils : le prénom affiché sur les annonces (pas secret) ───
create table public.profils (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null check (char_length(btrim(prenom)) between 1 and 50),
  created_at timestamptz not null default now()
);

alter table public.profils enable row level security;

create policy "Profils : lecture par les utilisateurs connectés"
  on public.profils for select to authenticated
  using ((select auth.uid()) is not null);

create policy "Profils : création de son propre profil"
  on public.profils for insert to authenticated
  with check (id = (select auth.uid()));

create policy "Profils : modification de son propre profil"
  on public.profils for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ─── Demandes de contact ───
create table public.demandes_contact (
  id uuid primary key default gen_random_uuid(),
  annonce_id uuid not null references public.annonces (id) on delete cascade,
  demandeur_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  destinataire_id uuid not null references auth.users (id) on delete cascade,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'acceptee', 'refusee')),
  created_at timestamptz not null default now(),
  repondu_le timestamptz,
  unique (annonce_id, demandeur_id),
  check (demandeur_id <> destinataire_id)
);

create index demandes_contact_demandeur_idx on public.demandes_contact (demandeur_id);
create index demandes_contact_destinataire_idx on public.demandes_contact (destinataire_id);

-- Le destinataire est toujours l'auteur de l'annonce : c'est la base qui le remplit, pas le navigateur.
create function public.demande_contact_remplir_destinataire()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select a.auteur_id into new.destinataire_id
  from public.annonces a
  where a.id = new.annonce_id;
  return new;
end;
$$;

create trigger demandes_contact_destinataire
  before insert on public.demandes_contact
  for each row execute function public.demande_contact_remplir_destinataire();

-- Date de réponse remplie automatiquement quand le statut change.
create function public.demande_contact_date_reponse()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.statut is distinct from old.statut then
    new.repondu_le := now();
  end if;
  return new;
end;
$$;

create trigger demandes_contact_reponse
  before update on public.demandes_contact
  for each row execute function public.demande_contact_date_reponse();

alter table public.demandes_contact enable row level security;

-- Lecture : seulement les deux personnes concernées.
create policy "Demandes : lecture par les deux participants"
  on public.demandes_contact for select to authenticated
  using ((select auth.uid()) in (demandeur_id, destinataire_id));

-- Création : à son nom, en attente, sur l'annonce de quelqu'un d'autre.
create policy "Demandes : création par le demandeur"
  on public.demandes_contact for insert to authenticated
  with check (
    demandeur_id = (select auth.uid())
    and statut = 'en_attente'
    and exists (
      select 1 from public.annonces a
      where a.id = annonce_id and a.auteur_id = destinataire_id
    )
  );

-- Réponse : seulement le destinataire, seulement une demande en attente.
create policy "Demandes : réponse par le destinataire"
  on public.demandes_contact for update to authenticated
  using (destinataire_id = (select auth.uid()) and statut = 'en_attente')
  with check (destinataire_id = (select auth.uid()) and statut in ('acceptee', 'refusee'));

-- On ne peut modifier QUE le statut (pas l'annonce, ni les personnes).
revoke update on public.demandes_contact from authenticated, anon;
grant update (statut) on public.demandes_contact to authenticated;

-- ─── Coordonnées : visibles seulement par soi-même et après accord (règle d'or n°1) ───
create table public.coordonnees (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null check (
    char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  telephone text check (telephone ~ '^[0-9 +().-]{6,20}$'),
  updated_at timestamptz not null default now()
);

alter table public.coordonnees enable row level security;

create policy "Coordonnées : lecture par soi-même ou après accord"
  on public.coordonnees for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.demandes_contact d
      where d.statut = 'acceptee'
        and (
          (d.demandeur_id = (select auth.uid()) and d.destinataire_id = coordonnees.user_id)
          or (d.destinataire_id = (select auth.uid()) and d.demandeur_id = coordonnees.user_id)
        )
    )
  );

create policy "Coordonnées : création des siennes"
  on public.coordonnees for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Coordonnées : modification des siennes"
  on public.coordonnees for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
