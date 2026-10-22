-- Gérer ses annonces : statut « active » ou « pourvue » (vendue / trouvée).
-- Seul l'auteur peut le changer : c'est déjà garanti par la règle « Modification : seulement l'auteur ».
alter table public.annonces
  add column statut text not null default 'active' check (statut in ('active', 'pourvue'));

create index annonces_statut_idx on public.annonces (statut);

-- Plus de nouvelle demande de contact sur une annonce pourvue (vérifié par la base, pas seulement à l'écran).
-- Les demandes déjà faites et les conversations continuent normalement.
drop policy "Demandes : création par le demandeur" on public.demandes_contact;

create policy "Demandes : création par le demandeur"
  on public.demandes_contact for insert to authenticated
  with check (
    demandeur_id = (select auth.uid())
    and statut = 'en_attente'
    and exists (
      select 1 from public.annonces a
      where a.id = annonce_id
        and a.auteur_id = destinataire_id
        and a.statut = 'active'
    )
  );
