import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { fetchICalData, type CalendarEvent } from "@/lib/utils/ical-parser"
import { getDatesBetween } from "@/lib/utils/reservation"

export async function GET() {
  try {
    const airbnbUrl =
      "https://www.airbnb.com.br/calendar/ical/1457198661856129067.ics?s=64254c8251f4f54cf8b4c3ae58363ea5"
    const bookingUrl = "https://ical.booking.com/v1/export?t=21d8cded-a6cf-4897-8f9a-dfccf043b796"

    // Buscar eventos dos calendários externos com retry e melhor tratamento
    const [airbnbEvents, bookingEvents] = await Promise.all([
      fetchICalData(airbnbUrl, "Airbnb", 3, 10000),
      fetchICalData(bookingUrl, "Booking.com", 3, 10000),
    ])

    const allEvents = [...airbnbEvents, ...bookingEvents]

    const bookedDates: Record<string, string> = {}

    // Adicionar datas dos calendários externos
    // Normalizar datas para evitar problemas de timezone
    allEvents.forEach((event) => {
      const start = new Date(event.start)
      start.setHours(0, 0, 0, 0)
      const end = new Date(event.end)
      end.setHours(0, 0, 0, 0)
      
      // Debug: verificar eventos que podem afetar o dia 26
      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
      
      if (startStr.includes('-26') || endStr.includes('-26')) {
        console.log(`[DEBUG] Evento ${event.source} próximo ao dia 26:`, {
          start: startStr,
          end: endStr,
          summary: event.summary,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        })
      }
      
      // getDatesBetween já exclui o dia de check-out corretamente
      // Se end é 2024-01-26, isso significa que a reserva termina no dia 26
      // e o dia 26 DEVE estar disponível (check-out libera o dia)
      const dates = getDatesBetween(start, end)
      
      if (startStr.includes('-26') || endStr.includes('-26')) {
        console.log(`[DEBUG] Datas marcadas como ocupadas para este evento:`, dates)
      }
      
      dates.forEach((date) => {
        bookedDates[date] = "booked"
      })
    })

    // Buscar reservas confirmadas no Supabase
    try {
      const supabase = createServerClient()
      if (supabase) {
        const { data: reservations, error: dbError } = await supabase
          .from("reservations")
          .select("check_in, check_out")
          .eq("status", "confirmed")

        if (!dbError && reservations) {
          reservations.forEach((reservation) => {
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
      // Continua mesmo se houver erro no Supabase
    }

    // Debug: verificar especificamente o dia 26
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1
    const day26Key = `${currentYear}-${String(currentMonth).padStart(2, '0')}-26`
    
    console.log(`[DEBUG] Status do dia 26 (${day26Key}):`, {
      isBooked: bookedDates[day26Key] === "booked",
      status: bookedDates[day26Key] || "available",
      totalBookedDates: Object.keys(bookedDates).length,
      sampleBookedDates: Object.keys(bookedDates).slice(0, 10),
    })

    return NextResponse.json({
      success: true,
      availability: bookedDates,
      lastUpdated: new Date().toISOString(),
      eventsCount: allEvents.length,
      sources: {
        airbnb: airbnbEvents.length,
        booking: bookingEvents.length,
      },
      // Informações de debug para monitoramento
      syncInfo: {
        airbnb: {
          events: airbnbEvents.length,
          url: airbnbUrl,
        },
        booking: {
          events: bookingEvents.length,
          url: bookingUrl,
        },
      },
      // Debug info para o dia 26
      debug: {
        day26Status: bookedDates[day26Key] || "available",
        day26Key,
      },
    })
  } catch (error) {
    console.error("Erro ao processar iCal:", error)

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
