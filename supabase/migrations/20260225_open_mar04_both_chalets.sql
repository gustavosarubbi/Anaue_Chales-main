-- Liberando o dia 4 de março nos dois chalés conforme pedido do usuário.
-- Garante que qualquer bloqueio manual ou anterior seja removido.

DELETE FROM blocked_dates
WHERE date = '2026-03-04'
  AND chalet_id IN ('chale-anaue', 'chale-2');
