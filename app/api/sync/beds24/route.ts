import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { isBeds24Enabled } from '@/lib/beds24'
import { syncBlockedDatesToBeds24, syncConfirmedReservationsToBeds24 } from '@/lib/beds24-sync'

/**
 * Sincroniza o estado local (Supabase) com o Beds24 para alinhar o Airbnb.
 *
 * Fluxos:
 * - Site → Airbnb: esta API envia blocked_dates + reservas ao Beds24; o Beds24 repassa ao Airbnb.
 * - Airbnb → Site: o site lê disponibilidade da API Beds24 (getRoomDates); o que está no Airbnb
 *   deve refletir no Beds24 (via canal Beds24↔Airbnb); confira no painel Beds24 se o canal está ativo.
 *
 * GET ou POST. Query: dryRun=true para simular (não chama Beds24).
 * Se CRON_SECRET estiver definido, exige header x-cron-secret.
 */
function checkCronSecret(request: Request): Response | null {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return null
  const header = request.headers.get('x-cron-secret')?.trim()
  if (header !== secret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return null
}

export async function GET(request: Request) {
  const err = checkCronSecret(request)
  if (err) return err
  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dryRun') === 'true'
  return runSync(dryRun)
}

export async function POST(request: Request) {
  const err = checkCronSecret(request)
  if (err) return err
  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dryRun') === 'true'
  return runSync(dryRun)
}

async function runSync(dryRun: boolean) {
  if (!isBeds24Enabled()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Beds24 não configurado (variáveis de ambiente)',
        flows: {
          siteToAirbnb: 'POST /api/sync/beds24 envia blocked_dates e reservas ao Beds24 → Airbnb',
          airbnbToSite: 'Site lê disponibilidade da API Beds24; alinhe o canal no painel Beds24',
        },
      },
      { status: 400 }
    )
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Supabase não configurado' },
      { status: 500 }
    )
  }

  const blocked = await syncBlockedDatesToBeds24(supabase, { dryRun })
  const reservations = await syncConfirmedReservationsToBeds24(supabase)

  const success = blocked.success && reservations.errors.length === 0
  return NextResponse.json({
    success,
    dryRun,
    timestamp: new Date().toISOString(),
    blocked: {
      dateFrom: blocked.dateFrom,
      dateTo: blocked.dateTo,
      blockedDatesInDb: blocked.blockedDatesCount,
      datesSentToBeds24: blocked.datesSentToBeds24,
      errors: blocked.errors,
    },
    reservations: {
      synced: reservations.synced,
      errors: reservations.errors,
    },
    flows: {
      siteToAirbnb: 'blocked_dates + reservas (Supabase) → Beds24 → Airbnb. Aguarde alguns minutos para o canal atualizar.',
      airbnbToSite: 'O site usa a API Beds24 (getRoomDates). Se fechar no Airbnb, o Beds24 deve receber do canal; confira Channel Manager no Beds24.',
    },
  })
}
