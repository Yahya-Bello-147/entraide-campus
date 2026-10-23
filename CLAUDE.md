# Fiche d'identité — CampusLink (ex « L'Entraide du Campus »)

## Le projet
- **Pour qui** : les étudiants du campus.
- **Problème** : un étudiant ne sait pas qui, sur le campus, peut l'aider (photo, vidéo, dev,
  community management, coloc, covoiturage…), et ses compétences restent invisibles.
- **Solution** : une appli où chacun propose ce qu'il sait faire et cherche ce dont il a besoin.
  Un seul compte : la même personne propose ET cherche, sans changer de rôle.
- **3 écrans clés** : 1) l'annonce (+ bouton « Demander le contact »)
  2) la demande reçue (Accepter / Refuser, coordonnées cachées avant accord)
  3) mon profil depuis le CV (l'IA propose des compétences, je corrige, je valide).

## Ce qu'on ne fait pas
- Pas de paiement, pas d'appli mobile native (site web seulement).
- Pas de messagerie, ni de suggestions, ni de partage automatique des coordonnées avant que le palier 1 marche en ligne.
- Rien qui ne soit pas dans le brief du cours.
- Exception choisie : on accepte aussi la vente d'objets (catégorie « Objets / vente », prix facultatif). Le paiement se fait en dehors de l'appli.

## Les 2 IA
1. Imposée : le profil depuis le CV (l'IA propose les compétences, la personne valide).
2. Inventée : « l'assistant d'annonce » — vérifier les coordonnées cachées (priorité), puis rédiger (bonus).
   Détails : `docs/ia-inventee.md`.

## Objectif pour le 17 décembre
- Palier visé : **2** (palier 1 obligatoire + messagerie). Palier 3 seulement si tout le reste tient en ligne.
- Les 3 écrans de la démo (histoire de Sam et Léa) :
  1. Le profil de Sam : CV → l'IA propose les compétences → Sam valide (IA imposée).
     Puis Sam publie son annonce : l'assistant repère un numéro caché, Sam le retire (IA inventée).
  2. L'annonce et la demande de contact : Léa demande, Sam accepte, les coordonnées apparaissent (palier 1).
  3. La messagerie : Léa et Sam s'écrivent (palier 2, règle d'or n°3).
- On ajoute à l'existant, on ne refait pas ce qui marche.

## Design (refonte du 23 oct, validée sur maquette)
- Fond clair `#f6f7fb`, cartes blanches qui flottent (classe `carte`), dégradé violet → bleu pour l'essentiel
  (classes `degrade`, `bouton-principal`), formes floues `halo` derrière les en-têtes.
- Police Plus Jakarta Sans partout (plus de police à empattements). Une couleur + une icône par catégorie
  (`src/lib/annonces/style-categories.ts`). Icônes maison au trait (`src/app/icone.tsx`), pas d'emoji.
- Navigation : barre du haut sur ordinateur (≥ 1024 px), barre d'onglets en bas sur téléphone et tablette.
- Composants communs : `src/app/ui.tsx` (Avatar, PastilleCategorie, VignetteCategorie, TitrePage, EtatVide).

## Outils
Next.js (TypeScript, Tailwind) · GitHub · Vercel · Supabase. Rien d'autre sans me demander.

## Qui peut s'inscrire
Seulement les adresses de l'école : @mail-esd.com, @mail-esp.com (étudiants), @ecole-digital.com (profs et personnel).
Vérifié sur la page (`src/lib/auth/domaines.ts`) ET refusé par la base (`supabase/migrations/…_domaines_ecole.sql`).
Limite connue : sans confirmation par e-mail, on ne prouve pas que la personne possède l'adresse (amélioration prévue).

## Les 3 règles d'or (toujours vraies, protégées dans la base avec la RLS)
1. Mes coordonnées ne sont visibles qu'après mon accord.
2. Je ne peux modifier que mes propres annonces.
3. Une conversation n'est lisible que par ses deux participants.

## Ce que l'IA ne touche jamais
- Aucune clé secrète dans le code ni sur GitHub. Jamais la clé `service_role`.
  Les clés vont dans `.env.local` (PC) et dans les variables Vercel.
- Ne jamais modifier `.env.local`, `.gitignore`, les réglages Vercel/Supabase sans demander.
- Ne pas installer d'outil, ne pas refaire ce qui marche, ne rien envoyer sur GitHub sans accord.

## Façon de travailler
- Une demande = une étape. Me poser des questions avant de coder.
- Pour chaque étape : un moyen de vérifier (test, ou essai sur l'appli en ligne).
- Expliquer en français simple ce qui a été changé et pourquoi.

@AGENTS.md
