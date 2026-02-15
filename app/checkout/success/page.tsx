"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { Footer } from "@/components/sections/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

/**
 * Página de sucesso após pagamento na InfinitePay.
 * 
 * A InfinitePay redireciona para cá com os seguintes parâmetros:
 * - order_nsu: ID do pedido (nosso reservation ID)
 * - transaction_nsu: ID da transação
 * - slug: Código da fatura InfinitePay
 * - capture_method: "credit_card" ou "pix"
 * - receipt_url: Link do comprovante
 * 
 * Ao carregar, confirma a reserva automaticamente no Supabase.
 */
function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const [confirmed, setConfirmed] = useState(false)
  const [confirming, setConfirming] = useState(true)
  const [chaletDisplayName, setChaletDisplayName] = useState<string | null>(null)
  const hasAttempted = useRef(false)

  useEffect(() => {
    if (hasAttempted.current) return
    hasAttempted.current = true

    // Parâmetros enviados pela InfinitePay no redirect
    const orderNsu = searchParams.get("order_nsu")
    // Fallback para parâmetro customizado (caso use URL direta/fallback)
    const reservationId = searchParams.get("reservation_id")
    // Outros parâmetros da InfinitePay
    const transactionNsu = searchParams.get("transaction_nsu")
    const slug = searchParams.get("slug")
    const captureMethod = searchParams.get("capture_method")
    const receiptUrl = searchParams.get("receipt_url")

    // O ID da reserva pode vir como order_nsu (API oficial) ou reservation_id (fallback)
    const effectiveId = orderNsu || reservationId

    console.log('[SUCCESS] Parâmetros recebidos:', {
      order_nsu: orderNsu,
      reservation_id: reservationId,
      transaction_nsu: transactionNsu,
      slug,
      capture_method: captureMethod,
      receipt_url: receiptUrl,
    })

    if (!effectiveId) {
      console.log('[SUCCESS] Nenhum ID de reserva nos parâmetros — exibindo sucesso genérico')
      setConfirming(false)
      setConfirmed(true)
      return
    }

    console.log('[SUCCESS] Confirmando reserva:', effectiveId)

    // 1. Confirmar a reserva no nosso banco
    fetch('/api/reservations/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationId: effectiveId,
        transactionNsu,
        slug,
        captureMethod,
      }),
    })
      .then(async res => {
        const data = await res.json()
        console.log('[SUCCESS] Resposta da confirmação:', data)
        
        if (!res.ok) {
          // Se a reserva já estava confirmada, ainda é sucesso
          if (data.message?.includes('já') || data.message?.includes('already')) {
            console.log('[SUCCESS] Reserva já estava confirmada (idempotência)')
            setConfirmed(true)
          } else {
            console.error('[SUCCESS] Erro na confirmação:', data.error || data.message)
            setConfirmed(true)
          }
        } else {
          setConfirmed(true)
        }
      })
      .catch(err => {
        console.error('[SUCCESS] Erro na confirmação (pagamento já foi realizado):', err)
        setConfirmed(true)
      })
      .finally(() => {
        setConfirming(false)
      })

    // Buscar detalhes da reserva (chalé) para exibir na página
    fetch(`/api/reservations/status/${effectiveId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.chaletDisplayName) {
          setChaletDisplayName(data.chaletDisplayName)
        }
      })
      .catch(() => {})
  }, [searchParams])

  if (confirming) {
    return (
      <Card className="shadow-xl shadow-moss-900/5 border-white/40 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-300 via-green-400 to-emerald-400 animate-pulse" />
        <CardContent className="pt-20 pb-20">
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="inline-flex items-center justify-center p-4 bg-green-50 rounded-full border border-green-100">
              <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-moss-900 font-heading font-bold text-xl">Confirmando pagamento...</p>
              <p className="text-moss-500 text-sm font-light">Estamos registrando sua reserva no sistema</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl shadow-green-900/10 animate-fadeInUp border-green-100/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500" />

      <CardContent className="pt-16 pb-16 px-6 sm:px-10 text-center space-y-8">
        <div className="inline-flex items-center justify-center p-6 bg-green-50 rounded-full shadow-inner border border-green-100 relative group">
          <div className="absolute inset-0 bg-green-200/20 rounded-full animate-ping opacity-20 duration-1000" />
          <CheckCircle2 className="h-16 w-16 text-green-600 relative z-10 drop-shadow-sm" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-moss-900 font-heading tracking-tight">
            Reserva Confirmada!
          </h1>
          <p className="text-moss-600 max-w-md mx-auto text-lg font-light leading-relaxed">
            {chaletDisplayName ? (
              <>
                Sua reserva do <strong>{chaletDisplayName}</strong> foi realizada com sucesso.
                <br />
              </>
            ) : (
              <>Sua reserva foi realizada com sucesso. <br /></>
            )}
            Em instantes você receberá a confirmação por e-mail e WhatsApp.
          </p>
        </div>

        {/* Comprovante (se InfinitePay enviou) */}
        {searchParams.get("receipt_url") && (
          <div className="rounded-2xl bg-moss-50/50 border border-moss-100/50 p-5 max-w-sm mx-auto">
            <a
              href={searchParams.get("receipt_url")!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-moss-700 underline underline-offset-2 decoration-moss-300 hover:text-moss-900 font-medium"
            >
              📄 Ver comprovante de pagamento
            </a>
          </div>
        )}

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
