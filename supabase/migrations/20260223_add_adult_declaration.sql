-- Adiciona coluna adult_declaration na tabela reservations
-- Armazena se o usuário declarou ser maior de 18 anos ao fazer a reserva
-- Respaldo jurídico para política de não hospedagem de menores

ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS adult_declaration BOOLEAN DEFAULT FALSE NOT NULL;

COMMENT ON COLUMN reservations.adult_declaration IS 'Indica se o responsável pela reserva declarou ser maior de 18 anos. Obrigatório para compliance com política de restrição de idade.';
