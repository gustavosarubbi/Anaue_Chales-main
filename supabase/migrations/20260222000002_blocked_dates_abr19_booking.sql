-- Fechar 19/04 no Airbnb via Beds24: reserva no Booking não estava sincronizada.
-- Chalé Master (chale-anaue); sync envia blocked_dates ao Beds24 → Airbnb.
INSERT INTO blocked_dates (chalet_id, date)
VALUES ('chale-anaue', '2026-04-19')
ON CONFLICT (chalet_id, date) DO NOTHING;
