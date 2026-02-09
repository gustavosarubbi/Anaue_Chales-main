import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Endpoint para limpar reservas expiradas não pagas.
 * 
 * Este endpoint deve ser chamado periodicamente (via cron job ou manualmente)
 * para liberar bloqueios no calendário de reservas que expiraram sem pagamento.
 * 
 * Processa reservas com:
 * - status = 'pending'
 * - expires_at < agora
 * - payment_status não contém 'paid'
 */
export async function POST(request: Request) {
    try {
        // Opcional: verificar autenticação/autorização se necessário
        const authHeader = request.headers.get('authorization')
        const expectedToken = process.env.CLEANUP_SECRET_TOKEN
        
        if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json(
                { success: false, error: 'Não autorizado' },
                { status: 401 }
            )
        }

        const supabase = createServerClient()
        if (!supabase) {
            console.error('[CLEANUP_EXPIRED] Supabase não configurado')
            return NextResponse.json(
                { success: false, error: 'DB não configurado' },
                { status: 500 }
            )
        }

        const now = new Date().toISOString()

        // Buscar reservas expiradas não pagas
        const { data: expiredReservations, error: fetchError } = await supabase
            .from('reservations')
            .select('id, check_in, check_out, status, expires_at, payment_status, guest_name')
            .eq('status', 'pending')
            .lt('expires_at', now)
            .not('payment_status', 'like', '%paid%')

        if (fetchError) {
            console.error('[CLEANUP_EXPIRED] Erro ao buscar reservas expiradas:', fetchError)
            return NextResponse.json(
                { success: false, error: 'Erro ao buscar reservas' },
                { status: 500 }
            )
        }

        if (!expiredReservations || expiredReservations.length === 0) {
            console.log('[CLEANUP_EXPIRED] Nenhuma reserva expirada encontrada')
            return NextResponse.json({
                success: true,
                message: 'Nenhuma reserva expirada encontrada',
                cleaned: 0,
            })
        }

        console.log(`[CLEANUP_EXPIRED] Encontradas ${expiredReservations.length} reservas expiradas`)

        // Atualizar status para 'expired' ou 'cancelled'
        const reservationIds = expiredReservations.map(r => r.id)
        
        const { error: updateError, count } = await supabase
            .from('reservations')
            .update({
                status: 'expired',
                payment_status: 'expired_no_payment',
                updated_at: new Date().toISOString(),
            })
            .in('id', reservationIds)
            .select('id', { count: 'exact' })

        if (updateError) {
            console.error('[CLEANUP_EXPIRED] Erro ao atualizar reservas:', updateError)
            return NextResponse.json(
                { success: false, error: 'Erro ao atualizar reservas' },
                { status: 500 }
            )
        }

        console.log(`[CLEANUP_EXPIRED] ✅ ${expiredReservations.length} reservas marcadas como expiradas:`, {
            ids: reservationIds,
            details: expiredReservations.map(r => ({
                id: r.id,
                guest: r.guest_name,
                checkIn: r.check_in,
                checkOut: r.check_out,
                expiredAt: r.expires_at,
            })),
        })

        return NextResponse.json({
            success: true,
            message: `${expiredReservations.length} reserva(s) expirada(s) processada(s)`,
            cleaned: expiredReservations.length,
            reservations: expiredReservations.map(r => ({
                id: r.id,
                checkIn: r.check_in,
                checkOut: r.check_out,
            })),
        })
    } catch (error: any) {
        console.error('[CLEANUP_EXPIRED] Erro no processamento:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno', details: error?.message },
            { status: 500 }
        )
    }
}

/**
 * GET endpoint para verificar quantas reservas expiradas existem (sem processar)
 */
export async function GET(request: Request) {
    try {
        const supabase = createServerClient()
        if (!supabase) {
            return NextResponse.json(
                { success: false, error: 'DB não configurado' },
                { status: 500 }
            )
        }

        const now = new Date().toISOString()

        const { data: expiredReservations, error: fetchError } = await supabase
            .from('reservations')
            .select('id, check_in, check_out, status, expires_at, payment_status, guest_name')
            .eq('status', 'pending')
            .lt('expires_at', now)
            .not('payment_status', 'like', '%paid%')

        if (fetchError) {
            return NextResponse.json(
                { success: false, error: 'Erro ao buscar reservas' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            count: expiredReservations?.length || 0,
            reservations: expiredReservations || [],
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Erro interno' },
            { status: 500 }
        )
    }
}
