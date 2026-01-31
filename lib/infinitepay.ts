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
 * Gera um link de pagamento direto da InfinitePay (checkout.infinitepay.io).
 * Este formato usa apenas a Tag (handle) e parâmetros na URL, sem necessidade de API Keys.
 */
export async function createInfinitePayPayment(data: InfinitePayPaymentData) {
    const tag = ENV.INFINITEPAY_TAG || 'mayana-tomaz'

    // O Checkout da InfinitePay via URL (GET) espera o parâmetro 'items' como um JSON URL-encoded.
    // O preço deve ser em CENTAVOS (inteiro).
    const priceInCents = Math.round(data.amount * 100)

    const items = [
        {
            name: data.description || "Reserva de Chalé",
            price: priceInCents,
            quantity: 1
        }
    ]

    const encodedItems = encodeURIComponent(JSON.stringify(items))
    const redirectUrl = encodeURIComponent(`${ENV.BASE_URL}/checkout/success`)
    const orderNsu = encodeURIComponent(data.orderId)

    // URL base do checkout público - Adicionando external_id para garantir compatibilidade com o webhook
    const paymentUrl = `https://checkout.infinitepay.io/${tag}?items=${encodedItems}&order_nsu=${orderNsu}&external_id=${orderNsu}&redirect_url=${redirectUrl}`

    console.log('[INFINITEPAY] Link de pagamento público gerado:', paymentUrl)

    return {
        success: true,
        paymentId: `link_${data.orderId}`,
        url: paymentUrl,
    }
}
