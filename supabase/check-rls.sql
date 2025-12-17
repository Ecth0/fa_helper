-- Script pour vérifier et désactiver RLS si nécessaire
-- Exécutez ce script dans l'éditeur SQL de Supabase si les profils ne s'affichent pas

-- 1. Vérifier si RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 2. Désactiver RLS (temporaire pour tester)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Si vous voulez réactiver RLS plus tard avec des politiques ouvertes :
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Profiles are viewable by everyone" 
--   ON profiles FOR SELECT 
--   USING (true);
--
-- CREATE POLICY "Profiles are insertable by everyone" 
--   ON profiles FOR INSERT 
--   WITH CHECK (true);
--
-- CREATE POLICY "Profiles are updatable by everyone" 
--   ON profiles FOR UPDATE 
--   USING (true);

