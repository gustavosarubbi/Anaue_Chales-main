import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Mercado Pago envia notificações via webhook
    // O tipo pode ser 'payment' para pagamentos individuais
    const { type, data } = body

    if (type === 'payment') {
      const paymentId = data.id

      // Buscar informações do pagamento
      // Em produção, você deveria buscar do Mercado Pago para validar
      // Por enquanto, vamos assumir que a notificação contém os dados necessários

      const { external_reference, status } = data

      if (!external_reference) {
        return NextResponse.json({ success: false, error: 'External reference não encontrado' }, { status: 400 })
      }

      // Atualizar reserva no Supabase
      const supabase = createServerClient()

      if (!supabase) {
        console.error('Supabase não configurado')
        return NextResponse.json(
          { success: false, error: 'Serviço de banco de dados não configurado' },
          { status: 500 }
        )
      }

      let reservationStatus = 'pending'
      if (status === 'approved') {
        reservationStatus = 'confirmed'
      } else if (status === 'cancelled' || status === 'rejected') {
        reservationStatus = 'cancelled'
      }

      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          payment_id: paymentId.toString(),
          payment_status: status,
          status: reservationStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', external_reference)

      if (updateError) {
        console.error('Erro ao atualizar reserva:', updateError)
        return NextResponse.json(
          { success: false, error: 'Erro ao atualizar reserva' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Webhook processado com sucesso' })
    }

    // Para outros tipos de notificação, retornar sucesso mas não processar
    return NextResponse.json({ success: true, message: 'Notificação recebida' })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json({ success: false, error: 'Erro ao processar webhook' }, { status: 500 })
  }
}

// GET endpoint para verificação manual de status de pagamento
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')
    const externalReference = searchParams.get('external_reference')

    if (!externalReference) {
      return NextResponse.json({ success: false, error: 'External reference é obrigatório' }, { status: 400 })
    }

    // Buscar reserva no Supabase
    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Serviço de banco de dados não configurado' },
        { status: 500 }
      )
    }

    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', externalReference)
      .single()

    if (error || !reservation) {
      return NextResponse.json({ success: false, error: 'Reserva não encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        status: reservation.status,
        payment_status: reservation.payment_status,
        payment_id: reservation.payment_id,
      },
    })
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error)
    return NextResponse.json({ success: false, error: 'Erro ao verificar status' }, { status: 500 })
  }
}

