import { createServerClient } from '@/lib/supabase'
import { getDatesBetween } from '@/lib/utils/reservation'
import { fetchICalData } from '@/lib/utils/ical-parser'
import { MANUAL_BOOKED_DATES } from '@/lib/data/availability'

export interface AvailabilityResult {
    available: boolean
    conflictingDates: string[]
    requestedDates: string[]
    allBookedDates: string[]
}

export async function checkReservationAvailability(
    checkIn: string,
    checkOut: string,
    chaletId: string = 'chale-anaue'
): Promise<{ success: boolean; data?: AvailabilityResult; error?: string }> {
    try {
        // Normalizar datas
        const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number)
        const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay, 0, 0, 0, 0)

        const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number)
        const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay, 0, 0, 0, 0)

        const allBookedDates: Set<string> = new Set()
        const allCheckInDates: Set<string> = new Set()

        // 1. Sincronização externa condicional
        const CALENDARS: Record<string, { airbnb?: string; booking?: string }> = {
            'chale-anaue': {
                airbnb: 'https://www.airbnb.com.br/calendar/ical/1457198661856129067.ics?s=64254c8251f4f54cf8b4c3ae58363ea5',
                booking: 'https://ical.booking.com/v1/export?t=21d8cded-a6cf-4897-8f9a-dfccf043b796'
            },
            'chale-2': {
                airbnb: undefined,
                booking: undefined
            }
        }

        const chaletCalendars = CALENDARS[chaletId]
        if (chaletCalendars) {
            const calendarTasks = []
            if (chaletCalendars.airbnb) calendarTasks.push(fetchICalData(chaletCalendars.airbnb, 'Airbnb', 2, 5000))
            if (chaletCalendars.booking) calendarTasks.push(fetchICalData(chaletCalendars.booking, 'Booking.com', 2, 5000))

            if (calendarTasks.length > 0) {
                const externalEvents = (await Promise.all(calendarTasks)).flat()
                externalEvents.forEach((event) => {
                    const eventStart = new Date(event.start)
                    eventStart.setHours(0, 0, 0, 0)
                    const eventEnd = new Date(event.end)
                    eventEnd.setHours(0, 0, 0, 0)

                    const startStr = `${eventStart.getFullYear()}-${String(eventStart.getMonth() + 1).padStart(2, '0')}-${String(eventStart.getDate()).padStart(2, '0')}`
                    allCheckInDates.add(startStr)

                    const dates = getDatesBetween(eventStart, eventEnd)
                    dates.forEach((date) => allBookedDates.add(date))
                })
            }
        }

        // 2. Adicionar datas manuais
        const manualDates = MANUAL_BOOKED_DATES[chaletId] || []
        manualDates.forEach((date) => {
            allBookedDates.add(date)
        })

        // 3. Supabase
        const supabase = createServerClient()
        if (supabase) {
            const requestedCheckIn = checkInDate.toISOString().split('T')[0]
            const requestedCheckOut = checkOutDate.toISOString().split('T')[0]

            const now = new Date().toISOString()
            // IMPORTANTE: Só bloquear reservas pending se forem cartão de crédito
            // Reservas pending sem payment_status ou com PIX não devem bloquear
            // Isso evita que testes ou reservas não pagas bloqueiem o calendário
            const { data: reservations, error: dbError } = await supabase
                .from('reservations')
                .select('check_in, check_out, status, expires_at, payment_status')
                .eq('chalet_id', chaletId)
                .lt('check_in', requestedCheckOut)
                .gt('check_out', requestedCheckIn)
                .or(`status.eq.confirmed,and(status.eq.pending,expires_at.gt.${now})`)

            if (!dbError && reservations) {
                reservations.forEach((reservation) => {
                    // Filtrar: só bloquear pending se for cartão de crédito
                    if (reservation.status === 'pending') {
                        const paymentStatus = (reservation.payment_status || '').toLowerCase()
                        const isCreditCard = paymentStatus.includes('credit_card') || 
                                           paymentStatus.includes('creditcard') ||
                                           paymentStatus.includes('cartão') ||
                                           paymentStatus.includes('cartao')
                        
                        // Se não for cartão de crédito, não bloquear
                        if (!isCreditCard) {
                            return
                        }
                    }

                    const start = new Date(reservation.check_in)
                    start.setHours(0, 0, 0, 0)
                    const end = new Date(reservation.check_out)
                    end.setHours(0, 0, 0, 0)

                    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
                    allCheckInDates.add(startStr)

                    const dates = getDatesBetween(start, end)
                    dates.forEach((date) => allBookedDates.add(date))
                })
            }
        }

        // IMPORTANTE: Tolerância de 1 dia no checkout
        // Permitir checkout em dia bloqueado se o check-in e dias de estadia estiverem livres
        // Exemplos permitidos:
        // - Check-in dia 25 (livre) + Check-out dia 26 (bloqueado) → PERMITIDO
        // - Check-in dia 17 (livre) + Check-out dia 18 (bloqueado) → PERMITIDO
        // - Check-in dia 16 + Check-out dia 18 (dia 17 livre, dia 18 bloqueado) → PERMITIDO
        
        const checkInStr = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}-${String(checkInDate.getDate()).padStart(2, '0')}`
        const checkOutStr = `${checkOutDate.getFullYear()}-${String(checkOutDate.getMonth() + 1).padStart(2, '0')}-${String(checkOutDate.getDate()).padStart(2, '0')}`
        
        // Verificar se check-in está bloqueado (não permitir check-in em dia ocupado)
        const checkInIsBooked = allCheckInDates.has(checkInStr) || allBookedDates.has(checkInStr)
        
        // Check-in e check-out no mesmo dia
        if (checkInDate.getTime() === checkOutDate.getTime()) {
            return {
                success: true,
                data: {
                    available: !checkInIsBooked,
                    conflictingDates: checkInIsBooked ? [checkInStr] : [],
                    requestedDates: [checkInStr],
                    allBookedDates: Array.from(allBookedDates),
                }
            }
        }

        // Para períodos maiores, verificar apenas as datas de estadia (excluindo o check-out)
        // O check-out pode ser em um dia bloqueado (tolerância de 1 dia)
        // getDatesBetween já exclui automaticamente o check-out
        const stayDates = getDatesBetween(checkInDate, checkOutDate)
        const conflictingDates = stayDates.filter((date) => allBookedDates.has(date))
        
        // Também verificar se há check-in conflitante nas datas de estadia
        const conflictingCheckIns = stayDates.filter((date) => allCheckInDates.has(date))

        // Disponível se:
        // 1. Check-in não está bloqueado
        // 2. Todas as datas de estadia (exceto check-out) estão livres
        const isAvailable = !checkInIsBooked && conflictingDates.length === 0 && conflictingCheckIns.length === 0

        return {
            success: true,
            data: {
                available: isAvailable,
                conflictingDates: checkInIsBooked ? [checkInStr] : [...conflictingDates, ...conflictingCheckIns],
                requestedDates: getDatesBetween(checkInDate, checkOutDate),
                allBookedDates: Array.from(allBookedDates),
            }
        }
    } catch (error) {
        console.error('Error in checkReservationAvailability:', error)
        return { success: false, error: 'Erro interno ao verificar disponibilidade' }
    }
}
