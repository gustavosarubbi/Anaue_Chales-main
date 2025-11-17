"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Receipt, Calendar, Users } from "lucide-react"
import { formatDatePortuguese } from "@/lib/utils/reservation"
import { format } from "date-fns"

interface PaymentSummaryProps {
  checkIn: Date
  checkOut: Date
  guestCount: number
  childrenCount: number
  totalPrice: number
  guestName: string
  guestEmail: string
  guestPhone: string
}

export function PaymentSummary({
  checkIn,
  checkOut,
  guestCount,
  childrenCount,
  totalPrice,
  guestName,
  guestEmail,
  guestPhone,
}: PaymentSummaryProps) {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Resumo da Reserva
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-moss-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-moss-900">Datas</p>
              <p className="text-sm text-moss-700">
                {format(checkIn, "dd/MM/yyyy")} até {format(checkOut, "dd/MM/yyyy")}
              </p>
              <p className="text-xs text-moss-600">{nights} {nights === 1 ? "noite" : "noites"}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-moss-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-moss-900">Hóspedes</p>
              <p className="text-sm text-moss-700">
                {guestCount} {guestCount === 1 ? "adulto" : "adultos"}
                {childrenCount > 0 && `, ${childrenCount} ${childrenCount === 1 ? "criança" : "crianças"}`}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-moss-900 mb-2">Dados do Hóspede</p>
            <div className="space-y-1 text-sm text-moss-700">
              <p>
                <strong>Nome:</strong> {guestName}
              </p>
              <p>
                <strong>Email:</strong> {guestEmail}
              </p>
              <p>
                <strong>Telefone:</strong> {guestPhone}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-semibold text-moss-900">Total a Pagar</span>
            <span className="text-2xl font-bold text-moss-900">
              R$ {totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

