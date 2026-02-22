"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Mail, Phone, Users, Baby, Loader2, Shield, ArrowRight, Info } from "lucide-react"
import { ENV } from "@/lib/utils/env"
import { toast } from "sonner"

const reservationSchema = z.object({
  guestName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  guestEmail: z.string().email("Email inválido"),
  guestPhone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  guestCount: z.number({ invalid_type_error: "Informe um número válido" }).min(1, "Mínimo 1 adulto").max(10, "Máximo 10 adultos"),
  childrenCount: z.number({ invalid_type_error: "Informe um número válido" }).min(0, "Mínimo 0").max(10, "Máximo 10 crianças"),
  captchaToken: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Você precisa aceitar os termos e condições para continuar.",
  }),
  adultDeclaration: z.boolean().refine((val) => val === true, {
    message: "Você precisa declarar ser maior de 18 anos para continuar.",
  }),
})

export type ReservationFormData = z.infer<typeof reservationSchema>

interface ReservationFormProps {
  onSubmit: (data: ReservationFormData) => void
  onFormChange?: (data: { guestCount: number; childrenCount: number }) => void
  isLoading?: boolean
  initialData?: Partial<ReservationFormData>
  /** ID do form para permitir submit externo */
  formId?: string
  /** Se true, esconde o botão de submit interno (para renderizar externamente) */
  hideSubmitButton?: boolean
}

