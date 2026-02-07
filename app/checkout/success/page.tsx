"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Footer } from "@/components/sections/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  useEffect(() => {
    const statusParam = searchParams.get("status")
    const paymentIdParam = searchParams.get("payment_id")
    const externalReference = searchParams.get("external_reference")

    if (statusParam) {
      setStatus(statusParam)
    }

    if (paymentIdParam) {
      setPaymentId(paymentIdParam)
    }

    // Verificar status do pagamento
    if (externalReference) {
      fetch(`/api/payments/webhook?external_reference=${externalReference}&payment_id=${paymentIdParam || ""}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.reservation) {
            setStatus(data.reservation.payment_status || statusParam || "approved")
          }
        })
        .catch((error) => {
          console.error("Erro ao verificar status:", error)
        })
    }
  }, [searchParams])

  return (
    <Card className="shadow-xl shadow-green-900/10 animate-fadeInUp border-green-100/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden relative">
      {/* Barra colorida no topo */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500" />

      <CardContent className="pt-16 pb-16 px-6 sm:px-10 text-center space-y-8">
        {/* Icone com glow */}
        <div className="inline-flex items-center justify-center p-6 bg-green-50 rounded-full shadow-inner border border-green-100 relative group">
          <div className="absolute inset-0 bg-green-200/20 rounded-full animate-ping opacity-20 duration-1000" />
          <CheckCircle2 className="h-16 w-16 text-green-600 relative z-10 drop-shadow-sm" />
        </div>

        {/* Titulo e descricao */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-moss-900 font-heading tracking-tight">
            Reserva Confirmada!
          </h1>
          <p className="text-moss-600 max-w-md mx-auto text-lg font-light leading-relaxed">
            Sua reserva foi realizada com sucesso. <br />
            Em instantes você receberá a confirmação por e-mail e WhatsApp.
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

        {/* Botoes */}
        <div className="pt-2 space-y-3 max-w-sm mx-auto">
          <Button
            asChild
            className="w-full bg-moss-900 hover:bg-moss-800 text-white h-14 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 rounded-2xl transition-all duration-300"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Voltar para o Início
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full border-2 border-moss-200 text-moss-700 hover:text-moss-900 hover:bg-moss-50 hover:border-moss-300 h-12 rounded-2xl font-semibold transition-all duration-300"
          >
            <Link href="/#calendario">
              <Calendar className="mr-2 h-4 w-4" />
              Ver Calendário
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
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-300 via-green-400 to-emerald-400 animate-pulse" />
      <CardContent className="pt-20 pb-20">
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="inline-flex items-center justify-center p-4 bg-green-50 rounded-full border border-green-100">
            <Loader2 className="h-10 w-10 animate-spin text-green-600" />
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

export default function CheckoutSuccessPage() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-moss-50 to-white texture-dots pt-10 pb-24 px-4 sm:px-6 md:px-8 sm:pt-12 sm:pb-28 relative">
        <div className="container mx-auto max-w-2xl">
          <Suspense fallback={<LoadingFallback />}>
            <CheckoutSuccessContent />
          </Suspense>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}
