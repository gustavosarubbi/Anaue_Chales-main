-- Camping (chale-2) fechado em 25/02/2026
INSERT INTO blocked_dates (chalet_id, date)
VALUES ('chale-2', '2026-02-25')
ON CONFLICT (chalet_id, date) DO NOTHING;
