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
    <Card className="border-moss-100 rounded-3xl overflow-hidden shadow-sm">
      <CardHeader className="bg-moss-50/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-moss-900 font-heading text-lg">
          <Receipt className="h-5 w-5 text-moss-600" />
          Resumo da Reserva
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-moss-50 rounded-xl">
              <Calendar className="h-5 w-5 text-moss-600" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest">Datas selecionadas</p>
              <p className="text-sm font-bold text-moss-900">
                {format(checkIn, "dd/MM")} — {format(checkOut, "dd/MM")}
              </p>
              <p className="text-xs text-moss-600 font-light">{nights} {nights === 1 ? "noite" : "noites"}</p>
            </div>
          </div>

          <Separator className="bg-moss-100 shadow-none" />

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-moss-50 rounded-xl">
              <Users className="h-5 w-5 text-moss-600" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest">Hóspedes</p>
              <p className="text-sm font-bold text-moss-900">
                {guestCount} {guestCount === 1 ? "adulto" : "adultos"}
                {childrenCount > 0 && ` e ${childrenCount} ${childrenCount === 1 ? "criança" : "crianças"}`}
              </p>
            </div>
          </div>

          <Separator className="bg-moss-100 shadow-none" />

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest">Seus Dados</p>
            <div className="space-y-1 text-sm text-moss-700 font-light">
              <p className="flex justify-between items-center">
                <span className="text-moss-400">Nome:</span>
                <span className="font-semibold text-moss-900">{guestName}</span>
              </p>
              <p className="flex justify-between items-center">
                <span className="text-moss-400">Telefone:</span>
                <span className="font-semibold text-moss-900">{guestPhone}</span>
              </p>
            </div>
          </div>

          <Separator className="bg-moss-100 shadow-none" />

          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-moss-950 font-heading">Total a Pagar</span>
            <div className="text-right">
              <span className="text-2xl font-black text-moss-900 font-heading">
                R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

