"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, Home, RefreshCw, Loader2, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/sections/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

function CheckoutFailureContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const paymentId = searchParams.get("payment_id")
  const orderNsu = searchParams.get("order_nsu")
  const reservationId = searchParams.get("reservation_id")
  const errorMessage = searchParams.get("error") || searchParams.get("error_message")

  // Se temos um order_nsu ou reservation_id, podemos tentar verificar o status
  // para ver se o pagamento foi processado mesmo assim (caso de race condition)
  const effectiveId = orderNsu || reservationId

  return (
    <Card className="shadow-xl shadow-red-900/10 animate-fadeInUp border-red-100/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden relative">
      {/* Barra colorida no topo */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

      <CardContent className="pt-16 pb-16 px-6 sm:px-10 text-center space-y-8">
        {/* Icone */}
        <div className="inline-flex items-center justify-center p-6 bg-red-50 rounded-full shadow-inner border border-red-100">
          <XCircle className="h-16 w-16 text-red-600 drop-shadow-sm" />
        </div>

        {/* Titulo e descricao */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-moss-900 font-heading tracking-tight">
            Pagamento não Processado
          </h1>
          <p className="text-moss-600 max-w-md mx-auto text-lg font-light leading-relaxed">
            O pagamento não foi processado ou foi cancelado. Não se preocupe, nenhum valor foi cobrado.
          </p>
        </div>

        {/* Status e Payment ID */}
        <div className="space-y-3 max-w-sm mx-auto">
          {errorMessage && (
            <div className="rounded-2xl bg-red-50/50 border border-red-100/50 p-5">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">
                Erro
              </p>
              <p className="text-sm text-red-700 font-semibold">{errorMessage}</p>
            </div>
          )}
          {status && (
            <div className="rounded-2xl bg-red-50/50 border border-red-100/50 p-5">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">
                Status
              </p>
              <p className="text-sm text-red-700 font-semibold capitalize">{status}</p>
            </div>
          )}
          {paymentId && (
            <div className="rounded-2xl bg-moss-50/50 border border-moss-100/50 p-5">
              <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest mb-2">
                ID do Pagamento
              </p>
              <p className="text-sm text-moss-800 font-mono font-semibold break-all">{paymentId}</p>
            </div>
          )}
          {effectiveId && (
            <div className="rounded-2xl bg-amber-50/50 border border-amber-100/50 p-5">
              <p className="text-xs text-amber-800/80 leading-relaxed">
                Se o pagamento foi processado, você receberá confirmação por e-mail. 
                Caso contrário, pode tentar novamente.
              </p>
            </div>
          )}
        </div>

        {/* Dica de ajuda */}
        <div className="bg-amber-50/80 border border-amber-100/80 rounded-2xl p-5 max-w-sm mx-auto text-amber-900 text-sm shadow-sm">
          <p className="font-semibold mb-2 flex items-center justify-center gap-2 text-xs">
            <MessageCircle className="h-4 w-4" />
            Precisa de ajuda?
          </p>
          <p className="text-xs text-amber-800/80 leading-relaxed">
            Você pode tentar novamente ou nos chamar pelo WhatsApp. Estamos prontos para ajudar!
          </p>
        </div>

        {/* Botoes */}
        <div className="pt-2 space-y-3 max-w-sm mx-auto">
          <Button
            asChild
            className="w-full bg-moss-900 hover:bg-moss-800 text-white h-14 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 rounded-2xl transition-all duration-300"
          >
            <Link href="/checkout">
              <RefreshCw className="mr-2 h-5 w-5" />
              Tentar Novamente
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full border-2 border-moss-200 text-moss-700 hover:text-moss-900 hover:bg-moss-50 hover:border-moss-300 h-12 rounded-2xl font-semibold transition-all duration-300"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
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
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-300 via-red-400 to-rose-400 animate-pulse" />
      <CardContent className="pt-20 pb-20">
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="inline-flex items-center justify-center p-4 bg-red-50 rounded-full border border-red-100">
            <Loader2 className="h-10 w-10 animate-spin text-red-600" />
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

export default function CheckoutFailurePage() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-moss-50 to-white texture-dots pt-10 pb-24 px-4 sm:px-6 md:px-8 sm:pt-12 sm:pb-28 relative">
        <div className="container mx-auto max-w-2xl">
          <Suspense fallback={<LoadingFallback />}>
            <CheckoutFailureContent />
          </Suspense>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}
