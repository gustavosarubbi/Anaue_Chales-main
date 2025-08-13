"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Wifi, Camera, Heart, Menu, X, MessageCircle, Percent } from "lucide-react"
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
            backgroundImage: `url('chale.jpeg')`,
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
                <Link href="https://wa.me/559294197052" target="_blank">
                  <Phone className="mr-2 h-4 w-4" />
                  Reservar
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
                      <Link href="https://wa.me/559294197052" target="_blank">
                        <Phone className="mr-2 h-4 w-4" />
                        Reservar Agora
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
      <div className="container mx-auto px-4 py-16 relative z-10 flex items-center min-h-screen">
        <div className="max-w-6xl mx-auto pt-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                Anauê Jungle
                <span className="block text-beige-200">Chalés</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl leading-relaxed">
              O seu refúgio na floresta com conforto, segurança, charme e exclusividade
              </p>

              {/* Key Features */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Wifi className="h-4 w-4 text-white" />
                  <span className="text-white font-medium">Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Camera className="h-4 w-4 text-white" />
                  <span className="text-white font-medium">Segurança 24h</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Heart className="h-4 w-4 text-white" />
                  <span className="text-white font-medium">Pet Friendly</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <MapPin className="h-4 w-4 text-white" />
                  <span className="text-white font-medium">Tarumã</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg" asChild>
                  <Link href="https://wa.me/559294197052" target="_blank">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Reservar Agora
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent backdrop-blur-sm"
                  onClick={() => scrollToSection("#pricing")}
                >
                  Ver Preços
                </Button>
              </div>

              {/* Contact Info */}
              <div className="text-white/80">
                <p className="text-lg font-medium">📲 (92) 99419-7052</p>
                <p className="text-sm">📍 @anaue.chales</p>
              </div>
            </div>

            {/* Right Content - Reservation Card */}
            <div className="flex justify-center lg:justify-end">
              <Card className="bg-white/95 backdrop-blur-sm border-white/20 max-w-md w-full">
                <CardContent className="p-8">
                  {/* WhatsApp Discount Badge */}
                  <div className="text-center mb-6">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-lg px-4 py-2 mb-4">
                      <Percent className="mr-2 h-5 w-5" />
                      Desconto Especial!
                    </Badge>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <p className="text-green-800 font-bold text-lg mb-2">20% OFF</p>
                      <p className="text-green-700 text-sm">
                        Reservas feitas via WhatsApp ganham desconto especial de 20%!
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-moss-900 mb-4">Reserve Sua Experiência</h3>
                    <p className="text-moss-700 mb-6">
                      Entre em contato conosco pelo WhatsApp e garante seu desconto exclusivo!
                    </p>

                    {/* Pricing Preview */}
                    <div className="bg-moss-50 p-4 rounded-lg mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-moss-700">Finais de semana:</span>
                        <div className="text-right">
                          <span className="text-moss-500 line-through text-sm">R$ 940</span>
                          <span className="text-moss-900 font-bold ml-2">R$ 752</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-moss-700">Segunda a quinta:</span>
                        <div className="text-right">
                          <span className="text-moss-500 line-through text-sm">R$ 750</span>
                          <span className="text-moss-900 font-bold ml-2">R$ 600</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3" asChild>
                      <Link
                        href="https://wa.me/559294197052?text=Olá! Vi o desconto de 20% e gostaria de fazer uma reserva!"
                        target="_blank"
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Garantir Desconto
                      </Link>
                    </Button>

                    <p className="text-xs text-moss-600 mt-3">* Desconto válido apenas para reservas via WhatsApp</p>
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
