-- Ajouter la colonne background_photo_url manquante
ALTER TABLE settings ADD COLUMN IF NOT EXISTS background_photo_url TEXT;

-- Vérifier la structure actuelle
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings';
