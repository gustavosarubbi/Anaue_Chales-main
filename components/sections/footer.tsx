import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TreePine,
  Phone,
  MessageCircle,
  Instagram,
  MapPin,
  Clock,
  Users,
  Wifi,
  Shield,
  Heart,
  Navigation,
  Calendar,
  Star,
} from "lucide-react"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-moss-900 via-moss-800 to-moss-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <TreePine className="h-8 w-8 text-beige-300" />
              <div>
                <h3 className="font-bold text-xl text-white">Anauê Jungle</h3>
                <p className="text-beige-300 text-sm">Chalés</p>
              </div>
            </div>
            <p className="text-moss-200 text-sm leading-relaxed mb-6">
              Escape para a natureza amazônica em nossos chalés exclusivos à beira do Rio Negro. Uma experiência única
              de conforto e tranquilidade no coração do Tarumã.
            </p>
            <div className="flex items-center gap-2 text-sm text-moss-200">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>Avaliação 4.9/5 pelos hóspedes</span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg text-white mb-6">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-beige-300 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">(92) 99419-7052</p>
                  <p className="text-moss-200 text-sm">Atendimento todos os dias</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-beige-300 flex-shrink-0" />
                <div>
                  <Link
                    href="https://wa.me/559294197052"
                    target="_blank"
                    className="text-white font-medium hover:text-beige-300 transition-colors"
                  >
                    WhatsApp
                  </Link>
                  <p className="text-moss-200 text-sm">Resposta rápida</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Instagram className="h-4 w-4 text-beige-300 flex-shrink-0" />
                <div>
                  <Link
                    href="https://instagram.com/anaue.chales"
                    target="_blank"
                    className="text-white font-medium hover:text-beige-300 transition-colors"
                  >
                    @anaue.chales
                  </Link>
                  <p className="text-moss-200 text-sm">Fotos e novidades</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-beige-300 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Tarumã, Manaus - AM</p>
                  <Link
                    href="https://waze.com/ul/h6xmr0kz2b"
                    target="_blank"
                    className="text-moss-200 text-sm hover:text-beige-300 transition-colors flex items-center gap-1"
                  >
                    <Navigation className="h-3 w-3" />
                    Abrir no Waze
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Services & Amenities */}
          <div>
            <h4 className="font-semibold text-lg text-white mb-6">Comodidades</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-moss-200">
                <Wifi className="h-4 w-4 text-beige-300" />
                <span className="text-sm">Wi-Fi gratuito</span>
              </div>
              <div className="flex items-center gap-2 text-moss-200">
                <Shield className="h-4 w-4 text-beige-300" />
                <span className="text-sm">Segurança 24h</span>
              </div>
              <div className="flex items-center gap-2 text-moss-200">
                <Heart className="h-4 w-4 text-beige-300" />
                <span className="text-sm">Pet Friendly</span>
              </div>
              <div className="flex items-center gap-2 text-moss-200">
                <Users className="h-4 w-4 text-beige-300" />
                <span className="text-sm">Até 6 pessoas</span>
              </div>
              <div className="flex items-center gap-2 text-moss-200">
                <Calendar className="h-4 w-4 text-beige-300" />
                <span className="text-sm">Café da manhã incluso</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-moss-700">
              <h5 className="font-medium text-white mb-3">Horários</h5>
              <div className="flex items-center gap-2 text-moss-200 text-sm">
                <Clock className="h-4 w-4 text-beige-300" />
                <span>Check-in: 14h | Check-out: 11h</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="font-semibold text-lg text-white mb-6">Ações Rápidas</h4>
            <div className="space-y-3">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white justify-start" asChild>
                <Link href="https://wa.me/559294197052?text=Olá! Gostaria de fazer uma reserva." target="_blank">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Fazer Reserva
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full border-moss-600 text-moss-200 hover:bg-moss-700 hover:text-white justify-start bg-transparent"
                asChild
              >
                <Link
                  href="https://wa.me/559294197052?text=Olá! Gostaria de verificar a disponibilidade."
                  target="_blank"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver Disponibilidade
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full border-moss-600 text-moss-200 hover:bg-moss-700 hover:text-white justify-start bg-transparent"
                asChild
              >
                <Link href="https://waze.com/ul/h6xmr0kz2b" target="_blank">
                  <Navigation className="mr-2 h-4 w-4" />
                  Como Chegar
                </Link>
              </Button>
            </div>

            {/* Pricing Summary */}
            <Card className="mt-6 bg-moss-800/50 border-moss-600">
              <CardContent className="p-4">
                <h5 className="font-medium text-white mb-3">Valores no Airbnb</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-moss-200">
                    <span>Finais de semana:</span>
                    <span className="text-white font-medium">R$ 750</span>
                  </div>
                  <div className="flex justify-between text-moss-200">
                    <span>Segunda a quinta:</span>
                    <span className="text-white font-medium">R$ 615</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-moss-700 bg-moss-900/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-moss-200 text-sm">
                © {currentYear} Anauê Jungle Chalés. Todos os direitos reservados.
              </p>
              <p className="text-moss-300 text-xs mt-1">
                Desenvolvido com 💚 para proporcionar experiências únicas na Amazônia
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="https://wa.me/559294197052?text=Olá! Tenho dúvidas sobre privacidade."
                target="_blank"
                className="text-moss-300 hover:text-beige-300 text-xs transition-colors"
              >
                Política de Privacidade
              </Link>
              <span className="text-moss-600">•</span>
              <Link
                href="https://wa.me/559294197052?text=Olá! Gostaria de informações sobre termos de uso."
                target="_blank"
                className="text-moss-300 hover:text-beige-300 text-xs transition-colors"
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          asChild
        >
          <Link href="https://wa.me/559294197052" target="_blank">
            <MessageCircle className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </footer>
  )
}
