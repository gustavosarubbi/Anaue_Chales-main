-- Adiciona coluna terms_accepted na tabela reservations
-- Esta coluna armazena se o usuário aceitou os termos e condições ao fazer a reserva
-- Importante para compliance legal e auditoria

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE NOT NULL;

-- Comentário na coluna para documentação
COMMENT ON COLUMN reservations.terms_accepted IS 'Indica se o usuário aceitou os termos e condições ao fazer a reserva. Obrigatório para compliance legal.';
