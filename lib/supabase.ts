import { createClient } from '@supabase/supabase-js'
import { ENV } from './utils/env'

const supabaseUrl = ENV.SUPABASE_URL
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Server-side client with service role key (for admin operations)
export function createServerClient() {
  const serviceRoleKey = ENV.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    // Retorna null em vez de lançar erro durante o build
    // O erro será tratado nos arquivos que usam esta função
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
