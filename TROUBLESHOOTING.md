# Guide de dépannage - Supabase

## Les profils ne s'affichent pas

### 1. Vérifier les variables d'environnement

Assurez-vous que vos variables d'environnement sont bien configurées :

- **Localement** : Créez un fichier `.env.local` avec :
  ```
  NEXT_PUBLIC_SUPABASE_URL=votre_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle
  ```

- **Sur Vercel** : Allez dans Settings > Environment Variables et vérifiez que les variables sont présentes.

### 2. Vérifier que la table existe

1. Allez dans votre projet Supabase
2. Table Editor > Vérifiez que la table `profiles` existe
3. Si elle n'existe pas, exécutez le script SQL dans `supabase/schema.sql`

### 3. Vérifier les permissions (RLS)

Si Row Level Security est activé :

1. Allez dans Authentication > Policies
2. Vérifiez que les politiques permettent la lecture/écriture
3. Ou désactivez temporairement RLS pour tester :
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```

### 4. Vérifier les logs

- **Dans le navigateur** : Ouvrez la console (F12) et regardez les erreurs réseau
- **Sur Vercel** : Allez dans votre déploiement > Functions Logs pour voir les erreurs serveur
- **Dans Supabase** : Allez dans Logs > API Logs pour voir les requêtes

### 5. Tester manuellement l'API

Testez directement l'endpoint :

```bash
curl https://votre-site.vercel.app/api/profiles
```

Vous devriez recevoir un tableau JSON (vide si aucun profil).

### 6. Vérifier le format des données

Assurez-vous que lorsque vous créez un profil, les données sont bien envoyées au format attendu :

```json
{
  "puuid": "votre-puuid",
  "name": "Nom du joueur",
  "description": "...",
  "qualities": [],
  "roles": [],
  "vods": [],
  "riot": { ... }
}
```

### 7. Erreurs courantes

**"relation 'profiles' does not exist"**
→ La table n'existe pas. Exécutez le script SQL.

**"new row violates row-level security policy"**
→ RLS bloque l'insertion. Désactivez RLS ou créez une politique.

**"invalid input syntax for type jsonb"**
→ Les données JSON ne sont pas valides. Vérifiez le format des champs JSONB.

**"Network request failed"**
→ Vérifiez que NEXT_PUBLIC_SUPABASE_URL est correct.

