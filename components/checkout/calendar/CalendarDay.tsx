"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { CalendarDayProps } from "./types"
import { isSameDay } from "date-fns"

export function CalendarDay({
  day,
  onClick,
  onHover,
  isSelected,
  isInRange,
  isHoverRange,
  hoverDate,
  canClickWhenOccupied = false,
  checkIn,
  checkOut
}: CalendarDayProps) {

  const handleClick = () => {
    if (day.status !== 'disabled' && (day.status !== 'occupied' || canClickWhenOccupied)) {
      onClick(day.date)
    }
  }

  const handleMouseEnter = () => {
    if (day.status !== 'disabled') {
      onHover(day.date)
    }
  }

  const isCheckIn = day.status === 'check-in'
  const isCheckOut = day.status === 'check-out'
  const isRange = isInRange && !isSelected
  const isToday = day.status === 'today'
  const isOccupied = day.status === 'occupied'
  const isDisabled = day.status === 'disabled'

  // Airbnb style:
  // - Start/End dates are full circles with high contrast
  // - Middle dates are rectangles with light contrast
  // - Hover range is similar but even lighter or dashed

  const getDayClasses = () => {
    const baseClasses = "relative flex items-center justify-center w-full h-full text-sm font-bold transition-all duration-200 select-none z-10"

    if (isCheckIn || isCheckOut) {
      return cn(baseClasses, "text-white")
    }

    if (isRange) {
      return cn(baseClasses, "text-moss-900")
    }

    if (isHoverRange) {
      return cn(baseClasses, "text-moss-700")
    }

    if (isOccupied && !canClickWhenOccupied) {
      return cn(baseClasses, "text-moss-200 cursor-not-allowed")
    }

    if (isDisabled) {
      return cn(baseClasses, "text-moss-100 cursor-not-allowed")
    }

    return cn(baseClasses, "text-moss-900 hover:text-moss-950")
  }

  return (
    <div
      className="relative w-full h-full group"
      onMouseEnter={handleMouseEnter}
    >
      {/* 
        RANGE BACKGROUND SYSTEM
        This creates the continuous "Capsule" look
      */}

      {/* Real Range Background (selected) */}
      {isRange && (
        <div className="absolute inset-y-1 inset-x-0 bg-moss-100/60 z-0" />
      )}

      {/* Hover Range Background */}
      {isHoverRange && (
        <div className="absolute inset-y-1 inset-x-0 bg-moss-50/80 border-y border-moss-100/50 z-0" />
      )}

      {/* Left/Right connectors for check-in/out */}
      {isCheckIn && checkOut && (
        <div className="absolute inset-y-1 left-1/2 right-0 bg-moss-100/60 z-0" />
      )}
      {isCheckOut && checkIn && (
        <div className="absolute inset-y-1 right-1/2 left-0 bg-moss-100/60 z-0" />
      )}

      {/* Left/Right connectors for HOVER check-in/out */}
      {isCheckIn && !checkOut && hoverDate && hoverDate > (checkIn as Date) && (
        <div className="absolute inset-y-1 left-1/2 right-0 bg-moss-50/80 border-y border-moss-100/50 z-0" />
      )}
      {hoverDate && isSameDay(day.date, hoverDate) && checkIn && !checkOut && hoverDate > (checkIn as Date) && (
        <div className="absolute inset-y-1 right-1/2 left-0 bg-moss-50/80 border-y border-moss-100/50 z-0" />
      )}

      {/* CIRCLE FOR START/END/SELECTED/TODAY */}
      {(isCheckIn || isCheckOut || isToday || (hoverDate && isSameDay(day.date, hoverDate))) && (
        <div className={cn(
          "absolute inset-1 rounded-full transition-transform duration-300 z-0",
          {
            "bg-moss-700 shadow-md scale-100": isCheckIn || isCheckOut,
            "border-2 border-moss-400 bg-white": isToday && !isCheckIn && !isCheckOut && !isRange,
            "bg-moss-200/50 border border-dashed border-moss-400": !isCheckIn && !isCheckOut && hoverDate && isSameDay(day.date, hoverDate)
          }
        )} />
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled || (isOccupied && !canClickWhenOccupied)}
        className={cn(
          getDayClasses(),
          "w-full h-full rounded-full focus:outline-none focus:ring-2 focus:ring-moss-400 focus:ring-offset-2",
          !isDisabled && !isOccupied && "hover:bg-moss-50/30"
        )}
      >
        <span className="relative z-10">
          {day.date.getDate()}
        </span>

        {/* Diagonal line for occupied dates */}
        {isOccupied && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-4 h-[1px] bg-moss-900 rotate-[35deg]" />
          </div>
        )}
      </button>
    </div>
  )
}
