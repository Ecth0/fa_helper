-- Table pour stocker les profils des joueurs
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  puuid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gameName TEXT,
  tagLine TEXT,
  description TEXT,
  qualities JSONB DEFAULT '[]'::jsonb,
  roles JSONB DEFAULT '[]'::jsonb,
  vods JSONB DEFAULT '[]'::jsonb,
  contact TEXT,
  riot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_profiles_puuid ON profiles(puuid);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Permissions (RLS sera activé si nécessaire)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
-- CREATE POLICY "Profiles are viewable by everyone" ON profiles
--   FOR SELECT USING (true);

-- Politique pour permettre l'insertion/mise à jour (vous pouvez la modifier selon vos besoins)
-- CREATE POLICY "Profiles are insertable by everyone" ON profiles
--   FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Profiles are updatable by everyone" ON profiles
--   FOR UPDATE USING (true);

