import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getChaletDisplayName } from '@/lib/utils/reservation'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createServerClient()

        if (!supabase) {
            return NextResponse.json({ success: false, error: 'DB error' }, { status: 500 })
        }

        const { data: reservation, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !reservation) {
            return NextResponse.json({ success: false, error: 'Reserva não encontrada' }, { status: 404 })
        }

        const now = new Date()
        const expiresAt = new Date(reservation.expires_at)
        const isExpired = reservation.status === 'pending' && now > expiresAt

        // Se expirou e ainda está pendente, poderíamos atualizar aqui ou apenas reportar
        // Para garantir consistência, vamos reportar como expirado
        const currentStatus = isExpired ? 'expired' : reservation.status

        return NextResponse.json({
            success: true,
            status: currentStatus,
            paymentStatus: reservation.payment_status,
            expiresAt: reservation.expires_at,
            serverTime: now.toISOString(),
            isExpired,
            chaletId: reservation.chalet_id ?? null,
            chaletDisplayName: getChaletDisplayName(reservation.chalet_id),
            checkIn: reservation.check_in,
            checkOut: reservation.check_out,
            guestName: reservation.guest_name,
        })
    } catch (error) {
        console.error('[RESERVATIONS_STATUS] Erro:', error)
        return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
    }
}
