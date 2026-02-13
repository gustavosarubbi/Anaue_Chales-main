/**
 * Sincroniza estado local (Supabase) com o Channex: reservas confirmadas e
 * datas bloqueadas, para que o Airbnb e outros canais fiquem alinhados.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createChannexBooking, blockChannexDates } from '@/lib/channex'

function splitName(fullName: string): { name: string; surname: string } {
  const trimmed = (fullName || '').trim()
  const firstSpace = trimmed.indexOf(' ')
  if (firstSpace <= 0) return { name: trimmed || 'Hóspede', surname: '' }
  return {
    name: trimmed.slice(0, firstSpace),
    surname: trimmed.slice(firstSpace + 1).trim(),
  }
}

/**
 * Envia a reserva para o Channex (apenas Chalé Master / chale-anaue).
 * Idempotente: pode ser chamado mais de uma vez; Channex pode rejeitar duplicata por ota_reservation_code.
 */
export async function syncReservationToChannex(
  supabase: SupabaseClient,
  reservationId: string
): Promise<{ synced: boolean; error?: string }> {
  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('id, check_in, check_out, guest_name, guest_email, guest_phone, total_price, chalet_id, guest_count, children_count')
    .eq('id', reservationId)
    .single()

  if (fetchError || !reservation) {
    return { synced: false, error: 'Reserva não encontrada' }
  }

  if (reservation.chalet_id && reservation.chalet_id !== 'chale-anaue') {
    return { synced: false }
  }

  const { name, surname } = splitName(reservation.guest_name || '')
  const result = await createChannexBooking({
    arrivalDate: reservation.check_in,
    departureDate: reservation.check_out,
    guestName: name,
    guestSurname: surname,
    guestEmail: reservation.guest_email || '',
    guestPhone: reservation.guest_phone || '',
    totalPrice: Number(reservation.total_price) || 0,
    currency: 'BRL',
    otaReservationCode: reservationId,
    adults: reservation.guest_count ?? 2,
    children: reservation.children_count ?? 0,
  })

  if (!result.success) {
    console.error('[Channex Sync] Falha ao criar booking:', reservationId, result.error)
    return { synced: false, error: result.error }
  }

  await supabase
    .from('reservations')
    .update({ channex_synced_at: new Date().toISOString() })
    .eq('id', reservationId)

  console.log('[Channex Sync] ✅ Reserva enviada ao Channex:', reservationId, result.bookingId || result.uniqueId)
  return { synced: true }
}

/**
 * Agrupa datas em intervalos contíguos [dateFrom, dateTo] para reduzir chamadas à API.
 */
function groupContiguousDates(dates: string[]): { dateFrom: string; dateTo: string }[] {
  if (dates.length === 0) return []
  const sorted = [...dates].sort()
  const ranges: { dateFrom: string; dateTo: string }[] = []
  let from = sorted[0]
  let to = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(to)
    prev.setDate(prev.getDate() + 1)
    const next = new Date(sorted[i])
    if (prev.toISOString().slice(0, 10) === sorted[i]) {
      to = sorted[i]
    } else {
      ranges.push({ dateFrom: from, dateTo: to })
      from = sorted[i]
      to = sorted[i]
    }
  }
  ranges.push({ dateFrom: from, dateTo: to })
  return ranges
}

/**
 * Envia as datas bloqueadas do Supabase (Chalé Master) para o Channex,
 * para que apareçam bloqueadas no Airbnb também.
 */
export async function syncBlockedDatesToChannex(
  supabase: SupabaseClient
): Promise<{ synced: number; errors: string[] }> {
  const { data: rows, error } = await supabase
    .from('blocked_dates')
    .select('date')
    .eq('chalet_id', 'chale-anaue')

  if (error || !rows?.length) {
    return { synced: 0, errors: error ? [error.message] : [] }
  }

  const dateStrings = rows.map((r) => {
    const d = r.date
    return typeof d === 'string' ? d.split('T')[0] : (d as Date).toISOString().slice(0, 10)
  }).filter(Boolean) as string[]

  const ranges = groupContiguousDates(dateStrings)
  const errors: string[] = []
  let synced = 0
  for (const { dateFrom, dateTo } of ranges) {
    const result = await blockChannexDates(dateFrom, dateTo)
    if (result.success) synced++
    else if (result.error) errors.push(`${dateFrom}–${dateTo}: ${result.error}`)
  }
  return { synced, errors }
}

/**
 * Envia ao Channex todas as reservas confirmadas do Chalé Master que ainda
 * não foram sincronizadas (channex_synced_at null).
 */
export async function syncConfirmedReservationsToChannex(
  supabase: SupabaseClient
): Promise<{ synced: number; errors: string[] }> {
  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('chalet_id', 'chale-anaue')
    .eq('status', 'confirmed')
    .is('channex_synced_at', null)

  if (error || !reservations?.length) {
    return { synced: 0, errors: error ? [error.message] : [] }
  }

  const errors: string[] = []
  let synced = 0
  for (const r of reservations) {
    const result = await syncReservationToChannex(supabase, r.id)
    if (result.synced) synced++
    else if (result.error) errors.push(`${r.id}: ${result.error}`)
  }
  return { synced, errors }
}
