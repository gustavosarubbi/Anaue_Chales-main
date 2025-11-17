"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function WhatsAppButton() {
  const whatsappNumber = "559294197052"
  const message = "Olá! Gostaria de fazer uma reserva no Anauê Jungle Chalés."

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
            className="fixed bottom-20 right-8 md:bottom-24 md:right-8 z-50 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95"
            size="icon"
            aria-label="Falar no WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-green-700 text-white border-green-800">
          <p>Falar no WhatsApp</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

