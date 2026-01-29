import { useState, useEffect, useCallback, useRef } from 'react'

export interface AvailabilityData {
  availability: Record<string, 'booked'>
  lastUpdated: string
  eventsCount: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
let availabilityCache: Record<string, {
  data: AvailabilityData | null
  timestamp: number
}> = {}

export function useAvailability(chaletId: string = 'chale-anaue') {
  const [availability, setAvailability] = useState<Record<string, 'booked'>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchAvailability = useCallback(async (forceRefresh = false) => {
    // Verificar cache
    const now = Date.now()
    const chaletCache = availabilityCache[chaletId]
    if (
      !forceRefresh &&
      chaletCache?.data &&
      now - chaletCache.timestamp < CACHE_DURATION
    ) {
      setAvailability(chaletCache.data.availability)
      setIsLoading(false)
      return
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/availability?chaletId=${chaletId}`, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar disponibilidade')
      }

      const data = await response.json()

      if (data.success !== false) {
        setAvailability(data.availability || {})
        // Atualizar cache
        availabilityCache[chaletId] = {
          data: {
            availability: data.availability || {},
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            eventsCount: data.eventsCount || 0,
          },
          timestamp: now,
        }
      } else {
        throw new Error(data.error || 'Erro ao buscar disponibilidade')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return // Requisição foi cancelada, não atualizar estado
      }
      console.error('Erro ao buscar disponibilidade:', err)
      setError(err.message || 'Erro ao buscar disponibilidade')
      // Em caso de erro, usar cache se disponível
      if (availabilityCache[chaletId]?.data) {
        setAvailability(availabilityCache[chaletId].data!.availability)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAvailability()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchAvailability])

  const refreshAvailability = useCallback(() => {
    fetchAvailability(true)
  }, [fetchAvailability])

  const isDateAvailable = useCallback(
    (date: Date): boolean => {
      const dateStr = formatDateKey(date)
      return !availability[dateStr]
    },
    [availability]
  )

  return {
    availability,
    isLoading,
    error,
    refreshAvailability,
    isDateAvailable,
  }
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

