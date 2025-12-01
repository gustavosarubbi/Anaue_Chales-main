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
}

export interface CalendarMonthProps {
  month: Date
  availability: Record<string, 'booked'>
  checkIn?: Date
  checkOut?: Date
  onDateClick: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  isLoading?: boolean
}

export interface CalendarDayProps {
  day: CalendarDayData
  onClick: (date: Date) => void
  isSelected: boolean
  isInRange: boolean
  canClickWhenOccupied?: boolean
}

