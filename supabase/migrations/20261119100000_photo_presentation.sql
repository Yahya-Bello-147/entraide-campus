-- Humaniser le site : une photo de profil (facultative) et une courte présentation.
-- Pas secrètes (comme le prénom) : protégées par les règles déjà en place sur « profils »
-- (lecture par les connectés, modification seulement de son propre profil).

alter table public.profils
  add column presentation text check (char_length(presentation) <= 160),
  -- Chemin de la photo dans l'espace « photos » : « <id de la personne>/<numéro>.webp », rien d'autre.
  add column photo text check (photo ~ '^[0-9a-f-]{36}/[0-9]{10,16}\.(webp|jpg|png)$');

-- Espace de stockage des photos : 2 Mo maximum, images seulement.
-- Lecture publique par lien (comme une image de site), mais personne ne peut lister le contenu.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 2097152, array['image/webp', 'image/jpeg', 'image/png']);

-- Chacun ne peut ajouter, remplacer ou supprimer que les fichiers de SON dossier (son identifiant).
create policy "Photos : ajout dans son propre dossier"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Photos : modification dans son propre dossier"
  on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Photos : suppression dans son propre dossier"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Supabase demande aussi le droit de « lire » un fichier pour pouvoir le supprimer :
-- chacun peut lire SON dossier seulement (les autres ne peuvent toujours rien lister).
create policy "Photos : lecture de son propre dossier"
  on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
