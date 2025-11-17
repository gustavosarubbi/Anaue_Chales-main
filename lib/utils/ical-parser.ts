/**
 * Parser robusto para arquivos iCal (RFC 5545)
 * Suporta linhas continuadas, timezone, e diferentes formatos de data
 */

export interface CalendarEvent {
  start: Date
  end: Date
  summary: string
  source: string
  uid?: string
}

/**
 * Normaliza linhas continuadas do formato iCal
 * Linhas que começam com espaço ou tab são continuações da linha anterior
 */
function normalizeICalLines(icalData: string): string[] {
  const lines: string[] = []
  let currentLine = ''

  for (const line of icalData.split(/\r?\n/)) {
    // Se a linha começa com espaço ou tab, é continuação da linha anterior
    if (line.match(/^[ \t]/)) {
      currentLine += line.substring(1) // Remove o espaço/tab inicial
    } else {
      // Nova linha - salvar a anterior e começar nova
      if (currentLine) {
        lines.push(currentLine.trim())
      }
      currentLine = line.trim()
    }
  }

  // Adicionar última linha
  if (currentLine) {
    lines.push(currentLine.trim())
  }

  return lines
}

/**
 * Extrai o valor de uma propriedade iCal, removendo parâmetros
 * Ex: "DTSTART;VALUE=DATE:20240101" -> "20240101"
 */
function extractPropertyValue(line: string): string {
  const colonIndex = line.indexOf(':')
  if (colonIndex === -1) return ''
  return line.substring(colonIndex + 1)
}

/**
 * Verifica se uma propriedade tem um parâmetro específico
 */
function hasParameter(line: string, param: string): boolean {
  return line.includes(`;${param}=`) || line.startsWith(`${param}=`)
}

/**
 * Extrai o valor de um parâmetro
 */
function getParameterValue(line: string, param: string): string | null {
  const regex = new RegExp(`[;]${param}=([^:;]+)`, 'i')
  const match = line.match(regex)
  return match ? match[1] : null
}

/**
 * Parse de data iCal com suporte a diferentes formatos
 * Suporta: DATE (YYYYMMDD), DATE-TIME (YYYYMMDDTHHMMSS), DATE-TIME com timezone
 */
function parseICalDate(dateStr: string, timezone?: string | null): Date {
  // Remover espaços e caracteres especiais
  let cleanDateStr = dateStr.trim().replace(/[TZ]/g, '')

  // Se tem timezone, tentar ajustar (simplificado - para produção, usar biblioteca de timezone)
  // Por enquanto, assumimos que as datas já estão no timezone local ou UTC

  // Formato DATE: YYYYMMDD (8 caracteres)
  if (cleanDateStr.length === 8) {
    const year = Number.parseInt(cleanDateStr.substring(0, 4), 10)
    const month = Number.parseInt(cleanDateStr.substring(4, 6), 10) - 1
    const day = Number.parseInt(cleanDateStr.substring(6, 8), 10)

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error(`Data inválida: ${dateStr}`)
    }

    // Criar data no timezone local (meia-noite)
    const date = new Date(year, month, day, 0, 0, 0, 0)
    return date
  }

  // Formato DATE-TIME: YYYYMMDDHHMMSS (14 caracteres) ou YYYYMMDDHHMM (12 caracteres)
  if (cleanDateStr.length >= 12) {
    const year = Number.parseInt(cleanDateStr.substring(0, 4), 10)
    const month = Number.parseInt(cleanDateStr.substring(4, 6), 10) - 1
    const day = Number.parseInt(cleanDateStr.substring(6, 8), 10)
    const hour = cleanDateStr.length >= 10 ? Number.parseInt(cleanDateStr.substring(8, 10), 10) : 0
    const minute = cleanDateStr.length >= 12 ? Number.parseInt(cleanDateStr.substring(10, 12), 10) : 0
    const second = cleanDateStr.length >= 14 ? Number.parseInt(cleanDateStr.substring(12, 14), 10) : 0

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error(`Data inválida: ${dateStr}`)
    }

    const date = new Date(year, month, day, hour, minute, second, 0)
    return date
  }

  throw new Error(`Formato de data não suportado: ${dateStr}`)
}

/**
 * Parse de dados iCal com tratamento robusto de erros
 */
