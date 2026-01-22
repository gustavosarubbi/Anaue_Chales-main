"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, Wind, Waves, Coffee, MessageCircle, ArrowRight, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const accommodations = [
  {
    id: "chale-anaue",
    title: "Chalé Anauê",
    description: "A experiência original. Rústico, aconchegante e integrado perfeitamente à floresta.",
    tag: "Clássico",
    image: "/Chale-1.jpg",
    features: [
      { icon: Wifi, label: "Wi-Fi Starlink" },
      { icon: Wind, label: "Ar Condicionado" },
      { icon: Waves, label: "Vista para o Rio" },
      { icon: Coffee, label: "Café da Manhã" },
    ],
    price: "A partir de R$ 650",
    whatsappMessage: "Olá! Gostaria de reservar o Chalé Anauê."
  },
  {
    id: "chale-2",
    title: "Chalé 2 (Novo)",
    description: "Nossa mais nova opção. Design moderno com o mesmo conforto e imersão na natureza.",
    tag: "Novo",
    image: "/Chale-2.jpg",
    features: [
      { icon: Wifi, label: "Wi-Fi Starlink" },
      { icon: Wind, label: "Ar Condicionado" },
      { icon: Waves, label: "Vista Panorâmica" },
      { icon: Coffee, label: "Café da Manhã" },
    ],
    price: "A partir de R$ 650",
    whatsappMessage: "Olá! Gostaria de reservar o Chalé 2."
  }
]

export function Accommodations() {
  const whatsappNumber = "559294197052"

  const getWhatsAppLink = (message: string) => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  return (
    <section id="acomodacoes" className="py-24 bg-stone-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-moss-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-beige-100/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="border-moss-600 text-moss-700 px-4 py-1 text-sm tracking-widest uppercase bg-moss-50">
            Nossas Acomodações
          </Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-moss-900">
            Escolha Seu Refúgio
          </h2>
          <p className="text-lg text-moss-600 font-light leading-relaxed">
            Duas opções únicas para você desfrutar da Amazônia com conforto, privacidade e exclusividade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {accommodations.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              key={item.id}
            >
              <Card className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white group h-full flex flex-col">
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-moss-900 backdrop-blur-sm shadow-sm">{item.tag}</Badge>
                  </div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="font-heading text-3xl font-bold mb-1">{item.title}</h3>
                    <p className="text-white/90 font-medium bg-moss-900/40 backdrop-blur-md inline-block px-3 py-1 rounded-full text-sm">
                      {item.price}
                    </p>
                  </div>
                </div>

                <CardContent className="p-8 flex flex-col flex-grow">
                  <p className="text-moss-700 mb-8 leading-relaxed text-lg">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-8">
                    {item.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-moss-600">
                        <div className="p-2 rounded-full bg-moss-50 text-moss-600 group-hover:bg-moss-100 transition-colors">
                          <feature.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{feature.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto space-y-3">
                    <Button
                      className="w-full bg-moss-600 hover:bg-moss-700 text-white h-12 text-lg rounded-xl shadow-md transition-all duration-300 transform group-hover:-translate-y-1"
                      onClick={() => window.open(getWhatsAppLink(item.whatsappMessage), "_blank")}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Reservar via WhatsApp
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-moss-600 hover:text-moss-900 hover:bg-moss-50"
                      asChild
                    >
                      <Link href="#galeria" className="group/link">
                        Ver Galeria de Fotos
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                      </Link>
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
