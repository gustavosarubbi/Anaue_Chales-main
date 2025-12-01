/**
 * Utilitários para cálculo de preços e validação de reservas
 */

export interface ReservationDates {
  checkIn: Date
  checkOut: Date
}

export interface PriceCalculation {
  basePrice: number
  guestPrice: number
  childrenPrice: number
  totalNights: number
  totalPrice: number
  breakdown: {
    nights: Array<{
      date: string
      isWeekend: boolean
      price: number
    }>
  }
}

// Preços por tipo de dia
export const PRICING = {
  WEEKEND: 800, // Sexta a Domingo, feriados e vésperas
  WEEKDAY: 650, // Segunda a quinta
  EXTRA_ADULT: 150, // Por adulto extra (acima de 2)
  EXTRA_CHILD: 100, // Por criança (6-15 anos)
  CHILD_UNDER_6: 0, // Crianças até 5 anos não pagam
} as const

/**
 * Verifica se uma data é fim de semana (sexta, sábado, domingo)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  // 0 = domingo, 5 = sexta, 6 = sábado
  // Consideramos domingo=0, sexta=5, sábado=6 como finais de semana
  return day === 0 || day === 5 || day === 6
}

/**
 * Verifica se uma data é feriado ou véspera de feriado
 * TODO: Implementar lista completa de feriados brasileiros
 */
export function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Feriados fixos brasileiros
  const holidays: Array<[number, number]> = [
    [1, 1],   // Ano Novo
    [4, 21],  // Tiradentes
    [5, 1],   // Dia do Trabalhador
    [9, 7],   // Independência
    [10, 12], // Nossa Senhora Aparecida
    [11, 2],  // Finados
    [11, 15], // Proclamação da República
    [12, 25], // Natal
  ]
  
  return holidays.some(([m, d]) => m === month && d === day)
}

/**
 * Verifica se uma data deve usar preço de final de semana
 */
export function isWeekendOrHoliday(date: Date): boolean {
  return isWeekend(date) || isHoliday(date)
}

/**
 * Calcula o número de noites entre check-in e check-out
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = checkOut.getTime() - checkIn.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(1, diffDays)
}

/**
 * Calcula o preço total da reserva
 */
export function calculatePrice(
  checkIn: Date,
  checkOut: Date,
  guestCount: number = 2,
  childrenCount: number = 0
): PriceCalculation {
  const nights = calculateNights(checkIn, checkOut)
  const dates = getDatesBetween(checkIn, checkOut)
  
  let basePrice = 0
  const nightsBreakdown = dates.map((dateStr) => {
    const date = new Date(dateStr)
    const isWeekendDay = isWeekendOrHoliday(date)
    const nightPrice = isWeekendDay ? PRICING.WEEKEND : PRICING.WEEKDAY
    
    basePrice += nightPrice
    
    return {
      date: dateStr,
      isWeekend: isWeekendDay,
      price: nightPrice,
    }
  })
  
  // Calcular preço por hóspedes extras
  // Base é 2 adultos (casal)
  const extraAdults = Math.max(0, guestCount - 2)
  const guestPrice = extraAdults * PRICING.EXTRA_ADULT * nights
  
  // Crianças de 6-15 anos pagam, menores de 6 não pagam
  const payingChildren = Math.max(0, childrenCount)
  const childrenPrice = payingChildren * PRICING.EXTRA_CHILD * nights
  
  const totalPrice = basePrice + guestPrice + childrenPrice
  
  return {
    basePrice,
    guestPrice,
    childrenPrice,
    totalNights: nights,
    totalPrice,
    breakdown: {
      nights: nightsBreakdown,
    },
  }
}

/**
 * Retorna todas as datas entre check-in e check-out (excluindo check-out)
 * Se check-in e check-out forem no mesmo dia, retorna apenas a data de check-in
 */
export function getDatesBetween(startDate: Date, endDate: Date): string[] {
  const dates: string[] = []
  
  // Normalizar datas para comparar apenas o dia
  const normalizedStart = new Date(startDate)
  normalizedStart.setHours(0, 0, 0, 0)
  const normalizedEnd = new Date(endDate)
  normalizedEnd.setHours(0, 0, 0, 0)
  
  const current = new Date(normalizedStart)
  
  // Se check-in e check-out são no mesmo dia, retorna apenas a data de check-in
  if (normalizedStart.getTime() === normalizedEnd.getTime()) {
    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    dates.push(`${year}-${month}-${day}`)
    return dates
  }
  
  // Ajustar para excluir a data de check-out
  const adjustedEnd = new Date(normalizedEnd)
  adjustedEnd.setDate(adjustedEnd.getDate() - 1)
  
  while (current <= adjustedEnd) {
    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    dates.push(`${year}-${month}-${day}`)
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

/**
 * Valida se as datas de reserva são válidas
 */
export function validateReservationDates(checkIn: Date, checkOut: Date): {
  valid: boolean
  error?: string
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const checkInDate = new Date(checkIn)
  checkInDate.setHours(0, 0, 0, 0)
  
  const checkOutDate = new Date(checkOut)
  checkOutDate.setHours(0, 0, 0, 0)
  
  if (checkInDate < today) {
    return {
      valid: false,
      error: 'A data de check-in não pode ser no passado',
    }
  }
  
  if (checkOutDate < checkInDate) {
    return {
      valid: false,
      error: 'A data de check-out não pode ser anterior à data de check-in',
    }
  }
  
  // Permite check-in e check-out no mesmo dia (será calculado como 1 noite)
  const nights = calculateNights(checkInDate, checkOutDate)
  if (nights < 1) {
    return {
      valid: false,
      error: 'A reserva deve ter pelo menos 1 noite',
    }
  }
  
  return { valid: true }
}

/**
 * Formata uma data para o formato YYYY-MM-DD
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formata uma data para exibição em português
 */
export function formatDatePortuguese(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

