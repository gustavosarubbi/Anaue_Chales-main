"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Home } from "lucide-react"
import Link from "next/link"

export default function CheckoutPendingPage() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("payment_id")

  return (
    <div className="min-h-screen bg-gradient-to-b from-moss-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Clock className="h-16 w-16 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl md:text-3xl text-moss-900">
              Pagamento Pendente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-moss-700">
              Seu pagamento está sendo processado.
            </p>
            <p className="text-sm text-moss-600">
              Você receberá um email quando o pagamento for confirmado. Por favor, aguarde.
            </p>
            {paymentId && (
              <div className="rounded-lg bg-moss-50 p-4 text-sm">
                <p className="font-semibold text-moss-900">ID do Pagamento:</p>
                <p className="text-moss-700 font-mono">{paymentId}</p>
              </div>
            )}
            <div className="pt-4">
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

