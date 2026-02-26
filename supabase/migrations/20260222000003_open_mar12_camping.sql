-- Liberando o dia 12 de março no Camping (chale-2) conforme pedido do usuário.
-- Data estava bloqueada na migração 20260221_blocked_dates_apenas_instrucao_fev_mar_abr.sql

DELETE FROM blocked_dates
WHERE chalet_id = 'chale-2' AND date = '2026-03-12';
