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

    // Validar dados de entrada
    if (!data.amount || data.amount <= 0) {
        throw new Error('Valor do pagamento inválido')
    }

    if (!data.orderId || data.orderId.trim() === '') {
        throw new Error('ID do pedido inválido')
    }

    // O Checkout da InfinitePay via URL (GET) espera o parâmetro 'items' como um JSON URL-encoded.
    // O preço deve ser em CENTAVOS (inteiro).
    const priceInCents = Math.round(data.amount * 100)
    
    // Validar preço mínimo (mínimo de R$ 1,00 = 100 centavos)
    if (priceInCents < 100) {
        throw new Error('Valor mínimo do pagamento é R$ 1,00')
    }

    // Sanitizar descrição (limitar tamanho e remover caracteres problemáticos)
    // Manter apenas caracteres alfanuméricos, espaços, hífens e vírgulas (removendo parênteses que quebram links)
    const sanitizedDescription = (data.description || "Reserva de Chalé")
        .substring(0, 80) // Limitar a 80 caracteres para evitar problemas
        .replace(/[^\w\s\-,.áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]/g, '') // Manter acentos brasileiros
        .trim()

    // Garantir que a descrição não esteja vazia
    if (!sanitizedDescription || sanitizedDescription.length === 0) {
        throw new Error('Descrição do pagamento inválida')
    }

    // Formato correto dos items para InfinitePay
    // O InfinitePay espera um array de objetos com: name (string), price (number em centavos), quantity (number)
    const items = [
        {
            name: sanitizedDescription,
            price: priceInCents,
            quantity: 1
        }
    ]

    // Validar e sanitizar orderId - manter apenas alfanuméricos, hífens e underscores
    // Não remover hífens pois podem ser UUIDs válidos
    const sanitizedOrderId = data.orderId.replace(/[^a-zA-Z0-9\-_]/g, '')
    if (!sanitizedOrderId || sanitizedOrderId.length === 0 || sanitizedOrderId.length > 100) {
        throw new Error('ID do pedido inválido após sanitização')
    }

    // Codificar items como JSON string e depois URL encode
    const itemsJson = JSON.stringify(items)
    const encodedItems = encodeURIComponent(itemsJson)
    
    // Garantir que BASE_URL está configurado corretamente e é uma URL válida
    let baseUrl = ENV.BASE_URL || 'http://localhost:3000'
    // Remover quebras de linha, espaços e barra final se houver
    baseUrl = baseUrl.replace(/[\r\n\s]+/g, '').replace(/\/$/, '')
    
    // URL de redirecionamento deve ser absoluta e válida
    const redirectUrl = encodeURIComponent(`${baseUrl}/checkout/success`)
    
    // order_nsu e external_id devem ser o mesmo valor (ID do pedido)
    // Codificar apenas uma vez para uso na URL
    const orderNsu = encodeURIComponent(sanitizedOrderId)
    const externalId = encodeURIComponent(sanitizedOrderId)

    // Construir URL do checkout InfinitePay
    // Formato: https://checkout.infinitepay.io/{tag}?items={json_encoded}&order_nsu={id}&external_id={id}&redirect_url={url}
    const paymentUrl = `https://checkout.infinitepay.io/${tag}?items=${encodedItems}&order_nsu=${orderNsu}&external_id=${externalId}&redirect_url=${redirectUrl}`

    return {
        success: true,
        paymentId: `link_${sanitizedOrderId}`,
        url: paymentUrl,
    }
}
