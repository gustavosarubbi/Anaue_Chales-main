"use client"

import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

interface CalendarHeaderProps {
  month: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  canGoPrevious: boolean
  canGoNext: boolean
}

export function CalendarHeader({
  month,
  onPreviousMonth,
  onNextMonth,
  canGoPrevious,
  canGoNext,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3 px-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onPreviousMonth}
        disabled={!canGoPrevious}
        className={cn(
          "w-8 h-8 sm:w-9 sm:h-9",
          "hover:bg-moss-100 hover:text-moss-900",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          "transition-all duration-200",
          "rounded-md"
        )}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4 sm:h-4 sm:w-4" />
      </Button>
      
      <h2 className={cn(
        "font-semibold text-moss-900",
        "text-lg sm:text-xl",
        "capitalize",
        "min-w-[140px] sm:min-w-[160px] text-center"
      )}>
        {format(month, "MMMM yyyy", { locale: ptBR })}
      </h2>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        disabled={!canGoNext}
        className={cn(
          "w-8 h-8 sm:w-9 sm:h-9",
          "hover:bg-moss-100 hover:text-moss-900",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          "transition-all duration-200",
          "rounded-md"
        )}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4 sm:h-4 sm:w-4" />
      </Button>
    </div>
  )
}

