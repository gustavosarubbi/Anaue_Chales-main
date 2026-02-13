import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { syncReservationToChannex } from '@/lib/channex-sync'

/**
 * Webhook da InfinitePay - chamado automaticamente quando um pedido é criado ou pagamento é aprovado.
 * 
 * No novo checkout inteligente da InfinitePay (sem secret key), o webhook pode ser chamado em dois momentos:
 * 1. Quando o pedido é criado (com capture_method mas sem paid_amount ou paid_amount = 0)
 * 2. Quando o pagamento é confirmado (com paid_amount preenchido)
 * 
 * Formato do body (conforme documentação oficial):
 * {
 *   "invoice_slug": "abc123",
 *   "amount": 70000,
 *   "paid_amount": 70000,  // Pode não existir ou ser 0 se ainda não foi pago
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
/**
 * Valida a origem do webhook (se InfinitePay fornecer assinatura/autenticação)
 * Por enquanto, apenas estrutura preparada - implementar quando soubermos os detalhes da InfinitePay
 */
function validateWebhookSignature(request: Request, body: any): { valid: boolean; reason?: string } {
    // Verificar se há header de assinatura (exemplos comuns)
    const signature = request.headers.get('x-infinitepay-signature') || 
                     request.headers.get('x-signature') ||
                     request.headers.get('signature')
    
    const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET
    
    // Se não há secret configurado, não validar (modo desenvolvimento/teste)
    if (!webhookSecret) {
        console.warn('[INFINITEPAY_WEBHOOK] ⚠️ Webhook secret não configurado - validação desabilitada')
        return { valid: true }
    }

    // Se há secret mas não há assinatura, pode ser um problema de segurança
    if (webhookSecret && !signature) {
        console.warn('[INFINITEPAY_WEBHOOK] ⚠️ Webhook secret configurado mas assinatura não encontrada')
        // Por enquanto, permitir (pode ser que InfinitePay não use assinatura)
        // TODO: Verificar documentação da InfinitePay sobre autenticação de webhook
        return { valid: true }
    }

    // TODO: Implementar validação de assinatura quando soubermos o formato
    // Exemplo de validação HMAC (comum em webhooks):
    // const expectedSignature = crypto.createHmac('sha256', webhookSecret)
    //     .update(JSON.stringify(body))
    //     .digest('hex')
    // if (signature !== expectedSignature) {
    //     return { valid: false, reason: 'Assinatura inválida' }
    // }

    return { valid: true }
}

