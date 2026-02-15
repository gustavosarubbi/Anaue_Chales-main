import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createInfinitePayPayment } from '@/lib/infinitepay'
import { getChaletDisplayName } from '@/lib/utils/reservation'

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

    // Buscar a reserva para obter o chalé e garantir consistência (descrição na Infinite Pay + seu controle no site)
    let chaletName = 'Chalé'
    const supabase = createServerClient()
    if (supabase) {
      const { data: reservation } = await supabase
        .from('reservations')
        .select('chalet_id')
        .eq('id', reservationId)
        .single()
      if (reservation?.chalet_id) {
        chaletName = getChaletDisplayName(reservation.chalet_id)
      }
    }

    const description = `Reserva ${chaletName} - ${guestName} (${checkIn} a ${checkOut})`

    // Criar link de pagamento na InfinitePay (descrição com nome do chalé para aparecer no app Infinite Pay e no comprovante)
    const result = await createInfinitePayPayment({
      amount: parsedAmount,
      description,
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


