import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { isChannexEnabled } from '@/lib/channex'
import { syncBlockedDatesToChannex, syncConfirmedReservationsToChannex } from '@/lib/channex-sync'

/**
 * Sincroniza o estado local (Supabase) com o Channex para alinhar o Airbnb:
 * - Datas bloqueadas (blocked_dates) → bloqueadas no Channex/Airbnb
 * - Reservas confirmadas ainda não enviadas → criadas no Channex (Booking CRS)
 *
 * Pode ser chamado manualmente ou por um cron (ex.: Vercel Cron).
 * GET ou POST.
 */
export async function GET(request: Request) {
  return runSync()
}

export async function POST(request: Request) {
  return runSync()
}

async function runSync() {
  if (!isChannexEnabled()) {
    return NextResponse.json(
      { success: false, error: 'Channex não configurado (variáveis de ambiente)' },
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

  const blocked = await syncBlockedDatesToChannex(supabase)
  const reservations = await syncConfirmedReservationsToChannex(supabase)

  return NextResponse.json({
    success: true,
    blocked: {
      rangesSynced: blocked.synced,
      errors: blocked.errors,
    },
    reservations: {
      synced: reservations.synced,
      errors: reservations.errors,
    },
  })
}
