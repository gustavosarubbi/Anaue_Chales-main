import { createClient } from '@supabase/supabase-js'
import { ENV } from './utils/env'

const supabaseUrl = ENV.SUPABASE_URL
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Server-side client with service role key (for admin operations)
export function createServerClient() {
  // Usar ENV diretamente para garantir que estamos usando as variáveis corretas
  const url = ENV.SUPABASE_URL
  const serviceRoleKey = ENV.SUPABASE_SERVICE_ROLE_KEY

  // Se não tiver SERVICE_ROLE_KEY, tentar usar ANON_KEY como fallback (não ideal, mas funcional)
  const keyToUse = serviceRoleKey || ENV.SUPABASE_ANON_KEY

  if (!url || !keyToUse) {
    console.error('[SUPABASE] Cliente não pode ser criado: variáveis ausentes.')
    // Retorna null em vez de lançar erro durante o build
    // O erro será tratado nos arquivos que usam esta função
    return null
  }

  if (!serviceRoleKey && ENV.SUPABASE_ANON_KEY) {
    console.warn('[SUPABASE] Usando ANON_KEY como fallback. Configure SUPABASE_SERVICE_ROLE_KEY para operações server-side completas.')
  }

  return createClient(url, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
