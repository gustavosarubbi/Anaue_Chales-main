import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Webhook da InfinitePay - chamado automaticamente quando um pagamento é aprovado.
 * 
 * Formato do body (conforme documentação oficial):
 * {
 *   "invoice_slug": "abc123",
 *   "amount": 70000,
 *   "paid_amount": 70000,
 *   "installments": 1,
 *   "capture_method": "credit_card",
 *   "transaction_nsu": "UUID-da-transacao",
 *   "order_nsu": "UUID-do-pedido",       <-- nosso reservation ID
 *   "receipt_url": "https://comprovante.com/123",
 *   "items": [...]
 * }
 * 
 * Respostas:
 * - 200 OK: Webhook processado com sucesso
 * - 400 Bad Request: Erro (InfinitePay vai reenviar!)
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Extrair campos do formato novo da InfinitePay
        const {
            order_nsu,
            invoice_slug,
            amount,
            paid_amount,
            installments,
            capture_method,
            transaction_nsu,
            receipt_url,
        } = body

        console.log('[INFINITEPAY_WEBHOOK] Notificação recebida:', {
            order_nsu,
            invoice_slug,
            capture_method,
            amount,
            paid_amount,
            transaction_nsu,
        })

        // O order_nsu é o nosso reservation ID
        const reservationId = order_nsu

        if (!reservationId) {
            console.error('[INFINITEPAY_WEBHOOK] order_nsu não encontrado no payload')
            // Retornar 400 para que a InfinitePay reenvie
            return NextResponse.json(
                { success: false, error: 'order_nsu não encontrado' },
                { status: 400 }
            )
        }

        // Conectar ao Supabase
        const supabase = createServerClient()
        if (!supabase) {
            console.error('[INFINITEPAY_WEBHOOK] Supabase não configurado')
            // Retornar 400 para que a InfinitePay reenvie
            return NextResponse.json(
                { success: false, error: 'DB não configurado' },
                { status: 400 }
            )
        }

        // Verificar se a reserva existe
        const { data: reservation, error: fetchError } = await supabase
            .from('reservations')
            .select('id, status')
            .eq('id', reservationId)
            .single()

        if (fetchError || !reservation) {
            console.error('[INFINITEPAY_WEBHOOK] Reserva não encontrada:', reservationId)
            return NextResponse.json(
                { success: false, error: 'Reserva não encontrada' },
                { status: 400 }
            )
        }

        // Se já está confirmada, retornar sucesso sem atualizar
        if (reservation.status === 'confirmed') {
            console.log('[INFINITEPAY_WEBHOOK] Reserva já confirmada:', reservationId)
            return NextResponse.json({ success: true, message: 'Já confirmada' })
        }

        // Atualizar reserva para confirmada
        const { error: updateError } = await supabase
            .from('reservations')
            .update({
                status: 'confirmed',
                payment_id: transaction_nsu || invoice_slug || null,
                payment_status: `paid_${capture_method || 'webhook'}`,
                updated_at: new Date().toISOString(),
            })
            .eq('id', reservationId)

        if (updateError) {
            console.error('[INFINITEPAY_WEBHOOK] Erro ao atualizar reserva:', updateError)
            // Retornar 400 para que a InfinitePay reenvie
            return NextResponse.json(
                { success: false, error: 'Erro ao atualizar' },
                { status: 400 }
            )
        }

        console.log('[INFINITEPAY_WEBHOOK] ✅ Reserva confirmada com sucesso:', reservationId, {
            capture_method,
            amount: paid_amount || amount,
            receipt_url,
        })

        // Responder 200 OK conforme documentação
        return NextResponse.json({ success: true, message: 'Webhook processado' })
    } catch (error) {
        console.error('[INFINITEPAY_WEBHOOK] Erro no processamento:', error)
        // Retornar 400 para que a InfinitePay reenvie
        return NextResponse.json(
            { success: false, error: 'Erro interno' },
            { status: 400 }
        )
    }
}
