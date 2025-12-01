"use client"

import React from "react"
import { ArrowRightCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CalendarDayProps } from "./types"

export function CalendarDay({ day, onClick, isSelected, isInRange, canClickWhenOccupied = false }: CalendarDayProps) {
  const handleClick = () => {
    // Permitir clique se não estiver desabilitado e:
    // - Não estiver ocupado, OU
    // - Estiver ocupado mas pode ser clicado (dia seguinte ao check-in)
    if (day.status !== 'disabled' && (day.status !== 'occupied' || canClickWhenOccupied)) {
      onClick(day.date)
    }
  }

  const getDayClasses = () => {
    // Prioridade: check-in e check-out primeiro
    const isCheckIn = day.status === 'check-in'
    const isCheckOut = day.status === 'check-out'
    
    // Se for check-in ou check-out, aplicar estilo verde escuro diretamente
    if (isCheckIn || isCheckOut) {
      return cn(
        "relative flex items-center justify-center",
        "w-full h-full",
        "text-sm",
        "font-medium",
        "rounded",
        "transition-colors duration-150",
        "cursor-pointer",
        "select-none",
        "bg-green-700 text-white z-10"
      )
    }
    
    const baseClasses = cn(
      "relative flex items-center justify-center",
      "w-full h-full",
      "text-sm",
      "font-medium",
      "rounded",
      "transition-colors duration-150",
      "cursor-pointer",
      "select-none",
      {
        // Disponível - light green square
        "bg-green-100 hover:bg-green-200 text-gray-900": 
          day.status === 'available' && !isSelected && !isInRange,
        
        // Ocupado (mas pode ser clicável se for dia seguinte ao check-in)
        "bg-gray-100 text-gray-400 opacity-50": 
          day.status === 'occupied',
        "cursor-not-allowed": 
          day.status === 'occupied' && !canClickWhenOccupied,
        "cursor-pointer": 
          day.status === 'occupied' && canClickWhenOccupied,
        
        // Desabilitado (passado) - faded grey
        "bg-gray-50 text-gray-300 cursor-not-allowed opacity-40": 
          day.status === 'disabled',
        
        // Hoje (mas não selecionado) - trata como disponível
        "bg-green-100 hover:bg-green-200 text-gray-900": 
          day.status === 'today' && !isSelected && !isInRange,
        
        // No meio do período selecionado - light green
        "bg-green-100 text-gray-900": 
          isInRange && !isSelected,
      }
    )

    return baseClasses
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={day.status === 'disabled' || (day.status === 'occupied' && !canClickWhenOccupied)}
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
      
      {/* Badge Check-in - IN no canto superior direito */}
      {day.status === 'check-in' && (
        <div className="absolute top-0 right-0 z-20 text-white text-[8px] font-bold px-1 py-0.5">
          IN
        </div>
      )}
      
      {/* Badge Check-out - OUT no canto superior direito */}
      {day.status === 'check-out' && (
        <div className="absolute top-0 right-0 z-20 text-white text-[8px] font-bold px-1 py-0.5">
          OUT
        </div>
      )}
      
      {/* Ícone Check-in - seta no canto superior esquerdo */}
      {day.status === 'check-in' && (
        <ArrowRightCircle className="absolute top-0 left-0 w-3 h-3 text-white/90 z-20" />
      )}
      
      {/* Ícone Check-out - seta no canto superior esquerdo */}
      {day.status === 'check-out' && (
        <ArrowRightCircle className="absolute top-0 left-0 w-3 h-3 text-white/90 z-20" />
      )}
    </button>
  )
}

