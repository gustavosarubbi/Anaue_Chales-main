"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <>
      {isVisible && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={scrollToTop}
                className="fixed bottom-20 left-4 md:bottom-8 md:left-8 z-50 h-14 w-14 rounded-full bg-moss-600 hover:bg-moss-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 animate-fadeInUp hover:scale-110 active:scale-95"
                size="icon"
                aria-label="Voltar ao topo"
              >
                <ArrowUp className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-moss-800 text-white border-moss-700">
              <p>Voltar ao topo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  )
}

