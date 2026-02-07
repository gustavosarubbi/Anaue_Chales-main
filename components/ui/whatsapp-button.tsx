"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function WhatsAppButton() {
  const whatsappNumber = "559294197052"
  const message = "Olá! Tenho uma dúvida sobre o Anauê Jungle."

  const openWhatsApp = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={openWhatsApp}
            className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50 h-12 w-12 md:h-14 md:w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
            size="icon"
            aria-label="Falar no WhatsApp"
          >
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-green-700 text-white border-green-800">
          <p>Tirar Dúvidas (WhatsApp)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
