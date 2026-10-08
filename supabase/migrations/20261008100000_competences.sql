-- IA n°1 (profil depuis le CV) : les compétences validées par la personne.
-- Pas secrètes (comme le prénom) : protégées par les règles déjà en place sur « profils »
-- (lecture par les connectés, modification seulement de son propre profil).

create function public.competences_valides(liste text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(cardinality(liste), 0) <= 15
    and not exists (
      select 1 from unnest(liste) as c
      where c is null or char_length(btrim(c)) not between 1 and 40
    );
$$;

alter table public.profils
  add column competences text[] not null default '{}'
  check (public.competences_valides(competences));
