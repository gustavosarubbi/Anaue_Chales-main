import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Endpoint para receber notificações quando um pedido é criado via Link integrado.
 * 
 * Este endpoint é chamado quando recebemos uma notificação de que um pedido foi criado,
 * mas o pagamento ainda não foi confirmado (especialmente para cartão de crédito que demora até 1 dia).
 * 
 * Formato esperado:
 * {
 *   "order_nsu": "UUID-do-pedido",  <-- nosso reservation ID
 *   "capture_method": "credit_card" | "pix" | etc,
 *   "amount": 70000,
 *   "invoice_slug": "abc123"
 * }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()

        const {
            order_nsu,
            capture_method,
            amount,
            invoice_slug,
        } = body

        console.log('[ORDER_NOTIFICATION] Notificação de pedido recebida:', {
            order_nsu,
            capture_method,
            amount,
            invoice_slug,
        })

        const reservationId = order_nsu

        if (!reservationId) {
            console.error('[ORDER_NOTIFICATION] order_nsu não encontrado no payload')
            return NextResponse.json(
                { success: false, error: 'order_nsu não encontrado' },
                { status: 400 }
            )
        }

        // Conectar ao Supabase
        const supabase = createServerClient()
        if (!supabase) {
            console.error('[ORDER_NOTIFICATION] Supabase não configurado')
            return NextResponse.json(
                { success: false, error: 'DB não configurado' },
                { status: 500 }
            )
        }

        // Verificar se a reserva existe
        const { data: reservation, error: fetchError } = await supabase
            .from('reservations')
            .select('id, status, expires_at')
            .eq('id', reservationId)
            .single()

        if (fetchError || !reservation) {
            console.error('[ORDER_NOTIFICATION] Reserva não encontrada:', reservationId)
            return NextResponse.json(
                { success: false, error: 'Reserva não encontrada' },
                { status: 404 }
            )
        }

        // Se já está confirmada, não fazer nada
        if (reservation.status === 'confirmed') {
            console.log('[ORDER_NOTIFICATION] Reserva já confirmada:', reservationId)
            return NextResponse.json({ success: true, message: 'Já confirmada' })
        }

        // Se for cartão de crédito, estender o expires_at para 24 horas
        // para manter o bloqueio no calendário até a confirmação do pagamento
        const isCreditCard = capture_method === 'credit_card' || capture_method === 'creditcard'
        
        if (isCreditCard) {
            // Estender expires_at para 24 horas a partir de agora
            const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            
            console.log('[ORDER_NOTIFICATION] Estendendo bloqueio para cartão de crédito:', {
                reservationId,
                oldExpiresAt: reservation.expires_at,
                newExpiresAt,
            })

            const { error: updateError } = await supabase
                .from('reservations')
                .update({
                    expires_at: newExpiresAt,
                    payment_status: `pending_${capture_method || 'credit_card'}`,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', reservationId)

            if (updateError) {
                console.error('[ORDER_NOTIFICATION] Erro ao atualizar reserva:', updateError)
                return NextResponse.json(
                    { success: false, error: 'Erro ao atualizar reserva' },
                    { status: 500 }
                )
            }

            console.log('[ORDER_NOTIFICATION] ✅ Bloqueio estendido para 24h:', reservationId)
            return NextResponse.json({
                success: true,
                message: 'Bloqueio estendido para cartão de crédito',
                expiresAt: newExpiresAt,
            })
        }

        // Para outros métodos de pagamento (PIX, etc), não fazer nada especial
        // pois geralmente são confirmados rapidamente
        console.log('[ORDER_NOTIFICATION] Método de pagamento não é cartão de crédito:', capture_method)
        return NextResponse.json({
            success: true,
            message: 'Notificação recebida (não requer bloqueio estendido)',
        })
    } catch (error) {
        console.error('[ORDER_NOTIFICATION] Erro no processamento:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno' },
            { status: 500 }
        )
    }
}
