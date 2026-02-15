/**
 * Testa a API Beds24 (getRoomDates e setRoomDates).
 * Uso: node scripts/test-beds24-api.mjs
 * Carrega .env.local da raiz do projeto.
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
  console.error('Faltam BEDS24_API_KEY, BEDS24_PROP_KEY ou BEDS24_ROOM_ID no .env.local')
  process.exit(1)
}

const BASE = 'https://api.beds24.com/json'

async function post(endpoint, body) {
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authentication: { apiKey, propKey },
      ...body,
    }),
  })
  return res.json()
}

async function main() {
  console.log('Testando API Beds24...\n')

  // 1) getRoomDates - puxar disponibilidade
  const today = new Date()
  const from = today.toISOString().slice(0, 10).replace(/-/g, '')
  const toDate = new Date(today)
  toDate.setDate(toDate.getDate() + 60)
  const to = toDate.toISOString().slice(0, 10).replace(/-/g, '')

  const getResult = await post('getRoomDates', {
    roomId: parseInt(roomId, 10),
    from,
    to,
  })

  if (getResult.error !== undefined) {
    console.log('❌ getRoomDates (puxar disponibilidade):', getResult.error)
  } else {
    const dates = getResult[roomId] || getResult
    const keys = typeof dates === 'object' && dates !== null ? Object.keys(dates) : []
    const blocked = keys.filter((k) => {
      if (k.length !== 8 || !/^\d{8}$/.test(k)) return false
      const day = dates[k]
      return day && (day.i <= 0 || day.o === 1)
    })
    console.log('✅ getRoomDates OK – puxando disponibilidade')
    console.log('   Período:', from, '–', to)
    console.log('   Datas bloqueadas/ocupadas no período:', blocked.length)
    if (blocked.length > 0) console.log('   Exemplo:', blocked.slice(0, 5).join(', '))
  }

  // 2) setRoomDates - bloquear uma noite (2 meses à frente)
  const testDate = new Date(today)
  testDate.setMonth(testDate.getMonth() + 2)
  const ymd = testDate.toISOString().slice(0, 10).replace(/-/g, '')

  const setResult = await post('setRoomDates', {
    roomId,
    dates: { [ymd]: { i: '0' } },
  })

  if (setResult.error !== undefined) {
    console.log('\n❌ setRoomDates (bloquear data):', setResult.error)
  } else {
    console.log('\n✅ setRoomDates OK – bloqueio de datas funcionando')
    console.log('   Data de teste bloqueada:', ymd)
  }

  console.log('\nResumo: API Beds24 está configurada e respondendo.')
  console.log('O site usa essa API para: puxar disponibilidade (getRoomDates),')
  console.log('bloquear datas (setRoomDates) e criar reservas (setBooking).')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
