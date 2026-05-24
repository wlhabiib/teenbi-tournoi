# Tournoi Teenbi - Plateforme Next.js/React

Application Next.js moderne pour gérer un tournoi de football avec Supabase et déployable sur Vercel.

## 🚀 Démarrage rapide

### 1. Configuration Supabase

1. **Allez sur [https://supabase.com](https://supabase.com)** et créez un projet
2. **Exécutez le SQL** dans l'éditeur SQL Supabase (fichier `SUPABASE_SETUP.sql`)
3. **Créez un bucket** de stockage nommé `photos` (public)
4. **Récupérez vos clés** : Settings > API > Project URL et API Key

### 2. Installation locale

```bash
# Clone le repository
git clone https://github.com/wlhabiib/teenbi-tournoi.git
cd tournoi-teenbi

# Installez les dépendances
npm install

# Créez le fichier .env.local
cp .env.local.example .env.local

# Complétez avec vos clés Supabase
# NEXT_PUBLIC_SUPABASE_URL=votre_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
```

### 3. Démarrage du serveur

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📋 Pages disponibles

- **Accueil** (`/`) - Tableau de bord avec stats et votes
- **Équipes** (`/equipes`) - Liste des 6 équipes
- **Tirage au sort** (`/tirage`) - Gestion des matchs
- **Supporters** (`/supporters`) - Chat en temps réel
- **Résultats** (`/resultats`) - Résultats et statistiques
- **Admin** (`/admin`) - Gestion complète (équipes, matchs, paramètres)

## 🎨 Fonctionnalités principales

✅ Navigation fixe en haut  
✅ Volets séparés pour chaque section  
✅ Panel Admin complet  
✅ Diagrammes interactifs (votes, buteurs, passeurs)  
✅ Support multiple buteurs/passeurs (format: nom1,nom2,nom3)  
✅ Upload de photo du parrain  
✅ Effets de survol et dégradés  
✅ Design moderne noir/or  

## 🔐 Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=https://hdcyowawybcxlmndzxhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_secrète
```

## 🚀 Déploiement sur Vercel

1. **Poussez votre code sur GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Allez sur [https://vercel.com](https://vercel.com)**
3. **Importez votre repository**
4. **Ajoutez les variables d'environnement** (Settings > Environment Variables)
5. **Déployez!** 🎉

## 📊 Structure du projet

```
tournoi-teenbi/
├── pages/              # Pages Next.js
│   ├── index.tsx      # Accueil
│   ├── equipes.tsx    # Équipes
│   ├── tirage.tsx     # Tirage
│   ├── supporters.tsx # Supporters
│   ├── resultats.tsx  # Résultats
│   └── admin/         # Admin Panel
├── components/        # Composants réutilisables
├── lib/              # Utilitaires & Supabase
├── styles/           # CSS global
└── public/           # Fichiers statiques
```

## 🛠 Technologies

- **Next.js 14** - Framework React
- **React 18** - UI library
- **Supabase** - Backend & DB
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 📝 Notes

- Les clés Anon et Secret doivent être ajoutées au fichier `.env.local`
- Le fichier `.env.local` ne doit jamais être commité
- Les photos du parrain sont stockées dans le bucket Supabase `photos`

## 🤝 Support

Pour toute question, consultez la documentation :
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
