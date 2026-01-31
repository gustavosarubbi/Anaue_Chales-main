"use client"

import React from "react"
import { ArrowRightCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function CalendarLegend() {
  const legendItems = [
    {
      label: "Disponível",
      className: "bg-white border border-moss-100 text-moss-900",
    },
    {
      label: "Selecionado",
      className: "bg-moss-700 text-white rounded-full scale-90",
    },
    {
      label: "Ocupado",
      className: "text-moss-200 relative overflow-hidden",
      pattern: true,
    },
  ]

  return (
    <div className={cn(
      "flex flex-wrap items-center justify-center gap-6 sm:gap-10",
      "mt-0",
      "text-[10px] font-bold uppercase tracking-widest text-moss-400"
    )}>
      {legendItems.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2.5"
        >
          <div
            className={cn(
              "w-5 h-5",
              "rounded-full",
              "flex items-center justify-center",
              "text-[8px] font-bold",
              "relative",
              item.className
            )}
          >
            {item.pattern && (
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-full h-[1px] bg-moss-200 rotate-[35deg]" />
              </div>
            )}
            <span className="relative z-10">{!item.pattern && "15"}</span>
          </div>
          <span>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

