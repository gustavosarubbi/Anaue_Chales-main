"use client"

import { ReactNode } from "react"
import { CalendarModalWrapper } from "./CalendarModalWrapper"
import { CalendarContent, CalendarContentProps } from "../calendar/CalendarContent"

interface CheckOutModalProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  onConfirm: () => void
  onCancel: () => void
  bookedDates: Date[]
  loadingAvailability: boolean
  disabledDates?: Date[]
  minDate?: Date
  checkIn?: Date
  isDateDisabled: (date: Date) => boolean
  getAvailableSequentialDates?: () => Date[]
  trigger: ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckOutModal({
  selectedDate,
  onDateSelect,
  onConfirm,
  onCancel,
  bookedDates,
  loadingAvailability,
  minDate,
  checkIn,
  isDateDisabled,
  getAvailableSequentialDates,
  trigger,
  isOpen,
  onOpenChange,
}: CheckOutModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  const calendarContentProps: CalendarContentProps = {
    type: "check-out",
    selectedDate,
    onDateSelect,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
    bookedDates,
    loadingAvailability,
    minDate,
    checkIn,
    isDateDisabled,
    getAvailableSequentialDates,
  }

  return (
    <CalendarModalWrapper
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title="Escolha a data de check-out"
    >
      <CalendarContent {...calendarContentProps} />
    </CalendarModalWrapper>
  )
}
