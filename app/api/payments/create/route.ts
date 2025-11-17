import { NextResponse } from 'next/server'
import { mercadoPago } from '@/lib/mercadopago'

export async function POST(request: Request) {
  try {
    // Verificar se o Mercado Pago está configurado
    if (!mercadoPago) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Mercado Pago não está configurado. Por favor, configure as credenciais do Mercado Pago nas variáveis de ambiente.' 
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { reservationId, amount, guestName, guestEmail, checkIn, checkOut } = body

    if (!reservationId || !amount || !guestName || !guestEmail) {
      return NextResponse.json(
        { success: false, error: 'Dados do pagamento incompletos' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Criar preferência de pagamento no Mercado Pago
    const preference = await mercadoPago.create({
      items: [
        {
          id: reservationId,
          title: `Reserva - ${guestName}`,
          description: `Reserva de ${checkIn} até ${checkOut}`,
          quantity: 1,
          unit_price: parseFloat(amount.toString()),
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: guestName,
        email: guestEmail,
      },
      back_urls: {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      },
      auto_return: 'approved',
      external_reference: reservationId,
      notification_url: `${baseUrl}/api/payments/webhook`,
      statement_descriptor: 'ANAUECHALES',
    })

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    })
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Erro ao criar pagamento no Mercado Pago',
      },
      { status: 500 }
    )
  }
}