export function ReservationForm({
  onSubmit,
  onFormChange,
  isLoading = false,
  initialData,
  formId = "reservation-form",
  hideSubmitButton = false,
}: ReservationFormProps) {
  // Usar try-catch para evitar erro se o provider não estiver disponível
  let executeRecaptcha: ((action: string) => Promise<string>) | undefined
  try {
    const recaptchaHook = useGoogleReCaptcha()
    executeRecaptcha = recaptchaHook?.executeRecaptcha
  } catch (error) {
    // Provider não disponível - isso é OK, o backend vai tratar
    console.warn('[ReservationForm] ReCAPTCHA provider não disponível, continuando sem validação client-side')
  }
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
      adultDeclaration: false,
      termsAccepted: false,
      ...initialData,
    },
  })

  // Observar mudanças em guestCount e childrenCount para atualizar o resumo em tempo real
  const watchedGuestCount = watch("guestCount")
  const watchedChildrenCount = watch("childrenCount")

  useEffect(() => {
    if (onFormChange) {
      const gc = typeof watchedGuestCount === "number" && !isNaN(watchedGuestCount) ? watchedGuestCount : 2
      const cc = typeof watchedChildrenCount === "number" && !isNaN(watchedChildrenCount) ? watchedChildrenCount : 0
      onFormChange({ guestCount: gc, childrenCount: cc })
    }
  }, [watchedGuestCount, watchedChildrenCount, onFormChange])

  const onFormSubmit = async (data: ReservationFormData) => {
    console.log('[ReservationForm] Form válido, prosseguindo com submit...', data)

    // Se não há chave reCAPTCHA configurada, prossegue sem token
    const hasRecaptchaKey = !!ENV.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    if (!hasRecaptchaKey) {
      onSubmit({ ...data, captchaToken: undefined })
      return
    }

    setIsCaptchaLoading(true)

    if (!executeRecaptcha) {
      console.warn("ReCAPTCHA ainda não carregado, prosseguindo para validação no servidor...")
      onSubmit({ ...data, captchaToken: "MISSING_CLIENT_SIDE" })
      setIsCaptchaLoading(false)
      return
    }

    try {
      // Timeout de 5 segundos para o reCAPTCHA
      const token = await Promise.race([
        executeRecaptcha("reservation_submit"),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000)
        )
      ])

      onSubmit({ ...data, captchaToken: token })
    } catch (error: any) {
      console.warn("ReCAPTCHA bypass ativo:", error?.message)
      // Prossegue silenciosamente para o backend decidir
      onSubmit({ ...data, captchaToken: `BYPASS_${error?.message || "unknown"}` })
    } finally {
      setIsCaptchaLoading(false)
    }
  }

  const onFormInvalid = (fieldErrors: any) => {
    console.warn('[ReservationForm] Validação falhou:', fieldErrors)
    const firstError = Object.values(fieldErrors)[0] as any
    if (firstError?.message) {
      toast.error(firstError.message)
    } else {
      toast.error("Por favor, preencha todos os campos corretamente.")
    }
  }

  return (
    <div className="animate-fadeInUp space-y-8">
      <div className="text-center lg:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading mb-2 tracking-tight">Seus Dados</h2>
        <p className="text-moss-500 font-light text-sm sm:text-base">Quase lá! Só precisamos de algumas informações para confirmar sua estadia.</p>
      </div>

      <form id={formId} onSubmit={handleSubmit(onFormSubmit, onFormInvalid)} className="space-y-8 bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-moss-100/50 shadow-lg shadow-moss-900/5">
        {/* Informações pessoais */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 bg-moss-50 rounded-lg border border-moss-100">
              <User className="h-3.5 w-3.5 text-moss-600" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-moss-800">Informações Pessoais</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="guestName" className="text-xs font-bold uppercase tracking-widest text-moss-600 ml-1">
                Nome Completo
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-moss-300 transition-colors group-focus-within:text-moss-600" />
                <Input
                  id="guestName"
                  {...register("guestName")}
                  placeholder="Ex: João Silva"
                  className="pl-12 h-13 sm:h-14 rounded-2xl border-moss-100 bg-moss-50/30 focus:bg-white focus:border-moss-500 focus:ring-4 focus:ring-moss-100 transition-all text-sm sm:text-base"
                  disabled={isLoading || isCaptchaLoading}
                />
              </div>
              {errors.guestName && (
                <p className="text-xs text-red-500 font-medium ml-1 animate-fadeInUp">{errors.guestName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestEmail" className="text-xs font-bold uppercase tracking-widest text-moss-600 ml-1">
                E-mail
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-moss-300 transition-colors group-focus-within:text-moss-600" />
                <Input
                  id="guestEmail"
                  type="email"
                  {...register("guestEmail")}
                  placeholder="joao@exemplo.com"
                  className="pl-12 h-13 sm:h-14 rounded-2xl border-moss-100 bg-moss-50/30 focus:bg-white focus:border-moss-500 focus:ring-4 focus:ring-moss-100 transition-all text-sm sm:text-base"
                  disabled={isLoading || isCaptchaLoading}
                />
              </div>
              {errors.guestEmail && (
                <p className="text-xs text-red-500 font-medium ml-1 animate-fadeInUp">{errors.guestEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPhone" className="text-xs font-bold uppercase tracking-widest text-moss-600 ml-1">
                WhatsApp / Celular
              </Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-moss-300 transition-colors group-focus-within:text-moss-600" />
                <Input
                  id="guestPhone"
                  type="tel"
                  {...register("guestPhone")}
                  placeholder="(92) 99999-9999"
                  className="pl-12 h-13 sm:h-14 rounded-2xl border-moss-100 bg-moss-50/30 focus:bg-white focus:border-moss-500 focus:ring-4 focus:ring-moss-100 transition-all text-sm sm:text-base"
                  disabled={isLoading || isCaptchaLoading}
                />
              </div>
              {errors.guestPhone && (
                <p className="text-xs text-red-500 font-medium ml-1 animate-fadeInUp">{errors.guestPhone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestCount" className="text-xs font-bold uppercase tracking-widest text-moss-600 ml-1">
                  Adultos
                </Label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-moss-300 transition-colors group-focus-within:text-moss-600" />
                  <Input
                    id="guestCount"
                    type="number"
                    min={1}
                    max={10}
                    {...register("guestCount", { valueAsNumber: true })}
                    className="pl-12 h-13 sm:h-14 rounded-2xl border-moss-100 bg-moss-50/30 focus:bg-white focus:border-moss-500 focus:ring-4 focus:ring-moss-100 transition-all text-sm sm:text-base"
                    disabled={isLoading || isCaptchaLoading}
                  />
                </div>
                {errors.guestCount && (
                  <p className="text-xs text-red-500 font-medium ml-1 animate-fadeInUp">{errors.guestCount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="childrenCount" className="text-xs font-bold uppercase tracking-widest text-moss-600 ml-1">
                  Crianças
                </Label>
                <div className="relative group">
                  <Baby className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-moss-300 transition-colors group-focus-within:text-moss-600" />
                  <Input
                    id="childrenCount"
                    type="number"
                    min={0}
                    max={10}
                    {...register("childrenCount", { valueAsNumber: true })}
                    className="pl-12 h-13 sm:h-14 rounded-2xl border-moss-100 bg-moss-50/30 focus:bg-white focus:border-moss-500 focus:ring-4 focus:ring-moss-100 transition-all text-sm sm:text-base"
                    disabled={isLoading || isCaptchaLoading}
                  />
                </div>
                {errors.childrenCount && (
                  <p className="text-xs text-red-500 font-medium ml-1 animate-fadeInUp">{errors.childrenCount.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Políticas da Casa */}
        <div className="rounded-2xl bg-moss-50/50 border border-moss-100/50 p-5 sm:p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-moss-800 flex items-center gap-2.5">
            <div className="p-1.5 bg-white rounded-lg border border-moss-100 shadow-sm">
              <Info className="w-3.5 h-3.5 text-moss-500" />
            </div>
            Políticas da Casa
          </h4>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {[
              "Valores base para 2 adultos",
              "Crianças até 5 anos: Cortesia",
              "Crianças 6-15 anos: R$ 100/noite",
              "Adultos extras: R$ 150/noite"
            ].map((policy, i) => (
              <li key={i} className="flex items-center gap-2.5 text-xs text-moss-500 font-medium">
                <div className="w-1 h-1 rounded-full bg-moss-400 shrink-0" />
                {policy}
              </li>
            ))}
          </ul>
        </div>

        {/* Declaração de maior de 18 anos */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="adultDeclaration"
              className="mt-1"
              onCheckedChange={(checked) => {
                setValue("adultDeclaration", checked === true, { shouldValidate: true })
              }}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="adultDeclaration"
                className="text-sm font-medium leading-relaxed text-moss-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Declaro ser maior de 18 anos.
              </Label>
            </div>
          </div>
          {errors.adultDeclaration && (
            <p className="text-xs text-red-500 font-medium ml-7 animate-fadeInUp">{errors.adultDeclaration.message}</p>
          )}
        </div>

        {/* Termos e Condições Checkbox */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              className="mt-1"
              onCheckedChange={(checked) => {
                setValue("termsAccepted", checked === true, { shouldValidate: true })
              }}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-relaxed text-moss-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Li e concordo com os <a href="/#politica-cancelamento" target="_blank" className="underline text-moss-900 hover:text-moss-700">Termos de Uso e Política de Cancelamento</a>.
              </Label>
              <p className="text-[11px] text-moss-500 text-muted-foreground">
                Ao continuar, você declara estar ciente das regras de hospedagem, horários, políticas de reembolso, e da obrigação de apresentar documento de identidade com foto no check-in.
              </p>
            </div>
          </div>
          {errors.termsAccepted && (
            <p className="text-xs text-red-500 font-medium ml-7 animate-fadeInUp">{errors.termsAccepted.message}</p>
          )}
        </div>

        {/* Submit - visível apenas no desktop ou se não está escondido */}
        {!hideSubmitButton && (
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full sm:w-auto sm:px-12 bg-moss-700 hover:bg-moss-800 text-white h-14 text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 rounded-2xl transition-all duration-300"
              disabled={isLoading || isCaptchaLoading}
            >
              {isLoading || isCaptchaLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{isCaptchaLoading ? "Validando segurança..." : "Processando..."}</span>
                </div>
              ) : (
                <>
                  Confirmar e Pagar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <div className="flex items-center justify-center gap-2 text-moss-400">
              <Shield className="h-3.5 w-3.5" />
              <p className="text-[10px] leading-tight">
                Pagamento seguro protegido pelo reCAPTCHA.{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-moss-600 transition-colors">Privacidade</a>
                {" e "}
                <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline hover:text-moss-600 transition-colors">Termos</a>
                {" do Google."}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
