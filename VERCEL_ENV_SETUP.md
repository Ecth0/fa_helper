# Configuration des variables d'environnement sur Vercel

## Variables requises pour Supabase

Vous devez avoir **2 variables** configurées sur Vercel :

### 1. NEXT_PUBLIC_SUPABASE_URL
- **Où la trouver** : Dans votre projet Supabase → Settings → API → Project URL
- **Exemple** : `https://xxxxxxxxxxxxx.supabase.co`

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Où la trouver** : Dans votre projet Supabase → Settings → API → Project API keys → `anon` `public`
- **Exemple** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Étapes pour ajouter sur Vercel

1. Allez dans votre projet Vercel
2. Settings > Environment Variables
3. Cliquez sur "Add New"
4. Ajoutez `NEXT_PUBLIC_SUPABASE_URL` avec votre URL Supabase
5. Vérifiez que `NEXT_PUBLIC_SUPABASE_ANON_KEY` existe déjà (elle semble être là)
6. **IMPORTANT** : Redéployez votre application après avoir ajouté les variables

## Vérification

Après avoir ajouté `NEXT_PUBLIC_SUPABASE_URL` et redéployé, l'erreur "Supabase client not initialized" devrait disparaître.

