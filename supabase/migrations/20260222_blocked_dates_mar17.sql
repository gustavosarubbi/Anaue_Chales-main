-- Fechar 17/03 no Airbnb via Beds24 (Chalé Master).
INSERT INTO blocked_dates (chalet_id, date)
VALUES ('chale-anaue', '2026-03-17')
ON CONFLICT (chalet_id, date) DO NOTHING;
