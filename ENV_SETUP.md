# Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mercado Pago Configuration
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_ACCESS_TOKEN=

# Application URL (for redirects after payment)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Como obter as credenciais:

### Supabase:
1. Acesse https://supabase.com
2. Crie um novo projeto ou acesse um projeto existente
3. Vá em Settings > API
4. Copie a URL do projeto para `NEXT_PUBLIC_SUPABASE_URL`
5. Copie a anon/public key para `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copie a service_role key para `SUPABASE_SERVICE_ROLE_KEY` (mantenha em segredo!)

### Mercado Pago:
1. Acesse https://www.mercadopago.com.br/developers
2. Crie uma aplicação
3. Nas credenciais de teste ou produção:
   - Copie a Public Key para `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
   - Copie o Access Token para `MERCADOPAGO_ACCESS_TOKEN`

### Base URL:
- Em desenvolvimento: `http://localhost:3000`
- Em produção: URL completa do seu domínio (ex: `https://seusite.com.br`)

## Configuração do Banco de Dados (Supabase)

Execute o seguinte SQL no SQL Editor do Supabase para criar a tabela de reservas:

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 2,
  children_count INTEGER NOT NULL DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_id TEXT,
  payment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para melhor performance nas consultas de disponibilidade
CREATE INDEX idx_reservations_dates ON reservations(check_in, check_out) WHERE status = 'confirmed';
CREATE INDEX idx_reservations_status ON reservations(status);
```

