/**
 * Script para forçar a sincronização de datas bloqueadas no Beds24,
 * garantindo que a janela de reserva de 3 meses seja aplicada (bloqueando meses futuros).
 * 
 * Uso: node scripts/block-future-months-beds24.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const envPath = path.join(root, '.env.local')

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
        const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
        if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
    }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const syncApiUrl = process.env.SYNC_API_URL || 'http://localhost:3000/api/sync/beds24'

if (!url || !serviceKey) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
    process.exit(1)
}

const supabase = createClient(url, serviceKey)

async function main() {
    console.log('Iniciando sincronização forçada para aplicar janela de reserva...')

    // Chamamos a API de sync que agora possui a lógica de janela de 3 meses
    try {
        const res = await fetch(syncApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Adicionar x-cron-secret se necessário
            }
        })

        const json = await res.json()
        if (res.ok) {
            console.log('✅ Sincronização concluída com sucesso!')
            console.log('Janela de Sincronização:', json.blocked?.dateFrom, 'até', json.blocked?.dateTo)
            console.log('Total de datas enviadas ao Beds24:', json.blocked?.datesSentToBeds24)
            console.log('As datas além de 3 meses foram marcadas como bloqueadas no Beds24/Airbnb.')
        } else {
            console.error('❌ Erro na sincronização:', json.error || json)
        }
    } catch (error) {
        console.error('❌ Erro de conexão com a API de sync:', error.message)
        console.log('\nNota: Certifique-se de que o servidor local está rodando se estiver testando em localhost.')
    }
}

main()
