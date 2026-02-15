import { NextResponse } from 'next/server'
import {
  getBeds24Config,
  isBeds24Enabled,
  getBeds24Availability,
  blockBeds24Dates,
} from '@/lib/beds24'

/**
 * GET /api/test-beds24 - Testa conectividade e operações da API Beds24.
 * Só para desenvolvimento/verificação; em produção pode ser protegido ou removido.
 */
export async function GET() {
  const config = getBeds24Config()
  const enabled = isBeds24Enabled()

  if (!enabled || !config) {
    return NextResponse.json({
      ok: false,
      error: 'Beds24 não configurado (BEDS24_API_KEY, BEDS24_PROP_KEY ou BEDS24_ROOM_ID faltando)',
      env: {
        hasApiKey: !!process.env.BEDS24_API_KEY,
        hasPropKey: !!process.env.BEDS24_PROP_KEY,
        hasRoomId: !!process.env.BEDS24_ROOM_ID,
      },
    })
  }

  const results: Record<string, unknown> = {
    config: {
      roomId: config.roomId,
      propKeyMasked: config.propKey ? `${config.propKey.slice(0, 4)}***` : '',
    },
  }

  // 1) Puxar disponibilidade (getRoomDates)
  const today = new Date()
  const from = today.toISOString().slice(0, 10)
  const to = new Date(today.getTime() + 31 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const availability = await getBeds24Availability(from, to)
  results.getRoomDates = {
    success: availability.success,
    error: availability.error,
    bookedCount: availability.bookedDates ? Object.keys(availability.bookedDates).length : 0,
    sampleDates: availability.bookedDates
      ? Object.keys(availability.bookedDates).slice(0, 5)
      : [],
  }

  // 2) Testar bloqueio de uma data (setRoomDates) - data 2 meses à frente para não atrapalhar
  const testDate = new Date(today)
  testDate.setMonth(testDate.getMonth() + 2)
  const testFrom = testDate.toISOString().slice(0, 10)
  const blockResult = await blockBeds24Dates(testFrom, testFrom)
  results.setRoomDates_block = {
    success: blockResult.success,
    error: blockResult.error,
    date: testFrom,
    note: 'Uma noite bloqueada para teste; pode desbloquear no Beds24 se quiser.',
  }

  const allOk =
    results.getRoomDates &&
    (results.getRoomDates as { success: boolean }).success &&
    results.setRoomDates_block &&
    (results.setRoomDates_block as { success: boolean }).success

  return NextResponse.json({
    ok: !!allOk,
    message: allOk
      ? 'API Beds24 OK: puxando disponibilidade e bloqueando datas funcionando.'
      : 'Algum passo falhou; veja detalhes abaixo.',
    results,
  })
}
