"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const paymentId = searchParams.get("payment_id")

  return (
    <div className="min-h-screen bg-gradient-to-b from-moss-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <CardTitle className="text-2xl md:text-3xl text-moss-900">
              Pagamento não Processado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-moss-700">
              O pagamento não foi processado ou foi cancelado.
            </p>
            {status && (
              <div className="rounded-lg bg-red-50 p-4 text-sm">
                <p className="font-semibold text-red-900">Status:</p>
                <p className="text-red-700 capitalize">{status}</p>
              </div>
            )}
            {paymentId && (
              <div className="rounded-lg bg-moss-50 p-4 text-sm">
                <p className="font-semibold text-moss-900">ID do Pagamento:</p>
                <p className="text-moss-700 font-mono">{paymentId}</p>
              </div>
            )}
            <p className="text-sm text-moss-600">
              Você pode tentar novamente ou entrar em contato conosco se precisar de ajuda.
            </p>
            <div className="pt-4 space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/checkout">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Link>
              </Button>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Voltar para o Início
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

