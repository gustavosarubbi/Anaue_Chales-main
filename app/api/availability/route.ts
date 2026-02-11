import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { fetchICalData } from "@/lib/utils/ical-parser"
import { getDatesBetween } from "@/lib/utils/reservation"
import { MANUAL_BOOKED_DATES } from "@/lib/data/availability"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chaletId = searchParams.get('chaletId') || 'chale-anaue'

    // Configuração de calendários por chalé
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

    const bookedDates: Record<string, string> = {}
    const syncResults: any[] = []

    // 1. Sincronização externa (apenas se houver URL configurada)
    const chaletCalendars = CALENDARS[chaletId]
    if (chaletCalendars) {
      const calendarTasks = []
      if (chaletCalendars.airbnb) calendarTasks.push(fetchICalData(chaletCalendars.airbnb, "Airbnb", 3, 10000))
      if (chaletCalendars.booking) calendarTasks.push(fetchICalData(chaletCalendars.booking, "Booking.com", 3, 10000))

      if (calendarTasks.length > 0) {
        const externalResults = await Promise.all(calendarTasks)
        const allEvents = externalResults.flat()

        allEvents.forEach((event) => {
          const start = new Date(event.start)
          start.setHours(0, 0, 0, 0)
          const end = new Date(event.end)
          end.setHours(0, 0, 0, 0)

          const dates = getDatesBetween(start, end)
          dates.forEach((date) => {
            bookedDates[date] = "booked"
          })
        })

        if (chaletCalendars.airbnb) syncResults.push({ source: "Airbnb", count: externalResults[0]?.length || 0 })
        if (chaletCalendars.booking) syncResults.push({ source: "Booking.com", count: externalResults[externalResults.length - 1]?.length || 0 })
      }
    }

    // 2. Adicionar datas manuais
    const manualDates = MANUAL_BOOKED_DATES[chaletId] || []
    manualDates.forEach((date) => {
      bookedDates[date] = "booked"
    })

    // 3. Buscar reservas confirmadas e pendentes no Supabase
    try {
      const supabase = createServerClient()
      if (supabase) {
        const now = new Date().toISOString()
        // IMPORTANTE: Só bloquear reservas pending se forem cartão de crédito
        // Reservas pending sem payment_status ou com PIX não devem bloquear
        // Isso evita que testes ou reservas não pagas bloqueiem o calendário
        const { data: reservations, error: dbError } = await supabase
          .from("reservations")
          .select("check_in, check_out, status, expires_at, payment_status")
          .eq("chalet_id", chaletId)
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

            const dates = getDatesBetween(start, end)
            dates.forEach((date) => {
              bookedDates[date] = "booked"
            })
          })
        }
      }
    } catch (dbError) {
      console.error("Erro ao buscar reservas do Supabase:", dbError)
    }

    return NextResponse.json({
      success: true,
      availability: bookedDates,
      lastUpdated: new Date().toISOString(),
      syncInfo: syncResults,
      source: syncResults.length > 0 ? "Hybrid (External + Manual + DB)" : "Manual + DB"
    })
  } catch (error) {
    console.error("Erro ao processar disponibilidade:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar disponibilidade",
        availability: {},
      },
      { status: 500 },
    )
  }
}
