/**
 * Cliente da API Channex para sincronizar calendário (master), bloquear datas e criar reservas.
 * Documentação: https://docs.channex.io/
 * - Availability/Restrictions: https://docs.channex.io/api-v.1-documentation/ari
 * - Booking CRS: https://docs.channex.io/api-v.1-documentation/booking-crs-api
 */

import { ENV } from '@/lib/utils/env'
import { getDatesBetween } from '@/lib/utils/reservation'

const DEFAULT_BASE_URL = 'https://app.channex.io'

export interface ChannexConfig {
  apiKey: string
  baseUrl: string
  propertyId: string
  roomTypeId: string
  ratePlanId: string
}

export function getChannexConfig(): ChannexConfig | null {
  const apiKey = ENV.CHANNEX_API_KEY
  const propertyId = ENV.CHANNEX_PROPERTY_ID
  const roomTypeId = ENV.CHANNEX_ROOM_TYPE_ID
  const ratePlanId = ENV.CHANNEX_RATE_PLAN_ID
  if (!apiKey || !propertyId || !roomTypeId || !ratePlanId) {
    return null
  }
  return {
    apiKey,
    baseUrl: ENV.CHANNEX_API_BASE_URL || DEFAULT_BASE_URL,
    propertyId,
    roomTypeId,
    ratePlanId,
  }
}

export function isChannexEnabled(): boolean {
  return getChannexConfig() !== null
}

async function channexRequest<T>(
  config: ChannexConfig,
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; meta?: { message?: string; warnings?: unknown[] }; errors?: { code?: string; title?: string } }> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/api/v1${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'user-api-key': config.apiKey,
      ...options.headers,
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('[Channex] Erro HTTP', res.status, path, json)
    return { errors: json?.errors || { code: 'http_error', title: res.statusText } }
  }
  return json
}

/**
 * Busca restrições (stop_sell) do Channex para o rate plan.
 * Datas com stop_sell = true devem aparecer fechadas no site (sync com Booking/Airbnb).
 */
async function getChannexStopSellDates(
  config: ChannexConfig,
  dateFrom: string,
  dateTo: string
): Promise<Record<string, boolean>> {
  const path = `/restrictions?filter[property_id]=${config.propertyId}&filter[date][gte]=${dateFrom}&filter[date][lte]=${dateTo}&filter[restrictions]=stop_sell`
  const result = await channexRequest<Record<string, Record<string, { stop_sell?: boolean | number }>>>(config, path, { method: 'GET' })
  if (result.errors || !result.data?.[config.ratePlanId]) return {}
  const byDate = result.data[config.ratePlanId]
  const out: Record<string, boolean> = {}
  for (const [date, obj] of Object.entries(byDate)) {
    const v = obj?.stop_sell
    if (v === true || v === 1) out[date] = true
  }
  return out
}

/**
 * Busca disponibilidade do calendário mestre (Channex) para um room type e período.
 * Considera tanto availability <= 0 quanto stop_sell = true como datas bloqueadas,
 * para refletir corretamente o que está fechado no Booking/Airbnb.
 */
export async function getChannexAvailability(
  dateFrom: string,
  dateTo: string
): Promise<{ success: boolean; bookedDates?: Record<string, boolean>; error?: string }> {
  const config = getChannexConfig()
  if (!config) {
    return { success: false, error: 'Channex não configurado' }
  }

  const [availabilityRes, stopSellDates] = await Promise.all([
    channexRequest<Record<string, Record<string, number>>>(config, `/availability?filter[property_id]=${config.propertyId}&filter[date][gte]=${dateFrom}&filter[date][lte]=${dateTo}`, { method: 'GET' }),
    getChannexStopSellDates(config, dateFrom, dateTo),
  ])

  if (availabilityRes.errors) {
    return { success: false, error: (availabilityRes.errors as { title?: string }).title || 'Erro ao buscar disponibilidade' }
  }

  const bookedDates: Record<string, boolean> = {}

  const data = availabilityRes.data
  if (data?.[config.roomTypeId]) {
    for (const [date, availability] of Object.entries(data[config.roomTypeId])) {
      if (availability <= 0) bookedDates[date] = true
    }
  }

  for (const date of Object.keys(stopSellDates)) {
    bookedDates[date] = true
  }

  return { success: true, bookedDates }
}

/**
 * Bloqueia um intervalo de datas no Channex (stop_sell no rate plan e disponibilidade 0 no room type).
 * Útil para fechamento/manutenção. Para reservas confirmadas, use createChannexBooking.
 */
