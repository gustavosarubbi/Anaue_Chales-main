import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateReservationDates, calculatePrice } from '@/lib/utils/reservation'
import { ENV } from '@/lib/utils/env'
import { checkReservationAvailability } from '@/lib/availability'
import { z } from 'zod'

// Schema de validação (deve bater com o frontend)
const reservationSchema = z.object({
  checkIn: z.string(),
  checkOut: z.string(),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(10),
  guestCount: z.number().min(1).max(10).optional(),
  childrenCount: z.number().min(0).max(10).optional(),
  chaletId: z.string().optional(),
  captchaToken: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    console.log('[RESERVATIONS_CREATE] Iniciando criação de reserva')
    const body = await request.json()
    console.log('[RESERVATIONS_CREATE] Dados recebidos:', { ...body, guestName: '***' })

    // 1. Validação de Schema (Zod)
    const result = reservationSchema.safeParse(body)
    if (!result.success) {
      console.log('[RESERVATIONS_CREATE] Erro de validação Zod:', result.error.format())
      return NextResponse.json(
        { success: false, error: 'Dados inválidos. Verifique os campos preenchidos.' },
        { status: 400 }
      )
    }

    const { checkIn, checkOut, guestName, guestEmail, guestPhone, guestCount, childrenCount, chaletId, captchaToken } = result.data

    // 2. Verificação do reCAPTCHA (se configurado)
    if (ENV.RECAPTCHA_SECRET_KEY && ENV.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      if (!captchaToken) {
        return NextResponse.json(
          { success: false, error: 'Validação de robô obrigatória.' },
          { status: 400 }
        )
      }

      console.log('[RESERVATIONS_CREATE] Verificando token reCAPTCHA...')
      console.log('[RESERVATIONS_CREATE] Secret Key (início):', ENV.RECAPTCHA_SECRET_KEY.substring(0, 6) + '...')

      try {
        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify'
        const captchaRes = await fetch(verifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${ENV.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
        })

        const captchaData = await captchaRes.json()

        if (!captchaData.success) {
          const errorCodes = captchaData['error-codes'] || []
          console.error('[RESERVATIONS_CREATE] Falha na verificação reCAPTCHA:', {
            success: captchaData.success,
            errorCodes,
            score: captchaData.score,
          })

          // BYPASS PARA DESENVOLVIMENTO: Se o erro for 'browser-error' ou 'invalid-input-secret' 
          // e estivermos em localhost, permitimos passar para não travar o cliente.
          const isDev = process.env.NODE_ENV === 'development' || request.url.includes('localhost')

          if (isDev) {
            console.warn('[RESERVATIONS_CREATE] MODO DEV: Ignorando erro do reCAPTCHA e prosseguindo.')
          } else {
            return NextResponse.json(
              {
                success: false,
                error: 'Falha na verificação de segurança. Tente novamente ou entre em contato.',
                details: errorCodes
              },
              { status: 400 }
            )
          }
        }

        if (captchaData.score !== undefined && captchaData.score < 0.3) {
          console.warn('[RESERVATIONS_CREATE] Score reCAPTCHA muito baixo:', captchaData.score)
          return NextResponse.json(
            { success: false, error: 'Atividade suspeita detectada. Tente novamente.' },
            { status: 400 }
          )
        }
      } catch (fetchError) {
        console.error('[RESERVATIONS_CREATE] Erro ao conectar com Google reCAPTCHA:', fetchError)
        // Se houver erro de rede, em dev permitimos passar
        if (process.env.NODE_ENV !== 'development' && !request.url.includes('localhost')) {
          return NextResponse.json(
            { success: false, error: 'Erro na verificação de segurança.' },
            { status: 500 }
          )
        }
      }
    }

    // 3. Processamento de Datas
    const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number)
    const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay, 0, 0, 0, 0)

    const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number)
    const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay, 0, 0, 0, 0)

    // Validar intervalo de datas
    const dateValidation = validateReservationDates(checkInDate, checkOutDate)
    if (!dateValidation.valid) {
      console.log('[RESERVATIONS_CREATE] Data inválida:', dateValidation.error)
      return NextResponse.json({ success: false, error: dateValidation.error }, { status: 400 })
    }

    // Verificar disponibilidade
    console.log('[RESERVATIONS_CREATE] Verificando disponibilidade direta para', checkIn, checkOut, chaletId)

    const availabilityResult = await checkReservationAvailability(checkIn, checkOut, chaletId || 'chale-anaue')

    if (!availabilityResult.success || !availabilityResult.data?.available) {
      console.log('[RESERVATIONS_CREATE] Indisponível:', availabilityResult.error || availabilityResult.data?.conflictingDates)
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

    // Calcular preço
    const priceCalculation = calculatePrice(
      checkInDate,
      checkOutDate,
      guestCount || 2,
      childrenCount || 0,
      chaletId || 'chale-anaue'
    )
    console.log('[RESERVATIONS_CREATE] Preço calculado:', priceCalculation.totalPrice)

    // Criar reserva no Supabase
    console.log('[RESERVATIONS_CREATE] Criando cliente Supabase')
    const supabase = createServerClient()
    if (!supabase) {
      console.error('[RESERVATIONS_CREATE] Erro: Supabase client é null. Verifique as variáveis de ambiente')
      return NextResponse.json(
        { success: false, error: 'Serviço de banco de dados não configurado.' },
        { status: 500 }
      )
    }

    console.log('[RESERVATIONS_CREATE] Inserindo no banco de dados')
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
      console.error('[RESERVATIONS_CREATE] Erro ao inserir no Supabase:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar reserva. Tente novamente.' },
        { status: 500 }
      )
    }

    console.log('[RESERVATIONS_CREATE] Sucesso! ID:', reservation.id)
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
    console.error('[RESERVATIONS_CREATE] Erro não tratado:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

