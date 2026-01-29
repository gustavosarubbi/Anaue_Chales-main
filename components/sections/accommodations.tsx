"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, Home, Waves, MapPin, Wind, Star } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CHALET_PRICING } from "@/lib/utils/reservation"

export function Accommodations() {
  const masterPrice = CHALET_PRICING['chale-anaue'].weekday
  const campingPrice = CHALET_PRICING['chale-2'].weekday

  const accommodations = [
    {
      id: "chale-anaue",
      title: "Chalé Master",
      description: "O máximo conforto com banheira de hidromassagem e vista panorâmica para o Rio Tarumã.",
      image: "/Chale 1/IMG_2024.jpg",
      features: ["Hidromassagem", "Vista Rio", "Privacidade Total"],
      price: `A partir de R$ ${masterPrice}`,
      whatsappMessage: "Olá! Gostaria de saber mais sobre o Chalé Master.",
      link: "/checkout?chalet=chale-anaue"
    },
    {
      id: "chale-2",
      title: "Chalé Camping Luxo",
      description: "Uma experiência moderna de imersão na natureza com design industrial e todo conforto necessário.",
      image: "/Chale 2/IMG_3189.jpg",
      features: ["Design Moderno", "Imersão Natureza", "Conforto Premium"],
      price: `A partir de R$ ${campingPrice}`,
      whatsappMessage: "Olá! Gostaria de saber mais sobre o Chalé Camping Luxo.",
      link: "/checkout?chalet=chale-2"
    }
  ]

  return (
    <section id="acomodacoes" className="py-24 bg-moss-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-moss-800 rounded-full blur-[120px] -z-0 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-moss-800 rounded-full blur-[120px] -z-0 opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <Badge className="mb-4 bg-moss-500/20 text-moss-300 border-moss-500/30">🏨 Nossas Opções</Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">Escolha Seu Refúgio</h2>
          <p className="text-moss-200 text-lg font-light">
            Dois estilos únicos de hospedagem, ambos com a mesma essência: exclusividade e conexão com a natureza.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {accommodations.map((acc, index) => (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <Card className="bg-moss-800/40 border-moss-700 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                <div className="relative h-[400px] overflow-hidden">
                  <img
                    src={acc.image}
                    alt={acc.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-moss-900 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white px-3 py-1">
                      <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
                      Premium
                    </Badge>
                    <div className="text-right">
                      <p className="text-moss-300 text-xs uppercase tracking-widest mb-1">Apenas casal</p>
                      <p className="text-white font-heading text-2xl font-bold">{acc.price}</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-8">
                  <CardTitle className="font-heading text-3xl text-white mb-4">{acc.title}</CardTitle>
                  <p className="text-moss-200 mb-8 font-light leading-relaxed">
                    {acc.description}
                  </p>

                  <div className="flex flex-wrap gap-3 mb-10">
                    {acc.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 bg-moss-900/40 rounded-full px-4 py-2 border border-moss-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-moss-400" />
                        <span className="text-moss-100 text-sm font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Button
                      className="bg-white text-moss-900 hover:bg-moss-50 h-14 rounded-xl font-bold text-lg transition-all duration-300"
                      asChild
                    >
                      <Link href={acc.link}>Reservar Online</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="border-moss-600 text-moss-200 hover:bg-moss-800 h-14 rounded-xl font-medium transition-all duration-300"
                      asChild
                    >
                      <a
                        href={`https://wa.me/5592984534442?text=${encodeURIComponent(acc.whatsappMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Falar no WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
