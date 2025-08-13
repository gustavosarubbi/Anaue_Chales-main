import { NextResponse } from "next/server"

interface CalendarEvent {
  start: Date
  end: Date
  summary: string
  source: string
}

function parseICalData(icalData: string, source: string): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const lines = icalData.split("\n")

  let currentEvent: Partial<CalendarEvent> = {}
  let inEvent = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine === "BEGIN:VEVENT") {
      inEvent = true
      currentEvent = { source }
    } else if (trimmedLine === "END:VEVENT" && inEvent) {
      if (currentEvent.start && currentEvent.end) {
        events.push(currentEvent as CalendarEvent)
      }
      inEvent = false
    } else if (inEvent) {
      if (trimmedLine.startsWith("DTSTART")) {
        const dateStr = trimmedLine.split(":")[1]
        currentEvent.start = parseICalDate(dateStr)
      } else if (trimmedLine.startsWith("DTEND")) {
        const dateStr = trimmedLine.split(":")[1]
        currentEvent.end = parseICalDate(dateStr)
      } else if (trimmedLine.startsWith("SUMMARY")) {
        currentEvent.summary = trimmedLine.split(":")[1] || "Reserva"
      }
    }
  }

  return events
}

function parseICalDate(dateStr: string): Date {
  const cleanDateStr = dateStr.replace(/[TZ]/g, "").substring(0, 8)

  const year = Number.parseInt(cleanDateStr.substring(0, 4))
  const month = Number.parseInt(cleanDateStr.substring(4, 6)) - 1
  const day = Number.parseInt(cleanDateStr.substring(6, 8))

  return new Date(year, month, day)
}

function getDatesBetween(startDate: Date, endDate: Date): string[] {
  const dates: string[] = []
  const currentDate = new Date(startDate)

  const adjustedEndDate = new Date(endDate)
  adjustedEndDate.setDate(adjustedEndDate.getDate() - 1)

  while (currentDate <= adjustedEndDate) {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const day = String(currentDate.getDate()).padStart(2, "0")
    dates.push(`${year}-${month}-${day}`)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

async function fetchICalData(url: string, source: string): Promise<CalendarEvent[]> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Calendar-Sync/1.0)",
      },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.warn(`Erro ao buscar iCal de ${source}: ${response.status}`)
      return []
    }

    const icalData = await response.text()
    return parseICalData(icalData, source)
  } catch (error) {
    console.error(`Erro ao processar iCal de ${source}:`, error)
    return []
  }
}

export async function GET() {
  try {
    const airbnbUrl =
      "https://www.airbnb.com.br/calendar/ical/1457198661856129067.ics?s=64254c8251f4f54cf8b4c3ae58363ea5"
    const bookingUrl = "https://ical.booking.com/v1/export?t=21d8cded-a6cf-4897-8f9a-dfccf043b796"

    const [airbnbEvents, bookingEvents] = await Promise.all([
      fetchICalData(airbnbUrl, "Airbnb"),
      fetchICalData(bookingUrl, "Booking.com"),
    ])

    const allEvents = [...airbnbEvents, ...bookingEvents]

    const bookedDates: Record<string, string> = {}

    allEvents.forEach((event) => {
      const dates = getDatesBetween(event.start, event.end)
      dates.forEach((date) => {
        bookedDates[date] = "booked"
      })
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
