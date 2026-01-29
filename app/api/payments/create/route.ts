import { NextResponse } from 'next/server'
import { createInfinitePayPayment } from '@/lib/infinitepay'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reservationId, amount, guestName, guestEmail, checkIn, checkOut } = body

    if (!reservationId || !amount || !guestName || !guestEmail) {
      return NextResponse.json(
        { success: false, error: 'Dados do pagamento incompletos' },
        { status: 400 }
      )
    }

    console.log('[PAYMENTS_CREATE] Usando InfinitePay para reserva:', reservationId)

    // Criar link de pagamento na InfinitePay
    const result = await createInfinitePayPayment({
      amount: parseFloat(amount.toString()),
      description: `Reserva Chalé - ${guestName} (${checkIn} a ${checkOut})`,
      orderId: reservationId,
      customer: {
        name: guestName,
        email: guestEmail
      }
    })

    console.log('[PAYMENTS_CREATE] Link InfinitePay gerado:', result.paymentId)

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      initPoint: result.url,
      sandboxInitPoint: result.url,
    })
  } catch (error: any) {
    console.error('[PAYMENTS_CREATE] Erro fatal InfinitePay:', {
      message: error?.message,
      name: error?.name,
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar pagamento com InfinitePay. Por favor, verifique as credenciais.',
      },
      { status: 500 }
    )
  }
}


