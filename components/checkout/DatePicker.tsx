"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
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

interface AvailabilityResponse {
  success: boolean
  availability: Record<string, string>
  lastUpdated: string
  eventsCount: number
  error?: string
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
  const [bookedDates, setBookedDates] = useState<Date[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  
  // Estado temporário para cada modal
  const [tempCheckIn, setTempCheckIn] = useState<Date | undefined>(checkIn)
  const [tempCheckOut, setTempCheckOut] = useState<Date | undefined>(checkOut)

  // Atualizar estados temporários quando props mudarem
  useEffect(() => {
    setTempCheckIn(checkIn)
    setTempCheckOut(checkOut)
  }, [checkIn, checkOut])

  // Buscar disponibilidade quando qualquer modal abrir
  useEffect(() => {
    if (isCheckInOpen || isCheckOutOpen) {
      fetchAvailability()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckInOpen, isCheckOutOpen])

  // Quando abrir o modal de check-out, verificar sequência e definir data padrão
  useEffect(() => {
    if (isCheckOutOpen && checkIn && !loadingAvailability && bookedDates.length >= 0) {
      const sequentialDates = getAvailableSequentialDates()
      if (sequentialDates.length === 1) {
        // Se não há sequência, selecionar o mesmo dia do check-in
        setTempCheckOut(checkIn)
      } else if (sequentialDates.length > 1 && !checkOut) {
        // Se há sequência e não tem check-out selecionado, selecionar o próximo dia disponível
        setTempCheckOut(sequentialDates[1] || checkIn)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckOutOpen, checkIn, bookedDates, loadingAvailability])

  const fetchAvailability = async () => {
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
  }

  // Confirmar check-in
  const handleConfirmCheckIn = () => {
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
  }

  // Confirmar check-out
  const handleConfirmCheckOut = () => {
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

    // Permite check-in e check-out no mesmo dia
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

    // Verificar se há dias ocupados entre check-in e check-out (apenas se forem dias diferentes)
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
  }

  // Desabilitar datas no calendário de check-in
  const isCheckInDateDisabled = (date: Date) => {
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
  }

  // Verificar se há dias sequenciais disponíveis após o check-in
  const getAvailableSequentialDates = (): Date[] => {
    if (!checkIn) return []
    
    const normalizedCheckIn = new Date(checkIn)
    normalizedCheckIn.setHours(0, 0, 0, 0)
    
    const availableDates: Date[] = []
    const maxDaysToCheck = 30 // Verificar até 30 dias à frente
    
    for (let i = 0; i <= maxDaysToCheck; i++) {
      const checkDate = new Date(normalizedCheckIn)
      checkDate.setDate(checkDate.getDate() + i)
      
      const dateStr = format(checkDate, "yyyy-MM-dd")
      
      // Verificar se está ocupado
      const isBooked = bookedDates.some((bookedDate) => {
        const normalizedBooked = new Date(bookedDate)
        normalizedBooked.setHours(0, 0, 0, 0)
        return format(normalizedBooked, "yyyy-MM-dd") === dateStr
      })
      
      if (!isBooked) {
        availableDates.push(checkDate)
      } else {
        // Se encontrou um dia ocupado, para a sequência
        break
      }
    }
    
    return availableDates
  }

  // Desabilitar datas no calendário de check-out
  const isCheckOutDateDisabled = (date: Date) => {
    if (!checkIn) return true
    
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)
    
    const dateStr = format(normalizedDate, "yyyy-MM-dd")
    
    const normalizedCheckIn = new Date(checkIn)
    normalizedCheckIn.setHours(0, 0, 0, 0)
    
    // Não permite datas antes do check-in
    if (normalizedDate.getTime() < normalizedCheckIn.getTime()) {
      return true
    }
    
    // Verificar se a data está ocupada
    const isBooked = bookedDates.some((bookedDate) => {
      const normalizedBooked = new Date(bookedDate)
      normalizedBooked.setHours(0, 0, 0, 0)
      return format(normalizedBooked, "yyyy-MM-dd") === dateStr
    })
    if (isBooked) return true

    // Verificar se há dias sequenciais disponíveis a partir do check-in
    const sequentialDates = getAvailableSequentialDates()
    const isSameDay = normalizedDate.getTime() === normalizedCheckIn.getTime()
    
    // Se é o mesmo dia, sempre permite (mesmo que não haja sequência)
    if (isSameDay) {
      return false
    }
    
    // Se não é o mesmo dia, só permite se:
    // 1. Há sequência disponível (mais de 1 dia)
    // 2. A data está na sequência disponível
    // 3. Não há dias ocupados entre check-in e a data selecionada
    if (sequentialDates.length > 1) {
      const isSequential = sequentialDates.some((seqDate) => {
        const normalizedSeq = new Date(seqDate)
        normalizedSeq.setHours(0, 0, 0, 0)
        return normalizedSeq.getTime() === normalizedDate.getTime()
      })
      
      if (!isSequential) return true
      
      // Verificar se há dias ocupados entre check-in e a data selecionada
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
          return true // Há dia ocupado no meio, não permite
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      return false // Está na sequência e não há dias ocupados no meio
    }
    
    // Se não há sequência disponível (apenas o dia de check-in), não permite outros dias
    return true
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Campo de Check-in */}
        <div className="space-y-2">
          <Label htmlFor="check-in">Check-in</Label>
          <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
            <PopoverTrigger asChild>
              <Button
                id="check-in"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 bg-white"
              align="start"
              side="bottom"
              sideOffset={4}
              avoidCollisions={false}
            >
              <div className="flex flex-col">
                <div className="border-b px-3 py-2 bg-moss-50">
                  <p className="text-xs font-medium text-moss-900">Escolha a data de check-in</p>
                  <p className="text-[10px] text-moss-600 mt-0.5">Clique em um dia disponível</p>
                </div>

                {tempCheckIn && (
                  <div className="border-b px-3 py-1.5 bg-white flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Check-in:</span>
                    <strong className="text-moss-900">{format(tempCheckIn, "dd/MM/yyyy", { locale: ptBR })}</strong>
                  </div>
                )}

                <div className="p-3 [&_.rdp-day_selected]:bg-green-700 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-green-800 [&_.rdp-day_selected:focus]:bg-green-700 [&_button[data-selected-single='true']]:bg-green-700 [&_button[data-selected-single='true']]:text-white [&_button[data-selected-single='true']:hover]:bg-green-800">
                  {loadingAvailability ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-moss-600" />
                      <span className="text-xs text-muted-foreground">Carregando...</span>
                    </div>
                  ) : (
                    <Calendar
                      mode="single"
                      defaultMonth={tempCheckIn || checkIn || minDate}
                      selected={tempCheckIn}
                      onSelect={setTempCheckIn}
                      disabled={isCheckInDateDisabled}
                      numberOfMonths={1}
                      locale={ptBR}
                      modifiers={{ booked: bookedDates }}
                      modifiersClassNames={{ booked: "bg-red-100 text-red-400 cursor-not-allowed opacity-60" }}
                      captionLayout="dropdown"
                      fromYear={new Date().getFullYear()}
                      toYear={new Date().getFullYear() + 2}
                      classNames={{
                        day_selected: "bg-green-700 text-white hover:bg-green-800 focus:bg-green-700",
                      }}
                    />
                  )}
                </div>
                
                {!loadingAvailability && (
                  <div className="border-t px-3 py-2 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTempCheckIn(checkIn)
                          setIsCheckInOpen(false)
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleConfirmCheckIn}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!tempCheckIn}
                      >
                        Confirmar
                      </Button>
                    </div>

                    {bookedDates.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <div className="w-2 h-2 bg-red-100 rounded border border-red-200" />
                        <span>Dias reservados</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Campo de Check-out */}
        <div className="space-y-2">
          <Label htmlFor="check-out">Check-out</Label>
          <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
            <PopoverTrigger asChild>
              <Button
                id="check-out"
                variant="outline"
                disabled={!checkIn}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 bg-white"
              align="start"
              side="bottom"
              sideOffset={4}
              avoidCollisions={false}
            >
              <div className="flex flex-col">
                <div className="border-b px-3 py-2 bg-moss-50">
                  <p className="text-xs font-medium text-moss-900">Escolha a data de check-out</p>
                  <p className="text-[10px] text-moss-600 mt-0.5">
                    {(() => {
                      const sequentialDates = getAvailableSequentialDates()
                      if (sequentialDates.length > 1) {
                        return "Selecione um dos dias disponíveis em sequência"
                      } else {
                        return "Apenas o mesmo dia está disponível"
                      }
                    })()}
                  </p>
                </div>

                {tempCheckOut && (
                  <div className="border-b px-3 py-1.5 bg-white flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Check-out:</span>
                    <strong className="text-moss-900">{format(tempCheckOut, "dd/MM/yyyy", { locale: ptBR })}</strong>
                  </div>
                )}

                <div className="p-3 [&_.rdp-day_selected]:bg-green-700 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-green-800 [&_.rdp-day_selected:focus]:bg-green-700 [&_button[data-selected-single='true']]:bg-green-700 [&_button[data-selected-single='true']]:text-white [&_button[data-selected-single='true']:hover]:bg-green-800">
                  {loadingAvailability ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-moss-600" />
                      <span className="text-xs text-muted-foreground">Carregando...</span>
                    </div>
                  ) : (
                    <Calendar
                      mode="single"
                      defaultMonth={tempCheckOut || checkOut || checkIn || minDate}
                      selected={tempCheckOut}
                      onSelect={setTempCheckOut}
                      disabled={isCheckOutDateDisabled}
                      numberOfMonths={1}
                      locale={ptBR}
                      modifiers={{ booked: bookedDates }}
                      modifiersClassNames={{ booked: "bg-red-100 text-red-400 cursor-not-allowed opacity-60" }}
                      captionLayout="dropdown"
                      fromYear={new Date().getFullYear()}
                      toYear={new Date().getFullYear() + 2}
                      classNames={{
                        day_selected: "bg-green-700 text-white hover:bg-green-800 focus:bg-green-700",
                      }}
                    />
                  )}
                </div>
                
                {!loadingAvailability && (
                  <div className="border-t px-3 py-2 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTempCheckOut(checkOut)
                          setIsCheckOutOpen(false)
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleConfirmCheckOut}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!tempCheckOut}
                      >
                        Confirmar
                      </Button>
                    </div>

                    {bookedDates.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <div className="w-2 h-2 bg-red-100 rounded border border-red-200" />
                        <span>Dias reservados</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {checkIn && checkOut && (
        <div className="rounded-lg bg-moss-50 border border-moss-200 p-3 text-sm text-moss-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-moss-600">Período selecionado</p>
              <p className="font-medium">
                {format(checkIn, "dd/MM/yyyy")} até {format(checkOut, "dd/MM/yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-moss-600">Noites</p>
              <p className="font-bold text-lg">
                {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
