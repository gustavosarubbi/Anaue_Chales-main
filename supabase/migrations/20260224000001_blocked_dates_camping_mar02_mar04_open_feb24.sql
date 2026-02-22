-- Camping (chale-2): fechar 02/03 e 04/03/2026 e abrir 24/02/2026.
DELETE FROM blocked_dates
WHERE chalet_id = 'chale-2'
  AND date = '2026-02-24';

INSERT INTO blocked_dates (chalet_id, date)
VALUES
  ('chale-2', '2026-03-02'),
  ('chale-2', '2026-03-04')
ON CONFLICT (chalet_id, date) DO NOTHING;
