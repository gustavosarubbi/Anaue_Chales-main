import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Endpoint para bloquear manualmente uma reserva com cartão de crédito.
 * Usado quando recebemos notificação de pedido criado com cartão de crédito.
 * 
 * POST /api/reservations/block-credit-card
 * Body: { reservationId: "uuid" }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { reservationId } = body

        if (!reservationId) {
            return NextResponse.json(
                { success: false, error: 'ID da reserva não fornecido' },
                { status: 400 }
            )
        }

        const supabase = createServerClient()
        if (!supabase) {
            return NextResponse.json(
                { success: false, error: 'DB não configurado' },
                { status: 500 }
            )
        }

        // Buscar a reserva
        const { data: reservation, error: fetchError } = await supabase
            .from('reservations')
            .select('id, status, expires_at, check_in, check_out')
            .eq('id', reservationId)
            .single()

        if (fetchError || !reservation) {
            return NextResponse.json(
                { success: false, error: 'Reserva não encontrada' },
                { status: 404 }
            )
        }

        if (reservation.status === 'confirmed') {
            return NextResponse.json({
                success: true,
                message: 'Reserva já confirmada',
                alreadyConfirmed: true,
            })
        }

        // Estender expires_at para 24 horas
        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

        const { error: updateError } = await supabase
            .from('reservations')
            .update({
                expires_at: newExpiresAt,
                payment_status: 'pending_credit_card_awaiting_confirmation',
                updated_at: new Date().toISOString(),
            })
            .eq('id', reservationId)

        if (updateError) {
            console.error('[BLOCK_CREDIT_CARD] Erro ao bloquear:', updateError)
            return NextResponse.json(
                { success: false, error: 'Erro ao bloquear reserva', details: updateError.message },
                { status: 500 }
            )
        }

        console.log('[BLOCK_CREDIT_CARD] ✅ Calendário bloqueado:', {
            reservationId,
            checkIn: reservation.check_in,
            checkOut: reservation.check_out,
            expiresAt: newExpiresAt,
        })

        return NextResponse.json({
            success: true,
            message: 'Calendário bloqueado por 24h (cartão de crédito)',
            reservationId,
            expiresAt: newExpiresAt,
            checkIn: reservation.check_in,
            checkOut: reservation.check_out,
        })
    } catch (error: any) {
        console.error('[BLOCK_CREDIT_CARD] Erro:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno', details: error?.message },
            { status: 500 }
        )
    }
}
