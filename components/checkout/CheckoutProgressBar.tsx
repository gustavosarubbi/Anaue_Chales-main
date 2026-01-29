import { CheckCircle2, Loader2 } from "lucide-react"

interface CheckoutProgressBarProps {
    step: "chalet" | "dates" | "form" | "payment" | "processing"
}

export function CheckoutProgressBar({ step }: CheckoutProgressBarProps) {
    const getStepStatus = (currentStep: string) => {
        if (step === "processing" || step === "payment") {
            if (currentStep === "chalet" || currentStep === "dates" || currentStep === "form") return "complete"
            return "active"
        }
        if (step === "form") {
            if (currentStep === "chalet" || currentStep === "dates") return "complete"
            if (currentStep === "form") return "active"
            return "pending"
        }
        if (step === "dates") {
            if (currentStep === "chalet") return "complete"
            if (currentStep === "dates") return "active"
            return "pending"
        }
        if (currentStep === "chalet") return "active"
        return "pending"
    }

    return (
        <div className="mb-8 space-y-4">
            {/* Visual Progress Bar */}
            <div className="relative w-full h-2 bg-moss-100 rounded-full overflow-hidden">
                <div
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r from-moss-500 to-moss-600 rounded-full transition-all duration-500 ease-out shadow-lg ${step === "chalet" ? "w-1/4" : step === "dates" ? "w-2/4" : step === "form" ? "w-3/4" : "w-full"
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
                </div>
            </div>

            {/* Steps indicator */}
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm w-full max-w-2xl">
                    {/* Step 1 */}
                    <StepItem
                        number="1"
                        label="Chalé"
                        status={getStepStatus("chalet")}
                    />

                    <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step !== "chalet" ? "bg-moss-500" : "bg-moss-200"}`} />

                    {/* Step 2 */}
                    <StepItem
                        number="2"
                        label="Datas"
                        status={getStepStatus("dates")}
                    />

                    <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step === "form" || step === "payment" || step === "processing" ? "bg-moss-500" : "bg-moss-200"}`} />

                    {/* Step 3 */}
                    <StepItem
                        number="3"
                        label="Dados"
                        status={getStepStatus("form")}
                    />

                    <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step === "payment" || step === "processing" ? "bg-moss-500" : "bg-moss-200"}`} />

                    {/* Step 4 */}
                    <StepItem
                        number="4"
                        label="Pagamento"
                        status={getStepStatus("payment")}
                        isLast
                    />
                </div>

                <p className="text-xs sm:text-sm text-moss-600 text-center max-w-md font-medium">
                    {step === "chalet" && "🏠 Escolha o chalé para sua estadia"}
                    {step === "dates" && "📅 Escolha as datas da sua estadia"}
                    {step === "form" && "📝 Preencha seus dados para continuar"}
                    {step === "payment" && "💳 Redirecionando para o pagamento..."}
                    {step === "processing" && "⏳ Processando sua reserva..."}
                </p>
            </div>
        </div>
    )
}

function StepItem({ number, label, status, isLast = false }: { number: string, label: string, status: "complete" | "active" | "pending", isLast?: boolean }) {
    return (
        <div className={`flex items-center gap-2 transition-all duration-300 ${status === "active" ? "text-moss-900 font-semibold scale-110" : "text-moss-400"}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 shadow-md ${status === "complete" ? "bg-moss-200 text-moss-700" : status === "active" ? "bg-moss-600 text-white" : "bg-moss-100 text-moss-400"
                }`}>
                {status === "complete" ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" /> : number}
            </div>
            <span className="hidden xs:inline">{label}</span>
        </div>
    )
}
