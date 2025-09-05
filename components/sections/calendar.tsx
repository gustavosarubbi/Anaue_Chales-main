"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon, Check, X, RefreshCw, MessageCircle } from "lucide-react"

interface AvailabilityResponse {
  success: boolean
  availability: Record<string, string>
  lastUpdated: string
  eventsCount: number
  error?: string
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailability] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [error, setError] = useState<string>("")

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/availability")
      const data: AvailabilityResponse = await response.json()

      if (data.success) {
        setAvailability(data.availability)
        setLastUpdated(data.lastUpdated)
      } else {
        setError(data.error || "Erro ao carregar disponibilidade")
      }
    } catch (err) {
      setError("Erro de conexão")
      console.error("Erro ao buscar disponibilidade:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Dias vazios do início do mês
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getDateStatus = (dateStr: string) => {
    return availability[dateStr] || "available"
  }


  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }


  const days = getDaysInMonth(currentDate)

  return (
    <section id="calendario" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">📅 Disponibilidade</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4">Verifique Nossa Disponibilidade</h2>
          <p className="text-lg text-moss-700 max-w-2xl mx-auto">
            Selecione as datas desejadas e faça sua reserva diretamente pelo WhatsApp
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            {loading && (
              <div className="flex items-center gap-2 text-moss-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando disponibilidade...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <X className="h-4 w-4" />
                <span className="text-sm">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchAvailability}
                  className="text-red-600 hover:text-red-700"
                >
                  Tentar novamente
                </Button>
              </div>
            )}
            {lastUpdated && !loading && !error && (
              <div className="flex items-center gap-2 text-moss-600">
                <Check className="h-4 w-4" />
                <span className="text-sm">Atualizado: {new Date(lastUpdated).toLocaleString("pt-BR")}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchAvailability}
                  className="text-moss-600 hover:text-moss-700"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <Card className="bg-gradient-to-br from-moss-50 to-beige-50 border-moss-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth("prev")}
                    className="hover:bg-moss-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-moss-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth("next")}
                    className="hover:bg-moss-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Week days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-moss-600 p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="p-2"></div>
                    }

                    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const status = getDateStatus(dateStr)
                    const isToday =
                      new Date().toDateString() ===
                      new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

                    return (
                      <div
                        key={dateStr}
                        className={`
                          p-2 text-sm rounded-lg transition-all duration-200 relative
                          ${status === "available" ? "bg-green-100 text-green-800 border border-green-200" : ""}
                          ${status === "booked" ? "bg-red-100 text-red-400" : ""}
                          ${loading ? "opacity-50" : ""}
                        `}
                      >
                        {day}
                        {status === "booked" && <X className="h-3 w-3 absolute top-0 right-0 text-red-400" />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Legend and Reservation */}
            <div className="space-y-6">
              {/* Legend */}
              <Card className="bg-white border-moss-200">
                <CardHeader>
                  <CardTitle className="text-moss-900 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Legenda
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 border border-green-200 rounded"></div>
                    <span className="text-moss-700">Disponível</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded relative">
                      <X className="h-3 w-3 absolute top-0 right-0 text-red-400" />
                    </div>
                    <span className="text-moss-700">Ocupado</span>
                  </div>
                </CardContent>
              </Card>


              {/* Quick Actions */}
              <Card className="bg-white border-moss-200 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-moss-900 mb-2">Pronto para reservar?</h3>
                    <p className="text-moss-600 text-sm">Entre em contato conosco pelo WhatsApp e garante sua vaga!</p>
                  </div>
                  
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg"
                    asChild
                  >
                    <a
                      href="https://wa.me/559294197052"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="mr-3 h-6 w-6" />
                      Faça sua reserva agora
                    </a>
                  </Button>
                  
                  <p className="text-xs text-moss-500 mt-4">
                    ✨ Resposta rápida garantida
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
