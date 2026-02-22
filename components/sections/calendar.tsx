"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RefreshCw,
  X,
  MessageCircle,
  Star,
  AlertCircle
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { motion } from "framer-motion"

interface CalendarDay {
  day: number | null
  date: Date | null
  isCurrentMonth: boolean
}

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function CalendarWidget({
  onUpdate,
  chaletId = 'chale-anaue'
}: {
  onUpdate?: (date: Date) => void,
  chaletId?: string
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookedDatesList, setBookedDatesList] = useState<Set<string>>(new Set())
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  useEffect(() => {
    fetchAvailability()
  }, [currentDate, chaletId])

  const fetchAvailability = async () => {
    setLoadingAvailability(true)
    try {
      const response = await fetch(`/api/availability?chaletId=${chaletId}`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.availability) {
          const datesSet = new Set<string>(Object.keys(data.availability))
          setBookedDatesList(datesSet)
          const updateTime = new Date()
          onUpdate?.(updateTime)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error)
    } finally {
      setLoadingAvailability(false)
    }
  }

  const normalizeDate = (date: Date): string => {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    const year = normalized.getFullYear()
    const month = String(normalized.getMonth() + 1).padStart(2, '0')
    const day = String(normalized.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isPastDate = (date: Date): boolean => {
    const dateStr = normalizeDate(date)
    const today = normalizeDate(new Date())
    return dateStr < today
  }

  // Janela de 3 meses: início do mês atual e último dia do 3.º mês
  const { minViewDate, maxViewDate, availableMonthsInWindow, availableYearsInWindow } = useMemo(() => {
    const today = new Date()
    const min = new Date(today.getFullYear(), today.getMonth(), 1)
    const max = new Date(today.getFullYear(), today.getMonth() + 3, 0)
    const months: { month: number; year: number }[] = []
    for (let i = 0; i < 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
      months.push({ month: d.getMonth(), year: d.getFullYear() })
    }
    const years = Array.from(new Set(months.map((m) => m.year))).sort((a, b) => a - b)
    return {
      minViewDate: min,
      maxViewDate: max,
      availableMonthsInWindow: months,
      availableYearsInWindow: years,
    }
  }, [])

  const isAfterMaxViewDate = (date: Date): boolean => {
    const dateStr = normalizeDate(date)
    const maxStr = normalizeDate(maxViewDate)
    return dateStr > maxStr
  }

  const isBooked = (date: Date | null): boolean => {
    if (!date) return false
    return bookedDatesList.has(normalizeDate(date))
  }

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: CalendarDay[] = []

    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      const dayDate = new Date(year, month - 1, day)
      days.push({ day, date: dayDate, isCurrentMonth: false })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day)
      days.push({ day, date: dayDate, isCurrentMonth: true })
    }

    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const dayDate = new Date(year, month + 1, day)
      days.push({ day, date: dayDate, isCurrentMonth: false })
    }

    return days
  }, [currentDate])

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(currentDate.getFullYear())
    newDate.setMonth(monthIndex)
    setCurrentDate(newDate)
  }

  const handleYearChange = (year: number) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(year)
    const monthsInYear = availableMonthsInWindow.filter((m) => m.year === year)
    if (monthsInYear.length && !monthsInYear.some((m) => m.month === newDate.getMonth())) {
      newDate.setMonth(monthsInYear[0].month)
    }
    setCurrentDate(newDate)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const canGoPrev = currentDate.getFullYear() > minViewDate.getFullYear() ||
    (currentDate.getFullYear() === minViewDate.getFullYear() && currentDate.getMonth() > minViewDate.getMonth())
  const canGoNext = currentDate.getFullYear() < maxViewDate.getFullYear() ||
    (currentDate.getFullYear() === maxViewDate.getFullYear() && currentDate.getMonth() < maxViewDate.getMonth())

  const monthsForCurrentYear = useMemo(() =>
    availableMonthsInWindow.filter((m) => m.year === currentDate.getFullYear()),
    [availableMonthsInWindow, currentDate.getFullYear()]
  )

  // Manter currentDate dentro da janela ao montar
  useEffect(() => {
    setCurrentDate((prev) => {
      const now = new Date()
      const min = new Date(now.getFullYear(), now.getMonth(), 1)
      const max = new Date(now.getFullYear(), now.getMonth() + 3, 0)
      const y = prev.getFullYear()
      const m = prev.getMonth()
      if (y < min.getFullYear() || (y === min.getFullYear() && m < min.getMonth())) {
        return new Date(min.getFullYear(), min.getMonth(), 1)
      }
      if (y > max.getFullYear() || (y === max.getFullYear() && m > max.getMonth())) {
        return new Date(max.getFullYear(), max.getMonth(), 1)
      }
      return prev
    })
  }, [])

  const isToday = (date: Date | null): boolean => {
    if (!date) return false
    return normalizeDate(date) === normalizeDate(new Date())
  }

  const getDayClasses = (calendarDay: CalendarDay, isPast: boolean, isAfterMax: boolean, isBookedDate: boolean, isTodayDate: boolean) => {
    const baseClasses = "text-xs sm:text-sm rounded-lg flex items-center justify-center transition-all duration-200 font-medium relative min-h-[36px] sm:min-h-[40px] md:min-h-[44px]"

    if (!calendarDay.isCurrentMonth) return `${baseClasses} opacity-20 text-moss-900`
    if (isPast || isAfterMax) return `${baseClasses} bg-gray-50 text-gray-400 cursor-not-allowed`
    if (isBookedDate) return `${baseClasses} bg-red-100 text-red-700 font-bold shadow-sm`
    if (isTodayDate) return `${baseClasses} bg-moss-200 text-moss-900 font-bold ring-2 ring-moss-500 shadow-md transform scale-105 z-10`

    return `${baseClasses} bg-white text-moss-700 hover:bg-moss-50 hover:shadow-md hover:-translate-y-0.5 border border-transparent hover:border-moss-200 cursor-pointer`
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl border-white/20 w-full mx-auto">
      <CardContent className="p-2.5 sm:p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-1.5 sm:gap-2 md:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => canGoPrev && navigateMonth("prev")}
            disabled={!canGoPrev}
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0 border-moss-200 text-moss-700 hover:bg-moss-50 rounded-full disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>

          <div className="flex gap-1 sm:gap-1.5 md:gap-2 flex-1 justify-center items-center min-w-0">
            <Select
              value={currentDate.getMonth().toString()}
              onValueChange={(value) => handleMonthChange(parseInt(value))}
            >
              <SelectTrigger className="w-full max-w-[100px] sm:max-w-[120px] md:max-w-[130px] h-8 sm:h-9 text-[11px] sm:text-xs md:text-sm font-heading font-bold border-moss-200 bg-white/50 text-moss-900 rounded-lg flex-shrink-1">
                <SelectValue className="truncate">{MONTH_NAMES[currentDate.getMonth()]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white">
                {monthsForCurrentYear.map(({ month }) => (
                  <SelectItem key={month} value={month.toString()} className="font-sans">{MONTH_NAMES[month]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentDate.getFullYear().toString()}
              onValueChange={(value) => handleYearChange(parseInt(value))}
            >
              <SelectTrigger className="w-full max-w-[70px] sm:max-w-[80px] md:max-w-[90px] h-8 sm:h-9 text-[11px] sm:text-xs md:text-sm font-heading font-bold border-moss-200 bg-white/50 text-moss-900 rounded-lg flex-shrink-1">
                <SelectValue>{currentDate.getFullYear()}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white">
                {availableYearsInWindow.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="font-sans">{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => canGoNext && navigateMonth("next")}
            disabled={!canGoNext}
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0 border-moss-200 text-moss-700 hover:bg-moss-50 rounded-full disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="w-full">
          <div className="w-full">
            <div className="grid grid-cols-7 mb-2 sm:mb-3 md:mb-4 gap-0.5 sm:gap-1 md:gap-2 w-full">
              {WEEK_DAYS.map(d => (
                <div key={d} className="text-[10px] sm:text-xs text-moss-500 font-bold uppercase tracking-wider text-center py-1 truncate min-w-0">
                  {d}
                </div>
              ))}
            </div>

            {loadingAvailability ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="h-6 w-6 text-moss-600 animate-spin" />
                  <span className="text-sm text-moss-600 font-medium">Atualizando calendário...</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 w-full">
                {calendarDays.map((calendarDay, i) => {
                  if (!calendarDay.date) return <div key={i} className="aspect-square min-w-0 w-full" />

                  const { day, date } = calendarDay
                  const isPast = isPastDate(date)
                  const isAfterMax = isAfterMaxViewDate(date)
                  const isBookedDate = isBooked(date)
                  const isTodayDate = isToday(date)

                  return (
                    <div
                      key={i}
                      className={`${getDayClasses(calendarDay, isPast, isAfterMax, isBookedDate, isTodayDate).replace('w-8 h-8', 'w-full aspect-square')} min-w-0 max-w-full`}
                    >
                      <span className="text-[11px] sm:text-xs md:text-sm">{day}</span>
                      {isBookedDate && !isPast && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-100/50 rounded-lg">
                          <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Sidebar({ chaletId }: { chaletId: string }) {
  const whatsappNumber = "559294197052"
  const chaletName = chaletId === 'chale-2' ? 'Camping Luxo' : 'Chalé Master'
  const whatsappMessage = `Olá! Tenho uma dúvida sobre a disponibilidade do ${chaletName}.`

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-moss-100 shadow-xl overflow-hidden sticky top-24">
      <CardHeader className="bg-moss-50/50 border-b border-moss-100 pb-3 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="text-sm sm:text-base font-heading font-bold text-moss-900 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-moss-600" />
          Legenda & Reservas
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-moss-50/50">
            <div className="w-3 h-3 rounded-full bg-white border border-moss-200"></div>
            <span className="text-sm text-moss-700 font-medium">Disponível</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50/50">
            <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200 flex items-center justify-center">
              <X className="h-2 w-2 text-red-600" />
            </div>
            <span className="text-sm text-moss-700 font-medium">Ocupado</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50 col-span-2">
            <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></div>
            <span className="text-sm text-moss-500 font-medium">Data passada</span>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3">
          <div className="mt-0.5">
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-900 mb-1">Carnaval 2026</p>
            <p className="text-xs text-orange-800/90 leading-snug">
              Tarifas especiais aplicadas automaticamente no checkout.
            </p>
          </div>
        </div>

        <div className="h-px bg-moss-100 w-full" />

        <div className="space-y-4">
          <div className="text-center">
            <h4 className="font-heading font-bold text-moss-900 mb-1">Pronto para reservar?</h4>
            <p className="text-xs text-moss-600 mb-4">Reserve o {chaletName} agora.</p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full bg-moss-900 hover:bg-moss-800 text-white h-11 shadow-lg transition-all hover:scale-[1.02]"
              asChild
            >
              <Link href={`/checkout?chalet=${chaletId}`} className="flex items-center justify-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Reservar Online
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent border-green-600 text-green-700 hover:bg-green-50 h-11"
              onClick={() => {
                const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
                window.open(url, "_blank")
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Tirar Dúvidas
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-moss-500">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            Resposta rápida garantida
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Calendar() {
  const [selectedChalet, setSelectedChalet] = useState('chale-anaue')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return ""
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} às ${hours}:${minutes}`
  }

  const handleUpdate = (date: Date) => {
    setLastUpdated(date)
  }

  return (
    <section id="calendario" className="py-12 sm:py-16 md:py-24 bg-stone-50 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-moss-50/50 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200 border-none px-4 py-1.5 text-sm font-medium rounded-full">
            🗓️ Disponibilidade
          </Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-moss-900 mb-6 tracking-tight">
            Planeje Sua Estadia
          </h2>
          <p className="text-lg text-moss-600 font-light max-w-2xl mx-auto leading-relaxed mb-10">
            Verifique as das disponíveis em tempo real e garanta sua reserva de forma simples e segura.
          </p>

          <div className="flex justify-center mb-4 px-2">
            <div className="inline-flex p-1 bg-moss-100/50 rounded-2xl border border-moss-100 shadow-inner w-full max-w-fit">
              <button
                onClick={() => setSelectedChalet('chale-anaue')}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedChalet === 'chale-anaue'
                    ? 'bg-white text-moss-900 shadow-md'
                    : 'text-moss-600 hover:text-moss-800'
                  }`}
              >
                Chalé Master
              </button>
              <button
                onClick={() => setSelectedChalet('chale-2')}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedChalet === 'chale-2'
                    ? 'bg-white text-moss-900 shadow-md'
                    : 'text-moss-600 hover:text-moss-800'
                  }`}
              >
                Camping Luxo
              </button>
            </div>
          </div>

          {lastUpdated && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-moss-100 shadow-sm text-xs font-medium text-moss-500">
              <RefreshCw className="h-3 w-3" />
              <span>Atualizado para {selectedChalet === 'chale-2' ? 'Camping Luxo' : 'Chalé Master'} às {formatLastUpdated(lastUpdated).split('às')[1]}</span>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-12 max-w-6xl mx-auto">
          <motion.div
            key={selectedChalet}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 min-w-0"
          >
            <CalendarWidget onUpdate={handleUpdate} chaletId={selectedChalet} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 min-w-0"
          >
            <Sidebar chaletId={selectedChalet} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
