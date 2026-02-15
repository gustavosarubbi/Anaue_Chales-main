-- Chalé Master (Anauê) fechado 27 a 30 de março 2026 (camping).
-- Essas datas são sincronizadas com Beds24 → Airbnb (quando rodar sync ou webhook).
INSERT INTO blocked_dates (chalet_id, date)
VALUES
  ('chale-anaue', '2026-03-27'),
  ('chale-anaue', '2026-03-28'),
  ('chale-anaue', '2026-03-29'),
  ('chale-anaue', '2026-03-30')
ON CONFLICT (chalet_id, date) DO NOTHING;
