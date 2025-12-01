"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Users, Baby } from "lucide-react"

const reservationSchema = z.object({
  guestName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  guestEmail: z.string().email("Email inválido"),
  guestPhone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  guestCount: z.number().min(1).max(10, "Máximo 10 adultos"),
  childrenCount: z.number().min(0).max(10, "Máximo 10 crianças"),
})

export type ReservationFormData = z.infer<typeof reservationSchema>

interface ReservationFormProps {
  onSubmit: (data: ReservationFormData) => void
  isLoading?: boolean
  defaultValues?: Partial<ReservationFormData>
}

export function ReservationForm({ onSubmit, isLoading = false, defaultValues }: ReservationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guestCount: 2,
      childrenCount: 0,
      ...defaultValues,
    },
  })

  const guestCount = watch("guestCount")
  const childrenCount = watch("childrenCount")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Reserva</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guestName">
              <User className="mr-2 inline h-4 w-4" />
              Nome Completo *
            </Label>
            <Input
              id="guestName"
              {...register("guestName")}
              placeholder="Seu nome completo"
              disabled={isLoading}
            />
            {errors.guestName && (
              <p className="text-sm text-red-600">{errors.guestName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail">
              <Mail className="mr-2 inline h-4 w-4" />
              Email *
            </Label>
            <Input
              id="guestEmail"
              type="email"
              {...register("guestEmail")}
              placeholder="seu@email.com"
              disabled={isLoading}
            />
            {errors.guestEmail && (
              <p className="text-sm text-red-600">{errors.guestEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestPhone">
              <Phone className="mr-2 inline h-4 w-4" />
              Telefone *
            </Label>
            <Input
              id="guestPhone"
              type="tel"
              {...register("guestPhone")}
              placeholder="(92) 99999-9999"
              disabled={isLoading}
            />
            {errors.guestPhone && (
              <p className="text-sm text-red-600">{errors.guestPhone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestCount">
                <Users className="mr-2 inline h-4 w-4" />
                Adultos *
              </Label>
              <Input
                id="guestCount"
                type="number"
                min={1}
                max={10}
                {...register("guestCount", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.guestCount && (
                <p className="text-sm text-red-600">{errors.guestCount.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Base: 2 adultos (casal)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="childrenCount">
                <Baby className="mr-2 inline h-4 w-4" />
                Crianças
              </Label>
              <Input
                id="childrenCount"
                type="number"
                min={0}
                max={10}
                {...register("childrenCount", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.childrenCount && (
                <p className="text-sm text-red-600">{errors.childrenCount.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Até 5 anos: grátis
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-moss-50 p-3 text-xs text-moss-700">
            <p className="font-semibold mb-1">Informações:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Valores base são para casal (2 adultos)</li>
              <li>Crianças até 5 anos não pagam</li>
              <li>Crianças de 6 a 15 anos: R$ 100/noite</li>
              <li>Adultos extras (acima de 2): R$ 150/noite</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Continuar para Pagamento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

