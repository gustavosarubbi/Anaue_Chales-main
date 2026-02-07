"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Wifi, Camera, Heart, Menu, X, Calendar, Smartphone } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { CHALET_PRICING, SPECIAL_PACKAGES } from "@/lib/utils/reservation"

export function Hero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const carnaval = SPECIAL_PACKAGES.carnaval
  const masterPricing = CHALET_PRICING['chale-anaue']
  const campingPricing = CHALET_PRICING['chale-2']

  const navigationItems = [
    { name: "Início", href: "#inicio" },
    { name: "Comodidades", href: "#comodidades" },
    { name: "Galeria", href: "#galeria" },
    { name: "Disponibilidade", href: "#calendario" },
    { name: "Localização", href: "#contato" },
    { name: "Preços", href: "#pricing" },
    { name: "Contato", href: "#contato" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    setIsMenuOpen(false)
    if (href === "#inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <section id="inicio" className="relative min-h-screen overflow-hidden">
      {/* Background Image with Parallax-like feel */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{
            backgroundImage: `url('/Chale 2/IMG_3221.jpg')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-moss-900/60 via-moss-900/40 to-moss-900/80"></div>
      </div>

      {/* Navigation Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled || isMenuOpen
          ? "bg-moss-900 shadow-md border-moss-800 py-2"
          : "bg-transparent border-white/10 py-3"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link href="#inicio" className="flex items-center space-x-3 group" onClick={() => scrollToSection("#inicio")}>
              <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-white/20 bg-white group-hover:border-white/50 transition-colors">
                <img
                  src="/anaue-logo.png"
                  alt="Anauê Jungle Chalés"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-heading font-bold text-lg text-white tracking-wide">
                  Anauê Jungle
                </h1>
                <p className="text-xs text-moss-200 tracking-wider uppercase">
                  Chalés
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Contact Button & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                className="hidden md:flex bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-full px-6 transition-all duration-300"
                asChild
              >
                <Link href="/checkout">
                  <Calendar className="mr-2 h-4 w-4" />
                  Reservar
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-moss-900 lg:hidden pt-24 px-4 sm:px-6 flex flex-col"
          >
            <nav className="flex flex-col gap-4">
              {navigationItems.map((item, idx) => (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-2xl font-heading font-semibold text-white text-left py-4 border-b border-white/10 active:text-moss-300 transition-colors"
                >
                  {item.name}
                </motion.button>
              ))}
              <div className="mt-8">
                <Button className="w-full bg-white text-moss-900 hover:bg-moss-50 rounded-xl py-6 text-lg font-bold shadow-lg" asChild>
                  <Link href="/checkout" onClick={() => setIsMenuOpen(false)}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Reservar Agora
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative z-10 min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg mb-6 border border-white/20 backdrop-blur-sm"
                >
                  <span className="text-base sm:text-lg md:text-xl flex-shrink-0">🎭</span>
                  <span className="whitespace-nowrap">Pacote Carnaval: 13 a 17 de Fev</span>
                  <span className="text-base sm:text-lg md:text-xl flex-shrink-0">🎭</span>
                </motion.div>
                <div className="block">
                  <Badge variant="outline" className="mb-6 border-white/30 text-white px-4 py-1 text-sm tracking-wider uppercase backdrop-blur-sm bg-white/5">
                    Bem-vindo à Amazônia
                  </Badge>
                </div>
                <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-[1.1] mb-6 drop-shadow-xl">
                  Anauê Jungle <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-moss-200 to-beige-200">
                    Chalés
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-moss-100 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                  Seu refúgio exclusivo na floresta. Conforto, segurança e charme às margens do Rio Tarumã.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-wrap justify-center lg:justify-start gap-3"
              >
                {[
                  { icon: Wifi, label: "Wi-Fi" },
                  { icon: Camera, label: "Segurança 24h" },
                  { icon: MapPin, label: "Tarumã" }
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/10 hover:bg-white/10 transition-colors">
                    <feat.icon className="h-4 w-4 text-moss-300" />
                    <span className="text-white text-sm font-medium">{feat.label}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-8 pb-4"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-moss-900 hover:bg-moss-50 px-10 h-16 rounded-full font-semibold text-lg hover-lift shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
                  asChild
                >
                  <Link href="/checkout">
                    Ver Disponibilidade
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 h-16 rounded-full px-10 text-lg font-medium backdrop-blur-sm transition-all duration-300"
                  onClick={() => scrollToSection("#pricing")}
                >
                  Ver Preços
                </Button>
              </motion.div>
            </div>

            {/* Right Content - Glassmorphism Reservation Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-md">
                {/* Decorative blob behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-moss-500 to-beige-400 rounded-2xl blur opacity-30 animate-pulse-slow"></div>

                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white overflow-hidden mb-4 sm:mb-6 md:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                  <CardContent className="p-8 space-y-6 pb-8">
                    <div className="text-center space-y-2">
                      <h3 className="font-heading text-2xl font-bold">Reserva Rápida</h3>
                      <p className="text-moss-200 text-sm">Garanta seu descanso na natureza</p>
                    </div>

                    <div className="space-y-4 bg-black/20 rounded-xl p-5 border border-white/5">
                      {/* Carnaval Special */}
                      <div className="flex justify-between items-center border-b border-purple-500/30 bg-purple-900/20 px-3 py-2 rounded-lg -mx-1 mb-1">
                        <div>
                          <p className="text-xs font-bold text-purple-200 uppercase tracking-tighter">{carnaval.name.split(' ')[1]} 🎭</p>
                          <p className="text-[10px] text-purple-300/70">13 a 17 de Fev</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-100">R$ {carnaval.price}</p>
                          <p className="text-[10px] text-purple-300/70">noite</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <div>
                          <p className="text-sm font-medium text-moss-100">Chalé Master</p>
                          <p className="text-xs text-white/50">A partir de</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold font-heading">R$ {masterPricing.weekday}</p>
                          <p className="text-[10px] text-white/50">casal / noite</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-moss-100">Camping Luxo</p>
                          <p className="text-xs text-white/50">A partir de</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold font-heading">R$ {campingPricing.weekday}</p>
                          <p className="text-[10px] text-white/50">casal / noite</p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full h-14 bg-moss-500 hover:bg-moss-400 text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-300 group" asChild>
                      <Link href="/checkout">
                        Reservar Online
                        <Calendar className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>

                    <p className="text-center text-xs text-white/40">
                      Reserva Imediata • Pague com InfinitePay
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
