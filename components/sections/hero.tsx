"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Wifi, Camera, Heart, Menu, X, MessageCircle, Calendar, Smartphone } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const navigationItems = [
    { name: "Início", href: "#inicio" },
    { name: "Comodidades", href: "#comodidades" },
    { name: "Galeria", href: "#galeria" },
    { name: "Disponibilidade", href: "#calendario" },
    { name: "Localização", href: "#localizacao" },
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
    <section id="inicio" className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/Chale-1.jpg')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-moss-900/70 via-moss-800/60 to-moss-700/70"></div>
      </div>

      {/* Navigation Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-moss-600 shadow-lg border-b border-moss-700"
            : "bg-white/10 backdrop-blur-md border-b border-white/20"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <img
                src="/anaue-logo.png"
                alt="Anauê Jungle Chalés"
                className={`w-10 h-10 transition-all duration-300 ${isScrolled ? "opacity-100" : "opacity-80"}`}
              />
              <div className="hidden sm:block">
                <h1
                  className={`font-bold text-lg transition-colors duration-300 ${
                    isScrolled ? "text-white" : "text-white"
                  }`}
                >
                  Anauê Jungle
                </h1>
                <p
                  className={`text-xs -mt-1 transition-colors duration-300 ${
                    isScrolled ? "text-moss-100" : "text-white/80"
                  }`}
                >
                  Chalés
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className={`font-medium transition-all duration-300 relative group ${
                    isScrolled ? "text-white hover:text-moss-100" : "text-white hover:text-white/80"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-200 group-hover:w-full ${
                      isScrolled ? "bg-moss-200" : "bg-white"
                    }`}
                  ></span>
                </button>
              ))}
            </nav>

            {/* Contact Button & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                className={`hidden md:flex transition-all duration-300 ${
                  isScrolled
                    ? "bg-white text-moss-600 hover:bg-moss-50"
                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                }`}
                asChild
              >
                <Link href="#calendario">
                  <Calendar className="mr-2 h-4 w-4" />
                  Verificar Disponibilidade
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden p-2 transition-colors duration-300 ${
                  isScrolled ? "text-white hover:text-moss-100" : "text-white hover:text-white/80"
                }`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div
              className={`lg:hidden absolute top-16 left-0 right-0 shadow-lg transition-all duration-300 ${
                isScrolled
                  ? "bg-moss-700/95 backdrop-blur-md border-b border-moss-800"
                  : "bg-moss-900/95 backdrop-blur-md border-b border-moss-800"
              }`}
            >
              <nav className="container mx-auto px-4 py-4">
                <div className="flex flex-col space-y-4">
                  {navigationItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => scrollToSection(item.href)}
                      className="text-left font-medium py-2 px-4 rounded-lg transition-all duration-200 text-white hover:text-moss-100 hover:bg-moss-600"
                    >
                      {item.name}
                    </button>
                  ))}
                  <div className="pt-4 border-t border-moss-600">
                    <Button className="w-full bg-white text-moss-600 hover:bg-moss-50" asChild>
                      <Link href="#calendario">
                        <Calendar className="mr-2 h-4 w-4" />
                        Verificar Disponibilidade
                      </Link>
                    </Button>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto pt-20 pb-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-6 lg:space-y-8">
              {/* Main Title */}
              <div className="animate-fadeInDown">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-3 leading-tight">
                  Anauê Jungle
                  <span className="block text-beige-200 mt-2 animate-fadeInUp animate-delay-200">Chalés</span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl text-white/95 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fadeInUp animate-delay-300">
                O seu refúgio na floresta com conforto, segurança, charme e exclusividade
              </p>

              {/* Key Features */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 animate-fadeInUp animate-delay-400">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2.5 hover-scale transition-all duration-300">
                  <Wifi className="h-4 w-4 text-white flex-shrink-0" />
                  <span className="text-white font-medium text-sm sm:text-base">Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2.5 hover-scale transition-all duration-300">
                  <Camera className="h-4 w-4 text-white flex-shrink-0" />
                  <span className="text-white font-medium text-sm sm:text-base">Segurança 24h</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2.5 hover-scale transition-all duration-300">
                  <Heart className="h-4 w-4 text-white flex-shrink-0" />
                  <span className="text-white font-medium text-sm sm:text-base">Não Pet Friendly</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2.5 hover-scale transition-all duration-300">
                  <MapPin className="h-4 w-4 text-white flex-shrink-0" />
                  <span className="text-white font-medium text-sm sm:text-base">Tarumã</span>
                </div>
              </div>

              {/* CTA Buttons - Optimized for mobile touch */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fadeInUp animate-delay-500">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-8 py-4 text-base sm:text-lg font-semibold w-full sm:w-auto min-h-[48px] transition-all duration-200 shadow-lg hover:shadow-xl ripple-container" 
                  asChild
                >
                  <Link href="#calendario">
                    <Calendar className="mr-2 h-5 w-5" />
                    Verificar Disponibilidade
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/20 active:scale-95 px-8 py-4 text-base sm:text-lg font-semibold bg-transparent backdrop-blur-sm w-full sm:w-auto min-h-[48px] transition-all duration-200"
                  onClick={() => scrollToSection("#pricing")}
                >
                  Ver Preços
                </Button>
              </div>

              {/* Contact Info */}
              <div className="text-white/90 space-y-1 pt-2">
                <p className="text-base sm:text-lg font-medium">📲 (92) 99419-7052</p>
                <p className="text-sm sm:text-base">📍 @anaue.chales</p>
              </div>
            </div>

            {/* Right Content - Reservation Card */}
            <div className="flex justify-center lg:justify-end mt-10 lg:mt-0">
              <Card className="bg-white border-moss-200 shadow-2xl max-w-md w-full animate-fadeInUp hover-lift">
                <CardContent className="p-6 sm:p-8">
                  {/* Header do Card */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-moss-900 mb-3">Reserve Agora</h3>
                    <p className="text-sm text-moss-600 leading-relaxed">
                      Entre em contato pelo WhatsApp e garanta sua reserva
                    </p>
                  </div>

                  {/* Pricing Section */}
                  <div className="bg-moss-50 rounded-xl p-5 mb-6 space-y-4 border border-moss-100">
                    {/* Finais de Semana */}
                    <div className="pb-3 border-b border-moss-200">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-moss-900 mb-1">Finais de Semana</p>
                          <p className="text-xs text-moss-600">
                            Sexta a Domingo, feriados e vésperas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-moss-900">R$ 800</p>
                          <p className="text-xs text-moss-600">por noite (valor para casal)</p>
                        </div>
                      </div>
                    </div>

                    {/* Segunda a Quinta */}
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-moss-900 mb-1">Segunda a Quinta</p>
                          <p className="text-xs text-moss-600">
                            Exceto feriados e vésperas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-moss-900">R$ 650</p>
                          <p className="text-xs text-moss-600">por noite (valor para casal)</p>
                        </div>
                      </div>
                    </div>

                    {/* Observação especial para dezembro */}
                    <div className="pt-3 border-t border-moss-200">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-orange-900 mb-1">📅 24 e 31 de Dezembro</p>
                        <p className="text-xs text-orange-800 leading-relaxed">
                          Valores somente via <strong>WhatsApp</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Pagamento */}
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-moss-700">
                      <Smartphone className="h-4 w-4 text-moss-600" />
                      <span>Pagamento via PIX ou parcelado</span>
                    </div>
                    <div className="text-xs text-moss-600 pl-6">
                      Parcelado com juros da máquina
                    </div>
                  </div>

                  {/* CTA Button - Mobile optimized */}
                  <Button className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white text-base sm:text-lg py-4 sm:py-6 font-semibold mb-4 min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 ripple-container" asChild>
                    <Link href="/checkout">
                      <Calendar className="mr-2 h-5 w-5" />
                      Reservar Agora
                    </Link>
                  </Button>

                  {/* Informações Adicionais */}
                  <div className="bg-moss-50 rounded-lg p-4 space-y-2 border border-moss-100">
                    <p className="text-xs font-semibold text-moss-900 mb-2">Informações Adicionais:</p>
                    <div className="text-xs text-moss-600 space-y-1">
                      <p>• Valores para o casal (por pernoite)</p>
                      <p>• Crianças até 5 anos não pagam</p>
                      <p>• De 6 a 15 anos: <span className="text-moss-900 font-bold">+R$ 100</span></p>
                      <p>• A partir de 16 anos: <span className="text-moss-900 font-bold">+R$ 150</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
