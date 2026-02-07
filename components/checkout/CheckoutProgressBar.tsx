import { Check, Calendar, User, CreditCard, Home } from "lucide-react"
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

    const steps = [
        { id: "chalet", label: "Chalé", icon: Home },
        { id: "dates", label: "Datas", icon: Calendar },
        { id: "form", label: "Dados", icon: User },
        { id: "payment", label: "Pagamento", icon: CreditCard },
    ]

    const activeIndex = steps.findIndex(s => getStepStatus(s.id) === "active")

    return (
        <div className="mb-8 sm:mb-12">
            {/* Desktop / Tablet View */}
            <div className="hidden sm:block">
                <div className="bg-white/60 backdrop-blur-sm border border-moss-100/50 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between w-full max-w-3xl mx-auto relative">
                        {/* Connecting Line Background */}
                        <div className="absolute top-5 left-[40px] right-[40px] h-[3px] bg-moss-100 rounded-full" />
                        {/* Connecting Line Progress */}
                        <div
                            className="absolute top-5 left-[40px] h-[3px] bg-gradient-to-r from-moss-500 to-moss-600 rounded-full transition-all duration-700 ease-in-out"
                            style={{
                                width: `${Math.max(0, (activeIndex / (steps.length - 1)) * (100 - (80 / (steps.length - 1) * 100 / 100)))}%`,
                                maxWidth: `calc(100% - 80px)`,
                            }}
                        />

                        {steps.map((s, index) => {
                            const status = getStepStatus(s.id)
                            const Icon = s.icon
                            return (
                                <div key={s.id} className="flex flex-col items-center gap-3 relative z-10">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                                        status === "complete"
                                            ? "bg-moss-600 border-moss-600 text-white shadow-md shadow-moss-600/30"
                                            : status === "active"
                                                ? "bg-white border-moss-600 text-moss-600 shadow-lg shadow-moss-600/20 scale-110 ring-4 ring-moss-100"
                                                : "bg-white border-moss-200 text-moss-300"
                                    )}>
                                        {status === "complete" ? (
                                            <Check className="w-5 h-5" />
                                        ) : status === "active" ? (
                                            <Icon className="w-4 h-4" />
                                        ) : (
                                            <span className="text-sm font-bold">{index + 1}</span>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
                                        status === "active" ? "text-moss-900" :
                                            status === "complete" ? "text-moss-600" : "text-moss-300"
                                    )}>
                                        {s.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile View - Compact Card */}
            <div className="sm:hidden">
                <div className="bg-white/60 backdrop-blur-sm border border-moss-100/50 rounded-2xl px-4 py-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-moss-600 text-white flex items-center justify-center shadow-md shadow-moss-600/30">
                                {(() => {
                                    const ActiveIcon = steps[activeIndex]?.icon || Home
                                    return <ActiveIcon className="w-4 h-4" />
                                })()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-moss-400 font-bold uppercase tracking-widest">
                                    Passo {activeIndex + 1} de 4
                                </span>
                                <h2 className="text-base font-bold text-moss-900 font-heading leading-none">
                                    {steps[activeIndex]?.label || "Finalizando"}
                                </h2>
                            </div>
                        </div>
                        <div className="flex gap-1.5">
                            {steps.map((s) => {
                                const status = getStepStatus(s.id)
                                return (
                                    <div
                                        key={s.id}
                                        className={cn(
                                            "h-2 rounded-full transition-all duration-500",
                                            status === "active" ? "w-8 bg-moss-600 shadow-sm shadow-moss-600/30" :
                                                status === "complete" ? "w-2 bg-moss-400" : "w-2 bg-moss-100"
                                        )}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
