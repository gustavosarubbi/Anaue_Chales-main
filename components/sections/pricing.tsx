"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Smartphone, MessageCircle, AlertTriangle, RefreshCw, ShieldCheck, Info, ArrowRight, LogIn, LogOut } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CHALET_PRICING, SPECIAL_PACKAGES } from "@/lib/utils/reservation"

export function Pricing() {
  const masterPricing = CHALET_PRICING['chale-anaue']
  const campingPricing = CHALET_PRICING['chale-2']
  const carnaval = SPECIAL_PACKAGES.carnaval

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background limpo e elegante */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-white to-moss-50/20" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-moss-100/30 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-beige-100/40 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 max-w-3xl mx-auto"
        >
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200 border-moss-200">💰 Investimento</Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-moss-900 mb-4">Tarifas & Horários</h2>
          <p className="text-lg text-moss-600 font-light max-w-2xl mx-auto leading-relaxed">
            Valores por pernoite para casal. Selecione o chalé para ver os valores específicos.
          </p>
        </motion.div>

        {/* Carnaval Banner — full width, integrado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto mb-10"
        >
          <div className="relative bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-5 sm:p-6 shadow-lg shadow-purple-500/15 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-heading font-bold text-white text-lg leading-tight">{carnaval.name}</p>
                  <p className="text-purple-100 text-xs font-medium">13 a 17 de Fevereiro</p>
                </div>
              </div>

              <div className="h-px sm:h-10 sm:w-px w-full bg-white/20 flex-shrink-0" />

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white flex-grow">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-purple-200 font-medium">Diária</p>
                  <p className="text-2xl font-bold font-heading">R$ {carnaval.price.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-purple-200 font-medium">Dia 18/02</p>
                  <p className="text-xl font-bold font-heading">R$ {carnaval.latePrice.toFixed(0)}</p>
                </div>
              </div>

              <Badge className="bg-white/15 backdrop-blur-sm text-white border-white/20 text-xs px-3 py-1.5 font-medium whitespace-nowrap flex-shrink-0">
                Consulte via WhatsApp
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto mb-8">

          {/* Chalé Master */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <Card className="h-full border-none bg-white relative overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col shadow-lg shadow-moss-900/5 ring-1 ring-moss-100">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-moss-400 via-moss-500 to-moss-600" />

              <CardContent className="p-6 sm:p-8 flex flex-col flex-grow">
                {/* Header do card */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <Badge className="bg-moss-600 text-white shadow-sm text-xs px-3 py-1 font-semibold mb-2">Master</Badge>
                    <h3 className="font-heading text-2xl font-bold text-moss-900">Chalé Master</h3>
                    <p className="text-xs text-moss-500 mt-0.5 font-medium">Exclusividade e Hidromassagem</p>
                  </div>
                </div>

                {/* Preços */}
                <div className="bg-moss-50/50 rounded-2xl p-5 mb-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-moss-600 text-sm">Seg a Qui</span>
                    <span className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading">R$ {masterPricing.weekday}</span>
                  </div>
                  <div className="h-px bg-moss-200/50" />
                  <div className="flex justify-between items-center">
                    <span className="text-moss-600 text-sm">Fins de Sem / Feriados</span>
                    <span className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading">R$ {masterPricing.weekend}</span>
                  </div>
                </div>

                {/* Horários */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2.5 bg-moss-50/70 rounded-xl px-3 sm:px-4 py-3 border border-moss-100/80">
                    <LogIn className="h-4 w-4 text-moss-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-moss-400 uppercase tracking-wider font-semibold">Check-in</p>
                      <p className="text-lg font-bold text-moss-800 font-heading leading-tight">14:00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-moss-50/70 rounded-xl px-3 sm:px-4 py-3 border border-moss-100/80">
                    <LogOut className="h-4 w-4 text-moss-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-moss-400 uppercase tracking-wider font-semibold">Check-out</p>
                      <p className="text-lg font-bold text-moss-800 font-heading leading-tight">11:00</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button className="w-full bg-moss-600 hover:bg-moss-700 text-white h-13 sm:h-14 text-base rounded-2xl shadow-lg shadow-moss-600/20 hover:shadow-xl hover:shadow-moss-600/30 transition-all duration-300 font-bold group" asChild>
                    <Link href="/checkout?chalet=chale-anaue">
                      Reservar Chalé Master
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Camping Luxo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            <Card className="h-full border-none bg-white relative overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col shadow-lg shadow-stone-900/5 ring-1 ring-stone-100">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-stone-300 via-stone-400 to-stone-500" />

              <CardContent className="p-6 sm:p-8 flex flex-col flex-grow">
                {/* Header do card */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <Badge className="bg-stone-600 text-white shadow-sm text-xs px-3 py-1 font-semibold mb-2">Camping Luxo</Badge>
                    <h3 className="font-heading text-2xl font-bold text-moss-900">Camping Luxo</h3>
                    <p className="text-xs text-stone-500 mt-0.5 font-medium">Design Moderno e Imersão</p>
                  </div>
                </div>

                {/* Preços */}
                <div className="bg-stone-50/50 rounded-2xl p-5 mb-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600 text-sm">Seg a Qui</span>
                    <span className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading">R$ {campingPricing.weekday}</span>
                  </div>
                  <div className="h-px bg-stone-200/50" />
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600 text-sm">Fins de Sem / Feriados</span>
                    <span className="text-2xl sm:text-3xl font-bold text-moss-900 font-heading">R$ {campingPricing.weekend}</span>
                  </div>
                </div>

                {/* Horários */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2.5 bg-stone-50/70 rounded-xl px-3 sm:px-4 py-3 border border-stone-100/80">
                    <LogIn className="h-4 w-4 text-stone-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Check-in</p>
                      <p className="text-lg font-bold text-stone-800 font-heading leading-tight">15:00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-stone-50/70 rounded-xl px-3 sm:px-4 py-3 border border-stone-100/80">
                    <LogOut className="h-4 w-4 text-stone-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Check-out</p>
                      <p className="text-lg font-bold text-stone-800 font-heading leading-tight">12:00</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button
                    className="w-full bg-stone-700 hover:bg-stone-800 text-white h-13 sm:h-14 text-base rounded-2xl shadow-lg shadow-stone-700/20 hover:shadow-xl hover:shadow-stone-700/30 transition-all duration-300 font-bold group"
                    asChild
                  >
                    <Link href="/checkout?chalet=chale-2">
                      Reservar Camping Luxo
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Formas de pagamento — nota unificada abaixo dos cards */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-20 max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-2 text-sm text-moss-500">
            <Smartphone className="h-4 w-4" />
            <span>Pix</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-moss-300" />
          <div className="flex items-center gap-2 text-sm text-moss-500">
            <CreditCard className="h-4 w-4" />
            <span>Cartão de Crédito</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-moss-300" />
          <span className="text-sm text-moss-400 font-light">Pagamento seguro via InfinitePay</span>
        </motion.div>

        {/* Política de Cancelamento e Reagendamento */}
        <motion.div
          id="politica-cancelamento"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-none shadow-xl shadow-moss-900/5 ring-1 ring-moss-100 max-w-5xl mx-auto overflow-hidden">
            <CardHeader className="border-b border-moss-50 bg-gradient-to-r from-moss-50/40 to-beige-50/40 px-6 sm:px-8 py-5">
              <CardTitle className="text-center text-moss-900 flex items-center justify-center gap-3 font-heading text-lg sm:text-xl">
                <div className="w-9 h-9 rounded-xl bg-moss-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-4 w-4 text-moss-600" />
                </div>
                Política de Cancelamento e Reagendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {/* Aviso de exclusividade */}
              <div className="flex items-start gap-3 bg-gradient-to-r from-moss-50/60 to-beige-50/30 border border-moss-100 rounded-xl p-4 mb-7">
                <div className="w-7 h-7 rounded-lg bg-moss-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="h-3.5 w-3.5 text-moss-600" />
                </div>
                <p className="text-sm text-moss-700 leading-relaxed">
                  O valor pago garante a <strong className="text-moss-900">exclusividade da reserva</strong>. O chalé deixa de ser ofertado a outros hóspedes a partir da confirmação do pagamento.
                </p>
              </div>

              {/* Layout Grid: Cancelamento (esq) e Reagendamento (dir) */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Cancelamento - Lista vertical */}
                <div>
                  <h4 className="font-heading font-semibold text-moss-900 text-base mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    Cancelamento
                  </h4>
                  <div className="space-y-3">
                    {/* Card 100% */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50/60 border border-green-100/70 hover:border-green-200 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-green-900 font-semibold mb-0.5">Reembolso integral (100%)</p>
                        <p className="text-xs text-green-700 leading-relaxed">Até 7 dias após pagamento + 72h antes do check-in.</p>
                      </div>
                    </div>
                    
                    {/* Card 50% */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-100/70 hover:border-amber-200 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm text-amber-900 font-semibold mb-0.5">Reembolso parcial (50%)</p>
                        <p className="text-xs text-amber-700 leading-relaxed">Mínimo de 10 dias antes do check-in, respeitando 72h.</p>
                      </div>
                    </div>

                    {/* Card 0% */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-red-50/60 border border-red-100/70 hover:border-red-200 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-red-900 font-semibold mb-0.5">Sem reembolso (0%)</p>
                        <p className="text-xs text-red-700 leading-relaxed">Menos de 72h do check-in, independente da data da compra.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reagendamento - Coluna lateral com altura preenchida */}
                <div className="flex flex-col h-full">
                  <h4 className="font-heading font-semibold text-moss-900 text-base mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-moss-50 flex items-center justify-center">
                      <RefreshCw className="h-3.5 w-3.5 text-moss-600" />
                    </div>
                    Reagendamento
                  </h4>
                  <div className="flex-grow flex flex-col justify-center p-6 rounded-xl bg-gradient-to-br from-moss-50/60 to-beige-50/20 border border-moss-100 hover:border-moss-200 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-moss-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-4 h-4 rounded-full bg-moss-500" />
                      </div>
                      <p className="text-lg text-moss-900 font-bold">Taxa de R$ 100,00</p>
                    </div>
                    
                    <p className="text-sm text-moss-600 leading-relaxed mb-6 pl-16">
                      O reagendamento é permitido sempre mediante taxa de R$ 100,00, desde que solicitado com <strong>no mínimo 72h de antecedência</strong> do check-in.
                    </p>

                    <div className="mt-auto pl-16">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-moss-100/50 rounded-lg border border-moss-200/50">
                        <span className="text-xs text-moss-600 font-medium uppercase tracking-wide">Prazo Mínimo:</span>
                        <strong className="text-moss-900">72h antes</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aviso Legal / Disclaimer */}
              <div className="mt-8 pt-6 border-t border-moss-50 text-center">
                <p className="text-[10px] text-moss-400 max-w-2xl mx-auto leading-normal">
                  * De acordo com o Código de Defesa do Consumidor (Art. 49), o prazo de reflexão de 7 dias é garantido para compras online. 
                  Ao realizar a reserva, você declara estar ciente e de acordo com as políticas de cancelamento e reagendamento acima descritas.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
