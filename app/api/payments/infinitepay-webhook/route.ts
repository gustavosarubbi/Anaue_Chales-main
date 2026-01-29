import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('[INFINITEPAY_WEBHOOK] Notificação recebida:', JSON.stringify(body))

        // InfinitePay Webhook v2 structure
        // Geralmente contém status como 'confirmed', 'paid', 'approved'
        const { state, external_id, id } = body

        if (!external_id) {
            return NextResponse.json({ success: false, error: 'External ID não encontrado' }, { status: 400 })
        }

        // Atualizar reserva no Supabase
        const supabase = createServerClient()
        if (!supabase) {
            console.error('[INFINITEPAY_WEBHOOK] Supabase não configurado')
            return NextResponse.json({ success: false }, { status: 500 })
        }

        // Mapear status da InfinitePay para o nosso sistema
        let reservationStatus = 'pending'
        if (['confirmed', 'paid', 'approved'].includes(state.toLowerCase())) {
            reservationStatus = 'confirmed'
        } else if (['cancelled', 'rejected', 'failed'].includes(state.toLowerCase())) {
            reservationStatus = 'cancelled'
        }

        const { error: updateError } = await supabase
            .from('reservations')
            .update({
                payment_id: id.toString(),
                payment_status: state,
                status: reservationStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', external_id)

        if (updateError) {
            console.error('[INFINITEPAY_WEBHOOK] Erro ao atualizar reserva:', updateError)
            return NextResponse.json({ success: false }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Webhook processado' })
    } catch (error) {
        console.error('[INFINITEPAY_WEBHOOK] Erro no processamento:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
