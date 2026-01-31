export type DateStatus = 'available' | 'occupied' | 'selected' | 'check-in' | 'check-out' | 'range' | 'disabled' | 'today'

export interface CalendarDayData {
  date: Date
  status: DateStatus
  isPast: boolean
  isToday: boolean
  isInRange?: boolean
}

export interface AvailabilityCalendarProps {
  checkIn?: Date
  checkOut?: Date
  onDatesChange: (checkIn: Date | undefined, checkOut: Date | undefined) => void
  disabledDates?: Date[]
  minDate?: Date
  maxDate?: Date
  numberOfMonths?: number
  chaletId?: string
}

export interface CalendarMonthProps {
  month: Date
  availability: Record<string, 'booked'>
  checkIn?: Date
  checkOut?: Date
  hoverDate?: Date | null
  onDateClick: (date: Date) => void
  onHoverDate: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
  isLoading?: boolean
  onPreviousMonth?: () => void
  onNextMonth?: () => void
  canGoPrevious?: boolean
  canGoNext?: boolean
}

export interface CalendarDayProps {
  day: CalendarDayData
  onClick: (date: Date) => void
  onHover: (date: Date | null) => void
  isSelected: boolean
  isInRange: boolean
  isHoverRange?: boolean
  hoverDate?: Date | null
  canClickWhenOccupied?: boolean
  checkIn?: Date
  checkOut?: Date
}

