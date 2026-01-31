"use client"

import React, { useMemo } from "react"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, isToday } from "date-fns"
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

    if (checkIn && isSameDay(date, checkIn)) return 'check-in'
    if (checkOut && isSameDay(date, checkOut)) return 'check-out'

    // Se houver check-in selecionado, verificar se este dia pode ser check-out
    // (mesmo que ocupado, se houver no máximo 1 dia ocupado consecutivo antes dele)
    if (checkIn && !checkOut && date > checkIn) {
      const dateStr = formatDateKey(date)
      const normalizedDate = new Date(date)
      normalizedDate.setHours(0, 0, 0, 0)

      // Verificar se é o dia seguinte ao check-in
      const nextDay = new Date(checkIn)
      nextDay.setDate(nextDay.getDate() + 1)
      const isNextDay = isSameDay(date, nextDay)

      // Se for o dia seguinte e estiver ocupado, mostrar como disponível
      if (isNextDay && availability[dateStr]) {
        return 'available'
      }

      // Para outros dias, verificar se há no máximo 1 dia ocupado consecutivo antes
      let current = new Date(checkIn)
      current.setDate(current.getDate() + 1)

      let consecutiveOccupied = 0
      let maxConsecutiveOccupied = 0
      let hasOccupiedDays = false

      while (current < normalizedDate) {
        const checkDateStr = formatDateKey(current)
        if (availability[checkDateStr]) {
          hasOccupiedDays = true
          consecutiveOccupied++
          maxConsecutiveOccupied = Math.max(maxConsecutiveOccupied, consecutiveOccupied)
        } else {
          consecutiveOccupied = 0
        }
        current.setDate(current.getDate() + 1)
      }

      // Se está ocupado mas há no máximo 1 dia ocupado consecutivo antes, mostrar como disponível
      if (availability[dateStr] && (!hasOccupiedDays || maxConsecutiveOccupied <= 1)) {
        return 'available'
      }
    }

    if (availability[dateStr]) return 'occupied'
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
      <div className="w-full space-y-4 p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 42 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "w-full max-w-xl mx-auto",
      "p-3 sm:p-6",
      "bg-white rounded-lg",
      "border border-moss-200",
      "shadow-lg"
    )}>
      {/* O container da imagem é mais simples, o mês e as setas são geralmente um componente pai.
          Mantivemos aqui apenas o grid de dias conforme solicitado pela refatoração. */}

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-4">
        {WEEKDAYS.map((day, index) => (
          <div
            key={index}
            className={cn(
              "text-center text-moss-600 font-medium",
              "text-xs",
              "flex items-center justify-center",
              "py-2"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, month)
          const status = getDayStatus(date)

          if (!isCurrentMonth) {
            return (
              <div
                key={index}
                className="w-full aspect-square opacity-0 pointer-events-none"
                aria-hidden="true"
              />
            )
          }

          const normalizedDate = new Date(date)
          normalizedDate.setHours(0, 0, 0, 0)
          const isPastDate = normalizedDate < today

          // Verificar se este dia pode ser clicado mesmo ocupado
          // (se for o dia seguinte ao check-in OU se houver no máximo 1 dia ocupado consecutivo antes)
          let canClickWhenOccupied = false
          if (checkIn && !checkOut && date > checkIn) {
            const normalizedDate = new Date(date)
            normalizedDate.setHours(0, 0, 0, 0)

            // Verificar se é o dia seguinte ao check-in
            const nextDay = new Date(checkIn)
            nextDay.setDate(nextDay.getDate() + 1)
            const isNextDay = isSameDay(date, nextDay)

            if (isNextDay) {
              canClickWhenOccupied = true
            } else {
              // Verificar se há no máximo 1 dia ocupado consecutivo antes deste dia
              let current = new Date(checkIn)
              current.setDate(current.getDate() + 1)

              let consecutiveOccupied = 0
              let maxConsecutiveOccupied = 0
              let hasOccupiedDays = false

              while (current < normalizedDate) {
                const checkDateStr = formatDateKey(current)
                if (availability[checkDateStr]) {
                  hasOccupiedDays = true
                  consecutiveOccupied++
                  maxConsecutiveOccupied = Math.max(maxConsecutiveOccupied, consecutiveOccupied)
                } else {
                  consecutiveOccupied = 0
                }
                current.setDate(current.getDate() + 1)
              }

              // Permitir clique se houver no máximo 1 dia ocupado consecutivo
              if (!hasOccupiedDays || maxConsecutiveOccupied <= 1) {
                canClickWhenOccupied = true
              }
            }
          }

          const dayData: CalendarDayData = {
            date,
            status,
            isPast: isPastDate && !isToday(date),
            isToday: isToday(date),
            isInRange: isInRange(date),
          }

          return (
            // A célula é um quadrado w-full, e o CalendarDay (botão) deve ter o styling do quadrado
            <div
              key={index}
              className="w-full aspect-square flex items-center justify-center relative"
            >
              <CalendarDay
                day={dayData}
                onClick={onDateClick}
                isSelected={isSelected(date)}
                isInRange={isInRange(date)}
                canClickWhenOccupied={canClickWhenOccupied}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}