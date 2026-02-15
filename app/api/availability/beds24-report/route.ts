import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getDatesBetween } from '@/lib/utils/reservation'
import { MANUAL_BOOKED_DATES } from '@/lib/data/availability'
import { getBeds24Config, getBeds24Availability } from '@/lib/beds24'

const CHALET_ID = 'chale-anaue'
const DEFAULT_DAYS = 90

/**
 * GET /api/availability/beds24-report
 *
 * Retorna o que está disponível/bloqueado segundo a API do Beds24 (o que o Airbnb vê)
 * e o que o site considera (Beds24 + Supabase + blocked_dates + manual), para comparar.
 *
 * Query: dateFrom, dateTo (YYYY-MM-DD). Padrão: hoje até +90 dias.
 * TEMPORÁRIO (só pra testar): ?beds24Only=true retorna só o que a API Beds24 devolve, sem site.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const beds24Only = searchParams.get('beds24Only') === 'true'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const defaultTo = new Date(today)
    defaultTo.setDate(defaultTo.getDate() + DEFAULT_DAYS)
    const dateFrom = searchParams.get('dateFrom') || today.toISOString().slice(0, 10)
    const dateTo = searchParams.get('dateTo') || defaultTo.toISOString().slice(0, 10)

    const start = new Date(dateFrom + 'T00:00:00')
    const endInclusive = new Date(dateTo + 'T00:00:00')
    const endExclusive = new Date(endInclusive)
    endExclusive.setDate(endExclusive.getDate() + 1)
    const allDatesInRange = getDatesBetween(start, endExclusive)

    const config = getBeds24Config()
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Beds24 não configurado',
        range: { dateFrom, dateTo },
      }, { status: 400 })
    }

    const beds24Result = await getBeds24Availability(dateFrom, dateTo)
    if (!beds24Result.success) {
      return NextResponse.json({
        success: false,
        error: beds24Result.error || 'Erro ao consultar Beds24',
        range: { dateFrom, dateTo },
      }, { status: 502 })
    }
    const beds24BlockedSet = new Set(Object.keys(beds24Result.bookedDates || {}))
    const beds24Available = allDatesInRange.filter((d) => !beds24BlockedSet.has(d))
    const beds24Blocked = allDatesInRange.filter((d) => beds24BlockedSet.has(d))

    if (beds24Only) {
      return NextResponse.json({
        success: true,
        source: 'API Beds24 (getRoomDates) — só Beds24, sem site (teste temporário)',
        range: { dateFrom, dateTo },
        totalDaysInRange: allDatesInRange.length,
        available: beds24Available.sort(),
        blocked: beds24Blocked.sort(),
        countAvailable: beds24Available.length,
        countBlocked: beds24Blocked.length,
        lastUpdated: new Date().toISOString(),
      })
    }

    // O que o site considera bloqueado (Beds24 + manual + reservas + blocked_dates)
    const siteBlockedSet = new Set(beds24BlockedSet)
    MANUAL_BOOKED_DATES[CHALET_ID]?.forEach((d) => siteBlockedSet.add(d))

    const supabase = createServerClient()
    if (supabase) {
      const now = new Date().toISOString()
      const { data: reservations } = await supabase
        .from('reservations')
        .select('check_in, check_out, status, expires_at, payment_status')
        .eq('chalet_id', CHALET_ID)
        .lt('check_in', dateTo)
        .gt('check_out', dateFrom)
        .or(`status.eq.confirmed,and(status.eq.pending,expires_at.gt.${now})`)

      reservations?.forEach((r) => {
        if (r.status === 'pending') {
          const ps = (r.payment_status || '').toLowerCase()
          const isCc = ps.includes('credit_card') || ps.includes('creditcard') || ps.includes('cartão') || ps.includes('cartao')
          if (!isCc) return
        }
        const startRes = new Date(r.check_in)
        startRes.setHours(0, 0, 0, 0)
        const endRes = new Date(r.check_out)
        endRes.setHours(0, 0, 0, 0)
        getDatesBetween(startRes, endRes).forEach((d) => siteBlockedSet.add(d))
      })

      const { data: blockedRows } = await supabase
        .from('blocked_dates')
        .select('date')
        .eq('chalet_id', CHALET_ID)

      blockedRows?.forEach((row) => {
        const d = row.date
        const str = typeof d === 'string' ? d.split('T')[0] : (d as Date).toISOString().slice(0, 10)
        if (str) siteBlockedSet.add(str)
      })
    }

    const siteAvailable = allDatesInRange.filter((d) => !siteBlockedSet.has(d))
    const siteBlocked = allDatesInRange.filter((d) => siteBlockedSet.has(d))

    // Discrepâncias
    const onlyBlockedOnBeds24 = beds24Blocked.filter((d) => !siteBlockedSet.has(d))
    const onlyBlockedOnSite = siteBlocked.filter((d) => !beds24BlockedSet.has(d))

    return NextResponse.json({
      success: true,
      range: { dateFrom, dateTo },
      source: 'API Beds24 (getRoomDates) = o que o Airbnb usa',
      beds24: {
        available: beds24Available.sort(),
        blocked: beds24Blocked.sort(),
        countAvailable: beds24Available.length,
        countBlocked: beds24Blocked.length,
      },
      site: {
        available: siteAvailable.sort(),
        blocked: siteBlocked.sort(),
        countAvailable: siteAvailable.length,
        countBlocked: siteBlocked.length,
      },
      summary: {
        totalDaysInRange: allDatesInRange.length,
        onlyBlockedOnBeds24: onlyBlockedOnBeds24.length ? onlyBlockedOnBeds24 : undefined,
        onlyBlockedOnSite: onlyBlockedOnSite.length ? onlyBlockedOnSite : undefined,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[beds24-report]', err)
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar relatório' },
      { status: 500 }
    )
  }
}
