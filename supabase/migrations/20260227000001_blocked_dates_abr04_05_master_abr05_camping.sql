-- Ajuste solicitado: fechar 04/04 e 05/04 no Chalé Master e 05/04 no Camping.
-- Master (chale-anaue) sincroniza com Beds24 -> Airbnb via /api/sync/beds24.
INSERT INTO blocked_dates (chalet_id, date)
VALUES
  ('chale-anaue', '2026-04-04'),
  ('chale-anaue', '2026-04-05'),
  ('chale-2', '2026-04-05')
ON CONFLICT (chalet_id, date) DO NOTHING;
