"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DatePicker } from "@/components/checkout/DatePicker"
import { ReservationForm, ReservationFormData } from "@/components/checkout/ReservationForm"
import { PriceCalculator } from "@/components/checkout/PriceCalculator"
import { PaymentSummary } from "@/components/checkout/PaymentSummary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { calculatePrice, validateReservationDates, formatDateForInput } from "@/lib/utils/reservation"
import { toast } from "sonner"
import { Footer } from "@/components/sections/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

type Step = "dates" | "form" | "payment" | "processing"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [step, setStep] = useState<Step>("dates")
  const [loading, setLoading] = useState(false)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  // Dates
  // IMPORTANTE: new Date("YYYY-MM-DD") interpreta como UTC, causando problemas de timezone
  // Precisamos criar a data no timezone local
  const [checkIn, setCheckIn] = useState<Date | undefined>(() => {
    const checkInParam = searchParams.get("check_in")
    if (!checkInParam) return undefined
    const [year, month, day] = checkInParam.split('-').map(Number)
    return new Date(year, month - 1, day, 0, 0, 0, 0)
  })
  const [checkOut, setCheckOut] = useState<Date | undefined>(() => {
    const checkOutParam = searchParams.get("check_out")
    if (!checkOutParam) return undefined
    const [year, month, day] = checkOutParam.split('-').map(Number)
    return new Date(year, month - 1, day, 0, 0, 0, 0)
  })

  // Form data
  const [formData, setFormData] = useState<ReservationFormData | null>(null)
  const [reservationId, setReservationId] = useState<string | null>(null)

  // Price calculation
  const priceCalculation = checkIn && checkOut && formData
    ? calculatePrice(checkIn, checkOut, formData.guestCount, formData.childrenCount)
    : null

  // Check availability when dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      // Usar formatDateForInput em vez de toISOString para evitar problemas de timezone
      console.log("Datas alteradas, verificando disponibilidade:", {
        checkIn: formatDateForInput(checkIn),
        checkOut: formatDateForInput(checkOut),
        checkInDate: checkIn.getDate(),
        checkInMonth: checkIn.getMonth() + 1,
        checkInYear: checkIn.getFullYear(),
      })
      checkAvailability()
    } else {
      setIsAvailable(null)
    }
  }, [checkIn, checkOut])

  const checkAvailability = async () => {
    if (!checkIn || !checkOut) {
      setIsAvailable(null)
      return
    }

    setAvailabilityLoading(true)
    setIsAvailable(null)

    try {
      // Validate dates first
      const validation = validateReservationDates(checkIn, checkOut)
      if (!validation.valid) {
        toast.error(validation.error)
        setCheckIn(undefined)
        setCheckOut(undefined)
        setIsAvailable(false)
        setAvailabilityLoading(false)
        return
      }

      const response = await fetch("/api/reservations/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: formatDateForInput(checkIn),
          checkOut: formatDateForInput(checkOut),
        }),
      })

      const data = await response.json()

      console.log("Resposta da API de disponibilidade:", {
        success: data.success,
        available: data.available,
        requestedDates: data.requestedDates,
        conflictingDates: data.conflictingDates,
        allBookedDates: data.allBookedDates?.slice(0, 10), // Primeiros 10 para não poluir o console
      })

      if (!data.success) {
        console.error("Erro na resposta da API:", data)
        toast.error(data.error || "Erro ao verificar disponibilidade")
        setIsAvailable(false)
        return
      }

      if (data.available) {
        setIsAvailable(true)
        console.log("✓ Datas disponíveis confirmadas")
      } else {
        setIsAvailable(false)
        console.warn("✗ Datas não disponíveis. Conflitos:", data.conflictingDates)
        toast.error("As datas selecionadas não estão disponíveis")
        // Não limpa as datas automaticamente, deixa o usuário escolher outras
      }
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error)
      toast.error("Erro ao verificar disponibilidade")
      setIsAvailable(false)
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const handleDatesChange = (newCheckIn: Date | undefined, newCheckOut: Date | undefined) => {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)
    setIsAvailable(null) // Reset availability when dates change
    if (!newCheckOut) {
      setStep("dates")
    }
  }

  const handleFormSubmit = async (data: ReservationFormData) => {
    if (!checkIn || !checkOut) {
      toast.error("Por favor, selecione as datas primeiro")
      return
    }

    setFormData(data)
    setLoading(true)

    try {
      // Create reservation
      const reservationResponse = await fetch("/api/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: formatDateForInput(checkIn),
          checkOut: formatDateForInput(checkOut),
          ...data,
        }),
      })

      const reservationResult = await reservationResponse.json()

      if (!reservationResult.success) {
        toast.error(reservationResult.error || "Erro ao criar reserva")
        setLoading(false)
        return
      }

      setReservationId(reservationResult.reservation.id)
      setStep("payment")

      // Create payment preference
      const paymentResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: reservationResult.reservation.id,
          amount: reservationResult.reservation.totalPrice,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          checkIn: formatDateForInput(checkIn),
          checkOut: formatDateForInput(checkOut),
        }),
      })

      const paymentResult = await paymentResponse.json()

      if (!paymentResult.success) {
        toast.error(paymentResult.error || "Erro ao criar pagamento")
        setLoading(false)
        return
      }

      // Redirect to Mercado Pago checkout
      setStep("processing")
      window.location.href = paymentResult.initPoint || paymentResult.sandboxInitPoint
    } catch (error) {
      console.error("Erro ao processar reserva:", error)
      toast.error("Erro ao processar reserva. Tente novamente.")
      setLoading(false)
    }
  }

  const handleContinueToForm = () => {
    if (!checkIn || !checkOut) {
      toast.error("Por favor, selecione as datas de check-in e check-out")
      return
    }

    const validation = validateReservationDates(checkIn, checkOut)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setStep("form")
  }

  return (
    <>
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-moss-50 to-white texture-dots pt-10 pb-24 px-4 sm:pt-12 sm:pb-28 relative">
        <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-3" aria-label="Voltar para a página inicial">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold text-moss-900 mb-1">
            Finalizar Reserva
          </h1>
          <p className="text-sm md:text-base text-moss-700 max-w-2xl">
            Em poucos passos você escolhe as datas, preenche seus dados e é redirecionado com segurança para o pagamento.
          </p>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-8 space-y-4">
          {/* Visual Progress Bar */}
          <div className="relative w-full h-2 bg-moss-100 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r from-moss-500 to-moss-600 rounded-full transition-all duration-500 ease-out shadow-lg ${
                step === "dates" ? "w-1/3" : step === "form" ? "w-2/3" : "w-full"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm w-full max-w-xl">
              <div className={`flex items-center gap-2 transition-all duration-300 ${step !== "dates" ? "text-moss-600" : "text-moss-900 font-semibold scale-110"}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 shadow-md ${
                  step !== "dates" ? "bg-moss-200 text-moss-700" : "bg-moss-600 text-white"
                }`}>
                  {step !== "dates" ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" /> : "1"}
                </div>
                <span className="hidden xs:inline">Datas</span>
              </div>
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step !== "dates" ? "bg-moss-500" : "bg-moss-200"}`} />
              <div className={`flex items-center gap-2 transition-all duration-300 ${step === "dates" ? "text-moss-400" : step === "payment" || step === "processing" ? "text-moss-600" : "text-moss-900 font-semibold scale-110"}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 shadow-md ${
                  step === "dates" ? "bg-moss-200 text-moss-400" : step === "form" ? "bg-moss-600 text-white" : "bg-moss-200 text-moss-700"
                }`}>
                  {step === "payment" || step === "processing" ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" /> : "2"}
                </div>
                <span className="hidden xs:inline">Dados</span>
              </div>
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step === "payment" || step === "processing" ? "bg-moss-500" : "bg-moss-200"}`} />
              <div className={`flex items-center gap-2 transition-all duration-300 ${step !== "processing" && step !== "payment" ? "text-moss-400" : "text-moss-900 font-semibold scale-110"}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 shadow-md ${
                  step === "processing" || step === "payment" ? "bg-moss-600 text-white" : "bg-moss-200 text-moss-400"
                }`}>
                  {step === "processing" ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" aria-label="Processando pagamento" /> : "3"}
                </div>
                <span className="hidden xs:inline">Pagamento</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-moss-600 text-center max-w-md font-medium">
              {step === "dates" && "🗓️ Escolha as datas da sua estadia"}
              {step === "form" && "📝 Preencha seus dados para continuar"}
              {step === "payment" && "💳 Redirecionando para o pagamento..."}
              {step === "processing" && "⏳ Processando sua reserva..."}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {step === "dates" && (
              <Card className="shadow-lg animate-fadeInUp border-moss-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-moss-900">
                      Escolha as datas da sua estadia
                    </h2>
                    <p className="text-xs text-moss-700">
                      Você verá o valor total da reserva ao lado, antes de seguir para os dados pessoais.
                    </p>
                  </div>
                  <DatePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onDatesChange={handleDatesChange}
                    minDate={new Date()}
                  />

                  {checkIn && checkOut && (
                    <div className="pt-2 border-t border-moss-100 mt-2">
                      <Button
                        onClick={handleContinueToForm}
                        className="w-full bg-green-600 hover:bg-green-700 active:scale-95 min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 ripple-container"
                        size="lg"
                        disabled={availabilityLoading || (isAvailable === false)}
                      >
                        {availabilityLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verificando disponibilidade...
                          </>
                        ) : isAvailable === false ? (
                          "Datas não disponíveis"
                        ) : (
                          "Continuar para os seus dados"
                        )}
                      </Button>
                      {isAvailable === false && (
                        <p className="mt-2 text-[11px] text-red-600 text-center">
                          Por favor, selecione outras datas disponíveis.
                        </p>
                      )}
                      {isAvailable === true && (
                        <p className="mt-2 text-[11px] text-muted-foreground text-center">
                          ✓ Datas disponíveis. A reserva só é confirmada após o pagamento aprovado.
                        </p>
                      )}
                      {isAvailable === null && !availabilityLoading && (
                        <p className="mt-2 text-[11px] text-muted-foreground text-center">
                          As datas ainda não são reservadas. A reserva só é confirmada após o pagamento aprovado.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === "form" && checkIn && checkOut && (
              <ReservationForm
                onSubmit={handleFormSubmit}
                isLoading={loading}
              />
            )}

            {(step === "payment" || step === "processing") && formData && checkIn && checkOut && (
              <Card className="shadow-lg animate-fadeInUp border-moss-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center space-y-4">
                    {step === "processing" ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin text-moss-600 mx-auto" aria-label="Redirecionando para o pagamento" />
                        <h2 className="text-xl font-semibold">Redirecionando para o pagamento...</h2>
                        <p className="text-muted-foreground">
                          Aguarde enquanto redirecionamos você para o Mercado Pago
                        </p>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto animate-scaleIn" aria-hidden="true" />
                        <h2 className="text-xl font-semibold animate-fadeInUp">Reserva criada com sucesso!</h2>
                        <p className="text-muted-foreground animate-fadeInUp animate-delay-100">
                          Você será redirecionado para o pagamento em instantes
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6 mt-2 lg:mt-0">
            <Card className="shadow-lg animate-fadeInRight border-moss-200 hover-lift">
              <CardContent className="pt-4 space-y-3">
                <h2 className="text-sm font-semibold text-moss-900">
                  Resumo da reserva
                </h2>
                {checkIn && checkOut ? (
                  <PriceCalculator
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guestCount={formData?.guestCount || 2}
                    childrenCount={formData?.childrenCount || 0}
                  />
                ) : (
                  <p className="text-xs text-moss-700">
                    Selecione as datas ao lado para ver o valor estimado da sua estadia.
                  </p>
                )}
              </CardContent>
            </Card>

            {step === "payment" && formData && checkIn && checkOut && priceCalculation && (
              <PaymentSummary
                checkIn={checkIn}
                checkOut={checkOut}
                guestCount={formData.guestCount}
                childrenCount={formData.childrenCount}
                totalPrice={priceCalculation.totalPrice}
                guestName={formData.guestName}
                guestEmail={formData.guestEmail}
                guestPhone={formData.guestPhone}
              />
            )}
          </div>
        </div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}

