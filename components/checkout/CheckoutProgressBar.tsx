import { CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutProgressBarProps {
    step: "chalet" | "dates" | "form" | "payment" | "waiting" | "processing" | "success" | "expired"
}

export function CheckoutProgressBar({ step }: CheckoutProgressBarProps) {
    const getStepStatus = (currentStep: string) => {
        const order = ["chalet", "dates", "form", "payment", "waiting", "processing", "success", "expired"]
        const stepIndex = order.indexOf(step)
        const currentOrder = order.indexOf(currentStep as any)

        if (stepIndex > currentOrder) return "complete"
        if (stepIndex === currentOrder) return "active"
        return "pending"
    }

    return (
        <div className="mb-10 space-y-6">
            {/* Steps indicator */}
            <div className="flex items-center justify-between w-full max-w-xl mx-auto px-2">
                <StepItem
                    number="1"
                    label="Chalé"
                    status={getStepStatus("chalet")}
                />
                <div className={cn(
                    "flex-1 h-0.5 mx-2 transition-all duration-700",
                    getStepStatus("dates") !== "pending" ? "bg-moss-500" : "bg-moss-100"
                )} />
                <StepItem
                    number="2"
                    label="Datas"
                    status={getStepStatus("dates")}
                />
                <div className={cn(
                    "flex-1 h-0.5 mx-2 transition-all duration-700",
                    getStepStatus("form") !== "pending" ? "bg-moss-500" : "bg-moss-100"
                )} />
                <StepItem
                    number="3"
                    label="Dados"
                    status={getStepStatus("form")}
                />
                <div className={cn(
                    "flex-1 h-0.5 mx-2 transition-all duration-700",
                    getStepStatus("payment") !== "pending" ? "bg-moss-500" : "bg-moss-100"
                )} />
                <StepItem
                    number="4"
                    label="Checkout"
                    status={getStepStatus("payment")}
                    isLast
                />
            </div>

            <div className="text-center">
                <h3 className="text-sm font-semibold text-moss-900 uppercase tracking-widest animate-fade-in">
                    {step === "chalet" && "Selecione seu Chalé"}
                    {step === "dates" && "Escolha as Datas"}
                    {step === "form" && "Seus Dados"}
                    {(step === "payment" || step === "processing" || step === "waiting") && "Finalizando Reserva"}
                    {step === "success" && "Reserva Confirmada"}
                    {step === "expired" && "Reserva Expirada"}
                </h3>
            </div>
        </div>
    )
}

function StepItem({ number, label, status, isLast = false }: { number: string, label: string, status: "complete" | "active" | "pending", isLast?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2 group">
            <div className={cn(
                "w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-sm",
                status === "complete" ? "bg-moss-100 text-moss-600 scale-95" :
                    status === "active" ? "bg-moss-600 text-white shadow-lg ring-4 ring-moss-50 scale-105" :
                        "bg-white border border-moss-100 text-moss-300"
            )}>
                {status === "complete" ? <CheckCircle2 className="h-5 w-5" /> : number}
            </div>
            <span className={cn(
                "hidden sm:block text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
                status === "active" ? "text-moss-900" : "text-moss-400"
            )}>
                {label}
            </span>
        </div>
    )
}
