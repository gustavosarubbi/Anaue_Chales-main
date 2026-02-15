/**
 * Insere uma data em blocked_dates (Chalé Master) e dispara o sync Beds24 → Airbnb.
 * Uso: node scripts/block-date-and-sync-beds24.mjs [YYYY-MM-DD]
 * Ex.: node scripts/block-date-and-sync-beds24.mjs 2026-04-19
 * Carrega .env.local da raiz. Sync URL: SYNC_API_URL ou http://localhost:3000/api/sync/beds24
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

const dateStr = process.argv[2] || '2026-04-19'
const chaletId = 'chale-anaue'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

// Validar formato YYYY-MM-DD
if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
  console.error('Use uma data no formato YYYY-MM-DD. Ex.: 2026-04-19')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

async function main() {
  console.log('Inserindo blocked_dates:', chaletId, dateStr)
  const { data, error } = await supabase
    .from('blocked_dates')
    .upsert({ chalet_id: chaletId, date: dateStr }, { onConflict: 'chalet_id,date' })
    .select()

  if (error) {
    console.error('Erro ao inserir no Supabase:', error.message)
    process.exit(1)
  }
  console.log('OK: data bloqueada no Supabase.')

  const syncUrl = process.env.SYNC_API_URL || 'http://localhost:3000/api/sync/beds24'
  console.log('Chamando sync Beds24:', syncUrl)
  const res = await fetch(syncUrl, { method: 'POST' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Erro ao chamar sync:', res.status, json)
    process.exit(1)
  }
  console.log('Sync Beds24:', json.success ? 'OK' : 'Falha', json)
  if (json.datesSentToBeds24 != null) {
    console.log('Datas enviadas ao Beds24:', json.datesSentToBeds24, '- O Airbnb deve atualizar em alguns minutos.')
  }
}

main()
