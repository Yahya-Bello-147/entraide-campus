-- Table des annonces : « Je propose » / « Je cherche ».
-- Aucune coordonnée ici (règle d'or n°1) : elles vivront dans le profil, visibles après accord.
create table public.annonces (
  id uuid primary key default gen_random_uuid(),
  auteur_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('propose', 'cherche')),
  categorie text not null check (categorie in (
    'photo', 'video', 'dev', 'community_management',
    'logement', 'covoiturage', 'objets', 'autre'
  )),
  titre text not null check (char_length(titre) between 3 and 100),
  description text not null check (char_length(description) between 1 and 2000),
  prix numeric(10, 2) check (prix >= 0),
  lieu text check (char_length(lieu) <= 100),
  created_at timestamptz not null default now()
);

create index annonces_auteur_id_idx on public.annonces (auteur_id);
create index annonces_created_at_idx on public.annonces (created_at desc);

-- Sécurité : personne ne passe sans une règle explicite.
alter table public.annonces enable row level security;

-- Voir : seulement les personnes connectées.
create policy "Lecture : utilisateurs connectés"
  on public.annonces for select
  to authenticated
  using ((select auth.uid()) is not null);

-- Publier : seulement à son propre nom.
create policy "Création : à son propre nom"
  on public.annonces for insert
  to authenticated
  with check (auteur_id = (select auth.uid()));

-- Modifier : seulement ses propres annonces, sans pouvoir les donner à quelqu'un d'autre (règle d'or n°2).
create policy "Modification : seulement l'auteur"
  on public.annonces for update
  to authenticated
  using (auteur_id = (select auth.uid()))
  with check (auteur_id = (select auth.uid()));

-- Supprimer : seulement ses propres annonces (règle d'or n°2).
create policy "Suppression : seulement l'auteur"
  on public.annonces for delete
  to authenticated
  using (auteur_id = (select auth.uid()));
