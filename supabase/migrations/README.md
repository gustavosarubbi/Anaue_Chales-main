# Migrações do Supabase

Este diretório contém as migrações SQL para o banco de dados Supabase.

## Como aplicar as migrações

### Opção 1: Via Painel do Supabase (Recomendado)

1. Acesse o [Painel do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Cole o conteúdo do arquivo de migração
5. Clique em **Run** para executar

### Opção 2: Via Supabase CLI

Se você tiver o Supabase CLI configurado localmente:

```bash
npx supabase db push
```

## Migrações disponíveis

- `20260209_add_terms_accepted.sql` - Adiciona coluna `terms_accepted` na tabela `reservations` para armazenar o aceite dos termos e condições.
