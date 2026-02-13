-- Reverter: remover qualquer bloqueio do Chalé Master (chale-anaue).
-- O objetivo era desabilitar meses depois, não bloquear o chalé.
DELETE FROM blocked_dates
WHERE chalet_id = 'chale-anaue';
