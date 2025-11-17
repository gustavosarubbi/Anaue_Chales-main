"use client"

import { useState, useEffect } from "react"

export function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (scrollPx / winHeightPx) * 100

      setScrollProgress(scrolled)
    }

    window.addEventListener("scroll", updateScrollProgress)
    
    // Initial calculation
    updateScrollProgress()

    return () => window.removeEventListener("scroll", updateScrollProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-moss-100">
      <div
        className="h-full bg-gradient-to-r from-moss-500 via-moss-600 to-moss-700 transition-all duration-150 ease-out shadow-lg"
        style={{ width: `${scrollProgress}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
      </div>
    </div>
  )
}

