-- Garante coluna beds24_synced_at (sync com Beds24/Airbnb).
-- Renomeia channex_synced_at se existir; senão adiciona beds24_synced_at se ainda não existir.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservations' AND column_name = 'channex_synced_at'
  ) THEN
    ALTER TABLE reservations RENAME COLUMN channex_synced_at TO beds24_synced_at;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservations' AND column_name = 'beds24_synced_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN beds24_synced_at TIMESTAMPTZ NULL;
  END IF;
END $$;

COMMENT ON COLUMN reservations.beds24_synced_at IS 'Quando a reserva foi enviada ao Beds24 para sincronizar com Airbnb/canais.';
