# Fiche d'identité — L'Entraide du Campus

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

## Outils
Next.js (TypeScript, Tailwind) · GitHub · Vercel · Supabase. Rien d'autre sans me demander.

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
