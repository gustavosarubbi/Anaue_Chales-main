"use client"

import React from "react"
import { cn } from "@/lib/utils"

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] sm:text-xs text-moss-500">
      {/* Disponível */}
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full border border-moss-200 bg-white" />
        <span>Disponível</span>
      </div>

      {/* Selecionado */}
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-moss-700" />
        <span>Selecionado</span>
      </div>

      {/* Ocupado */}
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-red-200 border border-red-300" />
        <span>Ocupado</span>
      </div>
    </div>
  )
}
