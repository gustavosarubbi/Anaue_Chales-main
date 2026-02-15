import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { isBeds24Enabled } from '@/lib/beds24'
import { syncBlockedDatesToBeds24 } from '@/lib/beds24-sync'
import { getEnv } from '@/lib/utils/env'

type WebhookPayload = {
  type?: string
  table?: string
  schema?: string
  record?: unknown
  old_record?: unknown
}

/**
 * Webhook chamado pelo Supabase quando há mudança na base (Database Webhooks).
 * Se a tabela for blocked_dates, dispara a sincronização com o Beds24 na hora,
 * para que o Airbnb receba o bloqueio em tempo (quase) real.
 *
 * No Supabase: Database > Webhooks > Create hook:
 * - Table: blocked_dates
 * - Events: Insert, Update, Delete
 * - URL: https://seu-dominio.vercel.app/api/webhooks/supabase-db
 * - (Opcional) Header: Authorization = Bearer <BEDS24_SYNC_WEBHOOK_SECRET>
 */
export async function POST(request: Request) {
  const secret = getEnv('BEDS24_SYNC_WEBHOOK_SECRET') || getEnv('SUPABASE_WEBHOOK_SECRET')
  if (secret) {
    const auth = request.headers.get('authorization')
    const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : ''
    if (bearer !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: WebhookPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body?.table !== 'blocked_dates') {
    return NextResponse.json({ ok: true, skipped: 'table not blocked_dates' })
  }

  if (!isBeds24Enabled()) {
    return NextResponse.json({ ok: true, skipped: 'Beds24 not configured' })
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const result = await syncBlockedDatesToBeds24(supabase)
  return NextResponse.json({
    ok: true,
    table: 'blocked_dates',
    event: body.type,
    blocked: { rangesSynced: result.synced, errors: result.errors },
  })
}
