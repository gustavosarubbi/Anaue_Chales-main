"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Instagram,
  MapPin,
  Navigation,
  Waves,
  TreePine,
  Car,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const POINTS_OF_INTEREST = [
  {
    icon: Waves,
    name: "Hope Bay Park",
    detail: "Parque aquático — 5 min",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: TreePine,
    name: "Praia do Avião",
    detail: "Praia fluvial — 10 min",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Car,
    name: "Acesso Fácil",
    detail: "Asfalto + 500 m de ramal",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
]

export function Contact() {
  return (
    <section
      id="contato"
      className="py-20 sm:py-28 bg-gradient-to-b from-white via-stone-50 to-moss-50/60 relative"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto"
        >
          <Badge className="mb-5 bg-moss-100 text-moss-800 border-moss-200 px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold">
            Contato & Localização
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-moss-900 mb-5 leading-tight">
            Reserve Sua Experiência <br className="hidden sm:block" />
            na Natureza
          </h2>
          <p className="text-base sm:text-lg text-moss-600 font-light leading-relaxed max-w-2xl mx-auto">
            Estamos no coração do Tarumã, prontos para tirar suas dúvidas e
            ajudar você a planejar o refúgio perfeito na Amazônia.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-5 text-[11px] font-semibold text-moss-400 tracking-wide uppercase">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Resposta em até 30 min
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-moss-400" />
              Atendimento Humano
            </span>
          </div>
        </motion.div>

        {/* ─── Main grid: Channels + Map ─── */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16">
          {/* Left — Contact channels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            {/* WhatsApp */}
            <Card className="border-moss-100 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="bg-green-50 p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <MessageCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest mb-1">
                      WhatsApp de Reservas
                    </p>
                    <p className="text-xl sm:text-2xl font-heading font-bold text-moss-900 tracking-tight">
                      (92) 99419-7052
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white h-14 px-8 rounded-2xl font-bold shadow-lg shadow-green-200 hover:shadow-green-300 transition-all hover:scale-105"
                  asChild
                >
                  <Link href="https://wa.me/559294197052" target="_blank">
                    Conversar Agora
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card className="border-moss-100 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="bg-pink-50 p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <Instagram className="h-7 w-7 text-pink-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-bold text-moss-400 uppercase tracking-widest mb-1">
                      Nosso Instagram
                    </p>
                    <p className="text-xl sm:text-2xl font-heading font-bold text-moss-900 tracking-tight">
                      @anaue.chales
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-moss-100 text-moss-700 h-14 px-8 rounded-2xl font-bold hover:bg-pink-50 hover:border-pink-100 hover:text-pink-700 transition-all hover:scale-105"
                  asChild
                >
                  <Link href="https://instagram.com/anaue.chales" target="_blank">
                    Seguir Perfil
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Address mini-card */}
            <Card className="border-none bg-moss-900 text-white rounded-3xl shadow-xl overflow-hidden relative group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-500" />
              
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <MapPin className="h-7 w-7 text-moss-300" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-heading font-bold text-xl text-white mb-1">
                      Anauê Jungle Chalés
                    </p>
                    <p className="text-sm text-moss-300 font-medium">
                      R. Cedrinho — Tarumã Açu, Manaus - AM
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white h-14 px-8 rounded-2xl font-bold backdrop-blur-md border border-white/10 shadow-lg transition-all hover:scale-105"
                  asChild
                >
                  <Link
                    href="https://waze.com/ul?q=R.+Cedrinho+-+Tarumã+Açu,+Manaus+-+AM,+69022-000"
                    target="_blank"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Abrir no Waze
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right — Google Maps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="h-full min-h-[380px] sm:min-h-[440px]"
          >
            <div className="rounded-3xl overflow-hidden border border-moss-200 shadow-sm h-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.485337445665!2d-60.096383900000006!3d-2.9627469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x926c3dbaac5b11f5%3A0x85f34b546f03fa0f!2zQW5hdcOqIEp1bmdsZSBDaGFsw6lz!5e0!3m2!1spt-BR!2sbr!4v1757047079339!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "380px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Anauê Jungle Chalés"
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </div>

        {/* ─── Points of interest + River info ─── */}
        <div className="max-w-6xl mx-auto space-y-6">
          {/* POI row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-3 gap-4"
          >
            {POINTS_OF_INTEREST.map((poi) => (
              <div
                key={poi.name}
                className="flex items-center gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className={`${poi.bg} p-2.5 rounded-xl flex-shrink-0`}>
                  <poi.icon className={`h-5 w-5 ${poi.color}`} />
                </div>
                <div>
                  <p className="font-bold text-moss-900 text-sm">{poi.name}</p>
                  <p className="text-xs text-moss-500">{poi.detail}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* River seasons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-moss-900 rounded-3xl p-6 sm:p-8 grid sm:grid-cols-2 gap-4 sm:gap-6 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm relative z-10">
                <p className="text-2xl mb-1">🌊</p>
                <h4 className="font-bold text-white text-base mb-0.5">
                  Período de Cheia
                </h4>
                <p className="text-moss-200 text-sm font-medium">
                  Dezembro a Julho
                </p>
                <p className="text-moss-400 text-[10px] uppercase tracking-widest mt-1">
                  Igarapés Cheios
                </p>
              </div>
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm relative z-10">
                <p className="text-2xl mb-1">🏖️</p>
                <h4 className="font-bold text-white text-base mb-0.5">
                  Período de Seca
                </h4>
                <p className="text-moss-200 text-sm font-medium">
                  Agosto a Novembro
                </p>
                <p className="text-moss-400 text-[10px] uppercase tracking-widest mt-1">
                  Praias Gigantes
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
