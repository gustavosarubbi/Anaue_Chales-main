"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { AvailabilityCalendar } from "@/components/checkout/calendar/AvailabilityCalendar"
import { ReservationForm, ReservationFormData } from "@/components/checkout/ReservationForm"
import { PriceCalculator } from "@/components/checkout/PriceCalculator"
import { PaymentSummary } from "@/components/checkout/PaymentSummary"
import { CheckoutProgressBar } from "@/components/checkout/CheckoutProgressBar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, X, ArrowRight, ArrowLeft, Star, Sparkles, ExternalLink, Clock, Waves, TreePine, Wifi, Bath, Shield, IdCard, UserCheck } from "lucide-react"
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

    // Live guest counts (atualizados em tempo real enquanto o formulário é preenchido)
    const [liveGuestCount, setLiveGuestCount] = useState<number>(2)
    const [liveChildrenCount, setLiveChildrenCount] = useState<number>(0)

    // Callback para mudanças em tempo real do form
    const handleFormChange = useCallback((data: { guestCount: number; childrenCount: number }) => {
        setLiveGuestCount(data.guestCount)
        setLiveChildrenCount(data.childrenCount)
    }, [])

    // Usar live counts se estamos no step form (ainda não submeteu), senão usar formData
    const activeGuestCount = step === "form" ? liveGuestCount : (formData?.guestCount || 2)
    const activeChildrenCount = step === "form" ? liveChildrenCount : (formData?.childrenCount || 0)

    // Price calculation
    const priceCalculation = checkIn && checkOut
        ? calculatePrice(checkIn, checkOut, activeGuestCount, activeChildrenCount, selectedChalet)
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
            }, 5000)
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
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 items-start w-full max-w-7xl mx-auto">
            <div className={cn(
                "space-y-6 sm:space-y-8 w-full max-w-full min-w-0",
                step === "dates" ? "lg:col-span-3" : "lg:col-span-2"
            )}>
                <CheckoutProgressBar step={step} />

                {/* ========== STEP: CHALET ========== */}
                {step === "chalet" && (
                    <div className="space-y-8 animate-fadeInUp pb-6">
                        <div className="text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading mb-2 tracking-tight">
                                Escolha seu Chalé
                            </h2>
                            <p className="text-moss-500 font-light text-sm sm:text-base">
                                Cada detalhe foi pensado para sua conexão com a natureza.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                            {/* Chalé Master */}
                            <div
                                className={cn(
                                    "group relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 bg-white",
                                    selectedChalet === "chale-anaue"
                                        ? "ring-[3px] ring-moss-600 shadow-2xl shadow-moss-600/20 scale-[1.01]"
                                        : "ring-1 ring-moss-200/60 shadow-md shadow-moss-900/5 hover:ring-2 hover:ring-moss-300 hover:shadow-xl hover:-translate-y-1.5"
                                )}
                                onClick={() => setSelectedChalet("chale-anaue")}
                            >
                                {/* Imagem */}
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img
                                        src="/Chale-1.jpg"
                                        alt="Chalé Master"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Badge */}
                                    <div className="absolute top-3.5 right-3.5 bg-amber-500 rounded-full px-3 py-1.5 shadow-lg shadow-amber-500/30">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-3 h-3 text-white fill-white" />
                                            <span className="text-[10px] text-white font-extrabold uppercase tracking-tight">Mais Popular</span>
                                        </div>
                                    </div>

                                    {/* Selected Checkmark */}
                                    {selectedChalet === "chale-anaue" && (
                                        <div className="absolute top-3.5 left-3.5 bg-white text-moss-700 rounded-full p-1.5 shadow-lg animate-scaleIn">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}

                                    {/* Title on image */}
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="font-heading text-2xl font-bold drop-shadow-lg leading-tight">Chalé Master</h3>
                                    </div>
                                </div>

                                {/* Info section */}
                                <div className="p-5 space-y-4">
                                    {/* Feature pills */}
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { icon: Bath, text: "Jacuzzi" },
                                            { icon: Waves, text: "Deck privativo" },
                                            { icon: Wifi, text: "Wi-Fi" },
                                        ].map((feat, i) => (
                                            <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-moss-600 bg-moss-50 border border-moss-100 rounded-full px-2.5 py-1">
                                                <feat.icon className="w-3 h-3 text-moss-500" />
                                                {feat.text}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Description */}
                                    <p className="text-[13px] text-moss-500 leading-relaxed">
                                        O máximo luxo com vista definitiva para o rio e Jacuzzi privativo.
                                    </p>

                                    {/* Price + Select */}
                                    <div className={cn(
                                        "flex items-center justify-between rounded-2xl p-3.5 -mx-1 transition-all duration-300",
                                        selectedChalet === "chale-anaue"
                                            ? "bg-moss-600"
                                            : "bg-moss-50 group-hover:bg-moss-100/70"
                                    )}>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest block mb-0.5"
                                                style={{ color: selectedChalet === "chale-anaue" ? "rgba(255,255,255,0.6)" : "rgb(154,171,126)" }}>
                                                A partir de
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={cn(
                                                    "text-2xl font-bold font-heading",
                                                    selectedChalet === "chale-anaue" ? "text-white" : "text-moss-900"
                                                )}>
                                                    R$ {CHALET_PRICING['chale-anaue'].weekday}
                                                </span>
                                                <span className={cn(
                                                    "text-xs",
                                                    selectedChalet === "chale-anaue" ? "text-white/60" : "text-moss-400"
                                                )}>/noite</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "rounded-full p-2 transition-all duration-300",
                                            selectedChalet === "chale-anaue"
                                                ? "bg-white text-moss-700 shadow-md"
                                                : "bg-white text-moss-300 border border-moss-200 group-hover:text-moss-500 group-hover:border-moss-300"
                                        )}>
                                            {selectedChalet === "chale-anaue" ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-current" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chalé Camping Luxo */}
                            <div
                                className={cn(
                                    "group relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 bg-white",
                                    selectedChalet === "chale-2"
                                        ? "ring-[3px] ring-moss-600 shadow-2xl shadow-moss-600/20 scale-[1.01]"
                                        : "ring-1 ring-moss-200/60 shadow-md shadow-moss-900/5 hover:ring-2 hover:ring-moss-300 hover:shadow-xl hover:-translate-y-1.5"
                                )}
                                onClick={() => setSelectedChalet("chale-2")}
                            >
                                {/* Imagem */}
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img
                                        src="/Chale 2/IMG_3189.jpg"
                                        alt="Chalé Camping Luxo"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Badge */}
                                    <div className="absolute top-3.5 right-3.5 bg-emerald-500 rounded-full px-3 py-1.5 shadow-lg shadow-emerald-500/30">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3 text-white" />
                                            <span className="text-[10px] text-white font-extrabold uppercase tracking-tight">Novo</span>
                                        </div>
                                    </div>

                                    {/* Selected Checkmark */}
                                    {selectedChalet === "chale-2" && (
                                        <div className="absolute top-3.5 left-3.5 bg-white text-moss-700 rounded-full p-1.5 shadow-lg animate-scaleIn">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}

                                    {/* Title on image */}
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="font-heading text-2xl font-bold drop-shadow-lg leading-tight">Camping Luxo</h3>
                                    </div>
                                </div>

                                {/* Info section */}
                                <div className="p-5 space-y-4">
                                    {/* Feature pills */}
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { icon: Bath, text: "Jacuzzi" },
                                            { icon: TreePine, text: "Imerso na floresta" },
                                            { icon: Waves, text: "Beira do rio" },
                                            { icon: Wifi, text: "Wi-Fi" },
                                        ].map((feat, i) => (
                                            <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-moss-600 bg-moss-50 border border-moss-100 rounded-full px-2.5 py-1">
                                                <feat.icon className="w-3 h-3 text-moss-500" />
                                                {feat.text}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Description */}
                                    <p className="text-[13px] text-moss-500 leading-relaxed">
                                        Arquitetura em A-frame integrada à floresta com Jacuzzi e todo conforto premium.
                                    </p>

                                    {/* Price + Select */}
                                    <div className={cn(
                                        "flex items-center justify-between rounded-2xl p-3.5 -mx-1 transition-all duration-300",
                                        selectedChalet === "chale-2"
                                            ? "bg-moss-600"
                                            : "bg-moss-50 group-hover:bg-moss-100/70"
                                    )}>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest block mb-0.5"
                                                style={{ color: selectedChalet === "chale-2" ? "rgba(255,255,255,0.6)" : "rgb(154,171,126)" }}>
                                                A partir de
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={cn(
                                                    "text-2xl font-bold font-heading",
                                                    selectedChalet === "chale-2" ? "text-white" : "text-moss-900"
                                                )}>
                                                    R$ {CHALET_PRICING['chale-2'].weekday}
                                                </span>
                                                <span className={cn(
                                                    "text-xs",
                                                    selectedChalet === "chale-2" ? "text-white/60" : "text-moss-400"
                                                )}>/noite</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "rounded-full p-2 transition-all duration-300",
                                            selectedChalet === "chale-2"
                                                ? "bg-white text-moss-700 shadow-md"
                                                : "bg-white text-moss-300 border border-moss-200 group-hover:text-moss-500 group-hover:border-moss-300"
                                        )}>
                                            {selectedChalet === "chale-2" ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-current" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-2 flex justify-center lg:justify-start">
                            <Button
                                className="group/btn w-full sm:w-auto sm:min-w-[320px] bg-moss-800 hover:bg-moss-900 text-white h-[60px] text-base sm:text-lg font-bold shadow-xl shadow-moss-900/20 hover:shadow-2xl hover:shadow-moss-900/30 hover:-translate-y-1 rounded-2xl transition-all duration-300 relative overflow-hidden"
                                onClick={() => setStep("dates")}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Continuar para Datas
                                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                </span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* ========== STEP: DATES ========== */}
                {step === "dates" && (
                    <div className="space-y-6 sm:space-y-8 animate-fadeInUp w-full max-w-full">
                        <div className="text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading mb-2 tracking-tight">
                                Escolha as Datas
                            </h2>
                            <p className="text-moss-500 font-light text-sm sm:text-base">
                                Verifique a disponibilidade e selecione o período desejado.
                            </p>
                        </div>

                        {/* Calendar + Price side by side */}
                        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
                            <div className="w-full lg:flex-1 min-w-0">
                                <AvailabilityCalendar
                                    checkIn={checkIn}
                                    checkOut={checkOut}
                                    onDatesChange={handleDatesChange}
                                    minDate={new Date()}
                                    numberOfMonths={1}
                                    chaletId={selectedChalet}
                                />
                            </div>

                            {/* Price Calculator ao lado do calendário */}
                            <div className="w-full lg:w-[340px] lg:sticky lg:top-6 shrink-0">
                                <PriceCalculator
                                    checkIn={checkIn}
                                    checkOut={checkOut}
                                    guestCount={activeGuestCount}
                                    childrenCount={activeChildrenCount}
                                    chaletId={selectedChalet}
                                />
                            </div>
                        </div>

                        {/* Availability status badge */}
                        {isAvailable !== null && !availabilityLoading && (
                            <div className={cn(
                                "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-medium transition-all animate-fadeInUp",
                                isAvailable
                                    ? "bg-green-50/80 border border-green-100/80 text-green-700"
                                    : "bg-red-50/80 border border-red-100/80 text-red-700"
                            )}>
                                {isAvailable ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span>Datas disponíveis!</span>
                                    </>
                                ) : (
                                    <>
                                        <X className="h-4 w-4 text-red-600" />
                                        <span>Datas indisponíveis. Tente outras datas.</span>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setStep("chalet")}
                                className="w-full sm:w-auto sm:flex-1 border-2 border-moss-200 text-moss-700 hover:text-moss-900 h-12 sm:h-14 rounded-2xl text-sm sm:text-base font-semibold hover:bg-moss-50 hover:border-moss-300 transition-all duration-300"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Escolher outro Chalé
                            </Button>
                            <Button
                                onClick={handleContinueToForm}
                                className="w-full sm:w-auto sm:flex-[2] bg-moss-700 hover:bg-moss-800 text-white h-12 sm:h-14 shadow-xl hover:shadow-2xl text-sm sm:text-base font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                                disabled={availabilityLoading || isAvailable !== true}
                            >
                                {availabilityLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                                        <span className="text-sm sm:text-base">Verificando...</span>
                                    </div>
                                ) : isAvailable === false ? (
                                    "Datas Indisponíveis"
                                ) : (
                                    <>
                                        Continuar para Meus Dados
                                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ========== STEP: FORM ========== */}
                {step === "form" && checkIn && checkOut && (
                    <div className="animate-fadeInUp space-y-6">
                        {/* Aviso: maior de 18 anos e documento no check-in */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-moss-50 border border-moss-100 text-moss-800">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-moss-200 flex items-center justify-center">
                                <IdCard className="h-5 w-5 text-moss-700" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-moss-900 text-sm sm:text-base flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-moss-600" />
                                    Para fazer a reserva
                                </p>
                                <ul className="mt-1.5 text-sm text-moss-700 space-y-0.5 list-none">
                                    <li>• É necessário ser <strong>maior de 18 anos</strong>.</li>
                                    <li>• É obrigatória a apresentação de <strong>documento de identidade com foto</strong> no momento do check-in.</li>
                                </ul>
                            </div>
                        </div>

                        <ReservationForm
                            onSubmit={handleFormSubmit}
                            onFormChange={handleFormChange}
                            isLoading={loading}
                            initialData={formData || undefined}
                            formId="reservation-form"
                            hideSubmitButton={true}
                        />

                        {/* Submit button — visível no DESKTOP (dentro do conteúdo principal) */}
                        <div className="hidden lg:flex flex-col gap-4 mt-8">
                            <Button
                                type="submit"
                                form="reservation-form"
                                className="w-auto px-12 bg-moss-700 hover:bg-moss-800 text-white h-14 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 rounded-2xl transition-all duration-300"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Processando...</span>
                                    </div>
                                ) : (
                                    <>
                                        Confirmar e Pagar
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                            <div className="flex items-center gap-2 text-moss-400">
                                <Shield className="h-3.5 w-3.5" />
                                <p className="text-[10px] leading-tight">
                                    Pagamento seguro via InfinitePay.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => setStep("dates")}
                            disabled={loading}
                            className="mt-4 text-moss-500 hover:text-moss-700 hover:bg-moss-50 rounded-xl transition-all duration-300"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para datas
                        </Button>
                    </div>
                )}

                {/* ========== STEP: PAYMENT / PROCESSING ========== */}
                {(step === "payment" || step === "processing") && (
                    <Card className="shadow-xl shadow-moss-900/5 animate-fadeInUp border-white/40 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-moss-400 via-moss-500 to-moss-600 animate-pulse" />
                        <CardContent className="pt-14 pb-14 text-center space-y-6">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-moss-100 rounded-full blur-2xl opacity-50 animate-pulse" />
                                <div className="inline-flex items-center justify-center p-5 bg-moss-50 rounded-full border border-moss-100 relative">
                                    <Loader2 className="h-12 w-12 animate-spin text-moss-600" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading tracking-tight">
                                    Processando...
                                </h2>
                                <p className="text-moss-500 max-w-sm mx-auto font-light">
                                    Aguarde enquanto preparamos seu ambiente de pagamento.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ========== STEP: WAITING ========== */}
                {step === "waiting" && (
                    <Card className="shadow-xl shadow-moss-900/5 animate-fadeInUp border-white/40 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
                        <CardContent className="pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-10 md:pb-12 text-center space-y-6 sm:space-y-8 px-4 sm:px-6 md:px-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center justify-center p-4 bg-amber-50 rounded-full shadow-sm border border-amber-100 relative">
                                    <div className="absolute inset-0 bg-amber-200/15 rounded-full animate-pulse" />
                                    <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-amber-600 relative z-10" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading tracking-tight">
                                    Aguardando Pagamento
                                </h2>

                                {/* Timer badge */}
                                <div className="inline-flex items-center gap-2 bg-moss-900 text-white rounded-full px-5 py-2 shadow-lg shadow-moss-900/20">
                                    <Clock className="h-4 w-4 opacity-80" />
                                    <span className="font-heading font-bold text-lg tabular-nums">{formatTime(timeLeft)}</span>
                                </div>

                                <p className="text-sm sm:text-base text-moss-500 max-w-md mx-auto px-2 font-light">
                                    Sua reserva está garantida. Após o tempo expirar, as datas serão liberadas.
                                </p>
                            </div>

                            <div className="bg-amber-50/80 border border-amber-100/80 rounded-2xl p-4 sm:p-5 md:p-6 text-amber-900 text-xs sm:text-sm shadow-sm max-w-md mx-auto">
                                <p className="font-semibold mb-2 sm:mb-3 flex items-center justify-center gap-2 text-xs">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    Instruções
                                </p>
                                <ul className="text-left space-y-2 list-none max-w-xs mx-auto">
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                                        <span className="opacity-90">Abra o link de pagamento abaixo</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                                        <span className="opacity-90">Conclua o pagamento via PIX ou Cartão</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                                        <span className="opacity-90">Mantenha esta página aberta para confirmação automática</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3 sm:gap-4 max-w-md mx-auto">
                                <Button
                                    className="w-full h-12 sm:h-14 md:h-16 bg-moss-900 hover:bg-moss-800 text-white text-sm sm:text-base md:text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
                                    onClick={() => window.open(paymentUrl!, "_blank")}
                                >
                                    <ExternalLink className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    Abrir Pagamento da InfinitePay
                                </Button>
                                <p className="text-xs sm:text-sm text-moss-400 text-center px-2">
                                    Não fechou a janela de pagamento?{" "}
                                    <button
                                        onClick={() => window.open(paymentUrl!, "_blank")}
                                        className="underline text-moss-600 hover:text-moss-900 font-medium transition-colors decoration-moss-300 underline-offset-2"
                                    >
                                        Clique aqui para reabrir
                                    </button>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ========== STEP: SUCCESS ========== */}
                {step === "success" && (
                    <Card className="shadow-xl shadow-green-900/10 animate-fadeInUp border-green-100/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500" />
                        <CardContent className="pt-16 pb-16 text-center space-y-8">
                            <div className="inline-flex items-center justify-center p-6 bg-green-50 rounded-full shadow-inner border border-green-100 relative group">
                                <div className="absolute inset-0 bg-green-200/20 rounded-full animate-ping opacity-20 duration-1000" />
                                <CheckCircle2 className="h-16 w-16 text-green-600 relative z-10 drop-shadow-sm" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl sm:text-4xl font-bold text-moss-900 font-heading tracking-tight">
                                    Reserva Confirmada!
                                </h2>
                                <p className="text-moss-500 max-w-md mx-auto text-lg font-light leading-relaxed">
                                    Sua reserva foi realizada com sucesso. <br />
                                    Em instantes você receberá a confirmação por e-mail e WhatsApp.
                                </p>
                            </div>
                            <Button className="bg-moss-900 hover:bg-moss-800 text-white px-10 h-14 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300" asChild>
                                <a href="/">Voltar para o Início</a>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* ========== STEP: EXPIRED ========== */}
                {step === "expired" && (
                    <Card className="shadow-xl shadow-red-900/10 animate-fadeInUp border-red-100/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />
                        <CardContent className="pt-16 pb-16 text-center space-y-8">
                            <div className="inline-flex items-center justify-center p-6 bg-red-50 rounded-full shadow-inner border border-red-100">
                                <X className="h-16 w-16 text-red-600 drop-shadow-sm" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold text-moss-900 font-heading tracking-tight">
                                    Reserva Expirada
                                </h2>
                                <p className="text-moss-500 max-w-sm mx-auto text-lg font-light">
                                    O tempo limite de 10 minutos para o pagamento foi atingido e as datas foram liberadas.
                                </p>
                            </div>
                            <Button
                                className="bg-moss-900 hover:bg-moss-800 text-white px-10 h-14 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                                onClick={() => window.location.reload()}
                            >
                                Tentar Novamente
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* ========== SIDEBAR (hidden on dates step — price is inline next to calendar) ========== */}
            {step !== "dates" && (
                <div className="space-y-6">
                    {/* Desktop Sticky Summary */}
                    <div className="hidden lg:block sticky top-6">
                        {checkIn && checkOut ? (
                            step === "form" || step === "payment" || step === "processing" ? (
                                <PaymentSummary
                                    checkIn={checkIn}
                                    checkOut={checkOut}
                                    guestCount={activeGuestCount}
                                    childrenCount={activeChildrenCount}
                                    totalPrice={priceCalculation?.totalPrice || 0}
                                    guestName={formData?.guestName || ""}
                                    guestEmail={formData?.guestEmail || ""}
                                    guestPhone={formData?.guestPhone || ""}
                                />
                            ) : (
                                <PriceCalculator
                                    checkIn={checkIn}
                                    checkOut={checkOut}
                                    guestCount={activeGuestCount}
                                    childrenCount={activeChildrenCount}
                                    chaletId={selectedChalet}
                                />
                            )
                        ) : (
                            <Card className="border-dashed border-2 border-moss-200/60 bg-white/40 backdrop-blur-sm rounded-3xl">
                                <CardContent className="pt-8 pb-8 text-center space-y-3">
                                    <div className="inline-flex items-center justify-center p-3 bg-moss-50 rounded-full border border-moss-100">
                                        <Loader2 className="h-5 w-5 text-moss-300" />
                                    </div>
                                    <p className="text-sm text-moss-400 font-light px-4">
                                        Selecione as datas no calendário para ver o resumo da sua reserva aqui.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Mobile/Tablet Inline Summary + Submit Button */}
                    <div className="lg:hidden space-y-4">
                        {checkIn && checkOut ? (
                            <>
                                {step === "form" || step === "payment" || step === "processing" ? (
                                    <PaymentSummary
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        guestCount={activeGuestCount}
                                        childrenCount={activeChildrenCount}
                                        totalPrice={priceCalculation?.totalPrice || 0}
                                        guestName={formData?.guestName || ""}
                                        guestEmail={formData?.guestEmail || ""}
                                        guestPhone={formData?.guestPhone || ""}
                                    />
                                ) : (
                                    <PriceCalculator
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        guestCount={activeGuestCount}
                                        childrenCount={activeChildrenCount}
                                        chaletId={selectedChalet}
                                    />
                                )}

                                {/* Botão Confirmar e Pagar — MOBILE, junto do resumo */}
                                {step === "form" && (
                                    <div className="flex flex-col gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            form="reservation-form"
                                            className="w-full bg-moss-800 hover:bg-moss-900 text-white h-[60px] text-lg font-bold shadow-xl shadow-moss-900/20 hover:shadow-2xl rounded-2xl transition-all duration-300"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span>Processando...</span>
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
                                                Pagamento seguro via InfinitePay.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    )
}
