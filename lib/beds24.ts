/**
 * Cliente da API Beds24 para sincronizar calendário (master), bloquear datas e criar reservas.
 * Documentação: https://www.beds24.com/api/ | getRoomDates, setRoomDates, setBooking.
 * Limite: uma chamada por vez; espaçar requests (ex.: 1–2 s) para evitar bloqueio.
 */

import { ENV } from '@/lib/utils/env'
import { getDatesBetween } from '@/lib/utils/reservation'

const BEDS24_API_BASE = 'https://api.beds24.com/json'
const THROTTLE_MS = 1500

let lastCallTime = 0

async function throttle(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastCallTime
  if (elapsed < THROTTLE_MS) {
    await new Promise((r) => setTimeout(r, THROTTLE_MS - elapsed))
  }
  lastCallTime = Date.now()
}

export interface Beds24Config {
  apiKey: string
  propKey: string
  roomId: string
}

export function getBeds24Config(): Beds24Config | null {
  const apiKey = ENV.BEDS24_API_KEY
  const propKey = ENV.BEDS24_PROP_KEY
  const roomId = ENV.BEDS24_ROOM_ID
  if (!apiKey || !propKey || !roomId) {
    return null
  }
  return { apiKey, propKey, roomId }
}

export function isBeds24Enabled(): boolean {
  return getBeds24Config() !== null
}

/** Converte YYYY-MM-DD para YYYYMMDD */
function toBeds24Date(isoDate: string): string {
  return isoDate.replace(/-/g, '')
}

/** Converte YYYYMMDD para YYYY-MM-DD */
function fromBeds24Date(beds24Date: string): string {
  if (beds24Date.length === 8) {
    return `${beds24Date.slice(0, 4)}-${beds24Date.slice(4, 6)}-${beds24Date.slice(6, 8)}`
  }
  return beds24Date
}

async function beds24Request<T>(
  config: Beds24Config,
  endpoint: string,
  body: Record<string, unknown>
): Promise<{ data?: T; error?: string; code?: number }> {
  await throttle()
  const url = `${BEDS24_API_BASE}/${endpoint}`
  const payload = {
    authentication: {
      apiKey: config.apiKey,
      propKey: config.propKey,
    },
    ...body,
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('[Beds24] Erro HTTP', res.status, endpoint, json)
    return {
      error: (json as { error?: string }).error || res.statusText,
      code: res.status,
    }
  }
  if (json && typeof (json as { error?: string }).error !== 'undefined') {
    return { error: (json as { error: string }).error, data: json as T }
  }
  return { data: json as T }
}

/**
 * Busca disponibilidade do calendário Beds24 para o room e período.
 * Datas com inventário <= 0 ou override blackout são consideradas bloqueadas.
 */
export async function getBeds24Availability(
  dateFrom: string,
  dateTo: string
): Promise<{ success: boolean; bookedDates?: Record<string, boolean>; error?: string }> {
  const config = getBeds24Config()
  if (!config) {
    return { success: false, error: 'Beds24 não configurado' }
  }

  const from = toBeds24Date(dateFrom)
  const to = toBeds24Date(dateTo)
  const result = await beds24Request<Record<string, Record<string, { i?: number; o?: number }>>>(
    config,
    'getRoomDates',
    {
      roomId: parseInt(config.roomId, 10) || config.roomId,
      from,
      to,
    }
  )

  if (result.error && !result.data) {
    return { success: false, error: result.error }
  }

  const bookedDates: Record<string, boolean> = {}
  const data = result.data as Record<string, unknown> | undefined
  if (data && typeof data === 'object') {
    const collectBlocked = (obj: Record<string, unknown>): void => {
      for (const [key, val] of Object.entries(obj)) {
        if (key.length === 8 && /^\d{8}$/.test(key) && val && typeof val === 'object' && !Array.isArray(val)) {
          const day = val as { i?: number | string; o?: number | string }
          // Beds24 pode retornar i e o como string ("0", "1"); aceitar número ou string
          const inv = Number(day.i)
          const over = Number(day.o)
          const blocked = (!Number.isNaN(inv) && inv <= 0) || over === 1
          if (blocked) bookedDates[fromBeds24Date(key)] = true
        } else if (val && typeof val === 'object' && !Array.isArray(val)) {
          collectBlocked(val as Record<string, unknown>)
        }
      }
    }
    collectBlocked(data)
  }
  return { success: true, bookedDates }
}

/**
 * Bloqueia um intervalo de datas no Beds24 (inventory 0).
 * Útil para fechamento/manutenção. Para reservas confirmadas, use createBeds24Booking.
 */
