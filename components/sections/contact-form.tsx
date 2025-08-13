"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, Phone, AlertCircle } from "lucide-react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    message: "",
  })

  const [errors, setErrors] = useState({
    email: "",
    checkIn: "",
    checkOut: "",
  })

  const validateEmail = (email: string) => {
    if (!email) return "" // Email não é obrigatório

    if (!email.includes("@")) {
      return "Email deve conter @"
    }

    if (!email.includes(".com")) {
      return "Email deve conter .com"
    }

    return ""
  }

  const validateDate = (date: string, fieldName: string) => {
    if (!date) return ""

    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Remove horas para comparar apenas a data

    if (selectedDate < today) {
      return `${fieldName} não pode ser anterior à data atual`
    }

    return ""
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "email") {
      const emailError = validateEmail(value)
      setErrors((prev) => ({ ...prev, email: emailError }))
    }

    if (field === "checkIn") {
      const checkInError = validateDate(value, "Check-in")
      setErrors((prev) => ({ ...prev, checkIn: checkInError }))
    }

    if (field === "checkOut") {
      const checkOutError = validateDate(value, "Check-out")
      setErrors((prev) => ({ ...prev, checkOut: checkOutError }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const emailError = validateEmail(formData.email)
    const checkInError = validateDate(formData.checkIn, "Check-in")
    const checkOutError = validateDate(formData.checkOut, "Check-out")

    setErrors({
      email: emailError,
      checkIn: checkInError,
      checkOut: checkOutError,
    })

    // Se houver erros, não enviar o formulário
    if (emailError || checkInError || checkOutError) {
      return
    }

    const message = `
🏠 *Nova Solicitação de Reserva - Anauê Jungle Chalés*

👤 *Nome:* ${formData.name}
📧 *Email:* ${formData.email}
📱 *Telefone:* ${formData.phone}

📅 *Check-in:* ${formData.checkIn ? new Date(formData.checkIn).toLocaleDateString("pt-BR") : "Não informado"}
📅 *Check-out:* ${formData.checkOut ? new Date(formData.checkOut).toLocaleDateString("pt-BR") : "Não informado"}
👥 *Hóspedes:* ${formData.guests || "Não informado"}

💬 *Mensagem:*
${formData.message || "Nenhuma mensagem adicional"}

---
Enviado através do site oficial
    `.trim()

    const whatsappUrl = `https://wa.me/559294197052?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">💬 Entre em Contato</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4">Reserve Sua Experiência na Natureza</h2>
          <p className="text-lg text-moss-700 max-w-3xl mx-auto leading-relaxed">
            Preencha o formulário abaixo com suas informações e preferências. Nossa equipe entrará em contato via
            WhatsApp para confirmar sua reserva e esclarecer todas as dúvidas sobre sua estadia no paraíso amazônico.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-moss-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Resposta em até 30 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-moss-500 rounded-full"></div>
              <span>Atendimento personalizado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-beige-500 rounded-full"></div>
              <span>Sem compromisso</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="bg-gradient-to-br from-moss-50 to-beige-50 border-moss-200">
              <CardHeader>
                <CardTitle className="text-moss-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Solicite Sua Reserva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-moss-800">
                        Nome Completo *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Seu nome completo"
                        required
                        className="bg-white/80 border-moss-200 focus:border-moss-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-moss-800">
                        Telefone *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(92) 99999-9999"
                        required
                        className="bg-white/80 border-moss-200 focus:border-moss-400"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-moss-800">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="seu@email.com"
                      className={`bg-white/80 border-moss-200 focus:border-moss-400 ${
                        errors.email ? "border-red-500 focus:border-red-500" : ""
                      }`}
                    />
                    {errors.email && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Reservation Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkIn" className="text-moss-800">
                        Check-in
                      </Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => handleInputChange("checkIn", e.target.value)}
                        min={getMinDate()} // Definindo data mínima como hoje
                        className={`bg-white/80 border-moss-200 focus:border-moss-400 ${
                          errors.checkIn ? "border-red-500 focus:border-red-500" : ""
                        }`}
                      />
                      {errors.checkIn && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{errors.checkIn}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="checkOut" className="text-moss-800">
                        Check-out
                      </Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => handleInputChange("checkOut", e.target.value)}
                        min={getMinDate()} // Definindo data mínima como hoje
                        className={`bg-white/80 border-moss-200 focus:border-moss-400 ${
                          errors.checkOut ? "border-red-500 focus:border-red-500" : ""
                        }`}
                      />
                      {errors.checkOut && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{errors.checkOut}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guests" className="text-moss-800">
                      Número de Hóspedes
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("guests", value)}>
                      <SelectTrigger className="bg-muted border-moss-200 focus:border-moss-400">
                        <SelectValue placeholder="Selecione o número de hóspedes" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem className="border-b" value="1">1 pessoa</SelectItem>
                        <SelectItem className="border-b" value="2">2 pessoas</SelectItem>
                        <SelectItem className="border-b" value="3">3 pessoas</SelectItem>
                        <SelectItem className="border-b" value="4">4 pessoas</SelectItem>
                        <SelectItem className="border-b" value="5">5 pessoas</SelectItem>
                        <SelectItem value="6+">6+ pessoas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-moss-800">
                      Mensagem
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Conte-nos mais sobre sua estadia desejada..."
                      rows={4}
                      className="bg-white/80 border-moss-200 focus:border-moss-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-moss-600 hover:bg-moss-700 text-white"
                    disabled={!formData.name || !formData.phone}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar via WhatsApp
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info & Quick Actions */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="bg-white border-moss-200">
                <CardHeader>
                  <CardTitle className="text-moss-900 flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contato Direto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-moss-50 rounded-lg">
                    <p className="font-semibold text-moss-800 mb-1">WhatsApp</p>
                    <p className="text-moss-600 mb-3">(92) 99419-7052</p>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                      <a href="https://wa.me/559294197052" target="_blank" rel="noreferrer">
                        Conversar Agora
                      </a>
                    </Button>
                  </div>

                  <div className="p-4 bg-beige-50 rounded-lg">
                    <p className="font-semibold text-moss-800 mb-1">Instagram</p>
                    <p className="text-moss-600 mb-3">@anaue.chales</p>
                    <Button
                      variant="outline"
                      className="w-full border-moss-300 text-moss-700 hover:bg-moss-50 bg-transparent"
                      asChild
                    >
                      <a href="https://instagram.com/anaue.chales" target="_blank" rel="noreferrer">
                        Seguir no Instagram
                      </a>
                    </Button>
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
