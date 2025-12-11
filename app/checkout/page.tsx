"use client"

import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wrench, MessageCircle, Construction } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/sections/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

function MaintenanceContent() {
  const whatsappNumber = "559294197052"
  const message = "Olá! Gostaria de fazer uma reserva no Anauê Jungle Chalés."

  const openWhatsApp = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <>
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-moss-50 to-white texture-dots pt-10 pb-24 px-4 sm:pt-12 sm:pb-28 relative">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-3" aria-label="Voltar para a página inicial">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl md:text-4xl font-bold text-moss-900 mb-1">
              Checkout em Manutenção
            </h1>
            <p className="text-sm md:text-base text-moss-700 max-w-2xl">
              Estamos trabalhando para melhorar sua experiência de reserva.
            </p>
          </div>

          {/* Maintenance Card */}
          <Card className="shadow-lg border-moss-200 animate-fadeInUp">
            <CardContent className="pt-8 pb-8 px-6 md:px-10">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-moss-200 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-moss-100 to-moss-200 p-6 rounded-full">
                    <Construction className="h-16 w-16 text-moss-700" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-moss-900">
                    Página em Construção
                  </h2>
                  <p className="text-base md:text-lg text-moss-700 max-w-xl">
                    Estamos aprimorando nosso sistema de reservas para oferecer uma experiência ainda melhor.
                  </p>
                </div>

                {/* Message */}
                <div className="bg-moss-50 border border-moss-200 rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-6 w-6 text-moss-600 mt-1 flex-shrink-0" />
                    <div className="text-left space-y-2">
                      <p className="text-sm font-semibold text-moss-900">
                        Feche seus valores pelo WhatsApp
                      </p>
                      <p className="text-sm text-moss-700">
                        Enquanto isso, entre em contato conosco pelo WhatsApp para fazer sua reserva e fechar os valores da sua estadia.
                      </p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Button */}
                <Button
                  onClick={openWhatsApp}
                  className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-h-[56px] text-base font-semibold"
                  size="lg"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar no WhatsApp
                </Button>

                {/* Additional Info */}
                <div className="pt-4 border-t border-moss-200 w-full max-w-md">
                  <p className="text-xs text-moss-600">
                    Nossa equipe está pronta para atender você e tirar todas as suas dúvidas sobre disponibilidade e valores.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-moss-50 to-white texture-dots pt-10 pb-24 px-4 sm:pt-12 sm:pb-28 relative">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-3">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl md:text-4xl font-bold text-moss-900 mb-1">
              Checkout em Manutenção
            </h1>
          </div>
          <Card className="shadow-lg border-moss-200">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moss-600"></div>
                <span className="ml-3 text-moss-700">Carregando...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    }>
      <MaintenanceContent />
    </Suspense>
  )
}
