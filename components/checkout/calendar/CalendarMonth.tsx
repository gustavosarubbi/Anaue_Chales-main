"use client"

import React, { useMemo } from "react"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, isToday, format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { cn } from "@/lib/utils"
import { CalendarDay } from "./CalendarDay"
import { CalendarMonthProps, CalendarDayData, DateStatus } from "./types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function CalendarMonth({
  month,
  availability,
  checkIn,
  checkOut,
  hoverDate,
  onDateClick,
  onHoverDate,
  minDate,
  maxDate,
  isLoading = false,
  onPreviousMonth,
  onNextMonth,
  canGoPrevious,
  canGoNext
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

    if (checkIn && !checkOut && date > checkIn) {
      const dateStr = formatDateKey(date)
      const normalizedDate = new Date(date)
      normalizedDate.setHours(0, 0, 0, 0)

      const nextDay = new Date(checkIn)
      nextDay.setDate(nextDay.getDate() + 1)
      const isNextDay = isSameDay(date, nextDay)

      if (isNextDay && availability[dateStr]) {
        return 'available'
      }

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
      "w-full max-w-md mx-auto",
      "p-4 sm:p-8",
      "bg-white rounded-3xl sm:rounded-[2.5rem]",
      "border border-moss-100/50",
      "shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
    )}>
      {/* Header com Navegação e Título */}
      <div className="relative mb-6 flex items-center justify-center">
        {onPreviousMonth && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            disabled={!canGoPrevious}
            className={cn(
              "absolute left-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full",
              "bg-white border border-moss-100 shadow-sm",
              "hover:bg-moss-50 hover:text-moss-600",
              "disabled:opacity-0 transition-all duration-300"
            )}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}

        <h3 className="text-lg font-bold text-moss-900 capitalize font-heading z-10">
          {format(month, "MMMM yyyy", { locale: ptBR })}
        </h3>

        {onNextMonth && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            disabled={!canGoNext}
            className={cn(
              "absolute right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full",
              "bg-white border border-moss-100 shadow-sm",
              "hover:bg-moss-50 hover:text-moss-600",
              "disabled:opacity-0 transition-all duration-300"
            )}
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-4">
        {WEEKDAYS.map((day, index) => (
          <div
            key={index}
            className={cn(
              "text-center text-moss-400 font-bold",
              "text-[10px] sm:text-[11px] uppercase tracking-tighter",
              "flex items-center justify-center",
              "py-3"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, month)
          const status = getDayStatus(date)

          if (!isCurrentMonth) {
            return (
              <div
                key={index}
                className="w-full aspect-square flex items-center justify-center opacity-0 pointer-events-none"
                aria-hidden="true"
              />
            )
          }

          const normalizedDate = new Date(date)
          normalizedDate.setHours(0, 0, 0, 0)
          const isPastDate = normalizedDate < today

          let canClickWhenOccupied = false
          if (checkIn && !checkOut && date > checkIn) {
            const nextDay = new Date(checkIn)
            nextDay.setDate(nextDay.getDate() + 1)
            const isNextDay = isSameDay(date, nextDay)

            if (isNextDay) {
              canClickWhenOccupied = true
            } else {
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

              if (!hasOccupiedDays || maxConsecutiveOccupied <= 1) {
                canClickWhenOccupied = true
              }
            }
          }

          const isHoverRange = Boolean(
            checkIn && !checkOut && hoverDate &&
            date > (checkIn < hoverDate ? checkIn : hoverDate) &&
            date < (checkIn < hoverDate ? hoverDate : checkIn)
          )

          const dayData: CalendarDayData = {
            date,
            status,
            isPast: isPastDate && !isToday(date),
            isToday: isToday(date),
            isInRange: isInRange(date),
          }

          return (
            <div
              key={index}
              className="w-full aspect-square flex items-center justify-center relative"
            >
              <CalendarDay
                day={dayData}
                onClick={onDateClick}
                onHover={onHoverDate}
                isSelected={isSelected(date)}
                isInRange={isInRange(date)}
                isHoverRange={isHoverRange}
                hoverDate={hoverDate}
                canClickWhenOccupied={canClickWhenOccupied}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}