export function parseICalData(icalData: string, source: string): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const lines = normalizeICalLines(icalData)

  let currentEvent: Partial<CalendarEvent> = {}
  let inEvent = false
  let currentTimezone: string | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    if (!trimmedLine) continue

    // Detectar timezone (VTIMEZONE)
    if (trimmedLine.startsWith('BEGIN:VTIMEZONE')) {
      // Por enquanto, não processamos timezones complexos
      // Em produção, seria necessário usar uma biblioteca como date-fns-tz
      continue
    }

    if (trimmedLine.startsWith('TZID:')) {
      currentTimezone = extractPropertyValue(trimmedLine)
      continue
    }

    // Início de evento
    if (trimmedLine === 'BEGIN:VEVENT') {
      inEvent = true
      currentEvent = { source }
      currentTimezone = null // Reset timezone para cada evento
    }
    // Fim de evento
    else if (trimmedLine === 'END:VEVENT' && inEvent) {
      if (currentEvent.start && currentEvent.end) {
        // Validar que a data de fim é após a data de início
        if (currentEvent.end >= currentEvent.start) {
          events.push(currentEvent as CalendarEvent)
        } else {
          console.warn(`Evento inválido em ${source}: data de fim anterior à data de início`, {
            start: currentEvent.start,
            end: currentEvent.end,
          })
        }
      }
      inEvent = false
      currentEvent = {}
    }
    // Propriedades do evento
    else if (inEvent) {
      try {
        // DTSTART
        if (trimmedLine.startsWith('DTSTART')) {
          const isDateOnly = hasParameter(trimmedLine, 'VALUE=DATE') || !trimmedLine.includes('T')
          const dateStr = extractPropertyValue(trimmedLine)
          const eventTimezone = getParameterValue(trimmedLine, 'TZID') || currentTimezone

          try {
            currentEvent.start = parseICalDate(dateStr, eventTimezone)
            // Se for apenas data (sem hora), garantir que está em meia-noite
            if (isDateOnly) {
              currentEvent.start.setHours(0, 0, 0, 0)
            }
          } catch (error) {
            console.warn(`Erro ao parsear DTSTART em ${source}:`, dateStr, error)
          }
        }
        // DTEND
        else if (trimmedLine.startsWith('DTEND')) {
          const isDateOnly = hasParameter(trimmedLine, 'VALUE=DATE') || !trimmedLine.includes('T')
          const dateStr = extractPropertyValue(trimmedLine)
          const eventTimezone = getParameterValue(trimmedLine, 'TZID') || currentTimezone

          try {
            currentEvent.end = parseICalDate(dateStr, eventTimezone)
            // Se for apenas data (sem hora), garantir que está em meia-noite
            if (isDateOnly) {
              currentEvent.end.setHours(0, 0, 0, 0)
            }
            
            // IMPORTANTE: No formato iCal, DTEND é exclusivo (não inclui o último dia)
            // Mas para nossa lógica de reservas, precisamos que o end seja o dia de check-out
            // que já está correto, pois getDatesBetween exclui o end
            // Porém, se o DTEND for no dia 26, isso significa que a reserva termina no dia 26
            // e o dia 26 DEVE estar disponível (check-out libera o dia)
          } catch (error) {
            console.warn(`Erro ao parsear DTEND em ${source}:`, dateStr, error)
          }
        }
        // DURATION (alternativa ao DTEND)
        else if (trimmedLine.startsWith('DURATION') && currentEvent.start && !currentEvent.end) {
          const durationStr = extractPropertyValue(trimmedLine)
          // Parse simples de duração (ex: P3D = 3 dias, P1W = 1 semana)
          const daysMatch = durationStr.match(/P(\d+)D/)
          if (daysMatch) {
            const days = Number.parseInt(daysMatch[1], 10)
            currentEvent.end = new Date(currentEvent.start)
            currentEvent.end.setDate(currentEvent.end.getDate() + days)
          }
        }
        // SUMMARY
        else if (trimmedLine.startsWith('SUMMARY')) {
          currentEvent.summary = extractPropertyValue(trimmedLine) || 'Reserva'
          // Decodificar caracteres especiais básicos
          currentEvent.summary = currentEvent.summary
            .replace(/\\n/g, '\n')
            .replace(/\\,/g, ',')
            .replace(/\\;/g, ';')
            .replace(/\\\\/g, '\\')
        }
        // UID
        else if (trimmedLine.startsWith('UID')) {
          currentEvent.uid = extractPropertyValue(trimmedLine)
        }
      } catch (error) {
        console.warn(`Erro ao processar linha em ${source}:`, trimmedLine, error)
      }
    }
  }

  return events
}

/**
 * Busca dados iCal com retry e melhor tratamento de erros
 */
export async function fetchICalData(
  url: string,
  source: string,
  retries: number = 3,
  timeout: number = 10000
): Promise<CalendarEvent[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Calendar-Sync/2.0)',
          'Accept': 'text/calendar, text/plain, */*',
        },
        signal: controller.signal,
        // Cache reduzido para melhor sincronização (5 minutos)
        next: { revalidate: 300 },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`iCal não encontrado para ${source}: ${url}`)
          return []
        }
        if (response.status >= 500 && attempt < retries) {
          // Retry em caso de erro do servidor
          const delay = attempt * 1000 // Backoff exponencial
          console.warn(
            `Erro ${response.status} ao buscar iCal de ${source} (tentativa ${attempt}/${retries}), tentando novamente em ${delay}ms...`
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
        console.warn(`Erro ao buscar iCal de ${source}: ${response.status} ${response.statusText}`)
        return []
      }

      const icalData = await response.text()

      // Validar que é um arquivo iCal válido
      if (!icalData.includes('BEGIN:VCALENDAR') || !icalData.includes('END:VCALENDAR')) {
        console.warn(`Arquivo iCal inválido de ${source}: não contém VCALENDAR`)
        return []
      }

      const events = parseICalData(icalData, source)
      console.log(`✓ Sincronizado ${source}: ${events.length} eventos encontrados`)
      return events
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Timeout ao buscar iCal de ${source} (tentativa ${attempt}/${retries})`)
      } else {
        console.error(`Erro ao processar iCal de ${source} (tentativa ${attempt}/${retries}):`, error)
      }

      if (attempt < retries) {
        const delay = attempt * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        console.error(`Falha ao buscar iCal de ${source} após ${retries} tentativas`)
      }
    }
  }

  return []
}

