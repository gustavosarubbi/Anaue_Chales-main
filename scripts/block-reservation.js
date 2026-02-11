/**
 * Script para bloquear manualmente uma reserva com cartão de crédito.
 * 
 * Uso:
 * node scripts/block-reservation.js "742775e2-8f7c-4858-8674-c28f212ef1a8"
 */

const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function blockReservation(reservationId) {
    const url = `${BASE_URL}/api/reservations/block-credit-card`
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reservationId }),
        })
        
        const data = await response.json()
        
        if (response.ok && data.success) {
            console.log('✅ Reserva bloqueada com sucesso!')
            console.log('Detalhes:', {
                reservationId: data.reservationId,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                expiresAt: data.expiresAt,
            })
            return true
        } else {
            console.error('❌ Erro ao bloquear reserva:', data.error || data.message)
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
        console.log('Uso: node scripts/block-reservation.js <reservation_id>')
        console.log('Exemplo: node scripts/block-reservation.js "742775e2-8f7c-4858-8674-c28f212ef1a8"')
        process.exit(1)
    }
    
    const reservationId = args[0]
    
    blockReservation(reservationId)
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
            console.error('Erro fatal:', error)
            process.exit(1)
        })
}

module.exports = { blockReservation }