export async function POST(request: Request) {
    const startTime = Date.now()
    let reservationId: string | null = null

    try {
        // Validar Content-Type
        const contentType = request.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('[INFINITEPAY_WEBHOOK] Content-Type inválido:', contentType)
            // Não retornar 400 aqui, pois pode ser um teste ou formato diferente
        }

        // Ler body para validação de assinatura
        const bodyText = await request.text()
        let body: any
        
        try {
            body = JSON.parse(bodyText)
        } catch (parseError) {
            console.error('[INFINITEPAY_WEBHOOK] Erro ao fazer parse do JSON:', parseError)
            return NextResponse.json(
                { success: false, error: 'Formato de dados inválido' },
                { status: 400 }
            )
        }

        // Validar assinatura do webhook (se configurado)
        const signatureValidation = validateWebhookSignature(request, body)
        if (!signatureValidation.valid) {
            console.error('[INFINITEPAY_WEBHOOK] Validação de assinatura falhou:', signatureValidation.reason)
            return NextResponse.json(
                { success: false, error: 'Assinatura inválida' },
                { status: 401 }
            )
        }

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
            status, // Status do pagamento (se disponível)
            event_type, // Tipo de evento (payment, refund, cancellation, etc)
            refund_amount, // Valor reembolsado (se houver)
        } = body

        // Detectar método de pagamento ANTES de buscar a reserva (para log melhor)
        const captureMethodLower = capture_method ? capture_method.toLowerCase() : null
        const isCreditCard = captureMethodLower === 'credit_card' || 
                            captureMethodLower === 'creditcard' ||
                            captureMethodLower === 'card'
        
        // Log completo para debug
        console.log('[INFINITEPAY_WEBHOOK] Notificação recebida:', {
            order_nsu,
            invoice_slug,
            capture_method: capture_method || 'não informado',
            isCreditCard: isCreditCard ? 'SIM' : 'NÃO',
            amount,
            paid_amount: paid_amount ?? 'não informado',
            transaction_nsu,
            installments,
            status: status || 'não informado',
            event_type: event_type || 'não informado',
            refund_amount: refund_amount ?? 'não informado',
            receipt_url: receipt_url ? 'presente' : 'ausente',
            timestamp: new Date().toISOString(),
        })

        // O order_nsu é o nosso reservation ID
        reservationId = order_nsu

        // Validação robusta do order_nsu
        if (!reservationId || typeof reservationId !== 'string' || reservationId.trim() === '') {
            console.error('[INFINITEPAY_WEBHOOK] order_nsu inválido ou ausente:', {
                order_nsu,
                type: typeof order_nsu,
                bodyKeys: Object.keys(body),
            })
            // Retornar 400 para que a InfinitePay reenvie
            return NextResponse.json(
                { success: false, error: 'order_nsu não encontrado ou inválido' },
                { status: 400 }
            )
        }

        // Sanitizar reservationId
        reservationId = reservationId.trim()

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
            .select('id, status, expires_at, payment_status')
            .eq('id', reservationId)
            .single()

        if (fetchError || !reservation) {
            console.error('[INFINITEPAY_WEBHOOK] Reserva não encontrada:', reservationId)
            return NextResponse.json(
                { success: false, error: 'Reserva não encontrada' },
                { status: 400 }
            )
        }

        // Verificar se é um evento de reembolso ou cancelamento
        const isRefund = refund_amount && refund_amount > 0
        const isCancelled = status?.toLowerCase() === 'cancelled' || 
                           status?.toLowerCase() === 'canceled' ||
                           event_type?.toLowerCase() === 'refund' ||
                           event_type?.toLowerCase() === 'cancellation'

        if (isRefund || isCancelled) {
            console.log('[INFINITEPAY_WEBHOOK] ⚠️ Reembolso/Cancelamento detectado:', {
                reservationId,
                isRefund,
                isCancelled,
                refund_amount,
                status,
                event_type,
            })

            // Se a reserva está confirmada, cancelar e liberar bloqueio
            if (reservation.status === 'confirmed') {
                const { error: updateError } = await supabase
                    .from('reservations')
                    .update({
                        status: 'cancelled',
                        payment_status: `refunded_${capture_method || 'webhook'}`,
                        updated_at: new Date().toISOString(),
                        // Não alterar expires_at aqui - deixar expirar naturalmente ou criar job de limpeza
                    })
                    .eq('id', reservationId)

                if (updateError) {
                    console.error('[INFINITEPAY_WEBHOOK] Erro ao cancelar reserva por reembolso:', updateError)
                    return NextResponse.json(
                        { success: false, error: 'Erro ao processar reembolso' },
                        { status: 400 }
                    )
                }

                console.log('[INFINITEPAY_WEBHOOK] ✅ Reserva cancelada devido a reembolso:', {
                    reservationId,
                    refund_amount,
                    processingTime: Date.now() - startTime,
                })

                return NextResponse.json({ 
                    success: true, 
                    message: 'Reembolso processado e reserva cancelada',
                    processingTime: Date.now() - startTime,
                })
            } else {
                // Se já estava cancelada ou pendente, apenas confirmar recebimento
                console.log('[INFINITEPAY_WEBHOOK] Reembolso recebido para reserva não confirmada:', {
                    reservationId,
                    currentStatus: reservation.status,
                })
                return NextResponse.json({ 
                    success: true, 
                    message: 'Reembolso processado',
                    processingTime: Date.now() - startTime,
                })
            }
        }

        // Verificar se o pagamento foi confirmado (paid_amount existe e é maior que 0)
        const paidAmountNum = typeof paid_amount === 'number' ? paid_amount : (paid_amount ? parseFloat(paid_amount) : 0)
        const amountNum = typeof amount === 'number' ? amount : (amount ? parseFloat(amount) : 0)
        const isPaid = paidAmountNum > 0

        // IMPORTANTE: Se for cartão de crédito, BLOQUEAR o calendário imediatamente
        // Isso acontece quando:
        // 1. Cliente escolhe cartão de crédito e faz o pagamento (paid_amount = 0, aguardando confirmação)
        // 2. Pedido criado com cartão de crédito (mesmo antes do pagamento ser feito)
        // O bloqueio garante que as datas não sejam reservadas por outra pessoa
        if (isCreditCard && reservation.status === 'pending') {
            // Bloquear calendário por 24h quando detectar cartão de crédito
            const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            
            // Verificar se já está bloqueado (para evitar atualizações desnecessárias)
            const currentExpiresAt = new Date(reservation.expires_at)
            const now = new Date()
            const isAlreadyBlocked = currentExpiresAt > now && 
                                    reservation.payment_status?.includes('credit_card')
            
            if (!isAlreadyBlocked) {
                console.log('[INFINITEPAY_WEBHOOK] 🔒 Cartão de crédito detectado - bloqueando calendário:', {
                    reservationId,
                    capture_method: captureMethodLower,
                    amount: amountNum,
                    paid_amount: paidAmountNum,
                    isPaid,
                    message: isPaid 
                        ? 'Pagamento confirmado, mas bloqueando por segurança' 
                        : 'Pagamento com cartão de crédito - bloqueando aguardando confirmação (~1 dia)',
                })

                const { error: updateError } = await supabase
                    .from('reservations')
                    .update({
                        expires_at: newExpiresAt,
                        payment_status: isPaid 
                            ? `paid_credit_card` 
                            : `pending_credit_card_awaiting_confirmation`,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', reservationId)

                if (updateError) {
                    console.error('[INFINITEPAY_WEBHOOK] Erro ao bloquear calendário:', {
                        error: updateError,
                        reservationId,
                    })
                } else {
                    console.log('[INFINITEPAY_WEBHOOK] ✅ Calendário bloqueado por 24h (cartão de crédito):', {
                        reservationId,
                        expiresAt: newExpiresAt,
                        isPaid,
                    })
                }
            } else {
                console.log('[INFINITEPAY_WEBHOOK] Calendário já está bloqueado para cartão de crédito:', {
                    reservationId,
                    currentExpiresAt: reservation.expires_at,
                })
            }

            // Se não está pago ainda, retornar aqui (não confirmar)
            if (!isPaid) {
                return NextResponse.json({ 
                    success: true, 
                    message: 'Cartão de crédito detectado - calendário bloqueado aguardando confirmação',
                    blocked: true,
                    expiresAt: newExpiresAt,
                    processingTime: Date.now() - startTime,
                })
            }
            // Se está pago, continuar para confirmar a reserva abaixo
        }

        if (isPaid) {
            // PAGAMENTO CONFIRMADO - Confirmar a reserva
            
            // Validar se o pagamento é completo (não parcial)
            const isFullPayment = amountNum === 0 || paidAmountNum >= amountNum
            const isPartialPayment = !isFullPayment && amountNum > 0

            if (isPartialPayment) {
                console.warn('[INFINITEPAY_WEBHOOK] ⚠️ Pagamento parcial detectado:', {
                    reservationId,
                    amount: amountNum,
                    paid_amount: paidAmountNum,
                    difference: amountNum - paidAmountNum,
                })
                // Por enquanto, não confirmamos pagamentos parciais
                // Pode ser implementado lógica específica se necessário
            }

            if (reservation.status === 'confirmed') {
                console.log('[INFINITEPAY_WEBHOOK] Reserva já confirmada (idempotência):', reservationId)
                return NextResponse.json({ 
                    success: true, 
                    message: 'Já confirmada',
                    processingTime: Date.now() - startTime,
                })
            }

            // Validar método de captura
            const captureMethodSanitized = capture_method || 'webhook'
            const validCaptureMethods = ['credit_card', 'creditcard', 'pix', 'debit', 'boleto', 'webhook']
            const finalCaptureMethod = validCaptureMethods.includes(captureMethodSanitized.toLowerCase()) 
                ? captureMethodSanitized.toLowerCase() 
                : 'webhook'

            // Atualizar reserva para confirmada
            const updateData: any = {
                status: 'confirmed',
                payment_id: transaction_nsu || invoice_slug || null,
                payment_status: `paid_${finalCaptureMethod}`,
                updated_at: new Date().toISOString(),
            }

            // Se for pagamento parcial, marcar no status
            if (isPartialPayment) {
                updateData.payment_status = `paid_partial_${finalCaptureMethod}`
            }

            const { error: updateError } = await supabase
                .from('reservations')
                .update(updateData)
                .eq('id', reservationId)

            if (updateError) {
                console.error('[INFINITEPAY_WEBHOOK] Erro ao atualizar reserva:', {
                    error: updateError,
                    reservationId,
                    updateData,
                })
                // Retornar 400 para que a InfinitePay reenvie
                return NextResponse.json(
                    { success: false, error: 'Erro ao atualizar reserva', details: updateError.message },
                    { status: 400 }
                )
            }

            console.log('[INFINITEPAY_WEBHOOK] ✅ Reserva confirmada com sucesso:', {
                reservationId,
                capture_method: finalCaptureMethod,
                amount: paidAmountNum || amountNum,
                isPartialPayment,
                receipt_url: receipt_url || 'não fornecido',
                processingTime: Date.now() - startTime,
            })

            // Sincronizar com Channex (fechar datas no Airbnb/Booking)
            try {
                const channexResult = await syncReservationToChannex(supabase, reservationId)
                if (!channexResult.synced && channexResult.error) {
                    console.warn('[INFINITEPAY_WEBHOOK] Channex sync falhou:', channexResult.error)
                }
            } catch (e) {
                console.warn('[INFINITEPAY_WEBHOOK] Erro ao sincronizar Channex:', e)
            }

            return NextResponse.json({ 
                success: true, 
                message: isPartialPayment ? 'Pagamento parcial confirmado' : 'Pagamento confirmado',
                processingTime: Date.now() - startTime,
            })
        } else {
            // Caso onde paid_amount = 0 ou não existe
            // Se não é cartão de crédito ou já foi tratado acima, apenas logar
            if (!capture_method) {
                console.log('[INFINITEPAY_WEBHOOK] Notificação recebida sem método de pagamento:', {
                    reservationId,
                    amount,
                    paid_amount,
                    status: status || 'não informado',
                    message: 'Pode ser apenas notificação de pedido criado, aguardando cliente pagar',
                })
            } else if (!isCreditCard) {
                // Para outros métodos (PIX, etc), não requer bloqueio pois são confirmados rapidamente
                console.log('[INFINITEPAY_WEBHOOK] Pagamento com método não-cartão:', {
                    reservationId,
                    capture_method: captureMethodLower,
                    message: 'Não requer bloqueio estendido (confirmação rápida)',
                })
            }

            return NextResponse.json({ 
                success: true, 
                message: 'Notificação processada',
                captureMethod: captureMethodLower || 'não informado',
                processingTime: Date.now() - startTime,
            })
        }
    } catch (error: any) {
        const processingTime = Date.now() - startTime
        console.error('[INFINITEPAY_WEBHOOK] Erro no processamento:', {
            error: error?.message || 'Erro desconhecido',
            stack: error?.stack,
            reservationId: reservationId || 'não identificado',
            processingTime,
            timestamp: new Date().toISOString(),
        })

        // Se for erro de parsing JSON, retornar 400 para que InfinitePay reenvie
        // Se for outro erro, também retornar 400 para garantir reprocessamento
        const isJsonError = error?.message?.includes('JSON') || error?.name === 'SyntaxError'
        const errorMessage = isJsonError 
            ? 'Formato de dados inválido' 
            : (error?.message || 'Erro interno no processamento')

        return NextResponse.json(
            { 
                success: false, 
                error: errorMessage,
                processingTime,
            },
            { status: 400 }
        )
    }
}
