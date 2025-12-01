"use client"

import React from "react"
import { ArrowRightCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { CalendarDayProps } from "./types"

export function CalendarDay({ day, onClick, isSelected, isInRange }: CalendarDayProps) {
  const handleClick = () => {
    if (day.status !== 'disabled' && day.status !== 'occupied') {
      onClick(day.date)
    }
  }

  const getDayClasses = () => {
    const baseClasses = cn(
      "relative flex items-center justify-center",
      "w-8 h-9 sm:w-9 sm:h-10 lg:w-10 lg:h-11",
      "text-xs sm:text-sm",
      "font-medium",
      "rounded-md",
      "m-0 p-0",
      "mx-auto",
      "transition-all duration-200 ease-out",
      "cursor-pointer",
      "select-none",
      "touch-manipulation", // Melhora experiência mobile
      {
        // Disponível
        "bg-moss-50 hover:bg-moss-100 hover:scale-105 hover:shadow-md": 
          day.status === 'available' && !isSelected && !isInRange,
        "text-moss-900 border border-moss-200": 
          day.status === 'available' && !isSelected && !isInRange,
        
        // Ocupado
        "bg-gray-100 text-gray-400 cursor-not-allowed": 
          day.status === 'occupied',
        "opacity-50": day.status === 'occupied',
        "relative overflow-hidden": day.status === 'occupied',
        
        // Desabilitado (passado)
        "bg-gray-50 text-gray-300 cursor-not-allowed": 
          day.status === 'disabled',
        "opacity-40": day.status === 'disabled',
        
        // Hoje (mas não selecionado)
        "ring-2 ring-moss-500 ring-offset-1 sm:ring-offset-2": 
          day.status === 'today' && !isSelected && !isInRange,
        "bg-moss-50 text-moss-900": 
          day.status === 'today' && !isSelected && !isInRange,
        
        // Check-in
        "bg-gradient-to-br from-moss-600 to-moss-700 text-white shadow-lg shadow-moss-600/50": 
          day.status === 'check-in',
        "border-2 border-moss-800": day.status === 'check-in',
        "rounded-l-md": day.status === 'check-in',
        
        // Check-out
        "bg-gradient-to-br from-moss-700 to-moss-800 text-white shadow-lg shadow-moss-700/50": 
          day.status === 'check-out',
        "border-2 border-moss-900": day.status === 'check-out',
        "rounded-r-md": day.status === 'check-out',
        
        // No meio do período selecionado
        "bg-gradient-to-r from-moss-300 to-moss-400 text-moss-900": 
          isInRange && !isSelected,
        "rounded-none": isInRange && !isSelected,
        
        // Selecionado (check-in ou check-out)
        "scale-105 z-10": isSelected,
      }
    )

    return baseClasses
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={day.status === 'disabled' || day.status === 'occupied'}
      className={getDayClasses()}
      aria-label={`${day.date.toLocaleDateString('pt-BR')} - ${
        day.status === 'check-in' ? `Check-in em ${day.date.toLocaleDateString('pt-BR')}` :
        day.status === 'check-out' ? `Check-out em ${day.date.toLocaleDateString('pt-BR')}` :
        day.status === 'available' ? 'Disponível' :
        day.status === 'occupied' ? 'Ocupado' :
        day.status === 'disabled' ? 'Indisponível' :
        day.status === 'today' ? 'Hoje' :
        day.status === 'range' ? 'No período selecionado' :
        'Selecionado'
      }`}
      aria-disabled={day.status === 'disabled' || day.status === 'occupied'}
    >
      {/* Padrão riscado para ocupado */}
      {day.status === 'occupied' && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 8px)'
          }}
        />
      )}
      
      {/* Número do dia */}
      <span className="relative z-10">
        {day.date.getDate()}
      </span>
      
      {/* Badge Check-in */}
      {day.status === 'check-in' && (
        <div className="absolute -top-0.5 -right-0.5 z-20 bg-moss-800 text-white text-[7px] font-bold px-1 py-0.5 rounded-full border border-moss-900 shadow-sm">
          IN
        </div>
      )}
      
      {/* Badge Check-out */}
      {day.status === 'check-out' && (
        <div className="absolute -top-0.5 -right-0.5 z-20 bg-moss-900 text-white text-[7px] font-bold px-1 py-0.5 rounded-full border border-moss-950 shadow-sm">
          OUT
        </div>
      )}
      
      {/* Ícone Check-in */}
      {day.status === 'check-in' && (
        <ArrowRightCircle className="absolute top-0 left-0 w-2.5 h-2.5 text-white/70" />
      )}
      
      {/* Ícone Check-out */}
      {day.status === 'check-out' && (
        <ArrowRight className="absolute top-0 left-0 w-2.5 h-2.5 text-white/70" />
      )}
      
      {/* Indicador de hoje (quando não selecionado) */}
      {day.isToday && !isSelected && !isInRange && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-moss-600" />
      )}
    </button>
  )
}

