"use client"

import React from "react"
import { ArrowRightCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function CalendarLegend() {
  const legendItems = [
    {
      label: "Check IN",
      className: "bg-green-700 text-white relative",
      badge: "IN",
      icon: true,
    },
    {
      label: "Check OUT",
      className: "bg-green-700 text-white relative",
      badge: "OUT",
      icon: true,
    },
    {
      label: "Ocupado",
      className: "bg-gray-100 text-gray-400 relative overflow-hidden",
      pattern: true,
    },
  ]

  return (
    <div className={cn(
      "flex flex-wrap items-center justify-center gap-3 sm:gap-6",
      "mt-3 sm:mt-4 pt-3 sm:pt-4",
      "border-t border-moss-200",
      "text-xs"
    )}>
      {legendItems.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-2",
            "transition-all duration-200"
          )}
        >
          <div
            className={cn(
              "w-7 h-7 sm:w-8 sm:h-8",
              "rounded",
              "flex items-center justify-center",
              "text-sm font-medium",
              "relative",
              item.className
            )}
          >
            {item.pattern && (
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 8px)'
                }}
              />
            )}
            {item.badge && (
              <div className="absolute top-0 right-0 z-30 text-white text-[7px] font-bold leading-none px-0.5">
                {item.badge}
              </div>
            )}
            {item.icon && (
              <ArrowRightCircle className="absolute top-0 left-0 w-2.5 h-2.5 text-white/90 z-30" />
            )}
            <span className="relative z-10 text-xs font-medium">15</span>
          </div>
          <span className="text-gray-700 font-medium">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

