# TODO - Auth + UI/UX fixes

## Plan
- [x] Remplacer l’auth “maison” (localStorage + vérif password_hash) par l’auth Supabase réelle.

- [ ] Créer une vraie fenêtre de login au démarrage (index/_app) et un flux signup/login utilisant Supabase Auth.
- [ ] Supprimer les identifiants admin/1234 côté code; gérer le rôle admin via la table/claims.
- [x] Mettre à jour `lib/authSupabase.ts` (signIn/signUp/logout/getCurrentUser/isUserAdmin) pour Supabase.

- [ ] Mettre à jour `pages/login.tsx` et `pages/signup.tsx` pour envoyer à Supabase Auth.
- [x] Mettre à jour `components/Navigation.tsx` et `pages/admin/index.tsx` pour utiliser l’état auth Supabase.
- [ ] Ajouter un rendu mobile: éviter débordements (utiliser containers max-w, padding, overflow-x-hidden si nécessaire).
- [ ] Unifier le style: hover/gradients + “lumière dorée” sous chaque bouton/champ (inputs/buttons/cards) sans casser l’existant.
- [ ] Vérifier que toutes pages protégées redirigent correctement.

## Test
- [ ] Lancer `next dev` et vérifier connexion/signup.
- [ ] Vérifier mobile (iPhone largeur ~390px) : pas de débordement.
- [ ] Vérifier hover gradients sur boutons/champs.

