"use client"

import { Suspense } from "react"
import { CheckoutPageContent } from "@/components/checkout/CheckoutPageContent"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/sections/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

export default function CheckoutPage() {
  return (
    <>
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-moss-50 to-white texture-dots pt-10 pb-24 px-4 sm:pt-12 sm:pb-28 relative">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left">
            <Link href="/">
              <Button variant="ghost" className="mb-4 text-moss-700 hover:text-moss-900 font-medium">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-moss-900 mb-3 font-heading">
              Finalize sua Reserva
            </h1>
            <p className="text-base text-moss-700 max-w-2xl leading-relaxed">
              Você está a poucos passos de garantir sua estadia no paraíso.
              Siga os passos abaixo para verificar disponibilidade e realizar o pagamento seguro.
            </p>
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
    <Card className="shadow-lg border-moss-200">
      <CardContent className="pt-20 pb-20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-moss-600" />
          <p className="text-moss-700 font-medium animate-pulse">Carregando formulário de checkout...</p>
        </div>
      </CardContent>
    </Card>
  )
}