export async function blockBeds24Dates(
  dateFrom: string,
  dateTo: string
): Promise<{ success: boolean; error?: string }> {
  const config = getBeds24Config()
  if (!config) {
    return { success: false, error: 'Beds24 não configurado' }
  }

  const start = new Date(dateFrom + 'T00:00:00')
  const end = new Date(dateTo + 'T00:00:00')
  const dates = getDatesBetween(start, end)
  const datesObj: Record<string, { i: string }> = {}
  for (const d of dates) {
    datesObj[toBeds24Date(d)] = { i: '0' }
  }
  if (Object.keys(datesObj).length === 0) {
    return { success: true }
  }

  const result = await beds24Request<{ success?: boolean }>(config, 'setRoomDates', {
    roomId: config.roomId,
    dates: datesObj,
  })

  if (result.error) {
    console.error('[Beds24] Erro ao bloquear datas:', result.error)
    return { success: false, error: result.error }
  }
  return { success: true }
}

const BEDS24_CHUNK_DAYS = 90

/**
 * Define disponibilidade no Beds24 para um intervalo: cada data fica com inventário 1
 * (disponível) ou 0 (bloqueado) conforme blockedDateSet. Necessário para o Airbnb mostrar
 * datas disponíveis; sem isso o canal pode interpretar como tudo indisponível.
 */
export async function setBeds24AvailabilityInRange(
  dateFrom: string,
  dateTo: string,
  blockedDateSet: Set<string>
): Promise<{ success: boolean; setCount: number; errors: string[] }> {
  const config = getBeds24Config()
  if (!config) {
    return { success: false, setCount: 0, errors: ['Beds24 não configurado'] }
  }

  const start = new Date(dateFrom + 'T00:00:00')
  const endInclusive = new Date(dateTo + 'T00:00:00')
  const endExclusive = new Date(endInclusive)
  endExclusive.setDate(endExclusive.getDate() + 1)
  const allDates = getDatesBetween(start, endExclusive)
  const datesObj: Record<string, { i: string }> = {}
  for (const d of allDates) {
    datesObj[toBeds24Date(d)] = { i: blockedDateSet.has(d) ? '0' : '1' }
  }
  if (Object.keys(datesObj).length === 0) {
    return { success: true, setCount: 0, errors: [] }
  }

  const entries = Object.entries(datesObj)
  const errors: string[] = []
  let setCount = 0
  for (let i = 0; i < entries.length; i += BEDS24_CHUNK_DAYS) {
    const chunk = Object.fromEntries(entries.slice(i, i + BEDS24_CHUNK_DAYS))
    const result = await beds24Request<{ success?: boolean }>(config, 'setRoomDates', {
      roomId: config.roomId,
      dates: chunk,
    })
    if (result.error) {
      errors.push(result.error)
    } else {
      setCount += Object.keys(chunk).length
    }
  }
  return {
    success: errors.length === 0,
    setCount,
    errors,
  }
}

export interface CreateBeds24BookingParams {
  arrivalDate: string
  departureDate: string
  guestName: string
  guestSurname?: string
  guestEmail: string
  guestPhone: string
  totalPrice: number
  currency?: string
  otaReservationCode: string
  adults?: number
  children?: number
}

/**
 * Cria uma reserva no Beds24. O Beds24 sincroniza com Airbnb e outros canais.
 */
export async function createBeds24Booking(params: CreateBeds24BookingParams): Promise<{
  success: boolean
  bookingId?: string
  error?: string
}> {
  const config = getBeds24Config()
  if (!config) {
    return { success: false, error: 'Beds24 não configurado' }
  }

  const firstName = (params.guestSurname ? params.guestName : params.guestName.trim()) || 'Hóspede'
  const lastName = (params.guestSurname ?? '').trim() || firstName

  // lastNight = última noite da estadia (dia anterior ao check-out)
  const lastNightDate = new Date(params.departureDate + 'T00:00:00')
  lastNightDate.setDate(lastNightDate.getDate() - 1)
  const lastNight = lastNightDate.toISOString().slice(0, 10)

  const payload = {
    roomId: config.roomId,
    status: '1',
    firstNight: params.arrivalDate,
    lastNight,
    numAdult: String(params.adults ?? 2),
    numChild: String(params.children ?? 0),
    guestFirstName: firstName,
    guestName: lastName,
    guestEmail: params.guestEmail || '',
    guestPhone: params.guestPhone || '',
    price: params.totalPrice.toFixed(2),
    message: `Reserva site - ${params.otaReservationCode}`,
    notes: `Site Anaue Chales - ${params.otaReservationCode}`,
    checkAvailability: true,
    notifyGuest: false,
    notifyHost: false,
  }

  const result = await beds24Request<{ bookId?: string }>(config, 'setBooking', payload)

  if (result.error && !result.data) {
    console.error('[Beds24] Erro ao criar booking:', result.error)
    return { success: false, error: result.error }
  }
  const bookId = result.data?.bookId
  return { success: true, bookingId: bookId }
}
