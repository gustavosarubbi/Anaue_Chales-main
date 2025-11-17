import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Anauê Jungle Chalés - Pousada no Tarumã, Manaus",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  description:
    "Escape para a natureza em nossos chalés exclusivos à beira do rio no Tarumã. Estrutura completa, café da manhã incluso e localização privilegiada próximo ao Hope Bay Park.",
  keywords: "pousada, chalés, Tarumã, Manaus, Rio Negro, Hope Bay Park, Praia do Avião, hospedagem, turismo",
  openGraph: {
    title: "Anauê Jungle Chalés - Pousada no Tarumã, Manaus",
    description: "Escape para a natureza em nossos chalés exclusivos à beira do rio no Tarumã. Estrutura completa, café da manhã incluso e localização privilegiada próximo ao Hope Bay Park.",
    type: "website",
    locale: "pt_BR",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
