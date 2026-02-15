-- Chalé Camping (chale-2) fechado em 30/03/2026
INSERT INTO blocked_dates (chalet_id, date)
VALUES ('chale-2', '2026-03-30')
ON CONFLICT (chalet_id, date) DO NOTHING;
