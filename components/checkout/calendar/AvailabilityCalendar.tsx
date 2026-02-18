"use client"

import React, { useState, useMemo, useCallback } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useAvailability } from "@/hooks/useAvailability"
import { CalendarLegend } from "./CalendarLegend"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

interface AvailabilityCalendarProps {
  checkIn?: Date
  checkOut?: Date
  onDatesChange: (checkIn: Date | undefined, checkOut: Date | undefined) => void
  disabledDates?: Date[]
  minDate?: Date
  maxDate?: Date
  numberOfMonths?: number
  chaletId?: string
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]
const WEEK_DAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

// ---------- helpers ----------
function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function sameDay(a: Date | undefined, b: Date) {
  if (!a) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isBeforeDay(a: Date, b: Date) {
  return toKey(a) < toKey(b)
}

function isBetween(date: Date, start: Date, end: Date) {
  const k = toKey(date)
  return k > toKey(start) && k < toKey(end)
}

function isAfterDay(a: Date, b: Date) {
  return toKey(a) > toKey(b)
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

interface CalendarDay {
  day: number
  date: Date
  isCurrentMonth: boolean
}

// ---------- component ----------
export function AvailabilityCalendar({
  checkIn,
  checkOut,
  onDatesChange,
  disabledDates = [],
  minDate = new Date(),
  maxDate,
  numberOfMonths = 1,
  chaletId = "chale-anaue",
}: AvailabilityCalendarProps) {
  const { availability, isLoading } = useAvailability(chaletId)
  const [viewDate, setViewDate] = useState(() => new Date())

  // Build a Set of disabled date keys for O(1) lookup
  const disabledKeys = useMemo(() => {
    const keys = new Set<string>()
    // from availability API
    Object.entries(availability).forEach(([dateStr, status]) => {
      if (status) keys.add(dateStr)
    })
    // from props
    disabledDates.forEach((d) => keys.add(toKey(d)))
    return keys
  }, [availability, disabledDates])

  const effectiveMaxDate = useMemo(() => {
    if (maxDate) return maxDate
    const d = new Date()
    d.setFullYear(d.getFullYear() + 2)
    return d
  }, [maxDate])

  // Build the grid of days for the current view month
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDow = firstDay.getDay() // 0=Sun

    const days: CalendarDay[] = []

    // Previous month fill
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startDow - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      days.push({ day, date: new Date(year, month - 1, day), isCurrentMonth: false })
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, date: new Date(year, month, day), isCurrentMonth: true })
    }

    // Next month fill (always 6 rows = 42 cells)
    const remaining = 42 - days.length
    for (let day = 1; day <= remaining; day++) {
      days.push({ day, date: new Date(year, month + 1, day), isCurrentMonth: false })
    }

    return days
  }, [viewDate])

  // Navigation
  const goToPrev = useCallback(() => {
    setViewDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() - 1)
      return d
    })
  }, [])

  const goToNext = useCallback(() => {
    setViewDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + 1)
      return d
    })
  }, [])

  // Date helpers
  const todayKey = useMemo(() => toKey(new Date()), [])

  const isDayDisabled = useCallback(
    (date: Date) => {
      if (isBeforeDay(date, minDate) && toKey(date) !== toKey(minDate)) return true
      if (isBeforeDay(effectiveMaxDate, date)) return true
      return disabledKeys.has(toKey(date))
    },
    [minDate, effectiveMaxDate, disabledKeys]
  )

  const isPast = useCallback(
    (date: Date) => {
      return toKey(date) < todayKey
    },
    [todayKey]
  )

  // Dias após o check-in que podem ser escolhidos como check-out (apenas para estilo visual; bloqueados não são clicáveis)
  const canBeCheckOutOnly = useCallback(
    (date: Date) => {
      return !!(checkIn && !checkOut && isAfterDay(date, checkIn))
    },
    [checkIn, checkOut]
  )

  // Dia seguinte ao check-in (check-out sugerido)
  const recommendedCheckOutDate = checkIn && !checkOut ? addDays(checkIn, 1) : null
  const isRecommendedCheckOutDay = useCallback(
    (date: Date) => recommendedCheckOutDate ? sameDay(date, recommendedCheckOutDate) : false,
    [checkIn, checkOut]
  )

  // Único dia liberado para check-out: dia imediatamente após o "último dia disponível na sequência" a partir do check-in.
  const liberatedCheckOutKey = useMemo(() => {
    if (!checkIn || checkOut) return null
    let d = new Date(checkIn)
    let lastAvailable = new Date(checkIn)
    const maxDays = 60
    for (let i = 0; i < maxDays; i++) {
      if (disabledKeys.has(toKey(d))) break
      lastAvailable = new Date(d)
      d = addDays(d, 1)
    }
    return toKey(addDays(lastAvailable, 1))
  }, [checkIn, checkOut, disabledKeys])

  const isLiberatedCheckOutDay = useCallback(
    (date: Date) => liberatedCheckOutKey !== null && toKey(date) === liberatedCheckOutKey,
    [liberatedCheckOutKey]
  )

  // Data do dia liberado para check-out (para hint e a11y)
  const liberatedCheckOutDate = useMemo(() => {
    if (!liberatedCheckOutKey) return null
    const [y, m, day] = liberatedCheckOutKey.split("-").map(Number)
    return new Date(y, m - 1, day)
  }, [liberatedCheckOutKey])

  // Click handler – para check-out só o dia liberado é clicável (bloqueados fora dele não)
  const handleDayClick = useCallback(
    (date: Date) => {
      if (isPast(date)) return
      if (!date) return
      // Bloqueado: só pode clicar se for exatamente o único dia liberado para check-out
      if (isDayDisabled(date) && !(canBeCheckOutOnly(date) && toKey(date) === liberatedCheckOutKey)) return

      if (!checkIn || (checkIn && checkOut)) {
        // Start new selection
        onDatesChange(date, undefined)
      } else {
        // We have checkIn but no checkOut
        if (sameDay(checkIn, date)) {
          // Clicked same day – reset
          onDatesChange(undefined, undefined)
        } else if (isBeforeDay(date, checkIn)) {
          // Clicked before checkIn – restart with this as checkIn
          onDatesChange(date, undefined)
        } else {
          // Check-out válido apenas no único dia liberado (dia após o último disponível na sequência)
          if (toKey(date) === liberatedCheckOutKey) {
            onDatesChange(checkIn, date)
          } else {
            onDatesChange(date, undefined)
          }
        }
      }
    },
    [checkIn, checkOut, onDatesChange, isDayDisabled, isPast, canBeCheckOutOnly, liberatedCheckOutKey]
  )

  // Determine visual state of each day
  const getDayState = useCallback(
    (date: Date, isCurrentMonth: boolean) => {
      const key = toKey(date)
      const past = isPast(date)
      const disabled = isDayDisabled(date)
      const isToday = key === todayKey
      const isCheckIn = sameDay(checkIn, date)
      const isCheckOut = sameDay(checkOut, date)
      const inRange =
        checkIn && checkOut && isCurrentMonth && isBetween(date, checkIn, checkOut)
      const isOccupied = disabledKeys.has(key) && !past

      return { past, disabled, isToday, isCheckIn, isCheckOut, inRange, isOccupied, isCurrentMonth }
    },
    [checkIn, checkOut, todayKey, isPast, isDayDisabled, disabledKeys]
  )

  return (
    <div className="relative w-full flex flex-col items-center gap-5">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-moss-600" />
            <p className="text-[11px] font-semibold text-moss-500 uppercase tracking-widest">
              Carregando disponibilidade…
            </p>
          </div>
        </div>
      )}

      {/* Calendar card */}
      <div className="w-full bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        {/* Header – month navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-100">
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Mês anterior"
            className="p-2 rounded-full text-moss-500 hover:text-moss-800 hover:bg-moss-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h3 className="text-base sm:text-lg font-semibold text-moss-900 capitalize select-none font-heading">
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </h3>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Próximo mês"
            className="p-2 rounded-full text-moss-500 hover:text-moss-800 hover:bg-moss-50 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 px-2 sm:px-4 pt-3 pb-1">
          {WEEK_DAYS.map((wd) => (
            <div
              key={wd}
              className="text-center text-[11px] sm:text-xs font-semibold text-moss-400 uppercase tracking-wide select-none"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1 px-2 sm:px-4 pb-4 pt-1">
          {calendarDays.map((cd, i) => {
            const state = getDayState(cd.date, cd.isCurrentMonth)

            // Outside-month days: render invisible placeholder to keep grid alignment
            if (!cd.isCurrentMonth) {
              return (
                <div key={i} className="flex items-center justify-center aspect-square p-0.5">
                  <span className="text-[11px] sm:text-sm text-stone-200 select-none">{cd.day}</span>
                </div>
              )
            }

            const isSelected = state.isCheckIn || state.isCheckOut
            const canBeCheckOut = canBeCheckOutOnly(cd.date)
            const isRecommendedCheckOut = isRecommendedCheckOutDay(cd.date)
            // Ao escolher check-out: dia liberado para checkout OU mesmo dia do check-in (reset) OU dia anterior disponível (trocar check-in).
            const isSelectingCheckOut = !!checkIn && !checkOut
            const canChangeCheckIn = isSelectingCheckOut && (sameDay(cd.date, checkIn!) || (isBeforeDay(cd.date, checkIn!) && !state.disabled))
            const interactive = !state.past && (
              isSelectingCheckOut
                ? toKey(cd.date) === liberatedCheckOutKey || canChangeCheckIn
                : !state.disabled
            )

            return (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-center aspect-square p-0.5 relative",
                  // Range background band
                  state.inRange && "bg-moss-50"
                )}
              >
                {/* Range edge rounding helpers */}
                {state.isCheckIn && checkOut && (
                  <div className="absolute inset-y-0 right-0 w-1/2 bg-moss-50" />
                )}
                {state.isCheckOut && checkIn && (
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-moss-50" />
                )}

                <div
                  onClick={() => interactive && handleDayClick(cd.date)}
                  role={interactive ? "button" : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  aria-label={interactive && isLiberatedCheckOutDay(cd.date) && liberatedCheckOutDate
                    ? `Selecionar dia ${format(liberatedCheckOutDate, "d 'de' MMMM", { locale: ptBR })} para check-out`
                    : undefined}
                  onKeyDown={(e) => {
                    if (interactive && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault()
                      handleDayClick(cd.date)
                    }
                  }}
                  className={cn(
                    "relative z-10 w-full h-full max-w-[40px] max-h-[40px] sm:max-w-[44px] sm:max-h-[44px] mx-auto",
                    "flex items-center justify-center rounded-full text-sm sm:text-[15px] font-medium",
                    "transition-all duration-150 select-none",

                    // Disponível: dias não bloqueados; ou só o único dia liberado (ex.: dia 11 após 9 e 10 bloqueados)
                    interactive && !isSelected && !state.isToday && (!state.isOccupied || isLiberatedCheckOutDay(cd.date)) &&
                      (!(checkIn && !checkOut) || isLiberatedCheckOutDay(cd.date)) &&
                      "text-moss-800 hover:bg-moss-100 cursor-pointer no-underline decoration-none",

                    // Dia seguinte ao check-in quando ocupado: aspecto igual a disponível (sem riscado, anel discreto de “check-out sugerido”)
                    isLiberatedCheckOutDay(cd.date) && state.isOccupied && !isSelected && !state.past &&
                      "text-moss-800 bg-moss-100 ring-2 ring-moss-400/60 ring-inset",

                    // Escolhendo check-out: outros dias disponíveis (não ocupados) após check-in – neutros
                    checkIn && !checkOut && canBeCheckOut && !isLiberatedCheckOutDay(cd.date) && !state.isOccupied && !isSelected &&
                      "text-stone-400 hover:bg-stone-50 cursor-pointer",

                    // Today
                    state.isToday && !isSelected &&
                      "text-moss-900 font-bold ring-2 ring-moss-300 ring-inset",

                    // Past
                    state.past &&
                      "text-stone-300 cursor-default",

                    // Bloqueado/ocupado – vermelho; exceção só o único dia liberado
                    state.isOccupied && !state.past && !isLiberatedCheckOutDay(cd.date) && !state.isCheckOut &&
                      "text-red-400 line-through decoration-red-400 font-medium cursor-not-allowed",
                    state.isOccupied && !state.past && isLiberatedCheckOutDay(cd.date) && !isSelected &&
                      "cursor-pointer hover:bg-moss-50 hover:ring-2 hover:ring-moss-200",

                    // Selecionado – dias disponíveis ou o dia de check-out (inclui dia liberado)
                    isSelected && (!state.isOccupied || isLiberatedCheckOutDay(cd.date) || state.isCheckOut) &&
                      "bg-moss-700 text-white font-semibold shadow-md cursor-pointer no-underline decoration-none",

                    // In range
                    state.inRange && !isSelected && !state.isOccupied &&
                      "text-moss-800",
                  )}
                >
                  {cd.day}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <CalendarLegend />

      {/* Selection status */}
      <div className="w-full text-center py-4 px-4 bg-stone-50 rounded-xl border border-stone-100">
        <p className="text-xs sm:text-sm text-moss-600">
          {checkIn && checkOut ? (
            <span className="text-moss-900 font-medium">
              {format(checkIn, "dd 'de' MMM", { locale: ptBR })} — {format(checkOut, "dd 'de' MMM", { locale: ptBR })}
              <span className="text-moss-500 font-normal ml-1.5">
                ({Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} noite{Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? "s" : ""})
              </span>
            </span>
          ) : checkIn && liberatedCheckOutDate ? (
            <span>
              Check-in: <strong className="text-moss-900">{format(checkIn, "dd 'de' MMM", { locale: ptBR })}</strong>
              <span className="text-moss-400 mx-1">→</span>{" "}
              Clique no dia <strong className="text-moss-900">{format(liberatedCheckOutDate, "d 'de' MMM", { locale: ptBR })}</strong> para check-out
              <span className="text-stone-400 text-[11px] block mt-1">Ou toque em outra data disponível para mudar o check-in</span>
            </span>
          ) : checkIn ? (
            <span>
              Check-in: <strong className="text-moss-900">{format(checkIn, "dd 'de' MMM", { locale: ptBR })}</strong>
              <span className="text-moss-400 mx-1">→</span> Selecione o check-out
            </span>
          ) : (
            <span className="text-moss-400">Toque em uma data para selecionar o check-in</span>
          )}
        </p>
      </div>
    </div>
  )
}
