-- Niveau 2 : la BASE refuse tout compte dont l'adresse n'est pas de l'école,
-- même si on contourne la page d'inscription (clé publique, script…).
-- Domaines autorisés : @mail-esd.com, @mail-esp.com (étudiants), @ecole-digital.com (profs et personnel).
-- Les comptes déjà créés ne sont pas touchés : on ne vérifie qu'à la création et au changement d'adresse.

create function public.verifier_domaine_ecole()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  domaines constant text[] := array['mail-esd.com', 'mail-esp.com', 'ecole-digital.com'];
  adresse text;
begin
  -- Adresse à vérifier : à la création, l'adresse du compte ;
  -- ensuite, seulement une NOUVELLE adresse (directe ou en attente de confirmation).
  if tg_op = 'INSERT' then
    adresse := new.email;
  elsif new.email is distinct from old.email then
    adresse := new.email;
  elsif coalesce(new.email_change, '') <> '' and new.email_change is distinct from old.email_change then
    adresse := new.email_change;
  else
    return new; -- connexion, mise à jour du mot de passe… : rien à vérifier
  end if;

  if adresse is null
     or cardinality(string_to_array(adresse, '@')) <> 2
     or split_part(adresse, '@', 1) = ''
     or not (lower(split_part(adresse, '@', 2)) = any (domaines)) then
    raise exception 'Inscription réservée aux adresses de l''école (@mail-esd.com, @mail-esp.com, @ecole-digital.com)'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger verifier_domaine_ecole
  before insert or update of email, email_change on auth.users
  for each row execute function public.verifier_domaine_ecole();
