import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateReservationDates, calculatePrice } from '@/lib/utils/reservation'
import { ENV } from '@/lib/utils/env'
import { checkReservationAvailability } from '@/lib/availability'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { checkIn, checkOut, guestName, guestEmail, guestPhone, guestCount, childrenCount, chaletId } = body

    // Validação básica
    if (!checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    // IMPORTANTE: new Date("YYYY-MM-DD") interpreta como UTC, causando problemas de timezone
    // Precisamos criar a data no timezone local
    const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number)
    const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay, 0, 0, 0, 0)

    const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number)
    const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay, 0, 0, 0, 0)

    // Validar datas
    const dateValidation = validateReservationDates(checkInDate, checkOutDate)
    if (!dateValidation.valid) {
      return NextResponse.json({ success: false, error: dateValidation.error }, { status: 400 })
    }

    // Verificar disponibilidade
    console.log('[RESERVATIONS_CREATE] Verificando disponibilidade direta')

    const availabilityResult = await checkReservationAvailability(checkIn, checkOut, chaletId || 'chale-anaue')

    if (!availabilityResult.success || !availabilityResult.data?.available) {
      return NextResponse.json(
        {
          success: false,
          error: availabilityResult.data?.conflictingDates?.length
            ? 'As datas selecionadas não estão disponíveis'
            : (availabilityResult.error || 'Erro ao verificar disponibilidade'),
          conflictingDates: availabilityResult.data?.conflictingDates,
        },
        { status: 400 }
      )
    }

    const availabilityData = availabilityResult.data


    // Calcular preço
    const priceCalculation = calculatePrice(
      checkInDate,
      checkOutDate,
      guestCount || 2,
      childrenCount || 0,
      chaletId || 'chale-anaue'
    )

    // Criar reserva no Supabase
    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Serviço de banco de dados não configurado. Por favor, configure as variáveis de ambiente do Supabase.' },
        { status: 500 }
      )
    }

    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        check_in: checkIn,
        check_out: checkOut,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        guest_count: guestCount || 2,
        children_count: childrenCount || 0,
        total_price: priceCalculation.totalPrice,
        status: 'pending',
        chalet_id: chaletId || 'chale-anaue',
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar reserva:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar reserva. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        totalPrice: reservation.total_price,
        priceCalculation,
      },
    })
  } catch (error) {
    console.error('Erro ao criar reserva:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

