import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getDatesBetween } from '@/lib/utils/reservation'
import { fetchICalData, type CalendarEvent } from '@/lib/utils/ical-parser'

export async function POST(request: Request) {
  try {
    const { checkIn, checkOut } = await request.json()

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: 'Datas de check-in e check-out são obrigatórias' },
        { status: 400 }
      )
    }

    // Normalizar datas para comparar apenas o dia
    // IMPORTANTE: new Date("YYYY-MM-DD") interpreta como UTC, causando problemas de timezone
    // Precisamos criar a data no timezone local
    const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number)
    const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay, 0, 0, 0, 0)
    
    const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number)
    const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay, 0, 0, 0, 0)
    
    // Log para debug
    console.log("[DEBUG] Datas recebidas e normalizadas:", {
      checkInString: checkIn,
      checkOutString: checkOut,
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      checkInLocal: `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}-${String(checkInDate.getDate()).padStart(2, '0')}`,
      checkOutLocal: `${checkOutDate.getFullYear()}-${String(checkOutDate.getMonth() + 1).padStart(2, '0')}-${String(checkOutDate.getDate()).padStart(2, '0')}`,
    })

    // Buscar reservas dos calendários externos com retry e melhor tratamento
    const airbnbUrl =
      'https://www.airbnb.com.br/calendar/ical/1457198661856129067.ics?s=64254c8251f4f54cf8b4c3ae58363ea5'
    const bookingUrl = 'https://ical.booking.com/v1/export?t=21d8cded-a6cf-4897-8f9a-dfccf043b796'

    const [airbnbEvents, bookingEvents] = await Promise.all([
      fetchICalData(airbnbUrl, 'Airbnb', 3, 10000),
      fetchICalData(bookingUrl, 'Booking.com', 3, 10000),
    ])

    // Buscar reservas confirmadas no Supabase
    const supabase = createServerClient()
    let reservations = null
    if (supabase) {
      const { data, error: dbError } = await supabase
        .from('reservations')
        .select('check_in, check_out')
        .eq('status', 'confirmed')
        .or(`check_in.lte.${checkOutDate.toISOString().split('T')[0]},check_out.gte.${checkInDate.toISOString().split('T')[0]}`)

      if (dbError) {
        console.error('Erro ao buscar reservas do Supabase:', dbError)
      } else {
        reservations = data
      }
    }

    // Combinar todas as reservas
    // IMPORTANTE: Uma data está ocupada se há uma reserva que COMEÇA nesse dia
    // ou se há uma reserva em andamento nesse dia (mas não se apenas termina nesse dia)
    const allBookedDates: Set<string> = new Set()
    const allCheckInDates: Set<string> = new Set() // Datas de check-in (dias que começam reservas)

    // Adicionar datas dos calendários externos
    ;[...airbnbEvents, ...bookingEvents].forEach((event) => {
      // Normalizar datas dos eventos
      const eventStart = new Date(event.start)
      eventStart.setHours(0, 0, 0, 0)
      const eventEnd = new Date(event.end)
      eventEnd.setHours(0, 0, 0, 0)
      
      // Marcar a data de check-in (início da reserva)
      const checkInStr = `${eventStart.getFullYear()}-${String(eventStart.getMonth() + 1).padStart(2, '0')}-${String(eventStart.getDate()).padStart(2, '0')}`
      allCheckInDates.add(checkInStr)
      
      // Adicionar todas as noites ocupadas (excluindo o check-out)
      const dates = getDatesBetween(eventStart, eventEnd)
      dates.forEach((date) => allBookedDates.add(date))
    })

    // Adicionar datas das reservas do Supabase
    if (reservations) {
      reservations.forEach((reservation) => {
        // Normalizar datas das reservas
        const start = new Date(reservation.check_in)
        start.setHours(0, 0, 0, 0)
        const end = new Date(reservation.check_out)
        end.setHours(0, 0, 0, 0)
        
        // Marcar a data de check-in (início da reserva)
        const checkInStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
        allCheckInDates.add(checkInStr)
        
        // Adicionar todas as noites ocupadas (excluindo o check-out)
        const dates = getDatesBetween(start, end)
        dates.forEach((date) => allBookedDates.add(date))
      })
    }

    // Verificar se as datas solicitadas estão disponíveis
    const requestedDates = getDatesBetween(checkInDate, checkOutDate)
    
    // Se check-in e check-out são no mesmo dia, verificar se há check-in nesse dia
    // (não verificar se há reserva que termina nesse dia, pois o dia está disponível)
    if (checkInDate.getTime() === checkOutDate.getTime()) {
      const checkInDateStr = requestedDates[0]
      // Uma data está ocupada para check-in/check-out no mesmo dia se:
      // 1. Há uma reserva que COMEÇA nesse dia (allCheckInDates)
      // 2. OU há uma reserva em andamento nesse dia (allBookedDates)
      const isBooked = allCheckInDates.has(checkInDateStr) || allBookedDates.has(checkInDateStr)
      const conflictingDates = isBooked ? [checkInDateStr] : []
      
      console.log("Verificação mesmo dia (revisada):", {
        date: checkInDateStr,
        hasCheckInOnDate: allCheckInDates.has(checkInDateStr),
        hasOngoingReservation: allBookedDates.has(checkInDateStr),
        isBooked,
        available: !isBooked,
      })
      
      return NextResponse.json({
        success: true,
        available: !isBooked,
        conflictingDates,
        requestedDates,
        allBookedDates: Array.from(allBookedDates),
      })
    }
    
    // Para períodos maiores que 1 dia, verificar normalmente
    const conflictingDates = requestedDates.filter((date) => allBookedDates.has(date))

    // Log detalhado para debug
    const allBookedDatesArray = Array.from(allBookedDates).sort()
    console.log("Verificação de disponibilidade:", {
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      checkInTimestamp: checkInDate.getTime(),
      checkOutTimestamp: checkOutDate.getTime(),
      sameDay: checkInDate.getTime() === checkOutDate.getTime(),
      requestedDates,
      conflictingDates,
      totalBookedDates: allBookedDates.size,
      sampleBookedDates: allBookedDatesArray.slice(0, 5),
      available: conflictingDates.length === 0,
    })
    
    // Se check-in e check-out são no mesmo dia, verificar se a data está ocupada
    if (checkInDate.getTime() === checkOutDate.getTime()) {
      const checkInDateStr = requestedDates[0]
      const isBooked = allBookedDates.has(checkInDateStr)
      console.log("Verificação mesmo dia:", {
        date: checkInDateStr,
        isBooked,
        inBookedDates: allBookedDates.has(checkInDateStr),
      })
    }

    return NextResponse.json({
      success: true,
      available: conflictingDates.length === 0,
      conflictingDates,
      requestedDates,
      allBookedDates: Array.from(allBookedDates),
    })
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao verificar disponibilidade',
      },
      { status: 500 }
    )
  }
}

