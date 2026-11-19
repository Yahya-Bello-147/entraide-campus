-- Étape 3 : aperçu des annonces pour les visiteurs NON connectés (page d'accueil).
-- La table « annonces » reste fermée aux visiteurs (RLS inchangée). Cette fonction renvoie
-- SEULEMENT des informations sans risque : titre, catégorie, type, prix, campus de l'auteur, date,
-- pour les 6 dernières annonces actives. Jamais l'auteur, la description, les compétences ni les coordonnées.
-- « security definer » est voulu : c'est le seul chemin, limité et choisi, vers ces colonnes.

create function public.annonces_apercu()
returns table (
  titre text,
  categorie text,
  type text,
  prix numeric,
  campus text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.titre, a.categorie, a.type, a.prix, p.campus, a.created_at
  from public.annonces a
  left join public.profils p on p.id = a.auteur_id
  where a.statut = 'active'
  order by a.created_at desc
  limit 6;
$$;

revoke all on function public.annonces_apercu() from public;
grant execute on function public.annonces_apercu() to anon, authenticated;
