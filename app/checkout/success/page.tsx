"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function CheckoutSuccessPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-moss-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl md:text-3xl text-moss-900">
              Pagamento Aprovado!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-moss-700">
              Sua reserva foi confirmada com sucesso!
            </p>
            <p className="text-sm text-moss-600">
              Você receberá um email de confirmação com todos os detalhes da sua reserva.
            </p>
            {paymentId && (
              <div className="rounded-lg bg-moss-50 p-4 text-sm">
                <p className="font-semibold text-moss-900">ID do Pagamento:</p>
                <p className="text-moss-700 font-mono">{paymentId}</p>
              </div>
            )}
            <div className="pt-4 space-y-2">
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Voltar para o Início
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/#calendario">
                  Ver Calendário
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

