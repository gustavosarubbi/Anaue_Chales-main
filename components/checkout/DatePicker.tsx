"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  checkIn?: Date
  checkOut?: Date
  onDatesChange: (checkIn: Date | undefined, checkOut: Date | undefined) => void
  disabledDates?: Date[]
  minDate?: Date
}

export function DatePicker({
  checkIn,
  checkOut,
  onDatesChange,
  disabledDates = [],
  minDate = new Date(),
}: DatePickerProps) {
  const [checkInStr, setCheckInStr] = useState<string>("")
  const [checkOutStr, setCheckOutStr] = useState<string>("")

  // Atualizar strings quando props mudarem
  useEffect(() => {
    if (checkIn) {
      const year = checkIn.getFullYear()
      const month = String(checkIn.getMonth() + 1).padStart(2, "0")
      const day = String(checkIn.getDate()).padStart(2, "0")
      setCheckInStr(`${year}-${month}-${day}`)
    } else {
      setCheckInStr("")
    }
  }, [checkIn])

  useEffect(() => {
    if (checkOut) {
      const year = checkOut.getFullYear()
      const month = String(checkOut.getMonth() + 1).padStart(2, "0")
      const day = String(checkOut.getDate()).padStart(2, "0")
      setCheckOutStr(`${year}-${month}-${day}`)
    } else {
      setCheckOutStr("")
    }
  }, [checkOut])

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCheckInStr(value)

    if (value) {
      const [year, month, day] = value.split("-").map(Number)
      const date = new Date(year, month - 1, day, 0, 0, 0, 0)
      onDatesChange(date, checkOut)
    } else {
      onDatesChange(undefined, checkOut)
    }
  }

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCheckOutStr(value)

    if (value) {
      const [year, month, day] = value.split("-").map(Number)
      const date = new Date(year, month - 1, day, 0, 0, 0, 0)
      onDatesChange(checkIn, date)
    } else {
      onDatesChange(checkIn, undefined)
    }
  }

  const minDateStr = useMemo(() => {
    const year = minDate.getFullYear()
    const month = String(minDate.getMonth() + 1).padStart(2, "0")
    const day = String(minDate.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [minDate])

  const maxDateStr = useMemo(() => {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 2)
    const year = maxDate.getFullYear()
    const month = String(maxDate.getMonth() + 1).padStart(2, "0")
    const day = String(maxDate.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [])

  const nights = useMemo(() => {
    if (checkIn && checkOut) {
      return Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
    }
    return 0
  }, [checkIn, checkOut])

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Grid responsivo: 1 coluna em mobile, 2 colunas em tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Campo de Check-in */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label
            htmlFor="check-in"
            className="text-xs sm:text-sm font-medium text-foreground"
          >
            Check-in
          </Label>
          <Input
            id="check-in"
            type="date"
            value={checkInStr}
            onChange={handleCheckInChange}
            min={minDateStr}
            max={maxDateStr}
            className="h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>

        {/* Campo de Check-out */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label
            htmlFor="check-out"
            className="text-xs sm:text-sm font-medium text-foreground"
          >
            Check-out
          </Label>
          <Input
            id="check-out"
            type="date"
            value={checkOutStr}
            onChange={handleCheckOutChange}
            min={checkIn ? checkInStr : minDateStr}
            max={maxDateStr}
            disabled={!checkIn}
            className="h-10 sm:h-11 text-sm sm:text-base"
          />
          {!checkIn && (
            <p className="text-xs text-muted-foreground mt-1">
              Selecione o check-in primeiro
            </p>
          )}
        </div>
      </div>

      {/* Resumo do período selecionado - Layout responsivo */}
      {checkIn && checkOut && (
        <div
          className={cn(
            "rounded-lg border bg-moss-50 border-moss-200",
            "p-3 sm:p-4",
            "transition-all duration-200",
            "shadow-sm"
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-3 sm:gap-0",
              "sm:flex-row sm:items-center sm:justify-between"
            )}
          >
            {/* Informações do período */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-moss-600 mb-1",
                  "text-[0.65rem] sm:text-xs"
                )}
              >
                Período selecionado
              </p>
              <p
                className={cn(
                  "font-semibold text-moss-900",
                  "text-sm sm:text-base",
                  "leading-tight"
                )}
              >
                {format(checkIn, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                {format(checkOut, "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>

            {/* Número de noites */}
            <div
              className={cn(
                "flex-shrink-0",
                "text-left sm:text-right",
                "pt-2 sm:pt-0 border-t sm:border-t-0 border-moss-200 sm:border-0"
              )}
            >
              <p
                className={cn(
                  "text-moss-600 mb-1",
                  "text-[0.65rem] sm:text-xs"
                )}
              >
                Noites
              </p>
              <p
                className={cn(
                  "font-bold text-moss-900",
                  "text-lg sm:text-xl md:text-2xl"
                )}
              >
                {nights}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
