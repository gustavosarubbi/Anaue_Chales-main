"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, MessageCircle, Instagram, MapPin, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function Contact() {
  return (
    <section id="contato" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-moss-50/50 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 bg-moss-100 text-moss-800 border-moss-200 px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold">
                Entre em Contato
              </Badge>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-moss-900 mb-6">
                Reserve Sua Experiência na Natureza
              </h2>
              <p className="text-lg text-moss-600 max-w-2xl mx-auto font-light leading-relaxed">
                Estamos prontos para tirar suas dúvidas e ajudar você a planejar o refúgio perfeito na Amazônia.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-6 text-[11px] font-bold text-moss-400 tracking-widest uppercase">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Resposta em até 30 min</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-moss-400" />
                  <span>Atendimento Humano</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-beige-400" />
                  <span>Sem Compromisso</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Direct Channels */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-moss-100 shadow-sm overflow-hidden bg-white rounded-[2rem]">
                  <CardHeader className="bg-moss-50/50 border-b border-moss-100 p-8">
                    <CardTitle className="text-moss-950 font-heading text-2xl flex items-center gap-3">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm">
                        <MessageCircle className="h-6 w-6 text-green-600" />
                      </div>
                      Canais Diretos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                      <div className="text-center sm:text-left">
                        <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest mb-1">WhatsApp de Reservas</p>
                        <p className="text-2xl font-black text-moss-900">(92) 99419-7052</p>
                      </div>
                      <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 h-14 px-8 rounded-2xl font-bold shadow-lg shadow-green-100" asChild>
                        <Link href="https://wa.me/559294197052" target="_blank">
                          Conversar Agora
                        </Link>
                      </Button>
                    </div>

                    <div className="h-px bg-moss-50" />

                    <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                      <div className="text-center sm:text-left">
                        <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest mb-1">Nosso Instagram</p>
                        <p className="text-2xl font-black text-moss-900">@anaue.chales</p>
                      </div>
                      <Button variant="outline" className="w-full sm:w-auto border-moss-200 text-moss-600 h-14 px-8 rounded-2xl font-bold hover:bg-moss-50" asChild>
                        <Link href="https://instagram.com/anaue.chales" target="_blank">
                          Seguir Perfil
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Location Card */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full"
              >
                <Card className="border-moss-100 shadow-sm bg-moss-900 text-white rounded-[2rem] h-full flex flex-col overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-white font-heading text-xl flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-moss-300" />
                      Localização
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 flex-grow flex flex-col">
                    <p className="text-moss-200 font-light leading-relaxed mb-8">
                      Localizados no coração do Tarumã-Açu, Manaus. Fácil acesso por transporte de aplicativo e ramal 100% trafegável.
                    </p>

                    <div className="mt-auto space-y-3">
                      <p className="text-sm font-bold text-white">Tarumã, Manaus - AM</p>
                      <p className="text-xs text-moss-400">R. Cedrinho - Ramal do Bancrevea</p>
                      <Button variant="ghost" className="w-full text-moss-300 hover:text-white hover:bg-white/10 mt-4 rounded-xl" asChild>
                        <Link href="#localizacao">
                          Ver no Mapa <MapPin className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
