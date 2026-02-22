-- Renomeia coluna de sync Channex para Beds24 (troca de canal) (idempotente)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reservations' AND column_name = 'channex_synced_at')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reservations' AND column_name = 'beds24_synced_at') THEN
    ALTER TABLE reservations RENAME COLUMN channex_synced_at TO beds24_synced_at;
    EXECUTE 'COMMENT ON COLUMN reservations.beds24_synced_at IS ''Quando a reserva foi enviada ao Beds24 para sincronizar com Airbnb/canais.''';
  END IF;
END $$;
