"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { cn } from "@/lib/utils"
import { CheckInModal } from "./modals/CheckInModal"
import { CheckOutModal } from "./modals/CheckOutModal"

interface DatePickerProps {
  checkIn?: Date
  checkOut?: Date
  onDatesChange: (checkIn: Date | undefined, checkOut: Date | undefined) => void
  disabledDates?: Date[]
  minDate?: Date
}

interface AvailabilityResponse {
  success: boolean
  availability: Record<string, string>
  lastUpdated: string
  eventsCount: number
  error?: string
}

// Hook para gerenciar disponibilidade
function useAvailability(shouldFetch: boolean) {
  const [bookedDates, setBookedDates] = useState<Date[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  const fetchAvailability = useCallback(async () => {
    setLoadingAvailability(true)
    try {
      const response = await fetch("/api/availability")
      const data: AvailabilityResponse = await response.json()

      if (data.success && data.availability) {
        const booked: Date[] = []
        Object.keys(data.availability).forEach((dateStr) => {
          if (data.availability[dateStr] === "booked") {
            const [year, month, day] = dateStr.split("-").map(Number)
            const date = new Date(year, month - 1, day)
            booked.push(date)
          }
        })
        setBookedDates(booked)
      }
    } catch (error) {
      console.error("Erro ao buscar disponibilidade:", error)
    } finally {
      setLoadingAvailability(false)
    }
  }, [])

  useEffect(() => {
    if (shouldFetch) {
      fetchAvailability()
    }
  }, [shouldFetch, fetchAvailability])

  return { bookedDates, loadingAvailability, fetchAvailability }
}

// Componente de botão de input de data
interface DateInputButtonProps {
  id: string
  label: string
  date: Date | undefined
  disabled?: boolean
  onClick?: () => void
  asChild?: boolean
}

function DateInputButton({ id, label, date, disabled, onClick, asChild }: DateInputButtonProps) {
  const buttonContent = (
    <Button
      id={id}
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full justify-start text-left font-normal text-sm sm:text-base h-10 sm:h-11",
        !date && "text-muted-foreground"
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
      <span className="truncate">
        {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
      </span>
    </Button>
  )

  if (asChild) {
    return buttonContent
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {buttonContent}
    </div>
  )
}

export function DatePicker({
  checkIn,
  checkOut,
  onDatesChange,
  disabledDates = [],
  minDate = new Date(),
}: DatePickerProps) {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false)
  const [tempCheckIn, setTempCheckIn] = useState<Date | undefined>(checkIn)
  const [tempCheckOut, setTempCheckOut] = useState<Date | undefined>(checkOut)

  // Usar hook de disponibilidade
  const { bookedDates, loadingAvailability } = useAvailability(isCheckInOpen || isCheckOutOpen)

  // Atualizar estados temporários quando props mudarem
  useEffect(() => {
    setTempCheckIn(checkIn)
    setTempCheckOut(checkOut)
  }, [checkIn, checkOut])

  // Verificar se há dias sequenciais disponíveis após o check-in
  const getAvailableSequentialDates = useCallback((): Date[] => {
    if (!checkIn) return []

    const normalizedCheckIn = new Date(checkIn)
    normalizedCheckIn.setHours(0, 0, 0, 0)

    const availableDates: Date[] = []
    const maxDaysToCheck = 30

    for (let i = 0; i <= maxDaysToCheck; i++) {
      const checkDate = new Date(normalizedCheckIn)
      checkDate.setDate(checkDate.getDate() + i)

      const dateStr = format(checkDate, "yyyy-MM-dd")

      const isBooked = bookedDates.some((bookedDate) => {
        const normalizedBooked = new Date(bookedDate)
        normalizedBooked.setHours(0, 0, 0, 0)
        return format(normalizedBooked, "yyyy-MM-dd") === dateStr
      })

      if (!isBooked) {
        availableDates.push(checkDate)
      } else {
        break
      }
    }

    return availableDates
  }, [checkIn, bookedDates])

  // Quando abrir o modal de check-out, verificar sequência e definir data padrão
  useEffect(() => {
    if (isCheckOutOpen && checkIn && !loadingAvailability && bookedDates.length >= 0) {
      const sequentialDates = getAvailableSequentialDates()
      if (sequentialDates.length === 1) {
        setTempCheckOut(checkIn)
      } else if (sequentialDates.length > 1 && !checkOut) {
        setTempCheckOut(sequentialDates[1] || checkIn)
      }
    }
  }, [isCheckOutOpen, checkIn, bookedDates, loadingAvailability, checkOut, getAvailableSequentialDates])

  // Desabilitar datas no calendário de check-in
  const isCheckInDateDisabled = useCallback(
    (date: Date) => {
      const normalizedDate = new Date(date)
      normalizedDate.setHours(0, 0, 0, 0)

      const dateStr = format(normalizedDate, "yyyy-MM-dd")

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (normalizedDate < today) return true

      const isBooked = bookedDates.some((bookedDate) => {
        const normalizedBooked = new Date(bookedDate)
        normalizedBooked.setHours(0, 0, 0, 0)
        return format(normalizedBooked, "yyyy-MM-dd") === dateStr
      })
      if (isBooked) return true

      if (disabledDates.length > 0) {
        return disabledDates.some((disabledDate) => {
          const normalizedDisabled = new Date(disabledDate)
          normalizedDisabled.setHours(0, 0, 0, 0)
          return format(normalizedDisabled, "yyyy-MM-dd") === dateStr
        })
      }

      return false
    },
    [bookedDates, disabledDates]
  )

  // Desabilitar datas no calendário de check-out
  const isCheckOutDateDisabled = useCallback(
    (date: Date) => {
      if (!checkIn) return true

      const normalizedDate = new Date(date)
      normalizedDate.setHours(0, 0, 0, 0)

      const dateStr = format(normalizedDate, "yyyy-MM-dd")

      const normalizedCheckIn = new Date(checkIn)
      normalizedCheckIn.setHours(0, 0, 0, 0)

      if (normalizedDate.getTime() < normalizedCheckIn.getTime()) {
        return true
      }

      const isBooked = bookedDates.some((bookedDate) => {
        const normalizedBooked = new Date(bookedDate)
        normalizedBooked.setHours(0, 0, 0, 0)
        return format(normalizedBooked, "yyyy-MM-dd") === dateStr
      })
      if (isBooked) return true

      const sequentialDates = getAvailableSequentialDates()
      const isSameDay = normalizedDate.getTime() === normalizedCheckIn.getTime()

      if (isSameDay) {
        return false
      }

      if (sequentialDates.length > 1) {
        const isSequential = sequentialDates.some((seqDate) => {
          const normalizedSeq = new Date(seqDate)
          normalizedSeq.setHours(0, 0, 0, 0)
          return normalizedSeq.getTime() === normalizedDate.getTime()
        })

        if (!isSequential) return true

        const currentDate = new Date(normalizedCheckIn)
        currentDate.setDate(currentDate.getDate() + 1)

        while (currentDate < normalizedDate) {
          const currentDateStr = format(currentDate, "yyyy-MM-dd")
          const hasBookedInBetween = bookedDates.some((bookedDate) => {
            const normalizedBooked = new Date(bookedDate)
            normalizedBooked.setHours(0, 0, 0, 0)
            return format(normalizedBooked, "yyyy-MM-dd") === currentDateStr
          })

          if (hasBookedInBetween) {
            return true
          }

          currentDate.setDate(currentDate.getDate() + 1)
        }

        return false
      }

      return true
    },
    [checkIn, bookedDates, getAvailableSequentialDates]
  )

  // Confirmar check-in
  const handleConfirmCheckIn = useCallback(() => {
    if (!tempCheckIn) {
      toast.error("Selecione a data de check-in")
      return
    }

    const checkInStr = format(tempCheckIn, "yyyy-MM-dd")
    const isBooked = bookedDates.some(
      (bookedDate) => format(bookedDate, "yyyy-MM-dd") === checkInStr
    )

    if (isBooked) {
      toast.error("Esta data não está disponível")
      return
    }

    const normalized = new Date(tempCheckIn)
    normalized.setHours(0, 0, 0, 0)

    onDatesChange(normalized, undefined)
    setIsCheckInOpen(false)
  }, [tempCheckIn, bookedDates, onDatesChange])

  // Confirmar check-out
  const handleConfirmCheckOut = useCallback(() => {
    if (!tempCheckOut) {
      toast.error("Selecione a data de check-out")
      return
    }

    if (!checkIn) {
      toast.error("Selecione o check-in primeiro")
      return
    }

    const normalizedCheckIn = new Date(checkIn)
    normalizedCheckIn.setHours(0, 0, 0, 0)
    const normalizedCheckOut = new Date(tempCheckOut)
    normalizedCheckOut.setHours(0, 0, 0, 0)

    if (normalizedCheckOut.getTime() < normalizedCheckIn.getTime()) {
      toast.error("Check-out não pode ser antes do check-in")
      return
    }

    const checkOutStr = format(normalizedCheckOut, "yyyy-MM-dd")
    const isBooked = bookedDates.some(
      (bookedDate) => format(bookedDate, "yyyy-MM-dd") === checkOutStr
    )

    if (isBooked) {
      toast.error("Esta data não está disponível")
      return
    }

    if (normalizedCheckOut.getTime() > normalizedCheckIn.getTime()) {
      const currentDate = new Date(normalizedCheckIn)
      currentDate.setDate(currentDate.getDate() + 1)

      while (currentDate < normalizedCheckOut) {
        const currentDateStr = format(currentDate, "yyyy-MM-dd")
        const isDateBooked = bookedDates.some((bookedDate) => {
          const normalizedBooked = new Date(bookedDate)
          normalizedBooked.setHours(0, 0, 0, 0)
          return format(normalizedBooked, "yyyy-MM-dd") === currentDateStr
        })

        if (isDateBooked) {
          toast.error("Há dias ocupados no período selecionado")
          return
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    onDatesChange(normalizedCheckIn, normalizedCheckOut)
    setIsCheckOutOpen(false)
  }, [tempCheckOut, checkIn, bookedDates, onDatesChange])

  const handleCancelCheckIn = useCallback(() => {
    setTempCheckIn(checkIn)
    setIsCheckInOpen(false)
  }, [checkIn])

  const handleCancelCheckOut = useCallback(() => {
    setTempCheckOut(checkOut)
    setIsCheckOutOpen(false)
  }, [checkOut])

  const nights = useMemo(() => {
    if (checkIn && checkOut) {
      return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    }
    return 0
  }, [checkIn, checkOut])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campo de Check-in */}
        <div className="space-y-2">
          <Label htmlFor="check-in">Check-in</Label>
          <CheckInModal
            isOpen={isCheckInOpen}
            onOpenChange={setIsCheckInOpen}
            selectedDate={tempCheckIn}
            onDateSelect={setTempCheckIn}
            onConfirm={handleConfirmCheckIn}
            onCancel={handleCancelCheckIn}
            bookedDates={bookedDates}
            loadingAvailability={loadingAvailability}
            disabledDates={disabledDates}
            minDate={minDate}
            isDateDisabled={isCheckInDateDisabled}
            trigger={
              <DateInputButton
                id="check-in"
                label=""
                date={checkIn}
                asChild
              />
            }
          />
        </div>

        {/* Campo de Check-out */}
        <div className="space-y-2">
          <Label htmlFor="check-out">Check-out</Label>
          <CheckOutModal
            isOpen={isCheckOutOpen}
            onOpenChange={setIsCheckOutOpen}
            selectedDate={tempCheckOut}
            onDateSelect={setTempCheckOut}
            onConfirm={handleConfirmCheckOut}
            onCancel={handleCancelCheckOut}
            bookedDates={bookedDates}
            loadingAvailability={loadingAvailability}
            disabledDates={disabledDates}
            minDate={minDate}
            checkIn={checkIn}
            isDateDisabled={isCheckOutDateDisabled}
            getAvailableSequentialDates={getAvailableSequentialDates}
            trigger={
              <DateInputButton
                id="check-out"
                label=""
                date={checkOut}
                disabled={!checkIn}
                asChild
              />
            }
          />
        </div>
      </div>

      {/* Resumo do período selecionado */}
      {checkIn && checkOut && (
        <div className="rounded-lg bg-moss-50 border border-moss-200 p-3 sm:p-4 text-sm text-moss-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div>
              <p className="text-xs text-moss-600">Período selecionado</p>
              <p className="font-medium text-sm sm:text-base">
                {format(checkIn, "dd/MM/yyyy")} até {format(checkOut, "dd/MM/yyyy")}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-moss-600">Noites</p>
              <p className="font-bold text-lg sm:text-xl">{nights}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
