import { NextResponse } from 'next/server'
import { checkReservationAvailability } from '@/lib/availability'

export async function POST(request: Request) {
  try {
    const { checkIn, checkOut, chaletId } = await request.json()

    // ... validation ...

    const result = await checkReservationAvailability(checkIn, checkOut, chaletId)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      ...result.data
    })
  } catch (error) {
    console.error('Erro na rota de disponibilidade:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
