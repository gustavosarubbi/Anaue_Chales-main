-- Tabela de datas bloqueadas manualmente (fechamento, manutenção, etc.)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chalet_id TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(chalet_id, date)
);

COMMENT ON TABLE blocked_dates IS 'Datas em que o chalé está fechado (não disponível para reserva).';
CREATE INDEX IF NOT EXISTS idx_blocked_dates_chalet_date ON blocked_dates(chalet_id, date);

-- Camping (chale-2) fechado em 13/03/2026
INSERT INTO blocked_dates (chalet_id, date)
VALUES ('chale-2', '2026-03-13')
ON CONFLICT (chalet_id, date) DO NOTHING;
