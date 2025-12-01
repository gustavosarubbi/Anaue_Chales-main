"use client"

import React from "react"
import { cn } from "@/lib/utils"

export function CalendarLegend() {
  const legendItems = [
    {
      label: "Disponível",
      className: "bg-moss-50 border border-moss-200 text-moss-900",
    },
    {
      label: "Ocupado",
      className: "bg-gray-100 text-gray-400 relative overflow-hidden",
      pattern: true,
    },
    {
      label: "Check-in",
      className: "bg-gradient-to-br from-moss-600 to-moss-700 text-white border-2 border-moss-800 shadow-lg shadow-moss-600/50 relative",
      badge: "IN",
    },
    {
      label: "Check-out",
      className: "bg-gradient-to-br from-moss-700 to-moss-800 text-white border-2 border-moss-900 shadow-lg shadow-moss-700/50 relative",
      badge: "OUT",
    },
    {
      label: "Período",
      className: "bg-gradient-to-r from-moss-300 to-moss-400 text-moss-900",
    },
    {
      label: "Hoje",
      className: "bg-moss-50 ring-2 ring-moss-500 ring-offset-2 text-moss-900",
    },
  ]

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 sm:gap-3",
      "mt-3 sm:mt-4 pt-3 sm:pt-4",
      "border-t border-moss-200",
      "text-xs"
    )}>
      <span className="text-moss-600 font-medium mr-1 sm:mr-2">
        Legenda:
      </span>
      
      {legendItems.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-1.5",
            "px-1.5 sm:px-2 py-0.5 sm:py-1",
            "rounded-md",
            "transition-all duration-200"
          )}
        >
          <div
            className={cn(
              "w-6 h-6 sm:w-7 sm:h-7",
              "rounded-md",
              "flex items-center justify-center",
              "text-[10px] sm:text-xs font-medium",
              item.className
            )}
          >
            {item.pattern && (
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)'
                }}
              />
            )}
            {item.badge && (
              <div className={cn(
                "absolute -top-0.5 -right-0.5 z-20 text-white text-[7px] font-bold px-0.5 py-0.5 rounded-full border shadow-sm",
                item.badge === "IN" ? "bg-moss-800 border-moss-900" : "bg-moss-900 border-moss-950"
              )}>
                {item.badge}
              </div>
            )}
            <span className="relative z-10">15</span>
          </div>
          <span className="text-moss-700 font-medium whitespace-nowrap">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

