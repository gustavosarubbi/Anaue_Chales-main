# Anaue_Chales

## Integração Beds24

O site usa a API do Beds24 para:

- **Calendário mestre**: as datas ocupadas no Beds24 são consideradas bloqueadas no site (incluindo reservas do Airbnb/Booking).
- **Fechar no Airbnb**: quando uma reserva é confirmada no site, ela é enviada ao Beds24 via API, que sincroniza com Airbnb e outros canais.

Tudo é feito **apenas via API** (nenhuma página do Beds24 é aberta pelo projeto).

Configure em `.env.local` (veja `.env.example`):

| Variável | Descrição |
|----------|-----------|
| `BEDS24_API_KEY` | API Key (Beds24 > Settings > Account – ative "API" / Developer API se existir a opção). |
| `BEDS24_PROP_KEY` | Prop Key (Beds24 > Settings > Properties > Access – na propriedade, copie o "Prop Key"). |
| `BEDS24_ROOM_ID` | ID do quarto (Beds24 > Settings > Properties > Rooms – abra o room ligado ao Airbnb e use o ID numérico). |

**Onde achar no Beds24:** Settings (ícone engrenagem) → **Account** (API Key); **Properties** → **Access** (Prop Key da propriedade); **Properties** → **Rooms** (Room ID do quarto conectado ao Airbnb). Com o Airbnb já conectado no Channel Manager, ao enviar bloqueios e reservas pela API o Beds24 replica para o Airbnb automaticamente.

**Passo a passo completo (incluindo criar a API Key após digitar a senha):** veja **[BEDS24-API-SETUP.md](./BEDS24-API-SETUP.md)**.

### Fluxo: Site ↔ Airbnb (fechar no site = fechar no Airbnb e vice-versa)

- **Site → Airbnb (fechar no site reflete no Airbnb)**  
  Bloqueios em `blocked_dates` e reservas confirmadas são enviados ao Beds24 por `POST /api/sync/beds24` (ou cron/webhook). O Beds24 repassa ao Airbnb; pode levar alguns minutos. Use `?dryRun=true` para simular sem chamar a API.
- **Airbnb → Site (fechar no Airbnb reflete no site)**  
  O site lê disponibilidade da **API Beds24** (`getRoomDates`). O Beds24 recebe reservas/bloqueios do canal Airbnb; confira no Beds24 (Channel Manager) se a conexão está ativa para o calendário refletir no site.
- Para aplicar migrações (novas colunas, bloqueios em SQL): `npx supabase db push`. Depois rode o sync ou espere o cron/webhook.

### Sincronização em tempo (quase) real

- **Reservas confirmadas**: já são enviadas ao Beds24 no momento da confirmação (webhook InfinitePay ou página de sucesso).
- **Datas bloqueadas e pendências**:
  - **GitHub Actions (recomendado)**: o workflow `.github/workflows/sync-beds24.yml` chama `POST /api/sync/beds24` **a cada 5 minutos**. Configure no repositório: **Settings → Secrets and variables → Actions**:
    - `SYNC_API_URL` = `https://SEU-PROJETO.vercel.app/api/sync/beds24`
    - `CRON_SECRET` (opcional) = mesmo valor da variável `CRON_SECRET` na Vercel; se definir, a rota só aceita requests com header `x-cron-secret`.
    - Com GitHub CLI: `gh secret set SYNC_API_URL` e `gh secret set CRON_SECRET` (e na Vercel defina `CRON_SECRET` igual).
  - **Webhook Supabase (instantâneo)**: em **Supabase > Database > Webhooks**, crie um webhook na tabela `blocked_dates`, eventos Insert/Update/Delete, URL `https://seu-dominio.vercel.app/api/webhooks/supabase-db`. Opcional: defina `BEDS24_SYNC_WEBHOOK_SECRET` e use no webhook como header `Authorization: Bearer <secret>`.

### Se o sync falhar (emails do GitHub / “sincronização falhando”)

1. **HTTP 401** – O `CRON_SECRET` no GitHub deve ser **igual** ao da Vercel (Settings → Environment Variables). Se na Vercel existir `CRON_SECRET`, crie o secret no GitHub com o mesmo valor.
2. **HTTP 504 / timeout** – Na Vercel Hobby o limite é 10s. O projeto usa throttle menor (800 ms) em ambiente Vercel para caber nesse tempo. Se ainda der timeout, confira no GitHub Actions a aba do workflow “Sync Beds24” e veja o corpo da resposta.
3. **success: false** – A resposta da API traz `errors` no JSON. Confira na Vercel que existem `BEDS24_API_KEY`, `BEDS24_PROP_KEY`, `BEDS24_ROOM_ID` e as variáveis do Supabase (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`).
