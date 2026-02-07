"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculatePrice, PRICING, CHALET_PRICING } from "@/lib/utils/reservation"
import { Separator } from "@/components/ui/separator"
import { Calculator, Tag, Moon, Sun } from "lucide-react"

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
      <Card className="border-moss-100/50 bg-white/40 backdrop-blur-sm rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="bg-moss-50/30 pb-4 border-b border-moss-100/30">
          <CardTitle className="flex items-center gap-3 text-moss-900 font-heading text-lg">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-moss-100">
              <Calculator className="h-5 w-5 text-moss-500" />
            </div>
            Resumo de Preços
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-6">
          <p className="text-sm text-moss-400 font-light italic text-center">
            Selecione as datas para calcular o valor.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-white/40 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl shadow-moss-900/5 animate-fadeInUp">
      <CardHeader className="bg-moss-50/30 pb-4 border-b border-moss-100/50">
        <CardTitle className="flex items-center gap-3 text-moss-900 font-heading text-lg">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-moss-100">
            <Calculator className="h-5 w-5 text-moss-600" />
          </div>
          Resumo de Preços
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <div className="space-y-3">
          <div className="flex justify-between items-center group hover:bg-moss-50/50 p-2.5 rounded-xl transition-colors -mx-1">
            <div className="flex items-center gap-2.5">
              <Moon className="h-3.5 w-3.5 text-moss-400" />
              <span className="text-sm text-moss-600 font-medium">
                {priceCalculation.totalNights} {priceCalculation.totalNights === 1 ? "noite" : "noites"} (Casal)
              </span>
            </div>
            <span className="text-sm font-bold text-moss-900">
              R$ {priceCalculation.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {priceCalculation.guestPrice > 0 && (
            <div className="flex justify-between items-center group hover:bg-moss-50/50 p-2.5 rounded-xl transition-colors -mx-1">
              <span className="text-sm text-moss-600 font-medium">
                Hóspedes extras ({guestCount - 2})
              </span>
              <span className="text-sm font-bold text-moss-900">
                R$ {priceCalculation.guestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {priceCalculation.childrenPrice > 0 && (
            <div className="flex justify-between items-center group hover:bg-moss-50/50 p-2.5 rounded-xl transition-colors -mx-1">
              <span className="text-sm text-moss-600 font-medium">
                Crianças ({childrenCount})
              </span>
              <span className="text-sm font-bold text-moss-900">
                R$ {priceCalculation.childrenPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        <Separator className="bg-moss-100/50" />

        {/* Total */}
        <div className="flex items-center justify-between p-4 bg-moss-900 text-white rounded-2xl shadow-lg shadow-moss-900/20 transform transition-transform hover:scale-[1.02]">
          <span className="text-sm font-medium opacity-80">Total</span>
          <span className="text-xl sm:text-2xl font-bold font-heading">
            R$ {priceCalculation.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Tabela de preços */}
        <div className="rounded-2xl bg-moss-50/50 border border-moss-100/50 p-4 sm:p-5 space-y-3">
          <div className="text-[10px] font-bold text-moss-800 uppercase tracking-widest flex items-center gap-2">
            <div className="p-1 bg-white rounded-md border border-moss-100">
              <Tag className="w-3 h-3 text-moss-500" />
            </div>
            Tabela de Preços
          </div>
          <ul className="space-y-2.5">
            {[
              { label: "Dias úteis", value: `R$ ${unitPrices.weekday}/noite`, icon: Sun },
              { label: "Fim de semana", value: `R$ ${unitPrices.weekend}/noite`, icon: Moon },
            ].map((item, i) => (
              <li key={i} className="flex justify-between items-center text-xs text-moss-600">
                <div className="flex items-center gap-2">
                  <item.icon className="h-3 w-3 text-moss-400" />
                  <span>{item.label}</span>
                </div>
                <span className="font-semibold text-moss-800">{item.value}</span>
              </li>
            ))}
            <Separator className="bg-moss-100/50 !my-2" />
            {[
              { label: "Adulto extra", value: `R$ ${PRICING.EXTRA_ADULT}/noite` },
              { label: "Criança extra", value: `R$ ${PRICING.EXTRA_CHILD}/noite` },
            ].map((item, i) => (
              <li key={i} className="flex justify-between text-xs text-moss-500">
                <span>{item.label}</span>
                <span className="font-semibold text-moss-700">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
