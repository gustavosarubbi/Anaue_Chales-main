"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Users, Baby, Loader2 } from "lucide-react"
import { ENV } from "@/lib/utils/env"

const reservationSchema = z.object({
  guestName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  guestEmail: z.string().email("Email inválido"),
  guestPhone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  guestCount: z.number().min(1).max(10, "Máximo 10 adultos"),
  childrenCount: z.number().min(0).max(10, "Máximo 10 crianças"),
  captchaToken: z.string().optional(),
})

export type ReservationFormData = z.infer<typeof reservationSchema>

interface ReservationFormProps {
  onSubmit: (data: ReservationFormData) => void
  isLoading?: boolean
  initialData?: Partial<ReservationFormData>
}

export function ReservationForm({ onSubmit, isLoading = false, initialData }: ReservationFormProps) {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guestCount: 2,
      childrenCount: 0,
      captchaToken: "",
      ...initialData,
    },
  })

  const onFormSubmit = async (data: ReservationFormData) => {
    if (!executeRecaptcha) {
      console.error("ReCAPTCHA ainda não carregado")
      return
    }

    setIsCaptchaLoading(true)
    try {
      const token = await executeRecaptcha("reservation_submit")
      onSubmit({ ...data, captchaToken: token })
    } catch (error) {
      console.error("Erro ao gerar token ReCAPTCHA:", error)
    } finally {
      setIsCaptchaLoading(false)
    }
  }

  return (
    <div className="animate-fadeInUp space-y-8">
      <div className="text-center lg:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading mb-2">Seus Dados</h2>
        <p className="text-moss-600 font-light">Quase lá! Só precisamos de algumas informações para confirmar sua estadia.</p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="guestName" className="text-xs font-bold uppercase tracking-widest text-moss-900">
              Nome Completo
            </Label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-moss-400 transition-colors group-focus-within:text-moss-600" />
              <Input
                id="guestName"
                {...register("guestName")}
                placeholder="Ex: João Silva"
                className="pl-11 h-14 rounded-2xl border-moss-100 focus:border-moss-500 focus:ring-moss-500 transition-all"
                disabled={isLoading || isCaptchaLoading}
              />
            </div>
            {errors.guestName && (
              <p className="text-xs text-red-500 font-medium">{errors.guestName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail" className="text-xs font-bold uppercase tracking-widest text-moss-900">
              E-mail
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-moss-400 transition-colors group-focus-within:text-moss-600" />
              <Input
                id="guestEmail"
                type="email"
                {...register("guestEmail")}
                placeholder="joao@exemplo.com"
                className="pl-11 h-14 rounded-2xl border-moss-100 focus:border-moss-500 focus:ring-moss-500 transition-all"
                disabled={isLoading || isCaptchaLoading}
              />
            </div>
            {errors.guestEmail && (
              <p className="text-xs text-red-500 font-medium">{errors.guestEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestPhone" className="text-xs font-bold uppercase tracking-widest text-moss-900">
              WhatsApp / Celular
            </Label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-moss-400 transition-colors group-focus-within:text-moss-600" />
              <Input
                id="guestPhone"
                type="tel"
                {...register("guestPhone")}
                placeholder="(92) 99999-9999"
                className="pl-11 h-14 rounded-2xl border-moss-100 focus:border-moss-500 focus:ring-moss-500 transition-all"
                disabled={isLoading || isCaptchaLoading}
              />
            </div>
            {errors.guestPhone && (
              <p className="text-xs text-red-500 font-medium">{errors.guestPhone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestCount" className="text-xs font-bold uppercase tracking-widest text-moss-900">
                Adultos
              </Label>
              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-moss-400" />
                <Input
                  id="guestCount"
                  type="number"
                  min={1}
                  max={10}
                  {...register("guestCount", { valueAsNumber: true })}
                  className="pl-11 h-14 rounded-2xl border-moss-100 focus:border-moss-500 focus:ring-moss-500 transition-all"
                  disabled={isLoading || isCaptchaLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="childrenCount" className="text-xs font-bold uppercase tracking-widest text-moss-900">
                Crianças
              </Label>
              <div className="relative group">
                <Baby className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-moss-400" />
                <Input
                  id="childrenCount"
                  type="number"
                  min={0}
                  max={10}
                  {...register("childrenCount", { valueAsNumber: true })}
                  className="pl-11 h-14 rounded-2xl border-moss-100 focus:border-moss-500 focus:ring-moss-500 transition-all"
                  disabled={isLoading || isCaptchaLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-moss-900/[0.02] border border-moss-100/50 p-6 sm:p-8 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-moss-900 flex items-center gap-2">
            <span className="w-1 h-3 bg-moss-500 rounded-full block" />
            Políticas da Casa
          </h4>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {[
              "Valores base para 2 adultos",
              "Crianças até 5 anos: Cortesia",
              "Crianças 6-15 anos: R$ 100/noite",
              "Adultos extras: R$ 150/noite"
            ].map((policy, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-moss-600 font-light">
                <div className="w-1 h-1 rounded-full bg-moss-400" />
                {policy}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full sm:w-auto sm:px-12 bg-moss-700 hover:bg-moss-800 text-white h-14 text-lg font-bold shadow-xl hover-lift rounded-2xl transition-all duration-300"
            disabled={isLoading || isCaptchaLoading}
          >
            {isLoading || isCaptchaLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{isCaptchaLoading ? "Validando segurança..." : "Processando..."}</span>
              </div>
            ) : "Confirmar e Pagar"}
          </Button>
          <p className="text-[10px] text-moss-400 text-center px-4 leading-tight">
            Este site é protegido pelo reCAPTCHA e a
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-moss-600 mx-1">Política de Privacidade</a>
            e os
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline hover:text-moss-600 mx-1">Termos de Serviço</a>
            do Google se aplicam.
          </p>
        </div>
      </form>
    </div>
  )
}
