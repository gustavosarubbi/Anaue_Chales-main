"use client"

import { Suspense } from "react"
import { CheckoutPageContent } from "@/components/checkout/CheckoutPageContent"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Shield } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/sections/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

export default function CheckoutPage() {
  return (
    <>
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-moss-50 to-white texture-dots pt-10 pb-24 px-4 sm:px-6 md:px-8 sm:pt-12 sm:pb-28 relative">
        <div className="container mx-auto max-w-7xl w-full">
          {/* Header */}
          <div className="mb-10 sm:mb-14 animate-fadeInUp">
            <Link href="/">
              <Button variant="ghost" className="mb-5 text-moss-600 hover:text-moss-900 hover:bg-moss-100/50 font-medium rounded-xl transition-all duration-300 -ml-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-moss-900 mb-3 font-heading tracking-tight">
                  Finalize sua Reserva
                </h1>
                <p className="text-base text-moss-600 max-w-2xl leading-relaxed font-light">
                  Você está a poucos passos de garantir sua estadia no paraíso.
                  Siga os passos abaixo para verificar disponibilidade e realizar o pagamento seguro.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-moss-100/50 rounded-2xl px-4 py-2.5 shadow-sm shrink-0">
                <Shield className="h-4 w-4 text-moss-500" />
                <span className="text-xs text-moss-600 font-medium">Pagamento seguro</span>
              </div>
            </div>
          </div>

          <Suspense fallback={<LoadingState />}>
            <CheckoutPageContent />
          </Suspense>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}

function LoadingState() {
  return (
    <Card className="shadow-xl shadow-moss-900/5 border-white/40 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden animate-fadeInUp">
      <CardContent className="pt-20 pb-20">
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="relative">
            <div className="absolute inset-0 bg-moss-100 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="inline-flex items-center justify-center p-4 bg-moss-50 rounded-full border border-moss-100 relative">
              <Loader2 className="h-10 w-10 animate-spin text-moss-600" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <p className="text-moss-900 font-heading font-bold text-xl">Carregando checkout...</p>
            <p className="text-moss-500 text-sm font-light">Preparando seu formulário de reserva</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
