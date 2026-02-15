-- Renomeia coluna de sync Channex para Beds24 (troca de canal)
ALTER TABLE reservations
RENAME COLUMN channex_synced_at TO beds24_synced_at;

COMMENT ON COLUMN reservations.beds24_synced_at IS 'Quando a reserva foi enviada ao Beds24 para sincronizar com Airbnb/canais.';
