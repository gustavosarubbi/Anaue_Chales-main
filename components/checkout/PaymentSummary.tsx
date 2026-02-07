"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Receipt, Calendar, Users, User, Phone, Shield } from "lucide-react"
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
    <Card className="border-white/40 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl shadow-moss-900/5 animate-fadeInUp">
      <CardHeader className="bg-moss-50/30 pb-4 border-b border-moss-100/50">
        <CardTitle className="flex items-center gap-3 text-moss-900 font-heading text-lg">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-moss-100">
            <Receipt className="h-5 w-5 text-moss-600" />
          </div>
          Resumo da Reserva
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <div className="space-y-4">
          {/* Datas */}
          <div className="flex items-start gap-3.5 group">
            <div className="p-2.5 bg-moss-50 rounded-xl group-hover:bg-moss-100 transition-colors shrink-0 border border-moss-100/50">
              <Calendar className="h-4.5 w-4.5 text-moss-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest mb-1">Datas</p>
              <p className="text-sm font-bold text-moss-900">
                {format(checkIn, "dd/MM")} — {format(checkOut, "dd/MM")}
              </p>
              <p className="text-xs text-moss-500 font-medium mt-0.5">{nights} {nights === 1 ? "noite" : "noites"}</p>
            </div>
          </div>

          <Separator className="bg-moss-100/30" />

          {/* Hóspedes */}
          <div className="flex items-start gap-3.5 group">
            <div className="p-2.5 bg-moss-50 rounded-xl group-hover:bg-moss-100 transition-colors shrink-0 border border-moss-100/50">
              <Users className="h-4.5 w-4.5 text-moss-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest mb-1">Hóspedes</p>
              <p className="text-sm font-bold text-moss-900">
                {guestCount} {guestCount === 1 ? "adulto" : "adultos"}
                {childrenCount > 0 && ` e ${childrenCount} ${childrenCount === 1 ? "criança" : "crianças"}`}
              </p>
            </div>
          </div>

          <Separator className="bg-moss-100/30" />

          {/* Dados do hóspede */}
          {guestName && (
            <div className="bg-moss-50/50 rounded-2xl p-4 border border-moss-100/50 space-y-3">
              <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest flex items-center gap-2">
                <User className="h-3 w-3" />
                Seus Dados
              </p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-moss-400 font-medium text-xs shrink-0">Nome</span>
                  <span className="font-bold text-moss-900 text-right truncate">{guestName}</span>
                </div>
                {guestPhone && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-moss-400 font-medium text-xs shrink-0">Telefone</span>
                    <span className="font-bold text-moss-900 text-right truncate">{guestPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-4 bg-moss-900 text-white rounded-2xl shadow-lg shadow-moss-900/20 transform transition-transform hover:scale-[1.02]">
              <span className="text-sm font-medium opacity-80">Total a Pagar</span>
              <span className="text-xl sm:text-2xl font-bold font-heading">
                R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 text-moss-400 pt-1">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium">Pagamento seguro via InfinitePay</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
