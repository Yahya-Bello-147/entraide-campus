-- Étape 2 « Mon campus » : chaque étudiant choisit son campus ESP.
-- Pas secret (comme le prénom) : protégé par les règles déjà en place sur « profils »
-- (lecture par les connectés, modification seulement de son propre profil).
-- Vide autorisé pour les comptes déjà créés ; le site le demande pour un profil complet.

alter table public.profils
  add column campus text
  check (campus in ('Bordeaux', 'Nantes', 'Lyon', 'Paris', 'Toulouse', 'Lille'));

create index profils_campus_idx on public.profils (campus);
