import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkInfinitePayPaymentStatus } from '@/lib/infinitepay'

/**
 * Endpoint para confirmar uma reserva após pagamento via InfinitePay.
 * 
 * Chamado pela página de sucesso quando o usuário é redirecionado de volta
 * após completar o pagamento. Também funciona como fallback quando o webhook
 * da InfinitePay não dispara.
 * 
 * Pode opcionalmente verificar o status na InfinitePay antes de confirmar.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { reservationId, transactionNsu, slug, captureMethod } = body

        if (!reservationId) {
            return NextResponse.json(
                { success: false, error: 'ID da reserva não fornecido' },
                { status: 400 }
            )
        }

        console.log('[RESERVATIONS_CONFIRM] Confirmando reserva:', reservationId, {
            transactionNsu, slug, captureMethod,
        })

        const supabase = createServerClient()
        if (!supabase) {
            console.error('[RESERVATIONS_CONFIRM] Supabase não configurado')
            return NextResponse.json(
                { success: false, error: 'Serviço indisponível' },
                { status: 500 }
            )
        }

        // Buscar a reserva atual
        const { data: reservation, error: fetchError } = await supabase
            .from('reservations')
            .select('id, status, expires_at')
            .eq('id', reservationId)
            .single()

        if (fetchError || !reservation) {
            console.error('[RESERVATIONS_CONFIRM] Reserva não encontrada:', reservationId)
            return NextResponse.json(
                { success: false, error: 'Reserva não encontrada' },
                { status: 404 }
            )
        }

        // Já confirmada
        if (reservation.status === 'confirmed') {
            return NextResponse.json({
                success: true,
                message: 'Reserva já estava confirmada',
                status: 'confirmed'
            })
        }

        // Só confirmar se ainda está pendente
        if (reservation.status !== 'pending') {
            return NextResponse.json(
                { success: false, error: `Reserva não pode ser confirmada (status: ${reservation.status})` },
                { status: 400 }
            )
        }

        // Opcional: verificar status do pagamento na InfinitePay
        let paymentVerified = false
        if (transactionNsu || slug) {
            try {
                const paymentStatus = await checkInfinitePayPaymentStatus({
                    orderNsu: reservationId,
                    transactionNsu,
                    slug,
                })
                paymentVerified = paymentStatus.paid === true
                console.log('[RESERVATIONS_CONFIRM] Verificação InfinitePay:', paymentStatus)
            } catch (err) {
                console.warn('[RESERVATIONS_CONFIRM] Não foi possível verificar na InfinitePay:', err)
            }
        }

        // Confirmar a reserva
        // Se o pagamento foi verificado na InfinitePay, usar 'paid_verified'
        // Se não foi possível verificar (mas o redirect aconteceu), usar 'paid_via_redirect'
        const paymentStatusLabel = paymentVerified
            ? `paid_verified_${captureMethod || 'unknown'}`
            : `paid_via_redirect_${captureMethod || 'unknown'}`

        const { error: updateError } = await supabase
            .from('reservations')
            .update({
                status: 'confirmed',
                payment_status: paymentStatusLabel,
                payment_id: transactionNsu || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', reservationId)

        if (updateError) {
            console.error('[RESERVATIONS_CONFIRM] Erro ao confirmar:', updateError)
            return NextResponse.json(
                { success: false, error: 'Erro ao confirmar reserva' },
                { status: 500 }
            )
        }

        console.log('[RESERVATIONS_CONFIRM] ✅ Reserva confirmada:', reservationId, paymentStatusLabel)

        return NextResponse.json({
            success: true,
            message: 'Reserva confirmada com sucesso',
            status: 'confirmed',
            paymentVerified,
        })
    } catch (error) {
        console.error('[RESERVATIONS_CONFIRM] Erro:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno' },
            { status: 500 }
        )
    }
}
