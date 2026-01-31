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
import { Loader2, CheckCircle2, X } from "lucide-react"
import { calculatePrice, validateReservationDates, formatDateForInput, CHALET_PRICING, SPECIAL_PACKAGES } from "@/lib/utils/reservation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Step = "chalet" | "dates" | "form" | "payment" | "waiting" | "processing" | "success" | "expired"

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
    const [reservationId, setReservationId] = useState<string | null>(null)
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState<number>(600) // 10 minutes in seconds

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
        console.log('[CHECKOUT] Iniciando submissão do formulário...', {
            chaletId: selectedChalet,
            checkIn: formatDateForInput(checkIn),
            checkOut: formatDateForInput(checkOut)
        })

        try {
            // 1. Criar Reserva
            console.log('[CHECKOUT] Criando reserva no servidor...')
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
            console.log('[CHECKOUT] Resposta da criação de reserva:', reservationResult)

            if (!reservationResult.success) {
                toast.error(reservationResult.error || "Erro ao criar reserva")
                setLoading(false)
                return
            }

            setStep("payment")
            setReservationId(reservationResult.reservation.id)

            // 2. Criar Link de Pagamento
            console.log('[CHECKOUT] Gerando link de pagamento para reserva:', reservationResult.reservation.id)
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
            console.log('[CHECKOUT] Resposta do pagamento:', paymentResult)

            if (!paymentResult.success) {
                toast.error(paymentResult.error || "Erro ao criar pagamento")
                setLoading(false)
                return
            }

            setPaymentUrl(paymentResult.initPoint)
            setStep("waiting")
            setLoading(false)

            console.log('[CHECKOUT] Sucesso! Redirecionando para:', paymentResult.initPoint)

            // Redirecionamento automático conforme solicitado pelo usuário
            // Usamos window.open para criar uma nova aba
            setTimeout(() => {
                window.open(paymentResult.initPoint, "_blank")
            }, 500)
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

    // Timer & Polling effect
    useEffect(() => {
        let timer: NodeJS.Timeout
        let poller: NodeJS.Timeout

        if (step === "waiting" && reservationId) {
            // Timer
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setStep("expired")
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            // Polling
            poller = setInterval(async () => {
                try {
                    const res = await fetch(`/api/reservations/status/${reservationId}`)
                    const data = await res.json()
                    if (data.success) {
                        if (data.status === "confirmed") {
                            clearInterval(poller)
                            clearInterval(timer)
                            setStep("success")
                        } else if (data.status === "expired" || data.status === "cancelled") {
                            clearInterval(poller)
                            clearInterval(timer)
                            setStep("expired")
                        }
                    }
                } catch (e) {
                    console.error("Polling error:", e)
                }
            }, 5000) // Poll every 5 seconds
        }

        return () => {
            if (timer) clearInterval(timer)
            if (poller) clearInterval(poller)
        }
    }, [step, reservationId])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8 items-start w-full max-w-7xl mx-auto px-6 lg:px-8">
            <div className="lg:col-span-2 space-y-8">
                <CheckoutProgressBar step={step} />

                {step === "chalet" && (
                    <div className="space-y-8 animate-fadeInUp pb-10">
                        <div className="text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading mb-2">
                                Escolha seu Chalé
                            </h2>
                            <p className="text-moss-600 font-light">
                                Cada detalhe foi pensado para sua conexão com a natureza.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6 pb-4">
                            {/* Chalé Master */}
                            <div
                                className={cn(
                                    "group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-500",
                                    selectedChalet === "chale-anaue" ? "ring-2 ring-moss-600 shadow-2xl scale-[1.02]" : "ring-1 ring-moss-100 hover:ring-moss-300 hover:shadow-lg"
                                )}
                                onClick={() => setSelectedChalet("chale-anaue")}
                            >
                                <div className="aspect-[4/3] overflow-hidden relative">
                                    <img
                                        src="/Chale-1.jpg"
                                        alt="Chalé Master"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-moss-900/90 via-moss-900/20 to-transparent" />

                                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/20">
                                        <span className="text-[10px] text-white font-bold uppercase tracking-tighter">Vendido 1x hoje</span>
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <h3 className="font-heading text-2xl font-bold mb-1">Chalé Master</h3>
                                        <p className="text-moss-100 text-xs font-light line-clamp-1">Deck privativo & Hidromassagem</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white space-y-4">
                                    <div className="flex items-baseline justify-between">
                                        <div>
                                            <span className="text-2xl font-bold text-moss-900 font-heading">R$ {CHALET_PRICING['chale-anaue'].weekday}</span>
                                            <span className="text-moss-500 text-xs ml-1">/noite</span>
                                        </div>
                                        {selectedChalet === "chale-anaue" && (
                                            <div className="bg-moss-600 text-white rounded-full p-1.5 shadow-lg">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-moss-600 leading-relaxed font-light line-clamp-2">
                                        O máximo luxo com vista definitiva para o rio e hidromassagem privativa.
                                    </p>
                                </div>
                            </div>

                            {/* Chalé Camping Luxo */}
                            <div
                                className={cn(
                                    "group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-500",
                                    selectedChalet === "chale-2" ? "ring-2 ring-moss-600 shadow-2xl scale-[1.02]" : "ring-1 ring-moss-100 hover:ring-moss-300 hover:shadow-lg"
                                )}
                                onClick={() => setSelectedChalet("chale-2")}
                            >
                                <div className="aspect-[4/3] overflow-hidden relative">
                                    <img
                                        src="/Chale 2/IMG_3189.jpg"
                                        alt="Chalé Camping Luxo"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-moss-900/90 via-moss-900/20 to-transparent" />

                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <h3 className="font-heading text-2xl font-bold mb-1">Camping Luxo</h3>
                                        <p className="text-moss-100 text-xs font-light line-clamp-1">Experiência Modernista & Imersão</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white space-y-4">
                                    <div className="flex items-baseline justify-between">
                                        <div>
                                            <span className="text-2xl font-bold text-moss-900 font-heading">R$ {CHALET_PRICING['chale-2'].weekday}</span>
                                            <span className="text-moss-500 text-xs ml-1">/noite</span>
                                        </div>
                                        {selectedChalet === "chale-2" && (
                                            <div className="bg-moss-600 text-white rounded-full p-1.5 shadow-lg">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-moss-600 leading-relaxed font-light line-clamp-2">
                                        Arquitetura em A-frame integrada à floresta com todo conforto premium.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center lg:justify-start">
                            <Button
                                className="w-full sm:w-auto sm:px-12 bg-moss-700 hover:bg-moss-800 text-white h-14 text-lg font-bold shadow-xl hover-lift rounded-2xl transition-all duration-300"
                                onClick={() => setStep("dates")}
                            >
                                Continuar para Datas
                            </Button>
                        </div>
                    </div>
                )}

                {step === "dates" && (
                    <div className="space-y-8 animate-fadeInUp">
                        <div className="text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading mb-2">
                                Escolha as Datas
                            </h2>
                            <p className="text-moss-600 font-light">
                                Verifique a disponibilidade e selecione o período desejado.
                            </p>
                        </div>

                        <div className="w-full">
                            <AvailabilityCalendar
                                checkIn={checkIn}
                                checkOut={checkOut}
                                onDatesChange={handleDatesChange}
                                minDate={new Date()}
                                numberOfMonths={1}
                                chaletId={selectedChalet}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setStep("chalet")}
                                className="w-full sm:w-1/3 border-2 border-moss-100 text-moss-700 h-14 rounded-2xl font-bold hover:bg-moss-50 hover:border-moss-200 transition-all duration-300"
                            >
                                Escolher outro Chalé
                            </Button>
                            <Button
                                onClick={handleContinueToForm}
                                className="w-full sm:w-2/3 bg-moss-700 hover:bg-moss-800 text-white h-14 shadow-xl hover-lift text-lg font-bold rounded-2xl transition-all duration-300"
                                disabled={availabilityLoading || isAvailable !== true}
                            >
                                {availabilityLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Verificando...</span>
                                    </div>
                                ) : isAvailable === false ? (
                                    "Datas Indisponíveis"
                                ) : (
                                    "Continuar para Meus Dados"
                                )}
                            </Button>
                        </div>
                    </div>
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
                                <div className="absolute inset-0 bg-moss-100 rounded-full blur-2xl opacity-50 animate-pulse" />
                                <Loader2 className="h-16 w-16 animate-spin text-moss-600 relative" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-moss-900 font-heading">
                                    Processando...
                                </h2>
                                <p className="text-moss-700 max-w-sm mx-auto">
                                    Aguarde enquanto preparamos seu ambiente de pagamento.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === "waiting" && (
                    <Card className="shadow-lg animate-fadeInUp border-moss-200">
                        <CardContent className="pt-12 pb-12 text-center space-y-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center justify-center p-4 bg-moss-50 rounded-full mb-2">
                                    <Loader2 className="h-12 w-12 animate-spin text-moss-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-moss-900 font-heading">
                                    Aguardando Pagamento
                                </h2>
                                <p className="text-moss-600 max-w-md mx-auto">
                                    Sua reserva está garantida por <span className="font-bold text-moss-900">{formatTime(timeLeft)}</span> minutos.
                                    Após esse tempo, as datas serão liberadas.
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-amber-900 text-sm">
                                <p className="font-semibold mb-2">Instruções:</p>
                                <ul className="text-left space-y-2 list-disc list-inside opacity-80">
                                    <li>Abra o link de pagamento abaixo</li>
                                    <li>Conclua o pagamento via PIX ou Cartão</li>
                                    <li>Mantenha esta página aberta para confirmação automática</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button
                                    className="w-full h-16 bg-moss-900 hover:bg-moss-800 text-white text-lg font-bold rounded-2xl shadow-xl hover-lift"
                                    onClick={() => window.open(paymentUrl!, "_blank")}
                                >
                                    Abrir Pagamento da InfinitePay
                                </Button>
                                <p className="text-xs text-moss-400">
                                    Não fechou a janela de pagamento? <button onClick={() => window.open(paymentUrl!, "_blank")} className="underline hover:text-moss-600">Clique aqui</button>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === "success" && (
                    <Card className="shadow-lg animate-fadeInUp border-green-200 bg-green-50/20">
                        <CardContent className="pt-16 pb-16 text-center space-y-6">
                            <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full">
                                <CheckCircle2 className="h-16 w-16 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold text-green-900 font-heading">
                                    Pagamento Confirmado!
                                </h2>
                                <p className="text-green-700 max-w-sm mx-auto">
                                    Sua reserva foi realizada com sucesso. Em instantes você receberá a confirmação por e-mail e WhatsApp.
                                </p>
                            </div>
                            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 rounded-xl" asChild>
                                <a href="/">Voltar para o Início</a>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === "expired" && (
                    <Card className="shadow-lg animate-fadeInUp border-red-200 bg-red-50/20">
                        <CardContent className="pt-16 pb-16 text-center space-y-6">
                            <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full">
                                <X className="h-16 w-16 text-red-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold text-red-900 font-heading">
                                    Reserva Expirada
                                </h2>
                                <p className="text-red-700 max-w-sm mx-auto">
                                    O tempo limite de 10 minutos para o pagamento foi atingido e as datas foram liberadas.
                                </p>
                            </div>
                            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 px-8 h-12 rounded-xl" onClick={() => window.location.reload()}>
                                Tentar Novamente
                            </Button>
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
