"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarSkeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, CalendarIcon, Check, X, RefreshCw, MessageCircle, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

interface AvailabilityResponse {
  success: boolean
  availability: Record<string, string>
  lastUpdated: string
  eventsCount: number
  error?: string
}

export function Calendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailability] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null)
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null)

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

  const handleDateClick = (dateStr: string, day: number) => {
    if (loading) return

    const status = getDateStatus(dateStr)
    if (status === "booked") return

    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (clickedDate < today) return

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Start new selection
      setSelectedCheckIn(clickedDate)
      setSelectedCheckOut(null)
    } else if (selectedCheckIn && !selectedCheckOut) {
      // Complete selection
      if (clickedDate <= selectedCheckIn) {
        // If clicked date is before or equal to check-in, make it the new check-in
        setSelectedCheckIn(clickedDate)
        setSelectedCheckOut(null)
      } else {
        // Check if all dates in range are available
        const datesInRange = getDatesInRange(selectedCheckIn, clickedDate)
        const allAvailable = datesInRange.every((date) => {
          const dateStr = formatDate(date.getFullYear(), date.getMonth(), date.getDate())
          return getDateStatus(dateStr) === "available"
        })

        if (allAvailable) {
          setSelectedCheckOut(clickedDate)
        } else {
          // Invalid range, reset
          setSelectedCheckIn(clickedDate)
          setSelectedCheckOut(null)
        }
      }
    }
  }

  const getDatesInRange = (start: Date, end: Date): Date[] => {
    const dates: Date[] = []
    const current = new Date(start)
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  const handleReserveClick = () => {
    if (selectedCheckIn && selectedCheckOut) {
      const checkInStr = formatDateForUrl(selectedCheckIn)
      const checkOutStr = formatDateForUrl(selectedCheckOut)
      router.push(`/checkout?check_in=${checkInStr}&check_out=${checkOutStr}`)
    }
  }

  const formatDateForUrl = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  const isDateInRange = (dateStr: string): boolean => {
    if (!selectedCheckIn || !selectedCheckOut) return false

    const date = new Date(dateStr)
    return date >= selectedCheckIn && date <= selectedCheckOut
  }

  const isCheckInDate = (dateStr: string): boolean => {
    if (!selectedCheckIn) return false
    return dateStr === formatDateForUrl(selectedCheckIn)
  }

  const isCheckOutDate = (dateStr: string): boolean => {
    if (!selectedCheckOut) return false
    return dateStr === formatDateForUrl(selectedCheckOut)
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
    <section id="calendario" className="py-20 bg-white texture-grid relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">📅 Disponibilidade</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4">Verifique Nossa Disponibilidade</h2>
          <p className="text-lg text-moss-700 max-w-2xl mx-auto">
            Selecione as datas desejadas no calendário e finalize sua reserva online
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
            <Card className="bg-gradient-to-br from-moss-50 to-beige-50 border-moss-200 animate-fadeInUp">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth("prev")}
                    className="hover:bg-moss-100"
                    disabled={loading}
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
                    disabled={loading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading && Object.keys(availability).length === 0 ? (
                  <CalendarSkeleton />
                ) : (
                  <>
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
                    const currentDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const isPastDate = currentDateObj < today
                    
                    const status = getDateStatus(dateStr)
                    const isToday =
                      new Date().toDateString() ===
                      new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
                    const inRange = isDateInRange(dateStr)
                    const isCheckIn = isCheckInDate(dateStr)
                    const isCheckOut = isCheckOutDate(dateStr)
                    const isSelectable = status === "available" && !loading && !isPastDate

                                    return (
                                      <button
                                        key={dateStr}
                                        type="button"
                                        onClick={() => handleDateClick(dateStr, day)}
                                        disabled={!isSelectable}
                                        className={`
                                          p-2 text-sm rounded-lg transition-all duration-300 relative
                                          min-h-[40px] min-w-[40px] flex items-center justify-center
                                          ${isPastDate
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                            : ""
                                          }
                                          ${status === "available" && !inRange && !isCheckIn && !isCheckOut && !isPastDate
                                            ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 hover:scale-110 hover:shadow-md cursor-pointer active:scale-95"
                                            : ""
                                          }
                                          ${status === "booked" && !isPastDate
                                            ? "bg-red-100 text-red-400 cursor-not-allowed opacity-60"
                                            : ""
                                          }
                                          ${inRange && !isCheckIn && !isCheckOut
                                            ? "bg-moss-200 text-moss-900 border border-moss-300 animate-scaleIn"
                                            : ""
                                          }
                                          ${isCheckIn || isCheckOut
                                            ? "bg-moss-600 text-white border-2 border-moss-700 font-bold shadow-lg animate-scaleIn"
                                            : ""
                                          }
                                          ${loading ? "opacity-50 cursor-not-allowed" : ""}
                                          ${isToday && !inRange && !isCheckIn && !isCheckOut ? "ring-2 ring-moss-400 ring-offset-2" : ""}
                                        `}
                                      >
                                        {day}
                                        {status === "booked" && <X className="h-3 w-3 absolute top-0 right-0 text-red-400" />}
                                        {isCheckIn && <span className="text-[10px] absolute top-0 left-0 p-0.5 bg-moss-700 rounded-br">In</span>}
                                        {isCheckOut && <span className="text-[10px] absolute top-0 left-0 p-0.5 bg-moss-700 rounded-br">Out</span>}
                                      </button>
                                    )
                  })}
                </div>
                  </>
                )}
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
                    <span className="text-moss-700 text-sm">Disponível</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded relative">
                      <X className="h-3 w-3 absolute top-0 right-0 text-red-400" />
                    </div>
                    <span className="text-moss-700 text-sm">Ocupado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded opacity-50"></div>
                    <span className="text-moss-700 text-sm">Data passada</span>
                  </div>
                </CardContent>
              </Card>


              {/* Observação especial para dezembro */}
              {(currentDate.getMonth() === 11) && (
                <Card className="bg-orange-50 border-orange-200 shadow-md mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <MessageCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-orange-900 text-sm mb-1">📅 Período Especial - 24 e 31 de Dezembro</p>
                        <p className="text-xs text-orange-800">
                          Os valores para este período estão disponíveis somente via <strong>WhatsApp</strong>.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-white border-moss-200 shadow-lg">
                <CardContent className="p-8 text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-moss-900 mb-2">Pronto para reservar?</h3>
                    {selectedCheckIn && selectedCheckOut ? (
                      <div className="mb-4 space-y-2">
                        <p className="text-sm text-moss-700">
                          Check-in: <strong>{selectedCheckIn.toLocaleDateString("pt-BR")}</strong>
                        </p>
                        <p className="text-sm text-moss-700">
                          Check-out: <strong>{selectedCheckOut.toLocaleDateString("pt-BR")}</strong>
                        </p>
                        <p className="text-xs text-moss-600">
                          Clique no botão abaixo para finalizar sua reserva
                        </p>
                      </div>
                    ) : (
                      <p className="text-moss-600 text-sm mb-4">
                        Selecione as datas no calendário e faça sua reserva online
                      </p>
                    )}
                  </div>

                  {selectedCheckIn && selectedCheckOut ? (
                    <>
                      <Button
                        onClick={handleReserveClick}
                        className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 ripple-container animate-scaleIn"
                      >
                        <ShoppingCart className="mr-3 h-6 w-6" />
                        Reservar Agora
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCheckIn(null)
                          setSelectedCheckOut(null)
                        }}
                        className="w-full min-h-[48px] active:scale-95 transition-all duration-200"
                      >
                        Limpar Seleção
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg mb-3 min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 ripple-container"
                        onClick={() => router.push("/checkout")}
                      >
                        <ShoppingCart className="mr-3 h-6 w-6" />
                        Reservar Online
                      </Button>
                      <Button
                        className="w-full bg-moss-600 hover:bg-moss-700 active:scale-95 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200"
                        asChild
                      >
                        <a
                          href="https://wa.me/559294197052"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle className="mr-3 h-6 w-6" />
                          Falar no WhatsApp
                        </a>
                      </Button>
                    </>
                  )}
                  
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
