/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  // Configuração para permitir requisições cross-origin em desenvolvimento
  allowedDevOrigins: ['10.10.24.104']
}

export default nextConfig
