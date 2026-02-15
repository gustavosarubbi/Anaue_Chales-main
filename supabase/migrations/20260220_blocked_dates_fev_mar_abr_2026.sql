-- Bloqueios conforme definição: fev/mar/abr 2026 para Master (chale-anaue) e Camping (chale-2).
-- Remove bloqueios existentes nesse período e insere os corretos.
-- Master: fev 01-25 e 27-28; mar dias 01,03,06,07,13,14,19,20,21,26,27,28; abr 04,10,11,18.
-- Camping: fev 01-21 e 23-25 e 27-28; mar 01,06,07,12,13,14,18,21,24,27,28,29,30; abr 04,11,18,25.

DELETE FROM blocked_dates
WHERE date >= '2026-02-01' AND date <= '2026-04-30'
  AND chalet_id IN ('chale-anaue', 'chale-2');

INSERT INTO blocked_dates (chalet_id, date)
VALUES
  -- Fevereiro 2026 - Master (01 a 25, 27, 28)
  ('chale-anaue', '2026-02-01'), ('chale-anaue', '2026-02-02'), ('chale-anaue', '2026-02-03'), ('chale-anaue', '2026-02-04'), ('chale-anaue', '2026-02-05'),
  ('chale-anaue', '2026-02-06'), ('chale-anaue', '2026-02-07'), ('chale-anaue', '2026-02-08'), ('chale-anaue', '2026-02-09'), ('chale-anaue', '2026-02-10'),
  ('chale-anaue', '2026-02-11'), ('chale-anaue', '2026-02-12'), ('chale-anaue', '2026-02-13'), ('chale-anaue', '2026-02-14'), ('chale-anaue', '2026-02-15'),
  ('chale-anaue', '2026-02-16'), ('chale-anaue', '2026-02-17'), ('chale-anaue', '2026-02-18'), ('chale-anaue', '2026-02-19'), ('chale-anaue', '2026-02-20'),
  ('chale-anaue', '2026-02-21'), ('chale-anaue', '2026-02-22'), ('chale-anaue', '2026-02-23'), ('chale-anaue', '2026-02-24'), ('chale-anaue', '2026-02-25'),
  ('chale-anaue', '2026-02-27'), ('chale-anaue', '2026-02-28'),
  -- Fevereiro 2026 - Camping (01 a 21, 23, 24, 25, 27, 28)
  ('chale-2', '2026-02-01'), ('chale-2', '2026-02-02'), ('chale-2', '2026-02-03'), ('chale-2', '2026-02-04'), ('chale-2', '2026-02-05'),
  ('chale-2', '2026-02-06'), ('chale-2', '2026-02-07'), ('chale-2', '2026-02-08'), ('chale-2', '2026-02-09'), ('chale-2', '2026-02-10'),
  ('chale-2', '2026-02-11'), ('chale-2', '2026-02-12'), ('chale-2', '2026-02-13'), ('chale-2', '2026-02-14'), ('chale-2', '2026-02-15'),
  ('chale-2', '2026-02-16'), ('chale-2', '2026-02-17'), ('chale-2', '2026-02-18'), ('chale-2', '2026-02-19'), ('chale-2', '2026-02-20'),
  ('chale-2', '2026-02-21'), ('chale-2', '2026-02-23'), ('chale-2', '2026-02-24'), ('chale-2', '2026-02-25'),
  ('chale-2', '2026-02-27'), ('chale-2', '2026-02-28'),
  -- Março 2026 - Master
  ('chale-anaue', '2026-03-01'), ('chale-anaue', '2026-03-03'), ('chale-anaue', '2026-03-06'), ('chale-anaue', '2026-03-07'),
  ('chale-anaue', '2026-03-13'), ('chale-anaue', '2026-03-14'), ('chale-anaue', '2026-03-19'), ('chale-anaue', '2026-03-20'), ('chale-anaue', '2026-03-21'),
  ('chale-anaue', '2026-03-26'), ('chale-anaue', '2026-03-27'), ('chale-anaue', '2026-03-28'),
  -- Março 2026 - Camping
  ('chale-2', '2026-03-01'), ('chale-2', '2026-03-06'), ('chale-2', '2026-03-07'), ('chale-2', '2026-03-12'), ('chale-2', '2026-03-13'),
  ('chale-2', '2026-03-14'), ('chale-2', '2026-03-18'), ('chale-2', '2026-03-21'), ('chale-2', '2026-03-24'),
  ('chale-2', '2026-03-27'), ('chale-2', '2026-03-28'), ('chale-2', '2026-03-29'), ('chale-2', '2026-03-30'),
  -- Abril 2026 - Master
  ('chale-anaue', '2026-04-04'), ('chale-anaue', '2026-04-10'), ('chale-anaue', '2026-04-11'), ('chale-anaue', '2026-04-18'),
  -- Abril 2026 - Camping
  ('chale-2', '2026-04-04'), ('chale-2', '2026-04-11'), ('chale-2', '2026-04-18'), ('chale-2', '2026-04-25')
ON CONFLICT (chalet_id, date) DO NOTHING;
