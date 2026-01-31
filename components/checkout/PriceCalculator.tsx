"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculatePrice, PRICING, CHALET_PRICING } from "@/lib/utils/reservation"
import { Separator } from "@/components/ui/separator"
import { Calculator } from "lucide-react"

interface PriceCalculatorProps {
  checkIn: Date | undefined
  checkOut: Date | undefined
  guestCount: number
  childrenCount: number
  chaletId?: string
}

export function PriceCalculator({
  checkIn,
  checkOut,
  guestCount,
  childrenCount,
  chaletId = 'chale-anaue',
}: PriceCalculatorProps) {
  const priceCalculation = useMemo(() => {
    if (!checkIn || !checkOut) {
      return null
    }

    return calculatePrice(checkIn, checkOut, guestCount, childrenCount, chaletId)
  }, [checkIn, checkOut, guestCount, childrenCount, chaletId])

  const unitPrices = useMemo(() => {
    return CHALET_PRICING[chaletId] || CHALET_PRICING['chale-anaue'];
  }, [chaletId]);

  if (!priceCalculation || !checkIn || !checkOut) {
    return (
      <Card className="border-moss-100 rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="bg-moss-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-moss-900 font-heading text-lg">
            <Calculator className="h-5 w-5 text-moss-600" />
            Resumo de Preços
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-moss-500 font-light italic">
            Selecione as datas para calcular o valor.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-moss-100 rounded-3xl overflow-hidden shadow-sm">
      <CardHeader className="bg-moss-50/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-moss-900 font-heading text-lg">
          <Calculator className="h-5 w-5 text-moss-600" />
          Resumo de Preços
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-moss-600 font-light">
              {priceCalculation.totalNights} {priceCalculation.totalNights === 1 ? "noite" : "noites"} (Casal)
            </span>
            <span className="text-sm font-bold text-moss-900">
              R$ {priceCalculation.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {priceCalculation.guestPrice > 0 && (
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-moss-600 font-light">
                Hóspedes extras ({guestCount - 2})
              </span>
              <span className="text-sm font-bold text-moss-900">
                R$ {priceCalculation.guestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {priceCalculation.childrenPrice > 0 && (
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-moss-600 font-light">
                Crianças ({childrenCount})
              </span>
              <span className="text-sm font-bold text-moss-900">
                R$ {priceCalculation.childrenPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        <Separator className="bg-moss-100 shadow-none" />

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-moss-950 font-heading">Total</span>
          <div className="text-right">
            <span className="text-2xl font-black text-moss-900 font-heading">
              R$ {priceCalculation.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-moss-900/[0.02] border border-moss-100/50 p-4 space-y-2">
          <div className="text-[10px] font-bold text-moss-900 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1 h-3 bg-moss-400 rounded-full" />
            Tabela de Preços
          </div>
          <ul className="space-y-1.5">
            {[
              { label: "Dias úteis", value: `R$ ${unitPrices.weekday}/noite` },
              { label: "Fim de semana", value: `R$ ${unitPrices.weekend}/noite` },
              { label: "Adulto extra", value: `R$ ${PRICING.EXTRA_ADULT}/noite` },
              { label: "Criança extra", value: `R$ ${PRICING.EXTRA_CHILD}/noite` },
            ].map((item, i) => (
              <li key={i} className="flex justify-between text-[11px] text-moss-600 font-light">
                <span>{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
