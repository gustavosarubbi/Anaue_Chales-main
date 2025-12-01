"use client"

import React, { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

interface CalendarModalWrapperProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  trigger: React.ReactNode
  title: string
  children: React.ReactNode
}

export function CalendarModalWrapper({
  isOpen,
  onOpenChange,
  trigger,
  title,
  children,
}: CalendarModalWrapperProps) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768
    }
    return false
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Clonar o trigger para garantir que o clique sempre funcione
  const enhancedTrigger = React.cloneElement(trigger as React.ReactElement, {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevenir comportamento padrão
      e.preventDefault()
      e.stopPropagation()
      
      // Chamar onClick original se existir
      const originalOnClick = (trigger as React.ReactElement).props?.onClick
      if (originalOnClick && typeof originalOnClick === 'function') {
        originalOnClick(e)
      }
      
      // Abrir o modal
      onOpenChange(!isOpen)
    },
    type: 'button',
  } as React.ButtonHTMLAttributes<HTMLButtonElement>)

  // Mobile: usar Dialog
  if (isMobile) {
    return (
      <>
        {enhancedTrigger}
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-[95vw] sm:max-w-md p-0 gap-0 max-h-[90vh] overflow-y-auto z-[100]">
            <VisuallyHidden>
              <DialogTitle>{title}</DialogTitle>
            </VisuallyHidden>
            {children}
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Desktop: usar Popover
  return (
    <Popover 
      open={isOpen} 
      onOpenChange={onOpenChange} 
      modal={false}
    >
      <PopoverTrigger asChild>
        {enhancedTrigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-[340px] sm:w-auto p-0 bg-white max-w-[calc(100vw-1rem)] sm:max-w-none z-[100] overflow-visible"
        align="start"
        side="bottom"
        sideOffset={8}
        avoidCollisions={true}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}
