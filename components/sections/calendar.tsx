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
  ShoppingCart,
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

interface CalendarDay {
  day: number | null
  date: Date | null
  isCurrentMonth: boolean
}

// Constantes
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

// Componente de calendário
function CalendarWidget({ onUpdate }: { onUpdate?: (date: Date) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookedDatesList, setBookedDatesList] = useState<Set<string>>(new Set())
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  // Buscar disponibilidade quando componente montar e quando mudar de mês
  useEffect(() => {
    fetchAvailability()
  }, [currentDate])

  const fetchAvailability = async () => {
    setLoadingAvailability(true)
    try {
      const response = await fetch('/api/availability', {
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

  // Normalizar data para string YYYY-MM-DD
  const normalizeDate = (date: Date): string => {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    const year = normalized.getFullYear()
    const month = String(normalized.getMonth() + 1).padStart(2, '0')
    const day = String(normalized.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Verificar se data está no passado
  const isPastDate = (date: Date): boolean => {
    const dateStr = normalizeDate(date)
    const today = normalizeDate(new Date())
    return dateStr < today
  }

  // Verificar se data está reservada
  const isBooked = (date: Date | null): boolean => {
    if (!date) return false
    return bookedDatesList.has(normalizeDate(date))
  }

  // Obter dias do calendário (memoizado para performance)
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: CalendarDay[] = []
    
    // Dias do mês anterior
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      const dayDate = new Date(year, month - 1, day)
      days.push({
        day,
        date: dayDate,
        isCurrentMonth: false
      })
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day)
      days.push({
        day,
        date: dayDate,
        isCurrentMonth: true
      })
    }
    
    // Completar até 42 dias (6 semanas)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const dayDate = new Date(year, month + 1, day)
      days.push({
        day,
        date: dayDate,
        isCurrentMonth: false
      })
    }
    
    return days
  }, [currentDate])

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(monthIndex)
    setCurrentDate(newDate)
  }

  const handleYearChange = (year: number) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(year)
    setCurrentDate(newDate)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  // Gerar anos disponíveis
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = 0; i <= 2; i++) {
      years.push(currentYear + i)
    }
    return years
  }, [])

  const isToday = (date: Date | null): boolean => {
    if (!date) return false
    return normalizeDate(date) === normalizeDate(new Date())
  }

  // Obter classes CSS para cada dia
  const getDayClasses = (calendarDay: CalendarDay, isPast: boolean, isBookedDate: boolean, isTodayDate: boolean) => {
    const baseClasses = "text-xs rounded flex items-center justify-center transition-all duration-200 font-medium relative min-h-[36px] sm:min-h-[40px]"
    
    if (!calendarDay.isCurrentMonth) {
      return `${baseClasses} opacity-30 text-moss-400`
    }
    
    if (isPast) {
      return `${baseClasses} bg-gray-100 text-gray-400`
    }
    
    if (isBookedDate) {
      return `${baseClasses} bg-pink-200 text-pink-700 font-bold`
    }
    
    if (isTodayDate) {
      return `${baseClasses} bg-moss-200 text-moss-800 font-semibold ring-2 ring-moss-400`
    }
    
    return `${baseClasses} bg-moss-100 text-moss-700 font-semibold`
  }

  return (
    <Card className="bg-white shadow-lg border-moss-200">
      <CardContent className="p-6 sm:p-8">
        {/* Navegação de Mês/Ano */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigateMonth("prev")} 
            aria-label="Mês anterior"
            className="h-8 w-8 text-moss-700 hover:text-moss-900 hover:bg-moss-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-1.5 flex-1 justify-center items-center">
            <Select
              value={currentDate.getMonth().toString()}
              onValueChange={(value) => handleMonthChange(parseInt(value))}
            >
              <SelectTrigger className="w-[100px] sm:w-[120px] h-8 text-xs border-moss-200 bg-white text-moss-900">
                <SelectValue>
                  {MONTH_NAMES[currentDate.getMonth()]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white">
                {MONTH_NAMES.map((month, index) => (
                  <SelectItem key={index} value={index.toString()} className="bg-white hover:bg-moss-50 text-xs">
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentDate.getFullYear().toString()}
              onValueChange={(value) => handleYearChange(parseInt(value))}
            >
              <SelectTrigger className="w-[80px] sm:w-[90px] h-8 text-xs border-moss-200 bg-white text-moss-900">
                <SelectValue>{currentDate.getFullYear()}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white">
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="bg-white hover:bg-moss-50 text-xs">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigateMonth("next")} 
            aria-label="Próximo mês"
            className="h-8 w-8 text-moss-700 hover:text-moss-900 hover:bg-moss-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendário - Distribuído uniformemente */}
        <div className="px-4 sm:px-8">
          <div className="w-full max-w-md mx-auto">
            {/* Dias da Semana */}
            <div className="grid grid-cols-7 mb-2 gap-1">
              {WEEK_DAYS.map(d => (
                <div 
                  key={d} 
                  className="text-xs text-moss-600 font-semibold py-1 text-center"
                  aria-label={d}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid de Dias */}
            {loadingAvailability ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-moss-600 animate-pulse">Carregando disponibilidade...</div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((calendarDay, i) => {
                  if (!calendarDay.date) return <div key={i} className="aspect-square" />
                  
                  const { day, date } = calendarDay
                  const isPast = isPastDate(date)
                  const isBookedDate = isBooked(date)
                  const isTodayDate = isToday(date)
                  
                  return (
                    <div
                      key={i}
                      className={getDayClasses(calendarDay, isPast, isBookedDate, isTodayDate).replace('w-8 h-8', 'w-full aspect-square')}
                      aria-label={`${isBookedDate ? 'Reservado' : isPast ? 'Passado' : 'Disponível'} dia ${day} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`}
                    >
                      {day}
                      {/* Ícone X para datas ocupadas */}
                      {isBookedDate && !isPast && (
                        <X className="absolute top-0 right-0 h-2.5 w-2.5 text-pink-600 m-0.5" />
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

// Componente Sidebar
function Sidebar() {
  const whatsappNumber = "559294197052"
  const whatsappMessage = "Olá! Gostaria de fazer uma reserva no Anauê Jungle Chalés."

  const openWhatsApp = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-4">
      {/* Legenda */}
      <Card className="bg-white border-moss-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-moss-900 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-moss-600" />
            Legenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-moss-100 border border-moss-200"></div>
            <span className="text-xs text-moss-700">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-pink-200 border border-pink-300 relative">
              <X className="absolute top-0 right-0 h-2 w-2 text-pink-600 m-0.5" />
            </div>
            <span className="text-xs text-moss-700">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
            <span className="text-xs text-moss-700">Data passada</span>
          </div>
        </CardContent>
      </Card>

      {/* Aviso Especial */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-orange-900 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <CalendarIcon className="h-4 w-4 text-orange-600" />
            Período Especial - 24 e 31 de Dezembro
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-orange-800">
            Os valores para este período estão disponíveis somente via WhatsApp.
          </p>
        </CardContent>
      </Card>

      {/* Seção Reserva */}
      <Card className="bg-white border-moss-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-moss-900">
            Pronto para reservar?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <p className="text-xs text-moss-600">
            Selecione as datas no calendário e faça sua reserva online
          </p>
          
          <div className="space-y-2">
            <Button 
              className="w-full bg-moss-600 hover:bg-moss-700 text-white text-sm h-10 font-semibold" 
              asChild
            >
              <Link href="/checkout" className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Reservar Online
              </Link>
            </Button>
            
            <Button 
              className="w-full bg-green-700 hover:bg-green-800 text-white text-sm h-10 font-semibold" 
              onClick={openWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Falar no WhatsApp
            </Button>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-moss-200">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs text-moss-600">Resposta rápida garantida</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function Calendar() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Formatar data/hora de atualização
  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return ""
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`
  }

  const handleUpdate = (date: Date) => {
    setLastUpdated(date)
  }

  return (
    <section id="calendario" className="py-16 sm:py-20 bg-gradient-to-br from-moss-50 to-beige-50 texture-dots relative">
      <div className="container mx-auto px-4">
        {/* Header da Seção */}
        <div className="text-center mb-8 sm:mb-10">
          <Badge className="mb-3 bg-moss-100 text-moss-800 hover:bg-moss-200 text-xs sm:text-sm px-3 py-1 flex items-center gap-1.5 w-fit mx-auto">
            <CalendarIcon className="h-3 w-3" />
            Disponibilidade
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-moss-900 mb-3">
            Verifique Nossa Disponibilidade
          </h2>
          <p className="text-base sm:text-lg text-moss-700 max-w-2xl mx-auto mb-3">
            Selecione as datas desejadas no calendário e finalize sua reserva online
          </p>
          {lastUpdated && (
            <div className="flex items-center justify-center gap-2 text-xs text-moss-600">
              <RefreshCw className="h-3 w-3" />
              <span>Atualizado: {formatLastUpdated(lastUpdated)}</span>
            </div>
          )}
        </div>

        {/* Layout de Duas Colunas */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Calendário - Coluna Esquerda (2/3) */}
          <div className="lg:col-span-2">
            <CalendarWidget onUpdate={handleUpdate} />
          </div>

          {/* Sidebar - Coluna Direita (1/3) */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </section>
  )
}
