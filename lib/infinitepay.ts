import { ENV } from './utils/env'

const BASE_URL = 'https://api.cloud.infinitepay.io'

interface InfinitePayToken {
    access_token: string
    expires_in: number
    token_type: string
}

/**
 * Obtém um token de acesso OAuth2 da InfinitePay.
 */
async function getAccessToken(): Promise<string | null> {
    const clientId = ENV.INFINITEPAY_CLIENT_ID
    const clientSecret = ENV.INFINITEPAY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        console.error('[INFINITEPAY] Client ID ou Secret não configurados.')
        return null
    }

    try {
        const response = await fetch(`${BASE_URL}/v2/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                scope: 'payments',
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            console.error('[INFINITEPAY] Falha na autenticação:', error)
            return null
        }

        const data: InfinitePayToken = await response.json()
        return data.access_token
    } catch (error) {
        console.error('[INFINITEPAY] Erro de rede ao buscar token:', error)
        return null
    }
}

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
 * Cria um link de pagamento (checkout) na InfinitePay.
 */
export async function createInfinitePayPayment(data: InfinitePayPaymentData) {
    const token = await getAccessToken()
    if (!token) throw new Error('Não foi possível autenticar na InfinitePay')

    try {
        // Nota: O endpoint exato pode variar conforme a versão da API. 
        // Usando /v2/payments conforme padrão Cloud v2.
        const response = await fetch(`${BASE_URL}/v2/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(data.amount * 100), // InfinitePay usa centavos
                capture: true,
                description: data.description,
                external_id: data.orderId,
                payment_method: 'all',
                installments: 12, // Permitir até 12x
                origin: 'mayana-tomaz',
                redirect_url: `${ENV.BASE_URL}/checkout/success`,
                webhook_url: `${ENV.BASE_URL}/api/payments/infinitepay-webhook`,
            }),
        })

        if (!response.ok) {
            const errorMsg = await response.text()
            throw new Error(`InfinitePay Error: ${errorMsg}`)
        }

        const result = await response.json()

        return {
            success: true,
            paymentId: result.id,
            // InfinitePay Cloud geralmente retorna uma URL de checkout ou link
            url: result.url || result.checkout_url || result.payment_url,
        }
    } catch (error: any) {
        console.error('[INFINITEPAY] Erro ao criar pagamento:', error)
        throw error
    }
}
