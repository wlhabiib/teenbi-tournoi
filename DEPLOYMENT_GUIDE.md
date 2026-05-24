# 🚀 Guide de Déploiement - Tournoi Teenbi

## ✅ Prérequis

- [x] Git installé et configuré
- [x] Repository Git initialisé localement
- [x] Compte GitHub (pour héberger le code)
- [x] Compte Vercel (gratuit sur vercel.com)
- [x] Projet Supabase créé avec bucket "photos"

---

## 📋 Étape 1: Configuration GitHub

### 1.1 Créer un repository GitHub

1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur **"New repository"** (ou le "+" en haut)
3. **Repository name**: `tournoi-teenbi`
4. **Description**: `Platform de gestion de tournoi sportif avec Next.js et Supabase`
5. **Public**: ✅ Recommandé pour Vercel
6. **DO NOT** initialiser avec README (on a déjà le code local)
7. Cliquez **"Create repository"**

### 1.2 Pousser le code local sur GitHub

```powershell
# Remplacez VOTRE_USERNAME par votre username GitHub
cd "c:\Users\AIDARA MOUHAMED\OneDrive\Bureau\tournoi-teenbi"

# Ajouter le remote
git remote add origin https://github.com/VOTRE_USERNAME/tournoi-teenbi.git

# Renommer la branche si besoin
git branch -M main

# Pousser le code
git push -u origin main
```

✅ Votre code est maintenant sur GitHub!

---

## 🌐 Étape 2: Configuration Vercel

### 2.1 Créer un projet Vercel

1. Allez sur [Vercel.com](https://vercel.com)
2. Cliquez **"Add New..."** → **"Project"**
3. Sélectionnez **"Import Git Repository"**
4. Paste votre URL GitHub: `https://github.com/VOTRE_USERNAME/tournoi-teenbi`
5. Cliquez **"Import"**

### 2.2 Configurer l'environnement

1. Dans Vercel, allez à **"Environment Variables"**
2. Ajoutez ces variables (obtenues de votre projet Supabase):

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
```

> **Où trouver ces valeurs ?**
> - Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
> - Cliquez sur votre projet
> - **Settings** → **API**
> - Copiez "Project URL" et "anon public"

### 2.3 Déployer

1. Cliquez **"Deploy"**
2. Attendez ~2-3 minutes
3. ✅ Votre app est en ligne!

---

## 🔐 Étape 3: Configuration Supabase (IMPORTANT)

### 3.1 Créer les tables et bucket

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Ouvrez votre projet
3. Allez à **"SQL Editor"**
4. Copiez/collez le contenu de `SUPABASE_SETUP.sql`
5. Cliquez **"Run"**

### 3.2 Créer le bucket "photos"

1. Allez à **"Storage"**
2. Cliquez **"Create a new bucket"**
3. **Name**: `photos`
4. **Public bucket**: ✅ Cochez cette case
5. Cliquez **"Create bucket"**

### 3.3 Mettre à jour les variables Vercel

Si vous avez changé vos clés Supabase:
1. Allez à Vercel → Votre projet
2. **Settings** → **Environment Variables**
3. Mettez à jour `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Cliquez **"Save and Redeploy"**

---

## 🧪 Tests Post-Déploiement

### Vérifier que l'app fonctionne:

1. **Accédez à votre URL Vercel** (ex: `tournoi-teenbi.vercel.app`)
2. **Test Navigation**:
   - [ ] Navbar fixe en haut
   - [ ] Toutes les pages chargent (Accueil, Équipes, Tirage, Supporters, Résultats, Admin)

3. **Test Admin Panel**:
   - [ ] Ajouter une équipe
   - [ ] Ajouter un match
   - [ ] Upload photo sponsor

4. **Test Supabase**:
   - [ ] Les données persistent après refresh
   - [ ] Les messages de chat apparaissent

---

## 📝 Mise à jour du code

### Pour ajouter des changements après déploiement:

```powershell
# 1. Modifiez les fichiers localement
# 2. Testez avec npm run dev
# 3. Commitez les changements

git add .
git commit -m "Description des changements"
git push origin main

# 4. Vercel redéploie automatiquement en quelques minutes!
```

---

## 🔗 URLs Utiles

| Service | URL |
|---------|-----|
| **GitHub** | https://github.com/VOTRE_USERNAME/tournoi-teenbi |
| **Vercel** | https://tournoi-teenbi.vercel.app |
| **Supabase** | https://supabase.com/dashboard |
| **Local Dev** | http://localhost:3000 |

---

## 🆘 Dépannage

### L'app charge mais affiche "Supabase not configured"
- [ ] Vérifier que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont dans Vercel
- [ ] Vérifier qu'elles ne sont pas vides
- [ ] Redéployer: Vercel → Redeployments → Redeploy

### Erreurs CORS sur les uploads
- [ ] Vérifier que le bucket "photos" est PUBLIC
- [ ] Vérifier les RLS policies de Supabase

### Le site charge lentement
- [ ] Utiliser Vercel Analytics pour vérifier les performances
- [ ] Optimiser les images dans `/public`

---

## ✨ Félicitations! 🎉

Votre plateforme **Tournoi Teenbi** est maintenant en ligne et prête à être utilisée!

**Prochaines étapes:**
- Configurer les sponsors via l'Admin Panel
- Ajouter les équipes et joueurs
- Créer les matchs du tournoi
- Partager l'URL avec les supporters

---

*Guide généré pour Tournoi Teenbi - Mai 2026*
