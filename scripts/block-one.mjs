/**
 * Bloqueia uma data para um chalé. Uso: node scripts/block-one.mjs [chalet_id] [YYYY-MM-DD]
 * Ex.: node scripts/block-one.mjs chale-2 2026-03-17
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

const chaletId = process.argv[2] || 'chale-anaue'
const dateStr = process.argv[3] || '2026-03-17'

if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
  console.error('Use data YYYY-MM-DD. Ex.: node scripts/block-one.mjs chale-2 2026-03-17')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

async function main() {
  console.log('Inserindo blocked_dates:', chaletId, dateStr)
  const { error } = await supabase
    .from('blocked_dates')
    .upsert({ chalet_id: chaletId, date: dateStr }, { onConflict: 'chalet_id,date' })
  if (error) {
    console.error('Erro:', error.message)
    process.exit(1)
  }
  console.log('OK: data bloqueada.')
  if (chaletId === 'chale-anaue') {
    const syncUrl = process.env.SYNC_API_URL || 'https://www.anauejunglechales.com.br/api/sync/beds24'
    const secret = process.env.CRON_SECRET || 'a74f45a492b069d5a97a315f59dd5864c7ff61eb54fdee2cfb7a58d808d338fb'
    const res = await fetch(syncUrl, { method: 'POST', headers: { 'x-cron-secret': secret } })
    const json = await res.json().catch(() => ({}))
    console.log('Sync Beds24:', json.success ? 'OK' : 'Falha')
  }
}

main()
