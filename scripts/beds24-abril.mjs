/**
 * Teste temporário: consulta a API Beds24 e mostra abril (disponível vs bloqueado).
 * Uso: node scripts/beds24-abril.mjs
 * Carrega .env.local da raiz.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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

const apiKey = process.env.BEDS24_API_KEY
const propKey = process.env.BEDS24_PROP_KEY
const roomId = process.env.BEDS24_ROOM_ID
if (!apiKey || !propKey || !roomId) {
  console.error('Faltam BEDS24_* no .env.local')
  process.exit(1)
}

const from = '20260401'
const to = '20260430'

const res = await fetch('https://api.beds24.com/json/getRoomDates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    authentication: { apiKey, propKey },
    roomId: parseInt(roomId, 10),
    from,
    to,
  }),
})
const data = await res.json()
if (data.error !== undefined) {
  console.error('Erro Beds24:', data.error)
  process.exit(1)
}

const dates = data[roomId] || data
const blocked = []
const available = []
for (let d = 1; d <= 30; d++) {
  const key = '202604' + String(d).padStart(2, '0')
  const day = dates[key]
  const inv = day != null ? Number(day.i) : NaN
  const over = day != null ? Number(day.o) : 0
  const isBlocked = (!Number.isNaN(inv) && inv <= 0) || over === 1
  if (isBlocked) blocked.push(key)
  else available.push(key)
}

function fmt(ymd) {
  return ymd.slice(6, 8) + '/' + ymd.slice(4, 6) + '/' + ymd.slice(0, 4)
}
console.log('--- ABRIL 2026 (API Beds24) ---\n')
console.log('Disponíveis (' + available.length + '):', available.map(fmt).join(', ') || '(nenhum)')
console.log('Bloqueados (' + blocked.length + '):', blocked.map(fmt).join(', ') || '(nenhum)')
console.log('')
