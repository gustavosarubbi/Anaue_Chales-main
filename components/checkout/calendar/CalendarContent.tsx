"use client"

import { useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

export interface CalendarContentProps {
  type: "check-in" | "check-out"
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  onConfirm: () => void
  onCancel: () => void
  bookedDates: Date[]
  loadingAvailability: boolean
  minDate?: Date
  checkIn?: Date
  isDateDisabled: (date: Date) => boolean
  getAvailableSequentialDates?: () => Date[]
}

export function CalendarContent({
  type,
  selectedDate,
  onDateSelect,
  onConfirm,
  onCancel,
  bookedDates,
  loadingAvailability,
  minDate = new Date(),
  checkIn,
  isDateDisabled,
  getAvailableSequentialDates,
}: CalendarContentProps) {
  const title = type === "check-in" ? "Escolha a data de check-in" : "Escolha a data de check-out"
  
  const description = useMemo(() => {
    if (type === "check-out" && getAvailableSequentialDates) {
      const sequentialDates = getAvailableSequentialDates()
      if (sequentialDates.length > 1) {
        return "Selecione um dos dias disponíveis em sequência"
      } else {
        return "Apenas o mesmo dia está disponível"
      }
    }
    return "Clique em um dia disponível"
  }, [type, getAvailableSequentialDates])

  const defaultMonth = useMemo(() => {
    if (type === "check-out" && checkIn) {
      return selectedDate || checkIn || minDate
    }
    return selectedDate || minDate
  }, [type, selectedDate, checkIn, minDate])

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="border-b px-3 sm:px-4 py-3 bg-moss-50 flex-shrink-0">
        <p className="text-sm sm:text-base font-medium text-moss-900">{title}</p>
        <p className="text-xs sm:text-sm text-moss-600 mt-1">{description}</p>
      </div>

      {/* Data selecionada */}
      {selectedDate && (
        <div className="border-b px-3 sm:px-4 py-2 bg-white flex items-center gap-2 text-sm flex-shrink-0">
          <span className="text-muted-foreground flex-shrink-0 capitalize">{type}:</span>
          <strong className="text-moss-900 truncate">
            {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
          </strong>
        </div>
      )}

      {/* Calendário */}
      <div className="p-2 sm:p-3 md:p-4 w-full min-w-0 [&_.rdp-day_selected]:bg-green-700 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-green-800 [&_.rdp-day_selected:focus]:bg-green-700 [&_button[data-selected-single='true']]:bg-green-700 [&_button[data-selected-single='true']]:text-white [&_button[data-selected-single='true']:hover]:bg-green-800">
        {loadingAvailability ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 sm:py-16">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-moss-600" />
            <span className="text-sm text-muted-foreground">Carregando disponibilidade...</span>
          </div>
        ) : (
          <div className="w-full min-w-0">
            <Calendar
              mode="single"
              defaultMonth={defaultMonth}
              selected={selectedDate}
              onSelect={onDateSelect}
              disabled={isDateDisabled}
              numberOfMonths={1}
              locale={ptBR}
              modifiers={{ booked: bookedDates }}
              modifiersClassNames={{ booked: "bg-red-100 text-red-400 cursor-not-allowed opacity-60" }}
              captionLayout="dropdown"
              fromYear={new Date().getFullYear()}
              toYear={new Date().getFullYear() + 2}
              className="w-full"
              classNames={{
                root: "w-full overflow-visible",
                months: "w-full overflow-visible",
                month: "w-full overflow-visible",
                table: "w-full",
                day_selected: "bg-green-700 text-white hover:bg-green-800 focus:bg-green-700",
                day: "h-9 sm:h-10 text-sm sm:text-base",
                weekday: "text-xs sm:text-sm",
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      {!loadingAvailability && (
        <div className="border-t px-3 sm:px-4 py-3 bg-white flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1 text-sm sm:text-base h-9 sm:h-10"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={onConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 text-sm sm:text-base h-9 sm:h-10"
              disabled={!selectedDate}
            >
              Confirmar
            </Button>
          </div>

          {bookedDates.length > 0 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <div className="w-2.5 h-2.5 bg-red-100 rounded border border-red-200 flex-shrink-0" />
              <span>Dias reservados</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


