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
            const { data: reservations, error: dbError } = await supabase
                .from('reservations')
                .select('check_in, check_out, status, expires_at')
                .eq('chalet_id', chaletId)
                .lt('check_in', requestedCheckOut)
                .gt('check_out', requestedCheckIn)
                .or(`status.eq.confirmed,and(status.eq.pending,expires_at.gt.${now})`)

            if (!dbError && reservations) {
                reservations.forEach((reservation) => {
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

        const requestedDates = getDatesBetween(checkInDate, checkOutDate)

        // Check-in e check-out no mesmo dia
        if (checkInDate.getTime() === checkOutDate.getTime()) {
            const dateStr = requestedDates[0]
            const isBooked = allCheckInDates.has(dateStr) || allBookedDates.has(dateStr)
            return {
                success: true,
                data: {
                    available: !isBooked,
                    conflictingDates: isBooked ? [dateStr] : [],
                    requestedDates,
                    allBookedDates: Array.from(allBookedDates),
                }
            }
        }

        const conflictingDates = requestedDates.filter((date) => allBookedDates.has(date))

        return {
            success: true,
            data: {
                available: conflictingDates.length === 0,
                conflictingDates,
                requestedDates,
                allBookedDates: Array.from(allBookedDates),
            }
        }
    } catch (error) {
        console.error('Error in checkReservationAvailability:', error)
        return { success: false, error: 'Erro interno ao verificar disponibilidade' }
    }
}
