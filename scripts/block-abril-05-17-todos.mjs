/**
 * Bloqueia 05 e 17/04/2026 para todos os chalés (Chalé Master + Camping) e dispara sync Beds24.
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
if (!url || !serviceKey) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)
const rows = [
  { chalet_id: 'chale-anaue', date: '2026-04-05' },
  { chalet_id: 'chale-anaue', date: '2026-04-17' },
  { chalet_id: 'chale-2', date: '2026-04-05' },
  { chalet_id: 'chale-2', date: '2026-04-17' },
]

async function main() {
  console.log('Inserindo blocked_dates: 05 e 17/04 para Chalé Master e Camping...')
  const { error } = await supabase.from('blocked_dates').upsert(rows, { onConflict: 'chalet_id,date' })
  if (error) {
    console.error('Erro ao inserir no Supabase:', error.message)
    process.exit(1)
  }
  console.log('OK: datas bloqueadas no Supabase.')

  const syncUrl = process.env.SYNC_API_URL || 'https://www.anauejunglechales.com.br/api/sync/beds24'
  const secret = process.env.CRON_SECRET || 'a74f45a492b069d5a97a315f59dd5864c7ff61eb54fdee2cfb7a58d808d338fb'
  console.log('Chamando sync Beds24...')
  const res = await fetch(syncUrl, { method: 'POST', headers: { 'x-cron-secret': secret } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Erro ao chamar sync:', res.status, json)
    process.exit(1)
  }
  console.log('Sync Beds24:', json.success ? 'OK' : 'Falha', json)
  if (json.datesSentToBeds24 != null) {
    console.log('Datas enviadas ao Beds24:', json.datesSentToBeds24, '- Airbnb deve atualizar em alguns minutos.')
  }
}

main()
