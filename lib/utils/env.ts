/**
 * Utilitário para acessar variáveis de ambiente de forma segura e limpa.
 */
export function getEnv(key: string, defaultValue: string = ''): string {
    const value = process.env[key]

    if (!value) {
        return defaultValue
    }

    // Remove espaços em branco, quebras de linha e caracteres de controle
    // Remove TUDO que não for caractere ASCII imprimível (32-126)
    // Isso elimina espaços extras, quebras de linha e caracteres unicode ocultos (BOM, etc)
    let sanitized = value.replace(/[^\x20-\x7E]/g, '').trim()

    // Remove o prefixo 'Bearer ' se o usuário tiver colado por engano
    if (sanitized.startsWith('Bearer ')) {
        sanitized = sanitized.substring(7).trim()
    }

    return sanitized
}

export const ENV = {
    // Priorizar SUPABASE_URL (server-side) sobre NEXT_PUBLIC_SUPABASE_URL (client-side)
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || getEnv('SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    INFINITEPAY_CLIENT_ID: getEnv('INFINITEPAY_CLIENT_ID'),
    INFINITEPAY_CLIENT_SECRET: getEnv('INFINITEPAY_CLIENT_SECRET'),
    INFINITEPAY_WEBHOOK_SECRET: getEnv('INFINITEPAY_WEBHOOK_SECRET'),
    INFINITEPAY_TAG: process.env.NEXT_PUBLIC_INFINITEPAY_TAG || getEnv('NEXT_PUBLIC_INFINITEPAY_TAG', 'mayana-tomaz'),
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || getEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY'),
    RECAPTCHA_SECRET_KEY: getEnv('RECAPTCHA_SECRET_KEY'),
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || getEnv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000'),
}


