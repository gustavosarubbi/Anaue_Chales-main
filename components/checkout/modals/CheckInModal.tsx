"use client"

import { ReactNode } from "react"
import { CalendarModalWrapper } from "./CalendarModalWrapper"
import { CalendarContent, CalendarContentProps } from "../calendar/CalendarContent"

interface CheckInModalProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  onConfirm: () => void
  onCancel: () => void
  bookedDates: Date[]
  loadingAvailability: boolean
  disabledDates?: Date[]
  minDate?: Date
  isDateDisabled: (date: Date) => boolean
  trigger: ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckInModal({
  selectedDate,
  onDateSelect,
  onConfirm,
  onCancel,
  bookedDates,
  loadingAvailability,
  minDate,
  isDateDisabled,
  trigger,
  isOpen,
  onOpenChange,
}: CheckInModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  const calendarContentProps: CalendarContentProps = {
    type: "check-in",
    selectedDate,
    onDateSelect,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
    bookedDates,
    loadingAvailability,
    minDate,
    isDateDisabled,
  }

  return (
    <CalendarModalWrapper
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title="Escolha a data de check-in"
    >
      <CalendarContent {...calendarContentProps} />
    </CalendarModalWrapper>
  )
}
