/**
 * Sincroniza estado local (Supabase) com o Beds24: reservas confirmadas e
 * datas bloqueadas, para que o Airbnb e outros canais fiquem alinhados.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createBeds24Booking, setBeds24AvailabilityInRange } from '@/lib/beds24'

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
 * Envia a reserva para o Beds24 (apenas Chalé Master / chale-anaue).
 * Idempotente: pode ser chamado mais de uma vez; Beds24 pode rejeitar duplicata por referência.
 */
export async function syncReservationToBeds24(
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
  const result = await createBeds24Booking({
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
    console.error('[Beds24 Sync] Falha ao criar booking:', reservationId, result.error)
    return { synced: false, error: result.error }
  }

  await supabase
    .from('reservations')
    .update({ beds24_synced_at: new Date().toISOString() })
    .eq('id', reservationId)

  console.log('[Beds24 Sync] ✅ Reserva enviada ao Beds24:', reservationId, result.bookingId)
  return { synced: true }
}

/** Janela de datas para sincronizar disponibilidade no Beds24 (hoje + 14 meses). */
const SYNC_MONTHS_AHEAD = 14

export interface SyncBlockedResult {
  success: boolean
  dateFrom: string
  dateTo: string
  blockedDatesCount: number
  datesSentToBeds24: number
  errors: string[]
}

/**
 * Envia ao Beds24 a disponibilidade do Chalé Master para um intervalo: cada data
 * fica com inventário 1 (disponível) exceto as que estão em blocked_dates (inventário 0).
 * Assim o Airbnb deixa de mostrar "tudo indisponível" e reflete bloqueios corretos.
 * Use dryRun: true para apenas retornar o que seria enviado, sem chamar a API.
 */
export async function syncBlockedDatesToBeds24(
  supabase: SupabaseClient,
  options?: { dryRun?: boolean }
): Promise<SyncBlockedResult> {
  const today = new Date()
  const dateFrom = today.toISOString().slice(0, 10)
  const dateTo = new Date(today)
  dateTo.setMonth(dateTo.getMonth() + SYNC_MONTHS_AHEAD)
  const dateToStr = dateTo.toISOString().slice(0, 10)

  const { data: rows, error } = await supabase
    .from('blocked_dates')
    .select('date')
    .eq('chalet_id', 'chale-anaue')

  const blockedSet = new Set<string>()
  if (!error && rows?.length) {
    for (const r of rows) {
      const d = r.date
      const dateStr = typeof d === 'string' ? d.split('T')[0] : (d as Date).toISOString().slice(0, 10)
      if (dateStr) blockedSet.add(dateStr)
    }
  }

  if (options?.dryRun) {
    return {
      success: true,
      dateFrom,
      dateTo,
      blockedDatesCount: blockedSet.size,
      datesSentToBeds24: 0,
      errors: [],
    }
  }

  const result = await setBeds24AvailabilityInRange(dateFrom, dateToStr, blockedSet)
  return {
    success: result.errors.length === 0,
    dateFrom,
    dateTo,
    blockedDatesCount: blockedSet.size,
    datesSentToBeds24: result.setCount,
    errors: result.errors,
  }
}

/**
 * Envia ao Beds24 todas as reservas confirmadas do Chalé Master que ainda
 * não foram sincronizadas (beds24_synced_at null).
 */
export async function syncConfirmedReservationsToBeds24(
  supabase: SupabaseClient
): Promise<{ synced: number; errors: string[] }> {
  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('chalet_id', 'chale-anaue')
    .eq('status', 'confirmed')
    .is('beds24_synced_at', null)

  if (error || !reservations?.length) {
    return { synced: 0, errors: error ? [error.message] : [] }
  }

  const errors: string[] = []
  let synced = 0
  for (const r of reservations) {
    const result = await syncReservationToBeds24(supabase, r.id)
    if (result.synced) synced++
    else if (result.error) errors.push(`${r.id}: ${result.error}`)
  }
  return { synced, errors }
}
