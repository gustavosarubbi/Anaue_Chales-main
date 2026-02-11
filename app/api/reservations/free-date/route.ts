import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getDatesBetween } from '@/lib/utils/reservation'

/**
 * Endpoint para liberar uma data específica cancelando reservas que a bloqueiam
 * 
 * POST /api/reservations/free-date
 * Body: { date: "2026-02-24", chaletId: "chale-anaue" }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { date, chaletId = 'chale-anaue' } = body

        if (!date) {
            return NextResponse.json(
                { success: false, error: 'Data não fornecida' },
                { status: 400 }
            )
        }

        // Validar formato da data
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(date)) {
            return NextResponse.json(
                { success: false, error: 'Formato de data inválido. Use YYYY-MM-DD' },
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

        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)
        const targetDateStr = date

        // Buscar todas as reservas que bloqueiam essa data
        // Uma reserva bloqueia uma data se: check_in <= data < check_out
        const { data: blockingReservations, error: fetchError } = await supabase
            .from('reservations')
            .select('id, check_in, check_out, status, guest_name, payment_status')
            .eq('chalet_id', chaletId)
            .lte('check_in', targetDateStr)
            .gt('check_out', targetDateStr)
            .in('status', ['confirmed', 'pending'])

        if (fetchError) {
            console.error('[FREE_DATE] Erro ao buscar reservas:', fetchError)
            return NextResponse.json(
                { success: false, error: 'Erro ao buscar reservas' },
                { status: 500 }
            )
        }

        if (!blockingReservations || blockingReservations.length === 0) {
            return NextResponse.json({
                success: true,
                message: `A data ${date} já está disponível. Nenhuma reserva encontrada bloqueando essa data.`,
                cancelled: 0,
                reservations: []
            })
        }

        console.log(`[FREE_DATE] Encontradas ${blockingReservations.length} reserva(s) bloqueando ${date}:`, 
            blockingReservations.map(r => ({
                id: r.id,
                checkIn: r.check_in,
                checkOut: r.check_out,
                status: r.status,
                guest: r.guest_name
            }))
        )

        // Cancelar as reservas
        const reservationIds = blockingReservations.map(r => r.id)
        
        const { error: updateError, count } = await supabase
            .from('reservations')
            .update({
                status: 'cancelled',
                payment_status: 'cancelled_manual',
                updated_at: new Date().toISOString(),
            })
            .in('id', reservationIds)
            .select('id', { count: 'exact' })

        if (updateError) {
            console.error('[FREE_DATE] Erro ao cancelar reservas:', updateError)
            return NextResponse.json(
                { success: false, error: 'Erro ao cancelar reservas' },
                { status: 500 }
            )
        }

        console.log(`[FREE_DATE] ✅ ${blockingReservations.length} reserva(s) cancelada(s) para liberar ${date}`)

        return NextResponse.json({
            success: true,
            message: `${blockingReservations.length} reserva(s) cancelada(s). A data ${date} foi liberada.`,
            cancelled: blockingReservations.length,
            reservations: blockingReservations.map(r => ({
                id: r.id,
                checkIn: r.check_in,
                checkOut: r.check_out,
                status: r.status,
                guest: r.guest_name
            }))
        })
    } catch (error: any) {
        console.error('[FREE_DATE] Erro no processamento:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno', details: error?.message },
            { status: 500 }
        )
    }
}

/**
 * GET endpoint para verificar quais reservas bloqueiam uma data (sem cancelar)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date')
        const chaletId = searchParams.get('chaletId') || 'chale-anaue'

        if (!date) {
            return NextResponse.json(
                { success: false, error: 'Parâmetro "date" não fornecido' },
                { status: 400 }
            )
        }

        // Validar formato da data
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(date)) {
            return NextResponse.json(
                { success: false, error: 'Formato de data inválido. Use YYYY-MM-DD' },
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

        const targetDateStr = date

        // Buscar todas as reservas que bloqueiam essa data
        const { data: blockingReservations, error: fetchError } = await supabase
            .from('reservations')
            .select('id, check_in, check_out, status, guest_name, payment_status, expires_at')
            .eq('chalet_id', chaletId)
            .lte('check_in', targetDateStr)
            .gt('check_out', targetDateStr)
            .in('status', ['confirmed', 'pending'])

        if (fetchError) {
            console.error('[FREE_DATE] Erro ao buscar reservas:', fetchError)
            return NextResponse.json(
                { success: false, error: 'Erro ao buscar reservas' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            date,
            chaletId,
            isBlocked: (blockingReservations?.length || 0) > 0,
            blockingReservations: blockingReservations || [],
            count: blockingReservations?.length || 0
        })
    } catch (error: any) {
        console.error('[FREE_DATE] Erro no processamento:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno', details: error?.message },
            { status: 500 }
        )
    }
}
