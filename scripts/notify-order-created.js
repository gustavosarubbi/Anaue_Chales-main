/**
 * Script de exemplo para notificar o sistema quando um pedido é criado via Link integrado.
 * 
 * Use este script quando receber uma notificação de pedido criado (especialmente para cartão de crédito).
 * 
 * Exemplo de uso:
 * node scripts/notify-order-created.js "742775e2-8f7c-4858-8674-c28f212ef1a8" "credit_card"
 * 
 * Ou configure um webhook na InfinitePay para chamar automaticamente:
 * POST https://seusite.com/api/payments/order-notification
 * 
 * Body:
 * {
 *   "order_nsu": "742775e2-8f7c-4858-8674-c28f212ef1a8",
 *   "capture_method": "credit_card",
 *   "amount": 70000,
 *   "invoice_slug": "abc123"
 * }
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function notifyOrderCreated(orderNsu, captureMethod = 'credit_card', amount = null, invoiceSlug = null) {
    const url = `${BASE_URL}/api/payments/order-notification`
    
    const body = {
        order_nsu: orderNsu,
        capture_method: captureMethod,
    }
    
    if (amount) body.amount = amount
    if (invoiceSlug) body.invoice_slug = invoiceSlug
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
        
        const data = await response.json()
        
        if (response.ok && data.success) {
            console.log('✅ Notificação enviada com sucesso!')
            console.log('Resposta:', data)
            return true
        } else {
            console.error('❌ Erro ao enviar notificação:', data.error)
            return false
        }
    } catch (error) {
        console.error('❌ Erro ao chamar endpoint:', error.message)
        return false
    }
}

// Se executado diretamente via linha de comando
if (require.main === module) {
    const args = process.argv.slice(2)
    
    if (args.length === 0) {
        console.log('Uso: node scripts/notify-order-created.js <order_nsu> [capture_method] [amount] [invoice_slug]')
        console.log('Exemplo: node scripts/notify-order-created.js "742775e2-8f7c-4858-8674-c28f212ef1a8" "credit_card" 70000')
        process.exit(1)
    }
    
    const orderNsu = args[0]
    const captureMethod = args[1] || 'credit_card'
    const amount = args[2] ? parseInt(args[2]) : null
    const invoiceSlug = args[3] || null
    
    notifyOrderCreated(orderNsu, captureMethod, amount, invoiceSlug)
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
            console.error('Erro fatal:', error)
            process.exit(1)
        })
}

module.exports = { notifyOrderCreated }
