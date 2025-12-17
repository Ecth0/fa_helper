# Configuration Supabase pour FA Helper

## Étape 1 : Créer un projet Supabase

1. Allez sur https://supabase.com
2. Créez un compte (gratuit)
3. Créez un nouveau projet
4. Notez votre URL et votre clé API

## Étape 2 : Exécuter le schéma SQL

1. Dans votre projet Supabase, allez dans l'éditeur SQL
2. Copiez le contenu du fichier `supabase/schema.sql`
3. Exécutez le script SQL pour créer la table `profiles`

## Étape 3 : Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### Où trouver ces valeurs :

- **NEXT_PUBLIC_SUPABASE_URL** : Dans votre projet Supabase, allez dans Settings > API > Project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** : Dans Settings > API > Project API keys > `anon` `public`

## Étape 4 : Configuration sur Vercel

Si vous déployez sur Vercel :

1. Allez dans votre projet Vercel
2. Settings > Environment Variables
3. Ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL` = votre URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = votre clé anon

## Étape 5 : Tester

Une fois configuré, les profils seront automatiquement sauvegardés dans Supabase et persistants entre les déploiements !

## Notes de sécurité (optionnel)

Le schéma SQL inclut des commentaires pour Row Level Security (RLS). Si vous voulez activer la sécurité :

1. Dans Supabase, allez dans Authentication > Policies
2. Activez RLS pour la table `profiles`
3. Décommentez les politiques dans le fichier SQL

