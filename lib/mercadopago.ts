import { MercadoPagoConfig, Preference } from 'mercadopago'

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()

// Não lança erro se o token não estiver configurado (será configurado depois)
// A validação será feita na rota de pagamento
let mercadoPago: Preference | null = null

if (accessToken) {
  const client = new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 5000
    }
  })
  mercadoPago = new Preference(client)
}

export { mercadoPago }

