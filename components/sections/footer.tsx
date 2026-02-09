"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TreePine,
  Phone,
  MessageCircle,
  Instagram,
  MapPin,
  Clock,
  Wifi,
  Shield,
  Coffee,
  ExternalLink,
  Calendar,
  Star,
  ChevronRight,
  ArrowUp
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

export function Footer() {
  const pathname = usePathname()
  const isCheckout = pathname === "/checkout"
  const currentYear = new Date().getFullYear()

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-moss-900 text-white relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-moss-900/30 blur-[120px] rounded-full pointer-events-none -z-0" />

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-white/10 bg-white group-hover:border-white/30 transition-colors">
                <img 
                  src="/anaue-logo.png" 
                  alt="Anauê Jungle Chalés" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-2xl text-white leading-tight">Anauê Jungle</h3>
                <p className="text-beige-300/80 tracking-widest uppercase text-xs">Chalés</p>
              </div>
            </Link>

            <p className="text-moss-200 text-sm leading-relaxed max-w-sm">
              Escape para a natureza amazônica em nossos chalés exclusivos à beira do Rio Negro.
              Uma experiência única de conforto e tranquilidade no coração do Tarumã.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-moss-900/50 border border-moss-800 text-sm text-moss-200 hover:border-moss-700 transition-colors">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-white">4.9/5</span>
              <span className="text-moss-400">•</span>
              <span>Avaliação dos hóspedes</span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-semibold text-xl text-white mb-8">Contato</h4>
            <div className="space-y-6">
              <a href="tel:+5592994197052" className="flex items-start gap-4 group">
                <div className="bg-moss-900 p-2 rounded-lg text-beige-300 group-hover:bg-moss-800 group-hover:text-white transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white font-medium group-hover:text-beige-300 transition-colors">(92) 99419-7052</p>
                  <p className="text-moss-400 text-sm">Atendimento todos os dias</p>
                </div>
              </a>

              <a
                href="https://wa.me/559294197052"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 group"
              >
                <div className="bg-moss-900 p-2 rounded-lg text-beige-300 group-hover:bg-moss-800 group-hover:text-white transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white font-medium group-hover:text-beige-300 transition-colors">WhatsApp</p>
                  <p className="text-moss-400 text-sm">Resposta rápida</p>
                </div>
              </a>

              <a
                href="https://instagram.com/anaue.chales"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 group"
              >
                <div className="bg-moss-900 p-2 rounded-lg text-beige-300 group-hover:bg-moss-800 group-hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white font-medium group-hover:text-beige-300 transition-colors">@anaue.chales</p>
                  <p className="text-moss-400 text-sm">Siga no Instagram</p>
                </div>
              </a>
            </div>
          </div>

          {/* Location & Times */}
          <div>
            <h4 className="font-heading font-semibold text-xl text-white mb-8">Localização</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-moss-900 p-2 rounded-lg text-beige-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white font-medium">Tarumã, Manaus - AM</p>
                  <a
                    href="https://waze.com/ul?q=R.+Cedrinho+-+Tarumã+Açu,+Manaus+-+AM,+69022-000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-moss-400 text-sm hover:text-beige-300 transition-colors mt-1 group"
                  >
                    Abrir no Waze <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>

              <div className="pt-6 border-t border-moss-800/50">
                <h5 className="font-medium text-white mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-beige-300" />
                  Horários
                </h5>
                <div className="space-y-4 text-sm text-moss-300">
                  <div>
                    <p className="text-beige-300 font-medium text-xs uppercase tracking-wider mb-2">Chalé Master</p>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center bg-moss-900/30 px-3 py-2 rounded-lg">
                        <span>Check-in</span>
                        <span className="text-white font-medium font-mono">14:00</span>
                      </li>
                      <li className="flex justify-between items-center bg-moss-900/30 px-3 py-2 rounded-lg">
                        <span>Check-out</span>
                        <span className="text-white font-medium font-mono">11:00</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-beige-300 font-medium text-xs uppercase tracking-wider mb-2">Camping Luxo</p>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center bg-moss-900/30 px-3 py-2 rounded-lg">
                        <span>Check-in</span>
                        <span className="text-white font-medium font-mono">15:00</span>
                      </li>
                      <li className="flex justify-between items-center bg-moss-900/30 px-3 py-2 rounded-lg">
                        <span>Check-out</span>
                        <span className="text-white font-medium font-mono">12:00</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Amenities Summary */}
          <div className="space-y-6">
            <h4 className="font-heading font-semibold text-xl text-white mb-8">Navegação</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Início", id: "inicio" },
                { label: "Chalés", id: "chales" },
                { label: "Comodidades", id: "comodidades" },
                { label: "Preços", id: "pricing" },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className="flex items-center justify-between px-4 py-3 bg-moss-900/30 border border-moss-800/50 rounded-lg text-moss-200 hover:text-white hover:bg-moss-800 hover:border-moss-700 transition-all text-sm group"
                >
                  {item.label}
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>

            <Card className="bg-moss-900/50 border-moss-800 backdrop-blur-sm mt-6">
              <CardContent className="p-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-moss-300 justify-center sm:justify-start">
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3 w-3 text-beige-300" /> Free Wi-Fi
                </div>
                <div className="flex items-center gap-1.5">
                  <Coffee className="h-3 w-3 text-beige-300" /> Café da Manhã
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-beige-300" /> Seguro
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-moss-900 bg-moss-950 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-moss-400 text-sm">
                © {currentYear} Anauê Jungle. Todos os direitos reservados.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-moss-500 hover:text-beige-300 text-sm transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Política de Privacidade
              </Link>
              <Link
                href="#"
                className="text-moss-500 hover:text-beige-300 text-sm transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Calendar Button — hidden on checkout page */}
      {!isCheckout && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="fixed bottom-24 right-4 md:bottom-[6.5rem] md:right-8 z-50"
        >
          <Button
            size="icon"
            className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-moss-600 hover:bg-moss-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-white/10 hover:border-white/20 active:scale-95 group"
            asChild
          >
            <Link href="/checkout">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 transition-transform" />
              <span className="sr-only">Explorar Disponibilidade</span>
            </Link>
          </Button>
        </motion.div>
      )}
    </footer>
  )
}