export async function blockChannexDates(
  dateFrom: string,
  dateTo: string
): Promise<{ success: boolean; error?: string }> {
  const config = getChannexConfig()
  if (!config) {
    return { success: false, error: 'Channex não configurado' }
  }
  // 1) Stop sell no rate plan (bloqueia venda nos canais)
  const restrictionsRes = await channexRequest(config, '/restrictions', {
    method: 'POST',
    body: JSON.stringify({
      values: [{
        property_id: config.propertyId,
        rate_plan_id: config.ratePlanId,
        date_from: dateFrom,
        date_to: dateTo,
        stop_sell: true,
      }],
    }),
  })
  if (restrictionsRes.errors) {
    console.error('[Channex] Erro ao aplicar stop_sell:', restrictionsRes.errors)
    return { success: false, error: (restrictionsRes.errors as { title?: string }).title || 'Erro ao bloquear datas' }
  }
  // 2) Disponibilidade 0 no room type (calendário mestre)
  const availabilityRes = await channexRequest(config, '/availability', {
    method: 'POST',
    body: JSON.stringify({
      values: [{
        property_id: config.propertyId,
        room_type_id: config.roomTypeId,
        date_from: dateFrom,
        date_to: dateTo,
        availability: 0,
      }],
    }),
  })
  if (availabilityRes.errors) {
    console.error('[Channex] Erro ao atualizar disponibilidade:', availabilityRes.errors)
    return { success: false, error: (availabilityRes.errors as { title?: string }).title || 'Erro ao definir disponibilidade' }
  }
  return { success: true }
}

/**
 * Cria uma reserva no Channex (Booking CRS). Isso sincroniza para Airbnb e outros canais,
 * fechando as datas automaticamente.
 * Requer que o Property tenha o app "Booking CRS" instalado no Channex.
 */
export async function createChannexBooking(params: {
  arrivalDate: string
  departureDate: string
  guestName: string
  guestSurname: string
  guestEmail: string
  guestPhone: string
  totalPrice: number
  currency?: string
  otaReservationCode: string
  adults?: number
  children?: number
}): Promise<{ success: boolean; bookingId?: string; uniqueId?: string; error?: string }> {
  const config = getChannexConfig()
  if (!config) {
    return { success: false, error: 'Channex não configurado' }
  }
  const currency = params.currency || 'BRL'
  const nights = getDatesBetween(
    new Date(params.arrivalDate + 'T00:00:00'),
    new Date(params.departureDate + 'T00:00:00')
  )
  const pricePerNight = nights.length > 0 ? Math.round((params.totalPrice / nights.length) * 100) / 100 : params.totalPrice
  const days: Record<string, string> = {}
  nights.forEach((d) => { days[d] = pricePerNight.toFixed(2) })

  const payload = {
    booking: {
      property_id: config.propertyId,
      ota_reservation_code: params.otaReservationCode,
      ota_name: 'Site Anaue Chales',
      arrival_date: params.arrivalDate,
      departure_date: params.departureDate,
      arrival_hour: '15:00',
      payment_collect: 'ota',
      payment_type: 'bank_transfer',
      currency,
      notes: `Reserva site - ${params.otaReservationCode}`,
      meta: null,
      customer: {
        name: params.guestName,
        surname: params.guestSurname || params.guestName,
        mail: params.guestEmail,
        phone: params.guestPhone || '',
        address: '',
        city: '',
        zip: '',
        country: 'BR',
      },
      rooms: [{
        room_type_id: config.roomTypeId,
        rate_plan_id: config.ratePlanId,
        days,
        services: [],
        taxes: [],
        guests: [{ name: params.guestName, surname: params.guestSurname || params.guestName }],
        occupancy: {
          adults: params.adults ?? 2,
          children: params.children ?? 0,
          infants: 0,
          ages: [],
        },
      }],
    },
  }

  const result = await channexRequest<{ id?: string; type?: string; attributes?: { booking_id?: string; unique_id?: string } }>(config, '/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (result.errors) {
    console.error('[Channex] Erro ao criar booking:', result.errors)
    const err = result.errors as { title?: string; details?: string[] }
    return {
      success: false,
      error: err.title || (Array.isArray(err.details) ? err.details.join(', ') : 'Erro ao criar reserva no Channex'),
    }
  }
  const data = result.data as { id?: string; attributes?: { booking_id?: string; unique_id?: string } } | undefined
  const id = data?.id ?? data?.attributes?.booking_id
  const uniqueId = data?.attributes?.unique_id
  return { success: true, bookingId: id, uniqueId }
}
