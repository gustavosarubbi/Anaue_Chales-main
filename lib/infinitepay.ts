import { ENV } from './utils/env'

export interface InfinitePayPaymentData {
    amount: number
    description: string
    orderId: string
    customer?: {
        name: string
        email: string
    }
}

/**
 * Cria um link de pagamento via API oficial da InfinitePay.
 * Documentação: https://www.infinitepay.io/checkout
 * 
 * Endpoint: POST https://api.infinitepay.io/invoices/public/checkout/links
 * 
 * Payload:
 * {
 *   "handle": "sua-infinitetag",
 *   "items": [{ "quantity": 1, "price": 70000, "description": "..." }],
 *   "order_nsu": "id-do-pedido",
 *   "redirect_url": "https://seusite.com/checkout/success",
 *   "webhook_url": "https://seusite.com/api/payments/infinitepay-webhook"
 * }
 * 
 * Resposta de sucesso retorna o link de checkout.
 */
export async function createInfinitePayPayment(data: InfinitePayPaymentData) {
    const tag = ENV.INFINITEPAY_TAG || 'mayana-tomaz'

    // Validar dados de entrada
    if (!data.amount || data.amount <= 0) {
        throw new Error('Valor do pagamento inválido')
    }

    if (!data.orderId || data.orderId.trim() === '') {
        throw new Error('ID do pedido inválido')
    }

    // O preço deve ser em CENTAVOS (inteiro)
    const priceInCents = Math.round(data.amount * 100)

    // Validar preço mínimo (R$ 1,00 = 100 centavos)
    if (priceInCents < 100) {
        throw new Error('Valor mínimo do pagamento é R$ 1,00')
    }

    // Sanitizar descrição
    const sanitizedDescription = (data.description || "Reserva de Chalé")
        .substring(0, 80)
        .replace(/[^\w\s\-,.áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]/g, '')
        .trim()

    if (!sanitizedDescription || sanitizedDescription.length === 0) {
        throw new Error('Descrição do pagamento inválida')
    }

    // Sanitizar orderId (manter hífens para UUIDs)
    const sanitizedOrderId = data.orderId.replace(/[^a-zA-Z0-9\-_]/g, '')
    if (!sanitizedOrderId || sanitizedOrderId.length === 0 || sanitizedOrderId.length > 100) {
        throw new Error('ID do pedido inválido após sanitização')
    }

    // Base URL do site
    let baseUrl = ENV.BASE_URL || 'http://localhost:3000'
    baseUrl = baseUrl.replace(/[\r\n\s]+/g, '').replace(/\/$/, '')

    // Montar payload conforme documentação oficial InfinitePay
    const payload: Record<string, any> = {
        handle: tag,
        items: [
            {
                quantity: 1,
                price: priceInCents,
                description: sanitizedDescription,
            }
        ],
        order_nsu: sanitizedOrderId,
        redirect_url: `${baseUrl}/checkout/success`,
        webhook_url: `${baseUrl}/api/payments/infinitepay-webhook`,
    }

    console.log('[INFINITEPAY] Criando link de pagamento via API:', {
        handle: tag,
        order_nsu: sanitizedOrderId,
        amount: priceInCents,
        redirect_url: payload.redirect_url,
        webhook_url: payload.webhook_url,
    })

    try {
        // POST para a API oficial da InfinitePay
        const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const responseText = await response.text()
        console.log('[INFINITEPAY] Resposta da API (status:', response.status, '):', responseText.substring(0, 200))

        if (!response.ok) {
            // Tentar extrair mensagem de erro se for JSON
            let errorMessage = `Erro na API InfinitePay (${response.status})`
            try {
                const errorJson = JSON.parse(responseText)
                errorMessage = errorJson.message || errorJson.error || errorMessage
            } catch {
                errorMessage = `${errorMessage}: ${responseText.substring(0, 100)}`
            }
            throw new Error(errorMessage)
        }

        // A API retorna o link de checkout
        // O formato pode ser apenas a URL como texto ou um JSON com a URL
        let checkoutUrl: string

        try {
            const jsonResponse = JSON.parse(responseText)
            // Tentar extrair URL de diferentes formatos de resposta possíveis
            checkoutUrl = jsonResponse.url || 
                         jsonResponse.checkout_url || 
                         jsonResponse.link || 
                         jsonResponse.checkout_link ||
                         jsonResponse.payment_url ||
                         jsonResponse.data?.url ||
                         jsonResponse.data?.checkout_url ||
                         jsonResponse.data?.link ||
                         null
            
            // Se ainda não encontrou, verificar se a resposta é uma URL válida
            if (!checkoutUrl && typeof jsonResponse === 'string' && jsonResponse.startsWith('http')) {
                checkoutUrl = jsonResponse
            }
        } catch (parseError) {
            // Se não for JSON, a resposta pode ser a URL diretamente
            const trimmedText = responseText.trim()
            if (trimmedText.startsWith('http')) {
                checkoutUrl = trimmedText
            } else {
                throw new Error(`Formato de resposta inesperado da API InfinitePay: ${trimmedText.substring(0, 100)}`)
            }
        }

        // Validar que temos uma URL válida
        if (!checkoutUrl || !checkoutUrl.startsWith('http')) {
            throw new Error(`URL de checkout inválida recebida da API: ${checkoutUrl || 'null'}`)
        }

        console.log('[INFINITEPAY] Link de pagamento criado:', checkoutUrl)

        return {
            success: true,
            paymentId: `ipay_${sanitizedOrderId}`,
            url: checkoutUrl,
        }
    } catch (error: any) {
        console.error('[INFINITEPAY] Erro ao criar link de pagamento:', {
            message: error.message,
            stack: error.stack,
            orderId: sanitizedOrderId,
        })

        // Não usar fallback legado - o novo checkout inteligente requer API oficial
        // Se a API falhar, é melhor retornar erro do que usar método que pode não funcionar
        throw new Error(`Falha ao criar link de pagamento: ${error.message}. Por favor, tente novamente.`)
    }
}

