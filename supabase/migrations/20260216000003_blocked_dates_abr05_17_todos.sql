-- Fechar 05 e 17/04 para todos os chalés (pedido WhatsApp 15/02/2026).
-- Chalé Master (chale-anaue) sync → Beds24 → Airbnb; Camping (chale-2) só no site.
INSERT INTO blocked_dates (chalet_id, date)
VALUES
  ('chale-anaue', '2026-04-05'),
  ('chale-anaue', '2026-04-17'),
  ('chale-2', '2026-04-05'),
  ('chale-2', '2026-04-17')
ON CONFLICT (chalet_id, date) DO NOTHING;
