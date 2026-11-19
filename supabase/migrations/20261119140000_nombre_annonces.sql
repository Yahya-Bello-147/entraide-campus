-- Accueil « version pro » : le nombre d'annonces actives, affiché aux visiteurs (« 9 annonces en ligne »).
-- Un visiteur ne peut pas lire la table « annonces » (RLS) : cette fonction ne renvoie qu'un nombre, rien d'autre.
create function public.nombre_annonces_actives()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.annonces where statut = 'active';
$$;

revoke all on function public.nombre_annonces_actives() from public;
grant execute on function public.nombre_annonces_actives() to anon, authenticated;
