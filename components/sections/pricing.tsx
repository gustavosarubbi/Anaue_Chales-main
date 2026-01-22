"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CreditCard, Smartphone, MessageCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white texture-lines relative">
      {/* Background gradient splash */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[800px] bg-moss-50/50 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">💰 Investimento</Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-moss-900 mb-6">Preços e Horários</h2>
          <p className="text-lg text-moss-600 font-light max-w-2xl mx-auto">
            Tarifas especiais para diferentes períodos. Viva momentos inesquecíveis sem preocupações.
          </p>

          {/* Observação especial para Carnaval */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-6 rounded-2xl shadow-sm inline-block text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/20 rounded-full blur-xl" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-purple-100 p-2 rounded-full">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-heading font-bold text-purple-900 text-lg mb-1">🎭 Pacote Carnaval (13 a 17 de Fev)</p>
                  <div className="text-purple-800">
                    <p className="mb-1">
                      Diárias de <strong className="text-xl">R$ 950,00</strong> para o período de folia.
                    </p>
                    <p>
                      Dia 18/02 por <strong className="text-lg">R$ 800,00</strong>.
                    </p>
                    <span className="block mt-2 font-medium text-sm bg-purple-200/50 px-2 py-1 rounded inline-block text-purple-900">Consulte disponibilidade via WhatsApp!</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto mb-16">
          {/* Weekend Pricing */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full border-moss-200 bg-white relative overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-moss-400 to-moss-600" />
              <div className="absolute top-6 right-6">
                <Badge className="bg-moss-600 text-white shadow-lg text-xs px-3 py-1">Popular</Badge>
              </div>
              <CardHeader className="pt-10 pb-2 px-8">
                <CardTitle className="flex items-center gap-3 text-moss-900 font-heading text-2xl">
                  <div className="bg-moss-50 p-2 rounded-lg">
                    <Calendar className="h-6 w-6 text-moss-600" />
                  </div>
                  Finais de Semana
                </CardTitle>
                <p className="text-sm text-moss-500 mt-2 font-medium uppercase tracking-wide">Sex a Dom • Feriados</p>
              </CardHeader>
              <CardContent className="px-8 pb-8 flex flex-col flex-grow">
                <div className="mb-8 mt-4">
                  <span className="text-5xl font-bold text-moss-900 tracking-tight">R$ 800</span>
                  <p className="text-moss-600 font-medium mt-1">por noite / casal</p>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-moss-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-moss-800">Pagamento facilitado</p>
                      <p className="text-xs text-moss-500">Via Pix rápido e seguro</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-moss-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-moss-800">Cartão de Crédito</p>
                      <p className="text-xs text-moss-500">Parcelamos (com juros da máquina)</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-moss-600 hover:bg-moss-700 text-white h-12 text-lg rounded-xl shadow-md transition-all duration-200" asChild>
                  <Link href="/checkout">
                    Reservar Fim de Semana
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekday Pricing */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full border-stone-200 bg-white relative overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-stone-300 to-stone-400" />
              <CardHeader className="pt-10 pb-2 px-8">
                <CardTitle className="flex items-center gap-3 text-moss-900 font-heading text-2xl">
                  <div className="bg-stone-100 p-2 rounded-lg">
                    <Calendar className="h-6 w-6 text-stone-600" />
                  </div>
                  Segunda a Quinta
                </CardTitle>
                <p className="text-sm text-stone-500 mt-2 font-medium uppercase tracking-wide">Dias Úteis • Exceto feriados</p>
              </CardHeader>
              <CardContent className="px-8 pb-8 flex flex-col flex-grow">
                <div className="mb-8 mt-4">
                  <span className="text-5xl font-bold text-moss-900 tracking-tight">R$ 650</span>
                  <p className="text-stone-600 font-medium mt-1">por noite / casal</p>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-stone-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-stone-800">Pagamento facilitado</p>
                      <p className="text-xs text-stone-500">Via Pix rápido e seguro</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-stone-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-stone-800">Cartão de Crédito</p>
                      <p className="text-xs text-stone-500">Parcelamos (com juros da máquina)</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-moss-200 text-moss-700 hover:bg-moss-50 h-12 text-lg rounded-xl transition-all duration-200"
                  asChild
                >
                  <Link href="/checkout">
                    Reservar Dia de Semana
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Schedule Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white border-dashed border-2 border-moss-200 shadow-none max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-moss-900 flex items-center justify-center gap-2 font-heading text-xl">
                <Clock className="h-5 w-5" />
                Horários de Check-in e Check-out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 text-center px-4 md:px-12">
                <div className="p-4 rounded-xl hover:bg-moss-50 transition-colors">
                  <div className="text-3xl font-bold text-moss-800 mb-1">14:00</div>
                  <p className="text-moss-600 font-medium uppercase text-xs tracking-wider">Check-in</p>
                </div>
                <div className="p-4 rounded-xl hover:bg-moss-50 transition-colors">
                  <div className="text-3xl font-bold text-moss-800 mb-1">11:00</div>
                  <p className="text-moss-600 font-medium uppercase text-xs tracking-wider">Check-out</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
