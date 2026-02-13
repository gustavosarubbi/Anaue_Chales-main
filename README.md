# Anaue_Chales

## Integração Channex

O site usa a API do Channex para:

- **Calendário mestre**: as datas ocupadas no Channex são consideradas bloqueadas no site (incluindo reservas do Airbnb/Booking).
- **Fechar no Airbnb**: quando uma reserva é confirmada no site, ela é enviada ao Channex (Booking CRS), que sincroniza com Airbnb e outros canais.

Configure em `.env.local` (veja `.env.example`):

| Variável | Descrição |
|----------|-----------|
| `CHANNEX_API_KEY` | API Key (Channex > Organization > API Keys) |
| `CHANNEX_PROPERTY_ID` | ID da propriedade (ver no dashboard ao abrir a propriedade ou em GET `/api/v1/properties`) |
| `CHANNEX_ROOM_TYPE_ID` | Room ID do quarto/tipo no Channex |
| `CHANNEX_RATE_PLAN_ID` | ID da tarifa (Rate Plan) no Channex |

O Property precisa ter o app **Booking CRS** instalado no Channex para criar reservas via API.

### Sincronização em tempo (quase) real

- **Reservas confirmadas**: já são enviadas ao Channex no momento da confirmação (webhook InfinitePay ou página de sucesso).
- **Datas bloqueadas e pendências**:
  - **Cron (Vercel)**: o `vercel.json` dispara `GET /api/sync/channex` **a cada 1 minuto**. Plano Hobby da Vercel pode limitar a 1x/dia — nesse caso altere em `vercel.json` para `"schedule": "0 * * * *"` (a cada hora).
  - **Webhook Supabase (instantâneo)**: em **Supabase > Database > Webhooks**, crie um webhook na tabela `blocked_dates`, eventos Insert/Update/Delete, URL `https://seu-dominio.vercel.app/api/webhooks/supabase-db`. Opcional: defina `CHANNEX_SYNC_WEBHOOK_SECRET` e use no webhook como header `Authorization: Bearer <secret>`.
