"use client"

import React, { useState, useMemo, useCallback } from "react"
import { addMonths, subMonths, startOfMonth, isSameDay, format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { cn } from "@/lib/utils"
import { useAvailability } from "@/hooks/useAvailability"
import { CalendarMonth } from "./CalendarMonth"
import { CalendarHeader } from "./CalendarHeader"
import { CalendarLegend } from "./CalendarLegend"
import { AvailabilityCalendarProps } from "./types"
import { Loader2 } from "lucide-react"

export function AvailabilityCalendar({
  checkIn,
  checkOut,
  onDatesChange,
  disabledDates = [],
  minDate = new Date(),
  maxDate,
  numberOfMonths = 1,
  chaletId = 'chale-anaue',
}: AvailabilityCalendarProps) {
  const { availability, isLoading } = useAvailability(chaletId)
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(minDate))

  // Calcular maxDate padrão (2 anos a partir de hoje)
  const defaultMaxDate = useMemo(() => {
    if (maxDate) return maxDate
    const date = new Date()
    date.setFullYear(date.getFullYear() + 2)
    return date
  }, [maxDate])

  // Calcular meses a exibir
  const monthsToDisplay = useMemo(() => {
    const months = []
    for (let i = 0; i < numberOfMonths; i++) {
      const month = addMonths(currentMonth, i)
      months.push(month)
    }
    return months
  }, [currentMonth, numberOfMonths])

  const handleDateClick = useCallback((date: Date) => {
    // Normalizar data para evitar problemas de timezone
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)

    // Verificar se a data está desabilitada
    if (disabledDates.some((d) => isSameDay(d, normalizedDate))) {
      return
    }

    // Verificar se é passado
    if (normalizedDate < minDate) {
      return
    }

    const dateStr = format(normalizedDate, "yyyy-MM-dd")

    // Lógica de seleção
    if (!checkIn || (checkIn && checkOut)) {
      // Se já tem check-in e check-out, e clicar no check-in novamente, deselecionar
      if (checkIn && checkOut && isSameDay(normalizedDate, checkIn)) {
        onDatesChange(undefined, undefined)
        return
      }
      // Se já tem check-in e check-out, e clicar no check-out novamente, deselecionar check-out
      if (checkIn && checkOut && isSameDay(normalizedDate, checkOut)) {
        onDatesChange(checkIn, undefined)
        return
      }
      // Nova seleção: definir check-in (só se não estiver ocupada)
      if (availability[dateStr]) {
        return
      }
      onDatesChange(normalizedDate, undefined)
    } else if (checkIn && !checkOut) {
      // Se clicar no mesmo dia do check-in, deselecionar
      if (isSameDay(normalizedDate, checkIn)) {
        onDatesChange(undefined, undefined)
        return
      }
      // Selecionar check-out
      if (normalizedDate <= checkIn) {
        // Se a data selecionada é antes ou igual ao check-in, definir novo check-in (só se não estiver ocupada)
        if (availability[dateStr]) {
          return
        }
        onDatesChange(normalizedDate, undefined)
      } else {
        // Calcular o dia seguinte ao check-in
        const nextDay = new Date(checkIn)
        nextDay.setDate(nextDay.getDate() + 1)
        const isNextDay = isSameDay(normalizedDate, nextDay)

        // Se for o dia seguinte ao check-in, permitir mesmo que esteja ocupado
        if (isNextDay) {
          onDatesChange(checkIn, normalizedDate)
          return
        }

        // Para outros dias, verificar se há no máximo 1 dia ocupado consecutivo
        let current = new Date(checkIn)
        current.setDate(current.getDate() + 1)

        let consecutiveOccupied = 0
        let maxConsecutiveOccupied = 0
        let hasOccupiedDays = false

        // Verificar apenas os dias entre check-in e check-out (excluindo o check-out)
        while (current < normalizedDate) {
          const checkDateStr = format(current, "yyyy-MM-dd")
          if (availability[checkDateStr]) {
            hasOccupiedDays = true
            consecutiveOccupied++
            maxConsecutiveOccupied = Math.max(maxConsecutiveOccupied, consecutiveOccupied)
          } else {
            consecutiveOccupied = 0
          }
          current.setDate(current.getDate() + 1)
        }

        // Permitir se não houver dias ocupados OU se houver no máximo 1 dia ocupado consecutivo
        if (!hasOccupiedDays || maxConsecutiveOccupied <= 1) {
          // Permitir check-out mesmo que o próprio dia esteja ocupado
          onDatesChange(checkIn, normalizedDate)
        } else {
          // Se há mais de 1 dia ocupado consecutivo, definir novo check-in (só se não estiver ocupada)
          if (availability[dateStr]) {
            return
          }
          onDatesChange(normalizedDate, undefined)
        }
      }
    }
  }, [checkIn, checkOut, onDatesChange, availability, disabledDates, minDate])

  const handlePreviousMonth = useCallback(() => {
    const newMonth = subMonths(currentMonth, 1)
    const minMonth = startOfMonth(minDate)
    if (newMonth >= minMonth) {
      setCurrentMonth(newMonth)
    }
  }, [currentMonth, minDate])

  const handleNextMonth = useCallback(() => {
    const newMonth = addMonths(currentMonth, 1)
    const maxMonth = startOfMonth(defaultMaxDate)
    if (newMonth <= maxMonth) {
      setCurrentMonth(newMonth)
    }
  }, [currentMonth, defaultMaxDate])

  const canGoPrevious = useMemo(() => {
    const minMonth = startOfMonth(minDate)
    return currentMonth > minMonth
  }, [currentMonth, minDate])

  const canGoNext = useMemo(() => {
    const maxMonth = startOfMonth(defaultMaxDate)
    const lastDisplayedMonth = addMonths(currentMonth, numberOfMonths - 1)
    return lastDisplayedMonth < maxMonth
  }, [currentMonth, defaultMaxDate, numberOfMonths])


  return (
    <div className={cn(
      "w-full space-y-2 sm:space-3 px-2 sm:px-0",
      "animate-fadeInUp"
    )}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-moss-600" />
            <p className="text-sm text-moss-600">Carregando disponibilidade...</p>
          </div>
        </div>
      )}

      {/* Navegação de meses */}
      <div className="flex items-center justify-center">
        <CalendarHeader
          month={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      </div>

      {/* Grid de meses - Responsivo */}
      {!isLoading && (
        <div className={cn(
          "grid gap-2 sm:gap-4",
          "grid-cols-1", // Mobile: 1 coluna
          numberOfMonths >= 2 && "sm:grid-cols-2", // Tablet: 2 colunas
          numberOfMonths >= 3 && "lg:grid-cols-3" // Desktop: 3 colunas se necessário
        )}>
          {monthsToDisplay.map((month) => (
            <div key={format(month, "yyyy-MM")} className="w-full">
              <CalendarMonth
                month={month}
                availability={availability}
                checkIn={checkIn}
                checkOut={checkOut}
                onDateClick={handleDateClick}
                minDate={minDate}
                maxDate={defaultMaxDate}
                isLoading={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className={cn(
          "grid gap-4 sm:gap-6",
          "grid-cols-1",
          numberOfMonths >= 2 && "sm:grid-cols-2",
        )}>
          {Array.from({ length: numberOfMonths }).map((_, i) => (
            <div key={i} className="w-full">
              <CalendarMonth
                month={addMonths(new Date(), i)}
                availability={{}}
                onDateClick={() => { }}
                isLoading={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* Legenda */}
      {!isLoading && <CalendarLegend />}

      {/* Informações adicionais */}
      {!isLoading && (
        <div className={cn(
          "text-center text-xs text-moss-600",
          "pt-2 border-t border-moss-100",
          "px-1"
        )}>
          <p className="font-medium">
            {checkIn && checkOut
              ? `Período selecionado: ${format(checkIn, "dd/MM/yyyy", { locale: ptBR })} até ${format(checkOut, "dd/MM/yyyy", { locale: ptBR })}`
              : checkIn
                ? `Check-in selecionado: ${format(checkIn, "dd/MM/yyyy", { locale: ptBR })}. Selecione a data de check-out.`
                : "👆 Clique em uma data para selecionar o check-in"}
          </p>
        </div>
      )}
    </div>
  )
}

