"use client"

import React, { useMemo } from "react"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isSameMonth, isToday } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { cn } from "@/lib/utils"
import { CalendarDay } from "./CalendarDay"
import { CalendarMonthProps, CalendarDayData, DateStatus } from "./types"
import { Skeleton } from "@/components/ui/skeleton"

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function CalendarMonth({
  month,
  availability,
  checkIn,
  checkOut,
  onDateClick,
  minDate,
  maxDate,
  isLoading = false,
}: CalendarMonthProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [calendarStart, calendarEnd])

  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDayStatus = (date: Date): DateStatus => {
    const dateStr = formatDateKey(date)
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)

    if (minDate) {
      const normalizedMinDate = new Date(minDate)
      normalizedMinDate.setHours(0, 0, 0, 0)
      if (normalizedDate < normalizedMinDate) return 'disabled'
    } else if (normalizedDate < today) {
      return 'disabled'
    }

    if (maxDate) {
      const normalizedMaxDate = new Date(maxDate)
      normalizedMaxDate.setHours(0, 0, 0, 0)
      if (normalizedDate > normalizedMaxDate) return 'disabled'
    }

    if (availability[dateStr]) return 'occupied'
    if (checkIn && isSameDay(date, checkIn)) return 'check-in'
    if (checkOut && isSameDay(date, checkOut)) return 'check-out'
    if (checkIn && checkOut && date > checkIn && date < checkOut) return 'range'
    if (isToday(date)) return 'today'

    return 'available'
  }

  const isInRange = (date: Date): boolean => {
    if (!checkIn || !checkOut) return false
    return date > checkIn && date < checkOut
  }

  const isSelected = (date: Date): boolean => {
    if (checkIn && isSameDay(date, checkIn)) return true
    if (checkOut && isSameDay(date, checkOut)) return true
    return false
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-4 p-2 sm:p-4 lg:p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "w-full max-w-md mx-auto", // Limita a largura máxima para não esticar demais
      "p-4",
      "bg-white rounded-lg",
      "border border-moss-200",
      "shadow-sm hover:shadow-md",
      "transition-shadow duration-200"
    )}>
      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={index}
            className={cn(
              "text-center text-moss-600 font-medium",
              "text-xs uppercase tracking-wide", // Estilo mais limpo
              "flex items-center justify-center",
              "py-2"
            )}
          >
            {day.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-0.5"> 
        {days.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, month)
          const status = getDayStatus(date)
          const normalizedDate = new Date(date)
          normalizedDate.setHours(0, 0, 0, 0)
          const isPastDate = normalizedDate < today
          
          const dayData: CalendarDayData = {
            date,
            status,
            isPast: isPastDate && !isToday(date),
            isToday: isToday(date),
            isInRange: isInRange(date),
          }

          // Renderiza espaço vazio (transparente) se não for do mês atual
          // Mantendo a estrutura do grid (aspect-square) para alinhar perfeitamente
          if (!isCurrentMonth) {
            return (
              <div
                key={index}
                className="w-full aspect-square opacity-0 pointer-events-none"
                aria-hidden="true"
              />
            )
          }

          // Wrapper para garantir que o CalendarDay fique quadrado e preencha a célula
          return (
            <div key={index} className="w-full aspect-square flex items-center justify-center relative">
              <CalendarDay
                day={dayData}
                onClick={onDateClick}
                isSelected={isSelected(date)}
                isInRange={isInRange(date)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}