-- Marca reservas já enviadas ao Channex (evita reenviar e sincroniza calendário com Airbnb)
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS channex_synced_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN reservations.channex_synced_at IS 'Quando a reserva foi enviada ao Channex (Booking CRS) para sincronizar com Airbnb/canais.';
