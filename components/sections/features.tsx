"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coffee, Home, Flame, Wine, ShoppingCart, Shield, Wifi, Users, Waves, Ban, Zap, Droplets } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Coffee,
    title: "Café da Manhã Incluso",
    description: "Delicioso café da manhã servido no chalé em uma charmosa cesta",
    highlight: true,
  },
  {
    icon: Home,
    title: "Chalé Completo",
    description: "Micro-ondas, frigobar, forno elétrico, ar condicionado, TV Box e tudo que você precisa",
    highlight: true,
  },
  {
    icon: Flame,
    title: "Churrasqueira Privativa",
    description: "À beira do rio para você usar à vontade (traga o carvão)",
    highlight: true,
  },
  {
    icon: Wine,
    title: "Adega de Vinhos",
    description: "Temos uma Excelente carta de vinhos no local",
    highlight: false,
  },
  {
    icon: ShoppingCart,
    title: "Consumo Livre",
    description: "Fique à vontade para levar o que quiser, ou pedir pelo Ifood",
    highlight: false,
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Monitorado por câmeras e alarmes de segurança 24h",
    highlight: true,
  },
  {
    icon: Zap,
    title: "Gerador de Energia",
    description: "Gerador próprio para garantir energia 24h, mesmo em caso de queda de energia",
    highlight: true,
  },
  {
    icon: Wifi,
    title: "Wi-Fi Gratuito",
    description: "Internet de alta velocidade em todo o chalé",
    highlight: false,
  },
  {
    icon: Waves,
    title: "Prancha de SUP",
    description: "Disponível por adicional de R$ 50",
    highlight: false,
  },
  {
    icon: Ban,
    title: "Não Pet Friendly",
    description: "Pets não são permitidos no local",
    highlight: false,
  },
  {
    icon: Droplets,
    title: "Banheira de Hidromassagem",
    description: "Banheira relaxante com hidromassagem para momentos de total relaxamento e bem-estar",
    highlight: true,
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function Features() {
  return (
    <section id="comodidades" className="py-24 bg-stone-50/50 texture-dots relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">🛏️ Experiência Completa</Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-moss-900 mb-6">Incluído no Seu Pernoite</h2>
          <p className="text-lg text-moss-600 font-light leading-relaxed">
            Cada detalhe foi pensado para proporcionar conforto e praticidade durante sua estadia na selva.
          </p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card
                className={`h-full text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-none ${feature.highlight
                  ? "bg-moss-900 text-white ring-1 ring-moss-800 shadow-lg"
                  : "bg-white text-moss-900 ring-1 ring-stone-200 shadow-sm"
                  }`}
              >
                <CardHeader className="p-6 pb-2">
                  <div
                    className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${feature.highlight ? "bg-white/10 text-moss-100" : "bg-moss-50 text-moss-700"
                      }`}
                  >
                    <feature.icon className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                  <CardTitle className={`font-heading text-xl ${feature.highlight ? "text-white" : "text-moss-900"}`}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className={`text-sm leading-relaxed font-light ${feature.highlight ? "text-moss-200" : "text-moss-600"}`}>{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-moss-50 to-beige-50 border-none shadow-md overflow-hidden">
            <CardHeader className="border-b border-black/5 bg-white/50 backdrop-blur-sm">
              <CardTitle className="text-center font-heading text-moss-900 flex items-center justify-center gap-3 text-2xl">
                <Users className="h-6 w-6 text-moss-600" />
                Hóspedes Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-moss-100 hover:border-moss-300 transition-colors">
                  <p className="font-bold text-moss-800 text-lg mb-1">Até 5 anos</p>
                  <p className="text-moss-600">Não pagam</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-moss-100 hover:border-moss-300 transition-colors">
                  <p className="font-bold text-moss-800 text-lg mb-1">6 a 15 anos</p>
                  <p className="font-heading text-2xl text-moss-600 font-bold text-moss-900">+ R$ 100</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-moss-100 hover:border-moss-300 transition-colors">
                  <p className="font-bold text-moss-800 text-lg mb-1">A partir de 16 anos</p>
                  <p className="font-heading text-2xl text-moss-600 font-bold text-moss-900">+ R$ 150</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
