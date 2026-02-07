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

    // Validar e converter amount
    const parsedAmount = parseFloat(amount.toString())
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valor do pagamento inválido' },
        { status: 400 }
      )
    }

    // Criar link de pagamento na InfinitePay
    const result = await createInfinitePayPayment({
      amount: parsedAmount,
      description: `Reserva Chalé - ${guestName} (${checkIn} a ${checkOut})`,
      orderId: reservationId,
      customer: {
        name: guestName,
        email: guestEmail
      }
    })

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
      stack: error?.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Erro ao processar pagamento com InfinitePay. Por favor, verifique as credenciais.',
      },
      { status: 500 }
    )
  }
}


