"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculatePrice, PRICING, formatDatePortuguese } from "@/lib/utils/reservation"
import { Separator } from "@/components/ui/separator"
import { Calculator } from "lucide-react"

interface PriceCalculatorProps {
  checkIn: Date | undefined
  checkOut: Date | undefined
  guestCount: number
  childrenCount: number
}

export function PriceCalculator({
  checkIn,
  checkOut,
  guestCount,
  childrenCount,
}: PriceCalculatorProps) {
  const priceCalculation = useMemo(() => {
    if (!checkIn || !checkOut) {
      return null
    }

    return calculatePrice(checkIn, checkOut, guestCount, childrenCount)
  }, [checkIn, checkOut, guestCount, childrenCount])

  if (!priceCalculation || !checkIn || !checkOut) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Resumo de Preços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecione as datas e número de hóspedes para ver o preço
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Resumo de Preços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {priceCalculation.totalNights} {priceCalculation.totalNights === 1 ? "noite" : "noites"}
            </span>
            <span className="font-medium">
              R$ {priceCalculation.basePrice.toFixed(2)}
            </span>
          </div>

          {priceCalculation.breakdown.nights.length > 0 && (
            <div className="ml-4 space-y-1 text-xs text-muted-foreground">
              {priceCalculation.breakdown.nights.map((night, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {new Date(night.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                    {night.isWeekend && " (fim de semana)"}
                  </span>
                  <span>R$ {night.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {priceCalculation.guestPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Hóspedes extras ({guestCount - 2} x {priceCalculation.totalNights} noites)
              </span>
              <span className="font-medium">
                R$ {priceCalculation.guestPrice.toFixed(2)}
              </span>
            </div>
          )}

          {priceCalculation.childrenPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Crianças ({childrenCount} x {priceCalculation.totalNights} noites)
              </span>
              <span className="font-medium">
                R$ {priceCalculation.childrenPrice.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-moss-900">
            R$ {priceCalculation.totalPrice.toFixed(2)}
          </span>
        </div>

        <div className="rounded-lg bg-moss-50 p-3 text-xs text-moss-700">
          <p>
            <strong>Informações:</strong>
          </p>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>Finais de semana: R$ {PRICING.WEEKEND.toFixed(2)}/noite</li>
            <li>Dias úteis: R$ {PRICING.WEEKDAY.toFixed(2)}/noite</li>
            <li>Crianças até 5 anos não pagam</li>
            <li>Crianças 6-15 anos: R$ {PRICING.EXTRA_CHILD.toFixed(2)}/noite</li>
            <li>Adultos extras: R$ {PRICING.EXTRA_ADULT.toFixed(2)}/noite</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

