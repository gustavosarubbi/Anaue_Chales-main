"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Home, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/sections/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

function CheckoutPendingContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("payment_id")

  return (
    <Card className="shadow-xl shadow-amber-900/10 animate-fadeInUp border-amber-100/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden relative">
      {/* Barra colorida no topo */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500" />

      <CardContent className="pt-16 pb-16 px-6 sm:px-10 text-center space-y-8">
        {/* Icone com pulse */}
        <div className="inline-flex items-center justify-center p-6 bg-amber-50 rounded-full shadow-inner border border-amber-100 relative">
          <div className="absolute inset-0 bg-amber-200/15 rounded-full animate-pulse" />
          <Clock className="h-16 w-16 text-amber-600 relative z-10 drop-shadow-sm" />
        </div>

        {/* Titulo e descricao */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-moss-900 font-heading tracking-tight">
            Pagamento Pendente
          </h1>
          <p className="text-moss-600 max-w-md mx-auto text-lg font-light leading-relaxed">
            Seu pagamento está sendo processado. Isso pode levar alguns minutos.
          </p>
        </div>

        {/* Badge informativo */}
        <div className="bg-amber-50/80 border border-amber-100/80 rounded-2xl p-5 max-w-sm mx-auto text-amber-900 text-sm shadow-sm">
          <p className="font-semibold mb-2 flex items-center justify-center gap-2 text-xs">
            <Mail className="h-4 w-4" />
            Fique tranquilo!
          </p>
          <p className="text-xs text-amber-800/80 leading-relaxed">
            Você receberá um e-mail e uma mensagem no WhatsApp assim que o pagamento for confirmado. Não é necessário realizar nenhuma ação adicional.
          </p>
        </div>

        {/* Payment ID */}
        {paymentId && (
          <div className="rounded-2xl bg-moss-50/50 border border-moss-100/50 p-5 max-w-sm mx-auto">
            <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest mb-2">
              ID do Pagamento
            </p>
            <p className="text-sm text-moss-800 font-mono font-semibold break-all">{paymentId}</p>
          </div>
        )}

        {/* Botao */}
        <div className="pt-2 max-w-sm mx-auto">
          <Button
            asChild
            className="w-full bg-moss-900 hover:bg-moss-800 text-white h-14 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 rounded-2xl transition-all duration-300"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Voltar para o Início
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingFallback() {
  return (
    <Card className="shadow-xl shadow-moss-900/5 border-white/40 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 animate-pulse" />
      <CardContent className="pt-20 pb-20">
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="inline-flex items-center justify-center p-4 bg-amber-50 rounded-full border border-amber-100">
            <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-moss-900 font-heading font-bold text-xl">Processando...</p>
            <p className="text-moss-500 text-sm font-light">Verificando informações do pagamento</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CheckoutPendingPage() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-moss-50 to-white texture-dots pt-10 pb-24 px-4 sm:px-6 md:px-8 sm:pt-12 sm:pb-28 relative">
        <div className="container mx-auto max-w-2xl">
          <Suspense fallback={<LoadingFallback />}>
            <CheckoutPendingContent />
          </Suspense>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}
