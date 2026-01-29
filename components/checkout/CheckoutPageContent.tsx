"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AvailabilityCalendar } from "@/components/checkout/calendar/AvailabilityCalendar"
import { ReservationForm, ReservationFormData } from "@/components/checkout/ReservationForm"
import { PriceCalculator } from "@/components/checkout/PriceCalculator"
import { PaymentSummary } from "@/components/checkout/PaymentSummary"
import { CheckoutProgressBar } from "@/components/checkout/CheckoutProgressBar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { calculatePrice, validateReservationDates, formatDateForInput, CHALET_PRICING, SPECIAL_PACKAGES } from "@/lib/utils/reservation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Step = "chalet" | "dates" | "form" | "payment" | "processing"

export function CheckoutPageContent() {
    const searchParams = useSearchParams()

    const [selectedChalet, setSelectedChalet] = useState<string>(() => {
        return searchParams.get("chalet") || "chale-anaue"
    })
    const [step, setStep] = useState<Step>(() => {
        // Se já tem chalé selecionado via param, pula para datas (opcional, mas proativo)
        return searchParams.get("chalet") ? "dates" : "chalet"
    })
    const [loading, setLoading] = useState(false)
    const [availabilityLoading, setAvailabilityLoading] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

    // Dates
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

    // Price calculation
    const priceCalculation = checkIn && checkOut
        ? calculatePrice(checkIn, checkOut, formData?.guestCount || 2, formData?.childrenCount || 0, selectedChalet)
        : null

    // Check availability when dates change
    useEffect(() => {
        if (checkIn && checkOut) {
            checkAvailability()
        } else {
            setIsAvailable(null)
        }
    }, [checkIn, checkOut])

    const checkAvailability = async () => {
        if (!checkIn || !checkOut) return

        setAvailabilityLoading(true)
        setIsAvailable(null)

        try {
            const validation = validateReservationDates(checkIn, checkOut)
            if (!validation.valid) {
                toast.error(validation.error)
                setCheckIn(undefined)
                setCheckOut(undefined)
                return
            }

            const response = await fetch("/api/reservations/check-availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    checkIn: formatDateForInput(checkIn),
                    checkOut: formatDateForInput(checkOut),
                    chaletId: selectedChalet,
                }),
            })

            const data = await response.json()

            if (!data.success) {
                toast.error(data.error || "Erro ao verificar disponibilidade")
                setIsAvailable(false)
                return
            }

            setIsAvailable(data.available)
            if (!data.available) {
                toast.error("As datas selecionadas não estão disponíveis")
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
        setIsAvailable(null)
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
            // 1. Create reservation
            const res = await fetch("/api/reservations/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    checkIn: formatDateForInput(checkIn),
                    checkOut: formatDateForInput(checkOut),
                    chaletId: selectedChalet,
                    ...data,
                }),
            })

            const reservationResult = await res.json()

            if (!reservationResult.success) {
                toast.error(reservationResult.error || "Erro ao criar reserva")
                setLoading(false)
                return
            }

            setStep("payment")

            // 2. Create payment preference
            const payRes = await fetch("/api/payments/create", {
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

            const paymentResult = await payRes.json()

            if (!paymentResult.success) {
                toast.error(paymentResult.error || "Erro ao criar pagamento")
                setLoading(false)
                return
            }

            // 3. Success! Redirect to InfinitePay
            setStep("processing")
            window.location.href = paymentResult.initPoint || paymentResult.sandboxInitPoint
        } catch (error: any) {
            console.error("Erro no processo de checkout:", error)
            toast.error(error?.message || "Erro ao processar reserva. Tente novamente.")
            setLoading(false)
        }
    }

    const handleContinueToForm = () => {
        if (!checkIn || !checkOut || !isAvailable) {
            toast.error("Por favor, selecione datas disponíveis")
            return
        }
        setStep("form")
    }

    return (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <CheckoutProgressBar step={step} />

                {step === "chalet" && (
                    <div className="space-y-4 animate-fadeInUp">
                        <div className="flex flex-col gap-1 mb-2">
                            <h2 className="text-xl font-bold text-moss-900 font-heading">
                                Escolha seu Chalé
                            </h2>
                            <p className="text-sm text-moss-700">
                                Selecione uma das nossas opções exclusivas para começar.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Chalé Master */}
                            <Card
                                className={cn(
                                    "cursor-pointer transition-all duration-300 border-2 overflow-hidden hover:shadow-xl group",
                                    selectedChalet === "chale-anaue" ? "border-moss-600 bg-moss-50" : "border-moss-100 hover:border-moss-300"
                                )}
                                onClick={() => setSelectedChalet("chale-anaue")}
                            >
                                <div className="h-40 overflow-hidden relative">
                                    <img
                                        src="/Chale 1/IMG_3174.jpg"
                                        alt="Chalé Master"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <h3 className="text-white font-bold text-lg">Chalé Master</h3>
                                    </div>
                                </div>
                                <CardContent className="p-4 space-y-2">
                                    <p className="text-xs text-moss-700 line-clamp-2">
                                        Deck privativo com vista panorâmica, cama queen e jacuzzi.
                                    </p>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-moss-900 font-bold">R$ {CHALET_PRICING['chale-anaue'].weekday},00 <small className="font-normal">/noite</small></span>
                                        {selectedChalet === "chale-anaue" && (
                                            <div className="bg-moss-600 text-white rounded-full p-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Chalé Camping Luxo */}
                            <Card
                                className={cn(
                                    "cursor-pointer transition-all duration-300 border-2 overflow-hidden hover:shadow-xl group",
                                    selectedChalet === "chale-2" ? "border-moss-600 bg-moss-50" : "border-moss-100 hover:border-moss-300"
                                )}
                                onClick={() => setSelectedChalet("chale-2")}
                            >
                                <div className="h-40 overflow-hidden relative">
                                    <img
                                        src="/Chale 2/IMG_3189.jpg"
                                        alt="Chalé Camping Luxo"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <h3 className="text-white font-bold text-lg">Camping Luxo</h3>
                                    </div>
                                </div>
                                <CardContent className="p-4 space-y-2">
                                    <p className="text-xs text-moss-700 line-clamp-2">
                                        Experiência única de glamping com conforto de hotel no meio da natureza.
                                    </p>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-moss-900 font-bold">R$ {CHALET_PRICING['chale-2'].weekday},00 <small className="font-normal">/noite</small></span>
                                        {selectedChalet === "chale-2" && (
                                            <div className="bg-moss-600 text-white rounded-full p-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Button
                            className="w-full bg-moss-700 hover:bg-moss-800 h-12 text-lg font-bold shadow-lg"
                            onClick={() => setStep("dates")}
                        >
                            Próximo Passo
                        </Button>
                    </div>
                )}

                {step === "dates" && (
                    <Card className="shadow-lg animate-fadeInUp border-moss-200 overflow-hidden">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex flex-col gap-1 mb-2">
                                <h2 className="text-lg font-semibold text-moss-900 font-heading">
                                    Datas da Estadia
                                </h2>
                                <p className="text-xs text-moss-700">
                                    O valor total será calculado automaticamente conforme as datas selecionadas.
                                </p>
                            </div>

                            <AvailabilityCalendar
                                checkIn={checkIn}
                                checkOut={checkOut}
                                onDatesChange={handleDatesChange}
                                minDate={new Date()}
                                numberOfMonths={1}
                                chaletId={selectedChalet}
                            />

                            <div className="pt-4 border-t border-moss-100 mt-2 space-y-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep("chalet")}
                                    className="w-full text-moss-600 h-10"
                                >
                                    Alterar Chalé
                                </Button>
                                <Button
                                    onClick={handleContinueToForm}
                                    className="w-full bg-green-600 hover:bg-green-700 h-12 shadow-lg transition-all duration-200 text-base font-bold"
                                    size="lg"
                                    disabled={availabilityLoading || isAvailable === false}
                                >
                                    {availabilityLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verificando disponibilidade...
                                        </>
                                    ) : isAvailable === false ? (
                                        "Datas Indisponíveis"
                                    ) : (
                                        "Continuar Reserva"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === "form" && checkIn && checkOut && (
                    <div className="animate-fadeInUp">
                        <ReservationForm
                            onSubmit={handleFormSubmit}
                            isLoading={loading}
                            initialData={formData || undefined}
                        />
                        <Button
                            variant="ghost"
                            onClick={() => setStep("dates")}
                            disabled={loading}
                            className="mt-4 text-moss-600"
                        >
                            Voltar para datas
                        </Button>
                    </div>
                )}

                {(step === "payment" || step === "processing") && (
                    <Card className="shadow-lg animate-fadeInUp border-moss-200">
                        <CardContent className="pt-12 pb-12 text-center space-y-6">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl opacity-50 animate-pulse" />
                                {step === "processing" ? (
                                    <Loader2 className="h-16 w-16 animate-spin text-moss-600 relative" />
                                ) : (
                                    <CheckCircle2 className="h-16 w-16 text-green-600 relative" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-moss-900 font-heading">
                                    {step === "processing" ? "Redirecionando..." : "Reserva Criada!"}
                                </h2>
                                <p className="text-moss-700 max-w-sm mx-auto">
                                    {step === "processing"
                                        ? "Aguarde enquanto levamos você para o ambiente seguro de pagamento da InfinitePay."
                                        : "Sua reserva foi registrada. Você será redirecionado para o pagamento em instantes."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Sidebar - Resumo */}
            <div className="space-y-6">
                <div className="sticky top-6">
                    {checkIn && checkOut ? (
                        step === "form" || step === "payment" || step === "processing" ? (
                            <PaymentSummary
                                checkIn={checkIn}
                                checkOut={checkOut}
                                guestCount={formData?.guestCount || 2}
                                childrenCount={formData?.childrenCount || 0}
                                totalPrice={priceCalculation?.totalPrice || 0}
                                guestName={formData?.guestName || ""}
                                guestEmail={formData?.guestEmail || ""}
                                guestPhone={formData?.guestPhone || ""}
                            />
                        ) : (
                            <PriceCalculator
                                checkIn={checkIn}
                                checkOut={checkOut}
                                guestCount={formData?.guestCount || 2}
                                childrenCount={formData?.childrenCount || 0}
                                chaletId={selectedChalet}
                            />
                        )
                    ) : (
                        <Card className="border-dashed border-2 border-moss-200 bg-moss-50/30">
                            <CardContent className="pt-6 pb-6 text-center">
                                <p className="text-sm text-moss-600 italic">
                                    Selecione as datas no calendário para ver o resumo da sua reserva aqui.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