/**
 * Verifica o status de um pagamento na InfinitePay.
 * Documentação: POST https://api.infinitepay.io/invoices/public/checkout/payment_check
 * 
 * Payload:
 * {
 *   "handle": "sua-tag",
 *   "order_nsu": "123456",
 *   "transaction_nsu": "UUID",
 *   "slug": "codigo-da-fatura"
 * }
 * 
 * Resposta:
 * {
 *   "success": true,
 *   "paid": true,
 *   "amount": 1500,
 *   "paid_amount": 1510,
 *   "installments": 1,
 *   "capture_method": "pix"
 * }
 */
export async function checkInfinitePayPaymentStatus(params: {
    orderNsu: string
    transactionNsu?: string
    slug?: string
}): Promise<{ success: boolean; paid: boolean; captureMethod?: string; amount?: number }> {
    const tag = ENV.INFINITEPAY_TAG || 'mayana-tomaz'

    const payload: Record<string, string> = {
        handle: tag,
        order_nsu: params.orderNsu,
    }
    if (params.transactionNsu) payload.transaction_nsu = params.transactionNsu
    if (params.slug) payload.slug = params.slug

    try {
        const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/payment_check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            console.error('[INFINITEPAY] Erro na verificação de status:', response.status)
            return { success: false, paid: false }
        }

        const data = await response.json()
        console.log('[INFINITEPAY] Status do pagamento:', data)

        return {
            success: data.success === true,
            paid: data.paid === true,
            captureMethod: data.capture_method,
            amount: data.amount,
        }
    } catch (error) {
        console.error('[INFINITEPAY] Erro ao verificar status:', error)
        return { success: false, paid: false }
    }
}

/**
 * Fallback: constrói URL de checkout manualmente (método legado).
 * Usado apenas se a API oficial falhar.
 */
function buildFallbackCheckoutUrl(
    tag: string,
    orderId: string,
    priceInCents: number,
    description: string,
    baseUrl: string
): string {
    const items = [{ name: description, price: priceInCents, quantity: 1 }]
    const encodedItems = encodeURIComponent(JSON.stringify(items))
    const redirectUrl = encodeURIComponent(`${baseUrl}/checkout/success?reservation_id=${orderId}`)
    const orderNsu = encodeURIComponent(orderId)

    return `https://checkout.infinitepay.io/${tag}?items=${encodedItems}&order_nsu=${orderNsu}&redirect_url=${redirectUrl}`
}
